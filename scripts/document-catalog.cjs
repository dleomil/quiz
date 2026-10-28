const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { sha256 } = require('./governance-guidelines.cjs');

const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = 'config/document-catalog.json';
const GOVERNANCE_PATH = 'config/governance-guidelines.json';
const SCHEMA = 'document-catalog-v1';
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const HASH = /^[a-f0-9]{64}$/;
const KINDS = new Set([
  'instructions',
  'readme',
  'policy',
  'contract',
  'specification',
  'product',
  'guide',
  'historical',
]);
const STATES = new Set([
  'unclassified',
  'baseline-pending',
  'draft',
  'approved',
  'superseded',
  'historical',
  'informative',
]);
const FIELDS = [
  'id',
  'path',
  'kind',
  'owner',
  'revision',
  'version',
  'normative',
  'status',
  'sha256',
];

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable(value[key])]),
    );
  return value;
}

function digest(value) {
  return sha256(JSON.stringify(stable(value)));
}
function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}
function git(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
function safePath(name) {
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    !name.includes('\\') &&
    !name.includes('\0') &&
    !path.posix.isAbsolute(name) &&
    !path.win32.isAbsolute(name) &&
    path.posix.normalize(name) === name &&
    !name.split('/').includes('..') &&
    !name.startsWith('-')
  );
}

function readSource(root, name) {
  if (!safePath(name)) throw new Error('caminho documental invalido');
  let current = root;
  for (const part of name.split('/')) {
    current = path.join(current, part);
    if (fs.lstatSync(current).isSymbolicLink())
      throw new Error('documento ou ancestral e symlink');
  }
  const descriptor = fs.openSync(
    current,
    fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
  );
  try {
    if (!fs.fstatSync(descriptor).isFile())
      throw new Error('documento nao e arquivo regular');
    return fs.readFileSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

function documentPaths(root) {
  return [
    ...new Set(
      git(root, [
        'ls-files',
        '-z',
        '--cached',
        '--others',
        '--exclude-standard',
        '--',
        '*.md',
      ])
        .split('\0')
        .filter(Boolean)
        .filter((name) => {
          try {
            fs.lstatSync(path.join(root, name));
            return true;
          } catch (error) {
            if (error.code === 'ENOENT') return false;
            throw error;
          }
        }),
    ),
  ].sort();
}

function loadCatalog(root) {
  return JSON.parse(readSource(root, CATALOG_PATH));
}
function governance(root) {
  return JSON.parse(readSource(root, GOVERNANCE_PATH));
}

function classify(name, rule, normativePaths) {
  const historical = name.startsWith('docs/audits/');
  const normative = !historical && (Boolean(rule) || normativePaths.has(name));
  let kind = 'guide';
  if (name === 'AGENTS.md') kind = 'instructions';
  else if (name.endsWith('README.md')) kind = 'readme';
  else if (historical) kind = 'historical';
  else if (rule)
    kind = ['policy', 'contract'].includes(rule.type) ? rule.type : 'guide';
  else if (name.startsWith('docs/specs/')) kind = 'specification';
  else if (name.startsWith('docs/product/')) kind = 'product';
  return {
    kind,
    normative,
    status: historical
      ? 'historical'
      : normative
        ? 'baseline-pending'
        : kind === 'readme'
          ? 'informative'
          : 'unclassified',
  };
}

function synchronize(root, oldCatalog, guidelines) {
  const previous = new Map(
    (oldCatalog?.documents || []).map((item) => [item.path, item]),
  );
  const rules = new Map(
    guidelines.guidelines.map((item) => [item.sourcePath, item]),
  );
  let anchors = previous;
  try {
    const committed = JSON.parse(git(root, ['show', `HEAD:${CATALOG_PATH}`]));
    anchors = new Map(committed.documents.map((item) => [item.path, item]));
  } catch {
    /* O primeiro cadastro ainda nao possui snapshot anterior. */
  }
  const capabilities = JSON.parse(
    readSource(root, 'config/agent-capabilities.json'),
  );
  const normativePaths = new Set([
    'AGENTS.md',
    'docs/product/product-scope-and-principles.md',
    'docs/architecture/target-architecture.md',
    'docs/specs/agent-workflow-evolution.md',
    'docs/specs/document-versioning.md',
    'docs/specs/third-trimester-curriculum-manifest-2026.md',
    'docs/specs/english-t2-bilingual-question-support.md',
    ...capabilities.roles.flatMap((role) => role.contractPaths),
  ]);
  const documents = documentPaths(root).map((name) => {
    const old = previous.get(name);
    const anchor = anchors.get(name) || old;
    const rule = rules.get(name);
    const hash = sha256(readSource(root, name));
    const changed = Boolean(old && old.sha256 !== hash);
    const classification = classify(name, rule, normativePaths);
    const version =
      old?.version ??
      rule?.version ??
      (classification.normative ? '1.0.0' : null);
    return {
      id:
        old?.id ||
        name.replace(/\.md$/, '').replaceAll('/', '--').toLowerCase(),
      path: name,
      kind: old?.kind || classification.kind,
      owner:
        old?.owner ||
        rule?.owner ||
        (name.startsWith('docs/product/') ? 'product' : 'architecture'),
      revision: anchor ? anchor.revision + (anchor.sha256 !== hash ? 1 : 0) : 1,
      version:
        changed &&
        version &&
        (!anchor?.version || compareVersions(version, anchor.version) <= 0)
          ? version.replace(/\d+$/, (patch) => String(Number(patch) + 1))
          : version,
      normative: old?.normative ?? classification.normative,
      status:
        changed && (old?.normative ?? classification.normative)
          ? 'draft'
          : old?.status || classification.status,
      sha256: hash,
    };
  });
  return { schemaVersion: SCHEMA, documents };
}

function structuralErrors(catalog) {
  const errors = [];
  if (
    !catalog ||
    catalog.schemaVersion !== SCHEMA ||
    !Array.isArray(catalog.documents) ||
    !catalog.documents.length
  )
    return ['catalogo documental invalido'];
  if (
    Object.keys(catalog).some(
      (key) => !['schemaVersion', 'documents'].includes(key),
    )
  )
    errors.push('campo desconhecido no catalogo');
  const ids = new Set();
  const paths = new Set();
  for (const item of catalog.documents) {
    if (
      !item ||
      typeof item !== 'object' ||
      FIELDS.some((key) => !Object.hasOwn(item, key)) ||
      Object.keys(item).some((key) => !FIELDS.includes(key))
    ) {
      errors.push('registro documental invalido');
      continue;
    }
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(item.id || '') || ids.has(item.id))
      errors.push('ID documental invalido ou duplicado');
    if (
      !safePath(item.path) ||
      !item.path.endsWith('.md') ||
      paths.has(item.path)
    )
      errors.push('caminho documental invalido ou duplicado');
    ids.add(item.id);
    paths.add(item.path);
    if (
      !KINDS.has(item.kind) ||
      !STATES.has(item.status) ||
      !/^[a-z][a-z0-9-]*$/.test(item.owner || '')
    )
      errors.push(`${item.path}: classificacao invalida`);
    if (
      !Number.isSafeInteger(item.revision) ||
      item.revision < 1 ||
      !HASH.test(item.sha256 || '')
    )
      errors.push(`${item.path}: revisao ou hash invalido`);
    if (
      typeof item.normative !== 'boolean' ||
      (item.version !== null && !SEMVER.test(item.version || '')) ||
      (item.normative && item.version === null)
    )
      errors.push(`${item.path}: versao invalida`);
    if (
      item.kind === 'historical' &&
      (item.normative || item.status !== 'historical')
    )
      errors.push(`${item.path}: historico nao pode ser norma ativa`);
    if (
      !item.normative &&
      ['approved', 'baseline-pending'].includes(item.status)
    )
      errors.push(
        `${item.path}: aprovacao normativa em referencia informativa`,
      );
  }
  return errors;
}

function validate(root, catalog, guidelines) {
  const errors = structuralErrors(catalog);
  if (errors.length) return errors;
  const actual = new Set(documentPaths(root));
  const registered = new Map(
    catalog.documents.map((item) => [item.path, item]),
  );
  for (const name of actual)
    if (!registered.has(name)) errors.push(`documento sem cadastro: ${name}`);
  for (const item of catalog.documents) {
    if (!actual.has(item.path))
      errors.push(`documento cadastrado ausente: ${item.path}`);
    try {
      if (sha256(readSource(root, item.path)) !== item.sha256)
        errors.push(`hash documental diverge: ${item.path}`);
    } catch {
      errors.push(`documento inseguro ou ilegivel: ${item.path}`);
    }
  }
  for (const rule of guidelines.guidelines) {
    const item = registered.get(rule.sourcePath);
    if (
      !item ||
      !item.normative ||
      item.version !== rule.version ||
      item.sha256 !== rule.sha256 ||
      item.owner !== rule.owner
    )
      errors.push(`projecao de governanca diverge: ${rule.id}`);
  }
  return errors;
}

function projectGovernance(catalog, guidelines) {
  const byPath = new Map(catalog.documents.map((item) => [item.path, item]));
  return {
    ...guidelines,
    guidelines: guidelines.guidelines.map((rule) => {
      const item = byPath.get(rule.sourcePath);
      if (!item) throw new Error(`norma ausente: ${rule.id}`);
      return {
        ...rule,
        version: item.version,
        sha256: item.sha256,
        owner: item.owner,
      };
    }),
  };
}

function resolveCommit(root, ref) {
  if (!ref || ref.startsWith('-') || /[\s\0]/.test(ref))
    throw new Error('revisao Git invalida');
  return git(root, ['rev-parse', '--verify', `${ref}^{commit}`]).trim();
}

function snapshotJson(root, commit, name) {
  return JSON.parse(git(root, ['show', `${commit}:${name}`]));
}
function compareCatalogs(previous, current) {
  const errors = [];
  const changes = [];
  const prior = new Map(previous.documents.map((item) => [item.id, item]));
  const present = new Set(current.documents.map((item) => item.id));
  for (const item of current.documents) {
    const old = prior.get(item.id);
    if (!old) {
      changes.push({ id: item.id, path: item.path, change: 'added' });
      continue;
    }
    if (digest(item) === digest(old)) continue;
    changes.push({
      id: item.id,
      path: item.path,
      change: item.path !== old.path ? 'renamed' : 'modified',
      previousSha256: old.sha256,
      sha256: item.sha256,
    });
    if (item.sha256 !== old.sha256) {
      if (item.revision <= old.revision)
        errors.push(`${item.path}: conteudo alterado exige revisao maior`);
      if (
        old.normative &&
        (!item.version || compareVersions(item.version, old.version) <= 0)
      )
        errors.push(`${item.path}: norma alterada exige versao maior`);
      if (item.status === 'approved')
        errors.push(`${item.path}: conteudo alterado nao herda aprovacao`);
    } else if (item.revision !== old.revision)
      errors.push(`${item.path}: revisao mudou sem alterar conteudo`);
    if (old.normative && !item.normative)
      errors.push(
        `${item.path}: retirada normativa exige substituicao explicita`,
      );
    if (old.kind === 'historical' && digest(item) !== digest(old))
      errors.push(`${item.path}: registro historico deve ser preservado`);
  }
  for (const old of previous.documents)
    if (!present.has(old.id)) {
      changes.push({ id: old.id, path: old.path, change: 'removed' });
      if (old.normative || old.kind === 'historical')
        errors.push(
          `${old.path}: exclusao normativa ou historica exige revisao do escopo`,
        );
    }
  return { changes, errors };
}

function compareVersions(left, right) {
  if (!SEMVER.test(left || '') || !SEMVER.test(right || ''))
    throw new Error('versao invalida');
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let index = 0; index < 3; index++)
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  return 0;
}

function baseline(root, ref) {
  const sourceCommit = resolveCommit(root, ref);
  const catalog = snapshotJson(root, sourceCommit, CATALOG_PATH);
  const errors = structuralErrors(catalog);
  if (errors.length) throw new Error(errors.join('\n'));
  const documents = catalog.documents
    .filter(
      (item) =>
        item.normative && !['superseded', 'historical'].includes(item.status),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  for (const item of documents) {
    const entry = git(root, ['ls-tree', sourceCommit, '--', item.path]);
    if (!/^(100644|100755) blob /.test(entry))
      throw new Error(
        `documento do snapshot nao e arquivo regular: ${item.path}`,
      );
    const content = execFileSync(
      'git',
      ['show', `${sourceCommit}:${item.path}`],
      { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    if (sha256(content) !== item.sha256)
      throw new Error(`hash do snapshot diverge: ${item.path}`);
  }
  const result = {
    schemaVersion: 'document-baseline-v1',
    sourceCommit,
    documents,
  };
  return { ...result, sha256: digest(result) };
}

function verifyApproval(bundle, evidenceRef, readComment) {
  const { sha256: expected, ...payload } = bundle || {};
  if (
    payload.schemaVersion !== 'document-baseline-v1' ||
    digest(payload) !== expected ||
    !/^[a-f0-9]{40}$/.test(payload.sourceCommit || '') ||
    !payload.documents?.length
  )
    throw new Error('baseline invalido');
  const match =
    /^https:\/\/github\.com\/dleomil\/quiz\/issues\/\d+#issuecomment-(\d+)$/.exec(
      evidenceRef || '',
    );
  if (!match) throw new Error('referencia de aceite invalida');
  const comment = readComment(match[1]);
  const line = `Aprovo o baseline documental hash ${expected}`;
  if (
    comment?.html_url !== evidenceRef ||
    comment?.user?.login !== 'dleomil' ||
    comment?.user?.type !== 'User' ||
    !Number.isFinite(Date.parse(comment.created_at || '')) ||
    typeof comment.body !== 'string' ||
    comment.body.trim() !== line
  )
    throw new Error('aceite documental ausente ou divergente');
  return {
    schemaVersion: 'document-baseline-approval-v1',
    baselineSha256: expected,
    sourceCommit: payload.sourceCommit,
    evidenceRef,
    approvedBy: comment.user.login,
    observedAt: comment.created_at,
  };
}

async function main() {
  const command = process.argv[2] || 'validate';
  const allowed = {
    validate: ['--base-ref'],
    changes: ['--base-ref'],
    sync: [],
    baseline: ['--ref'],
    'verify-approval': ['--baseline', '--evidence'],
  }[command];
  if (!allowed) throw new Error('comando documental desconhecido');
  const flags = new Map();
  for (let index = 3; index < process.argv.length; index += 2) {
    const flag = process.argv[index];
    const argument = process.argv[index + 1];
    if (
      !allowed.includes(flag) ||
      flags.has(flag) ||
      !argument ||
      argument.startsWith('--')
    )
      throw new Error('argumento documental invalido');
    flags.set(flag, argument);
  }
  const value = (flag) => flags.get(flag);
  const catalog = fs.existsSync(path.join(ROOT, CATALOG_PATH))
    ? loadCatalog(ROOT)
    : null;
  const guidelines = governance(ROOT);
  if (command === 'sync') {
    if (catalog && structuralErrors(catalog).length)
      throw new Error('catalogo atual invalido; corrigir antes de sincronizar');
    const next = synchronize(ROOT, catalog, guidelines);
    const projected = projectGovernance(next, guidelines);
    const errors = validate(ROOT, next, projected);
    if (errors.length) throw new Error(errors.join('\n'));
    const prettier = require('prettier');
    const format = (value) =>
      prettier.format(serialize(value), { parser: 'json' });
    const catalogText = await format(next);
    const governanceText = await format(projected);
    fs.writeFileSync(path.join(ROOT, CATALOG_PATH), catalogText);
    fs.writeFileSync(path.join(ROOT, GOVERNANCE_PATH), governanceText);
    process.stdout.write(
      `document-catalog: sincronizado (${next.documents.length} documentos)\n`,
    );
    return;
  }
  if (command === 'baseline') {
    process.stdout.write(serialize(baseline(ROOT, value('--ref') || 'HEAD')));
    return;
  }
  if (command === 'verify-approval') {
    if (
      !process.argv.includes('--baseline') ||
      !process.argv.includes('--evidence')
    )
      throw new Error('use --baseline e --evidence');
    const input = JSON.parse(
      fs.readFileSync(path.resolve(value('--baseline')), 'utf8'),
    );
    if (digest(input) !== digest(baseline(ROOT, input.sourceCommit)))
      throw new Error('baseline nao corresponde ao snapshot Git');
    const receipt = verifyApproval(input, value('--evidence'), (id) =>
      JSON.parse(
        execFileSync(
          'gh',
          ['api', `repos/dleomil/quiz/issues/comments/${id}`],
          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
        ),
      ),
    );
    process.stdout.write(serialize(receipt));
    return;
  }
  const errors = validate(ROOT, catalog, guidelines);
  if (process.argv.includes('--base-ref')) {
    const commit = resolveCommit(ROOT, value('--base-ref'));
    const exists = git(ROOT, [
      'ls-tree',
      '--name-only',
      commit,
      '--',
      CATALOG_PATH,
    ]).trim();
    if (exists && !errors.length) {
      const result = compareCatalogs(
        snapshotJson(ROOT, commit, CATALOG_PATH),
        catalog,
      );
      errors.push(...result.errors);
      if (command === 'changes') process.stdout.write(serialize(result));
    }
  } else if (command === 'changes') throw new Error('changes exige --base-ref');
  if (!['validate', 'changes'].includes(command))
    throw new Error('comando documental desconhecido');
  if (errors.length) throw new Error(errors.join('\n'));
  if (command === 'validate')
    process.stdout.write(
      `document-catalog: ok (${catalog.documents.length} documentos; aceite nao inferido)\n`,
    );
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
module.exports = {
  CATALOG_PATH,
  ROOT,
  baseline,
  compareCatalogs,
  compareVersions,
  digest,
  documentPaths,
  loadCatalog,
  projectGovernance,
  readSource,
  resolveCommit,
  safePath,
  serialize,
  structuralErrors,
  synchronize,
  validate,
  verifyApproval,
};
