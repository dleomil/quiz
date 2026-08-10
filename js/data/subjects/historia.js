window.QuestionsDataSources = window.QuestionsDataSources || {};

window.QuestionsDataSources.historia = (function () {
  const subjectMeta = {
    name: 'História',
    icon: '🏛️',
    available: true,
  };

  const topicMeta = {
    o_povo_e_a_cultura_do_brasil: {
      name: 'O povo e a cultura do Brasil',
      icon: '🎭',
    },
    nossas_origens_os_indigenas: {
      name: 'Nossas origens: os indígenas',
      icon: '🪶',
    },
    os_indigenas_e_a_relacao_com_os_europeus: {
      name: 'Os indígenas e a relação com os europeus',
      icon: '⛵',
    },
    a_escravizacao_indigena: {
      name: 'A escravização indígena',
      icon: '⛓️',
    },
    os_indigenas_hoje: {
      name: 'Os indígenas hoje',
      icon: '🌱',
    },
    atividades_adicionais: {
      name: 'Atividades adicionais',
      icon: '✅',
    },
  };

  const questions = [];

  const historyT2TopicConfig = {
    africa_origens: {
      name: 'Nossas origens: a Africa',
      skill: 'compreender-diversidade-e-historia-das-origens-africanas',
      sourceTopic: 'nossas-origens-africa',
    },
    grupos_linguisticos_africanos: {
      name: 'Os principais grupos linguisticos africanos',
      skill: 'reconhecer-diversidade-linguistica-africana',
      sourceTopic: 'grupos-linguisticos-africanos',
    },
    africanos_escravidao: {
      name: 'Os africanos e a escravidao',
      skill: 'compreender-escravizacao-resistencia-e-direitos',
      sourceTopic: 'africanos-e-escravidao',
    },
    afrodescendentes_atualidade: {
      name: 'Os afrodescendentes na atualidade',
      skill: 'reconhecer-afrodescendentes-na-sociedade-atual',
      sourceTopic: 'afrodescendentes-atualidade',
    },
  };

  function buildHistoryT2Question(question) {
    const config = historyT2TopicConfig[question.topic];
    const correctIndex = question.options.indexOf(question.correct);
    const wrongExplanations = {};
    let wrongIndex = 0;

    question.options.forEach(function (_, index) {
      if (index !== correctIndex) {
        wrongExplanations[index] = question.wrong[wrongIndex];
        wrongIndex += 1;
      }
    });

    return {
      schemaVersion: 'content-v1',
      id: question.id,
      contentSetId: '2026-t2-v1',
      subject: 'historia',
      topic: question.topic,
      topicName: config.name,
      question: question.question,
      options: question.options,
      correctIndex,
      explanation: question.explanation,
      wrongExplanations,
      skill: config.skill,
      sourceRef: {
        referenceId: 'escola-2026-t2',
        section: 'Historia',
        topic: config.sourceTopic,
      },
      reviewStatus: 'pedagogical-approved',
      version: 1,
    };
  }

  function buildOptions(correct, wrongs, seed) {
    const base = [
      correct,
      ...wrongs.filter((value) => value !== correct).slice(0, 3),
    ];
    const options = [];
    base.forEach((option, index) => {
      options[(index + seed) % 4] = option;
    });
    return {
      options,
      correctIndex: options.indexOf(correct),
    };
  }

  function addQuestion(
    prefix,
    number,
    topic,
    topicName,
    question,
    correct,
    wrongs,
    explanation,
    seed,
  ) {
    const built = buildOptions(correct, wrongs, seed);
    questions.push({
      id: `${prefix}_${String(number).padStart(3, '0')}`,
      subject: 'historia',
      topic,
      topicName,
      question,
      options: built.options,
      correctIndex: built.correctIndex,
      explanation,
    });
  }

  function addTopic(topic, topicName, prefix, facts) {
    let number = 1;
    const terms = facts.map((fact) => fact.term);
    const definitions = facts.map((fact) => fact.definition);
    const examples = facts.map((fact) => fact.example);
    const importances = facts.map((fact) => fact.importance);
    const statements = facts.map((fact) => fact.statement);

    facts.forEach((fact, index) => {
      const wrongTerms = terms.filter((term) => term !== fact.term);
      const wrongDefinitions = definitions.filter(
        (definition) => definition !== fact.definition,
      );
      const wrongExamples = examples.filter(
        (example) => example !== fact.example,
      );
      const wrongImportances = importances.filter(
        (importance) => importance !== fact.importance,
      );
      const wrongStatements = statements.filter(
        (statement) => statement !== fact.statement,
      );

      addQuestion(
        prefix,
        number++,
        topic,
        topicName,
        `Qual termo combina com esta descrição? ${fact.definition}`,
        fact.term,
        wrongTerms,
        `O termo correto é "${fact.term}".`,
        index,
      );

      addQuestion(
        prefix,
        number++,
        topic,
        topicName,
        `O que melhor explica "${fact.term}"?`,
        fact.definition,
        wrongDefinitions,
        `A explicação correta para "${fact.term}" é "${fact.definition}".`,
        index + 1,
      );

      addQuestion(
        prefix,
        number++,
        topic,
        topicName,
        `Qual é um exemplo de ${fact.term}?`,
        fact.example,
        wrongExamples,
        `O exemplo correto é "${fact.example}".`,
        index + 2,
      );

      addQuestion(
        prefix,
        number++,
        topic,
        topicName,
        `Por que ${fact.term} é importante?`,
        fact.importance,
        wrongImportances,
        `A ideia correta é: ${fact.importance}.`,
        index + 3,
      );

      addQuestion(
        prefix,
        number++,
        topic,
        topicName,
        `Qual frase está correta sobre ${fact.term}?`,
        fact.statement,
        wrongStatements,
        `A frase correta é: ${fact.statement}.`,
        index + 4,
      );
    });
  }

  addTopic(
    'o_povo_e_a_cultura_do_brasil',
    topicMeta.o_povo_e_a_cultura_do_brasil.name,
    'his_bc',
    [
      {
        term: 'diversidade cultural',
        definition:
          'a convivência de muitos costumes, festas, músicas e jeitos de viver',
        example: 'festas, comidas e músicas diferentes em cada região',
        importance: 'mostra que o Brasil tem muitos modos de viver',
        statement:
          'O Brasil tem culturas variadas e nenhum povo é igual ao outro.',
      },
      {
        term: 'tradições',
        definition: 'costumes transmitidos ao longo do tempo',
        example: 'festas juninas, cantigas e danças',
        importance: 'ajudam a guardar a memória de um grupo',
        statement: 'Tradições podem ser passadas de geração em geração.',
      },
      {
        term: 'costumes regionais',
        definition: 'hábitos que mudam de uma região para outra',
        example: 'comidas, sotaques e festas diferentes',
        importance: 'mostram a diversidade do país',
        statement: 'As regiões do Brasil podem ter costumes diferentes.',
      },
      {
        term: 'influências indígenas, africanas e europeias',
        definition: 'contribuições de vários povos na cultura brasileira',
        example: 'palavras, comidas, músicas e festas',
        importance: 'ajudam a explicar a formação do povo brasileiro',
        statement: 'A cultura do Brasil recebeu influências de vários povos.',
      },
      {
        term: 'cultura brasileira',
        definition:
          'o conjunto de costumes, valores, festas e conhecimentos do povo brasileiro',
        example: 'música, culinária, brincadeiras e histórias',
        importance: 'faz parte da identidade do país',
        statement:
          'A cultura brasileira é construída por muitas pessoas ao longo do tempo.',
      },
    ],
  );

  addTopic(
    'nossas_origens_os_indigenas',
    topicMeta.nossas_origens_os_indigenas.name,
    'his_io',
    [
      {
        term: 'os povos indígenas já viviam no território antes de 1500',
        definition:
          'os povos indígenas já moravam no Brasil antes da chegada dos portugueses',
        example: 'habitavam florestas, rios, litorais e outros lugares',
        importance:
          'ajuda a entender que a história do Brasil começa antes de 1500',
        statement:
          'Os indígenas estavam aqui antes da chegada dos portugueses.',
      },
      {
        term: 'muitos povos e muitas línguas',
        definition:
          'existem muitos povos indígenas, com línguas e costumes diferentes',
        example: 'cada povo pode ter sua própria língua e tradição',
        importance: 'mostra a diversidade indígena',
        statement: 'Não existe um único povo indígena igual em todo o Brasil.',
      },
      {
        term: 'relação com a natureza',
        definition:
          'muitos povos indígenas têm relação próxima com rios, matas e terras',
        example: 'pesca, plantio e coleta',
        importance: 'ajuda a viver com cuidado no território',
        statement: 'A natureza é muito importante para muitos povos indígenas.',
      },
      {
        term: 'conhecimentos sobre plantas e território',
        definition: 'saberes sobre plantas, remédios, caça e cultivo',
        example: 'conhecer plantas medicinais e alimentos da floresta',
        importance: 'é um conhecimento valioso para a vida',
        statement:
          'Os indígenas possuem muitos conhecimentos sobre a natureza.',
      },
      {
        term: 'tradições e identidade',
        definition:
          'costumes, cantos, rituais e modos de viver transmitidos entre gerações',
        example: 'histórias contadas pelos mais velhos',
        importance: 'mantém viva a identidade do povo',
        statement: 'As tradições ajudam a preservar a cultura indígena.',
      },
    ],
  );

  addTopic(
    'os_indigenas_e_a_relacao_com_os_europeus',
    topicMeta.os_indigenas_e_a_relacao_com_os_europeus.name,
    'his_ie',
    [
      {
        term: 'primeiro contato em 1500',
        definition:
          'o encontro entre indígenas e portugueses após a chegada de 1500',
        example: 'a chegada das caravelas ao litoral',
        importance: 'marcou o início de mudanças profundas',
        statement: 'O contato com os europeus começou em 1500.',
      },
      {
        term: 'troca de conhecimentos',
        definition: 'troca de objetos, palavras e saberes entre povos',
        example: 'aprendizados sobre plantas, ferramentas e navegação',
        importance: 'mostra que nem tudo foi conflito',
        statement:
          'Houve trocas de conhecimentos no contato entre indígenas e europeus.',
      },
      {
        term: 'conflitos e doenças',
        definition: 'guerras, violência e doenças trazidas pelos europeus',
        example: 'disputas por terras e epidemias',
        importance: 'mostra que o contato teve consequências graves',
        statement: 'O contato também trouxe conflitos e doenças.',
      },
      {
        term: 'interesse por terras e recursos',
        definition:
          'o desejo europeu por terras, madeira, ouro e outros recursos',
        example: 'ocupação de territórios indígenas',
        importance: 'ajuda a explicar a colonização',
        statement: 'Muitos europeus queriam terras e recursos no território.',
      },
      {
        term: 'mudanças na vida indígena',
        definition:
          'transformações no modo de viver dos povos indígenas depois do contato',
        example: 'perda de terras e alterações de rotina',
        importance: 'mostra como a colonização afetou os povos indígenas',
        statement: 'O contato mudou a vida de muitos povos indígenas.',
      },
    ],
  );

  addTopic(
    'a_escravizacao_indigena',
    topicMeta.a_escravizacao_indigena.name,
    'his_es',
    [
      {
        term: 'trabalho forçado',
        definition: 'trabalho imposto aos indígenas sem liberdade',
        example: 'serviços obrigatórios em povoados e missões',
        importance: 'foi uma forma de violência',
        statement:
          'A escravização indígena obrigava pessoas a trabalhar sem escolha.',
      },
      {
        term: 'expedições de captura',
        definition: 'expedições que capturavam indígenas para trabalho forçado',
        example: 'bandeiras e entradas na colonização',
        importance: 'ajuda a entender a violência colonial',
        statement: 'Algumas expedições capturavam indígenas.',
      },
      {
        term: 'violência e injustiça',
        definition: 'uso da força e tratamento injusto contra os indígenas',
        example: 'ameaças, castigos e separação de famílias',
        importance: 'mostra que a escravização foi cruel',
        statement: 'A escravização indígena foi violenta e injusta.',
      },
      {
        term: 'resistência e fuga',
        definition: 'ações de luta, defesa e escape feitas pelos indígenas',
        example: 'resistir, fugir e proteger suas terras',
        importance: 'mostra coragem e defesa da liberdade',
        statement: 'Muitos indígenas resistiram à escravização.',
      },
      {
        term: 'danos às comunidades',
        definition: 'prejuízos para famílias, aldeias e territórios',
        example: 'perda de pessoas e de autonomia',
        importance: 'ajuda a compreender os danos históricos',
        statement: 'A escravização causou muitos danos aos povos indígenas.',
      },
    ],
  );

  addTopic('os_indigenas_hoje', topicMeta.os_indigenas_hoje.name, 'his_ih', [
    {
      term: 'viver hoje em diferentes lugares',
      definition:
        'os indígenas vivem hoje em aldeias, cidades e territórios diversos',
      example: 'morar em áreas rurais ou urbanas',
      importance: 'mostra que são povos do presente',
      statement: 'Os indígenas vivem hoje em vários lugares.',
    },
    {
      term: 'direitos à terra, saúde e educação',
      definition: 'direitos ligados à terra, saúde, educação e respeito',
      example: 'luta por escolas e atendimento de saúde',
      importance: 'garante dignidade',
      statement: 'Os povos indígenas têm direitos que devem ser respeitados.',
    },
    {
      term: 'muitos povos indígenas hoje',
      definition: 'existem muitos povos indígenas diferentes hoje',
      example: 'muitas línguas e modos de vida',
      importance: 'evita a ideia de que todos são iguais',
      statement: 'Os indígenas não formam um único povo.',
    },
    {
      term: 'preservar línguas e tradições',
      definition: 'manter línguas, cantos e tradições vivas',
      example: 'ensinar a língua aos mais jovens',
      importance: 'protege a identidade',
      statement: 'Muitos povos indígenas preservam sua língua e cultura.',
    },
    {
      term: 'luta por direitos',
      definition: 'buscar respeito, território e melhores condições de vida',
      example: 'mobilizações e reuniões',
      importance: 'defende a vida e a cultura',
      statement: 'Os indígenas seguem lutando por seus direitos.',
    },
  ]);

  addTopic(
    'atividades_adicionais',
    topicMeta.atividades_adicionais.name,
    'his_ad',
    [
      {
        term: 'diversidade indígena',
        definition: 'os povos indígenas são diferentes entre si',
        example: 'há muitos povos, línguas e costumes',
        importance: 'combate estereótipos',
        statement: 'Não existe um único jeito de ser indígena.',
      },
      {
        term: 'história e presente',
        definition: 'a história ajuda a entender o presente',
        example: 'estudar o passado para compreender o Brasil hoje',
        importance: 'faz perceber mudanças e continuidades',
        statement: 'Conhecer a história ajuda a entender o presente.',
      },
      {
        term: 'respeito e combate ao preconceito',
        definition: 'respeitar culturas diferentes evita preconceito',
        example: 'valorizar nomes, roupas e costumes',
        importance: 'promove convivência justa',
        statement: 'Respeitar os povos indígenas combate o preconceito.',
      },
      {
        term: 'fontes históricas',
        definition:
          'relatos, objetos, pinturas e documentos ajudam a estudar o passado',
        example: 'cerâmicas e histórias contadas',
        importance: 'permite conhecer a vida de outros tempos',
        statement: 'Objetos e relatos são fontes para estudar História.',
      },
      {
        term: 'Brasil formado por muitos povos',
        definition: 'o Brasil foi formado pela presença de vários povos',
        example: 'indígenas, africanos, europeus e outros grupos',
        importance: 'mostra a diversidade brasileira',
        statement: 'A história do Brasil foi construída por muitos povos.',
      },
    ],
  );

  const historyT2QuestionSpecs = [
    {
      id: 'HIS-T2-AFR-001',
      question: 'O que é a África?',
      options: ['um continente', 'um único país', 'uma cidade', 'um oceano'],
      correct: 'um continente',
      explanation:
        'A África é um continente formado por muitos países e povos.',
      wrong: [
        'a África possui muitos países',
        'existem muitas cidades no continente africano',
        'a África é uma grande porção de terra.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-002',
      question: 'O continente africano é formado por:',
      options: [
        'uma única cidade',
        'muitos países',
        'somente ilhas',
        'um único reino',
      ],
      correct: 'muitos países',
      explanation:
        'A África possui muitos países, cada um com sua própria história.',
      wrong: [
        'um continente reúne territórios muito maiores',
        'a maior parte da África está em uma extensa massa de terra',
        'diferentes sociedades e formas de organização existiram e existem na África.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-003',
      question: 'Qual frase descreve melhor os povos africanos?',
      options: [
        'todos vivem do mesmo modo',
        'todos falam a mesma língua',
        'são diversos e possuem histórias diferentes',
        'formam um único povo',
      ],
      correct: 'são diversos e possuem histórias diferentes',
      explanation:
        'O continente africano abriga muitos povos, com histórias e modos de vida diversos.',
      wrong: [
        'os modos de vida são variados',
        'muitas línguas são faladas na África',
        'o continente possui muitos povos.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-004',
      question: 'Em um mapa-múndi, onde podemos localizar a África?',
      options: [
        'entre as estações do ano',
        'dentro de uma única cidade',
        'no nome de um rio',
        'como um dos continentes',
      ],
      correct: 'como um dos continentes',
      explanation:
        'O mapa-múndi representa a África como um dos continentes da Terra.',
      wrong: [
        'elas indicam períodos do ano',
        'a África é muito maior e possui muitos países',
        'rios são elementos do território, não continentes.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-005',
      question:
        'Sobre as línguas faladas na África, qual afirmação está correta?',
      options: [
        'existem muitas línguas',
        'existe apenas uma língua',
        'nenhuma língua é falada',
        'todos os países usam somente a mesma língua',
      ],
      correct: 'existem muitas línguas',
      explanation:
        'A diversidade dos povos africanos também aparece nas muitas línguas do continente.',
      wrong: [
        'muitas línguas são faladas',
        'pessoas se comunicam em diversas línguas',
        'os países e povos não usam somente uma língua comum.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-006',
      question: 'Por que não devemos falar em uma única cultura africana?',
      options: [
        'porque culturas não existem',
        'porque a África não tem habitantes',
        'porque há povos e culturas diversos',
        'porque todos os costumes são iguais',
      ],
      correct: 'porque há povos e culturas diversos',
      explanation:
        'A expressão "culturas africanas" reconhece a diversidade existente no continente.',
      wrong: [
        'culturas fazem parte da vida dos povos',
        'milhões de pessoas vivem na África',
        'costumes e experiências variam entre povos e lugares.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-007',
      question: 'O que podemos encontrar em diferentes regiões da África?',
      options: [
        'somente o mesmo tipo de paisagem',
        'apenas grandes cidades',
        'apenas desertos',
        'paisagens e modos de vida variados',
      ],
      correct: 'paisagens e modos de vida variados',
      explanation:
        'O continente possui regiões, paisagens e modos de vida diversos.',
      wrong: [
        'há grande variedade ambiental',
        'também existem áreas rurais e outros espaços',
        'a África também possui florestas, savanas, rios, montanhas e cidades.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-008',
      question: 'Qual atitude demonstra respeito ao conhecer um povo africano?',
      options: [
        'decidir que um costume é inferior',
        'ouvir e aprender sobre sua história',
        'imaginar que todos os povos são iguais',
        'rir de uma língua diferente',
      ],
      correct: 'ouvir e aprender sobre sua história',
      explanation:
        'Conhecer as histórias e os modos de vida de cada povo ajuda a respeitar a diversidade.',
      wrong: [
        'diferença cultural não significa menor valor',
        'cada povo possui experiências próprias',
        'línguas diferentes devem ser respeitadas.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-009',
      question:
        'A história da África começou quando os europeus chegaram ao continente?',
      options: [
        'sim, porque antes não havia pessoas',
        'sim, porque não existiam sociedades',
        'não, povos africanos possuem histórias muito antigas',
        'não, porque a África surgiu recentemente',
      ],
      correct: 'não, povos africanos possuem histórias muito antigas',
      explanation:
        'Povos africanos construíram sociedades e histórias muitos séculos antes da chegada de europeus.',
      wrong: [
        'povos viviam no continente havia muito tempo',
        'diferentes sociedades africanas já existiam',
        'a África possui uma história muito antiga.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-010',
      question: 'O Egito Antigo se desenvolveu em qual continente?',
      options: ['África', 'América', 'Europa', 'Oceania'],
      correct: 'África',
      explanation:
        'O Egito Antigo se desenvolveu no nordeste do continente africano.',
      wrong: [
        'fica em outro continente',
        'o Egito Antigo se localizava na África',
        'fica em outra parte do mundo.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-011',
      question:
        'Antes da chegada dos europeus, diferentes povos africanos já organizavam:',
      options: [
        'somente acampamentos temporários',
        'apenas grupos sem conhecimentos',
        'cidades, comunidades e reinos',
        'nenhuma forma de sociedade',
      ],
      correct: 'cidades, comunidades e reinos',
      explanation:
        'Ao longo do tempo, diferentes sociedades africanas organizaram comunidades, cidades e reinos.',
      wrong: [
        'existiram muitas formas de ocupação e organização',
        'esses povos desenvolveram diversos saberes',
        'sociedades africanas possuem histórias antigas.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-012',
      question:
        'Qual exemplo mostra conhecimentos desenvolvidos por sociedades africanas ao longo da história?',
      options: [
        'cultivar alimentos, trabalhar metais e produzir arte',
        'somente copiar saberes de outros continentes',
        'deixar de observar a natureza',
        'viver sem criar técnicas',
      ],
      correct: 'cultivar alimentos, trabalhar metais e produzir arte',
      explanation:
        'Diferentes sociedades africanas desenvolveram conhecimentos na agricultura, nos metais, nas artes e em outras áreas.',
      wrong: [
        'povos africanos produziram e compartilharam conhecimentos',
        'a observação ajudou a desenvolver saberes',
        'muitas técnicas foram criadas e aperfeiçoadas.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-013',
      question:
        'Como relatos transmitidos de uma geração para outra podem ajudar uma comunidade?',
      options: [
        'apagando todas as lembranças',
        'substituindo todas as pessoas',
        'preservando memórias e ensinamentos',
        'impedindo que histórias sejam contadas',
      ],
      correct: 'preservando memórias e ensinamentos',
      explanation:
        'A tradição oral pode transmitir conhecimentos, memórias e histórias entre gerações.',
      wrong: [
        'os relatos ajudam a conservar lembranças',
        'pessoas compartilham relatos com outras pessoas',
        'a tradição oral depende de contar e ouvir histórias.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-014',
      question:
        'O que acontecia quando diferentes sociedades africanas realizavam trocas entre si?',
      options: [
        'não havia contato algum',
        'podiam circular produtos, ideias e conhecimentos',
        'todas se tornavam iguais',
        'suas histórias desapareciam',
      ],
      correct: 'podiam circular produtos, ideias e conhecimentos',
      explanation:
        'As trocas aproximavam sociedades e permitiam a circulação de produtos e saberes.',
      wrong: [
        'a troca é uma forma de contato',
        'trocar não elimina as diferenças',
        'as sociedades continuavam construindo suas histórias.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-015',
      question:
        'Músicas, danças, esculturas e tecidos produzidos por povos africanos mostram:',
      options: [
        'que há diversas formas de expressão cultural',
        'que todos criam a mesma arte',
        'que apenas um povo produz arte',
        'que a arte não conta histórias',
      ],
      correct: 'que há diversas formas de expressão cultural',
      explanation:
        'As produções artísticas podem expressar conhecimentos, memórias e identidades diversas.',
      wrong: [
        'as expressões variam entre povos e tempos',
        'muitos povos produzem arte',
        'obras podem comunicar memórias e ideias.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-016',
      question:
        'Para estudar a história de povos africanos, podemos consultar:',
      options: [
        'apenas uma opinião sem fonte',
        'somente histórias inventadas',
        'nenhuma forma de registro',
        'objetos, construções, relatos orais e textos',
      ],
      correct: 'objetos, construções, relatos orais e textos',
      explanation:
        'Diferentes tipos de fonte ajudam a conhecer experiências e histórias de outros tempos.',
      wrong: [
        'uma afirmação sem fonte não basta para estudar história',
        'o estudo usa fontes que possam ser analisadas',
        'existem diversos tipos de fontes históricas.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-017',
      question:
        'A formação da sociedade brasileira recebeu contribuições de povos africanos?',
      options: [
        'não, nenhuma contribuição chegou ao Brasil',
        'somente no nome do continente',
        'apenas em um único alimento',
        'sim, em conhecimentos e práticas culturais diversas',
      ],
      correct: 'sim, em conhecimentos e práticas culturais diversas',
      explanation:
        'Povos africanos e seus descendentes participaram da formação do Brasil com muitos saberes e práticas culturais.',
      wrong: [
        'as contribuições são parte da história brasileira',
        'a influência vai além de uma palavra',
        'ela aparece em diferentes áreas da vida social e cultural.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-018',
      question: 'Algumas palavras usadas no Brasil mostram a influência de:',
      options: [
        'somente uma única origem',
        'línguas africanas, entre outras origens',
        'nenhuma língua',
        'apenas palavras inventadas hoje',
      ],
      correct: 'línguas africanas, entre outras origens',
      explanation:
        'O português falado no Brasil recebeu contribuições de diferentes línguas, inclusive africanas.',
      wrong: [
        'o vocabulário brasileiro possui várias influências',
        'palavras surgem e circulam por meio das línguas',
        'muitas influências fazem parte de processos históricos.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-019',
      question: 'Qual frase evita um estereótipo sobre a África?',
      options: [
        'toda a África é igual',
        'na África existem muitos povos e realidades',
        'todas as pessoas vivem em aldeias',
        'o continente possui apenas uma paisagem',
      ],
      correct: 'na África existem muitos povos e realidades',
      explanation:
        'Reconhecer a diversidade evita ideias simplificadas e incorretas sobre o continente.',
      wrong: [
        'regiões e sociedades são diversas',
        'pessoas vivem em áreas rurais, vilas e cidades variadas',
        'o continente possui diferentes paisagens.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-AFR-020',
      question: 'Ao aprender sobre a África, qual é a atitude mais cuidadosa?',
      options: [
        'repetir uma ideia sem verificar',
        'usar uma história para explicar todo o continente',
        'comparar culturas para escolher a melhor',
        'consultar fontes e reconhecer diferentes histórias',
      ],
      correct: 'consultar fontes e reconhecer diferentes histórias',
      explanation:
        'Fontes variadas e respeito à diversidade ajudam a construir um conhecimento mais correto.',
      wrong: [
        'informações precisam ser analisadas',
        'um continente diverso não cabe em uma única experiência',
        'culturas diferentes não devem ser colocadas em uma escala de valor.',
      ],
      topic: 'africa_origens',
    },
    {
      id: 'HIS-T2-LIN-001',
      question: 'O que podemos afirmar sobre as línguas faladas na África?',
      options: [
        'há grande diversidade de línguas',
        'existe somente uma língua',
        'nenhuma língua é falada',
        'todos usam obrigatoriamente a mesma língua',
      ],
      correct: 'há grande diversidade de línguas',
      explanation:
        'Muitos povos e comunidades do continente africano usam línguas diferentes.',
      wrong: [
        'o continente possui grande diversidade linguística',
        'as pessoas se comunicam em muitas línguas',
        'diferentes comunidades podem usar línguas distintas.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-002',
      question: 'Qual opção apresenta uma língua, e não um país?',
      options: ['Angola', 'iorubá', 'Moçambique', 'África do Sul'],
      correct: 'iorubá',
      explanation:
        'Iorubá é uma língua falada por comunidades da África Ocidental e de outros lugares.',
      wrong: ['é um país', 'é um país', 'é um país.'],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-003',
      question: 'A palavra África indica:',
      options: [
        'uma única língua',
        'um único povo',
        'um continente',
        'uma família linguística',
      ],
      correct: 'um continente',
      explanation:
        'A África é um continente com muitos países, povos e línguas.',
      wrong: [
        'muitas línguas são usadas no continente',
        'muitos povos vivem na África',
        'famílias linguísticas são agrupamentos de línguas.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-004',
      question: 'Em um mesmo país africano, as pessoas podem falar:',
      options: [
        'somente uma língua em qualquer situação',
        'nenhuma língua local',
        'apenas línguas iguais às de todos os outros países',
        'duas ou mais línguas',
      ],
      correct: 'duas ou mais línguas',
      explanation:
        'O multilinguismo faz parte da vida de muitas pessoas e comunidades africanas.',
      wrong: [
        'muitos países possuem várias línguas',
        'línguas locais fazem parte de muitas comunidades',
        'a realidade linguística varia entre países e regiões.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-005',
      question: 'O que é uma língua materna?',
      options: [
        'uma língua aprendida nos primeiros anos de vida',
        'uma língua usada apenas em mapas',
        'o nome de um continente',
        'uma língua que ninguém fala',
      ],
      correct: 'uma língua aprendida nos primeiros anos de vida',
      explanation:
        'A língua materna é adquirida desde a infância, geralmente no convívio familiar e comunitário.',
      wrong: [
        'línguas são usadas para comunicação',
        'continente é uma divisão geográfica',
        'uma língua materna é usada por pessoas e comunidades.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-006',
      question:
        'Quando uma pessoa usa mais de uma língua em sua vida, ela pratica:',
      options: [
        'silêncio',
        'multilinguismo',
        'desenho cartográfico',
        'uma única forma de comunicação',
      ],
      correct: 'multilinguismo',
      explanation:
        'Multilinguismo é o uso de duas ou mais línguas por uma pessoa ou comunidade.',
      wrong: [
        'usar línguas é comunicar-se',
        'estuda representações do espaço',
        'o multilinguismo envolve mais de uma língua.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-007',
      question: 'Além de comunicar ideias, uma língua pode ajudar a preservar:',
      options: [
        'apenas números',
        'somente nomes de países',
        'memórias e conhecimentos',
        'o tamanho de um território',
      ],
      correct: 'memórias e conhecimentos',
      explanation:
        'Histórias, saberes e lembranças podem ser transmitidos por meio das línguas.',
      wrong: [
        'a função da língua é mais ampla',
        'línguas expressam muitos assuntos',
        'o tamanho de um lugar não é preservado pela língua.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-008',
      question:
        'Por que aprender em uma língua que a criança compreende pode ajudar?',
      options: [
        'porque elimina todas as outras línguas',
        'porque torna todas as pessoas iguais',
        'porque impede novos aprendizados',
        'porque facilita a compreensão',
      ],
      correct: 'porque facilita a compreensão',
      explanation:
        'Compreender a língua usada no ensino ajuda a acompanhar explicações e participar.',
      wrong: [
        'aprender não precisa apagar outras línguas',
        'pessoas continuam diversas',
        'uma língua compreendida pode apoiar novos aprendizados.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-009',
      question: 'O que é uma família linguística?',
      options: [
        'um grupo de línguas com histórias e características relacionadas',
        'uma família que mora no mesmo país',
        'um conjunto de continentes',
        'uma lista de línguas superiores',
      ],
      correct:
        'um grupo de línguas com histórias e características relacionadas',
      explanation:
        'Estudiosos agrupam línguas relacionadas para compreender suas histórias e semelhanças.',
      wrong: [
        'o termo se refere a línguas',
        'uma família linguística não agrupa territórios',
        'o agrupamento não cria uma escala de valor.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-010',
      question:
        'Qual dupla apresenta nomes usados para grandes famílias linguísticas presentes na África?',
      options: [
        'Europa e Ásia',
        'Níger-Congo e Afro-Asiática',
        'Brasil e Angola',
        'norte e sul',
      ],
      correct: 'Níger-Congo e Afro-Asiática',
      explanation:
        'Níger-Congo e Afro-Asiática são nomes usados para agrupar muitas línguas relacionadas.',
      wrong: [
        'Europa e Ásia são continentes',
        'Brasil e Angola são países',
        'norte e sul indicam posições.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-011',
      question:
        'Por que classificações de línguas podem ser revistas por estudiosos?',
      options: [
        'porque línguas não possuem história',
        'porque qualquer resposta serve',
        'porque novas pesquisas podem trazer informações',
        'porque uma língua muda de continente todos os dias',
      ],
      correct: 'porque novas pesquisas podem trazer informações',
      explanation:
        'Classificações são ferramentas de estudo e podem ser aperfeiçoadas com novas evidências.',
      wrong: [
        'línguas possuem trajetórias',
        'pesquisas usam evidências',
        'esse não é o motivo de revisar classificações.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-012',
      question: 'Duas línguas pertencerem à mesma família significa que:',
      options: [
        'são exatamente iguais',
        'são faladas somente em um país',
        'uma é melhor que a outra',
        'possuem relações históricas, mas continuam diferentes',
      ],
      correct: 'possuem relações históricas, mas continuam diferentes',
      explanation:
        'Línguas de uma mesma família podem ter relações e semelhanças sem serem idênticas.',
      wrong: [
        'cada língua possui características próprias',
        'línguas podem atravessar fronteiras',
        'famílias linguísticas não estabelecem superioridade.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-013',
      question:
        'O suaíli, também chamado kiswahili, é muito usado em qual parte da África?',
      options: [
        'na região oriental',
        'somente no extremo norte',
        'apenas fora da África',
        'em nenhum lugar',
      ],
      correct: 'na região oriental',
      explanation:
        'O suaíli é usado por muitas pessoas em países da África Oriental.',
      wrong: [
        'o uso mais conhecido ocorre na região oriental',
        'ele é amplamente usado na África',
        'muitas comunidades usam essa língua.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-014',
      question:
        'O iorubá é um exemplo de língua com presença histórica principalmente em qual região africana?',
      options: [
        'África Oriental',
        'África Ocidental',
        'sul da Europa',
        'Oceania',
      ],
      correct: 'África Ocidental',
      explanation:
        'O iorubá é falado por comunidades da África Ocidental e também por pessoas em outros lugares.',
      wrong: [
        'não é sua principal região histórica',
        'não é uma região africana',
        'é outro continente.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-015',
      question:
        'Qual língua é um exemplo associado à região sul do continente africano?',
      options: ['japonês', 'islandês', 'zulu', 'finlandês'],
      correct: 'zulu',
      explanation:
        'O zulu é uma das línguas faladas por comunidades da África Austral.',
      wrong: [
        'tem origem no leste da Ásia',
        'é uma língua europeia',
        'é uma língua europeia.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-016',
      question:
        'Sobre o árabe no continente africano, qual frase está correta?',
      options: [
        'não é usado por nenhuma comunidade',
        'é a única língua de toda a África',
        'existe somente fora da África',
        'é falado no norte da África e em outras regiões',
      ],
      correct: 'é falado no norte da África e em outras regiões',
      explanation:
        'O árabe é usado por muitas comunidades africanas, especialmente no norte do continente.',
      wrong: [
        'muitas comunidades usam árabe',
        'a África possui muitas línguas',
        'o árabe também é falado no continente africano.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-017',
      question: 'Qual ação ajuda a preservar uma língua?',
      options: [
        'usá-la, ensiná-la e registrar conhecimentos',
        'proibir seus falantes',
        'apagar histórias',
        'afirmar que ela não tem valor',
      ],
      correct: 'usá-la, ensiná-la e registrar conhecimentos',
      explanation:
        'O uso, o ensino e o registro ajudam uma língua a continuar viva entre gerações.',
      wrong: [
        'a proibição ameaça a continuidade',
        'histórias ajudam a preservar a língua',
        'todas as línguas merecem respeito.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-018',
      question:
        'Como demonstrar respeito por alguém que fala uma língua diferente?',
      options: [
        'rir de sua pronúncia',
        'ouvir com atenção e evitar deboches',
        'mandar abandonar sua língua',
        'dizer que uma língua é superior',
      ],
      correct: 'ouvir com atenção e evitar deboches',
      explanation:
        'Respeitar diferentes formas de falar valoriza as pessoas e a diversidade linguística.',
      wrong: [
        'o deboche desrespeita a pessoa',
        'ninguém deve ser humilhado por sua língua',
        'línguas não devem ser colocadas em hierarquia.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-019',
      question:
        'Quando uma língua deixa de ser ensinada às novas gerações, o que pode acontecer?',
      options: [
        'ela se torna automaticamente mundial',
        'passa a ser um país',
        'pode correr risco de desaparecer',
        'transforma todas as outras línguas',
      ],
      correct: 'pode correr risco de desaparecer',
      explanation:
        'Sem novos falantes e ações de preservação, uma língua pode deixar de ser usada.',
      wrong: [
        'a falta de ensino reduz seu uso',
        'língua e país são conceitos diferentes',
        'uma língua não converte outras línguas.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-LIN-020',
      question:
        'Qual atitude ajuda a estudar as línguas africanas com cuidado?',
      options: [
        'imaginar que todos falam igual',
        'usar um país para explicar todo o continente',
        'escolher uma língua como melhor',
        'consultar fontes e reconhecer a diversidade',
      ],
      correct: 'consultar fontes e reconhecer a diversidade',
      explanation:
        'Fontes confiáveis e atenção às diferenças evitam generalizações sobre o continente.',
      wrong: [
        'há grande diversidade linguística',
        'nenhuma realidade nacional representa todo o continente',
        'não existe hierarquia natural entre línguas.',
      ],
      topic: 'grupos_linguisticos_africanos',
    },
    {
      id: 'HIS-T2-ESC-001',
      question: 'Por que usamos a expressão "pessoas escravizadas"?',
      options: [
        'para mostrar que a escravização foi uma condição imposta',
        'para dizer que essa era toda a identidade delas',
        'para afirmar que nasceram sem direitos',
        'para esconder que eram pessoas',
      ],
      correct: 'para mostrar que a escravização foi uma condição imposta',
      explanation:
        'Antes de serem escravizadas, elas eram pessoas com histórias, famílias, culturas e conhecimentos.',
      wrong: [
        'nenhuma pessoa se resume à opressão sofrida',
        'seus direitos foram violados, não eram inexistentes',
        'a expressão destaca que eram pessoas.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-002',
      question: 'A escravização desrespeitava principalmente o direito à:',
      options: [
        'decoração',
        'liberdade',
        'escolha de uma brincadeira',
        'mudança de estação',
      ],
      correct: 'liberdade',
      explanation:
        'Pessoas escravizadas eram obrigadas a viver e trabalhar sem liberdade.',
      wrong: [
        'não é o direito central violado',
        'a injustiça era muito mais ampla',
        'períodos do ano não explicam a escravização.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-003',
      question: 'A vinda de muitos africanos escravizados para o Brasil foi:',
      options: [
        'um passeio escolhido por todas as famílias',
        'uma viagem de férias',
        'um deslocamento forçado',
        'uma excursão escolar',
      ],
      correct: 'um deslocamento forçado',
      explanation:
        'Muitas pessoas foram retiradas de suas terras e trazidas contra a própria vontade.',
      wrong: [
        'elas não escolheram partir',
        'não foi uma viagem de descanso',
        'não teve finalidade educativa nem participação voluntária.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-004',
      question: 'A história dos povos africanos começou com a escravização?',
      options: [
        'sim, porque antes não havia sociedades',
        'sim, porque não existiam conhecimentos',
        'sim, porque todos viviam da mesma forma',
        'não, povos africanos já possuíam histórias antigas e diversas',
      ],
      correct: 'não, povos africanos já possuíam histórias antigas e diversas',
      explanation:
        'Sociedades africanas construíram conhecimentos e histórias muito antes da escravização transatlântica.',
      wrong: [
        'diferentes sociedades já existiam',
        'povos africanos produziam muitos saberes',
        'havia grande diversidade de modos de vida.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-005',
      question: 'O que foi o tráfico transatlântico de pessoas escravizadas?',
      options: [
        'o transporte forçado de pessoas africanas pelo oceano Atlântico',
        'uma troca de livros',
        'uma viagem turística',
        'uma mudança voluntária',
      ],
      correct:
        'o transporte forçado de pessoas africanas pelo oceano Atlântico',
      explanation:
        'O tráfico retirou pessoas da África e as levou à força para outros continentes.',
      wrong: [
        'pessoas não eram mercadorias e o tráfico não foi troca de livros',
        'não houve escolha',
        'o deslocamento foi imposto.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-006',
      question:
        'As pessoas africanas trazidas à força para o Brasil pertenciam a:',
      options: [
        'um único povo com uma única língua',
        'diferentes povos, línguas e culturas',
        'uma única família',
        'somente uma cidade',
      ],
      correct: 'diferentes povos, línguas e culturas',
      explanation:
        'Pessoas de diversas regiões e sociedades africanas foram escravizadas.',
      wrong: [
        'a África possui muitos povos',
        'as pessoas tinham origens variadas',
        'vieram de diferentes lugares.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-007',
      question: 'Uma consequência do deslocamento forçado foi:',
      options: [
        'escolher livremente um novo lar',
        'ganhar férias',
        'separar pessoas de famílias e comunidades',
        'receber todos os direitos',
      ],
      correct: 'separar pessoas de famílias e comunidades',
      explanation:
        'A escravização rompeu muitos vínculos familiares e comunitários.',
      wrong: [
        'o destino foi imposto',
        'houve violência e perda de liberdade',
        'direitos foram desrespeitados.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-008',
      question: 'Como era o trabalho realizado por pessoas escravizadas?',
      options: [
        'sempre escolhido e remunerado',
        'feito apenas por diversão',
        'igual a uma brincadeira',
        'obrigatório e sem liberdade',
      ],
      correct: 'obrigatório e sem liberdade',
      explanation:
        'Pessoas escravizadas eram obrigadas a trabalhar e não podiam decidir livremente sobre suas vidas.',
      wrong: [
        'não havia liberdade de escolha',
        'era exploração, não lazer',
        'trabalho forçado não é brincadeira.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-009',
      question:
        'Mesmo sob a escravização, as pessoas africanas e seus descendentes:',
      options: [
        'preservaram e criaram conhecimentos e formas culturais',
        'esqueceram imediatamente toda a própria história',
        'deixaram de formar famílias',
        'perderam a capacidade de tomar decisões',
      ],
      correct: 'preservaram e criaram conhecimentos e formas culturais',
      explanation:
        'Elas mantiveram memórias, saberes e vínculos, além de criar novas formas de expressão e resistência.',
      wrong: [
        'muitas memórias e práticas foram preservadas',
        'vínculos foram construídos apesar da opressão',
        'pessoas resistiram e fizeram escolhas possíveis.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-010',
      question: 'O que significa resistir à escravização?',
      options: [
        'aceitar toda injustiça sem agir',
        'buscar liberdade e enfrentar a opressão de diferentes maneiras',
        'esquecer a própria cultura',
        'considerar a escravização justa',
      ],
      correct: 'buscar liberdade e enfrentar a opressão de diferentes maneiras',
      explanation:
        'Pessoas escravizadas resistiram individual e coletivamente para defender liberdade, dignidade e cultura.',
      wrong: [
        'resistência envolve enfrentar a injustiça',
        'preservar a cultura também foi resistência',
        'a escravização violava direitos.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-011',
      question:
        'O que eram muitos quilombos durante o período da escravização?',
      options: [
        'locais criados para aumentar a escravização',
        'navios de transporte',
        'comunidades de resistência e busca por liberdade',
        'mercados de pessoas',
      ],
      correct: 'comunidades de resistência e busca por liberdade',
      explanation:
        'Muitos quilombos reuniram pessoas que construíram comunidades e resistiram à escravização.',
      wrong: [
        'quilombos enfrentavam o sistema escravista',
        'eram comunidades em territórios',
        'pessoas não são mercadorias.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-012',
      question:
        'Qual opção apresenta formas de resistência usadas por pessoas escravizadas?',
      options: [
        'somente esperar sem agir',
        'ajudar quem as escravizava',
        'abandonar todos os vínculos',
        'preservar culturas, organizar-se, fugir e formar comunidades',
      ],
      correct: 'preservar culturas, organizar-se, fugir e formar comunidades',
      explanation:
        'A resistência ocorreu por ações culturais, cotidianas e coletivas em busca de liberdade.',
      wrong: [
        'houve muitas ações de resistência',
        'isso não representa enfrentar a opressão',
        'manter vínculos e memórias também ajudou a resistir.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-013',
      question:
        'Preservar músicas, histórias, crenças e conhecimentos podia ser uma forma de:',
      options: [
        'resistência cultural',
        'apoio à escravização',
        'esquecimento',
        'perda de identidade',
      ],
      correct: 'resistência cultural',
      explanation:
        'Manter e recriar práticas culturais ajudou comunidades a proteger memórias e identidades.',
      wrong: [
        'preservar cultura fortalecia pessoas e comunidades',
        'a ação mantinha memórias',
        'preservar ajudava a sustentar identidades.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-014',
      question:
        'O Quilombo dos Palmares é lembrado na história brasileira como exemplo de:',
      options: [
        'viagem marítima',
        'resistência à escravização',
        'trabalho obrigatório',
        'aceitação da perda de liberdade',
      ],
      correct: 'resistência à escravização',
      explanation:
        'Palmares reuniu comunidades que resistiram por longo tempo ao sistema escravista.',
      wrong: [
        'Palmares era uma comunidade',
        'o quilombo buscava autonomia e liberdade',
        'sua história é marcada pela resistência.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-015',
      question: 'O que a abolição da escravidão mudou nas leis brasileiras?',
      options: [
        'tornou a escravização obrigatória',
        'retirou a liberdade de todas as pessoas',
        'encerrou a permissão legal para escravizar pessoas',
        'apagou toda a história anterior',
      ],
      correct: 'encerrou a permissão legal para escravizar pessoas',
      explanation:
        'A abolição acabou com a escravização permitida pelas leis, mas não reparou imediatamente todas as injustiças.',
      wrong: [
        'a mudança legal proibiu a escravização',
        'reconheceu juridicamente a liberdade',
        'a história e suas consequências precisam ser estudadas.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-016',
      question:
        'Depois da abolição, todas as desigualdades e o racismo desapareceram imediatamente?',
      options: [
        'sim, porque uma lei muda tudo no mesmo momento',
        'sim, porque ninguém sofreu discriminação',
        'sim, porque o passado deixou de ter efeitos',
        'não, a luta por igualdade e direitos continuou',
      ],
      correct: 'não, a luta por igualdade e direitos continuou',
      explanation:
        'O fim legal da escravização foi importante, mas pessoas negras continuaram enfrentando racismo e desigualdades.',
      wrong: [
        'transformações sociais exigem outras ações',
        'o racismo continuou',
        'consequências históricas permaneceram.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-017',
      question:
        'Para estudar a escravização com responsabilidade, é importante:',
      options: [
        'consultar fontes e reconhecer as experiências das pessoas escravizadas',
        'ouvir somente quem defendia a escravização',
        'esconder resistências',
        'tratar violência como brincadeira',
      ],
      correct:
        'consultar fontes e reconhecer as experiências das pessoas escravizadas',
      explanation:
        'Fontes variadas ajudam a compreender a injustiça, as experiências e as resistências desse período.',
      wrong: [
        'uma única visão apaga experiências importantes',
        'resistência faz parte da história',
        'a escravização foi uma grave violação de direitos.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-018',
      question:
        'Por que não devemos chamar pessoas escravizadas apenas de "escravos"?',
      options: [
        'porque elas não realizavam nenhum trabalho',
        'porque essa palavra pode reduzir a pessoa à condição imposta',
        'porque não existiu escravização',
        'porque todas nasceram livres no Brasil',
      ],
      correct: 'porque essa palavra pode reduzir a pessoa à condição imposta',
      explanation:
        'A expressão "pessoa escravizada" lembra que a opressão não definia toda a identidade da pessoa.',
      wrong: [
        'elas foram obrigadas a trabalhar',
        'a escravização fez parte da história',
        'muitas pessoas nasceram sob leis escravistas.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-019',
      question:
        'Qual direito deve ser garantido a todas as pessoas atualmente?',
      options: [
        'possuir outras pessoas',
        'obrigar alguém a trabalhar sem liberdade',
        'viver com liberdade, dignidade e igualdade',
        'discriminar pela cor da pele',
      ],
      correct: 'viver com liberdade, dignidade e igualdade',
      explanation:
        'Todas as pessoas têm direito à liberdade, à dignidade e a tratamento igual.',
      wrong: [
        'ninguém pode ser propriedade de outra pessoa',
        'trabalho forçado viola direitos',
        'racismo é injustiça e deve ser combatido.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ESC-020',
      question: 'Qual atitude ajuda a combater o racismo hoje?',
      options: [
        'repetir ofensas',
        'ficar do lado de quem discrimina',
        'culpar quem sofre preconceito',
        'respeitar as pessoas e procurar ajuda diante de discriminação',
      ],
      correct: 'respeitar as pessoas e procurar ajuda diante de discriminação',
      explanation:
        'Combater o racismo envolve respeito, apoio a quem sofre injustiça e busca de ajuda de adultos responsáveis.',
      wrong: [
        'palavras racistas machucam e discriminam',
        'apoiar a injustiça agrava o problema',
        'a responsabilidade é de quem pratica a discriminação.',
      ],
      topic: 'africanos_escravidao',
    },
    {
      id: 'HIS-T2-ATU-001',
      question: 'O que significa dizer que uma pessoa é afrodescendente?',
      options: [
        'que possui ancestralidade africana',
        'que nasceu obrigatoriamente na África',
        'que fala uma única língua',
        'que vive somente em comunidade rural',
      ],
      correct: 'que possui ancestralidade africana',
      explanation:
        'Afrodescendentes são pessoas que possuem antepassados africanos.',
      wrong: [
        'afrodescendentes podem nascer em diferentes países',
        'podem falar muitas línguas',
        'podem viver em áreas rurais ou urbanas.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-002',
      question: 'As pessoas afrodescendentes fazem parte somente do passado?',
      options: [
        'sim, aparecem apenas em livros antigos',
        'não, fazem parte da sociedade atual',
        'sim, não vivem mais no Brasil',
        'não, mas exercem somente uma profissão',
      ],
      correct: 'não, fazem parte da sociedade atual',
      explanation:
        'Pessoas afrodescendentes vivem, estudam, trabalham e participam da sociedade atualmente.',
      wrong: [
        'elas estão presentes hoje',
        'milhões de brasileiros possuem ancestralidade africana',
        'atuam em áreas variadas.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-003',
      question:
        'Qual frase respeita a diversidade entre pessoas afrodescendentes?',
      options: [
        'todas têm os mesmos costumes',
        'todas pensam da mesma forma',
        'possuem identidades e modos de vida diversos',
        'todas exercem a mesma profissão',
      ],
      correct: 'possuem identidades e modos de vida diversos',
      explanation:
        'A ancestralidade africana não torna iguais as histórias, escolhas e experiências de todas as pessoas.',
      wrong: [
        'práticas culturais são diversas',
        'cada pessoa possui ideias próprias',
        'afrodescendentes atuam em diferentes áreas.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-004',
      question: 'Onde vivem pessoas afrodescendentes no Brasil atual?',
      options: [
        'somente em uma cidade',
        'apenas fora do país',
        'somente em áreas rurais',
        'em diferentes regiões, cidades e áreas rurais',
      ],
      correct: 'em diferentes regiões, cidades e áreas rurais',
      explanation:
        'Pessoas afrodescendentes vivem em todo o Brasil, em contextos variados.',
      wrong: [
        'a presença ocorre em muitos lugares',
        'fazem parte da população brasileira',
        'também vivem em cidades.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-005',
      question:
        'Em quais atividades pessoas afrodescendentes atuam atualmente?',
      options: [
        'em profissões, estudos, artes, esportes, ciências e muitas outras áreas',
        'somente em atividades antigas',
        'apenas em uma profissão',
        'em nenhuma atividade pública',
      ],
      correct:
        'em profissões, estudos, artes, esportes, ciências e muitas outras áreas',
      explanation:
        'Pessoas afrodescendentes participam de todos os campos da sociedade.',
      wrong: [
        'a participação é atual e diversa',
        'há muitas possibilidades',
        'também atuam em espaços públicos.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-006',
      question:
        'Por que é importante haver pessoas negras representadas em livros, filmes e outros espaços?',
      options: [
        'para dizer que todas são iguais',
        'para que diferentes pessoas sejam vistas e reconhecidas',
        'para limitar personagens negros a um papel',
        'para substituir todos os outros grupos',
      ],
      correct: 'para que diferentes pessoas sejam vistas e reconhecidas',
      explanation:
        'A representatividade ajuda a mostrar a diversidade da sociedade e ampliar possibilidades.',
      wrong: [
        'representação deve mostrar diversidade',
        'personagens podem ocupar muitos papéis',
        'inclusão não exige apagar outros grupos.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-007',
      question: 'As culturas afro-brasileiras estão presentes em:',
      options: [
        'somente uma festa',
        'apenas objetos antigos',
        'diferentes conhecimentos, artes, palavras, comidas e formas de expressão',
        'nenhum aspecto da vida brasileira',
      ],
      correct:
        'diferentes conhecimentos, artes, palavras, comidas e formas de expressão',
      explanation:
        'Culturas afro-brasileiras contribuíram e continuam contribuindo para muitas áreas da sociedade.',
      wrong: [
        'a presença cultural é mais ampla',
        'culturas continuam vivas',
        'há muitas contribuições reconhecidas.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-008',
      question: 'Estudar histórias de pessoas negras importantes ajuda a:',
      options: [
        'separar crianças por aparência',
        'escolher um único modelo de vida',
        'dizer que só pessoas famosas têm valor',
        'reconhecer contribuições e ampliar referências',
      ],
      correct: 'reconhecer contribuições e ampliar referências',
      explanation:
        'Conhecer diferentes trajetórias ajuda a compreender a sociedade e imaginar novas possibilidades.',
      wrong: [
        'o estudo deve promover respeito',
        'existem muitas trajetórias',
        'todas as pessoas merecem dignidade.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-009',
      question: 'As comunidades quilombolas existem apenas no passado?',
      options: [
        'não, existem comunidades quilombolas atualmente',
        'sim, desapareceram todas',
        'sim, existiram somente fora do Brasil',
        'não, mas vivem todas do mesmo modo',
      ],
      correct: 'não, existem comunidades quilombolas atualmente',
      explanation:
        'Comunidades quilombolas fazem parte do Brasil atual e possuem trajetórias próprias.',
      wrong: [
        'muitas comunidades existem hoje',
        'há comunidades quilombolas brasileiras',
        'elas são diversas.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-010',
      question: 'Onde podem existir comunidades quilombolas atualmente?',
      options: [
        'somente em florestas distantes',
        'em áreas rurais e urbanas',
        'apenas dentro de museus',
        'somente em um estado brasileiro',
      ],
      correct: 'em áreas rurais e urbanas',
      explanation:
        'As comunidades quilombolas são diversas e estão presentes em diferentes partes do Brasil.',
      wrong: [
        'não há um único tipo de localização',
        'são comunidades vivas',
        'existem em várias unidades do país.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-011',
      question: 'Qual direito deve ser respeitado nas comunidades quilombolas?',
      options: [
        'abandonar sua história',
        'perder suas terras',
        'ter educação que valorize sua história, cultura e conhecimentos',
        'aceitar decisões sem participar',
      ],
      correct:
        'ter educação que valorize sua história, cultura e conhecimentos',
      explanation:
        'A educação escolar quilombola deve respeitar as características e os saberes das comunidades.',
      wrong: [
        'a memória merece proteção',
        'território é parte importante de muitas comunidades',
        'lideranças e moradores devem ser ouvidos.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-012',
      question:
        'Ao criar uma ação pública para uma comunidade quilombola, o que é importante?',
      options: [
        'decidir sem conhecer a comunidade',
        'ouvir somente pessoas de fora',
        'imaginar que todas as comunidades são iguais',
        'ouvir a comunidade e suas lideranças',
      ],
      correct: 'ouvir a comunidade e suas lideranças',
      explanation:
        'A participação das comunidades ajuda a construir decisões adequadas às suas realidades.',
      wrong: [
        'decisões precisam considerar o contexto',
        'moradores também devem participar',
        'cada comunidade possui necessidades próprias.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-013',
      question: 'O que é racismo?',
      options: [
        'uma injustiça que discrimina pessoas por raça ou cor',
        'uma brincadeira sem consequências',
        'uma opinião que sempre deve ser aceita',
        'uma diferença natural de valor entre pessoas',
      ],
      correct: 'uma injustiça que discrimina pessoas por raça ou cor',
      explanation:
        'Racismo produz tratamento injusto e desrespeita a igualdade e a dignidade das pessoas.',
      wrong: [
        'discriminação machuca e viola direitos',
        'ofensas racistas não devem ser aceitas',
        'nenhuma raça torna uma pessoa superior.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-014',
      question:
        'Se uma criança presencia uma ofensa racista, qual atitude é adequada?',
      options: [
        'rir junto',
        'apoiar quem sofreu e procurar um adulto responsável',
        'divulgar a ofensa',
        'culpar quem foi ofendido',
      ],
      correct: 'apoiar quem sofreu e procurar um adulto responsável',
      explanation:
        'A criança pode demonstrar apoio e buscar ajuda de alguém responsável para interromper a injustiça.',
      wrong: [
        'reforça a discriminação',
        'espalhar a ofensa pode aumentar o dano',
        'a vítima não é responsável pelo racismo.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-015',
      question: 'Quem é responsável por uma discriminação racista?',
      options: [
        'a pessoa que pediu ajuda',
        'quem presenciou e ficou assustado',
        'quem praticou a discriminação',
        'a pessoa que sofreu a ofensa',
      ],
      correct: 'quem praticou a discriminação',
      explanation:
        'A culpa nunca é de quem sofre racismo; a responsabilidade é de quem discrimina.',
      wrong: [
        'buscar apoio é correto',
        'presenciar uma injustiça pode causar medo',
        'a vítima não provoca a discriminação.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-016',
      question: 'O que significa promover igualdade racial?',
      options: [
        'tratar algumas pessoas como inferiores',
        'esconder histórias afro-brasileiras',
        'impedir pessoas negras de participar',
        'garantir direitos, respeito e oportunidades sem discriminação',
      ],
      correct: 'garantir direitos, respeito e oportunidades sem discriminação',
      explanation:
        'Igualdade racial exige enfrentar barreiras e assegurar dignidade e direitos para todas as pessoas.',
      wrong: [
        'ninguém tem menor valor por sua raça',
        'conhecer essas histórias é importante',
        'participação deve ser garantida.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-017',
      question:
        'Para que serve estudar a história e a cultura afro-brasileira na escola?',
      options: [
        'valorizar conhecimentos e compreender melhor o Brasil',
        'separar alunos',
        'escolher uma cultura como superior',
        'lembrar apenas da escravização',
      ],
      correct: 'valorizar conhecimentos e compreender melhor o Brasil',
      explanation:
        'A história e a cultura afro-brasileira são partes fundamentais da formação da sociedade.',
      wrong: [
        'o estudo deve aproximar e ensinar respeito',
        'culturas não formam hierarquia',
        'as histórias são muito mais amplas.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-018',
      question: 'Qual exemplo mostra representatividade positiva?',
      options: [
        'permitir apenas um tipo de personagem',
        'mostrar pessoas negras em papéis diversos e protagonistas',
        'apagar profissionais negros dos livros',
        'repetir estereótipos',
      ],
      correct: 'mostrar pessoas negras em papéis diversos e protagonistas',
      explanation:
        'Representatividade positiva reconhece capacidades, diferenças e protagonismo sem limitar possibilidades.',
      wrong: [
        'pessoas possuem trajetórias variadas',
        'contribuições devem ser reconhecidas',
        'ideias simplificadas prejudicam a compreensão.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-019',
      question: 'Qual atitude é antirracista?',
      options: [
        'ignorar toda discriminação',
        'repetir apelidos ofensivos',
        'reconhecer injustiças e agir com respeito',
        'dizer que racismo não existe',
      ],
      correct: 'reconhecer injustiças e agir com respeito',
      explanation:
        'Uma atitude antirracista identifica a discriminação, apoia quem a sofre e busca formas seguras de enfrentá-la.',
      wrong: [
        'o silêncio pode manter a injustiça',
        'ofensas devem ser interrompidas',
        'negar o problema impede seu enfrentamento.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
    {
      id: 'HIS-T2-ATU-020',
      question:
        'Como estudar a realidade atual de pessoas afrodescendentes com cuidado?',
      options: [
        'usar um estereótipo para explicar todas',
        'ouvir apenas uma pessoa',
        'pensar somente no passado',
        'consultar fontes, ouvir diferentes vozes e reconhecer a diversidade',
      ],
      correct:
        'consultar fontes, ouvir diferentes vozes e reconhecer a diversidade',
      explanation:
        'Fontes confiáveis e perspectivas variadas ajudam a evitar generalizações e invisibilidade.',
      wrong: [
        'ideias simplificadas não representam todas as pessoas',
        'experiências são variadas',
        'afrodescendentes também constroem o presente.',
      ],
      topic: 'afrodescendentes_atualidade',
    },
  ];

  questions.push(...historyT2QuestionSpecs.map(buildHistoryT2Question));

  return {
    subjectMeta,
    topicMeta,
    questions,
  };
})();
