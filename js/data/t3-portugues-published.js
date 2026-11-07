/* Publicacao T3 de Portugues: lotes aprovados. */
(function () {
  const lots = [
    {
      topic: 'usos-c',
      topicName: 'Usos de ç',
      skill: 'aplicar-grafia-de-c',
      page: '9',
      idPrefix: 'usos_c',
      specs: [
        [
          'Complete: A crian____a brincou no quintal.',
          'criança',
          ['crianca', 'criansa', 'criançaa'],
          'A palavra criança é escrita com ç antes de a.',
        ],
        [
          'Qual palavra completa: O palhaço fez uma ____ engraçada?',
          'dança',
          ['dansaç', 'dansa', 'danca'],
          'A palavra dança é escrita com ç.',
        ],
        [
          'Complete: A professora pediu silên____io na leitura.',
          'silêncio',
          ['silencio', 'silênsio', 'silensio'],
          'Silêncio é escrito com c cedilhado antes de i.',
        ],
        [
          'Qual palavra está escrita corretamente?',
          'açúcar',
          ['asúcar', 'acúcar', 'açucar'],
          'A grafia correta é açúcar, com ç e acento.',
        ],
        [
          'Complete: O menino sentiu emo____ão ao receber o presente.',
          'emoção',
          ['emosão', 'emocão', 'emoçom'],
          'A palavra emoção é escrita com ç.',
        ],
        [
          'Qual palavra completa a frase: A ____ ficou pronta?',
          'refeição',
          ['refeiçãoo', 'refeisão', 'refeicão'],
          'A grafia correta é refeição, com ç.',
        ],
        [
          'Complete: A praça tem uma bonita ilumina____ão.',
          'iluminação',
          ['iluminacão', 'iluminaçom', 'iluminasão'],
          'Iluminação é escrita com ç na sílaba ção.',
        ],
        [
          'Qual palavra está escrita corretamente?',
          'coração',
          ['corasão', 'coracão', 'coraçom'],
          'A palavra coração é escrita com ç.',
        ],
        [
          'Complete: A inven____ão ajudou muitas pessoas.',
          'invenção',
          ['invensão', 'invencão', 'invençom'],
          'Invenção é escrita com ç na terminação ção.',
        ],
        [
          'Qual palavra completa: A criança fez uma observa____ão?',
          'observação',
          ['observaçom', 'observasão', 'observacão'],
          'A forma correta é observação, com ç.',
        ],
        [
          'Complete: O músico tocou uma can____ão conhecida.',
          'canção',
          ['cancão', 'cançom', 'cansão'],
          'A palavra canção é escrita com ç.',
        ],
        [
          'Qual palavra está escrita corretamente?',
          'lição',
          ['lisão', 'licão', 'liçom'],
          'A grafia correta é lição, com ç.',
        ],
        [
          'Complete: A solu____ão do problema foi encontrada.',
          'solução',
          ['solusão', 'solucão', 'soluçom'],
          'Solução é escrita com ç na terminação ção.',
        ],
        [
          'Qual palavra completa: A criança recebeu uma explica____ão?',
          'explicação',
          ['explicaçom', 'explicasão', 'explicacão'],
          'A forma correta é explicação, com ç.',
        ],
        [
          'Complete: A organiza____ão da sala ficou bonita.',
          'organização',
          ['organizacão', 'organizaçom', 'organisasão'],
          'Organização é escrita com ç na terminação ção.',
        ],
        [
          'Qual palavra está escrita corretamente?',
          'proteção',
          ['protesão', 'protecão', 'proteçom'],
          'A grafia correta é proteção, com ç.',
        ],
        [
          'Complete: A informa____ão estava no cartaz.',
          'informação',
          ['informasão', 'informacão', 'informaçom'],
          'Informação é escrita com ç na terminação ção.',
        ],
        [
          'Qual palavra completa: A popula____ão cresceu?',
          'população',
          ['populaçom', 'populasão', 'populacão'],
          'A palavra população é escrita com ç.',
        ],
        [
          'Complete: A conversa____ão foi respeitosa.',
          'conversação',
          ['conversacão', 'conversaçom', 'conversasão'],
          'Conversação é escrita com ç na terminação ção.',
        ],
        [
          'Qual resumo está correto sobre o uso de ç?',
          'a grafia deve ser conferida na palavra e no contexto',
          [
            'toda letra c recebe ç',
            'ç pode aparecer antes de qualquer vogal',
            'a pronúncia sozinha sempre resolve a grafia',
          ],
          'A escrita correta depende da palavra estudada e de seu contexto.',
        ],
      ],
    },
    {
      topic: 'verbos',
      topicName: 'Verbos',
      skill: 'identificar-e-usar-verbos-em-frases',
      page: '11',
      idPrefix: 'verbos',
      specs: [
        [
          'Na frase “A menina correu no pátio”, qual palavra indica uma ação?',
          'correu',
          ['menina', 'pátio', 'no'],
          'Correu indica a ação realizada pela menina.',
        ],
        [
          'Qual palavra é um verbo?',
          'brincar',
          ['quintal', 'bola', 'alegre'],
          'Brincar é uma palavra que indica ação.',
        ],
        [
          'Complete: Pedro ____ um livro.',
          'leu',
          ['atento', 'biblioteca', 'livro'],
          'Leu indica a ação realizada por Pedro.',
        ],
        [
          'Qual verbo completa melhor: “As crianças ____ no recreio”?',
          'jogam',
          ['recreio', 'crianças', 'divertidas'],
          'Jogam indica o que as crianças fazem no recreio.',
        ],
        [
          'Na frase “O gato dorme no tapete”, qual é o verbo?',
          'dorme',
          ['gato', 'tapete', 'no'],
          'Dorme indica a ação do gato.',
        ],
        [
          'Qual palavra indica uma ação em “Ana escreve uma carta”?',
          'escreve',
          ['uma', 'Ana', 'carta'],
          'Escreve indica a ação realizada por Ana.',
        ],
        [
          'Complete: Nós ____ uma história.',
          'contamos',
          ['curiosa', 'nós', 'história'],
          'Contamos indica a ação realizada por nós.',
        ],
        [
          'Qual verbo completa: “O pássaro ____ no céu”?',
          'voa',
          ['pássaro', 'céu', 'azul'],
          'Voa indica a ação do pássaro.',
        ],
        [
          'Na frase “A professora explicou a atividade”, qual é o verbo?',
          'explicou',
          ['professora', 'atividade', 'a'],
          'Explicou indica a ação da professora.',
        ],
        [
          'Qual palavra é um verbo no infinitivo?',
          'cantar',
          ['cantor', 'canção', 'bonita'],
          'Cantar é uma forma de verbo no infinitivo.',
        ],
        [
          'Complete: “Eu ____ água depois da corrida.”',
          'bebi',
          ['corrida', 'cansado', 'água'],
          'Bebi indica uma ação realizada por eu.',
        ],
        [
          'Qual verbo combina com “O sol ____ pela manhã”?',
          'nasce',
          ['manhã', 'sol', 'claro'],
          'Nasce indica o que o sol faz nessa frase.',
        ],
        [
          'Na frase “Marina abriu a janela”, qual palavra indica ação?',
          'abriu',
          ['Marina', 'janela', 'a'],
          'Abriu indica a ação realizada por Marina.',
        ],
        [
          'Qual palavra completa: “Eles ____ uma música”?',
          'ouviram',
          ['animada', 'música', 'eles'],
          'Ouviram indica a ação realizada por eles.',
        ],
        [
          'Qual é o verbo em “O menino desenha uma casa”?',
          'desenha',
          ['casa', 'uma', 'menino'],
          'Desenha indica a ação do menino.',
        ],
        [
          'Complete: “Nós ____ cedo para a escola.”',
          'chegamos',
          ['escola', 'cedo', 'nós'],
          'Chegamos indica a ação realizada por nós.',
        ],
        [
          'Qual palavra é um verbo?',
          'sorrir',
          ['sorriso', 'feliz', 'rosto'],
          'Sorrir indica uma ação.',
        ],
        [
          'Na frase “A turma aprendeu a lição”, qual é o verbo?',
          'aprendeu',
          ['a', 'turma', 'lição'],
          'Aprendeu indica a ação realizada pela turma.',
        ],
        [
          'Qual verbo completa: “O cachorro ____ quando ouviu o barulho”?',
          'latia',
          ['barulho', 'alto', 'cachorro'],
          'Latia indica a ação do cachorro nessa situação.',
        ],
        [
          'Qual resumo está correto sobre os verbos?',
          'verbos podem indicar ações em frases',
          [
            'todo verbo é um objeto',
            'verbos nomeiam apenas lugares',
            'verbos não aparecem em frases',
          ],
          'Verbos podem indicar ações e ajudam a construir o sentido das frases.',
        ],
      ],
    },
  ];

  function buildQuestions(lot) {
    return lot.specs.map(function (spec, index) {
      const question = spec[0];
      const correct = spec[1];
      const wrong = spec[2];
      const explanation = spec[3];
      const correctIndex = index % 4;
      const options = new Array(4);
      const wrongExplanations = {};
      [correct].concat(wrong).forEach(function (option, baseIndex) {
        const targetIndex = (baseIndex + correctIndex) % 4;
        options[targetIndex] = option;
        if (baseIndex > 0)
          wrongExplanations[targetIndex] =
            'Esta alternativa nao responde corretamente: ' + explanation;
      });
      return {
        schemaVersion: 'content-v1',
        id:
          '2026t3v1_pt_' +
          lot.idPrefix +
          '_' +
          String(index + 1).padStart(3, '0'),
        contentSetId: '2026-t3-v1',
        subject: 'portugues',
        topic: lot.topic,
        topicName: lot.topicName,
        question: question,
        options: options,
        correctIndex: correctIndex,
        explanation: explanation,
        wrongExplanations: wrongExplanations,
        skill: lot.skill,
        sourceRef: {
          referenceId: 'roteiro-estudos-av-mensal-t3-2026',
          section: 'Português',
          page: lot.page,
        },
        reviewStatus: 'published',
        version: 1,
      };
    });
  }

  const source = window.QuestionsDataSources.portugues;
  if (!source) return;
  const questions = lots.flatMap(buildQuestions);
  source.questions.push(...questions);
  questions.forEach(function (question) {
    source.topicMeta[question.topic] = { name: question.topicName, icon: '📚' };
  });
})();
