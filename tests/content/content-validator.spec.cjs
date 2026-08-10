const assert = require('node:assert/strict');
const path = require('node:path');
const {
  validateContentSources,
  validateRepositoryContent,
} = require('../../scripts/validate-content.cjs');

function validContentV1Question(overrides) {
  return Object.assign(
    {
      schemaVersion: 'content-v1',
      id: 'mat-t2-medidas-001',
      contentSetId: '2026-t2-v1',
      subject: 'matematica',
      topic: 'medidas_capacidade_massa',
      question: 'Qual medida usamos para liquido?',
      options: ['Litro', 'Metro', 'Hora', 'Grama'],
      correctIndex: 0,
      explanation: 'Litro mede quantidade de liquido.',
      wrongExplanations: {
        1: 'Metro mede comprimento.',
        2: 'Hora mede tempo.',
        3: 'Grama mede massa.',
      },
      skill: 'medidas-de-capacidade',
      sourceRef: {
        referenceId: 'escola-2026-t2',
        section: 'Matematica',
        page: '12',
      },
      reviewStatus: 'pedagogical-approved',
      version: 1,
    },
    overrides,
  );
}

function validateQuestions(questions) {
  return validateContentSources({ matematica: { questions } });
}

function loadScienceQuestions() {
  const scienceModulePath = path.join(
    __dirname,
    '..',
    '..',
    'js',
    'data',
    'subjects',
    'ciencias.js',
  );
  global.window = {};
  delete require.cache[require.resolve(scienceModulePath)];
  require(scienceModulePath);
  return global.window.QuestionsDataSources.ciencias.questions;
}

function run() {
  assert.deepStrictEqual(validateQuestions([validContentV1Question()]), []);

  assert.deepStrictEqual(
    validateQuestions([
      {
        id: 'legacy-001',
        subject: 'matematica',
        topic: 'medidas_capacidade_massa',
        question: 'Qual medida usamos para liquido?',
        options: ['Litro', 'Metro', 'Hora', 'Grama'],
        correctIndex: 0,
        explanation: 'Litro mede quantidade de liquido.',
      },
    ]),
    [],
  );

  const invalidErrors = validateQuestions([
    validContentV1Question({
      options: ['Litro', ' metro ', 'Metro', 'Grama'],
      correctIndex: 4,
      sourceRef: { referenceId: '', section: 'Matematica', page: '12' },
      wrongExplanations: { 1: 'Metro mede comprimento.' },
    }),
  ]);
  assert.ok(
    invalidErrors.some((error) => error.includes('alternativas duplicadas')),
  );
  assert.ok(invalidErrors.some((error) => error.includes('correctIndex')));
  assert.ok(
    invalidErrors.some((error) =>
      error.includes('sourceRef exige referenceId'),
    ),
  );
  assert.ok(invalidErrors.some((error) => error.includes('indice 2')));

  const duplicateErrors = validateQuestions([
    validContentV1Question(),
    validContentV1Question(),
  ]);
  assert.ok(duplicateErrors.some((error) => error.includes('id duplicado')));

  assert.deepStrictEqual(
    validateRepositoryContent(path.join(__dirname, '..', '..')),
    [],
  );

  const scienceQuestions = loadScienceQuestions();
  const platyhelminthQuestions = scienceQuestions.filter(
    (question) => question.topic === 'platelmintos',
  );
  const platyhelminthText = JSON.stringify(platyhelminthQuestions);
  const forbiddenSpellings = [
    'achátado',
    'conchá',
    'rochás',
    'chámado',
    'chámada',
    'folhás',
    'semelhántes',
    'caracteristica',
    'Planarias',
    'condicoes',
    'reproducao',
    'doenca',
    'basico',
    'descalco',
    'osseo',
    'cabeca',
    'regiao',
    'mamifero',
    'biologico',
    'cilios',
    'superficies',
    'umidas',
    'cilindrico',
    'pulmao',
    'substancias',
    'parasitaria',
  ];
  assert.strictEqual(platyhelminthQuestions.length, 33);
  forbiddenSpellings.forEach((spelling) => {
    assert.ok(
      !platyhelminthText.includes(spelling),
      `grafia incorreta em Platelmintos: ${spelling}`,
    );
  });

  const nematodeQuestions = scienceQuestions.filter(
    (question) => question.topic === 'nematoides',
  );
  const nematodeText = JSON.stringify(nematodeQuestions);
  const forbiddenNematodeSpellings = [
    'achátado',
    'conchá',
    'cilindrico',
    'mamiferos',
    'folhá',
    'decomposicao',
    'producao',
    'formacao',
    'construcao',
    'oxiuro',
    'rochás',
    'chámado',
    'anelideos',
    'aneis',
    'ancilostomo',
    'amarelao',
    'doenca',
    'calcados',
    'penetracao',
    'funcao',
    'diferenca',
    'cuticula',
    'fotossintese',
    'amamentacao',
    'acompanhá',
    'proprias',
    'pontuacao',
    'estár',
    'tambem',
  ];
  assert.strictEqual(nematodeQuestions.length, 33);
  forbiddenNematodeSpellings.forEach((spelling) => {
    assert.ok(
      !nematodeText.includes(spelling),
      `grafia incorreta em Nematoides: ${spelling}`,
    );
  });
  console.log('content-validator: ok');
}

run();
