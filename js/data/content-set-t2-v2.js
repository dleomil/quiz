(function (root, factory) {
  const api = factory();
  if (root && root.QuestionsDataSources) {
    api.appendRemediationSet(root.QuestionsDataSources);
  }
})(typeof window === 'undefined' ? null : window, function () {
  const SOURCE_SET_ID = '2026-t2-v1';
  const REMEDIATION_SET_ID = '2026-t2-v2';
  const REMEDIATION_ID_PREFIX = '2026t2v2_';
  const NORMALIZED_MATH_TOPICS = new Set([
    'graficos_barras_colunas',
    'tabelas_graficos_dupla_entrada',
  ]);

  const TEXT_FIXES = [
    [/\bgraficos\b/gi, 'gráficos'],
    [/\bgrafico\b/gi, 'gráfico'],
    [/\bmacas\b/gi, 'maçãs'],
    [/\bmaca\b/gi, 'maçã'],
    [/\bterca\b/gi, 'terça'],
    [/\bmanha\b/gi, 'manhã'],
    [/\bperiodo\b/gi, 'período'],
    [/\bmatematica\b/gi, 'matemática'],
    [/\bnumero\b/gi, 'número'],
    [/\bnumeros\b/gi, 'números'],
    [/\bdiferenca\b/gi, 'diferença'],
    [/\bcelula\b/gi, 'célula'],
    [/\bciencia\b/gi, 'ciência'],
    [/\bciencias\b/gi, 'ciências'],
    [/\btitulo\b/gi, 'título'],
    [/\bnao\b/gi, 'não'],
    [/\bsao\b/gi, 'são'],
    [/\btres\b/gi, 'três'],
    [/\s+e igual a\b/gi, ' é igual a'],
    [/\s+e maior que\b/gi, ' é maior que'],
    [/\bcolunas não tem\b/gi, 'colunas não têm'],
  ];

  function normalizeMathText(value) {
    if (typeof value !== 'string') return value;
    return TEXT_FIXES.reduce(
      (text, [pattern, replacement]) => text.replace(pattern, replacement),
      value,
    );
  }

  function fixKnownFindings(question) {
    const sourceId = question.id.replace(REMEDIATION_ID_PREFIX, '');
    switch (sourceId) {
      case 'CIE-T2-CRU-020':
        question.wrongExplanations[0] =
          'Segurar o animal pode machucar a pessoa e fazer o crustáceo se defender.';
        break;
      case 'CIE-T2-EQU-002':
        question.wrongExplanations = {
          0: 'As copas das árvores não são o ambiente onde vivem os equinodermos.',
          2: 'Rios e lagos são ambientes de água doce, não marinhos.',
          3: 'Os equinodermos vivem em ambientes marinhos, não somente em desertos.',
        };
        break;
      case 'mat_t2_de_017':
        question.question = question.question.replace('sexta', 'noite');
        question.wrongExplanations[3] = 'À noite, houve 4.';
        break;
      case 'pt_t2_vi_002':
        question.question = question.question.replace(
          'O cachorro late',
          'O cachorro late no quintal',
        );
        question.options[question.options.indexOf('qual')] = 'quintal';
        question.wrongExplanations[0] =
          'Quintal indica o lugar onde o cachorro late.';
        break;
      case 'pt_t2_vi_003':
        question.question = question.question.replace(
          'As crianças brincam',
          'As crianças brincam com uma bola',
        );
        question.wrongExplanations[1] = 'Uma acompanha o nome bola.';
        break;
      case 'pt_t2_vi_005':
        question.question = question.question.replace(
          'A professora ensina',
          'A professora ensina na escola',
        );
        question.wrongExplanations[3] =
          'Escola indica o lugar onde a professora ensina.';
        break;
      case 'pt_t2_vii_002':
        question.question = question.question.replace(
          'O bebê sorri',
          'O bebê sorri com alegria',
        );
        question.wrongExplanations[0] = 'Alegria indica como o bebê sorri.';
        break;
      default:
        break;
    }
  }

  function balanceAnswersByTopic(questions) {
    const byTopic = new Map();
    questions.forEach((question) => {
      const key = `${question.subject}:${question.topic}`;
      if (!byTopic.has(key)) byTopic.set(key, []);
      byTopic.get(key).push(question);
    });

    byTopic.forEach((topicQuestions) => {
      topicQuestions.sort((left, right) => left.id.localeCompare(right.id));
      if (topicQuestions.length !== 20) {
        throw new Error(
          `T2 V2 exige 20 questões por tema: ${topicQuestions[0].topic}`,
        );
      }
      topicQuestions.forEach((question, questionIndex) => {
        const targetCorrectIndex = Math.floor(questionIndex / 5);
        const oldOptions = question.options.slice();
        const oldCorrectIndex = question.correctIndex;
        const oldWrongExplanations = question.wrongExplanations || {};
        const newOptions = new Array(oldOptions.length);
        const newWrongExplanations = {};
        const otherIndexes = oldOptions
          .map((_, index) => index)
          .filter((index) => index !== oldCorrectIndex);
        const targetOtherIndexes = Array.from(
          { length: oldOptions.length },
          (_, index) => index,
        ).filter((index) => index !== targetCorrectIndex);
        newOptions[targetCorrectIndex] = oldOptions[oldCorrectIndex];
        targetOtherIndexes.forEach((newIndex, otherIndex) => {
          const oldIndex = otherIndexes[otherIndex];
          newOptions[newIndex] = oldOptions[oldIndex];
          newWrongExplanations[newIndex] = oldWrongExplanations[oldIndex];
        });
        question.options = newOptions;
        question.correctIndex = targetCorrectIndex;
        question.wrongExplanations = newWrongExplanations;
      });
    });
  }

  function appendRemediationSet(sources) {
    const allQuestions = Object.values(sources).flatMap((source) =>
      Array.isArray(source.questions) ? source.questions : [],
    );
    if (
      allQuestions.some(
        (question) => question.contentSetId === REMEDIATION_SET_ID,
      )
    ) {
      throw new Error(`${REMEDIATION_SET_ID} ja esta materializado`);
    }
    const sourceQuestions = allQuestions.filter(
      (question) => question.contentSetId === SOURCE_SET_ID,
    );
    if (sourceQuestions.length !== 620) {
      throw new Error(`${SOURCE_SET_ID} deve conter exatamente 620 questoes`);
    }

    const remediationQuestions = sourceQuestions.map((sourceQuestion) => {
      const question = JSON.parse(JSON.stringify(sourceQuestion));
      question.id = `${REMEDIATION_ID_PREFIX}${sourceQuestion.id}`;
      question.contentSetId = REMEDIATION_SET_ID;
      question.version = 2;
      if (NORMALIZED_MATH_TOPICS.has(question.topic)) {
        question.topicName = normalizeMathText(question.topicName);
        ['question', 'explanation'].forEach((field) => {
          question[field] = normalizeMathText(question[field]);
        });
        question.options = question.options.map(normalizeMathText);
        Object.keys(question.wrongExplanations || {}).forEach((index) => {
          question.wrongExplanations[index] = normalizeMathText(
            question.wrongExplanations[index],
          );
        });
      }
      fixKnownFindings(question);
      return question;
    });
    balanceAnswersByTopic(remediationQuestions);
    remediationQuestions.forEach((question) => {
      sources[question.subject].questions.push(question);
    });
    return remediationQuestions;
  }

  return { appendRemediationSet };
});
