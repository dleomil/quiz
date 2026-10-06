const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_DIRECTORY = path.join(ROOT, 'docs/drafts');
const AUDIT_DIRECTORY = path.join(ROOT, 'docs/audits');
const OUTPUT_PATH = path.join(
  ROOT,
  'js/data/t3-portugues-expansion-published.js',
);
const TOPICS = [
  ['encontros-ch-lh-nh', 'Palavras com ch, lh e nh'],
  ['preterito-perfeito', 'Pretérito perfeito'],
  ['prefixo-des', 'Palavras iniciadas por des-'],
  ['futuro', 'Futuro do presente'],
  ['usos-ge-gi', 'Usos de ge e gi'],
  ['adjetivos', 'Adjetivos'],
];
const REQUIRED_REFERENCE_ID = 'roteiro-estudos-av-mensal-t3-2026';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

function sourceHash(questions) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(stableValue(questions)))
    .digest('hex');
}

function readAudit(topic) {
  const prefix = `2026-t3-v1-pt-${topic}-`;
  const matches = fs
    .readdirSync(AUDIT_DIRECTORY)
    .filter(
      (file) =>
        file.startsWith(prefix) && file.endsWith('-editorial-review.json'),
    );
  assert(matches.length === 1, `${topic}: deve haver exatamente uma auditoria`);
  return JSON.parse(
    fs.readFileSync(path.join(AUDIT_DIRECTORY, matches[0]), 'utf8'),
  );
}

function validateTopic(topic, topicName) {
  const draftPath = path.join(DRAFT_DIRECTORY, `2026-t3-v1-pt-${topic}.json`);
  const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
  assert(
    draft.contentSetId === '2026-t3-v1',
    `${topic}: contentSetId invalido`,
  );
  assert(
    Array.isArray(draft.questions) && draft.questions.length === 20,
    `${topic}: deve ter exatamente 20 questoes`,
  );

  const questions = draft.questions;
  const ids = new Set();
  const distribution = [0, 0, 0, 0];
  questions.forEach((question) => {
    assert(
      question.schemaVersion === 'content-v1',
      `${topic}: schema invalido`,
    );
    assert(
      question.contentSetId === '2026-t3-v1',
      `${question.id}: contentSetId`,
    );
    assert(
      question.subject === 'portugues',
      `${question.id}: materia invalida`,
    );
    assert(question.topic === topic, `${question.id}: tema invalido`);
    assert(
      question.reviewStatus === 'draft',
      `${question.id}: status inesperado`,
    );
    assert(question.version === 1, `${question.id}: versao inesperada`);
    assert(
      typeof question.skill === 'string' && question.skill,
      `${question.id}: habilidade ausente`,
    );
    assert(!ids.has(question.id), `${topic}: ID duplicado ${question.id}`);
    ids.add(question.id);
    assert(
      Array.isArray(question.options) && question.options.length === 4,
      `${question.id}: quatro alternativas exigidas`,
    );
    assert(
      new Set(question.options).size === 4,
      `${question.id}: alternativa duplicada`,
    );
    assert(
      Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 &&
        question.correctIndex <= 3,
      `${question.id}: indice correto invalido`,
    );
    distribution[question.correctIndex] += 1;
    const wrongIndexes = [0, 1, 2, 3]
      .filter((index) => index !== question.correctIndex)
      .map(String)
      .sort();
    assert(
      JSON.stringify(Object.keys(question.wrongExplanations || {}).sort()) ===
        JSON.stringify(wrongIndexes),
      `${question.id}: feedbacks incorretos`,
    );
    assert(
      JSON.stringify(Object.keys(question.sourceRef || {}).sort()) ===
        JSON.stringify(['referenceId', 'section', 'topic']),
      `${question.id}: sourceRef fora do contrato`,
    );
    assert(
      question.sourceRef.referenceId === REQUIRED_REFERENCE_ID,
      `${question.id}: fonte curricular inesperada`,
    );
    assert(
      question.sourceRef.section === 'Português',
      `${question.id}: secao curricular inesperada`,
    );
    assert(
      question.sourceRef.topic === topic,
      `${question.id}: referencia de tema inesperada`,
    );
  });
  assert(
    distribution.every((count) => count === 5),
    `${topic}: distribuicao deve ser 5/5/5/5`,
  );

  const audit = readAudit(topic);
  assert(
    audit.schemaVersion === 'editorial-review-v1',
    `${topic}: schema de auditoria invalido`,
  );
  assert(
    audit.contentSetId === '2026-t3-v1',
    `${topic}: auditoria de outro content set`,
  );
  assert(
    audit.subjectId === 'portugues' && audit.topicId === topic,
    `${topic}: auditoria fora do tema`,
  );
  assert(audit.reportStatus === 'clear', `${topic}: auditoria nao esta clear`);
  assert(
    audit.humanApprovalRequired === true,
    `${topic}: gate de aprovacao humana ausente`,
  );
  assert(
    audit.expectedEvaluations === 40 && audit.completedEvaluations === 40,
    `${topic}: auditoria incompleta`,
  );
  assert(
    audit.sourceSha256 === sourceHash(questions),
    `${topic}: hash da auditoria nao corresponde ao rascunho`,
  );
  assert(
    Array.isArray(audit.reviews) && audit.reviews.length === 40,
    `${topic}: deve registrar 40 avaliacoes`,
  );

  const expectedEvaluations = new Set();
  questions.forEach((question) => {
    ['pedagogical', 'linguistic'].forEach((reviewPass) => {
      expectedEvaluations.add(`${question.id}:${reviewPass}`);
    });
  });
  const seenEvaluations = new Set();
  audit.reviews.forEach((review) => {
    const questionId = review.workItemId || review.questionId;
    const reviewPass = review.reviewPass || review.pass;
    const key = `${questionId}:${reviewPass}`;
    assert(
      expectedEvaluations.has(key),
      `${topic}: avaliacao inesperada ${key}`,
    );
    assert(!seenEvaluations.has(key), `${topic}: avaliacao duplicada ${key}`);
    assert(
      review.decision === 'approved',
      `${topic}: avaliacao nao aprovada ${key}`,
    );
    seenEvaluations.add(key);
  });
  assert(
    seenEvaluations.size === expectedEvaluations.size,
    `${topic}: avaliacao ausente`,
  );

  return questions.map((question) => ({
    ...question,
    topicName,
    reviewStatus: 'published',
  }));
}

function collectPublishedQuestions() {
  const questions = TOPICS.flatMap(([topic, topicName]) =>
    validateTopic(topic, topicName),
  );
  assert(questions.length === 120, 'a expansao deve conter 120 questoes');
  assert(
    new Set(questions.map((question) => question.id)).size === 120,
    'IDs duplicados entre temas',
  );

  return questions;
}

function renderBundle(questions) {
  const topicMeta = Object.fromEntries(
    TOPICS.map(([topic, name]) => [topic, { name, icon: '📚' }]),
  );
  return `/* Publicacao T3 de Portugues: seis temas aprovados. */\n(function () {\n  const publishedQuestions = ${JSON.stringify(questions, null, 2)};\n  const source = window.QuestionsDataSources.portugues;\n  if (!source) return;\n  source.questions.push(...publishedQuestions);\n  Object.assign(source.topicMeta, ${JSON.stringify(topicMeta, null, 2)});\n})();\n`;
}

function formatBundle(bundle) {
  return execFileSync(
    process.execPath,
    [
      require.resolve('prettier/bin/prettier.cjs'),
      '--stdin-filepath',
      OUTPUT_PATH,
    ],
    { input: bundle, encoding: 'utf8' },
  );
}

function validateGeneratedBundle() {
  const questions = collectPublishedQuestions();
  const expected = formatBundle(renderBundle(questions));
  assert(fs.existsSync(OUTPUT_PATH), 'bundle de expansao ausente');
  assert(
    fs.readFileSync(OUTPUT_PATH, 'utf8') === expected,
    'bundle publicado diverge dos rascunhos aprovados',
  );
  return questions.length;
}

function buildRelease() {
  const questions = collectPublishedQuestions();
  const bundle = formatBundle(renderBundle(questions));
  fs.writeFileSync(OUTPUT_PATH, bundle);
  return questions.length;
}

if (require.main === module) {
  process.stdout.write(
    `t3-portugues-expansion: ${buildRelease()} questoes geradas\n`,
  );
}

module.exports = { buildRelease, validateGeneratedBundle, TOPICS };
