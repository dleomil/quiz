window.QuestionsDataSources = window.QuestionsDataSources || {};

window.QuestionsDataSources.ingles = (function () {
  const subjectMeta = {
    name: 'Inglês',
    icon: '🌍',
    available: true,
  };

  const topicMeta = {
    countable_uncountable_nouns: {
      name: 'Countable and Uncountable Nouns (Substantivos contáveis e incontáveis)',
      icon: '🔢',
    },
    articles_a_an: {
      name: 'Articles A or An (Artigos a/an)',
      icon: '📝',
    },
    some_any: {
      name: 'Some and Any (Substantivos incontáveis em sentenças interrogativas, negativas e afirmativas)',
      icon: '❓',
    },
    furniture: {
      name: 'Furniture (Mobília)',
      icon: '🪑',
    },
    prepositions: {
      name: 'Prepositions (Preposições)',
      icon: '📍',
    },
    fathers_day: {
      name: "Father's Day",
      icon: '👨',
    },
    sports: {
      name: 'Sports',
      icon: '⚽',
    },
    action_verbs: {
      name: 'Action verbs',
      icon: '🏃',
    },
  };

  const questions = [];

  const englishT2TopicConfig = {
    prepositions: {
      skill: 'usar-preposicoes-em-ingles-em-contextos-simples',
      sourceTopic: 'prepositions',
    },
    fathers_day: {
      skill: 'reconhecer-vocabulario-e-mensagens-simples-sobre-fathers-day',
      sourceTopic: 'fathers-day',
    },
    sports: {
      skill: 'reconhecer-vocabulario-de-esportes-em-ingles',
      sourceTopic: 'sports',
    },
    action_verbs: {
      skill: 'reconhecer-verbos-de-acao-em-ingles',
      sourceTopic: 'action-verbs',
    },
  };

  function addQuestion(
    id,
    topic,
    topicName,
    question,
    options,
    correctIndex,
    explanation,
  ) {
    questions.push({
      id,
      subject: 'ingles',
      topic,
      topicName,
      question,
      options,
      correctIndex,
      explanation,
    });
  }

  function pickWrongOptions(pool, correct, count) {
    return pool.filter((item) => item !== correct).slice(0, count);
  }

  function makeChoiceQuestion(options, correctIndex, explanation) {
    return { options, correctIndex, explanation };
  }

  function buildEnglishT2Question(specification) {
    const [id, topic, question, correct, wrong, explanation, wrongFeedback] =
      specification;
    const targetCorrectIndex = (Number(id.slice(-3)) - 1) % 4;
    const baseOptions = [correct, ...wrong];
    const options = new Array(4);
    const wrongExplanations = {};

    baseOptions.forEach(function (option, index) {
      const rotatedIndex = (index + targetCorrectIndex) % 4;
      options[rotatedIndex] = option;
      if (index > 0) wrongExplanations[rotatedIndex] = wrongFeedback[index - 1];
    });

    return {
      schemaVersion: 'content-v1',
      id,
      contentSetId: '2026-t2-v1',
      subject: 'ingles',
      topic,
      topicName: topicMeta[topic].name,
      question,
      options,
      correctIndex: targetCorrectIndex,
      explanation,
      wrongExplanations,
      skill: englishT2TopicConfig[topic].skill,
      sourceRef: {
        referenceId: 'escola-2026-t2',
        section: 'Ingles',
        topic: englishT2TopicConfig[topic].sourceTopic,
      },
      reviewStatus: 'pedagogical-approved',
      version: 1,
    };
  }

  function addPairQuestions(prefix, topic, topicName, first, second) {
    addQuestion(
      `${prefix}_${String(questions.filter((item) => item.topic === topic).length + 1).padStart(3, '0')}`,
      topic,
      topicName,
      first.question,
      first.options,
      first.correctIndex,
      first.explanation,
    );
    addQuestion(
      `${prefix}_${String(questions.filter((item) => item.topic === topic).length + 1).padStart(3, '0')}`,
      topic,
      topicName,
      second.question,
      second.options,
      second.correctIndex,
      second.explanation,
    );
  }

  const countableItems = [
    'apple',
    'book',
    'chair',
    'dog',
    'flower',
    'car',
    'pencil',
    'banana',
  ];
  const uncountableItems = [
    'milk',
    'water',
    'rice',
    'sugar',
    'bread',
    'cheese',
    'juice',
  ];
  const countableTopicName = topicMeta.countable_uncountable_nouns.name;
  const countableWrongPool = uncountableItems;
  const uncountableWrongPool = countableItems;

  [
    ...countableItems.map((word) => ({ word, kind: 'countable' })),
    ...uncountableItems.map((word) => ({ word, kind: 'uncountable' })),
  ].forEach((item) => {
    const topic = 'countable_uncountable_nouns';
    const prefix = 'eng_cu';
    const answer = item.kind;
    const secondQuestion =
      item.kind === 'countable'
        ? 'Which word is countable?'
        : 'Which word is uncountable?';

    const firstQuestion = `Is "${item.word}" countable or uncountable?`;
    const firstOptions =
      item.kind === 'countable'
        ? ['countable', 'uncountable', 'plural', 'singular']
        : ['countable', 'uncountable', 'plural', 'singular'];
    const firstCorrect = item.kind === 'countable' ? 0 : 1;

    const secondOptions =
      item.kind === 'countable'
        ? [item.word, ...pickWrongOptions(countableWrongPool, item.word, 3)]
        : [item.word, ...pickWrongOptions(uncountableWrongPool, item.word, 3)];

    const first = makeChoiceQuestion(
      firstOptions,
      firstCorrect,
      `"${item.word}" is ${answer}.`,
    );

    const second = makeChoiceQuestion(
      secondOptions,
      0,
      `The word "${item.word}" is ${answer}.`,
    );

    addPairQuestions(
      prefix,
      topic,
      countableTopicName,
      {
        question: firstQuestion,
        options: first.options,
        correctIndex: first.correctIndex,
        explanation: first.explanation,
      },
      {
        question: secondQuestion,
        options: second.options,
        correctIndex: second.correctIndex,
        explanation: second.explanation,
      },
    );
  });

  const articleTopicName = topicMeta.articles_a_an.name;
  const articleItems = [
    { word: 'apple', article: 'an' },
    { word: 'egg', article: 'an' },
    { word: 'orange', article: 'an' },
    { word: 'umbrella', article: 'an' },
    { word: 'elephant', article: 'an' },
    { word: 'hour', article: 'an' },
    { word: 'ice cream', article: 'an' },
    { word: 'owl', article: 'an' },
    { word: 'book', article: 'a' },
    { word: 'car', article: 'a' },
    { word: 'dog', article: 'a' },
    { word: 'table', article: 'a' },
    { word: 'house', article: 'a' },
    { word: 'pencil', article: 'a' },
    { word: 'school', article: 'a' },
  ];

  articleItems.forEach((item, index) => {
    const prefix = 'eng_ar';
    const topic = 'articles_a_an';
    const base = index * 2 + 1;
    const articleOptions =
      item.article === 'an'
        ? ['an', 'a', 'the', 'some']
        : ['a', 'an', 'the', 'some'];

    addQuestion(
      `${prefix}_${String(base).padStart(3, '0')}`,
      topic,
      articleTopicName,
      `Choose the correct article: ___ ${item.word}.`,
      articleOptions,
      0,
      `We use "${item.article}" before "${item.word}".`,
    );

    addQuestion(
      `${prefix}_${String(base + 1).padStart(3, '0')}`,
      topic,
      articleTopicName,
      `Which article is correct before "${item.word}"?`,
      ['a', 'an', 'the', 'some'],
      item.article === 'a' ? 0 : 1,
      `The correct article before "${item.word}" is "${item.article}".`,
    );
  });

  const someAnyTopicName = topicMeta.some_any.name;
  const someAnyItems = [
    { sentence: 'I have ___ apples.', answer: 'some', kind: 'affirmative' },
    { sentence: 'She bought ___ bread.', answer: 'some', kind: 'affirmative' },
    { sentence: 'We need ___ sugar.', answer: 'some', kind: 'affirmative' },
    {
      sentence: 'There is ___ milk in the fridge.',
      answer: 'some',
      kind: 'affirmative',
    },
    { sentence: 'Would you like ___ juice?', answer: 'some', kind: 'offer' },
    { sentence: 'Can I have ___ water?', answer: 'some', kind: 'request' },
    {
      sentence: 'There are ___ books on the desk.',
      answer: 'some',
      kind: 'affirmative',
    },
    { sentence: 'Please give me ___ cheese.', answer: 'some', kind: 'request' },
    { sentence: "I don't have ___ pencils.", answer: 'any', kind: 'negative' },
    { sentence: "There isn't ___ bread.", answer: 'any', kind: 'negative' },
    { sentence: "We don't need ___ sugar.", answer: 'any', kind: 'negative' },
    { sentence: "He doesn't want ___ milk.", answer: 'any', kind: 'negative' },
    { sentence: 'Do you have ___ books?', answer: 'any', kind: 'question' },
    {
      sentence: 'Are there ___ chairs in the room?',
      answer: 'any',
      kind: 'question',
    },
    { sentence: 'Is there ___ juice left?', answer: 'any', kind: 'question' },
  ];

  someAnyItems.forEach((item, index) => {
    const prefix = 'eng_sa';
    const topic = 'some_any';
    const base = index * 2 + 1;
    const secondOptions =
      item.answer === 'some'
        ? [
            item.sentence.replace('___', 'some'),
            item.sentence.replace('___', 'any'),
            item.sentence.replace('___', 'much'),
            item.sentence.replace('___', 'many'),
          ]
        : [
            item.sentence.replace('___', 'any'),
            item.sentence.replace('___', 'some'),
            item.sentence.replace('___', 'much'),
            item.sentence.replace('___', 'many'),
          ];

    addQuestion(
      `${prefix}_${String(base).padStart(3, '0')}`,
      topic,
      someAnyTopicName,
      `Choose the correct word: ${item.sentence}`,
      ['some', 'any', 'much', 'many'],
      item.answer === 'some' ? 0 : 1,
      `${item.sentence.replace('___', item.answer)} uses "${item.answer}".`,
    );

    addQuestion(
      `${prefix}_${String(base + 1).padStart(3, '0')}`,
      topic,
      someAnyTopicName,
      'Which sentence is correct?',
      secondOptions,
      0,
      `The correct word is "${item.answer}".`,
    );
  });

  const furnitureTopicName = topicMeta.furniture.name;
  const furnitureItems = [
    { en: 'chair', pt: 'cadeira' },
    { en: 'table', pt: 'mesa' },
    { en: 'bed', pt: 'cama' },
    { en: 'sofa', pt: 'sofá' },
    { en: 'desk', pt: 'escrivaninha' },
    { en: 'lamp', pt: 'lâmpada' },
    { en: 'shelf', pt: 'prateleira' },
    { en: 'wardrobe', pt: 'guarda-roupa' },
    { en: 'armchair', pt: 'poltrona' },
    { en: 'drawer', pt: 'gaveta' },
    { en: 'stool', pt: 'banco' },
    { en: 'mirror', pt: 'espelho' },
    { en: 'cabinet', pt: 'armario' },
    { en: 'bookshelf', pt: 'estante' },
    { en: 'rug', pt: 'tapete' },
  ];

  const furnitureEnglishPool = furnitureItems.map((item) => item.en);
  const furniturePortuguesePool = furnitureItems.map((item) => item.pt);

  furnitureItems.forEach((item, index) => {
    const prefix = 'eng_fu';
    const topic = 'furniture';
    const base = index * 2 + 1;
    const otherPortuguese = pickWrongOptions(
      furniturePortuguesePool,
      item.pt,
      3,
    );
    const otherEnglish = pickWrongOptions(furnitureEnglishPool, item.en, 3);

    addQuestion(
      `${prefix}_${String(base).padStart(3, '0')}`,
      topic,
      furnitureTopicName,
      `What does "${item.en}" mean?`,
      [item.pt, ...otherPortuguese],
      0,
      `The word "${item.en}" means "${item.pt}".`,
    );

    addQuestion(
      `${prefix}_${String(base + 1).padStart(3, '0')}`,
      topic,
      furnitureTopicName,
      `Which word means "${item.pt}"?`,
      [item.en, ...otherEnglish],
      0,
      `The correct word is "${item.en}".`,
    );
  });

  const prepositionsTopicName = topicMeta.prepositions.name;
  const prepositionItems = [
    {
      sentence: 'The cat is ___ the table.',
      preposition: 'under',
      translation: 'O gato está debaixo da mesa.',
    },
    {
      sentence: 'The book is ___ the desk.',
      preposition: 'on',
      translation: 'O livro está em cima da mesa.',
    },
    {
      sentence: 'The toy is ___ the box.',
      preposition: 'in',
      translation: 'O brinquedo está dentro da caixa.',
    },
    {
      sentence: 'The lamp is ___ the sofa.',
      preposition: 'next to',
      translation: 'A lâmpada está ao lado do sofá.',
    },
    {
      sentence: 'The ball is ___ the chairs.',
      preposition: 'between',
      translation: 'A bola está entre as cadeiras.',
    },
    {
      sentence: 'The picture is ___ the bed.',
      preposition: 'above',
      translation: 'O quadro está acima da cama.',
    },
    {
      sentence: 'The bag is ___ the door.',
      preposition: 'behind',
      translation: 'A bolsa está atrás da porta.',
    },
    {
      sentence: 'The chair is ___ the window.',
      preposition: 'in front of',
      translation: 'A cadeira está na frente da janela.',
    },
    {
      sentence: 'The dog is ___ the house.',
      preposition: 'near',
      translation: 'O cachorro está perto da casa.',
    },
    {
      sentence: 'The shoes are ___ the bed.',
      preposition: 'under',
      translation: 'Os sapatos estão debaixo da cama.',
    },
    {
      sentence: 'The bird is ___ the tree.',
      preposition: 'in',
      translation: 'O pássaro está na árvore.',
    },
    {
      sentence: 'The kite is ___ the sky.',
      preposition: 'in',
      translation: 'A pipa está no céu.',
    },
    {
      sentence: 'The car is ___ the garage.',
      preposition: 'inside',
      translation: 'O carro está dentro da garagem.',
    },
    {
      sentence: 'The bicycle is ___ the house.',
      preposition: 'outside',
      translation: 'A bicicleta está fora da casa.',
    },
    {
      sentence: 'The plane is ___ the clouds.',
      preposition: 'above',
      translation: 'O avião está acima das nuvens.',
    },
  ];

  const prepositionPool = [
    'in',
    'on',
    'under',
    'behind',
    'in front of',
    'next to',
    'between',
    'above',
    'below',
    'near',
    'inside',
    'outside',
  ];

  prepositionItems.forEach((item, index) => {
    const prefix = 'eng_pr';
    const topic = 'prepositions';
    const base = index * 2 + 1;
    const sentenceWith = (preposition) =>
      item.sentence.replace('___', preposition);
    const wrongPrepositions = pickWrongOptions(
      prepositionPool,
      item.preposition,
      3,
    );

    addQuestion(
      `${prefix}_${String(base).padStart(3, '0')}`,
      topic,
      prepositionsTopicName,
      `Choose the correct preposition: ${item.sentence}`,
      [item.preposition, ...wrongPrepositions],
      0,
      `${sentenceWith(item.preposition)} uses "${item.preposition}".`,
    );

    addQuestion(
      `${prefix}_${String(base + 1).padStart(3, '0')}`,
      topic,
      prepositionsTopicName,
      `Which sentence means "${item.translation}"?`,
      [
        sentenceWith(item.preposition),
        sentenceWith(wrongPrepositions[0]),
        sentenceWith(wrongPrepositions[1]),
        sentenceWith(wrongPrepositions[2]),
      ],
      0,
      `The correct preposition is "${item.preposition}".`,
    );
  });

  const englishT2PrepositionQuestionSpecs = [
    [
      'ING-T2-PRE-001',
      'prepositions',
      'Complete with the word that means "dentro": The pencil is ___ the pencil case.',
      'in',
      ['on', 'under', 'behind'],
      'We use "in" when something is inside another thing.',
      [
        '"On" means on top of something.',
        '"Under" means below something.',
        '"Behind" means at the back of something.',
      ],
    ],
    [
      'ING-T2-PRE-002',
      'prepositions',
      'Complete with the word that means "em cima de": The book is ___ the table.',
      'on',
      ['in', 'under', 'between'],
      'We use "on" when something is on the surface of another thing.',
      [
        '"In" means inside something.',
        '"Under" means below something.',
        '"Between" means in the middle of two things.',
      ],
    ],
    [
      'ING-T2-PRE-003',
      'prepositions',
      'Complete with the word that means "debaixo de": The shoes are ___ the bed.',
      'under',
      ['on', 'in front of', 'next to'],
      'We use "under" when something is below another thing.',
      [
        '"On" means on top of something.',
        '"In front of" means at the front of something.',
        '"Next to" means beside something.',
      ],
    ],
    [
      'ING-T2-PRE-004',
      'prepositions',
      'Complete with the word that means "atrás de": The dog is ___ the door.',
      'behind',
      ['above', 'between', 'in'],
      'We use "behind" when something is at the back of another thing.',
      [
        '"Above" means higher than something.',
        '"Between" means in the middle of two things.',
        '"In" means inside something.',
      ],
    ],
    [
      'ING-T2-PRE-005',
      'prepositions',
      'Complete with the expression that means "ao lado de": The chair is ___ the desk.',
      'next to',
      ['under', 'above', 'inside'],
      'We use "next to" when something is beside another thing.',
      [
        '"Under" means below something.',
        '"Above" means higher than something.',
        '"Inside" means in something.',
      ],
    ],
    [
      'ING-T2-PRE-006',
      'prepositions',
      'Complete with the word that means "entre": The ball is ___ the boxes.',
      'between',
      ['behind', 'on', 'outside'],
      'We use "between" when something is in the middle of two things.',
      [
        '"Behind" means at the back of something.',
        '"On" means on top of something.',
        '"Outside" means not inside something.',
      ],
    ],
    [
      'ING-T2-PRE-007',
      'prepositions',
      'Complete with the word that means "acima de": The picture is ___ the sofa.',
      'above',
      ['under', 'in', 'near'],
      'We use "above" when something is higher than another thing.',
      [
        '"Under" means below something.',
        '"In" means inside something.',
        '"Near" means close to something.',
      ],
    ],
    [
      'ING-T2-PRE-008',
      'prepositions',
      'Complete with the word that means "perto de": The school is ___ the park.',
      'near',
      ['inside', 'under', 'between'],
      'We use "near" when something is close to another place or thing.',
      [
        '"Inside" means in something.',
        '"Under" means below something.',
        '"Between" means in the middle of two things.',
      ],
    ],
    [
      'ING-T2-PRE-009',
      'prepositions',
      'Which sentence means "O gato está em cima da cadeira"?',
      'The cat is on the chair.',
      [
        'The cat is under the chair.',
        'The cat is behind the chair.',
        'The cat is in the chair.',
      ],
      'The sentence uses "on" to show that the cat is on top of the chair.',
      [
        '"Under" means below the chair.',
        '"Behind" means at the back of the chair.',
        '"In" means inside the chair, which is not the idea here.',
      ],
    ],
    [
      'ING-T2-PRE-010',
      'prepositions',
      'Which sentence means "A bola está debaixo da mesa"?',
      'The ball is under the table.',
      [
        'The ball is on the table.',
        'The ball is next to the table.',
        'The ball is above the table.',
      ],
      'The sentence uses "under" because the ball is below the table.',
      [
        '"On" means on top of the table.',
        '"Next to" means beside the table.',
        '"Above" means higher than the table.',
      ],
    ],
    [
      'ING-T2-PRE-011',
      'prepositions',
      'Which sentence means "O brinquedo está dentro da caixa"?',
      'The toy is in the box.',
      [
        'The toy is on the box.',
        'The toy is behind the box.',
        'The toy is between the box.',
      ],
      'The sentence uses "in" because the toy is inside the box.',
      [
        '"On" means on top of the box.',
        '"Behind" means at the back of the box.',
        '"Between" needs two things around the toy.',
      ],
    ],
    [
      'ING-T2-PRE-012',
      'prepositions',
      'Which sentence means "A mochila está atrás da porta"?',
      'The backpack is behind the door.',
      [
        'The backpack is above the door.',
        'The backpack is in front of the door.',
        'The backpack is under the door.',
      ],
      'The sentence uses "behind" because the backpack is at the back of the door.',
      [
        '"Above" means higher than the door.',
        '"In front of" means "na frente da porta", not "atrás da porta".',
        '"Under" means below the door.',
      ],
    ],
    [
      'ING-T2-PRE-013',
      'prepositions',
      'Which sentence means "A menina está na frente da escola"?',
      'The girl is in front of the school.',
      [
        'The girl is behind the school.',
        'The girl is under the school.',
        'The girl is in the school bag.',
      ],
      'The sentence uses "in front of" because the girl is at the front of the school.',
      [
        '"Behind" means at the back of the school.',
        '"Under" means below something.',
        'The sentence about a school bag changes the place.',
      ],
    ],
    [
      'ING-T2-PRE-014',
      'prepositions',
      'Which sentence means "O livro está ao lado do caderno"?',
      'The book is next to the notebook.',
      [
        'The book is above the notebook.',
        'The book is inside the notebook.',
        'The book is under the notebook.',
      ],
      'The sentence uses "next to" because the book is beside the notebook.',
      [
        '"Above" means higher than the notebook.',
        '"Inside" means in something.',
        '"Under" means below the notebook.',
      ],
    ],
    [
      'ING-T2-PRE-015',
      'prepositions',
      'Which sentence means "O lápis está entre os livros"?',
      'The pencil is between the books.',
      [
        'The pencil is behind the books.',
        'The pencil is outside the books.',
        'The pencil is on the books.',
      ],
      'The sentence uses "between" because the pencil is in the middle of the books.',
      [
        '"Behind" means at the back of the books.',
        '"Outside" means not inside something.',
        '"On" means on top of the books.',
      ],
    ],
    [
      'ING-T2-PRE-016',
      'prepositions',
      'What does "behind" mean in Portuguese?',
      'atrás de',
      ['em cima de', 'dentro de', 'ao lado de'],
      '"Behind" means "atrás de".',
      [
        '"Em cima de" is "on" or "above".',
        '"Dentro de" is "in" or "inside".',
        '"Ao lado de" is "next to".',
      ],
    ],
    [
      'ING-T2-PRE-017',
      'prepositions',
      'What does "between" mean in Portuguese?',
      'entre',
      ['perto de', 'embaixo de', 'na frente de'],
      '"Between" means "entre".',
      [
        '"Perto de" is "near".',
        '"Embaixo de" is "under".',
        '"Na frente de" is "in front of".',
      ],
    ],
    [
      'ING-T2-PRE-018',
      'prepositions',
      'What does "next to" mean in Portuguese?',
      'ao lado de',
      ['atrás de', 'em cima de', 'dentro de'],
      '"Next to" means "ao lado de".',
      [
        '"Atrás de" is "behind".',
        '"Em cima de" is "on".',
        '"Dentro de" is "in" or "inside".',
      ],
    ],
    [
      'ING-T2-PRE-019',
      'prepositions',
      'Which sentence means "A biblioteca fica perto da escola"?',
      'The library is near the school.',
      [
        'The pencil is near the pencil case, inside it.',
        'The ball is near the table, under it.',
        'The picture is near the wall, above it.',
      ],
      '"Near" shows that the library is close to the school.',
      [
        'This sentence talks about a pencil and a pencil case.',
        'This sentence talks about a ball and a table.',
        'This sentence talks about a picture and a wall.',
      ],
    ],
    [
      'ING-T2-PRE-020',
      'prepositions',
      'Which sentence means "As crianças estão fora da sala de aula"?',
      'The children are outside the classroom.',
      [
        'The children are inside the classroom.',
        'The children are behind the classroom.',
        'The children are near the classroom.',
      ],
      '"Outside" shows that the children are not inside the classroom.',
      [
        '"Inside" means "dentro da sala de aula".',
        '"Behind" means "atrás da sala de aula".',
        '"Near" means "perto da sala de aula".',
      ],
    ],
  ];

  const englishT2FathersDayQuestionSpecs = [
    [
      'ING-T2-FAD-001',
      'fathers_day',
      'What does "father" mean in Portuguese?',
      'pai',
      ['mãe', 'irmã', 'professora'],
      '"Father" means "pai".',
      [
        '"Mãe" is "mother".',
        '"Irmã" is "sister".',
        '"Professora" is "teacher".',
      ],
    ],
    [
      'ING-T2-FAD-002',
      'fathers_day',
      'What does "dad" mean in Portuguese?',
      'papai',
      ['avô', 'amigo', 'caderno'],
      '"Dad" is an affectionate way to say "pai" or "papai".',
      [
        '"Avô" is "grandfather".',
        '"Amigo" is "friend".',
        '"Caderno" is "notebook".',
      ],
    ],
    [
      'ING-T2-FAD-003',
      'fathers_day',
      "Complete the Father's Day message: Happy ___ Day!",
      "Father's",
      ["Mother's", "Teacher's", "Children's"],
      'The expression is "Happy Father\'s Day!"',
      [
        '"Mother\'s" is used for Mother\'s Day.',
        '"Teacher\'s" is used for Teacher\'s Day.',
        '"Children\'s" is used for Children\'s Day.',
      ],
    ],
    [
      'ING-T2-FAD-004',
      'fathers_day',
      "Which sentence is a Father's Day message?",
      'I love you, Dad.',
      ['I need a pencil.', 'The ball is blue.', 'Open the window.'],
      '"I love you, Dad" is a caring message for Father\'s Day.',
      [
        'This sentence asks for a school object.',
        'This sentence describes a color.',
        'This sentence gives an instruction.',
      ],
    ],
    [
      'ING-T2-FAD-005',
      'fathers_day',
      'What does "gift" mean in Portuguese?',
      'presente',
      ['janela', 'comida', 'chuva'],
      '"Gift" means "presente".',
      ['"Janela" is "window".', '"Comida" is "food".', '"Chuva" is "rain".'],
    ],
    [
      'ING-T2-FAD-006',
      'fathers_day',
      'Choose the word that names a written message: I made a ___ for Dad.',
      'card',
      ['shoe', 'river', 'cloud'],
      'A "card" is a common handmade message for Father\'s Day.',
      [
        'A shoe is something we wear.',
        'A river is a natural place with water.',
        'A cloud is in the sky.',
      ],
    ],
    [
      'ING-T2-FAD-007',
      'fathers_day',
      'What does "card" mean in Portuguese?',
      'cartão',
      ['bola', 'porta', 'leite'],
      '"Card" means "cartão".',
      ['"Bola" is "ball".', '"Porta" is "door".', '"Leite" is "milk".'],
    ],
    [
      'ING-T2-FAD-008',
      'fathers_day',
      'Choose the best word: Thank you, ___.',
      'Dad',
      ['desk', 'apple', 'chair'],
      '"Dad" completes a message to a father or father figure.',
      ['"Desk" is furniture.', 'An apple is a fruit.', '"Chair" is furniture.'],
    ],
    [
      'ING-T2-FAD-009',
      'fathers_day',
      'What does "family" mean in Portuguese?',
      'família',
      ['escola', 'brinquedo', 'moeda'],
      '"Family" means "família".',
      ['"Escola" is "school".', '"Brinquedo" is "toy".', '"Moeda" is "coin".'],
    ],
    [
      'ING-T2-FAD-010',
      'fathers_day',
      'Which word means "abraço" in English?',
      'hug',
      ['hat', 'map', 'bag'],
      '"Hug" means "abraço".',
      ['"Hat" is "chapéu".', '"Map" is "mapa".', '"Bag" is "bolsa".'],
    ],
    [
      'ING-T2-FAD-011',
      'fathers_day',
      'Which word names a caring gesture?',
      'hug',
      ['map', 'desk', 'fish'],
      'A "hug" is a caring action that can be part of a Father\'s Day message.',
      [
        'A map helps us locate places.',
        'A desk is furniture.',
        'A fish is an animal.',
      ],
    ],
    [
      'ING-T2-FAD-012',
      'fathers_day',
      'What does "love" mean in Portuguese?',
      'amor',
      ['lápis', 'mesa', 'noite'],
      '"Love" means "amor".',
      ['"Lápis" is "pencil".', '"Mesa" is "table".', '"Noite" is "night".'],
    ],
    [
      'ING-T2-FAD-013',
      'fathers_day',
      'Which sentence means "Eu amo você, papai"?',
      'I love you, Dad.',
      ['I see a dog.', 'I have a book.', 'I play soccer.'],
      '"I love you, Dad" means "Eu amo você, papai".',
      [
        'This sentence means seeing a dog.',
        'This sentence means having a book.',
        'This sentence means playing soccer.',
      ],
    ],
    [
      'ING-T2-FAD-014',
      'fathers_day',
      'Which sentence means "Obrigado, papai"?',
      'Thank you, Dad.',
      ['Good night, Dad.', 'Sit down, Dad.', 'Run fast, Dad.'],
      '"Thank you, Dad" means "Obrigado, papai".',
      [
        '"Good night" is a bedtime greeting.',
        '"Sit down" is an instruction.',
        '"Run fast" is an action instruction.',
      ],
    ],
    [
      'ING-T2-FAD-015',
      'fathers_day',
      'Choose the family word: My ___ helps me.',
      'father',
      ['ruler', 'window', 'juice'],
      '"Father" can be used in a sentence about a person who helps.',
      [
        'A ruler is a school object.',
        'A window is part of a room.',
        'Juice is a drink.',
      ],
    ],
    [
      'ING-T2-FAD-016',
      'fathers_day',
      'What does "grandfather" mean in Portuguese?',
      'avô',
      ['tia', 'primo', 'vizinha'],
      '"Grandfather" means "avô".',
      ['"Tia" is "aunt".', '"Primo" is "cousin".', '"Vizinha" is "neighbor".'],
    ],
    [
      'ING-T2-FAD-017',
      'fathers_day',
      'Which word can name a father figure in a family?',
      'grandfather',
      ['pencil case', 'rainbow', 'sandwich'],
      'A grandfather can be a father figure in a family.',
      [
        'A pencil case is a school object.',
        'A rainbow is seen in the sky.',
        'A sandwich is food.',
      ],
    ],
    [
      'ING-T2-FAD-018',
      'fathers_day',
      'Choose the word used to write a message: This ___ is for my dad.',
      'card',
      ['cloud', 'river', 'sock'],
      "A card can carry a Father's Day message.",
      [
        'A cloud is in the sky.',
        'A river is a natural place with water.',
        'A sock is clothing.',
      ],
    ],
    [
      'ING-T2-FAD-019',
      'fathers_day',
      'Which phrase is polite and caring?',
      'Thank you, Dad.',
      ['Close the book.', 'It is under the bed.', 'The apple is red.'],
      '"Thank you, Dad" is a polite and caring phrase.',
      [
        'This is an instruction.',
        'This sentence uses a preposition of place.',
        'This sentence describes a fruit color.',
      ],
    ],
    [
      'ING-T2-FAD-020',
      'fathers_day',
      "Choose the best title for a Father's Day card.",
      "Happy Father's Day!",
      ['My Blue Pencil', 'The Big Table', 'A Rainy Morning'],
      '"Happy Father\'s Day!" is the correct title for this kind of card.',
      [
        'This title is about a school object.',
        'This title is about furniture.',
        'This title is about weather.',
      ],
    ],
  ];

  const englishT2SportsQuestionSpecs = [
    [
      'ING-T2-SPO-001',
      'sports',
      'What does "soccer" mean in Portuguese?',
      'futebol',
      ['natação', 'tênis', 'corrida'],
      '"Soccer" means "futebol".',
      [
        '"Natação" is "swimming".',
        '"Tênis" is "tennis".',
        '"Corrida" is "running".',
      ],
    ],
    [
      'ING-T2-SPO-002',
      'sports',
      'What does "basketball" mean in Portuguese?',
      'basquete',
      ['vôlei', 'ciclismo', 'futebol'],
      '"Basketball" means "basquete".',
      [
        '"Vôlei" is "volleyball".',
        '"Ciclismo" is "cycling".',
        '"Futebol" is "soccer".',
      ],
    ],
    [
      'ING-T2-SPO-003',
      'sports',
      'What does "volleyball" mean in Portuguese?',
      'vôlei',
      ['basquete', 'natação', 'tênis'],
      '"Volleyball" means "vôlei".',
      [
        '"Basquete" is "basketball".',
        '"Natação" is "swimming".',
        '"Tênis" is "tennis".',
      ],
    ],
    [
      'ING-T2-SPO-004',
      'sports',
      'What does "swimming" mean in Portuguese?',
      'natação',
      ['corrida', 'futebol', 'andar de skate'],
      '"Swimming" means "natação".',
      [
        '"Corrida" is "running".',
        '"Futebol" is "soccer".',
        '"Andar de skate" is "skateboarding".',
      ],
    ],
    [
      'ING-T2-SPO-005',
      'sports',
      'What does "running" mean in Portuguese?',
      'corrida',
      ['basquete', 'vôlei', 'ciclismo'],
      '"Running" means "corrida".',
      [
        '"Basquete" is "basketball".',
        '"Vôlei" is "volleyball".',
        '"Ciclismo" is "cycling".',
      ],
    ],
    [
      'ING-T2-SPO-006',
      'sports',
      'What does "tennis" mean in Portuguese?',
      'tênis',
      ['futebol', 'natação', 'corrida'],
      '"Tennis" means "tênis".',
      [
        '"Futebol" is "soccer".',
        '"Natação" is "swimming".',
        '"Corrida" is "running".',
      ],
    ],
    [
      'ING-T2-SPO-007',
      'sports',
      'What does "cycling" mean in Portuguese?',
      'ciclismo',
      ['vôlei', 'basquete', 'natação'],
      '"Cycling" means "ciclismo".',
      [
        '"Vôlei" is "volleyball".',
        '"Basquete" is "basketball".',
        '"Natação" is "swimming".',
      ],
    ],
    [
      'ING-T2-SPO-008',
      'sports',
      'What does "skateboarding" mean in Portuguese?',
      'andar de skate',
      ['tênis', 'corrida', 'futebol'],
      '"Skateboarding" means "andar de skate".',
      [
        '"Tênis" is "tennis".',
        '"Corrida" is "running".',
        '"Futebol" is "soccer".',
      ],
    ],
    [
      'ING-T2-SPO-009',
      'sports',
      'Which sport uses a ball and a goal?',
      'soccer',
      ['swimming', 'cycling', 'running'],
      'Soccer uses a ball and goals.',
      [
        'Swimming happens in water.',
        'Cycling uses a bicycle.',
        'Running does not need a goal.',
      ],
    ],
    [
      'ING-T2-SPO-010',
      'sports',
      'Which sport uses a basket?',
      'basketball',
      ['tennis', 'soccer', 'swimming'],
      'Basketball uses a basket.',
      [
        'Tennis uses a racket and a ball.',
        'Soccer uses goals.',
        'Swimming happens in water.',
      ],
    ],
    [
      'ING-T2-SPO-011',
      'sports',
      'Which sport has teams that send a ball over a net using their hands and arms?',
      'volleyball',
      ['cycling', 'running', 'skateboarding'],
      'Volleyball uses a net, and players send the ball over it with their hands and arms.',
      [
        'Cycling uses a bicycle.',
        'Running is done with the feet.',
        'Skateboarding uses a skateboard.',
      ],
    ],
    [
      'ING-T2-SPO-012',
      'sports',
      'Which sport happens in a pool?',
      'swimming',
      ['basketball', 'soccer', 'tennis'],
      'Swimming can happen in a pool.',
      [
        'Basketball is played on a court.',
        'Soccer is usually played on a field.',
        'Tennis is played on a court.',
      ],
    ],
    [
      'ING-T2-SPO-013',
      'sports',
      'Which sport uses a bicycle?',
      'cycling',
      ['volleyball', 'swimming', 'basketball'],
      'Cycling uses a bicycle.',
      [
        'Volleyball uses a ball and a net.',
        'Swimming happens in water.',
        'Basketball uses a ball and a basket.',
      ],
    ],
    [
      'ING-T2-SPO-014',
      'sports',
      'Choose the correct sentence.',
      'I play soccer.',
      ['I swim soccer.', 'I read soccer.', 'I eat soccer.'],
      '"I play soccer" is the correct sentence for this sport.',
      [
        '"Swim" is used for swimming.',
        '"Read" is not the action for soccer.',
        '"Eat" is not the action for soccer.',
      ],
    ],
    [
      'ING-T2-SPO-015',
      'sports',
      'Choose the correct sentence.',
      'I play basketball.',
      ['I drink basketball.', 'I sleep basketball.', 'I draw basketball.'],
      '"I play basketball" is the correct sentence for this sport.',
      [
        '"Drink" is not the action for basketball.',
        '"Sleep" is not the action for basketball.',
        '"Draw" is not the action for basketball.',
      ],
    ],
    [
      'ING-T2-SPO-016',
      'sports',
      'Which sentence is about a sport?',
      'I like swimming.',
      ['I like pencils.', 'I like windows.', 'I like chairs.'],
      '"I like swimming" is a sentence about a sport.',
      [
        'A pencil is a school object.',
        'A window is part of a room.',
        'A chair is furniture.',
      ],
    ],
    [
      'ING-T2-SPO-017',
      'sports',
      'Which word is a sport?',
      'tennis',
      ['notebook', 'juice', 'door'],
      '"Tennis" is a sport.',
      [
        'A notebook is a school object.',
        'Juice is a drink.',
        'A door is part of a room.',
      ],
    ],
    [
      'ING-T2-SPO-018',
      'sports',
      'Which word is a sport?',
      'running',
      ['table', 'apple', 'lamp'],
      '"Running" is a sport and a physical activity.',
      ['A table is furniture.', 'An apple is a fruit.', 'A lamp is an object.'],
    ],
    [
      'ING-T2-SPO-019',
      'sports',
      'Which sentence means "Eu gosto de vôlei"?',
      'I like volleyball.',
      ['I like cycling.', 'I like tennis.', 'I like soccer.'],
      '"I like volleyball" means "Eu gosto de vôlei".',
      [
        '"Cycling" means "ciclismo".',
        '"Tennis" means "tênis".',
        '"Soccer" means "futebol".',
      ],
    ],
    [
      'ING-T2-SPO-020',
      'sports',
      'Which sentence means "Eu jogo tênis"?',
      'I play tennis.',
      ['I play soccer.', 'I play basketball.', 'I play volleyball.'],
      '"I play tennis" means "Eu jogo tênis".',
      [
        '"Soccer" means "futebol".',
        '"Basketball" means "basquete".',
        '"Volleyball" means "vôlei".',
      ],
    ],
  ];

  const englishT2ActionVerbsQuestionSpecs = [
    [
      'ING-T2-ACT-001',
      'action_verbs',
      'What does "run" mean in Portuguese?',
      'correr',
      ['dormir', 'ler', 'beber'],
      '"Run" means "correr".',
      ['"Dormir" is "sleep".', '"Ler" is "read".', '"Beber" is "drink".'],
    ],
    [
      'ING-T2-ACT-002',
      'action_verbs',
      'What does "jump" mean in Portuguese?',
      'pular',
      ['sentar', 'comer', 'olhar'],
      '"Jump" means "pular".',
      ['"Sentar" is "sit".', '"Comer" is "eat".', '"Olhar" is "look".'],
    ],
    [
      'ING-T2-ACT-003',
      'action_verbs',
      'What does "read" mean in Portuguese?',
      'ler',
      ['correr', 'desenhar', 'abrir'],
      '"Read" means "ler".',
      ['"Correr" is "run".', '"Desenhar" is "draw".', '"Abrir" is "open".'],
    ],
    [
      'ING-T2-ACT-004',
      'action_verbs',
      'What does "write" mean in Portuguese?',
      'escrever',
      ['fechar', 'nadar', 'dançar'],
      '"Write" means "escrever".',
      ['"Fechar" is "close".', '"Nadar" is "swim".', '"Dançar" is "dance".'],
    ],
    [
      'ING-T2-ACT-005',
      'action_verbs',
      'What does "draw" mean in Portuguese?',
      'desenhar',
      ['beber', 'pular', 'escutar'],
      '"Draw" means "desenhar".',
      ['"Beber" is "drink".', '"Pular" is "jump".', '"Escutar" is "listen".'],
    ],
    [
      'ING-T2-ACT-006',
      'action_verbs',
      'What does "sing" mean in Portuguese?',
      'cantar',
      ['andar', 'sentar', 'ajudar'],
      '"Sing" means "cantar".',
      ['"Andar" is "walk".', '"Sentar" is "sit".', '"Ajudar" is "help".'],
    ],
    [
      'ING-T2-ACT-007',
      'action_verbs',
      'What does "dance" mean in Portuguese?',
      'dançar',
      ['ler', 'abrir', 'dormir'],
      '"Dance" means "dançar".',
      ['"Ler" is "read".', '"Abrir" is "open".', '"Dormir" is "sleep".'],
    ],
    [
      'ING-T2-ACT-008',
      'action_verbs',
      'What does "eat" mean in Portuguese?',
      'comer',
      ['beber', 'correr', 'escrever'],
      '"Eat" means "comer".',
      ['"Beber" is "drink".', '"Correr" is "run".', '"Escrever" is "write".'],
    ],
    [
      'ING-T2-ACT-009',
      'action_verbs',
      'What does "drink" mean in Portuguese?',
      'beber',
      ['comer', 'olhar', 'fechar'],
      '"Drink" means "beber".',
      ['"Comer" is "eat".', '"Olhar" is "look".', '"Fechar" is "close".'],
    ],
    [
      'ING-T2-ACT-010',
      'action_verbs',
      'What does "sleep" mean in Portuguese?',
      'dormir',
      ['pular', 'nadar', 'cantar'],
      '"Sleep" means "dormir".',
      ['"Pular" is "jump".', '"Nadar" is "swim".', '"Cantar" is "sing".'],
    ],
    [
      'ING-T2-ACT-011',
      'action_verbs',
      'Choose the verb that means "ler": I ___ a book.',
      'read',
      ['drink', 'jump', 'close'],
      'We use "read" with a book.',
      [
        '"Drink" means "beber", not "ler".',
        '"Jump" means "pular", not "ler".',
        '"Close" means "fechar", not "ler".',
      ],
    ],
    [
      'ING-T2-ACT-012',
      'action_verbs',
      'Choose the best verb: I ___ water.',
      'drink',
      ['draw', 'sleep', 'open'],
      'We use "drink" with water.',
      [
        'We draw pictures.',
        'We sleep when resting.',
        'We open objects like doors or books.',
      ],
    ],
    [
      'ING-T2-ACT-013',
      'action_verbs',
      'Choose the best verb: I ___ a picture.',
      'draw',
      ['eat', 'listen', 'stand'],
      'We use "draw" with a picture.',
      ['We eat food.', 'We listen to sounds.', 'We stand with the body.'],
    ],
    [
      'ING-T2-ACT-014',
      'action_verbs',
      'Choose the best verb: I ___ the door.',
      'open',
      ['sing', 'drink', 'run'],
      'We can "open" a door.',
      ['We sing songs.', 'We drink liquids.', 'We run with the body.'],
    ],
    [
      'ING-T2-ACT-015',
      'action_verbs',
      'Choose the best verb: I ___ to music.',
      'listen',
      ['eat', 'write', 'close'],
      'We use "listen" with music.',
      [
        'We eat food.',
        'We write words or sentences.',
        'We close objects like doors or books.',
      ],
    ],
    [
      'ING-T2-ACT-016',
      'action_verbs',
      'Which sentence means "Eu escrevo meu nome"?',
      'I write my name.',
      ['I run my name.', 'I drink my name.', 'I sleep my name.'],
      '"I write my name" means "Eu escrevo meu nome".',
      [
        '"Run" means "correr".',
        '"Drink" means "beber".',
        '"Sleep" means "dormir".',
      ],
    ],
    [
      'ING-T2-ACT-017',
      'action_verbs',
      'Which sentence means "Eu pulo"?',
      'I jump.',
      ['I read.', 'I eat.', 'I look.'],
      '"I jump" means "Eu pulo".',
      [
        '"I read" means "Eu leio".',
        '"I eat" means "Eu como".',
        '"I look" means "Eu olho".',
      ],
    ],
    [
      'ING-T2-ACT-018',
      'action_verbs',
      'Which sentence means "Eu canto"?',
      'I sing.',
      ['I walk.', 'I sit.', 'I help.'],
      '"I sing" means "Eu canto".',
      [
        '"I walk" means "Eu ando".',
        '"I sit" means "Eu sento".',
        '"I help" means "Eu ajudo".',
      ],
    ],
    [
      'ING-T2-ACT-019',
      'action_verbs',
      'Which word shows the action in "I swim in the pool"?',
      'swim',
      ['I', 'the', 'pool'],
      '"Swim" shows the action in the sentence.',
      [
        '"I" names who performs the action.',
        '"The" is an article.',
        '"Pool" names a place.',
      ],
    ],
    [
      'ING-T2-ACT-020',
      'action_verbs',
      'Which word is an action verb?',
      'help',
      ['chair', 'window', 'milk'],
      '"Help" is an action verb.',
      [
        'A chair is furniture.',
        'A window is part of a room.',
        'Milk is a drink.',
      ],
    ],
  ];

  questions.push(
    ...englishT2PrepositionQuestionSpecs.map(buildEnglishT2Question),
    ...englishT2FathersDayQuestionSpecs.map(buildEnglishT2Question),
    ...englishT2SportsQuestionSpecs.map(buildEnglishT2Question),
    ...englishT2ActionVerbsQuestionSpecs.map(buildEnglishT2Question),
  );

  return {
    subjectMeta,
    topicMeta,
    questions,
  };
})();
