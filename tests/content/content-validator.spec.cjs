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
  [
    'artropodes',
    'insetos',
    'crustaceos',
    'miriapodes',
    'aracnideos',
    'equinodermos',
  ].forEach((topic) => {
    const topicQuestions = scienceQuestions.filter(
      (question) =>
        question.contentSetId === '2026-t2-v1' && question.topic === topic,
    );
    const correctIndexDistribution = [0, 0, 0, 0];

    assert.strictEqual(topicQuestions.length, 20);
    topicQuestions.forEach((question) => {
      assert.strictEqual(question.schemaVersion, 'content-v1');
      assert.strictEqual(question.reviewStatus, 'pedagogical-approved');
      assert.strictEqual(question.sourceRef.referenceId, 'escola-2026-t2');
      assert.strictEqual(question.sourceRef.section, 'Ciências');
      assert.strictEqual(Object.keys(question.wrongExplanations).length, 3);
      correctIndexDistribution[question.correctIndex] += 1;
    });
    assert.deepStrictEqual(correctIndexDistribution, [5, 5, 5, 5]);
  });

  const secondBatchScienceText = JSON.stringify(
    scienceQuestions
      .filter((question) =>
        ['crustaceos', 'miriapodes'].includes(question.topic),
      )
      .flatMap((question) => [
        question.question,
        ...question.options,
        question.explanation,
        ...Object.values(question.wrongExplanations),
      ]),
  );
  [
    'crustaceo',
    'artropode',
    'miriapode',
    'anelideo',
    'cilindrico',
    'decomposicao',
    'prejudica-lo',
    'prende-la',
    'criança é o animal',
    'corpo é a quantidade',
  ].forEach((spelling) => {
    assert.ok(
      !secondBatchScienceText.includes(spelling),
      `grafia incorreta no segundo lote de Ciências: ${spelling}`,
    );
  });

  const thirdBatchScienceText = JSON.stringify(
    scienceQuestions
      .filter((question) =>
        ['aracnideos', 'equinodermos'].includes(question.topic),
      )
      .flatMap((question) => [
        question.question,
        ...question.options,
        question.explanation,
        ...Object.values(question.wrongExplanations),
      ]),
  );
  [
    'aracnideo',
    'artropode',
    'crustaceo',
    'escorpiao',
    'ferrao',
    'cefalotorax',
    'abdomen',
    'ourico',
    'bracos',
    'aquifero',
    'regeneracao',
    'poluicao',
    'não e um',
    'porque e uma',
  ].forEach((spelling) => {
    assert.ok(
      !thirdBatchScienceText.includes(spelling),
      `grafia incorreta no terceiro lote de Ciências: ${spelling}`,
    );
  });

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

  const molluskQuestions = scienceQuestions.filter(
    (question) => question.topic === 'moluscos',
  );
  const molluskText = JSON.stringify(molluskQuestions);
  const forbiddenMolluskSpellings = [
    'achátado',
    'chámada',
    'conchá',
    'galinhá',
    'aneis',
    'anelideos',
    'cefalopodes',
    'mexilháo',
    'mexilhoes',
    'pulmoes',
    'mamiferos',
    'Caracois',
    'umido',
    'Branquias',
    'semelhánte',
    'pulmao',
    'respiratoria',
    'rochás',
    'mantem',
    'acompanhá',
    'caracteristica',
    'situacoes',
    'folhás',
    'trilhá',
    'locomocao',
    'bracos',
    'cefalopode',
    'protecao',
    'destáca',
    'cilindrico',
    'segmentado em aneis',
  ];
  assert.strictEqual(molluskQuestions.length, 33);
  forbiddenMolluskSpellings.forEach((spelling) => {
    assert.ok(
      !molluskText.includes(spelling),
      `grafia incorreta em Moluscos: ${spelling}`,
    );
  });

  const annelidQuestions = scienceQuestions.filter(
    (question) => question.topic === 'anelideos',
  );
  const annelidText = JSON.stringify(
    annelidQuestions.flatMap((question) => [
      question.question,
      ...question.options,
      question.explanation,
    ]),
  );
  const forbiddenAnnelidSpellings = [
    'anelideos',
    'aneis',
    'conchá',
    'mamiferos',
    'dao aparencia',
    'umido',
    'respiracao',
    'conchás',
    'chámados',
    'anelideo',
    'cilindrico',
    'lisó',
    'rigidas',
    'contracao',
    'formacao',
    'fotossintese',
    'locomocao',
    'producao',
    'fertil',
    'residuos',
    'issó',
    'chámado',
    'amamentacao',
    'reproducao',
    'fechádo',
    'marinhás',
    'movimentacao',
    'segmentacao',
    'tambem',
    'cutanea',
    'ferteis',
    'achátado',
  ];
  assert.strictEqual(annelidQuestions.length, 34);
  forbiddenAnnelidSpellings.forEach((spelling) => {
    assert.ok(
      !annelidText.includes(spelling),
      `grafia incorreta em Anelídeos: ${spelling}`,
    );
  });
  console.log('content-validator: ok');
}

run();
