window.QuestionsDataSources = window.QuestionsDataSources || {};

window.QuestionsDataSources.ingles = (function () {
  const subjectMeta = {
    name: "Inglês",
    icon: "🌍",
    available: true
  };

  const topicMeta = {
    countable_uncountable_nouns: {
      name: "Countable and Uncountable Nouns (Substantivos contáveis e incontáveis)",
      icon: "🔢"
    },
    articles_a_an: {
      name: "Articles A or An (Artigos a/an)",
      icon: "📝"
    },
    some_any: {
      name: "Some and Any (Substantivos incontáveis em sentenças interrogativas, negativas e afirmativas)",
      icon: "❓"
    },
    furniture: {
      name: "Furniture (Mobília)",
      icon: "🪑"
    },
    prepositions: {
      name: "Prepositions (Preposições)",
      icon: "📍"
    }
  };

  const questions = [];

  function addQuestion(id, topic, topicName, question, options, correctIndex, explanation) {
    questions.push({
      id,
      subject: "ingles",
      topic,
      topicName,
      question,
      options,
      correctIndex,
      explanation
    });
  }

  function pickWrongOptions(pool, correct, count) {
    return pool.filter((item) => item !== correct).slice(0, count);
  }

  function makeChoiceQuestion(options, correctIndex, explanation) {
    return { options, correctIndex, explanation };
  }

  function addPairQuestions(prefix, topic, topicName, first, second) {
    addQuestion(
      `${prefix}_${String(questions.filter((item) => item.topic === topic).length + 1).padStart(3, "0")}`,
      topic,
      topicName,
      first.question,
      first.options,
      first.correctIndex,
      first.explanation
    );
    addQuestion(
      `${prefix}_${String(questions.filter((item) => item.topic === topic).length + 1).padStart(3, "0")}`,
      topic,
      topicName,
      second.question,
      second.options,
      second.correctIndex,
      second.explanation
    );
  }

  const countableItems = [
    "apple", "book", "chair", "dog", "flower", "car", "pencil", "banana"
  ];
  const uncountableItems = [
    "milk", "water", "rice", "sugar", "bread", "cheese", "juice"
  ];
  const countableTopicName = topicMeta.countable_uncountable_nouns.name;
  const countableWrongPool = uncountableItems;
  const uncountableWrongPool = countableItems;

  [...countableItems.map((word) => ({ word, kind: "countable" })),
   ...uncountableItems.map((word) => ({ word, kind: "uncountable" }))].forEach((item) => {
    const topic = "countable_uncountable_nouns";
    const prefix = "eng_cu";
    const answer = item.kind;
    const otherKind = item.kind === "countable" ? "uncountable" : "countable";
    const secondQuestion = item.kind === "countable"
      ? "Which word is countable?"
      : "Which word is uncountable?";

    const firstQuestion = `Is "${item.word}" countable or uncountable?`;
    const firstOptions = item.kind === "countable"
      ? ["countable", "uncountable", "plural", "singular"]
      : ["countable", "uncountable", "plural", "singular"];
    const firstCorrect = item.kind === "countable" ? 0 : 1;

    const secondOptions = item.kind === "countable"
      ? [item.word, ...pickWrongOptions(countableWrongPool, item.word, 3)]
      : [item.word, ...pickWrongOptions(uncountableWrongPool, item.word, 3)];

    const first = makeChoiceQuestion(
      firstOptions,
      firstCorrect,
      `"${item.word}" is ${answer}.`
    );

    const second = makeChoiceQuestion(
      secondOptions,
      0,
      `The word "${item.word}" is ${answer}.`
    );

    addPairQuestions(prefix, topic, countableTopicName, {
      question: firstQuestion,
      options: first.options,
      correctIndex: first.correctIndex,
      explanation: first.explanation
    }, {
      question: secondQuestion,
      options: second.options,
      correctIndex: second.correctIndex,
      explanation: second.explanation
    });
  });

  const articleTopicName = topicMeta.articles_a_an.name;
  const articleItems = [
    { word: "apple", article: "an" },
    { word: "egg", article: "an" },
    { word: "orange", article: "an" },
    { word: "umbrella", article: "an" },
    { word: "elephant", article: "an" },
    { word: "hour", article: "an" },
    { word: "ice cream", article: "an" },
    { word: "owl", article: "an" },
    { word: "book", article: "a" },
    { word: "car", article: "a" },
    { word: "dog", article: "a" },
    { word: "table", article: "a" },
    { word: "house", article: "a" },
    { word: "pencil", article: "a" },
    { word: "school", article: "a" }
  ];

  articleItems.forEach((item, index) => {
    const prefix = "eng_ar";
    const topic = "articles_a_an";
    const base = index * 2 + 1;
    const articleOptions = item.article === "an"
      ? ["an", "a", "the", "some"]
      : ["a", "an", "the", "some"];

    addQuestion(
      `${prefix}_${String(base).padStart(3, "0")}`,
      topic,
      articleTopicName,
      `Choose the correct article: ___ ${item.word}.`,
      articleOptions,
      0,
      `We use "${item.article}" before "${item.word}".`
    );

    addQuestion(
      `${prefix}_${String(base + 1).padStart(3, "0")}`,
      topic,
      articleTopicName,
      `Which article is correct before "${item.word}"?`,
      ["a", "an", "the", "some"],
      item.article === "a" ? 0 : 1,
      `The correct article before "${item.word}" is "${item.article}".`
    );
  });

  const someAnyTopicName = topicMeta.some_any.name;
  const someAnyItems = [
    { sentence: "I have ___ apples.", answer: "some", kind: "affirmative" },
    { sentence: "She bought ___ bread.", answer: "some", kind: "affirmative" },
    { sentence: "We need ___ sugar.", answer: "some", kind: "affirmative" },
    { sentence: "There is ___ milk in the fridge.", answer: "some", kind: "affirmative" },
    { sentence: "Would you like ___ juice?", answer: "some", kind: "offer" },
    { sentence: "Can I have ___ water?", answer: "some", kind: "request" },
    { sentence: "There are ___ books on the desk.", answer: "some", kind: "affirmative" },
    { sentence: "Please give me ___ cheese.", answer: "some", kind: "request" },
    { sentence: "I don't have ___ pencils.", answer: "any", kind: "negative" },
    { sentence: "There isn't ___ bread.", answer: "any", kind: "negative" },
    { sentence: "We don't need ___ sugar.", answer: "any", kind: "negative" },
    { sentence: "He doesn't want ___ milk.", answer: "any", kind: "negative" },
    { sentence: "Do you have ___ books?", answer: "any", kind: "question" },
    { sentence: "Are there ___ chairs in the room?", answer: "any", kind: "question" },
    { sentence: "Is there ___ juice left?", answer: "any", kind: "question" }
  ];

  someAnyItems.forEach((item, index) => {
    const prefix = "eng_sa";
    const topic = "some_any";
    const base = index * 2 + 1;
    const secondOptions = item.answer === "some"
      ? [
          item.sentence.replace("___", "some"),
          item.sentence.replace("___", "any"),
          item.sentence.replace("___", "much"),
          item.sentence.replace("___", "many")
        ]
      : [
          item.sentence.replace("___", "any"),
          item.sentence.replace("___", "some"),
          item.sentence.replace("___", "much"),
          item.sentence.replace("___", "many")
        ];

    addQuestion(
      `${prefix}_${String(base).padStart(3, "0")}`,
      topic,
      someAnyTopicName,
      `Choose the correct word: ${item.sentence}`,
      ["some", "any", "much", "many"],
      item.answer === "some" ? 0 : 1,
      `${item.sentence.replace("___", item.answer)} uses "${item.answer}".`
    );

    addQuestion(
      `${prefix}_${String(base + 1).padStart(3, "0")}`,
      topic,
      someAnyTopicName,
      "Which sentence is correct?",
      secondOptions,
      0,
      `The correct word is "${item.answer}".`
    );
  });

  const furnitureTopicName = topicMeta.furniture.name;
  const furnitureItems = [
    { en: "chair", pt: "cadeira" },
    { en: "table", pt: "mesa" },
    { en: "bed", pt: "cama" },
    { en: "sofa", pt: "sofá" },
    { en: "desk", pt: "escrivaninha" },
    { en: "lamp", pt: "lâmpada" },
    { en: "shelf", pt: "prateleira" },
    { en: "wardrobe", pt: "guarda-roupa" },
    { en: "armchair", pt: "poltrona" },
    { en: "drawer", pt: "gaveta" },
    { en: "stool", pt: "banco" },
    { en: "mirror", pt: "espelho" },
    { en: "cabinet", pt: "armario" },
    { en: "bookshelf", pt: "estante" },
    { en: "rug", pt: "tapete" }
  ];

  const furnitureEnglishPool = furnitureItems.map((item) => item.en);
  const furniturePortuguesePool = furnitureItems.map((item) => item.pt);

  furnitureItems.forEach((item, index) => {
    const prefix = "eng_fu";
    const topic = "furniture";
    const base = index * 2 + 1;
    const otherPortuguese = pickWrongOptions(furniturePortuguesePool, item.pt, 3);
    const otherEnglish = pickWrongOptions(furnitureEnglishPool, item.en, 3);

    addQuestion(
      `${prefix}_${String(base).padStart(3, "0")}`,
      topic,
      furnitureTopicName,
      `What does "${item.en}" mean?`,
      [item.pt, ...otherPortuguese],
      0,
      `The word "${item.en}" means "${item.pt}".`
    );

    addQuestion(
      `${prefix}_${String(base + 1).padStart(3, "0")}`,
      topic,
      furnitureTopicName,
      `Which word means "${item.pt}"?`,
      [item.en, ...otherEnglish],
      0,
      `The correct word is "${item.en}".`
    );
  });

  const prepositionsTopicName = topicMeta.prepositions.name;
  const prepositionItems = [
    { sentence: "The cat is ___ the table.", preposition: "under", translation: "O gato está debaixo da mesa." },
    { sentence: "The book is ___ the desk.", preposition: "on", translation: "O livro está em cima da mesa." },
    { sentence: "The toy is ___ the box.", preposition: "in", translation: "O brinquedo está dentro da caixa." },
    { sentence: "The lamp is ___ the sofa.", preposition: "next to", translation: "A lâmpada está ao lado do sofá." },
    { sentence: "The ball is ___ the chairs.", preposition: "between", translation: "A bola está entre as cadeiras." },
    { sentence: "The picture is ___ the bed.", preposition: "above", translation: "O quadro está acima da cama." },
    { sentence: "The bag is ___ the door.", preposition: "behind", translation: "A bolsa está atrás da porta." },
    { sentence: "The chair is ___ the window.", preposition: "in front of", translation: "A cadeira está na frente da janela." },
    { sentence: "The dog is ___ the house.", preposition: "near", translation: "O cachorro está perto da casa." },
    { sentence: "The shoes are ___ the bed.", preposition: "under", translation: "Os sapatos estão debaixo da cama." },
    { sentence: "The bird is ___ the tree.", preposition: "in", translation: "O pássaro está na árvore." },
    { sentence: "The kite is ___ the sky.", preposition: "in", translation: "A pipa está no céu." },
    { sentence: "The car is ___ the garage.", preposition: "inside", translation: "O carro está dentro da garagem." },
    { sentence: "The bicycle is ___ the house.", preposition: "outside", translation: "A bicicleta está fora da casa." },
    { sentence: "The plane is ___ the clouds.", preposition: "above", translation: "O avião está acima das nuvens." }
  ];

  const prepositionPool = ["in", "on", "under", "behind", "in front of", "next to", "between", "above", "below", "near", "inside", "outside"];

  prepositionItems.forEach((item, index) => {
    const prefix = "eng_pr";
    const topic = "prepositions";
    const base = index * 2 + 1;
    const sentenceWith = (preposition) => item.sentence.replace("___", preposition);
    const wrongPrepositions = pickWrongOptions(prepositionPool, item.preposition, 3);

    addQuestion(
      `${prefix}_${String(base).padStart(3, "0")}`,
      topic,
      prepositionsTopicName,
      `Choose the correct preposition: ${item.sentence}`,
      [item.preposition, ...wrongPrepositions],
      0,
      `${sentenceWith(item.preposition)} uses "${item.preposition}".`
    );

    addQuestion(
      `${prefix}_${String(base + 1).padStart(3, "0")}`,
      topic,
      prepositionsTopicName,
      `Which sentence means "${item.translation}"?`,
      [
        sentenceWith(item.preposition),
        sentenceWith(wrongPrepositions[0]),
        sentenceWith(wrongPrepositions[1]),
        sentenceWith(wrongPrepositions[2])
      ],
      0,
      `The correct preposition is "${item.preposition}".`
    );
  });

  return {
    subjectMeta,
    topicMeta,
    questions
  };
})();
