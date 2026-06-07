window.QuestionsDataSources = window.QuestionsDataSources || {};

window.QuestionsDataSources.historia = (function () {
  const subjectMeta = {
    name: "História",
    icon: "🏛️",
    available: true
  };

  const topicMeta = {
    o_povo_e_a_cultura_do_brasil: {
      name: "O povo e a cultura do Brasil",
      icon: "🎭"
    },
    nossas_origens_os_indigenas: {
      name: "Nossas origens: os indígenas",
      icon: "🪶"
    },
    os_indigenas_e_a_relacao_com_os_europeus: {
      name: "Os indígenas e a relação com os europeus",
      icon: "⛵"
    },
    a_escravizacao_indigena: {
      name: "A escravização indígena",
      icon: "⛓️"
    },
    os_indigenas_hoje: {
      name: "Os indígenas hoje",
      icon: "🌱"
    },
    atividades_adicionais: {
      name: "Atividades adicionais",
      icon: "✅"
    }
  };

  const questions = [];

  function buildOptions(correct, wrongs, seed) {
    const base = [correct, ...wrongs.filter((value) => value !== correct).slice(0, 3)];
    const options = [];
    base.forEach((option, index) => {
      options[(index + seed) % 4] = option;
    });
    return {
      options,
      correctIndex: options.indexOf(correct)
    };
  }

  function addQuestion(prefix, number, topic, topicName, question, correct, wrongs, explanation, seed) {
    const built = buildOptions(correct, wrongs, seed);
    questions.push({
      id: `${prefix}_${String(number).padStart(3, "0")}`,
      subject: "historia",
      topic,
      topicName,
      question,
      options: built.options,
      correctIndex: built.correctIndex,
      explanation
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
      const wrongDefinitions = definitions.filter((definition) => definition !== fact.definition);
      const wrongExamples = examples.filter((example) => example !== fact.example);
      const wrongImportances = importances.filter((importance) => importance !== fact.importance);
      const wrongStatements = statements.filter((statement) => statement !== fact.statement);

      addQuestion(
        prefix,
        number++,
        topic,
        topicName,
        `Qual termo combina com esta descrição? ${fact.definition}`,
        fact.term,
        wrongTerms,
        `O termo correto é "${fact.term}".`,
        index
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
        index + 1
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
        index + 2
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
        index + 3
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
        index + 4
      );
    });
  }

  addTopic("o_povo_e_a_cultura_do_brasil", topicMeta.o_povo_e_a_cultura_do_brasil.name, "his_bc", [
    {
      term: "diversidade cultural",
      definition: "a convivência de muitos costumes, festas, músicas e jeitos de viver",
      example: "festas, comidas e músicas diferentes em cada região",
      importance: "mostra que o Brasil tem muitos modos de viver",
      statement: "O Brasil tem culturas variadas e nenhum povo é igual ao outro."
    },
    {
      term: "tradições",
      definition: "costumes transmitidos ao longo do tempo",
      example: "festas juninas, cantigas e danças",
      importance: "ajudam a guardar a memória de um grupo",
      statement: "Tradições podem ser passadas de geração em geração."
    },
    {
      term: "costumes regionais",
      definition: "hábitos que mudam de uma região para outra",
      example: "comidas, sotaques e festas diferentes",
      importance: "mostram a diversidade do país",
      statement: "As regiões do Brasil podem ter costumes diferentes."
    },
    {
      term: "influências indígenas, africanas e europeias",
      definition: "contribuições de vários povos na cultura brasileira",
      example: "palavras, comidas, músicas e festas",
      importance: "ajudam a explicar a formação do povo brasileiro",
      statement: "A cultura do Brasil recebeu influências de vários povos."
    },
    {
      term: "cultura brasileira",
      definition: "o conjunto de costumes, valores, festas e conhecimentos do povo brasileiro",
      example: "música, culinária, brincadeiras e histórias",
      importance: "faz parte da identidade do país",
      statement: "A cultura brasileira é construída por muitas pessoas ao longo do tempo."
    }
  ]);

  addTopic("nossas_origens_os_indigenas", topicMeta.nossas_origens_os_indigenas.name, "his_io", [
    {
      term: "os povos indígenas já viviam no território antes de 1500",
      definition: "os povos indígenas já moravam no Brasil antes da chegada dos portugueses",
      example: "habitavam florestas, rios, litorais e outros lugares",
      importance: "ajuda a entender que a história do Brasil começa antes de 1500",
      statement: "Os indígenas estavam aqui antes da chegada dos portugueses."
    },
    {
      term: "muitos povos e muitas línguas",
      definition: "existem muitos povos indígenas, com línguas e costumes diferentes",
      example: "cada povo pode ter sua própria língua e tradição",
      importance: "mostra a diversidade indígena",
      statement: "Não existe um único povo indígena igual em todo o Brasil."
    },
    {
      term: "relação com a natureza",
      definition: "muitos povos indígenas têm relação próxima com rios, matas e terras",
      example: "pesca, plantio e coleta",
      importance: "ajuda a viver com cuidado no território",
      statement: "A natureza é muito importante para muitos povos indígenas."
    },
    {
      term: "conhecimentos sobre plantas e território",
      definition: "saberes sobre plantas, remédios, caça e cultivo",
      example: "conhecer plantas medicinais e alimentos da floresta",
      importance: "é um conhecimento valioso para a vida",
      statement: "Os indígenas possuem muitos conhecimentos sobre a natureza."
    },
    {
      term: "tradições e identidade",
      definition: "costumes, cantos, rituais e modos de viver transmitidos entre gerações",
      example: "histórias contadas pelos mais velhos",
      importance: "mantém viva a identidade do povo",
      statement: "As tradições ajudam a preservar a cultura indígena."
    }
  ]);

  addTopic("os_indigenas_e_a_relacao_com_os_europeus", topicMeta.os_indigenas_e_a_relacao_com_os_europeus.name, "his_ie", [
    {
      term: "primeiro contato em 1500",
      definition: "o encontro entre indígenas e portugueses após a chegada de 1500",
      example: "a chegada das caravelas ao litoral",
      importance: "marcou o início de mudanças profundas",
      statement: "O contato com os europeus começou em 1500."
    },
    {
      term: "troca de conhecimentos",
      definition: "troca de objetos, palavras e saberes entre povos",
      example: "aprendizados sobre plantas, ferramentas e navegação",
      importance: "mostra que nem tudo foi conflito",
      statement: "Houve trocas de conhecimentos no contato entre indígenas e europeus."
    },
    {
      term: "conflitos e doenças",
      definition: "guerras, violência e doenças trazidas pelos europeus",
      example: "disputas por terras e epidemias",
      importance: "mostra que o contato teve consequências graves",
      statement: "O contato também trouxe conflitos e doenças."
    },
    {
      term: "interesse por terras e recursos",
      definition: "o desejo europeu por terras, madeira, ouro e outros recursos",
      example: "ocupação de territórios indígenas",
      importance: "ajuda a explicar a colonização",
      statement: "Muitos europeus queriam terras e recursos no território."
    },
    {
      term: "mudanças na vida indígena",
      definition: "transformações no modo de viver dos povos indígenas depois do contato",
      example: "perda de terras e alterações de rotina",
      importance: "mostra como a colonização afetou os povos indígenas",
      statement: "O contato mudou a vida de muitos povos indígenas."
    }
  ]);

  addTopic("a_escravizacao_indigena", topicMeta.a_escravizacao_indigena.name, "his_es", [
    {
      term: "trabalho forçado",
      definition: "trabalho imposto aos indígenas sem liberdade",
      example: "serviços obrigatórios em povoados e missões",
      importance: "foi uma forma de violência",
      statement: "A escravização indígena obrigava pessoas a trabalhar sem escolha."
    },
    {
      term: "expedições de captura",
      definition: "expedições que capturavam indígenas para trabalho forçado",
      example: "bandeiras e entradas na colonização",
      importance: "ajuda a entender a violência colonial",
      statement: "Algumas expedições capturavam indígenas."
    },
    {
      term: "violência e injustiça",
      definition: "uso da força e tratamento injusto contra os indígenas",
      example: "ameaças, castigos e separação de famílias",
      importance: "mostra que a escravização foi cruel",
      statement: "A escravização indígena foi violenta e injusta."
    },
    {
      term: "resistência e fuga",
      definition: "ações de luta, defesa e escape feitas pelos indígenas",
      example: "resistir, fugir e proteger suas terras",
      importance: "mostra coragem e defesa da liberdade",
      statement: "Muitos indígenas resistiram à escravização."
    },
    {
      term: "danos às comunidades",
      definition: "prejuízos para famílias, aldeias e territórios",
      example: "perda de pessoas e de autonomia",
      importance: "ajuda a compreender os danos históricos",
      statement: "A escravização causou muitos danos aos povos indígenas."
    }
  ]);

  addTopic("os_indigenas_hoje", topicMeta.os_indigenas_hoje.name, "his_ih", [
    {
      term: "viver hoje em diferentes lugares",
      definition: "os indígenas vivem hoje em aldeias, cidades e territórios diversos",
      example: "morar em áreas rurais ou urbanas",
      importance: "mostra que são povos do presente",
      statement: "Os indígenas vivem hoje em vários lugares."
    },
    {
      term: "direitos à terra, saúde e educação",
      definition: "direitos ligados à terra, saúde, educação e respeito",
      example: "luta por escolas e atendimento de saúde",
      importance: "garante dignidade",
      statement: "Os povos indígenas têm direitos que devem ser respeitados."
    },
    {
      term: "muitos povos indígenas hoje",
      definition: "existem muitos povos indígenas diferentes hoje",
      example: "muitas línguas e modos de vida",
      importance: "evita a ideia de que todos são iguais",
      statement: "Os indígenas não formam um único povo."
    },
    {
      term: "preservar línguas e tradições",
      definition: "manter línguas, cantos e tradições vivas",
      example: "ensinar a língua aos mais jovens",
      importance: "protege a identidade",
      statement: "Muitos povos indígenas preservam sua língua e cultura."
    },
    {
      term: "luta por direitos",
      definition: "buscar respeito, território e melhores condições de vida",
      example: "mobilizações e reuniões",
      importance: "defende a vida e a cultura",
      statement: "Os indígenas seguem lutando por seus direitos."
    }
  ]);

  addTopic("atividades_adicionais", topicMeta.atividades_adicionais.name, "his_ad", [
    {
      term: "diversidade indígena",
      definition: "os povos indígenas são diferentes entre si",
      example: "há muitos povos, línguas e costumes",
      importance: "combate estereótipos",
      statement: "Não existe um único jeito de ser indígena."
    },
    {
      term: "história e presente",
      definition: "a história ajuda a entender o presente",
      example: "estudar o passado para compreender o Brasil hoje",
      importance: "faz perceber mudanças e continuidades",
      statement: "Conhecer a história ajuda a entender o presente."
    },
    {
      term: "respeito e combate ao preconceito",
      definition: "respeitar culturas diferentes evita preconceito",
      example: "valorizar nomes, roupas e costumes",
      importance: "promove convivência justa",
      statement: "Respeitar os povos indígenas combate o preconceito."
    },
    {
      term: "fontes históricas",
      definition: "relatos, objetos, pinturas e documentos ajudam a estudar o passado",
      example: "cerâmicas e histórias contadas",
      importance: "permite conhecer a vida de outros tempos",
      statement: "Objetos e relatos são fontes para estudar História."
    },
    {
      term: "Brasil formado por muitos povos",
      definition: "o Brasil foi formado pela presença de vários povos",
      example: "indígenas, africanos, europeus e outros grupos",
      importance: "mostra a diversidade brasileira",
      statement: "A história do Brasil foi construída por muitos povos."
    }
  ]);

  return {
    subjectMeta,
    topicMeta,
    questions
  };
})();
