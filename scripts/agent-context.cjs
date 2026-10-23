const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  ROOT,
  baseline,
  digest,
  readSource,
  verifyApproval,
  serialize,
} = require('./document-catalog.cjs');
const { sha256 } = require('./governance-guidelines.cjs');

const POLICY_PATH = 'config/agent-context-policy.json';
const FIELDS = [
  'schemaVersion',
  'id',
  'objective',
  'baseCommit',
  'role',
  'subjectId',
  'curriculumCycle',
  'dependencies',
  'documents',
  'requirements',
  'validExamples',
  'invalidExamples',
  'allowedPaths',
  'acceptanceCriteria',
  'commands',
  'evidence',
  'independentVerifier',
  'stopConditions',
  'rollback',
];

function check(condition, message) {
  if (!condition) throw new Error(message);
}
function text(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
function textList(value, name, allowEmpty = false) {
  check(
    Array.isArray(value) &&
      (allowEmpty || value.length > 0) &&
      value.every(text) &&
      new Set(value).size === value.length,
    `${name} invalido`,
  );
}
function validateWork(work) {
  check(
    work && typeof work === 'object' && !Array.isArray(work),
    'ficha ausente',
  );
  check(
    Object.keys(work).every((key) => FIELDS.includes(key)) &&
      FIELDS.every((key) => Object.hasOwn(work, key)),
    'campos da ficha divergentes',
  );
  check(work.schemaVersion === 'agent-work-v1', 'versao da ficha invalida');
  for (const key of [
    'id',
    'objective',
    'role',
    'independentVerifier',
    'rollback',
  ])
    check(text(work[key]), `${key} ausente`);
  check(/^[a-f0-9]{40}$/.test(work.baseCommit), 'commit base invalido');
  check(work.subjectId === null || text(work.subjectId), 'materia invalida');
  check(
    work.curriculumCycle === null ||
      /^\d{4}-t[123]$/.test(work.curriculumCycle),
    'ciclo invalido',
  );
  for (const key of ['dependencies', 'allowedPaths', 'commands', 'evidence'])
    textList(work[key], key, true);
  for (const key of [
    'requirements',
    'validExamples',
    'invalidExamples',
    'acceptanceCriteria',
    'stopConditions',
  ])
    textList(work[key], key);
  check(
    Array.isArray(work.documents) && work.documents.length > 0,
    'documentos ausentes',
  );
  const ids = new Set();
  for (const pin of work.documents) {
    check(
      pin &&
        Object.keys(pin).sort().join(',') ===
          'id,sha256,sourceCommit,version' &&
        text(pin.id) &&
        /^\d+\.\d+\.\d+$/.test(pin.version) &&
        /^[a-f0-9]{64}$/.test(pin.sha256) &&
        /^[a-f0-9]{40}$/.test(pin.sourceCommit),
      'vinculo documental invalido',
    );
    check(!ids.has(pin.id), 'documento duplicado na ficha');
    ids.add(pin.id);
  }
}

function requiredPaths(work, root = ROOT, policy, additional = []) {
  const rules = policy || JSON.parse(readSource(root, POLICY_PATH));
  check(
    rules.schemaVersion === 'agent-context-policy-v1',
    'politica de contexto invalida',
  );
  const model = JSON.parse(readSource(root, 'config/agent-capabilities.json'));
  const role = model.roles.find((item) => item.id === work.role);
  check(role, 'papel desconhecido');
  const editorial = ['content-curator', 'pedagogical-quality'].includes(
    work.role,
  );
  const needsManifest =
    editorial &&
    work.curriculumCycle &&
    (Number(work.curriculumCycle.slice(0, 4)) > 2026 ||
      work.curriculumCycle === '2026-t3');
  if (needsManifest)
    check(
      rules.curricula[work.curriculumCycle],
      'ciclo sem manifesto de contexto aprovado',
    );
  const pending = [
    ...rules.common,
    ...role.contractPaths,
    ...additional,
    ...(editorial ? rules.editorial : []),
    ...(needsManifest ? [rules.curricula[work.curriculumCycle]] : []),
    ...(editorial && work.subjectId === 'ingles' ? [rules.english] : []),
  ];
  const result = new Set();
  while (pending.length) {
    const name = pending.shift();
    if (result.has(name)) continue;
    check(typeof name === 'string', 'dependencia documental invalida');
    result.add(name);
    pending.push(...(rules.dependencies[name] || []));
  }
  return [...result].sort();
}

function readApprovalComment(id) {
  return JSON.parse(
    execFileSync('gh', ['api', `repos/dleomil/quiz/issues/comments/${id}`], {
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
  );
}

function pinnedConfig(root, name, commit) {
  const current = readSource(root, name);
  const committed = execFileSync('git', ['show', `${commit}:${name}`], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  check(
    sha256(current) === sha256(committed),
    `configuracao mudou fora do commit base: ${name}`,
  );
  return current;
}

function buildContext(work, options = {}) {
  validateWork(work);
  const root = options.root || ROOT;
  const head = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  check(head === work.baseCommit, 'commit base mudou; revisar o plano');
  const policyText = pinnedConfig(root, POLICY_PATH, head);
  const policy = JSON.parse(policyText);
  const capabilities = pinnedConfig(
    root,
    'config/agent-capabilities.json',
    head,
  );
  const catalog = JSON.parse(
    pinnedConfig(root, 'config/document-catalog.json', head),
  );
  const selected = work.documents.map((pin) =>
    catalog.documents.find((doc) => doc.id === pin.id),
  );
  check(selected.every(Boolean), 'documento nao catalogado');
  const required = requiredPaths(
    work,
    root,
    policy,
    selected.map((doc) => doc.path),
  );
  check(
    required.every((name) => selected.some((doc) => doc.path === name)),
    'contexto incompleto: contrato obrigatorio ausente',
  );
  const approved = new Map();
  const approvals = [];
  for (const reference of policy.approvals) {
    if (
      !work.documents.some((pin) => pin.sourceCommit === reference.sourceCommit)
    )
      continue;
    const snapshot = baseline(root, reference.sourceCommit);
    check(snapshot.sha256 === reference.sha256, 'baseline registrado diverge');
    const receipt = verifyApproval(
      snapshot,
      reference.evidenceRef,
      options.readComment || readApprovalComment,
    );
    approvals.push(receipt);
    for (const doc of snapshot.documents)
      approved.set(`${reference.sourceCommit}:${doc.id}`, doc);
  }
  const documents = selected
    .map((doc, index) => {
      const pin = work.documents[index];
      const accepted = approved.get(`${pin.sourceCommit}:${pin.id}`);
      check(
        doc.normative &&
          !['historical', 'superseded', 'unclassified'].includes(doc.status),
        'documento nao normativo ou inativo',
      );
      check(
        accepted &&
          ['id', 'path', 'version', 'sha256', 'revision'].every(
            (key) => accepted[key] === doc[key],
          ) &&
          pin.version === doc.version &&
          pin.sha256 === doc.sha256,
        `aceite desatualizado: ${doc.path}`,
      );
      const content = readSource(root, doc.path).toString('utf8');
      check(
        sha256(content) === pin.sha256,
        `hash documental divergente: ${doc.path}`,
      );
      pinnedConfig(root, doc.path, head);
      return { ...pin, path: doc.path, content };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  const payload = {
    schemaVersion: 'agent-context-v1',
    baseCommit: head,
    workSha256: digest(work),
    policySha256: sha256(policyText),
    capabilitySha256: sha256(capabilities),
    documents,
    approvals,
  };
  return { ...payload, sha256: digest(payload) };
}

function renderContext(bundle) {
  const { sha256: hash, ...payload } = bundle;
  check(
    digest(payload) === hash &&
      bundle.documents.every((doc) => sha256(doc.content) === doc.sha256),
    'bundle adulterado',
  );
  return [
    'Contratos autorizados completos; cumpra todos os requisitos aplicaveis.',
    `Contexto SHA256 ${hash}`,
    ...bundle.documents.map(
      (doc) =>
        `DOCUMENTO ${doc.id} versao ${doc.version} commit ${doc.sourceCommit} hash ${doc.sha256}\n${doc.content}`,
    ),
  ].join('\n\n');
}

if (require.main === module) {
  try {
    check(
      process.argv.length === 4 && process.argv[2] === '--work',
      'use --work <ficha.json>',
    );
    process.stdout.write(
      serialize(
        buildContext(
          JSON.parse(fs.readFileSync(path.resolve(process.argv[3]), 'utf8')),
        ),
      ),
    );
  } catch (error) {
    process.stderr.write(`agent-context: ${error.message}\n`);
    process.exitCode = 1;
  }
}
module.exports = {
  buildContext,
  requiredPaths,
  renderContext,
  pinnedConfig,
  validateWork,
  readApprovalComment,
};
