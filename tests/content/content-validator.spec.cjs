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
        topic: 'medidas-capacidade-massa',
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

function loadSubjectQuestions(subject) {
  const subjectModulePath = path.join(
    __dirname,
    '..',
    '..',
    'js',
    'data',
    'subjects',
    `${subject}.js`,
  );
  global.window = {};
  delete require.cache[require.resolve(subjectModulePath)];
  require(subjectModulePath);
  return global.window.QuestionsDataSources[subject].questions;
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
      sourceRef: {
        referenceId: '',
        section: 'Matematica',
        topic: 'medidas-capacidade-massa',
      },
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

  const missingTopicErrors = validateQuestions([
    validContentV1Question({
      sourceRef: {
        referenceId: 'escola-2026-t2',
        section: 'Matematica',
      },
    }),
  ]);
  assert.ok(
    missingTopicErrors.some((error) =>
      error.includes('sourceRef exige topic (ou page legado)'),
    ),
  );

  const duplicateErrors = validateQuestions([
    validContentV1Question(),
    validContentV1Question(),
  ]);
  assert.ok(duplicateErrors.some((error) => error.includes('id duplicado')));

  assert.deepStrictEqual(
    validateRepositoryContent(path.join(__dirname, '..', '..')),
    [],
  );

  const scienceQuestions = loadSubjectQuestions('ciencias');
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

  const geographyQuestions = loadSubjectQuestions('geografia');
  // Confirma compatibilidade temporaria com referencias legadas por pagina.
  [
    { topic: 'cartografia', page: '53' },
    { topic: 'representacoes_cartograficas', page: '54' },
    { topic: 'mapas_representacao_espaco', page: '58' },
  ].forEach(({ topic, page }) => {
    const topicQuestions = geographyQuestions.filter(
      (question) =>
        question.contentSetId === '2026-t2-v1' && question.topic === topic,
    );
    const correctIndexDistribution = [0, 0, 0, 0];

    assert.strictEqual(topicQuestions.length, 20);
    topicQuestions.forEach((question) => {
      assert.strictEqual(question.schemaVersion, 'content-v1');
      assert.strictEqual(question.reviewStatus, 'pedagogical-approved');
      assert.strictEqual(question.sourceRef.referenceId, 'escola-2026-t2');
      assert.strictEqual(question.sourceRef.section, 'Geografia');
      assert.strictEqual(question.sourceRef.page, page);
      assert.strictEqual(Object.keys(question.wrongExplanations).length, 3);
      Object.values(question.wrongExplanations).forEach((feedback) => {
        assert.match(feedback, /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/);
        assert.match(feedback, /[.!?]$/);
      });
      correctIndexDistribution[question.correctIndex] += 1;
    });
    assert.deepStrictEqual(correctIndexDistribution, [5, 5, 5, 5]);
  });

  const geographyT2VisibleText = JSON.stringify(
    geographyQuestions
      .filter((question) => question.contentSetId === '2026-t2-v1')
      .flatMap((question) => [
        question.question,
        ...question.options,
        question.explanation,
        ...Object.values(question.wrongExplanations),
      ]),
  );
  [
    'representacao',
    'representacoes',
    'informacao',
    'informacoes',
    'simbolo',
    'simbolos',
    'cartografo',
    'titulo',
    'funcao',
    'relacao',
    'territorio',
    'tematico',
    'distancia',
  ].forEach((spelling) => {
    assert.ok(
      !geographyT2VisibleText.includes(spelling),
      `grafia incorreta em Geografia: ${spelling}`,
    );
  });

  const englishQuestions = loadSubjectQuestions('ingles');
  const englishT2Questions = englishQuestions.filter(
    (question) => question.contentSetId === '2026-t2-v1',
  );
  ['prepositions', 'fathers_day', 'sports', 'action_verbs'].forEach((topic) => {
    const topicQuestions = englishT2Questions.filter(
      (question) => question.topic === topic,
    );
    const correctIndexDistribution = [0, 0, 0, 0];

    assert.strictEqual(topicQuestions.length, 20);
    topicQuestions.forEach((question) => {
      assert.strictEqual(question.schemaVersion, 'content-v1');
      assert.strictEqual(question.reviewStatus, 'pedagogical-approved');
      assert.strictEqual(question.sourceRef.referenceId, 'escola-2026-t2');
      assert.strictEqual(question.sourceRef.section, 'Ingles');
      assert.strictEqual(Object.keys(question.wrongExplanations).length, 3);
      correctIndexDistribution[question.correctIndex] += 1;
    });
    assert.deepStrictEqual(correctIndexDistribution, [5, 5, 5, 5]);
  });

  const englishT2ById = new Map(
    englishT2Questions.map((question) => [question.id, question]),
  );
  [
    [
      'ING-T2-PRE-001',
      'Complete with the word that means "dentro": The pencil is ___ the pencil case.',
    ],
    [
      'ING-T2-PRE-019',
      'Which sentence means "A biblioteca fica perto da escola"?',
    ],
    [
      'ING-T2-PRE-020',
      'Which sentence means "As crianças estão fora da sala de aula"?',
    ],
    ['ING-T2-FAD-003', "Complete the Father's Day message: Happy ___ Day!"],
    ['ING-T2-FAD-011', 'Which word names a caring gesture?'],
    ['ING-T2-FAD-015', 'Choose the family word: My ___ helps me.'],
    ['ING-T2-SPO-016', 'Which sentence is about a sport?'],
    ['ING-T2-ACT-011', 'Choose the verb that means "ler": I ___ a book.'],
    ['ING-T2-ACT-019', 'Which word shows the action in "I swim in the pool"?'],
  ].forEach(([id, expectedQuestion]) => {
    assert.strictEqual(englishT2ById.get(id).question, expectedQuestion);
  });

  assert.ok(
    englishT2ById.get('ING-T2-FAD-002').options.includes('avô'),
    'traducao de grandfather deve estar acentuada',
  );
  assert.strictEqual(
    englishT2ById.get('ING-T2-SPO-008').options[
      englishT2ById.get('ING-T2-SPO-008').correctIndex
    ],
    'andar de skate',
  );
  assert.ok(
    englishT2ById.get('ING-T2-SPO-004').options.includes('andar de skate'),
    'skateboarding deve ser traduzido como andar de skate',
  );
  assert.deepStrictEqual(
    [...englishT2ById.get('ING-T2-PRE-020').options].sort(),
    [
      'The children are behind the classroom.',
      'The children are inside the classroom.',
      'The children are near the classroom.',
      'The children are outside the classroom.',
    ].sort(),
  );

  const englishT2VisibleText = JSON.stringify(
    englishT2Questions.flatMap((question) => [
      question.question,
      ...question.options,
      question.explanation,
      ...Object.values(question.wrongExplanations),
    ]),
  ).toLowerCase();
  [
    ' esta ',
    ' atras ',
    '"atras de"',
    'mae',
    'irma',
    'vovo',
    'cartao',
    'familia',
    'abraco',
    'chapeu',
    'lapis',
    'voce',
    'natacao',
    'tenis',
    'volei',
    'dancar',
    'before the door',
    'an apple is fruit',
    'the usual action with a book',
    'outside the pencil case',
    '"skate" is "skateboarding"',
  ].forEach((outdatedText) => {
    assert.ok(
      !englishT2VisibleText.includes(outdatedText),
      `texto inadequado em Ingles: ${outdatedText}`,
    );
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
