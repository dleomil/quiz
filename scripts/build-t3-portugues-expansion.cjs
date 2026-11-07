const { assertPublication, validateBatch } = require('./content-delivery.cjs');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_DIRECTORY = path.join(ROOT, 'docs/drafts');
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
const FINAL_TOPICS = [
  ['usos-de-je-ji', 'Usos de JE/JI', '2026-t3-v2-pt-usos-de-je-ji.json'],
  [
    'adjetivos-patrios',
    'Adjetivos pátrios',
    '2026-t3-v2-pt-adjetivos-patrios.json',
  ],
  ['usos-do-z', 'Usos do Z', '2026-t3-v2-pt-usos-do-z.json'],
  ['pontuacao', 'Pontuação', '2026-t3-v2-pt-pontuacao.json'],
  ['usos-de-h', 'Usos de H', '2026-t3-v2-pt-usos-de-h.json'],
  ['acentuacao', 'Acentuação', '2026-t3-v2-pt-acentuacao.json'],
  ['sons-do-x', 'Sons do X', '2026-t3-v2-pt-sons-do-x.json'],
  ['dicionario', 'Dicionário', '2026-t3-v2-pt-dicionario.json'],
  [
    'uso-de-eza-e-esa',
    'Uso de EZA e ESA',
    '2026-t3-v2-pt-uso-de-eza-e-esa.json',
  ],
  [
    'encontro-consonantal',
    'Encontro consonantal',
    '2026-t3-v2-pt-encontro-consonantal.json',
  ],
];
const PUBLISHED_FINAL_TOPICS = [
  'dicionario',
  'encontro-consonantal',
  'uso-de-eza-e-esa',
];
const REQUIRED_REFERENCE_ID = 'roteiro-estudos-av-mensal-t3-2026';

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

  assertPublication(questions);
  return questions;
}

function collectFinalQuestions(
  selectedTopics = FINAL_TOPICS.map(([topic]) => topic),
) {
  const policy = JSON.parse(
    fs.readFileSync(
      path.join(ROOT, 'config/content-delivery-policy.json'),
      'utf8',
    ),
  );
  const coverage = JSON.parse(
    fs.readFileSync(
      path.join(ROOT, 'config/content-coverage-manifest.json'),
      'utf8',
    ),
  );
  const selected = FINAL_TOPICS.filter(([topic]) =>
    selectedTopics.includes(topic),
  );
  assert(selected.length === selectedTopics.length, 'tema final desconhecido');
  const questions = selected.flatMap(([topic, topicName, filename]) => {
    const draft = JSON.parse(
      fs.readFileSync(path.join(DRAFT_DIRECTORY, filename), 'utf8'),
    );
    assert(
      draft.contentSetId === '2026-t3-v2' && draft.subject === 'portugues',
      `${topic}: acervo ou materia invalida`,
    );
    assert(
      Array.isArray(draft.questions) && draft.questions.length === 20,
      `${topic}: deve ter exatamente 20 questoes`,
    );
    const checked = validateBatch(draft.questions, {
      policy,
      coverage,
      topicNames: { [topic]: topicName },
    });
    assert(checked.errors.length === 0, checked.errors.join('\n'));
    return checked.questions.map((question) => ({
      ...question,
      topicName,
      reviewStatus: 'published',
    }));
  });
  assert(
    questions.length === selected.length * 20,
    'cobertura final incompleta',
  );
  assert(
    new Set(questions.map((question) => question.id)).size ===
      selected.length * 20,
    'IDs duplicados em Português final',
  );
  return questions;
}

function renderBundle(questions) {
  const topicMeta = Object.fromEntries(
    [...TOPICS, ...FINAL_TOPICS].map(([topic, name]) => [
      topic,
      { name, icon: '📚' },
    ]),
  );
  return `/* Publicacao T3 de Portugues: expansao e provas finais aprovadas. */\n(function () {\n  const publishedQuestions = ${JSON.stringify(questions, null, 2)};\n  const source = window.QuestionsDataSources.portugues;\n  if (!source) return;\n  source.questions.push(...publishedQuestions);\n  Object.assign(source.topicMeta, ${JSON.stringify(topicMeta, null, 2)});\n})();\n`;
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
  const existingQuestions = collectPublishedQuestions();
  const finalQuestions = collectFinalQuestions(PUBLISHED_FINAL_TOPICS);
  const questions = [...existingQuestions, ...finalQuestions];
  assertPublication(questions);
  const expected = formatBundle(renderBundle(questions));
  assert(fs.existsSync(OUTPUT_PATH), 'bundle de expansao ausente');
  assert(
    fs.readFileSync(OUTPUT_PATH, 'utf8') === expected,
    'bundle publicado diverge dos rascunhos aprovados',
  );
  return existingQuestions.length;
}

function buildRelease({
  previewOnly = false,
  topics = PUBLISHED_FINAL_TOPICS,
} = {}) {
  const existingQuestions = collectPublishedQuestions();
  const finalQuestions = collectFinalQuestions(topics);
  const questions = [...existingQuestions, ...finalQuestions];
  if (!previewOnly) assertPublication(questions);
  const bundle = formatBundle(renderBundle(questions));
  fs.writeFileSync(OUTPUT_PATH, bundle);
  return questions.length;
}

if (require.main === module) {
  const previewOnly = process.argv.includes('--preview');
  const topicArg = process.argv.find((arg) => arg.startsWith('--topics='));
  const topics = topicArg ? topicArg.slice(9).split(',') : undefined;
  process.stdout.write(
    `t3-portugues-expansion: ${buildRelease({ previewOnly, topics })} questoes geradas${previewOnly ? ' para pre-visualizacao' : ''}\n`,
  );
}

module.exports = {
  buildRelease,
  validateGeneratedBundle,
  TOPICS,
  FINAL_TOPICS,
};
