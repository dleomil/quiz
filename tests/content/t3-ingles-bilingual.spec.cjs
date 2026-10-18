const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  loadContentSources,
  validateQuestion,
} = require('../../scripts/validate-content.cjs');
const baseline = require('../fixtures/content/english-t3-bilingual-baseline.json');

const ROOT = path.resolve(__dirname, '../..');
const topics = [
  'present-continuous',
  'places-city',
  'celebrations',
  'means-transport',
];
const {
  sha256,
} = require('../../scripts/create-t3-ingles-present-continuous.cjs');
const published = JSON.parse(
  JSON.stringify(loadContentSources(ROOT).ingles.questions),
).filter((question) => question.contentSetId === '2026-t3-v1');
const generated = [];
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-ingles-geradores-'),
);
try {
  fs.mkdirSync(path.join(temporary, 'scripts'));
  fs.copyFileSync(
    path.join(ROOT, 'scripts/validate-content.cjs'),
    path.join(temporary, 'scripts/validate-content.cjs'),
  );
  for (const topic of topics) {
    const name = `create-t3-ingles-${topic}.cjs`;
    const generator = require(path.join(ROOT, 'scripts', name));
    const questions = generator.buildQuestions();
    const draft = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, `docs/drafts/2026-t3-v1-ing-${topic}.json`),
        'utf8',
      ),
    );
    assert.deepEqual(questions, draft.questions);
    assert.equal(questions.length, 20);
    assert.deepEqual(
      published.filter((question) => question.topic === topic),
      questions.map((question) => ({ ...question, reviewStatus: 'published' })),
    );
    assert.deepEqual(
      questions.reduce((counts, question) => {
        counts[question.correctIndex] =
          (counts[question.correctIndex] || 0) + 1;
        return counts;
      }, {}),
      { 0: 5, 1: 5, 2: 5, 3: 5 },
    );
    generated.push(...questions);
    fs.copyFileSync(
      path.join(ROOT, 'scripts', name),
      path.join(temporary, 'scripts', name),
    );
    execFileSync(process.execPath, [path.join(temporary, 'scripts', name)]);
    assert.deepEqual(
      JSON.parse(
        fs.readFileSync(
          path.join(temporary, `docs/drafts/2026-t3-v1-ing-${topic}.json`),
          'utf8',
        ),
      ),
      draft,
    );
    assert.equal(fs.existsSync(path.join(temporary, 'docs/audits')), false);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

assert.equal(generated.length, 80);
assert.equal(new Set(generated.map((question) => question.id)).size, 80);
const core = generated.map((question) => {
  const result = { ...question };
  delete result.questionPt;
  delete result.version;
  delete result.reviewStatus;
  return result;
});
assert.equal(
  sha256(core),
  baseline.coreSha256,
  'Os 80 IDs, enunciados ingleses, alternativas, respostas e metadados devem ser preservados.',
);

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

for (const question of generated) {
  assert.equal(question.version, 2);
  assert.deepEqual(validateQuestion(question, 'ingles'), []);
  for (const support of [
    undefined,
    '',
    '   ',
    baseline.originalGenericSupport,
    '  ESCOLHA A ALTERNATIVA CORRETA\nPARA A FRASE OU PALAVRA APRESENTADA EM INGLES!!!  ',
    question.question,
    `  ${question.question.toUpperCase()}  `,
  ]) {
    assert.ok(
      validateQuestion({ ...question, questionPt: support }, 'ingles').some(
        (error) => error.includes('questionPt'),
      ),
      `${question.id}: apoio inválido deve ser rejeitado`,
    );
  }
  if (question.question.includes('___')) {
    const target = question.question
      .slice(question.question.indexOf(':') + 1)
      .trim();
    assert.ok(
      question.questionPt.includes(target),
      `${question.id}: frase e lacuna avaliadas devem ser mantidas`,
    );
  }
  const answer = normalize(question.options[question.correctIndex]);
  assert.ok(
    !` ${normalize(question.questionPt)} `.includes(` ${answer} `),
    `${question.id}: apoio não deve reproduzir a resposta correta em inglês`,
  );
}

const byId = new Map(generated.map((question) => [question.id, question]));
const semanticCases = [
  ['present_continuous_001', ['ação', 'acontecendo agora'], []],
  ['present_continuous_006', ['play', '-ing'], ['playing']],
  ['present_continuous_007', ['read', '-ing'], ['reading']],
  ['present_continuous_011', ['negativa', 'He ___ not sleeping.'], []],
  ['present_continuous_017', ['ordem', 'palavras'], []],
  ['places_city_001', ['livros', 'emprestados'], ['library', 'biblioteca']],
  [
    'places_city_020',
    ['places in the city'],
    ['lugares na cidade', 'lugares da cidade'],
  ],
  ['celebrations_001', ['birthday'], ['aniversário']],
  ['celebrations_004', ['present'], ['presente', 'gift']],
  ['celebrations_006', ['party'], ['festa']],
  ['celebrations_012', ['family celebration'], ['comemoração em família']],
  ['celebrations_016', ['celebrate'], ['celebrar', 'comemorar']],
  ['means_transport_011', ['driver'], ['motorista']],
  ['means_transport_012', ['passenger'], ['passageiro']],
  ['means_transport_013', ['curto', 'sem motor'], []],
  ['means_transport_020', ['means of transport'], ['meios de transporte']],
];
for (const [suffix, required, forbidden] of semanticCases) {
  const question = byId.get(`2026t3v1_ing_${suffix}`);
  assert.ok(question);
  const support = normalize(question.questionPt);
  required.forEach((text) =>
    assert.ok(
      support.includes(normalize(text)),
      `${question.id}: falta ${text}`,
    ),
  );
  forbidden.forEach((text) =>
    assert.ok(
      !support.includes(normalize(text)),
      `${question.id}: revela ${text}`,
    ),
  );
}

const one = generated[0];
for (const contentSetId of ['2026-t2-v1', '2026-t3-v1']) {
  assert.ok(
    validateQuestion(
      { ...one, contentSetId, questionPt: baseline.originalGenericSupport },
      'ingles',
    ).some((error) => error.includes('apoio generico')),
  );
}
assert.deepEqual(
  validateQuestion(
    {
      ...one,
      contentSetId: '2026-t1-v1',
      questionPt: baseline.originalGenericSupport,
    },
    'ingles',
  ),
  [],
);
assert.equal(
  byId.get('2026t3v1_ing_present_continuous_005').questionPt,
  byId.get('2026t3v1_ing_means_transport_019').questionPt,
  'Instruções equivalentes podem compartilhar uma tradução válida.',
);
console.log(
  't3-ingles-bilingual: ok (80 apoios, invariantes, lacunas, termos avaliados e regressão do apoio genérico)',
);
