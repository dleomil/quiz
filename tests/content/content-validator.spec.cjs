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

  const portugueseQuestions = loadSubjectQuestions('portugues');
  const portugueseT2Questions = portugueseQuestions.filter(
    (question) => question.contentSetId === '2026-t2-v1',
  );
  [
    'usos_de_l_e_u',
    'palavras_com_ce_e_ci',
    'verbos_i',
    'pronomes_pessoais_tratamento',
    'verbos_ii',
    'palavras_semelhantes',
  ].forEach((topic) => {
    const topicQuestions = portugueseT2Questions.filter(
      (question) => question.topic === topic,
    );
    assert.strictEqual(topicQuestions.length, 20);
    topicQuestions.forEach((question) => {
      assert.strictEqual(question.schemaVersion, 'content-v1');
      assert.strictEqual(question.reviewStatus, 'pedagogical-approved');
      assert.strictEqual(question.sourceRef.referenceId, 'escola-2026-t2');
      assert.strictEqual(Object.keys(question.wrongExplanations).length, 3);
    });
  });

  const portugueseT2ById = new Map(
    portugueseT2Questions.map((question) => [question.id, question]),
  );
  [
    ['pt_t2_lu_006', 'Complete: Ganhei um ane__ de presente.'],
    ['pt_t2_lu_008', 'Complete: O barco navegou pe__o rio.'],
    ['pt_t2_ceci_001', 'Complete: A ____ do filme foi engraçada.'],
    ['pt_t2_ceci_006', 'Complete: A ____ canta alto no verão.'],
    ['pt_t2_ceci_010', 'Complete: A ____ estuda os seres vivos.'],
    ['pt_t2_ceci_020', 'Complete: O ____ correu pelo campo.'],
    [
      'pt_t2_pron_015',
      'Qual frase pergunta diretamente a uma mulher adulta, de modo respeitoso, se ela chegou cedo?',
    ],
    [
      'pt_t2_pron_018',
      'Ao autorizar dois alunos a entrar, a professora disse diretamente a eles: “__ podem entrar.”',
    ],
    [
      'pt_t2_pron_019',
      'Ao oferecer água diretamente à própria diretora, complete a fala: “__ gostaria de água?”',
    ],
    ['pt_t2_vii_004', 'Complete: O médico __ do paciente.'],
    [
      'pt_t2_vii_018',
      'Complete: Durante um resgate, o bombeiro __ as pessoas em perigo.',
    ],
    ['pt_t2_vii_020', 'Complete: O fotógrafo __ uma paisagem.'],
    [
      'PT-T2-SEM-002',
      'Em "O atleta foi veloz durante a corrida", qual palavra tem sentido semelhante a "veloz"?',
    ],
    [
      'PT-T2-SEM-012',
      'Em "A família escolheu o caminho mais curto", qual expressão pode substituir "escolheu o" sem repetir o artigo?',
    ],
  ].forEach(([id, expectedQuestion]) => {
    assert.strictEqual(portugueseT2ById.get(id).question, expectedQuestion);
  });

  assert.ok(
    !portugueseT2ById.get('pt_t2_lu_007').options.includes('a'),
    'latiu nao pode ter uma segunda resposta defensavel',
  );
  assert.ok(
    !portugueseT2ById.get('pt_t2_lu_011').options.includes('a'),
    'ouviu nao pode ter uma segunda resposta defensavel',
  );
  assert.ok(
    !portugueseT2ById.get('pt_t2_lu_013').options.includes('a'),
    'sorriu nao pode ter uma segunda resposta defensavel',
  );
  assert.strictEqual(
    portugueseT2ById.get('pt_t2_lu_019').options[
      portugueseT2ById.get('pt_t2_lu_019').correctIndex
    ],
    'ú',
  );
  assert.ok(
    portugueseT2ById
      .get('pt_t2_pron_016')
      .options.includes('O senhor chegou cedo?'),
    'a forma de tratamento deve incluir o artigo',
  );
  assert.ok(
    portugueseT2ById
      .get('pt_t2_ceci_010')
      .explanation.includes('C-I-Ê-N-C-I-A'),
    'a explicacao deve diferenciar toda a grafia de ciencia',
  );

  portugueseT2Questions
    .filter((question) => question.topic === 'palavras_semelhantes')
    .flatMap((question) => Object.values(question.wrongExplanations))
    .forEach((feedback) => {
      assert.match(feedback, /^["A-ZÁÉÍÓÚÂÊÔÃÕÇ“]/);
      assert.match(feedback, /[.!?]$/);
    });

  const portugueseT2VisibleText = JSON.stringify(
    portugueseT2Questions.flatMap((question) => [
      question.question,
      ...question.options,
      question.explanation,
      ...Object.values(question.wrongExplanations),
    ]),
  );
  [
    'present__',
    'pe__ rio',
    'A __na',
    'A __dade',
    'A __bola',
    'O __real',
    'A __noura',
    'A __garra',
    'A __ncia',
    'A __reja',
    'usou __mento',
    'certificado de parabéns',
    'O médico __ o paciente',
    'fotografa uma imagem',
    'O corredor foi veloz',
    'Ouvuo',
    'Sorriel',
    'Senhor, chegou cedo?',
    'Complete: O bombeiro __ as pessoas em perigo.',
    'optou pelo o caminho',
  ].forEach((outdatedText) => {
    assert.ok(
      !portugueseT2VisibleText.includes(outdatedText),
      `texto inadequado em Portugues: ${outdatedText}`,
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
