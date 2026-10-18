const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { validateQuestion } = require('./validate-content.cjs');
const { validateEditorialScenario } = require('./validate-codex-agents.cjs');

const ROOT = path.resolve(__dirname, '..');
const POLICY_PATH = 'config/content-delivery-policy.json';
const PASSES = ['pedagogical', 'linguistic'];

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable(value[key])]),
    );
  }
  return value;
}
function digest(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(stable(value)))
    .digest('hex');
}
function canonicalQuestions(questions) {
  return questions
    .map((question) => ({ ...question, reviewStatus: 'draft' }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
function packageHash(questions) {
  return digest(canonicalQuestions(questions));
}
function reviewProjection(question) {
  const result = {
    ...question,
    reviewStatus: 'draft',
    sourceRef: {
      referenceId: question.sourceRef?.referenceId,
      section: question.sourceRef?.section,
      topic: question.sourceRef?.topic || question.topic,
    },
  };
  delete result.topicName;
  return result;
}
function batchKey(question) {
  return [question.contentSetId, question.subject, question.topic].join('/');
}
function applies(contentSetId, policy) {
  const match = /^(\d{4})-t([123])-v\d+$/.exec(contentSetId || '');
  const minimum = /^(\d{4})-t([123])$/.exec(policy.minimumCycle || '');
  return Boolean(
    match &&
    minimum &&
    Number(match[1]) * 3 + Number(match[2]) >=
      Number(minimum[1]) * 3 + Number(minimum[2]),
  );
}
function requirementsFor(subject, policy) {
  return policy.requirements.filter(
    (rule) => !rule.subject || rule.subject === subject,
  );
}
function validateBatch(questions, { policy, coverage, topicNames = {} } = {}) {
  const errors = [];
  if (!Array.isArray(questions) || !questions.length)
    return { errors: ['lote vazio'], questions: [] };
  const first = questions[0];
  const expected =
    coverage?.contentSets?.[first.contentSetId]?.subjects?.[first.subject]?.[
      first.topic
    ];
  if (!Number.isInteger(expected))
    errors.push('tema nao declarado na cobertura');
  else if (questions.length !== expected)
    errors.push(`cobertura: atual=${questions.length} esperado=${expected}`);
  const ids = new Set();
  for (const question of questions) {
    errors.push(...validateQuestion(question, first.subject));
    if (
      question.subject === 'historia' &&
      !/^\d{4}-t[23]-v\d+$/.test(question.contentSetId || '')
    ) {
      errors.push(
        ...validateQuestion(
          { ...question, contentSetId: '2026-t3-v1' },
          first.subject,
        ),
      );
    }
    if (question.schemaVersion !== 'content-v1')
      errors.push(`${question.id}: exige content-v1`);
    if (batchKey(question) !== batchKey(first))
      errors.push(`${question.id}: lote mistura temas`);
    if (ids.has(question.id)) errors.push(`${question.id}: ID duplicado`);
    ids.add(question.id);
    const wrong = [0, 1, 2, 3]
      .filter((index) => index !== question.correctIndex)
      .map(String);
    if (
      JSON.stringify(Object.keys(question.wrongExplanations || {}).sort()) !==
      JSON.stringify(wrong)
    )
      errors.push(`${question.id}: feedbacks incompletos`);
    if (question.subject === 'ingles') {
      const normalize = (text) =>
        String(text || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, ' ')
          .trim();
      const support = normalize(question.questionPt);
      const answer = normalize(question.options?.[question.correctIndex]);
      if (answer && ` ${support} `.includes(` ${answer} `))
        errors.push(`${question.id}: apoio reproduz a resposta em ingles`);
      if (question.question?.includes('___')) {
        const target = question.question
          .slice(question.question.indexOf(':') + 1)
          .trim();
        if (!question.questionPt?.includes(target))
          errors.push(`${question.id}: apoio perdeu frase ou lacuna avaliada`);
      }
      if (
        support ===
          'escolha a alternativa correta para a frase ou palavra apresentada em ingles' ||
        support === normalize(question.question)
      )
        errors.push(`${question.id}: apoio generico ou copia do ingles`);
    }
    if (
      question.subject === 'historia' &&
      /\b(?:what|which|why|how|when|where|who)\s+(?:is|are|was|were|do|does|did|can|should)\b/i.test(
        JSON.stringify(question),
      )
    )
      errors.push(`${question.id}: padrao em ingles em Historia`);
  }
  if (policy && !requirementsFor(first.subject, policy).length)
    errors.push('requisitos do lote ausentes');
  return {
    errors,
    questions: questions.map((question) => ({
      ...question,
      ...(question.topicName ? {} : { topicName: topicNames[question.topic] }),
    })),
  };
}
function validateReviews(
  questions,
  record,
  readJson,
  { policy, allowTestEvidence = false } = {},
) {
  const errors = [];
  const hash = packageHash(questions);
  if (!record || record.schemaVersion !== 'content-delivery-v1')
    return ['registro editorial ausente ou invalido'];
  if (record.batch !== batchKey(questions[0]) || record.sourceSha256 !== hash)
    errors.push('registro editorial pertence a outro lote ou hash');
  if (!allowTestEvidence && record.testOnly !== false)
    errors.push('registro ficticio nao autoriza entrega');
  if (!Array.isArray(record.reviews) || !Array.isArray(record.requirements))
    return [...errors, 'revisoes e requisitos devem ser listas'];
  const expected = new Set(
    questions.flatMap((question) =>
      PASSES.map((pass) => `${question.id}:${pass}`),
    ),
  );
  const seen = new Set();
  const runIds = new Set();
  for (const entry of record.reviews || []) {
    const pair = `${entry.questionId}:${entry.pass}`;
    if (!expected.has(pair) || seen.has(pair))
      errors.push(`revisao inesperada ou duplicada: ${pair}`);
    seen.add(pair);
    try {
      if (
        !allowTestEvidence &&
        !/^docs\/editorial\/[\w./-]+\.json$/.test(entry.evidencePath || '')
      )
        throw new Error('origem de revisao nao autorizada');
      const scenario = readJson(entry.evidencePath);
      const editorialScenario = { ...scenario };
      delete editorialScenario.execution;
      errors.push(...validateEditorialScenario(editorialScenario));
      const execution = scenario.execution || {};
      const question = questions.find((item) => item.id === entry.questionId);
      if (
        !question ||
        digest(scenario.input?.proposal) !== digest(reviewProjection(question))
      )
        errors.push(`proposta revisada diverge: ${pair}`);
      if (
        execution.packageSha256 !== hash ||
        execution.proposalSha256 !== digest(scenario.input?.proposal)
      )
        errors.push(`hash da execucao diverge: ${pair}`);
      if (
        execution.kind !== 'isolated-editorial' ||
        (!allowTestEvidence && execution.testOnly !== false)
      )
        errors.push(`execucao editorial ausente ou ficticia: ${pair}`);
      if (!execution.runId || runIds.has(execution.runId))
        errors.push(`execucao repetida ou ausente: ${pair}`);
      runIds.add(execution.runId);
      if (
        execution.agent !== 'pedagogical_quality' ||
        scenario.output?.agent !== 'pedagogical_quality' ||
        execution.pass !== entry.pass ||
        scenario.output?.reviewPass !== entry.pass
      )
        errors.push(`passagem editorial diverge: ${pair}`);
      if (
        !execution.completedAt ||
        !Number.isFinite(Date.parse(execution.completedAt))
      )
        errors.push(`data da execucao invalida: ${pair}`);
      if (
        scenario.output?.decision !== 'approved' ||
        scenario.output?.doubts?.length ||
        scenario.output?.findings?.length
      )
        errors.push(`revisao com pendencias: ${pair}`);
      if (!scenario.output?.facts?.length)
        errors.push(`revisao sem fatos registrados: ${pair}`);
    } catch (error) {
      errors.push(`${pair}: ${error.message}`);
    }
  }
  for (const pair of expected)
    if (!seen.has(pair)) errors.push(`revisao ausente: ${pair}`);
  for (const rule of requirementsFor(questions[0].subject, policy)) {
    const evidence = (record.requirements || []).find(
      (item) => item.id === rule.id,
    );
    if (
      !evidence ||
      typeof evidence.evidence !== 'string' ||
      !evidence.evidence.trim() ||
      evidence.verification !== rule.verification
    )
      errors.push(`requisito sem evidencia: ${rule.id}`);
  }
  return errors;
}
function validateApproval(questions, record, policy, readComment) {
  const errors = [];
  const approval = record?.approval;
  const hash = packageHash(questions);
  const statement = `Aprovo editorialmente o lote ${batchKey(questions[0])} hash ${hash}`;
  if (
    !approval ||
    approval.kind !== 'editorial' ||
    approval.sourceSha256 !== hash ||
    !policy.humanApprovers.includes(approval.approvedBy)
  )
    return ['aceite editorial humano ausente ou divergente'];
  const match =
    /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(?:issues|pull)\/\d+#issuecomment-(\d+)$/.exec(
      approval.evidenceRef || '',
    );
  if (!match || match[1] !== policy.repository)
    return ['aceite exige comentario verificavel no repositorio'];
  try {
    const comment = readComment(match[2]);
    if (
      comment.user?.login !== approval.approvedBy ||
      comment.user?.type !== 'User' ||
      !comment.body
        ?.split('\n')
        .map((line) => line.trim())
        .includes(statement)
    )
      errors.push('comentario nao comprova aceite editorial do pacote');
    if (comment.html_url !== approval.evidenceRef || !comment.created_at)
      errors.push('origem do aceite diverge');
  } catch {
    errors.push('nao foi possivel verificar o aceite editorial');
  }
  return errors;
}
function validateGeneratedQuestions(questions, root = ROOT) {
  const policy = JSON.parse(
    fs.readFileSync(path.join(root, POLICY_PATH), 'utf8'),
  );
  const coverage = JSON.parse(
    fs.readFileSync(
      path.join(root, 'config/content-coverage-manifest.json'),
      'utf8',
    ),
  );
  if (!Array.isArray(questions) || !questions.length)
    throw new Error('gerador retornou lote vazio');
  const groups = new Map();
  for (const question of questions) {
    if (!applies(question.contentSetId, policy))
      throw new Error('geracao fora do escopo T3 e proximos acervos');
    const key = batchKey(question);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(question);
  }
  const errors = [...groups.values()].flatMap(
    (batch) => validateBatch(batch, { policy, coverage }).errors,
  );
  if (errors.length) throw new Error(errors.join('\n'));
  return questions;
}

function assertPublication(
  questions,
  { root = ROOT, baseRef = 'HEAD', readComment } = {},
) {
  const policy = JSON.parse(
    fs.readFileSync(path.join(root, POLICY_PATH), 'utf8'),
  );
  const before = readState(snapshot(root, baseRef), policy);
  const worktree = snapshot(root, 'WORKTREE');
  const current = readState(worktree, policy);
  const coverage = JSON.parse(
    worktree.read('config/content-coverage-manifest.json'),
  );
  const groups = new Map();
  for (const question of questions) {
    const key = batchKey(question);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(question);
  }
  const errors = [...current.errors];
  const readJson = (name) => {
    if (!worktree.names.includes(name) || name.split('/').includes('..'))
      throw new Error('evidencia ausente');
    return JSON.parse(worktree.read(name));
  };
  const commentReader =
    readComment ||
    ((id) =>
      JSON.parse(
        execFileSync(
          'gh',
          ['api', `repos/${policy.repository}/issues/comments/${id}`],
          { encoding: 'utf8' },
        ),
      ));
  for (const [key, batch] of groups) {
    if (packageHash(batch) === packageHash(before.published.get(key) || []))
      continue;
    const draft = current.drafts.get(key);
    const checked = validateBatch(draft, {
      policy,
      coverage,
      topicNames: current.topicNames[batch[0].subject],
    });
    errors.push(...checked.errors);
    if (!draft?.length) continue;
    if (packageHash(checked.questions) !== packageHash(batch))
      errors.push(`${key}: publicador diverge do rascunho`);
    const recordPath = `${policy.editorialDirectory}/${key.replaceAll('/', '--')}.json`;
    if (!worktree.names.includes(recordPath)) {
      errors.push(`${key}: revisao ausente para publicacao`);
      continue;
    }
    const record = readJson(recordPath);
    errors.push(
      ...validateReviews(checked.questions, record, readJson, { policy }),
    );
    errors.push(
      ...validateApproval(checked.questions, record, policy, commentReader),
    );
    if (
      record.visual?.sourceSha256 !== packageHash(batch) ||
      record.visual?.test !== 'content-delivery-ui' ||
      !record.visual?.evidenceRef
    )
      errors.push(`${key}: evidencia visual ausente`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
}
function git(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}
function snapshot(root, ref) {
  const names =
    ref === 'WORKTREE'
      ? git(root, ['ls-files', '--cached', '--others', '--exclude-standard'])
          .trim()
          .split('\n')
          .filter((name) => name && fs.existsSync(path.join(root, name)))
      : git(root, ['ls-tree', '-r', '--name-only', ref]).trim().split('\n');
  return {
    names: [...new Set(names)],
    read: (name) =>
      ref === 'WORKTREE'
        ? fs.readFileSync(path.join(root, name), 'utf8')
        : git(root, ['show', `${ref}:${name}`]),
  };
}
function defaultBase(root, policy) {
  const branch = git(root, ['rev-parse', '--abbrev-ref', 'HEAD']).trim();
  const ref =
    branch === 'main' || /^(?:release|hotfix)\//.test(branch)
      ? 'origin/main'
      : 'origin/develop';
  try {
    git(root, ['rev-parse', '--verify', ref]);
    return ref;
  } catch {
    return policy.activationCommit;
  }
}
function readState(source, policy) {
  const errors = [];
  const drafts = new Map();
  for (const name of source.names.filter((file) =>
    /^scripts\/create-t[123]-.*\.cjs$/.test(file),
  )) {
    if (!policy.generatorFiles.includes(name))
      errors.push(`caminho de geracao nao cadastrado: ${name}`);
  }
  for (const name of source.names.filter((file) =>
    /^scripts\/build-t[123]-.*\.cjs$/.test(file),
  )) {
    if (!policy.publisherFiles?.includes(name))
      errors.push(`caminho de publicacao nao cadastrado: ${name}`);
  }
  for (const name of source.names.filter((file) =>
    /^docs\/drafts\/.*\.json$/.test(file),
  )) {
    const draft = JSON.parse(source.read(name));
    if (!Array.isArray(draft.questions)) continue;
    const groups = new Map();
    for (const question of draft.questions) {
      if (!applies(question.contentSetId, policy)) continue;
      const key = batchKey(question);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(question);
    }
    for (const [key, questions] of groups) {
      if (drafts.has(key)) errors.push(`rascunhos duplicados: ${key}`);
      drafts.set(key, questions);
    }
  }
  const subjects = [
    'portugues',
    'matematica',
    'ciencias',
    'geografia',
    'historia',
    'ingles',
  ];
  const context = vm.createContext({ window: {} });
  for (const subject of subjects) {
    const file = `js/data/subjects/${subject}.js`;
    if (source.names.includes(file))
      vm.runInContext(source.read(file), context, { timeout: 3000 });
  }
  const known = new Set(policy.runtimeFiles);
  const subjectFiles = new Set(
    subjects.map((subject) => `js/data/subjects/${subject}.js`),
  );
  const supportFiles = new Set([
    'js/data/content-catalog.js',
    'js/data/questions.js',
  ]);
  for (const name of source.names.filter((file) => /^js\/.*\.js$/.test(file))) {
    if (known.has(name) || subjectFiles.has(name) || supportFiles.has(name))
      continue;
    if (
      name.startsWith('js/data/') ||
      /QuestionsDataSources/.test(source.read(name))
    )
      errors.push(`caminho de conteudo nao cadastrado: ${name}`);
  }
  for (const file of policy.runtimeFiles)
    if (source.names.includes(file))
      vm.runInContext(source.read(file), context, { timeout: 3000 });
  const published = new Map();
  const topicNames = {};
  for (const [subject, data] of Object.entries(
    context.window.QuestionsDataSources || {},
  )) {
    topicNames[subject] = Object.fromEntries(
      Object.entries(data.topicMeta || {}).map(([topic, metadata]) => [
        topic,
        metadata.name,
      ]),
    );
    for (const question of JSON.parse(JSON.stringify(data.questions))) {
      if (!applies(question.contentSetId, policy)) continue;
      const key = batchKey(question);
      if (!published.has(key)) published.set(key, []);
      published.get(key).push(question);
    }
  }
  return { drafts, published, topicNames, errors };
}
function validateDelivery({
  root = ROOT,
  baseRef,
  headRef = 'WORKTREE',
  policy: suppliedPolicy,
  readComment,
  allowTestEvidence = false,
}) {
  const head = snapshot(root, headRef);
  const policy = suppliedPolicy || JSON.parse(head.read(POLICY_PATH));
  const selectedBase = baseRef || defaultBase(root, policy);
  const base = snapshot(root, selectedBase);
  const before = readState(base, policy);
  const after = readState(head, policy);
  const errors = [...after.errors];
  const coverage = JSON.parse(
    head.read('config/content-coverage-manifest.json'),
  );
  const batches = [];
  const keys = new Set([
    ...before.drafts.keys(),
    ...before.published.keys(),
    ...after.drafts.keys(),
    ...after.published.keys(),
  ]);
  const readJson = (name) => {
    if (!head.names.includes(name) || name.split('/').includes('..'))
      throw new Error('evidencia ausente');
    return JSON.parse(head.read(name));
  };
  const commentReader =
    readComment ||
    ((id) =>
      JSON.parse(
        execFileSync(
          'gh',
          ['api', `repos/${policy.repository}/issues/comments/${id}`],
          { encoding: 'utf8' },
        ),
      ));
  for (const key of keys) {
    const previousDraft = before.drafts.get(key),
      draft = after.drafts.get(key);
    const previousPublished = before.published.get(key),
      published = after.published.get(key);
    const subject = key.split('/')[1];
    if (!policy.enabledSubjects.includes(subject)) continue;
    const draftChanged =
      digest(canonicalQuestions(previousDraft || [])) !==
      digest(canonicalQuestions(draft || []));
    const publishedChanged =
      digest(canonicalQuestions(previousPublished || [])) !==
      digest(canonicalQuestions(published || []));
    if (!draftChanged && !publishedChanged) continue;
    if (!draft || !draft.length) {
      errors.push(`${key}: remocao ou publicacao sem rascunho autorizado`);
      continue;
    }
    const checked = validateBatch(draft, {
      policy,
      coverage,
      topicNames: after.topicNames[subject],
    });
    errors.push(...checked.errors.map((error) => `${key}: ${error}`));
    const questions = checked.questions;
    let stage = 'draft';
    const recordPath = `${policy.editorialDirectory}/${key.replaceAll('/', '--')}.json`;
    let record;
    if (head.names.includes(recordPath)) {
      record = readJson(recordPath);
      errors.push(
        ...validateReviews(questions, record, readJson, {
          policy,
          allowTestEvidence,
        }).map((error) => `${key}: ${error}`),
      );
      stage = 'review';
    }
    if (publishedChanged) {
      stage = 'publish';
      if (!published?.length)
        errors.push(
          `${key}: remocao de lote publicado exige decisao curricular especifica`,
        );
      else if (packageHash(questions) !== packageHash(published))
        errors.push(`${key}: runtime diverge do rascunho`);
      if (!record) errors.push(`${key}: revisao ausente para publicacao`);
      else {
        errors.push(
          ...validateApproval(questions, record, policy, commentReader).map(
            (error) => `${key}: ${error}`,
          ),
        );
        if (
          record.visual?.sourceSha256 !== packageHash(questions) ||
          record.visual?.test !== 'content-delivery-ui' ||
          !record.visual?.evidenceRef
        )
          errors.push(`${key}: evidencia visual do pacote ausente`);
      }
    }
    batches.push({
      key,
      stage,
      sourceSha256: packageHash(questions),
      ids: questions.map((question) => question.id),
    });
  }
  return {
    schemaVersion: 'content-delivery-result-v1',
    baseRef: selectedBase,
    headRef,
    batches,
    errors,
  };
}
function run(args = process.argv.slice(2)) {
  try {
    const input = {};
    for (let index = 0; index < args.length; index += 2) {
      if (
        !['--base-ref', '--head-ref'].includes(args[index]) ||
        !args[index + 1]
      )
        throw new Error('use --base-ref <ref> --head-ref <ref|WORKTREE>');
      input[args[index] === '--base-ref' ? 'baseRef' : 'headRef'] =
        args[index + 1];
    }
    const result = validateDelivery(input);
    process.stdout.write(JSON.stringify(result) + '\n');
    if (result.errors.length) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`content-delivery: ${error.message}\n`);
    process.exitCode = 1;
  }
}
if (require.main === module) run();
module.exports = {
  stable,
  digest,
  canonicalQuestions,
  packageHash,
  reviewProjection,
  batchKey,
  applies,
  requirementsFor,
  validateBatch,
  validateReviews,
  validateApproval,
  validateGeneratedQuestions,
  assertPublication,
  snapshot,
  readState,
  validateDelivery,
  run,
};
