const QuestionsDB = (function () {
  const questions = [
  {
    id: "int_001",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
    question: "Onde Pedro e Ana foram no domingo?",
    options: ["À praia", "Ao parque", "À escola", "Ao shopping"],
    correctIndex: 1,
    explanation: "O texto diz claramente: 'Pedro e Ana foram ao parque no domingo.'",
    wrongExplanations: { 0: "À praia não é a resposta correta.", 2: "À escola não é a resposta correta.", 3: "Ao shopping não é a resposta correta." }
  },
  {
    id: "int_002",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
    question: "O que Pedro e Ana fizeram no parque?",
    options: ["Nadaram na piscina", "Jogaram futebol", "Brincaram no balanço e no escorregador", "Desenharam"],
    correctIndex: 2,
    explanation: "O texto diz: 'Eles brincaram no balanço e no escorregador.'",
    wrongExplanations: { 0: "Nadaram na piscina não é a resposta correta.", 1: "Jogaram futebol não é a resposta correta.", 3: "Desenharam não é a resposta correta." }
  },
  {
    id: "int_003",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
    question: "Qual sabor de sorvete Pedro e Ana comeram?",
    options: ["Morango", "Baunilha", "Limão", "Chocolate"],
    correctIndex: 3,
    explanation: "O texto diz: 'comeram sorvete de chocolate.'",
    wrongExplanations: { 0: "Morango não é a resposta correta.", 1: "Baunilha não é a resposta correta.", 2: "Limão não é a resposta correta." }
  },
  {
    id: "int_004",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
    question: "Como foi o dia de Pedro e Ana?",
    options: ["Chato e triste", "Cansativo", "Muito divertido", "Assustador"],
    correctIndex: 2,
    explanation: "O texto termina dizendo: 'Foi um dia muito divertido!'",
    wrongExplanations: { 0: "Chato e triste não é a resposta correta.", 1: "Cansativo não é a resposta correta.", 3: "Assustador não é a resposta correta." }
  },
  {
    id: "int_005",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
    question: "Em que dia da semana foi o passeio?",
    options: ["Sábado", "Segunda-feira", "Domingo", "Sexta-feira"],
    correctIndex: 2,
    explanation: "O texto começa dizendo 'foram ao parque no domingo'.",
    wrongExplanations: { 0: "Sábado não é a resposta correta.", 1: "Segunda-feira não é a resposta correta.", 3: "Sexta-feira não é a resposta correta." }
  },
  {
    id: "int_006",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
    question: "Como se chama o cachorro do texto?",
    options: ["Bob", "Rex", "Thor", "Pluto"],
    correctIndex: 1,
    explanation: "O texto diz: 'O cachorro Rex estava com fome.'",
    wrongExplanations: { 0: "Bob não é a resposta correta.", 2: "Thor não é a resposta correta.", 3: "Pluto não é a resposta correta." }
  },
  {
    id: "int_007",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
    question: "Por que Rex latiu?",
    options: ["Para brincar", "Porque estava assustado", "Para chamar a dona", "Porque viu outro cachorro"],
    correctIndex: 2,
    explanation: "O texto diz: 'Ele latiu para chamar a dona.'",
    wrongExplanations: { 0: "Para brincar não é a resposta correta.", 1: "Porque estava assustado não é a resposta correta.", 3: "Porque viu outro cachorro não é a resposta correta." }
  },
  {
    id: "int_008",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
    question: "O que a dona colocou na tigela de Rex?",
    options: ["Água", "Leite", "Osso", "Ração"],
    correctIndex: 3,
    explanation: "A dona colocou ração na tigela de Rex.",
    wrongExplanations: { 0: "Água não é a resposta correta.", 1: "Leite não é a resposta correta.", 2: "Osso não é a resposta correta." }
  },
  {
    id: "int_009",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
    question: "Como Rex ficou depois de comer?",
    options: ["Triste", "Feliz", "Com fome", "Assustado"],
    correctIndex: 1,
    explanation: "O texto diz que o cachorro abanou o rabo feliz.",
    wrongExplanations: { 0: "Triste não é a resposta correta.", 2: "Com fome não é a resposta correta.", 3: "Assustado não é a resposta correta." }
  },
  {
    id: "int_010",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
    question: "Onde a dona foi buscar a ração?",
    options: ["No quarto", "Na cozinha", "No banheiro", "Na sala"],
    correctIndex: 1,
    explanation: "O texto diz 'A dona foi até a cozinha e colocou ração'.",
    wrongExplanations: { 0: "No quarto não é a resposta correta.", 2: "No banheiro não é a resposta correta.", 3: "Na sala não é a resposta correta." }
  },
  {
    id: "int_011",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "Flora adorava estudar as plantas do jardim. Um dia, ela encontrou uma borboleta azul e resolveu desenhá-la. Quando terminou, mostrou o desenho para a mãe. A mãe elogiou: 'Está muito bonito'.",
    question: "O que Flora encontrou no jardim?",
    options: ["Uma joaninha", "Uma flor", "Uma borboleta azul", "Um pássaro"],
    correctIndex: 2,
    explanation: "O texto diz que Flora encontrou uma borboleta azul.",
    wrongExplanations: { 0: "Uma joaninha não é a resposta correta.", 1: "Uma flor não é a resposta correta.", 3: "Um pássaro não é a resposta correta." }
  },
  {
    id: "int_012",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "Flora adorava estudar as plantas do jardim. Um dia, ela encontrou uma borboleta azul e resolveu desenhá-la. Quando terminou, mostrou o desenho para a mãe. A mãe elogiou: 'Está muito bonito'.",
    question: "O que Flora fez com a borboleta?",
    options: ["Cantou para ela", "Desenhou-a", "Comeu-a", "Pegou-a"],
    correctIndex: 1,
    explanation: "O texto diz que ela resolveu desenhá-la.",
    wrongExplanations: { 0: "Cantou para ela não é a resposta correta.", 2: "Comeu-a não é a resposta correta.", 3: "Pegou-a não é a resposta correta." }
  },
  {
    id: "int_013",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "Flora adorava estudar as plantas do jardim. Um dia, ela encontrou uma borboleta azul e resolveu desenhá-la. Quando terminou, mostrou o desenho para a mãe. A mãe elogiou: 'Está muito bonito'.",
    question: "Quem elogiou o desenho de Flora?",
    options: ["O pai", "A irmã", "A mãe", "A amiga"],
    correctIndex: 2,
    explanation: "O texto diz: 'A mãe elogiou'.",
    wrongExplanations: { 0: "O pai não é a resposta correta.", 1: "A irmã não é a resposta correta.", 3: "A amiga não é a resposta correta." }
  },
  {
    id: "int_014",
    subject: "portugues",
    topic: "interpretacao",
    topicName: "Interpretação de Texto",
    text: "Flora adorava estudar as plantas do jardim. Um dia, ela encontrou uma borboleta azul e resolveu desenhá-la. Quando terminou, mostrou o desenho para a mãe. A mãe elogiou: 'Está muito bonito'.",
    question: "Como foi o desenho de Flora?",
    options: ["Muito feio", "Muito bonito", "Medíocre", "Não terminou"],
    correctIndex: 1,
    explanation: "A mãe elogiou: 'Está muito bonito'.",
    wrongExplanations: { 0: "Muito feio não é a resposta correta.", 2: "Medíocre não é a resposta correta.", 3: "Não terminou não é a resposta correta." }
  },
  {
    id: "ord_015",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra vem primeiro em ordem alfabética?",
    options: ["bola", "amigo", "carro", "abacate"],
    correctIndex: 3,
    explanation: "'abacate' vem antes das outras no alfabeto.",
    wrongExplanations: { 0: "bola não é a resposta correta.", 1: "amigo não é a resposta correta.", 2: "carro não é a resposta correta." }
  },
  {
    id: "ord_016",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra vem por último em ordem alfabética?",
    options: ["uva", "urso", "uma", "unha"],
    correctIndex: 0,
    explanation: "'uva' vem por último entre essas opções.",
    wrongExplanations: { 1: "urso não é a resposta correta.", 2: "uma não é a resposta correta.", 3: "unha não é a resposta correta." }
  },
  {
    id: "ord_017",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra aparece primeiro no alfabeto?",
    options: ["zebra", "xadrez", "xale", "xícara"],
    correctIndex: 1,
    explanation: "'xadrez' vem antes de 'xale' e 'xícara'.",
    wrongExplanations: { 0: "zebra não é a resposta correta.", 2: "xale não é a resposta correta.", 3: "xícara não é a resposta correta." }
  },
  {
    id: "ord_018",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra aparece antes no dicionário?",
    options: ["janela", "laranja", "jardim", "joia"],
    correctIndex: 0,
    explanation: "'janela' vem antes de 'jardim', 'joia' e 'laranja'.",
    wrongExplanations: { 1: "laranja não é a resposta correta.", 2: "jardim não é a resposta correta.", 3: "joia não é a resposta correta." }
  },
  {
    id: "ord_019",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra vem primeiro em ordem alfabética?",
    options: ["cego", "cebola", "celular", "cedro"],
    correctIndex: 1,
    explanation: "'cebola' vem antes de 'cedro', 'cego' e 'celular'.",
    wrongExplanations: { 0: "cego não é a resposta correta.", 2: "celular não é a resposta correta.", 3: "cedro não é a resposta correta." }
  },
  {
    id: "ord_020",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra vem por último em ordem alfabética?",
    options: ["manga", "mais", "mala", "maçã"],
    correctIndex: 0,
    explanation: "'manga' vem por último entre essas palavras.",
    wrongExplanations: { 1: "mais não é a resposta correta.", 2: "mala não é a resposta correta.", 3: "maçã não é a resposta correta." }
  },
  {
    id: "ord_021",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra aparece primeiro?",
    options: ["amor", "amigo", "amarelo", "amanhã"],
    correctIndex: 3,
    explanation: "'amanhã' vem antes das outras palavras que começam com 'am'.",
    wrongExplanations: { 0: "amor não é a resposta correta.", 1: "amigo não é a resposta correta.", 2: "amarelo não é a resposta correta." }
  },
  {
    id: "ord_022",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra aparece primeiro no alfabeto?",
    options: ["bola", "balão", "bala", "barco"],
    correctIndex: 2,
    explanation: "'bala' vem antes de 'balão', 'bola', e 'barco'.",
    wrongExplanations: { 0: "bola não é a resposta correta.", 1: "balão não é a resposta correta.", 3: "barco não é a resposta correta." }
  },
  {
    id: "ord_023",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra vem primeiro em ordem alfabética?",
    options: ["pato", "pata", "paz", "pano"],
    correctIndex: 3,
    explanation: "'pano' vem antes de 'pata', 'pato' e 'paz'.",
    wrongExplanations: { 0: "pato não é a resposta correta.", 1: "pata não é a resposta correta.", 2: "paz não é a resposta correta." }
  },
  {
    id: "ord_024",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra vem por último em ordem alfabética?",
    options: ["lápis", "lanterna", "laranja", "lago"],
    correctIndex: 2,
    explanation: "'laranja' vem por último entre essas palavras.",
    wrongExplanations: { 0: "lápis não é a resposta correta.", 1: "lanterna não é a resposta correta.", 3: "lago não é a resposta correta." }
  },
  {
    id: "ord_025",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra aparece antes?",
    options: ["rato", "rampa", "raridade", "raio"],
    correctIndex: 3,
    explanation: "'raio' vem antes de 'rampa', 'raridade' e 'rato'.",
    wrongExplanations: { 0: "rato não é a resposta correta.", 1: "rampa não é a resposta correta.", 2: "raridade não é a resposta correta." }
  },
  {
    id: "ord_026",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra vem por último em ordem alfabética?",
    options: ["sapo", "sala", "saga", "sinal"],
    correctIndex: 3,
    explanation: "'sinal' vem por último entre essas opções.",
    wrongExplanations: { 0: "sapo não é a resposta correta.", 1: "sala não é a resposta correta.", 2: "saga não é a resposta correta." }
  },
  {
    id: "ord_027",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra vem primeiro no alfabeto?",
    options: ["uva", "urso", "umbigo", "uvas"],
    correctIndex: 2,
    explanation: "'umbigo' vem antes de 'urso', 'uva', e 'uvas'.",
    wrongExplanations: { 0: "uva não é a resposta correta.", 1: "urso não é a resposta correta.", 3: "uvas não é a resposta correta." }
  },
  {
    id: "ord_028",
    subject: "portugues",
    topic: "ordem_alfabetica",
    topicName: "Ordem Alfabética",
    question: "Qual palavra aparece primeiro?",
    options: ["foca", "fofo", "fogo", "foge"],
    correctIndex: 0,
    explanation: "'foca' vem antes de 'fofo', 'fogo', e 'foge'.",
    wrongExplanations: { 1: "fofo não é a resposta correta.", 2: "fogo não é a resposta correta.", 3: "foge não é a resposta correta." }
  },
  {
    id: "sil_029",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra tem 2 sílabas?",
    options: ["casa", "janela", "amigo", "paralelepípedo"],
    correctIndex: 0,
    explanation: "'casa' tem duas sílabas: ca-sa.",
    wrongExplanations: { 1: "janela não é a resposta correta.", 2: "amigo não é a resposta correta.", 3: "paralelepípedo não é a resposta correta." }
  },
  {
    id: "sil_030",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra tem 3 sílabas?",
    options: ["sol", "flor", "banana", "paz"],
    correctIndex: 2,
    explanation: "'banana' tem três sílabas: ba-na-na.",
    wrongExplanations: { 0: "sol não é a resposta correta.", 1: "flor não é a resposta correta.", 3: "paz não é a resposta correta." }
  },
  {
    id: "sil_031",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra é dissílaba?",
    options: ["livro", "menino", "cadeira", "janela"],
    correctIndex: 0,
    explanation: "'livro' tem duas sílabas: li-vro.",
    wrongExplanations: { 1: "menino não é a resposta correta.", 2: "cadeira não é a resposta correta.", 3: "janela não é a resposta correta." }
  },
  {
    id: "sil_032",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra é trissílaba?",
    options: ["gato", "cachorro", "sol", "cama"],
    correctIndex: 1,
    explanation: "'cachorro' tem três sílabas: ca-chor-ro.",
    wrongExplanations: { 0: "gato não é a resposta correta.", 2: "sol não é a resposta correta.", 3: "cama não é a resposta correta." }
  },
  {
    id: "sil_033",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra tem sílaba tônica na última sílaba?",
    options: ["café", "mesa", "fácil", "janela"],
    correctIndex: 0,
    explanation: "'café' é oxítona e a sílaba tônica é 'fé'.",
    wrongExplanations: { 1: "mesa não é a resposta correta.", 2: "fácil não é a resposta correta.", 3: "janela não é a resposta correta." }
  },
  {
    id: "sil_034",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra tem sílaba tônica na penúltima sílaba?",
    options: ["amigo", "café", "papel", "jornal"],
    correctIndex: 0,
    explanation: "'amigo' é paroxítona e a sílaba tônica é 'mi'.",
    wrongExplanations: { 1: "café não é a resposta correta.", 2: "papel não é a resposta correta.", 3: "jornal não é a resposta correta." }
  },
  {
    id: "sil_035",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra é proparoxítona?",
    options: ["música", "casa", "futebol", "samba"],
    correctIndex: 0,
    explanation: "'música' é proparoxítona.",
    wrongExplanations: { 1: "casa não é a resposta correta.", 2: "futebol não é a resposta correta.", 3: "samba não é a resposta correta." }
  },
  {
    id: "sil_036",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra tem sílaba tônica na antepenúltima sílaba?",
    options: ["médico", "amigo", "cidade", "futebol"],
    correctIndex: 0,
    explanation: "'médico' é proparoxítona.",
    wrongExplanations: { 1: "amigo não é a resposta correta.", 2: "cidade não é a resposta correta.", 3: "futebol não é a resposta correta." }
  },
  {
    id: "sil_037",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra é monossílaba?",
    options: ["mar", "tigre", "cavalo", "verdade"],
    correctIndex: 0,
    explanation: "'mar' tem uma sílaba.",
    wrongExplanations: { 1: "tigre não é a resposta correta.", 2: "cavalo não é a resposta correta.", 3: "verdade não é a resposta correta." }
  },
  {
    id: "sil_038",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra tem duas sílabas?",
    options: ["sol", "casa", "flor", "paz"],
    correctIndex: 1,
    explanation: "'casa' tem duas sílabas: ca-sa.",
    wrongExplanations: { 0: "sol não é a resposta correta.", 2: "flor não é a resposta correta.", 3: "paz não é a resposta correta." }
  },
  {
    id: "sil_039",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra é trissílaba?",
    options: ["escola", "junho", "pode", "fácil"],
    correctIndex: 0,
    explanation: "'escola' tem três sílabas.",
    wrongExplanations: { 1: "junho não é a resposta correta.", 2: "pode não é a resposta correta.", 3: "fácil não é a resposta correta." }
  },
  {
    id: "sil_040",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra tem sílaba tônica na última sílaba?",
    options: ["você", "amigo", "mesa", "carro"],
    correctIndex: 0,
    explanation: "'você' é oxítona com acento na última sílaba.",
    wrongExplanations: { 1: "amigo não é a resposta correta.", 2: "mesa não é a resposta correta.", 3: "carro não é a resposta correta." }
  },
  {
    id: "sil_041",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra tem sílaba tônica na penúltima sílaba?",
    options: ["telefone", "vovó", "papel", "paz"],
    correctIndex: 0,
    explanation: "'telefone' é paroxítona.",
    wrongExplanations: { 1: "vovó não é a resposta correta.", 2: "papel não é a resposta correta.", 3: "paz não é a resposta correta." }
  },
  {
    id: "sil_042",
    subject: "portugues",
    topic: "classificacao_silabica",
    topicName: "Classificação Silábica",
    question: "Qual palavra tem semivogal?",
    options: ["água", "gato", "mesa", "pato"],
    correctIndex: 0,
    explanation: "'água' tem semivogal no encontro 'ua'.",
    wrongExplanations: { 1: "gato não é a resposta correta.", 2: "mesa não é a resposta correta.", 3: "pato não é a resposta correta." }
  },
  {
    id: "enc_043",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra contém um encontro vocálico?",
    options: ["pai", "polo", "mesa", "bom"],
    correctIndex: 0,
    explanation: "'pai' contém o encontro vocálico 'ai'.",
    wrongExplanations: { 1: "polo não é a resposta correta.", 2: "mesa não é a resposta correta.", 3: "bom não é a resposta correta." }
  },
  {
    id: "enc_044",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual opção mostra um encontro vocálico?",
    options: ["ta", "mai", "ca", "pé"],
    correctIndex: 1,
    explanation: "'mai' forma um encontro vocálico, como em 'maio'.",
    wrongExplanations: { 0: "ta não é a resposta correta.", 2: "ca não é a resposta correta.", 3: "pé não é a resposta correta." }
  },
  {
    id: "enc_045",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra tem ditongo?",
    options: ["sai", "casa", "copo", "luz"],
    correctIndex: 0,
    explanation: "'sai' tem ditongo 'ai'.",
    wrongExplanations: { 1: "casa não é a resposta correta.", 2: "copo não é a resposta correta.", 3: "luz não é a resposta correta." }
  },
  {
    id: "enc_046",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra tem hiato?",
    options: ["saída", "pai", "luz", "mão"],
    correctIndex: 0,
    explanation: "'saída' tem hiato entre 'a' e 'í'.",
    wrongExplanations: { 1: "pai não é a resposta correta.", 2: "luz não é a resposta correta.", 3: "mão não é a resposta correta." }
  },
  {
    id: "enc_047",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual par de vogais forma encontro vocálico?",
    options: ["ta", "pai", "pé", "sol"],
    correctIndex: 1,
    explanation: "'pai' tem encontro vocálico 'ai'.",
    wrongExplanations: { 0: "ta não é a resposta correta.", 2: "pé não é a resposta correta.", 3: "sol não é a resposta correta." }
  },
  {
    id: "enc_048",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra apresenta ditongo?",
    options: ["cai", "cela", "cabo", "cara"],
    correctIndex: 0,
    explanation: "'cai' apresenta ditongo 'ai'.",
    wrongExplanations: { 1: "cela não é a resposta correta.", 2: "cabo não é a resposta correta.", 3: "cara não é a resposta correta." }
  },
  {
    id: "enc_049",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra apresenta hiato?",
    options: ["poesia", "pao", "pato", "pare"],
    correctIndex: 0,
    explanation: "'poesia' tem hiato entre 'o' e 'e'.",
    wrongExplanations: { 1: "pao não é a resposta correta.", 2: "pato não é a resposta correta.", 3: "pare não é a resposta correta." }
  },
  {
    id: "enc_050",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra contém encontro vocálico?",
    options: ["coelho", "carro", "pede", "casa"],
    correctIndex: 0,
    explanation: "'coelho' tem encontro vocálico 'oe'.",
    wrongExplanations: { 1: "carro não é a resposta correta.", 2: "pede não é a resposta correta.", 3: "casa não é a resposta correta." }
  },
  {
    id: "enc_051",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra contém ditongo crescente?",
    options: ["quase", "cama", "vento", "festa"],
    correctIndex: 0,
    explanation: "'quase' contém o ditongo crescente 'ua'.",
    wrongExplanations: { 1: "cama não é a resposta correta.", 2: "vento não é a resposta correta.", 3: "festa não é a resposta correta." }
  },
  {
    id: "enc_052",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra apresenta hiato?",
    options: ["saúde", "mesa", "lobo", "sinal"],
    correctIndex: 0,
    explanation: "'saúde' tem hiato entre 'a' e 'ú'.",
    wrongExplanations: { 1: "mesa não é a resposta correta.", 2: "lobo não é a resposta correta.", 3: "sinal não é a resposta correta." }
  },
  {
    id: "enc_053",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra tem encontro vocálico?",
    options: ["dia", "livro", "pipa", "rato"],
    correctIndex: 0,
    explanation: "'dia' tem encontro vocálico 'ia'.",
    wrongExplanations: { 1: "livro não é a resposta correta.", 2: "pipa não é a resposta correta.", 3: "rato não é a resposta correta." }
  },
  {
    id: "enc_054",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra usa encontro vocálico?",
    options: ["feio", "fato", "feso", "funo"],
    correctIndex: 0,
    explanation: "'feio' tem encontro vocálico 'ei'.",
    wrongExplanations: { 1: "fato não é a resposta correta.", 2: "feso não é a resposta correta.", 3: "funo não é a resposta correta." }
  },
  {
    id: "enc_055",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra tem encontro vocálico nasal?",
    options: ["mãe", "mesa", "bola", "cabo"],
    correctIndex: 0,
    explanation: "'mãe' tem encontro vocálico nasal entre 'ã' e 'e'.",
    wrongExplanations: { 1: "mesa não é a resposta correta.", 2: "bola não é a resposta correta.", 3: "cabo não é a resposta correta." }
  },
  {
    id: "enc_056",
    subject: "portugues",
    topic: "encontros_vocais",
    topicName: "Encontros Vocálicos",
    question: "Qual palavra tem hiato?",
    options: ["cooperar", "copo", "casa", "canto"],
    correctIndex: 0,
    explanation: "'cooperar' tem hiato entre 'o' e 'o'.",
    wrongExplanations: { 1: "copo não é a resposta correta.", 2: "casa não é a resposta correta.", 3: "canto não é a resposta correta." }
  },
  {
    id: "lez_057",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra usa 'z' corretamente?",
    options: ["azul", "asul", "azulh", "azur"],
    correctIndex: 0,
    explanation: "'azul' usa 'z' corretamente.",
    wrongExplanations: { 1: "asul não é a resposta correta.", 2: "azulh não é a resposta correta.", 3: "azur não é a resposta correta." }
  },
  {
    id: "lez_058",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra é escrita com 'z'?",
    options: ["zero", "sero", "zaro", "saro"],
    correctIndex: 0,
    explanation: "'zero' é escrita com 'z'.",
    wrongExplanations: { 1: "sero não é a resposta correta.", 2: "zaro não é a resposta correta.", 3: "saro não é a resposta correta." }
  },
  {
    id: "lez_059",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual opção contém a letra Z?",
    options: ["casa", "zebra", "seda", "nada"],
    correctIndex: 1,
    explanation: "'zebra' contém a letra Z.",
    wrongExplanations: { 0: "casa não é a resposta correta.", 2: "seda não é a resposta correta.", 3: "nada não é a resposta correta." }
  },
  {
    id: "lez_060",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra não usa a letra Z?",
    options: ["zangado", "casa", "azeite", "zona"],
    correctIndex: 1,
    explanation: "'casa' não usa a letra Z.",
    wrongExplanations: { 0: "zangado não é a resposta correta.", 2: "azeite não é a resposta correta.", 3: "zona não é a resposta correta." }
  },
  {
    id: "lez_061",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra é escrita com Z no final?",
    options: ["luz", "luzs", "luze", "lu"],
    correctIndex: 0,
    explanation: "'luz' termina com Z.",
    wrongExplanations: { 1: "luzs não é a resposta correta.", 2: "luze não é a resposta correta.", 3: "lu não é a resposta correta." }
  },
  {
    id: "lez_062",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra usa Z no meio?",
    options: ["arroz", "luz", "casa", "fazer"],
    correctIndex: 3,
    explanation: "'fazer' usa Z no meio da palavra.",
    wrongExplanations: { 0: "arroz não é a resposta correta.", 1: "luz não é a resposta correta.", 2: "casa não é a resposta correta." }
  },
  {
    id: "lez_063",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra começa com Z?",
    options: ["zebra", "cabra", "sabra", "xebra"],
    correctIndex: 0,
    explanation: "'zebra' começa com Z.",
    wrongExplanations: { 1: "cabra não é a resposta correta.", 2: "sabra não é a resposta correta.", 3: "xebra não é a resposta correta." }
  },
  {
    id: "lez_064",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra é escrita com Z?",
    options: ["azeite", "aseite", "azite", "asite"],
    correctIndex: 0,
    explanation: "'azeite' é escrita com Z.",
    wrongExplanations: { 1: "aseite não é a resposta correta.", 2: "azite não é a resposta correta.", 3: "asite não é a resposta correta." }
  },
  {
    id: "lez_065",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual opção é correta com Z?",
    options: ["zero", "xero", "cero", "zaro"],
    correctIndex: 0,
    explanation: "'zero' é escrita com Z.",
    wrongExplanations: { 1: "xero não é a resposta correta.", 2: "cero não é a resposta correta.", 3: "zaro não é a resposta correta." }
  },
  {
    id: "lez_066",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra termina com Z?",
    options: ["luz", "luzs", "lúz", "luzão"],
    correctIndex: 0,
    explanation: "'luz' termina com Z.",
    wrongExplanations: { 1: "luzs não é a resposta correta.", 2: "lúz não é a resposta correta.", 3: "luzão não é a resposta correta." }
  },
  {
    id: "lez_067",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra usa Z no começo e é comum?",
    options: ["zebra", "sera", "xebra", "zuma"],
    correctIndex: 0,
    explanation: "'zebra' começa com Z.",
    wrongExplanations: { 1: "sera não é a resposta correta.", 2: "xebra não é a resposta correta.", 3: "zuma não é a resposta correta." }
  },
  {
    id: "lez_068",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra contém Z e é um som de Z?",
    options: ["zelo", "celo", "xelo", "zalo"],
    correctIndex: 0,
    explanation: "'zelo' usa Z e tem som de Z.",
    wrongExplanations: { 1: "celo não é a resposta correta.", 2: "xelo não é a resposta correta.", 3: "zalo não é a resposta correta." }
  },
  {
    id: "lez_069",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra com Z está correta?",
    options: ["casa", "zara", "zebra", "zic"],
    correctIndex: 2,
    explanation: "'zebra' é uma palavra correta com Z.",
    wrongExplanations: { 0: "casa não é a resposta correta.", 1: "zara não é a resposta correta.", 3: "zic não é a resposta correta." }
  },
  {
    id: "lez_070",
    subject: "portugues",
    topic: "letra_z",
    topicName: "A letra Z",
    question: "Qual palavra usa Z no meio de 'arroz'?",
    options: ["arroz", "aroz", "arozz", "aros"],
    correctIndex: 0,
    explanation: "'arroz' usa Z no meio da palavra.",
    wrongExplanations: { 1: "aroz não é a resposta correta.", 2: "arozz não é a resposta correta.", 3: "aros não é a resposta correta." }
  },
  {
    id: "les_071",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra é escrita com S no começo?",
    options: ["sapato", "zapato", "xapato", "sopato"],
    correctIndex: 0,
    explanation: "'sapato' começa com S.",
    wrongExplanations: { 1: "zapato não é a resposta correta.", 2: "xapato não é a resposta correta.", 3: "sopato não é a resposta correta." }
  },
  {
    id: "les_072",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra usa S no meio?",
    options: ["casa", "cata", "canto", "cano"],
    correctIndex: 0,
    explanation: "'casa' usa S no meio.",
    wrongExplanations: { 1: "cata não é a resposta correta.", 2: "canto não é a resposta correta.", 3: "cano não é a resposta correta." }
  },
  {
    id: "les_073",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra está correta com S?",
    options: ["sapo", "zapo", "xapo", "sappo"],
    correctIndex: 0,
    explanation: "'sapo' usa S corretamente.",
    wrongExplanations: { 1: "zapo não é a resposta correta.", 2: "xapo não é a resposta correta.", 3: "sappo não é a resposta correta." }
  },
  {
    id: "les_074",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra está escrita corretamente com SS?",
    options: ["massa", "masa", "messa", "masso"],
    correctIndex: 0,
    explanation: "'massa' é uma palavra escrita corretamente com SS.",
    wrongExplanations: { 1: "masa não é a resposta correta.", 2: "messa não é a resposta correta.", 3: "masso não é a resposta correta." }
  },
  {
    id: "les_075",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra termina com S?",
    options: ["lápis", "lapi", "lapiz", "lapiseira"],
    correctIndex: 0,
    explanation: "'lápis' termina com S.",
    wrongExplanations: { 1: "lapi não é a resposta correta.", 2: "lapiz não é a resposta correta.", 3: "lapiseira não é a resposta correta." }
  },
  {
    id: "les_076",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra inicia com S?",
    options: ["sol", "zol", "xol", "soll"],
    correctIndex: 0,
    explanation: "'sol' inicia com S.",
    wrongExplanations: { 1: "zol não é a resposta correta.", 2: "xol não é a resposta correta.", 3: "soll não é a resposta correta." }
  },
  {
    id: "les_077",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra usa S e tem som de Z?",
    options: ["mesa", "meza", "meça", "miça"],
    correctIndex: 0,
    explanation: "Em 'mesa', a letra S entre vogais tem som de Z.",
    wrongExplanations: { 1: "meza não é a resposta correta.", 2: "meça não é a resposta correta.", 3: "miça não é a resposta correta." }
  },
  {
    id: "les_078",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra é escrita com SS?",
    options: ["passo", "paso", "pato", "pase"],
    correctIndex: 0,
    explanation: "'passo' é uma palavra escrita corretamente com SS.",
    wrongExplanations: { 1: "paso não é a resposta correta.", 2: "pato não é a resposta correta.", 3: "pase não é a resposta correta." }
  },
  {
    id: "les_079",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra usa S no meio?",
    options: ["cas", "caz", "caso", "casz"],
    correctIndex: 2,
    explanation: "'caso' usa S no meio da palavra.",
    wrongExplanations: { 0: "cas não é a resposta correta.", 1: "caz não é a resposta correta.", 3: "casz não é a resposta correta." }
  },
  {
    id: "les_080",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra começa com S e é comum?",
    options: ["sapo", "zapoo", "xapo", "chapo"],
    correctIndex: 0,
    explanation: "'sapo' começa com S e é comum.",
    wrongExplanations: { 1: "zapoo não é a resposta correta.", 2: "xapo não é a resposta correta.", 3: "chapo não é a resposta correta." }
  },
  {
    id: "les_081",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra está escrita corretamente com S?",
    options: ["sclaro", "escola", "ezcola", "ecola"],
    correctIndex: 1,
    explanation: "'escola' é escrita corretamente com S.",
    wrongExplanations: { 0: "sclaro não é a resposta correta.", 2: "ezcola não é a resposta correta.", 3: "ecola não é a resposta correta." }
  },
  {
    id: "les_082",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra tem S no meio de 'ursos'?",
    options: ["ursos", "urzos", "urss", "urcos"],
    correctIndex: 0,
    explanation: "'ursos' usa S no meio da palavra.",
    wrongExplanations: { 1: "urzos não é a resposta correta.", 2: "urss não é a resposta correta.", 3: "urcos não é a resposta correta." }
  },
  {
    id: "les_083",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra está escrita corretamente com S duplo?",
    options: ["passar", "pasar", "pessar", "rassar"],
    correctIndex: 0,
    explanation: "'passar' é uma palavra escrita corretamente com S duplo.",
    wrongExplanations: { 1: "pasar não é a resposta correta.", 2: "pessar não é a resposta correta.", 3: "rassar não é a resposta correta." }
  },
  {
    id: "les_084",
    subject: "portugues",
    topic: "letra_s",
    topicName: "A letra S",
    question: "Qual palavra usa S e é escrita corretamente?",
    options: ["sala", "zala", "xala", "sála"],
    correctIndex: 0,
    explanation: "'sala' é escrita corretamente com S.",
    wrongExplanations: { 1: "zala não é a resposta correta.", 2: "xala não é a resposta correta.", 3: "sála não é a resposta correta." }
  },
  {
    id: "mas_085",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual é o masculino de 'menina'?",
    options: ["menino", "meninoa", "menininha", "meninão"],
    correctIndex: 0,
    explanation: "O masculino de 'menina' é 'menino'.",
    wrongExplanations: { 1: "meninoa não é a resposta correta.", 2: "menininha não é a resposta correta.", 3: "meninão não é a resposta correta." }
  },
  {
    id: "mas_086",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual é o masculino de 'gata'?",
    options: ["gato", "gatoo", "gata", "gatal"],
    correctIndex: 0,
    explanation: "O masculino de 'gata' é 'gato'.",
    wrongExplanations: { 1: "gatoo não é a resposta correta.", 2: "gata não é a resposta correta.", 3: "gatal não é a resposta correta." }
  },
  {
    id: "mas_087",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Escolha o substantivo masculino:",
    options: ["menino", "menina", "garota", "menininha"],
    correctIndex: 0,
    explanation: "'menino' é um substantivo masculino.",
    wrongExplanations: { 1: "menina não é a resposta correta.", 2: "garota não é a resposta correta.", 3: "menininha não é a resposta correta." }
  },
  {
    id: "mas_088",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual é o masculino de 'rainha'?",
    options: ["rei", "reia", "rainho", "rainhão"],
    correctIndex: 0,
    explanation: "O masculino de 'rainha' é 'rei'.",
    wrongExplanations: { 1: "reia não é a resposta correta.", 2: "rainho não é a resposta correta.", 3: "rainhão não é a resposta correta." }
  },
  {
    id: "mas_089",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual é o masculino de 'princesa'?",
    options: ["príncipe", "princesa", "princesinho", "princeza"],
    correctIndex: 0,
    explanation: "O masculino de 'princesa' é 'príncipe'.",
    wrongExplanations: { 1: "princesa não é a resposta correta.", 2: "princesinho não é a resposta correta.", 3: "princeza não é a resposta correta." }
  },
  {
    id: "mas_090",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual palavra é masculina?",
    options: ["garoto", "garota", "menina", "garotinha"],
    correctIndex: 0,
    explanation: "'garoto' é um substantivo masculino.",
    wrongExplanations: { 1: "garota não é a resposta correta.", 2: "menina não é a resposta correta.", 3: "garotinha não é a resposta correta." }
  },
  {
    id: "mas_091",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual é o masculino de 'duquesa'?",
    options: ["duque", "duquesa", "duquinha", "duqueza"],
    correctIndex: 0,
    explanation: "O masculino de 'duquesa' é 'duque'.",
    wrongExplanations: { 1: "duquesa não é a resposta correta.", 2: "duquinha não é a resposta correta.", 3: "duqueza não é a resposta correta." }
  },
  {
    id: "mas_092",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual é o masculino de 'senhora'?",
    options: ["senhor", "senhora", "senhorita", "senhoro"],
    correctIndex: 0,
    explanation: "O masculino de 'senhora' é 'senhor'.",
    wrongExplanations: { 1: "senhora não é a resposta correta.", 2: "senhorita não é a resposta correta.", 3: "senhoro não é a resposta correta." }
  },
  {
    id: "mas_093",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual palavra é o masculino de 'ovelha'?",
    options: ["carneiro", "ovelha", "ovelhinha", "ovelhão"],
    correctIndex: 0,
    explanation: "O masculino de 'ovelha' é 'carneiro'.",
    wrongExplanations: { 1: "ovelha não é a resposta correta.", 2: "ovelhinha não é a resposta correta.", 3: "ovelhão não é a resposta correta." }
  },
  {
    id: "mas_094",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual é o masculino de 'atriz'?",
    options: ["ator", "atriz", "atrice", "atorr"],
    correctIndex: 0,
    explanation: "O masculino de 'atriz' é 'ator'.",
    wrongExplanations: { 1: "atriz não é a resposta correta.", 2: "atrice não é a resposta correta.", 3: "atorr não é a resposta correta." }
  },
  {
    id: "mas_095",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual é o masculino de 'amiga'?",
    options: ["amigo", "amiga", "amigoa", "amigal"],
    correctIndex: 0,
    explanation: "O masculino de 'amiga' é 'amigo'.",
    wrongExplanations: { 1: "amiga não é a resposta correta.", 2: "amigoa não é a resposta correta.", 3: "amigal não é a resposta correta." }
  },
  {
    id: "mas_096",
    subject: "portugues",
    topic: "substantivos_masculinos",
    topicName: "Substantivos Masculinos",
    question: "Qual é o masculino de 'cabeleireira'?",
    options: ["cabeleireiro", "cabeleireira", "cabeleireiroa", "cabeleireiral"],
    correctIndex: 0,
    explanation: "O masculino de 'cabeleireira' é 'cabeleireiro'.",
    wrongExplanations: { 1: "cabeleireira não é a resposta correta.", 2: "cabeleireiroa não é a resposta correta.", 3: "cabeleireiral não é a resposta correta." }
  },
  {
    id: "fem_097",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual é o feminino de 'menino'?",
    options: ["menina", "menino", "meninoa", "meninão"],
    correctIndex: 0,
    explanation: "O feminino de 'menino' é 'menina'.",
    wrongExplanations: { 1: "menino não é a resposta correta.", 2: "meninoa não é a resposta correta.", 3: "meninão não é a resposta correta." }
  },
  {
    id: "fem_098",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual é o feminino de 'gato'?",
    options: ["gata", "gato", "gatoo", "gatal"],
    correctIndex: 0,
    explanation: "O feminino de 'gato' é 'gata'.",
    wrongExplanations: { 1: "gato não é a resposta correta.", 2: "gatoo não é a resposta correta.", 3: "gatal não é a resposta correta." }
  },
  {
    id: "fem_099",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Escolha o substantivo feminino:",
    options: ["menina", "menino", "meninos", "garoto"],
    correctIndex: 0,
    explanation: "'menina' é um substantivo feminino.",
    wrongExplanations: { 1: "menino não é a resposta correta.", 2: "meninos não é a resposta correta.", 3: "garoto não é a resposta correta." }
  },
  {
    id: "fem_100",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual é o feminino de 'rei'?",
    options: ["rainha", "reia", "rein", "reino"],
    correctIndex: 0,
    explanation: "O feminino de 'rei' é 'rainha'.",
    wrongExplanations: { 1: "reia não é a resposta correta.", 2: "rein não é a resposta correta.", 3: "reino não é a resposta correta." }
  },
  {
    id: "fem_101",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual é o feminino de 'príncipe'?",
    options: ["princesa", "princesinho", "principe", "princeza"],
    correctIndex: 0,
    explanation: "O feminino de 'príncipe' é 'princesa'.",
    wrongExplanations: { 1: "princesinho não é a resposta correta.", 2: "principe não é a resposta correta.", 3: "princeza não é a resposta correta." }
  },
  {
    id: "fem_102",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual palavra é feminina?",
    options: ["garota", "garoto", "garotão", "menino"],
    correctIndex: 0,
    explanation: "'garota' é um substantivo feminino.",
    wrongExplanations: { 1: "garoto não é a resposta correta.", 2: "garotão não é a resposta correta.", 3: "menino não é a resposta correta." }
  },
  {
    id: "fem_103",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual é o feminino de 'duque'?",
    options: ["duquesa", "duque", "duqueso", "duquer"],
    correctIndex: 0,
    explanation: "O feminino de 'duque' é 'duquesa'.",
    wrongExplanations: { 1: "duque não é a resposta correta.", 2: "duqueso não é a resposta correta.", 3: "duquer não é a resposta correta." }
  },
  {
    id: "fem_104",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual é o feminino de 'senhor'?",
    options: ["senhora", "senhor", "senhoro", "senhorão"],
    correctIndex: 0,
    explanation: "O feminino de 'senhor' é 'senhora'.",
    wrongExplanations: { 1: "senhor não é a resposta correta.", 2: "senhoro não é a resposta correta.", 3: "senhorão não é a resposta correta." }
  },
  {
    id: "fem_105",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual palavra é o feminino de 'leão'?",
    options: ["leoa", "leão", "leoinha", "leonado"],
    correctIndex: 0,
    explanation: "O feminino de 'leão' é 'leoa'.",
    wrongExplanations: { 1: "leão não é a resposta correta.", 2: "leoinha não é a resposta correta.", 3: "leonado não é a resposta correta." }
  },
  {
    id: "fem_106",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual é o feminino de 'ator'?",
    options: ["atriz", "ator", "atrice", "atorr"],
    correctIndex: 0,
    explanation: "O feminino de 'ator' é 'atriz'.",
    wrongExplanations: { 1: "ator não é a resposta correta.", 2: "atrice não é a resposta correta.", 3: "atorr não é a resposta correta." }
  },
  {
    id: "fem_107",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual é o feminino de 'amigo'?",
    options: ["amiga", "amigo", "amigoa", "amigão"],
    correctIndex: 0,
    explanation: "O feminino de 'amigo' é 'amiga'.",
    wrongExplanations: { 1: "amigo não é a resposta correta.", 2: "amigoa não é a resposta correta.", 3: "amigão não é a resposta correta." }
  },
  {
    id: "fem_108",
    subject: "portugues",
    topic: "substantivos_femininos",
    topicName: "Substantivos Femininos",
    question: "Qual é o feminino de 'cabeleireiro'?",
    options: ["cabeleireira", "cabeleireiro", "barbeiro", "cabeleireirão"],
    correctIndex: 0,
    explanation: "O feminino de 'cabeleireiro' é 'cabeleireira'.",
    wrongExplanations: { 1: "cabeleireiro não é a resposta correta.", 2: "barbeiro não é a resposta correta.", 3: "cabeleireirão não é a resposta correta." }
  },
  {
    id: "sim_109",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é um substantivo simples?",
    options: ["casa", "girassol", "pé-de-moleque", "beija-flor"],
    correctIndex: 0,
    explanation: "'casa' é um substantivo simples.",
    wrongExplanations: { 1: "girassol não é a resposta correta.", 2: "pé-de-moleque não é a resposta correta.", 3: "beija-flor não é a resposta correta." }
  },
  {
    id: "sim_110",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é um substantivo composto?",
    options: ["girassol", "casa", "gato", "mesa"],
    correctIndex: 0,
    explanation: "'girassol' é um substantivo composto.",
    wrongExplanations: { 1: "casa não é a resposta correta.", 2: "gato não é a resposta correta.", 3: "mesa não é a resposta correta." }
  },
  {
    id: "sim_111",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é composta?",
    options: ["beija-flor", "mesa", "caderno", "porta"],
    correctIndex: 0,
    explanation: "'beija-flor' é um substantivo composto.",
    wrongExplanations: { 1: "mesa não é a resposta correta.", 2: "caderno não é a resposta correta.", 3: "porta não é a resposta correta." }
  },
  {
    id: "sim_112",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é simples?",
    options: ["janela", "girassol", "pé-de-moleque", "guarda-chuva"],
    correctIndex: 0,
    explanation: "'janela' é um substantivo simples.",
    wrongExplanations: { 1: "girassol não é a resposta correta.", 2: "pé-de-moleque não é a resposta correta.", 3: "guarda-chuva não é a resposta correta." }
  },
  {
    id: "sim_113",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é composta?",
    options: ["paraquedas", "casa", "carro", "gato"],
    correctIndex: 0,
    explanation: "'paraquedas' é um substantivo composto.",
    wrongExplanations: { 1: "casa não é a resposta correta.", 2: "carro não é a resposta correta.", 3: "gato não é a resposta correta." }
  },
  {
    id: "sim_114",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é simples?",
    options: ["flor", "guarda-chuva", "segunda-feira", "girassol"],
    correctIndex: 0,
    explanation: "'flor' é um substantivo simples.",
    wrongExplanations: { 1: "guarda-chuva não é a resposta correta.", 2: "segunda-feira não é a resposta correta.", 3: "girassol não é a resposta correta." }
  },
  {
    id: "sim_115",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é composta?",
    options: ["arco-íris", "amigo", "casa", "mãe"],
    correctIndex: 0,
    explanation: "'arco-íris' é um substantivo composto.",
    wrongExplanations: { 1: "amigo não é a resposta correta.", 2: "casa não é a resposta correta.", 3: "mãe não é a resposta correta." }
  },
  {
    id: "sim_116",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é simples?",
    options: ["bolo", "guarda-chuva", "girassol", "pé-de-moleque"],
    correctIndex: 0,
    explanation: "'bolo' é um substantivo simples.",
    wrongExplanations: { 1: "guarda-chuva não é a resposta correta.", 2: "girassol não é a resposta correta.", 3: "pé-de-moleque não é a resposta correta." }
  },
  {
    id: "sim_117",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é composta?",
    options: ["segunda-feira", "carro", "sol", "amigo"],
    correctIndex: 0,
    explanation: "'segunda-feira' é um substantivo composto.",
    wrongExplanations: { 1: "carro não é a resposta correta.", 2: "sol não é a resposta correta.", 3: "amigo não é a resposta correta." }
  },
  {
    id: "sim_118",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é simples?",
    options: ["mãe", "guarda-chuva", "girassol", "bem-te-vi"],
    correctIndex: 0,
    explanation: "'mãe' é um substantivo simples.",
    wrongExplanations: { 1: "guarda-chuva não é a resposta correta.", 2: "girassol não é a resposta correta.", 3: "bem-te-vi não é a resposta correta." }
  },
  {
    id: "sim_119",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é composta?",
    options: ["passatempo", "casa", "rio", "cão"],
    correctIndex: 0,
    explanation: "'passatempo' é um substantivo composto.",
    wrongExplanations: { 1: "casa não é a resposta correta.", 2: "rio não é a resposta correta.", 3: "cão não é a resposta correta." }
  },
  {
    id: "sim_120",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é simples?",
    options: ["carro", "girassol", "pé-de-moleque", "guarda-chuva"],
    correctIndex: 0,
    explanation: "'carro' é um substantivo simples.",
    wrongExplanations: { 1: "girassol não é a resposta correta.", 2: "pé-de-moleque não é a resposta correta.", 3: "guarda-chuva não é a resposta correta." }
  },
  {
    id: "sim_121",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é composta?",
    options: ["bem-te-vi", "livro", "flor", "casa"],
    correctIndex: 0,
    explanation: "'bem-te-vi' é um substantivo composto.",
    wrongExplanations: { 1: "livro não é a resposta correta.", 2: "flor não é a resposta correta.", 3: "casa não é a resposta correta." }
  },
  {
    id: "sim_122",
    subject: "portugues",
    topic: "substantivos_simples_compostos",
    topicName: "Substantivos Simples e Compostos",
    question: "Qual palavra é simples?",
    options: ["pão", "guarda-chuva", "girassol", "bem-te-vi"],
    correctIndex: 0,
    explanation: "'pão' é um substantivo simples.",
    wrongExplanations: { 1: "guarda-chuva não é a resposta correta.", 2: "girassol não é a resposta correta.", 3: "bem-te-vi não é a resposta correta." }
  },
  {
    id: "col_123",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de peixes?",
    options: ["cardume", "matilha", "bando", "floresta"],
    correctIndex: 0,
    explanation: "'cardume' é o coletivo de peixes.",
    wrongExplanations: { 1: "matilha não é a resposta correta.", 2: "bando não é a resposta correta.", 3: "floresta não é a resposta correta." }
  },
  {
    id: "col_124",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de aves?",
    options: ["bando", "cardume", "manada", "alcateia"],
    correctIndex: 0,
    explanation: "'bando' é o coletivo de aves.",
    wrongExplanations: { 1: "cardume não é a resposta correta.", 2: "manada não é a resposta correta.", 3: "alcateia não é a resposta correta." }
  },
  {
    id: "col_125",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de bois?",
    options: ["boiada", "cardume", "bando", "nuvem"],
    correctIndex: 0,
    explanation: "'boiada' é o coletivo de bois.",
    wrongExplanations: { 1: "cardume não é a resposta correta.", 2: "bando não é a resposta correta.", 3: "nuvem não é a resposta correta." }
  },
  {
    id: "col_126",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de lobos?",
    options: ["alcateia", "cardume", "bando", "manada"],
    correctIndex: 0,
    explanation: "'alcateia' é o coletivo de lobos.",
    wrongExplanations: { 1: "cardume não é a resposta correta.", 2: "bando não é a resposta correta.", 3: "manada não é a resposta correta." }
  },
  {
    id: "col_127",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de revistas?",
    options: ["banca", "coleção", "revista", "jornal"],
    correctIndex: 1,
    explanation: "'coleção' indica um grupo de revistas.",
    wrongExplanations: { 0: "banca não é a resposta correta.", 2: "revista não é a resposta correta.", 3: "jornal não é a resposta correta." }
  },
  {
    id: "col_128",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de árvores?",
    options: ["floresta", "cardume", "matilha", "bando"],
    correctIndex: 0,
    explanation: "'floresta' é o coletivo de árvores.",
    wrongExplanations: { 1: "cardume não é a resposta correta.", 2: "matilha não é a resposta correta.", 3: "bando não é a resposta correta." }
  },
  {
    id: "col_129",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de livros?",
    options: ["biblioteca", "pilha", "prateleira", "livros"],
    correctIndex: 0,
    explanation: "'biblioteca' é um conjunto de livros.",
    wrongExplanations: { 1: "pilha não é a resposta correta.", 2: "prateleira não é a resposta correta.", 3: "livros não é a resposta correta." }
  },
  {
    id: "col_130",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de soldados?",
    options: ["tropa", "matilha", "bando", "cardume"],
    correctIndex: 0,
    explanation: "'tropa' é o coletivo de soldados.",
    wrongExplanations: { 1: "matilha não é a resposta correta.", 2: "bando não é a resposta correta.", 3: "cardume não é a resposta correta." }
  },
  {
    id: "col_131",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de camelos?",
    options: ["caravana", "manada", "bando", "cardume"],
    correctIndex: 0,
    explanation: "'caravana' é o coletivo de camelos.",
    wrongExplanations: { 1: "manada não é a resposta correta.", 2: "bando não é a resposta correta.", 3: "cardume não é a resposta correta." }
  },
  {
    id: "col_132",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de estrelas?",
    options: ["constelação", "floresta", "bando", "manada"],
    correctIndex: 0,
    explanation: "'constelação' é o coletivo de estrelas.",
    wrongExplanations: { 1: "floresta não é a resposta correta.", 2: "bando não é a resposta correta.", 3: "manada não é a resposta correta." }
  },
  {
    id: "col_133",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de operários?",
    options: ["equipe", "tropa", "bando", "cardume"],
    correctIndex: 0,
    explanation: "'equipe' é o coletivo de operários.",
    wrongExplanations: { 1: "tropa não é a resposta correta.", 2: "bando não é a resposta correta.", 3: "cardume não é a resposta correta." }
  },
  {
    id: "col_134",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de músicos?",
    options: ["orquestra", "alcateia", "manada", "cardume"],
    correctIndex: 0,
    explanation: "'orquestra' é o coletivo de músicos.",
    wrongExplanations: { 1: "alcateia não é a resposta correta.", 2: "manada não é a resposta correta.", 3: "cardume não é a resposta correta." }
  },
  {
    id: "col_135",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de peixes?",
    options: ["cardume", "manada", "bando", "alcateia"],
    correctIndex: 0,
    explanation: "'cardume' é o coletivo de peixes.",
    wrongExplanations: { 1: "manada não é a resposta correta.", 2: "bando não é a resposta correta.", 3: "alcateia não é a resposta correta." }
  },
  {
    id: "col_136",
    subject: "portugues",
    topic: "substantivos_coletivos",
    topicName: "Substantivos Coletivos",
    question: "Qual coletivo indica um grupo de cães?",
    options: ["matilha", "cardume", "bando", "floresta"],
    correctIndex: 0,
    explanation: "'matilha' é o coletivo de cães.",
    wrongExplanations: { 1: "cardume não é a resposta correta.", 2: "bando não é a resposta correta.", 3: "floresta não é a resposta correta." }
  },
  {
    id: "add_137",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra vem primeiro em ordem alfabética?",
    options: ["pato", "pano", "paz", "pata"],
    correctIndex: 1,
    explanation: "'pano' vem antes de 'pata', 'pato' e 'paz'.",
    wrongExplanations: { 0: "pato não é a resposta correta.", 2: "paz não é a resposta correta.", 3: "pata não é a resposta correta." }
  },
  {
    id: "add_138",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra contém encontro vocálico?",
    options: ["touro", "tora", "teto", "tubo"],
    correctIndex: 0,
    explanation: "'touro' contém encontro vocálico 'ou'.",
    wrongExplanations: { 1: "tora não é a resposta correta.", 2: "teto não é a resposta correta.", 3: "tubo não é a resposta correta." }
  },
  {
    id: "add_139",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra usa a letra Z?",
    options: ["zebra", "xebra", "casa", "mesa"],
    correctIndex: 0,
    explanation: "'zebra' usa a letra Z corretamente.",
    wrongExplanations: { 1: "xebra não é a resposta correta.", 2: "casa não é a resposta correta.", 3: "mesa não é a resposta correta." }
  },
  {
    id: "add_140",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual é o feminino de 'príncipe'?",
    options: ["princesa", "príncipe", "princesinho", "principe"],
    correctIndex: 0,
    explanation: "O feminino de 'príncipe' é 'princesa'.",
    wrongExplanations: { 1: "príncipe não é a resposta correta.", 2: "princesinho não é a resposta correta.", 3: "principe não é a resposta correta." }
  },
  {
    id: "add_141",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra é substantivo composto?",
    options: ["girassol", "gato", "céu", "flor"],
    correctIndex: 0,
    explanation: "'girassol' é substantivo composto.",
    wrongExplanations: { 1: "gato não é a resposta correta.", 2: "céu não é a resposta correta.", 3: "flor não é a resposta correta." }
  },
  {
    id: "add_142",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra tem sílaba tônica na penúltima sílaba?",
    options: ["caminho", "café", "papel", "você"],
    correctIndex: 0,
    explanation: "'caminho' é paroxítona, pois a sílaba tônica é 'mi'.",
    wrongExplanations: { 1: "café não é a resposta correta.", 2: "papel não é a resposta correta.", 3: "você não é a resposta correta." }
  },
  {
    id: "add_143",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual coletivo indica um grupo de peixes?",
    options: ["cardume", "bando", "manada", "alcateia"],
    correctIndex: 0,
    explanation: "'cardume' é coletivo de peixes.",
    wrongExplanations: { 1: "bando não é a resposta correta.", 2: "manada não é a resposta correta.", 3: "alcateia não é a resposta correta." }
  },
  {
    id: "add_144",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra tem hiato?",
    options: ["saída", "sai", "pai", "mão"],
    correctIndex: 0,
    explanation: "'saída' tem hiato entre 'a' e 'í'.",
    wrongExplanations: { 1: "sai não é a resposta correta.", 2: "pai não é a resposta correta.", 3: "mão não é a resposta correta." }
  },
  {
    id: "add_145",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra vem por último em ordem alfabética?",
    options: ["lago", "lápis", "lanterna", "laranja"],
    correctIndex: 3,
    explanation: "'laranja' vem por último entre essas palavras.",
    wrongExplanations: { 0: "lago não é a resposta correta.", 1: "lápis não é a resposta correta.", 2: "lanterna não é a resposta correta." }
  },
  {
    id: "add_146",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra é escrita com S?",
    options: ["sapato", "zapato", "xapato", "sopato"],
    correctIndex: 0,
    explanation: "'sapato' usa S corretamente.",
    wrongExplanations: { 1: "zapato não é a resposta correta.", 2: "xapato não é a resposta correta.", 3: "sopato não é a resposta correta." }
  },
  {
    id: "add_147",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual é o masculino de 'gata'?",
    options: ["gato", "gata", "gatoo", "gatal"],
    correctIndex: 0,
    explanation: "O masculino de 'gata' é 'gato'.",
    wrongExplanations: { 1: "gata não é a resposta correta.", 2: "gatoo não é a resposta correta.", 3: "gatal não é a resposta correta." }
  },
  {
    id: "add_148",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra é simples?",
    options: ["casa", "girassol", "guarda-chuva", "passatempo"],
    correctIndex: 0,
    explanation: "'casa' é um substantivo simples.",
    wrongExplanations: { 1: "girassol não é a resposta correta.", 2: "guarda-chuva não é a resposta correta.", 3: "passatempo não é a resposta correta." }
  },
  {
    id: "add_149",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra tem ditongo?",
    options: ["mesa", "casa", "mio", "céu"],
    correctIndex: 3,
    explanation: "'céu' tem ditongo 'éu'.",
    wrongExplanations: { 0: "mesa não é a resposta correta.", 1: "casa não é a resposta correta.", 2: "mio não é a resposta correta." }
  },
  {
    id: "add_150",
    subject: "portugues",
    topic: "atividades_adicionais",
    topicName: "Atividades Adicionais",
    question: "Qual palavra tem sílaba tônica na última sílaba?",
    options: ["café", "mesa", "amigo", "janela"],
    correctIndex: 0,
    explanation: "'café' é oxítona.",
    wrongExplanations: { 1: "mesa não é a resposta correta.", 2: "amigo não é a resposta correta.", 3: "janela não é a resposta correta." }
  }
];

  function buildQuestions(subject, topic, topicName, prefix, entries) {
    return entries.map((entry, index) => ({
      id: `${prefix}_${String(index + 1).padStart(3, '0')}`,
      subject,
      topic,
      topicName,
      question: entry[0],
      options: entry[1],
      correctIndex: entry[2],
      explanation: entry[3]
    }));
  }

  function makeEntry(question, correctValue, wrongValues, explanation, formatter = (v) => String(v)) {
    const formattedCorrect = formatter(correctValue);
    const wrongs = [];

    wrongValues.forEach(value => {
      const formatted = formatter(value);
      if (formatted !== formattedCorrect && !wrongs.includes(formatted)) wrongs.push(formatted);
    });

    const optionsBase = [formattedCorrect, ...wrongs.slice(0, 3)];
    const shift = question.length % 4;
    const options = [];
    optionsBase.forEach((option, index) => {
      options[(index + shift) % 4] = option;
    });

    return [question, options, options.indexOf(formattedCorrect), explanation];
  }

  function generateMathQuestions() {
    const mathQuestions = [];
    const q = function(question, correct, wrongs, explanation) {
      return [question, correct, wrongs, explanation];
    };

    const doubleEntries = [
      q("O dobro de um numero quer dizer:", "multiplicar por 2", ["multiplicar por 3", "dividir por 2", "somar 10"], "Dobro significa multiplicar por 2."),
      q("O triplo de um numero quer dizer:", "multiplicar por 3", ["multiplicar por 2", "dividir por 3", "somar 3"], "Triplo significa multiplicar por 3."),
      q("O quadruplo de um numero quer dizer:", "multiplicar por 4", ["multiplicar por 2", "multiplicar por 5", "somar 4"], "Quadruplo significa multiplicar por 4."),
      q("O quintuplo de um numero quer dizer:", "multiplicar por 5", ["multiplicar por 2", "multiplicar por 4", "dividir por 5"], "Quintuplo significa multiplicar por 5."),
      q("Qual e o dobro de 2?", 4, [6, 8, 10], "O dobro de 2 e 4."),
      q("Qual e o dobro de 7?", 14, [12, 16, 18], "O dobro de 7 e 14."),
      q("Qual e o triplo de 3?", 9, [6, 12, 15], "O triplo de 3 e 9."),
      q("Qual e o triplo de 6?", 18, [12, 20, 24], "O triplo de 6 e 18."),
      q("Qual e o quadruplo de 4?", 16, [12, 18, 20], "O quadruplo de 4 e 16."),
      q("Qual e o quadruplo de 5?", 20, [15, 18, 24], "O quadruplo de 5 e 20."),
      q("Qual e o quintuplo de 2?", 10, [8, 12, 14], "O quintuplo de 2 e 10."),
      q("Qual e o quintuplo de 4?", 20, [16, 24, 28], "O quintuplo de 4 e 20."),
      q("Qual e o dobro de 9?", 18, [16, 20, 22], "O dobro de 9 e 18."),
      q("Qual e o triplo de 8?", 24, [16, 20, 30], "O triplo de 8 e 24."),
      q("Qual e o quadruplo de 3?", 12, [9, 15, 18], "O quadruplo de 3 e 12."),
      q("Qual e o quintuplo de 3?", 15, [12, 18, 20], "O quintuplo de 3 e 15."),
      q("Qual e o dobro de 12?", 24, [20, 22, 26], "O dobro de 12 e 24."),
      q("Qual e o triplo de 5?", 15, [10, 18, 20], "O triplo de 5 e 15."),
      q("Qual e o quintuplo de 6?", 30, [24, 32, 35], "O quintuplo de 6 e 30.")
    ];

    mathQuestions.push(...buildQuestions("matematica", "dobro_triplo_quadruplo_quintuplo", "Dobro, Triplo, Quadruplo e Quintuplo", "mat_dtq",
      doubleEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3]))
    ));

    const compareEntries = [
      q("Qual numero e maior?", 54, [45, 40, 49], "54 e maior do que 45, 40 e 49."),
      q("Qual numero e menor?", 3, [31, 13, 23], "3 e menor do que 31, 13 e 23."),
      q("Qual sequencia esta em ordem crescente?", "9, 11, 12, 15", ["15, 12, 11, 9", "12, 9, 15, 11", "11, 15, 9, 12"], "Ordem crescente vai do menor para o maior."),
      q("Qual sequencia esta em ordem decrescente?", "80, 75, 70, 65", ["65, 70, 75, 80", "75, 80, 65, 70", "70, 65, 80, 75"], "Ordem decrescente vai do maior para o menor."),
      q("Qual numero fica entre 27 e 29?", 28, [26, 30, 31], "28 fica entre 27 e 29."),
      q("Qual e o antecessor de 50?", 49, [48, 51, 40], "O numero anterior a 50 e 49."),
      q("Qual e o sucessor de 99?", 100, [98, 101, 110], "O numero depois de 99 e 100."),
      q("Entre 62 e 26, qual e o maior?", 62, [26, 52, 16], "62 e maior do que 26."),
      q("Entre 41 e 14, qual e o menor?", 14, [41, 24, 44], "14 e menor do que 41."),
      q("Qual numero e maior?", 231, [123, 132, 213], "231 e o maior numero da lista."),
      q("Qual numero e menor?", 405, [450, 540, 504], "405 e o menor numero da lista."),
      q("Qual sequencia esta em ordem crescente?", "31, 34, 43", ["43, 34, 31", "34, 31, 43", "31, 43, 34"], "A ordem crescente vai do menor para o maior."),
      q("Qual sequencia esta em ordem decrescente?", "21, 18, 12", ["12, 18, 21", "18, 12, 21", "21, 12, 18"], "A ordem decrescente vai do maior para o menor."),
      q("Qual numero fica entre 90 e 92?", 91, [89, 93, 99], "91 fica entre 90 e 92."),
      q("Qual e o antecessor de 300?", 299, [298, 301, 390], "O numero anterior a 300 e 299."),
      q("Qual e o sucessor de 499?", 500, [498, 501, 590], "O numero depois de 499 e 500."),
      q("Entre 78 e 87, qual e o maior?", 87, [78, 68, 97], "87 e maior do que 78."),
      q("Entre 205 e 250, qual e o menor?", 205, [250, 215, 295], "205 e menor do que 250."),
      q("Qual sequencia esta em ordem crescente?", "8, 18, 28, 38", ["38, 28, 18, 8", "18, 8, 38, 28", "8, 28, 18, 38"], "A ordem crescente vai do menor para o maior.")
    ];

    mathQuestions.push(...buildQuestions("matematica", "comparando_ordenando_numeros", "Comparando e Ordenando Numeros", "mat_con",
      compareEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3]))
    ));

    const clockEntries = [
      q("Se o relogio marca 3:00, lemos:", "tres horas", ["tres e quinze", "tres e trinta", "quatro horas"], "Quando os minutos estao no 12, a hora e cheia."),
      q("Se o relogio marca 7:30, lemos:", "sete horas e trinta minutos", ["sete horas", "sete horas e quinze minutos", "oito horas"], "30 minutos formam meia hora."),
      q("Se o relogio marca 12:15, lemos:", "doze horas e quinze minutos", ["doze horas", "doze horas e trinta minutos", "uma hora"], "15 minutos formam um quarto de hora."),
      q("Se o relogio marca 5:45, lemos:", "cinco horas e quarenta e cinco minutos", ["cinco horas", "cinco horas e quinze minutos", "seis horas"], "45 minutos faltam para completar uma hora."),
      q("Qual horario mostra um relogio com ponteiro das horas no 8 e dos minutos no 12?", "8:00", ["8:30", "7:00", "8:15"], "Com os dois ponteiros no 12, sao horas cheias."),
      q("Qual horario mostra um relogio com ponteiro das horas entre 2 e 3 e dos minutos no 6?", "2:30", ["2:00", "2:15", "3:30"], "Quando o ponteiro dos minutos esta no 6, sao 30 minutos."),
      q("Quanto falta para 4:00 quando sao 3:45?", "15 minutos", ["10 minutos", "20 minutos", "30 minutos"], "De 3:45 ate 4:00 faltam 15 minutos."),
      q("Quanto passou de 6:00 quando sao 6:20?", "20 minutos", ["15 minutos", "30 minutos", "40 minutos"], "De 6:00 ate 6:20 passaram 20 minutos."),
      q("Se a aula comeca as 9:00 e termina as 10:00, dura:", "1 hora", ["30 minutos", "2 horas", "15 minutos"], "De 9:00 ate 10:00 passa 1 hora."),
      q("Se sao 1:00 e o relogio avanca 2 horas, fica em:", "3:00", ["2:00", "4:00", "5:00"], "Somamos 2 horas ao horario inicial."),
      q("Se sao 4:30 e passam 30 minutos, fica em:", "5:00", ["4:45", "5:30", "6:00"], "30 minutos depois de 4:30, sao 5:00."),
      q("Se o relogio marca 11:00, sao:", "onze horas", ["onze e quinze", "dez horas", "doze horas"], "11:00 e uma hora cheia."),
      q("Se o relogio marca 6:15, sao:", "seis horas e quinze minutos", ["seis horas", "seis horas e trinta minutos", "sete horas"], "15 minutos formam um quarto de hora."),
      q("Se o relogio marca 8:30, sao:", "oito horas e trinta minutos", ["oito horas", "oito horas e quinze minutos", "nove horas"], "30 minutos formam meia hora."),
      q("Se sao 10:45, faltam quantos minutos para 11:00?", "15 minutos", ["10 minutos", "20 minutos", "30 minutos"], "De 10:45 ate 11:00 faltam 15 minutos."),
      q("Se uma atividade comeca as 14:00 e termina as 15:00, dura:", "1 hora", ["30 minutos", "2 horas", "45 minutos"], "De 14:00 ate 15:00 passa 1 hora."),
      q("Se o relogio marca 9:30, ele mostra:", "nove horas e trinta minutos", ["nove horas", "nove horas e quinze minutos", "dez horas"], "30 minutos formam meia hora."),
      q("Se sao 4:00 e passam 1 hora, fica em:", "5:00", ["4:30", "6:00", "5:30"], "Uma hora depois de 4:00 e 5:00."),
      q("Se o ponteiro dos minutos esta no 12 e o das horas no 5, o horario e:", "5:00", ["5:30", "4:00", "6:00"], "Com os minutos no 12, a hora esta cheia.")
    ];

    mathQuestions.push(...buildQuestions("matematica", "horas_relogios", "As Horas e os Relogios", "mat_hr",
      clockEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3]))
    ));

    const mult10Entries = [
      q("Quanto e 3 x 10?", 30, [20, 40, 300], "Multiplicar por 10 acrescenta um zero."),
      q("Quanto e 7 x 10?", 70, [17, 700, 60], "Multiplicar por 10 acrescenta um zero."),
      q("Quanto e 14 x 10?", 140, [104, 24, 1400], "Multiplicar por 10 acrescenta um zero."),
      q("Quanto e 5 x 100?", 500, [50, 5000, 600], "Multiplicar por 100 acrescenta dois zeros."),
      q("Quanto e 9 x 100?", 900, [90, 990, 9000], "Multiplicar por 100 acrescenta dois zeros."),
      q("Quanto e 12 x 100?", 1200, [1020, 120, 12000], "Multiplicar por 100 acrescenta dois zeros."),
      q("Quanto e 2 x 1000?", 2000, [200, 20, 20000], "Multiplicar por 1000 acrescenta tres zeros."),
      q("Quanto e 4 x 1000?", 4000, [400, 40, 40000], "Multiplicar por 1000 acrescenta tres zeros."),
      q("Quanto e 8 x 1000?", 8000, [800, 80, 80000], "Multiplicar por 1000 acrescenta tres zeros."),
      q("Quanto e 6 x 0?", 0, [6, 60, 600], "Todo numero multiplicado por zero resulta em zero."),
      q("Quanto e 15 x 0?", 0, [15, 150, 1500], "Todo numero multiplicado por zero resulta em zero."),
      q("Quanto e 0 x 10?", 0, [10, 100, 1000], "Zero vezes qualquer numero e zero."),
      q("Quanto e 23 x 10?", 230, [2300, 223, 240], "Multiplicar por 10 acrescenta um zero."),
      q("Quanto e 11 x 100?", 1100, [110, 1011, 1110], "Multiplicar por 100 acrescenta dois zeros."),
      q("Quanto e 7 x 1000?", 7000, [700, 70, 70000], "Multiplicar por 1000 acrescenta tres zeros."),
      q("Quanto e 19 x 0?", 0, [19, 190, 1900], "Todo numero multiplicado por zero resulta em zero."),
      q("Quanto e 30 x 10?", 300, [30, 3000, 330], "Multiplicar por 10 acrescenta um zero."),
      q("Quanto e 1 x 1000?", 1000, [100, 10, 10000], "Multiplicar por 1000 acrescenta tres zeros."),
      q("Multiplicar por zero da:", 0, [1, 10, 100], "Zero multiplicado por qualquer numero continua sendo zero.")
    ];

    mathQuestions.push(...buildQuestions("matematica", "multiplicacao_10_100_1000_zero", "Multiplicacao por 10, 100, 1.000 ou Zero", "mat_m10",
      mult10Entries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3]))
    ));

    const capacityMassEntries = [
      q("Qual unidade usamos para medir a capacidade de uma garrafa de agua?", "litro", ["quilograma", "grama", "metro"], "Capacidade de liquidos costuma ser medida em litros ou mililitros."),
      q("Qual unidade usamos para medir 500 mL de suco?", "mililitro", ["quilograma", "grama", "litro"], "Mililitro e uma unidade de capacidade."),
      q("1 litro corresponde a:", "1000 mL", ["100 mL", "10 mL", "10 000 mL"], "1 litro equivale a 1000 mililitros."),
      q("Qual e maior: 1 litro ou 750 mL?", "1 litro", ["750 mL", "500 mL", "250 mL"], "1 litro e maior que 750 mL."),
      q("Qual objeto costuma ser medido em quilogramas?", "saco de arroz", ["gota de remedio", "xicara de cha", "colher de sopa"], "Sacos maiores costumam ser medidos em quilogramas."),
      q("Qual objeto costuma ser medido em gramas?", "maca", ["saco de feijao", "garrafa de agua", "cesta de frutas"], "Frutas pequenas costumam ser medidas em gramas."),
      q("Qual e mais pesado: 2 kg ou 500 g?", "2 kg", ["500 g", "200 g", "100 g"], "2 kg e maior do que 500 g."),
      q("Qual e mais leve: 1 kg ou 800 g?", "800 g", ["1 kg", "1200 g", "2 kg"], "800 g e menor que 1 kg."),
      q("500 g + 500 g = ?", "1 kg", ["500 g", "1500 g", "2 kg"], "500 g mais 500 g formam 1 kg."),
      q("2 litros = ?", "2000 mL", ["200 mL", "20 mL", "20000 mL"], "2 litros correspondem a 2000 mililitros."),
      q("Uma colher de remedio costuma ser medida em:", "mililitros", ["quilogramas", "gramas", "metros"], "Pequenas quantidades de liquido usam mililitros."),
      q("Um pacote de farinha de 1 kg tem:", "1000 g", ["100 g", "10 g", "10 000 g"], "1 kg equivale a 1000 gramas."),
      q("Qual instrumento pode ser usado para medir massa?", "balanca", ["relogio", "regua", "termometro"], "A balanca mede massa."),
      q("Uma caixa de leite grande geralmente tem:", "1 litro", ["1 quilograma", "100 gramas", "10 litros"], "Caixas de leite costumam indicar capacidade em litros."),
      q("Qual unidade e usada para medir a massa de uma pessoa?", "quilograma", ["litro", "mililitro", "metro"], "A massa de pessoas e medida em quilogramas."),
      q("Qual e mais pesado: 3 kg ou 300 g?", "3 kg", ["300 g", "30 g", "3000 g"], "3 kg e maior que 300 g."),
      q("Qual e mais leve: 750 mL ou 1 L?", "750 mL", ["1 L", "1750 mL", "2 L"], "750 mL e menor que 1 litro."),
      q("10 pacotinhos de 100 g juntos pesam:", "1 kg", ["100 g", "500 g", "2 kg"], "10 vezes 100 g formam 1000 g, ou 1 kg.")
    ];

    mathQuestions.push(...buildQuestions("matematica", "medidas_capacidade_massa", "Medidas de Capacidade e de Massa", "mat_cm",
      capacityMassEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3]))
    ));

    const solidsKnownEntries = [
      q("Qual solido lembra um dado?", "cubo", ["esfera", "cone", "cilindro"], "O dado tem forma de cubo."),
      q("Qual solido lembra uma bola?", "esfera", ["cubo", "cone", "piramide"], "A bola tem forma de esfera."),
      q("Qual solido lembra uma lata?", "cilindro", ["cone", "cubo", "esfera"], "A lata tem forma de cilindro."),
      q("Qual solido lembra um sorvete de casquinha?", "cone", ["cubo", "cilindro", "esfera"], "A casquinha lembra um cone."),
      q("Qual solido lembra uma caixa de sapato?", "paralelepipedo", ["esfera", "cone", "cilindro"], "A caixa de sapato tem forma de paralelepipedo."),
      q("Qual solido tem base quadrada e faces triangulares?", "piramide", ["cubo", "esfera", "cilindro"], "A piramide tem faces laterais triangulares."),
      q("Qual solido tem 6 faces quadradas iguais?", "cubo", ["cilindro", "cone", "esfera"], "O cubo tem 6 faces iguais."),
      q("Qual solido tem 2 bases circulares?", "cilindro", ["cone", "cubo", "piramide"], "O cilindro tem duas bases circulares."),
      q("Qual solido tem 1 base circular e 1 vertice?", "cone", ["cubo", "esfera", "cilindro"], "O cone tem uma base circular e uma ponta."),
      q("Qual solido tem 8 vertices?", "cubo", ["esfera", "cone", "cilindro"], "O cubo possui 8 vertices."),
      q("Qual solido nao tem faces planas?", "esfera", ["cubo", "piramide", "paralelepipedo"], "A esfera e totalmente redonda."),
      q("Qual solido pode rolar com facilidade?", "esfera", ["cubo", "paralelepipedo", "piramide"], "A esfera rola em todas as direcoes."),
      q("Qual solido tem faces retangulares?", "paralelepipedo", ["cone", "esfera", "piramide"], "O paralelepipedo tem faces retangulares."),
      q("Qual solido parece um tijolo?", "paralelepipedo", ["cone", "esfera", "cilindro"], "Tijolos lembram paralelepipedos."),
      q("Qual solido parece um chapeu de festa?", "cone", ["cubo", "esfera", "cilindro"], "O chapeu de festa lembra um cone."),
      q("Qual solido tem uma ponta?", "cone", ["esfera", "cilindro", "cubo"], "O cone termina em uma ponta."),
      q("Qual solido tem 6 faces planas?", "cubo", ["esfera", "cone", "cilindro"], "O cubo tem 6 faces planas."),
      q("Qual solido tem forma de caixa retangular?", "paralelepipedo", ["cone", "esfera", "piramide"], "Uma caixa retangular lembra um paralelepipedo."),
      q("Qual solido tem uma base circular e uma lateral curva?", "cilindro", ["cubo", "esfera", "piramide"], "O cilindro tem base circular e superficie curva.")
    ];

    mathQuestions.push(...buildQuestions("matematica", "solidos_geometricos_mais_conhecidos", "Solidos Geometricos Mais Conhecidos", "mat_sg",
      solidsKnownEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3]))
    ));

    const solidsBuildEntries = [
      q("Uma planificacao com 6 quadrados monta um:", "cubo", ["cilindro", "cone", "esfera"], "Seis quadrados formam um cubo."),
      q("Uma planificacao com 6 retangulos monta um:", "paralelepipedo", ["cone", "esfera", "cubo"], "Seis retangulos podem formar um paralelepipedo."),
      q("Uma planificacao com 2 circulos e 1 retangulo monta um:", "cilindro", ["cone", "cubo", "piramide"], "Dois circulos e um retangulo formam um cilindro."),
      q("Uma planificacao com 1 circulo e 1 setor circular monta um:", "cone", ["cilindro", "cubo", "esfera"], "Um circulo e um setor circular formam um cone."),
      q("Uma planificacao com 1 quadrado e 4 triangulos monta uma:", "piramide", ["cubo", "cilindro", "esfera"], "Um quadrado e 4 triangulos formam uma piramide."),
      q("Quantos quadrados iguais costumam formar um cubo?", 6, [4, 8, 10], "Um cubo tem 6 faces quadradas."),
      q("Quantos circulos aparecem na planificacao de um cilindro?", 2, [1, 3, 4], "O cilindro tem duas bases circulares."),
      q("Quantos triangulos costumam aparecer na planificacao de uma piramide de base quadrada?", 4, [3, 5, 6], "A piramide de base quadrada tem 4 faces triangulares."),
      q("Qual solido pode ser montado com 6 quadrados iguais?", "cubo", ["cone", "cilindro", "esfera"], "Seis quadrados iguais formam um cubo."),
      q("Qual solido pode ser montado com 6 retangulos iguais?", "paralelepipedo", ["cone", "esfera", "piramide"], "Seis retangulos iguais podem formar uma caixa retangular."),
      q("Qual solido pode ser montado com 2 circulos e 1 retangulo?", "cilindro", ["cubo", "cone", "piramide"], "Essa planificacao forma um cilindro."),
      q("Qual solido pode ser montado com 1 circulo e 1 setor circular?", "cone", ["cubo", "cilindro", "esfera"], "Essa planificacao forma um cone."),
      q("Qual solido pode ser montado com 1 quadrado e 4 triangulos?", "piramide", ["cubo", "cilindro", "esfera"], "Essa planificacao forma uma piramide."),
      q("Uma planificacao em cruz com 6 quadrados iguais forma um:", "cubo", ["cilindro", "cone", "esfera"], "Essa planificacao forma um cubo."),
      q("Uma planificacao com 1 quadrado e 4 triangulos forma uma piramide de base:", "quadrada", ["circular", "triangular", "retangular"], "A base e quadrada."),
      q("Uma planificacao com 2 circulos e 1 retangulo pode formar o solido que parece uma:", "lata", ["bola", "caixa", "piramide"], "Esse conjunto forma um cilindro, como uma lata."),
      q("Uma planificacao com 6 faces quadradas iguais monta um:", "cubo", ["cilindro", "cone", "esfera"], "Seis quadrados iguais formam um cubo."),
      q("Uma planificacao com 1 circulo e uma parte lateral em forma de setor forma um:", "cone", ["cubo", "cilindro", "paralelepipedo"], "A lateral em setor forma um cone.")
    ];

    mathQuestions.push(...buildQuestions("matematica", "solidos_para_montar", "Solidos para Montar", "mat_sm",
      solidsBuildEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3]))
    ));

    const extraEntries = [
      q("O dobro de 8 e:", 16, [12, 14, 18], "O dobro de 8 e 16."),
      q("Qual numero e maior?", 74, [47, 64, 57], "74 e maior que as outras opcoes."),
      q("Se o relogio marca 2:30, lemos:", "duas horas e trinta minutos", ["duas horas", "duas horas e quinze minutos", "tres horas"], "30 minutos formam meia hora."),
      q("Quanto e 4 x 100?", 400, [40, 4000, 420], "Multiplicar por 100 acrescenta dois zeros."),
      q("Qual e maior: 1 litro ou 750 mL?", "1 litro", ["750 mL", "500 mL", "250 mL"], "1 litro e maior."),
      q("Qual solido lembra um dado?", "cubo", ["esfera", "cone", "cilindro"], "O dado tem forma de cubo."),
      q("Qual e o resultado de 3 x 0?", 0, [3, 30, 300], "Qualquer numero vezes zero e zero."),
      q("Qual numero vem antes de 100?", 99, [98, 101, 110], "O antecessor de 100 e 99."),
      q("Se sao 8:00, os ponteiros do relogio mostram:", "oito horas", ["oito e quinze", "oito e trinta", "nove horas"], "Com os minutos no 12, a hora e cheia."),
      q("Qual e mais pesado: 2 kg ou 500 g?", "2 kg", ["500 g", "200 g", "100 g"], "2 kg e maior."),
      q("Qual solido pode ser montado com 2 circulos e 1 retangulo?", "cilindro", ["cone", "cubo", "esfera"], "Essa planificacao forma um cilindro."),
      q("Quanto e 12 x 10?", 120, [12, 1200, 102], "Multiplicar por 10 acrescenta um zero."),
      q("Qual e mais leve: 750 mL ou 1 L?", "750 mL", ["1 L", "1500 mL", "2 L"], "750 mL e menor que 1 litro."),
      q("Qual solido parece uma bola?", "esfera", ["cubo", "cone", "cilindro"], "A bola lembra uma esfera."),
      q("Quanto e 500 g + 500 g?", "1 kg", ["500 g", "750 g", "2 kg"], "500 g mais 500 g formam 1 kg."),
      q("Qual numero fica entre 18 e 20?", 19, [17, 21, 29], "19 fica entre 18 e 20."),
      q("Se o relogio marca 5:45, falta quanto para 6:00?", "15 minutos", ["10 minutos", "20 minutos", "30 minutos"], "De 5:45 ate 6:00 faltam 15 minutos."),
      q("Quanto e 7 x 1000?", 7000, [700, 70, 70000], "Multiplicar por 1000 acrescenta tres zeros."),
      q("Qual solido tem 2 bases circulares?", "cilindro", ["cone", "cubo", "piramide"], "O cilindro tem duas bases circulares.")
    ];

    mathQuestions.push(...buildQuestions("matematica", "atividades_adicionais_matematica", "Atividades Adicionais de Matemática", "mat_ad",
      extraEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3]))
    ));

    return mathQuestions;
  }

  const mathQuestions = generateMathQuestions();
  questions.push(...mathQuestions);

  function generateScienceQuestions() {
    const scienceQuestions = [];

    const flatwormEntries = [
      ["Os platelmintos sao animais invertebrados com corpo:", "achatado", ["redondo e duro", "com penas", "com concha sempre"], "Platelmintos sao vermes de corpo achatado e sem coluna vertebral."],
      ["Qual destes animais e um exemplo de platelminto?", "planaria", ["minhoca", "caracol", "polvo"], "A planaria e um platelminto de vida livre."],
      ["A palavra platelminto lembra um animal com corpo:", "plano", ["cheio de ossos", "coberto de pelos", "com asas"], "O nome do grupo se relaciona ao corpo achatado ou plano."],
      ["Os platelmintos fazem parte dos:", "invertebrados", ["mamiferos", "aves", "peixes osseos"], "Eles nao possuem coluna vertebral."],
      ["A planaria costuma viver em locais:", "umidos ou aquaticos", ["muito secos", "apenas no ar", "dentro de penas"], "Muitas planarias vivem na agua doce ou em lugares umidos."],
      ["Alguns platelmintos podem viver como:", "parasitas", ["plantas com flores", "aves adultas", "rochas"], "Tenias e esquistossomos sao exemplos de platelmintos parasitas."],
      ["Um parasita e um ser vivo que:", "vive em outro ser e pode prejudica-lo", ["produz seu proprio alimento", "sempre voa", "tem coluna vertebral"], "Parasitas retiram recursos de outro organismo, chamado hospedeiro."],
      ["A tenia tambem e conhecida como:", "solitaria", ["minhoca", "lesma", "ostra"], "A tenia e popularmente chamada de solitaria."],
      ["O corpo da tenia pode ser formado por varias partes chamadas:", "segmentos", ["penas", "conchas", "folhas"], "A tenia tem corpo achatado dividido em partes repetidas."],
      ["Platelmintos nao possuem:", "coluna vertebral", ["corpo", "celulas", "alimento"], "Como invertebrados, eles nao tem coluna vertebral."],
      ["A simetria bilateral significa que o corpo pode ser dividido em:", "dois lados parecidos", ["quatro conchas", "varias penas", "somente uma antena"], "Muitos platelmintos tem lado direito e esquerdo semelhantes."],
      ["Uma caracteristica da planaria e conseguir:", "regenerar partes do corpo", ["produzir leite", "formar concha dura", "voar"], "Planarias podem regenerar partes perdidas em certas condicoes."],
      ["A reproducao de muitos platelmintos ocorre por:", "ovos", ["sementes", "penas", "casulos de pano"], "Muitos platelmintos formam ovos durante o ciclo de vida."],
      ["No desenvolvimento de uma tenia parasita, o animal precisa de:", "hospedeiro", ["ninho com penas", "flor", "casco de tartaruga"], "A tenia vive e se desenvolve dentro de hospedeiros."],
      ["O esquistossomo e um platelminto relacionado a uma doenca chamada:", "esquistossomose", ["gripe", "catapora", "caxumba"], "O esquistossomo pode causar esquistossomose."],
      ["Uma forma de evitar doencas causadas por parasitas e:", "ter saneamento basico", ["beber agua suja", "andar sempre descalco", "lavar menos as maos"], "Saneamento e higiene ajudam a interromper ciclos de parasitas."],
      ["Platelmintos de vida livre, como planarias, procuram alimento em:", "ambientes umidos", ["ninhos de aves", "desertos muito secos", "flores secas"], "A umidade favorece a vida desses animais."],
      ["Os platelmintos tem corpo mole e:", "sem ossos", ["com esqueleto interno duro", "com penas", "com bico"], "Eles nao apresentam esqueleto osseo interno."],
      ["A alimentacao de muitos platelmintos ocorre pela:", "boca", ["asa", "pena", "concha"], "Muitas especies usam a boca para ingerir alimento."],
      ["A tenia se fixa no intestino usando estruturas na:", "cabeca", ["asa", "concha", "cauda com penas"], "A regiao anterior ajuda a tenia a se prender ao hospedeiro."],
      ["Quando um platelminto cresce, ele continua sendo:", "invertebrado", ["mamifero", "ave", "planta"], "O desenvolvimento nao muda o grupo biologico do animal."],
      ["A planaria se desloca deslizando com ajuda de:", "muco e cilios", ["penas", "cascos", "asas"], "Planarias podem deslizar sobre superficies umidas."],
      ["Dizer que o corpo e achatado ajuda a diferenciar platelmintos de:", "nematoides", ["plantas", "aves", "mamiferos"], "Nematoides tem corpo cilindrico, diferente dos platelmintos."],
      ["A maioria dos platelmintos troca gases pelo:", "corpo", ["pulmao", "bico", "concha"], "Por serem simples e achatados, fazem trocas pelo corpo."],
      ["Uma tenia adulta vive geralmente no:", "intestino", ["ninho", "galho", "bico"], "Tenias adultas podem viver no intestino de seus hospedeiros."],
      ["Alguns platelmintos tem ciclo de vida que passa por:", "mais de um hospedeiro", ["apenas uma pena", "uma folha", "uma concha vazia"], "Certos parasitas precisam de hospedeiros diferentes para completar o ciclo."],
      ["Para estudar platelmintos, e importante observar:", "forma do corpo e modo de vida", ["cor da mochila", "som do vento", "tamanho da sala"], "Forma corporal e modo de vida ajudam a reconhecer o grupo."],
      ["O corpo achatado dos platelmintos facilita:", "trocas com o ambiente", ["voar alto", "produzir leite", "formar penas"], "O formato fino ajuda nas trocas de substancias pelo corpo."],
      ["Platelmintos podem ser de vida livre ou:", "parasitaria", ["sempre voadora", "sempre vegetal", "sempre com concha"], "O grupo inclui especies livres e especies parasitas."],
      ["Um exemplo de cuidado contra parasitas e:", "lavar bem os alimentos", ["comer carne crua", "beber agua sem tratamento", "ignorar higiene"], "Higiene dos alimentos ajuda a prevenir verminoses."],
      ["No ciclo de vida, ovos de platelmintos parasitas podem sair pelas:", "fezes", ["penas", "conchas", "asas"], "Em algumas especies parasitas, ovos sao eliminados nas fezes."],
      ["O nome do grupo dos platelmintos se relaciona principalmente ao:", "formato do corpo", ["tipo de pena", "som que faz", "tamanho da concha"], "O corpo achatado e uma marca importante do grupo."],
      ["Platelmintos ajudam a mostrar que nem todo verme e:", "minhoca", ["animal", "invertebrado", "ser vivo"], "Existem varios grupos de vermes, e platelmintos nao sao minhocas."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "platelmintos", "Caracteristicas e Desenvolvimento dos Platelmintos", "cie_pl",
      flatwormEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const nematodeEntries = [
      ["Os nematoides sao vermes com corpo:", "cilindrico", ["achatado", "com concha", "com penas"], "Nematoides tem corpo alongado e cilindrico."],
      ["Qual destes animais e exemplo de nematoide?", "lombriga", ["planaria", "caracol", "minhoca"], "A lombriga, ou Ascaris, e um nematoide."],
      ["Nematoides sao animais:", "invertebrados", ["mamiferos", "aves", "peixes com coluna"], "Eles nao possuem coluna vertebral."],
      ["O corpo dos nematoides geralmente parece:", "um fio arredondado", ["uma folha plana", "uma concha dura", "uma pena"], "Muitos tem corpo fino, alongado e arredondado."],
      ["Diferente dos platelmintos, os nematoides tem corpo mais:", "redondo", ["achatado", "com penas", "com bico"], "Nematoides sao cilindricos, nao achatados."],
      ["Muitos nematoides vivem no solo e ajudam na:", "decomposicao", ["producao de leite", "formacao de penas", "construcao de ninhos"], "Nematoides livres participam da vida do solo."],
      ["Alguns nematoides podem viver como:", "parasitas", ["pedras", "aves com penas", "plantas com flores sempre"], "Ha nematoides parasitas de plantas, animais e seres humanos."],
      ["O oxiuro e um nematoide que pode parasitar:", "seres humanos", ["rochas", "nuvens", "conchas vazias"], "O oxiuro e um verme parasita humano."],
      ["A lombriga adulta pode viver no:", "intestino", ["bico", "ninho", "casco"], "Lombrigas adultas vivem no intestino humano."],
      ["Uma forma comum de transmissao de ovos de nematoides e por:", "agua ou alimentos contaminados", ["penas limpas", "luz do sol", "vento sem sujeira"], "Ovos podem contaminar agua, solo e alimentos."],
      ["Para prevenir verminoses por nematoides, e importante:", "lavar as maos", ["comer sem higiene", "beber agua suja", "andar em lixo"], "Lavar as maos ajuda a evitar a ingestao de ovos."],
      ["Alguns nematoides se desenvolvem a partir de:", "ovos", ["sementes", "penas", "conchas"], "Muitos nematoides iniciam o ciclo de vida em ovos."],
      ["No desenvolvimento, a larva de nematoide cresce ate virar:", "adulto", ["ave", "planta", "molusco"], "O ciclo inclui crescimento ate a fase adulta."],
      ["Nematoides possuem tubo digestivo com:", "boca e anus", ["bico e penas", "concha e asa", "folha e raiz"], "Uma caracteristica do grupo e o tubo digestivo completo."],
      ["A lombriga pertence ao grupo dos:", "nematoides", ["platelmintos", "moluscos", "anelideos"], "Lombrigas sao vermes cilindricos chamados nematoides."],
      ["O corpo dos nematoides nao e dividido em:", "aneis", ["celulas", "tecidos", "partes"], "Nematoides nao possuem corpo segmentado como anelideos."],
      ["Um nematoide nao tem:", "coluna vertebral", ["corpo", "ciclo de vida", "alimentacao"], "Por ser invertebrado, nao possui coluna vertebral."],
      ["Nematoides podem ser encontrados:", "no solo, na agua e em hospedeiros", ["somente no ceu", "apenas em ninhos", "somente em penas"], "Eles vivem em muitos ambientes diferentes."],
      ["O ancilostomo e um nematoide associado ao:", "amarelao", ["sarampo", "catapora", "gripe"], "Ancilostomos podem causar a doenca conhecida como amarelao."],
      ["Usar calcados em locais de risco ajuda a prevenir:", "penetracao de larvas pela pele", ["crescimento de penas", "formacao de conchas", "voo de insetos"], "Algumas larvas de nematoides podem entrar pela pele."],
      ["Nematoides de vida livre sao importantes porque:", "participam dos ecossistemas", ["nao tem nenhuma funcao", "viram aves", "produzem flores"], "Eles fazem parte das cadeias alimentares e do solo."],
      ["Uma diferenca entre nematoide e anelideo e que o anelideo tem:", "corpo segmentado", ["corpo sempre sem aneis", "penas", "concha"], "Anelideos tem aneis; nematoides nao."],
      ["Durante o crescimento, nematoides passam por fases chamadas:", "larvas", ["filhotes mamando", "sementes", "penas"], "Larvas fazem parte do desenvolvimento de muitos nematoides."],
      ["Nematoides parasitas retiram alimento do:", "hospedeiro", ["ar puro", "sol", "caderno"], "Parasitas dependem de outro ser vivo para se alimentar."],
      ["O corpo dos nematoides e revestido por uma camada protetora chamada:", "cuticula", ["pena", "concha", "casca de ovo"], "A cuticula ajuda a proteger o corpo do verme."],
      ["A cuticula dos nematoides pode ser trocada durante:", "o crescimento", ["a fotossintese", "a amamentacao", "o voo"], "A troca da cuticula acompanha etapas de crescimento."],
      ["Nematoides nao sao moluscos porque nao possuem:", "corpo mole com manto", ["celulas", "alimentacao", "desenvolvimento"], "Moluscos tem caracteristicas proprias, como corpo mole e manto."],
      ["O estudo dos nematoides inclui caracteristicas e:", "ciclo de vida", ["tabuada", "mapas", "pontuacao"], "Entender o desenvolvimento ajuda a prevenir parasitoses."],
      ["Se um verme e cilindrico, fino e sem aneis, pode ser:", "nematoide", ["anelideo", "molusco", "ave"], "Essas caracteristicas combinam com nematoides."],
      ["A higiene dos alimentos ajuda a impedir a entrada de:", "ovos de vermes", ["penas", "conchas", "asas"], "Ovos de parasitas podem estar em alimentos contaminados."],
      ["Nematoides podem parasitar tambem:", "plantas", ["somente pedras", "apenas nuvens", "so metais"], "Algumas especies atacam raizes e prejudicam plantas."],
      ["No corpo humano, algumas larvas de nematoides podem migrar antes de chegar ao:", "intestino", ["ninho", "galho", "casco"], "Certos ciclos incluem passagem por outras partes do corpo."],
      ["Aprender sobre nematoides ajuda a valorizar:", "higiene e saneamento", ["falta de cuidado", "agua contaminada", "alimentos sujos"], "Higiene e saneamento reduzem muitas verminoses."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "nematoides", "Caracteristicas e Desenvolvimento dos Nematoides", "cie_ne",
      nematodeEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const molluskEntries = [
      ["Os moluscos sao invertebrados de corpo:", "mole", ["com penas", "com ossos internos fortes", "sempre achatado"], "Moluscos possuem corpo mole."],
      ["Qual destes animais e um molusco?", "caracol", ["minhoca", "lombriga", "planaria"], "O caracol pertence ao grupo dos moluscos."],
      ["Muitos moluscos possuem uma estrutura dura chamada:", "concha", ["pena", "coluna vertebral", "asa"], "A concha protege muitos moluscos."],
      ["Um molusco sem concha externa evidente e:", "polvo", ["galinha", "minhoca", "lombriga"], "O polvo e um molusco sem concha externa."],
      ["Lesmas sao moluscos com corpo:", "mole e sem concha externa grande", ["com penas", "segmentado em aneis", "achatado como fita"], "Lesmas sao moluscos terrestres de corpo mole."],
      ["A lula e o polvo fazem parte dos:", "moluscos", ["anelideos", "nematoides", "platelmintos"], "Lulas e polvos sao moluscos cefalopodes."],
      ["O caracol se locomove usando principalmente:", "pe muscular", ["asas", "penas", "patas com casco"], "O pe muscular ajuda muitos moluscos a se moverem."],
      ["O manto dos moluscos pode ajudar a formar:", "concha", ["penas", "coluna vertebral", "aneis"], "O manto produz a concha em muitos moluscos."],
      ["Moluscos vivem em ambientes:", "aquaticos e terrestres umidos", ["somente no ceu", "apenas no deserto seco", "so dentro de ninhos"], "Ha moluscos marinhos, de agua doce e terrestres."],
      ["Ostra e mexilhao sao exemplos de:", "moluscos", ["aves", "mamiferos", "nematoides"], "Ostras e mexilhoes sao moluscos bivalves."],
      ["Bivalves recebem esse nome porque possuem:", "duas valvas", ["duas penas", "dois pulmoes sempre", "dois bicos"], "A concha dos bivalves e formada por duas partes."],
      ["Polvos e lulas tem bracos ou tentaculos usados para:", "capturar alimento", ["produzir leite", "fazer penas", "formar aneis"], "Essas estruturas ajudam na captura de presas."],
      ["Moluscos sao animais:", "invertebrados", ["vertebrados", "aves", "mamiferos"], "Moluscos nao possuem coluna vertebral."],
      ["Caracois terrestres precisam de ambiente umido para:", "evitar ressecamento", ["criar penas", "voar", "virar planta"], "A umidade protege o corpo mole."],
      ["Muitos moluscos aquaticos respiram por:", "branquias", ["penas", "bicos", "cascos"], "Branquias permitem trocas gasosas na agua."],
      ["Alguns caracois terrestres respiram com estrutura semelhante a:", "pulmao", ["asa", "concha de ave", "barbatana"], "Caracois terrestres pulmonados usam uma cavidade respiratoria."],
      ["A maioria dos moluscos se desenvolve a partir de:", "ovos", ["sementes", "penas", "rochas"], "O desenvolvimento de muitos moluscos comeca em ovos."],
      ["Em muitos moluscos aquaticos, o desenvolvimento inclui fase de:", "larva", ["filhote mamando", "pena nova", "casco de tartaruga"], "Muitos moluscos marinhos tem larvas no ciclo de vida."],
      ["O caracol adulto cresce mantendo o corpo:", "mole", ["com coluna vertebral", "com penas", "segmentado em aneis"], "Mesmo adulto, o molusco mantem corpo mole."],
      ["A concha do caracol aumenta conforme o animal:", "cresce", ["voa", "mama", "troca penas"], "A concha acompanha o crescimento do caracol."],
      ["Moluscos podem servir de alimento para:", "outros animais e seres humanos", ["apenas pedras", "somente nuvens", "so plantas"], "Muitos moluscos participam das cadeias alimentares."],
      ["Uma caracteristica usada para reconhecer moluscos e:", "corpo mole", ["coluna vertebral", "penas", "pelos"], "O corpo mole e uma marca importante do grupo."],
      ["O polvo se protege usando, em algumas situacoes:", "jato de tinta", ["leite", "penas", "concha externa grande"], "Polvos podem liberar tinta para confundir predadores."],
      ["Moluscos com duas conchas, como ostras, costumam filtrar:", "particulas da agua", ["penas do ar", "folhas secas", "pedras grandes"], "Bivalves filtram a agua para obter alimento."],
      ["O caramujo pode participar do ciclo da:", "esquistossomose", ["gripe", "catapora", "sarampo"], "Certos caramujos podem ser hospedeiros no ciclo da esquistossomose."],
      ["Moluscos nao sao anelideos porque nao possuem corpo:", "segmentado em aneis", ["mole", "com celulas", "com alimentacao"], "Anelideos tem corpo dividido em aneis."],
      ["A lesma se desloca deixando uma trilha de:", "muco", ["penas", "areia seca sempre", "leite"], "O muco ajuda na locomocao e protege o corpo."],
      ["No estudo dos moluscos, concha, manto e pe sao:", "partes importantes", ["tipos de penas", "ossos da coluna", "nomes de plantas"], "Essas estruturas ajudam a compreender o grupo."],
      ["Um animal marinho de corpo mole e oito bracos e:", "polvo", ["minhoca", "lombriga", "planaria"], "O polvo e um molusco cefalopode."],
      ["O desenvolvimento dos moluscos mostra que eles:", "crescem ate a fase adulta", ["nascem sempre adultos", "viram aves", "produzem leite"], "Moluscos passam por crescimento ao longo da vida."],
      ["Caracois colocam ovos em locais geralmente:", "umidos", ["muito secos", "com penas", "no ar"], "A umidade favorece a protecao dos ovos."],
      ["Moluscos sao importantes nos ecossistemas porque:", "participam das cadeias alimentares", ["nao interagem com nada", "sao todos parasitas", "vivem so em livros"], "Eles servem de alimento, filtram agua e ocupam varios ambientes."],
      ["Ao comparar moluscos e nematoides, o molusco se destaca por ter:", "corpo mole com pe ou manto", ["corpo cilindrico sem aneis", "apenas vida parasita", "penas e asas"], "Pe muscular e manto sao caracteristicas comuns em moluscos."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "moluscos", "Caracteristicas e Desenvolvimento dos Moluscos", "cie_mo",
      molluskEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const annelidEntries = [
      ["Os anelideos tem o corpo dividido em:", "aneis", ["penas", "conchas", "bicos"], "Anelideos apresentam corpo segmentado em aneis."],
      ["Qual destes animais e um anelideo?", "minhoca", ["caracol", "polvo", "lombriga"], "A minhoca pertence ao grupo dos anelideos."],
      ["Anelideos sao animais:", "invertebrados", ["aves", "mamiferos", "peixes"], "Eles nao possuem coluna vertebral."],
      ["O corpo segmentado da minhoca parece formado por muitos:", "aneis", ["cascos", "dentes", "galhos"], "Os segmentos dao aparencia de aneis."],
      ["As minhocas vivem geralmente em solo:", "umido", ["muito seco", "coberto de penas", "com sal puro"], "A umidade e importante para a vida das minhocas."],
      ["A minhoca respira principalmente pela:", "pele umida", ["pena", "concha", "asa"], "A pele umida permite trocas gasosas."],
      ["Para a minhoca respirar bem, a pele precisa ficar:", "umida", ["seca", "coberta de penas", "dura como pedra"], "A pele ressecada prejudica a respiracao."],
      ["Minhocas ajudam o solo porque:", "misturam e arejam a terra", ["produzem leite", "formam penas", "criam conchas"], "Ao cavar galerias, ajudam a aerar e misturar o solo."],
      ["Sanguessugas fazem parte dos:", "anelideos", ["moluscos", "nematoides", "platelmintos"], "Sanguessugas sao anelideos."],
      ["Algumas sanguessugas se alimentam de:", "sangue", ["leite de aves", "penas", "conchas"], "Certas especies sao hematofagas."],
      ["Anelideos marinhos chamados poliquetas vivem principalmente:", "no mar", ["no deserto seco", "em ninhos de aves", "no ar"], "Poliquetas sao anelideos comuns em ambientes marinhos."],
      ["A palavra anelideo se relaciona a:", "aneis do corpo", ["asas", "conchas", "pelos"], "O nome lembra o corpo dividido em aneis."],
      ["A minhoca nao e nematoide porque tem:", "corpo segmentado", ["corpo cilindrico liso", "penas", "concha"], "Nematoides nao possuem aneis como anelideos."],
      ["A minhoca nao e molusco porque nao possui:", "manto e concha", ["corpo", "alimentacao", "celulas"], "Manto e concha sao associados a muitos moluscos."],
      ["Muitos anelideos se locomovem por:", "contracao do corpo", ["voo", "barbatanas rigidas", "penas"], "Contraindo e alongando o corpo, eles se deslocam."],
      ["Pequenas cerdas em algumas minhocas ajudam na:", "locomocao", ["producao de leite", "formacao de concha", "fotossintese"], "Cerdas ajudam a firmar o corpo no solo."],
      ["A minhoca se alimenta de materia organica no:", "solo", ["ar", "ninho", "casco"], "Ela ingere particulas do solo com materia organica."],
      ["As fezes das minhocas podem deixar o solo mais:", "fertil", ["seco sempre", "sem vida", "cheio de penas"], "Os residuos da digestao enriquecem o solo."],
      ["O desenvolvimento de muitas minhocas comeca em:", "ovos dentro de casulos", ["sementes", "penas", "conchas"], "Minhocas podem formar casulos com ovos."],
      ["O casulo da minhoca protege:", "ovos", ["penas", "leite", "asas"], "Os ovos ficam protegidos no casulo."],
      ["Quando sai do casulo, a jovem minhoca cresce ate virar:", "adulta", ["ave", "molusco", "planta"], "Ela cresce mantendo caracteristicas de anelideo."],
      ["Muitas minhocas possuem os dois sexos no mesmo corpo; isso e chamado:", "hermafroditismo", ["voo", "amamentacao", "fotossintese"], "Minhocas sao hermafroditas, embora geralmente troquem gametas com outra minhoca."],
      ["Mesmo sendo hermafrodita, a minhoca geralmente se reproduz com:", "outra minhoca", ["uma ave", "uma concha", "uma pedra"], "Duas minhocas podem trocar gametas durante a reproducao."],
      ["Anelideos possuem sistema circulatorio geralmente:", "fechado", ["sem sangue sempre", "igual a penas", "feito de conchas"], "Em muitos anelideos, o sangue circula dentro de vasos."],
      ["A minhoca evita luz forte porque seu corpo precisa de:", "umidade", ["penas secas", "concha quente", "ar seco"], "Ambientes claros e secos podem ressecar a pele."],
      ["Um animal alongado, com aneis e que vive no solo pode ser:", "minhoca", ["polvo", "caracol", "planaria"], "A minhoca tem corpo anelado e vive no solo."],
      ["Anelideos podem viver em ambientes:", "terrestres umidos e aquaticos", ["somente no ceu", "apenas em penas", "so no deserto seco"], "O grupo inclui especies do solo, de agua doce e marinhas."],
      ["O corpo dos anelideos e organizado em segmentos que podem ajudar na:", "movimentacao", ["producao de penas", "formacao de bico", "fotossintese"], "A segmentacao ajuda o corpo a se mover."],
      ["A respiracao pela pele tambem e chamada de respiracao:", "cutanea", ["pulmonar com penas", "por concha", "por bico"], "Respiracao cutanea ocorre pela pele."],
      ["Para observar anelideos com cuidado, deve-se evitar:", "machucar o animal", ["manter a umidade", "observar os aneis", "devolver ao solo"], "O estudo deve respeitar o ser vivo."],
      ["Anelideos nao possuem:", "coluna vertebral", ["corpo segmentado", "desenvolvimento", "alimentacao"], "Eles sao invertebrados."],
      ["As minhocas sao importantes para hortas porque:", "melhoram a qualidade do solo", ["comem todas as plantas", "secam a terra", "produzem penas"], "A atividade das minhocas favorece solos mais arejados e ferteis."],
      ["No desenvolvimento da minhoca, o animal aumenta de tamanho por:", "crescimento", ["metamorfose em borboleta", "amamentacao", "troca de penas"], "A minhoca cresce ate atingir a fase adulta."],
      ["Comparar anelideos com platelmintos mostra que anelideos tem:", "aneis no corpo", ["corpo sempre achatado", "concha", "penas"], "Os aneis distinguem anelideos dos platelmintos."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "anelideos", "Caracteristicas e Desenvolvimento dos Anelideos", "cie_an",
      annelidEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    return scienceQuestions;
  }

  const scienceQuestions = generateScienceQuestions();
  questions.push(...scienceQuestions);

  function generateEnglishQuestions() {
    const englishQuestions = [];

    const easterItems = [
      ["Easter egg", "ovo de Pascoa"],
      ["Chocolate", "chocolate"],
      ["Basket", "cesta"],
      ["Bunny", "coelho"],
      ["Candy", "doce"],
      ["Sunday", "domingo"],
      ["Gift", "presente"],
      ["Family", "familia"],
      ["Egg hunt", "caca aos ovos"],
      ["Happy Easter", "Feliz Pascoa"]
    ];

    const easterEntries = [
      ...easterItems.map(([en, pt]) => makeEntry(`O que significa "${en}"?`, pt, easterItems.map(item => item[1]).filter(v => v !== pt).slice(0, 3), `Em ingles, "${en}" significa "${pt}".`, (v) => v)),
      ...easterItems.slice(0, 9).map(([en, pt]) => makeEntry(`Qual palavra em ingles combina com "${pt}"?`, en, easterItems.map(item => item[0]).filter(v => v !== en).slice(-3), `A traducao correta de "${pt}" e "${en}".`, (v) => v))
    ];
    englishQuestions.push(...buildQuestions("ingles", "easter_eggs", "Celebrations - Easter Eggs", "eng_ea", easterEntries.slice(0, 19)));

    const houseItems = [
      ["kitchen", "cozinha"],
      ["bedroom", "quarto"],
      ["bathroom", "banheiro"],
      ["living room", "sala"],
      ["door", "porta"],
      ["window", "janela"],
      ["roof", "telhado"],
      ["garden", "jardim"],
      ["garage", "garagem"],
      ["table", "mesa"]
    ];

    const houseEntries = [
      ...houseItems.map(([en, pt]) => makeEntry(`O que significa "${en}"?`, pt, houseItems.map(item => item[1]).filter(v => v !== pt).slice(0, 3), `Em ingles, "${en}" quer dizer "${pt}".`, (v) => v)),
      ...houseItems.slice(0, 9).map(([en, pt]) => makeEntry(`Qual palavra em ingles significa "${pt}"?`, en, houseItems.map(item => item[0]).filter(v => v !== en).slice(-3), `A traducao correta de "${pt}" e "${en}".`, (v) => v))
    ];
    englishQuestions.push(...buildQuestions("ingles", "parts_house", "Parts of House", "eng_ho", houseEntries.slice(0, 19)));

    const thereIsAreSingular = [
      ["one bed", "There is one bed in the room."],
      ["one table", "There is one table in the kitchen."],
      ["one cat", "There is one cat in the garden."],
      ["one book", "There is one book on the desk."],
      ["one ball", "There is one ball in the box."],
      ["one apple", "There is one apple on the plate."],
      ["one door", "There is one door in the bedroom."],
      ["one window", "There is one window in the bathroom."],
      ["one chair", "There is one chair in the classroom."]
    ];

    const thereIsArePlural = [
      ["two beds", "There are two beds in the room."],
      ["three tables", "There are three tables in the kitchen."],
      ["four cats", "There are four cats in the garden."],
      ["five books", "There are five books on the desk."],
      ["six balls", "There are six balls in the box."],
      ["seven apples", "There are seven apples on the plate."],
      ["eight doors", "There are eight doors in the school."],
      ["nine windows", "There are nine windows in the house."],
      ["ten chairs", "There are ten chairs in the classroom."]
    ];

    const thereEntries = [
      ...thereIsAreSingular.map(([desc, sentence]) => makeEntry(`Qual frase correta fala sobre ${desc}?`, sentence, thereIsAreSingular.concat(thereIsArePlural).map(item => item[1]).filter(v => v !== sentence).slice(0, 3), `Usamos "There is" para falar de uma coisa so.`, (v) => v)),
      ...thereIsArePlural.map(([desc, sentence]) => makeEntry(`Qual frase correta fala sobre ${desc}?`, sentence, thereIsAreSingular.concat(thereIsArePlural).map(item => item[1]).filter(v => v !== sentence).slice(-3), `Usamos "There are" para falar de mais de uma coisa.`, (v) => v)),
      makeEntry(`Qual opcao completa corretamente: "__ one dog in the yard."`, "There is", ["There are", "Is there", "Are there"], `Com um cachorro so, usamos "There is".`, (v) => v)
    ];
    englishQuestions.push(...buildQuestions("ingles", "there_is_are", "There is / There are", "eng_ti", thereEntries.slice(0, 19)));

    const negativeEntries = [
      makeEntry(`Qual frase significa "Nao ha uma bola na caixa"?`, "There is not a ball in the box.", ["There are not a ball in the box.", "Is there not a ball in the box?", "There is a ball in the box."], `Na forma negativa singular usamos "There is not".`, (v) => v),
      makeEntry(`Qual frase significa "Nao ha duas cadeiras na sala"?`, "There are not two chairs in the room.", ["There is not two chairs in the room.", "There are two chairs in the room.", "Are there not two chairs in the room?"], `Na forma negativa plural usamos "There are not".`, (v) => v),
      makeEntry(`Complete: "__ a cat on the sofa."`, "There is not", ["There are not", "Is there", "There is"], `Como a frase e negativa e fala de um gato, usamos "There is not".`, (v) => v),
      makeEntry(`Complete: "__ three books on the table."`, "There are not", ["There is not", "There are", "Are there"], `Como a frase e negativa e fala de tres livros, usamos "There are not".`, (v) => v),
      makeEntry(`Qual frase esta na forma negativa correta?`, "There is not one apple in the bag.", ["There are not one apple in the bag.", "There is one apple in the bag.", "Is there one apple in the bag?"], `Para uma unidade na negativa, usamos "There is not".`, (v) => v),
      makeEntry(`Qual frase esta na forma negativa correta?`, "There are not four pens in the pencil case.", ["There is not four pens in the pencil case.", "There are four pens in the pencil case.", "Are there four pens in the pencil case?"], `Para mais de uma coisa, usamos "There are not".`, (v) => v),
      makeEntry(`Como dizemos "Nao ha uma mesa na cozinha"?`, "There is not a table in the kitchen.", ["There are not a table in the kitchen.", "There is a table in the kitchen.", "Is there a table in the kitchen?"], `A forma negativa singular correta e "There is not".`, (v) => v),
      makeEntry(`Como dizemos "Nao ha cinco flores no jardim"?`, "There are not five flowers in the garden.", ["There is not five flowers in the garden.", "There are five flowers in the garden.", "Are there five flowers in the garden?"], `A forma negativa plural correta e "There are not".`, (v) => v),
      makeEntry(`Se queremos negar a existencia de uma janela, usamos:`, "There is not", ["There are not", "Are there", "There are"], `Como uma janela so, usamos a forma singular negativa.`, (v) => v),
      makeEntry(`Se queremos negar a existencia de muitas janelas, usamos:`, "There are not", ["There is not", "Is there", "There is"], `Para muitas janelas, usamos a forma plural negativa.`, (v) => v),
      makeEntry(`Qual traducao esta correta para "Nao ha um coelho na cesta"?`, "There is not a bunny in the basket.", ["There are not a bunny in the basket.", "There is a bunny in the basket.", "Are there a bunny in the basket?"], `Com um coelho so, usamos "There is not".`, (v) => v),
      makeEntry(`Qual traducao esta correta para "Nao ha tres ovos na cesta"?`, "There are not three eggs in the basket.", ["There is not three eggs in the basket.", "There are three eggs in the basket.", "Is there three eggs in the basket?"], `Com tres ovos, usamos "There are not".`, (v) => v),
      makeEntry(`Marque a frase negativa correta:`, "There is not one book in my bag.", ["There are not one book in my bag.", "There is one book in my bag.", "Are there one book in my bag?"], `"There is not" combina com um livro so.`, (v) => v),
      makeEntry(`Marque a frase negativa correta:`, "There are not six crayons on the desk.", ["There is not six crayons on the desk.", "There are six crayons on the desk.", "Is there six crayons on the desk?"], `"There are not" combina com seis lapis de cor.`, (v) => v),
      makeEntry(`Complete corretamente: There __ not two cats here.`, "are", ["is", "am", "be"], `Com duas coisas, usamos "are".`, (v) => v),
      makeEntry(`Complete corretamente: There __ not one dog here.`, "is", ["are", "am", "be"], `Com uma coisa so, usamos "is".`, (v) => v),
      makeEntry(`Qual frase significa "Nao ha flores na mesa"?`, "There are not flowers on the table.", ["There is not flowers on the table.", "There are flowers on the table.", "Is there flowers on the table?"], `Como flores esta no plural, usamos "There are not".`, (v) => v),
      makeEntry(`Qual frase significa "Nao ha uma caneta na mochila"?`, "There is not a pen in the backpack.", ["There are not a pen in the backpack.", "There is a pen in the backpack.", "Are there a pen in the backpack?"], `Como caneta esta no singular, usamos "There is not".`, (v) => v),
      makeEntry(`Na frase negativa plural, usamos:`, "There are not", ["There is not", "Is there", "There is"], `Plural pede "There are not".`, (v) => v)
    ];
    englishQuestions.push(...buildQuestions("ingles", "there_negative", "There is / There are / Negative Form", "eng_tn", negativeEntries.slice(0, 19)));

    const interrogativeEntries = [
      makeEntry(`Como perguntamos "Ha um livro na mesa?"`, "Is there a book on the table?", ["Are there a book on the table?", "There is a book on the table?", "Is there books on the table?"], `Para pergunta com singular usamos "Is there...?"`, (v) => v),
      makeEntry(`Como perguntamos "Ha tres livros na mesa?"`, "Are there three chairs in the room?", ["Is there three chairs in the room?", "There are three chairs in the room?", "Are there a chair in the room?"], `Plural pede "Are there...?"`, (v) => v),
      makeEntry(`Complete: "__ there one apple in the bag?"`, "Is", ["Are", "There", "Do"], `Com uma maca, usamos "Is there".`, (v) => v),
      makeEntry(`Complete: "__ there five apples in the bag?"`, "Are", ["Is", "There", "Do"], `Com cinco macas, usamos "Are there".`, (v) => v),
      makeEntry(`Qual pergunta esta correta?`, "Is there a chair in the room?", ["Are there a chair in the room?", "There are a chair in the room?", "Is there chairs in the room?"], `Singular pede "Is there".`, (v) => v),
      makeEntry(`Qual pergunta esta correta?`, "Are there two chairs in the room?", ["Is there two chairs in the room?", "There are two chairs in the room?", "Are there a chair in the room?"], `Plural pede "Are there".`, (v) => v),
      makeEntry(`A pergunta "Is there a cat in the house?" fala sobre:`, "um gato", ["dois gatos", "muitas casas", "nenhum gato"], `"A cat" indica um gato so.`, (v) => v),
      makeEntry(`A pergunta "Are there four windows?" fala sobre:`, "quatro janelas", ["uma janela", "uma porta", "um telhado"], `"Four windows" significa quatro janelas.`, (v) => v),
      makeEntry(`Qual forma usamos para perguntar sobre uma mesa?`, "Is there", ["Are there", "There are", "There is not"], `Com uma mesa, usamos "Is there".`, (v) => v),
      makeEntry(`Qual forma usamos para perguntar sobre muitas mesas?`, "Are there", ["Is there", "There is", "There is not"], `Com muitas mesas, usamos "Are there".`, (v) => v),
      makeEntry(`Como perguntamos "Ha um coelho na cesta?"`, "Is there a bunny in the basket?", ["Are there a bunny in the basket?", "There is a bunny in the basket?", "Is there bunnies in the basket?"], `Como e um coelho, usamos o singular interrogativo.`, (v) => v),
      makeEntry(`Como perguntamos "Ha ovos na cesta?"`, "Are there eggs in the basket?", ["Is there eggs in the basket?", "There are eggs in the basket?", "Are there an egg in the basket?"], `Como e plural, usamos "Are there".`, (v) => v),
      makeEntry(`Qual traducao esta correta para "Ha uma porta na casa?"`, "Is there a door in the house?", ["Are there a door in the house?", "There is a door in the house?", "Is there doors in the house?"], `A traducao correta usa "Is there".`, (v) => v),
      makeEntry(`Qual traducao esta correta para "Ha janelas na casa?"`, "Are there windows in the house?", ["Is there windows in the house?", "There are windows in the house?", "Are there a window in the house?"], `A traducao correta usa "Are there".`, (v) => v),
      makeEntry(`Qual frase e uma pergunta?`, "Is there a table here?", ["There is a table here.", "There are tables here.", "There is not a table here."], `A pergunta aparece com "Is there...?"`, (v) => v),
      makeEntry(`Qual frase e uma pergunta no plural?`, "Are there books in your bag?", ["Is there books in your bag?", "There are books in your bag.", "There are not books in your bag."], `Perguntas no plural usam "Are there".`, (v) => v),
      makeEntry(`Em "Is there a toy?", a resposta curta pode comecar com:`, "Yes, there is.", ["Yes, there are.", "No, are there.", "Yes, is there."], `Se a pergunta usa singular, a resposta curta tambem usa singular.`, (v) => v),
      makeEntry(`Em "Are there pencils?", a resposta curta pode comecar com:`, "Yes, there are.", ["Yes, there is.", "No, is there.", "Yes, are there."], `Se a pergunta usa plural, a resposta curta tambem usa plural.`, (v) => v)
    ];
    englishQuestions.push(...buildQuestions("ingles", "there_interrogative", "There is / There are / Interrogative Form", "eng_tq", interrogativeEntries.slice(0, 18)));

    const mothersItems = [
      ["Mother", "mae"],
      ["Flowers", "flores"],
      ["Card", "cartao"],
      ["Love", "amor"],
      ["Breakfast", "cafe da manha"],
      ["Hug", "abraco"],
      ["Gift", "presente"],
      ["Sunday", "domingo"],
      ["Family", "familia"],
      ["Happy Mother's Day", "Feliz Dia das Maes"]
    ];

    const mothersEntries = [
      ...mothersItems.map(([en, pt]) => makeEntry(`O que significa "${en}"?`, pt, mothersItems.map(item => item[1]).filter(v => v !== pt).slice(0, 3), `Em ingles, "${en}" significa "${pt}".`, (v) => v)),
      ...mothersItems.slice(0, 9).map(([en, pt]) => makeEntry(`Qual palavra em ingles significa "${pt}"?`, en, mothersItems.map(item => item[0]).filter(v => v !== en).slice(-3), `A traducao correta de "${pt}" e "${en}".`, (v) => v))
    ];
    englishQuestions.push(...buildQuestions("ingles", "mothers_day", "Celebrations - Mother's Day", "eng_md", mothersEntries.slice(0, 19)));

    const foodItems = [
      ["bread", "pao"],
      ["milk", "leite"],
      ["apple", "maca"],
      ["rice", "arroz"],
      ["beans", "feijao"],
      ["juice", "suco"],
      ["cake", "bolo"],
      ["egg", "ovo"],
      ["banana", "banana"],
      ["cheese", "queijo"]
    ];

    const foodEntries = [
      ...foodItems.map(([en, pt]) => makeEntry(`O que significa "${en}"?`, pt, foodItems.map(item => item[1]).filter(v => v !== pt).slice(0, 3), `Em ingles, "${en}" significa "${pt}".`, (v) => v)),
      ...foodItems.slice(0, 9).map(([en, pt]) => makeEntry(`Qual palavra em ingles significa "${pt}"?`, en, foodItems.map(item => item[0]).filter(v => v !== en).slice(-3), `A traducao correta de "${pt}" e "${en}".`, (v) => v))
    ];
    englishQuestions.push(...buildQuestions("ingles", "food", "Food", "eng_fo", foodEntries.slice(0, 19)));

    const colorItems = [
      ["red", "vermelho"],
      ["blue", "azul"],
      ["green", "verde"],
      ["yellow", "amarelo"],
      ["black", "preto"],
      ["white", "branco"],
      ["pink", "rosa"],
      ["orange", "laranja"],
      ["purple", "roxo"]
    ];

    const colorEntries = [
      ...colorItems.map(([en, pt]) => makeEntry(`O que significa "${en}"?`, pt, colorItems.map(item => item[1]).filter(v => v !== pt).slice(0, 3), `Em ingles, "${en}" significa "${pt}".`, (v) => v)),
      ...colorItems.map(([en, pt]) => makeEntry(`Qual palavra em ingles significa "${pt}"?`, en, colorItems.map(item => item[0]).filter(v => v !== en).slice(-3), `A traducao correta de "${pt}" e "${en}".`, (v) => v))
    ];
    englishQuestions.push(...buildQuestions("ingles", "colors", "Colors", "eng_co", colorEntries.slice(0, 18)));

    return englishQuestions;
  }

  const englishQuestions = generateEnglishQuestions();
  questions.push(...englishQuestions);

const geographyQuestions = [];
    geographyQuestions.push(...buildQuestions("geografia", "o_que_e_lixo_rejeito_residuo", "O que é lixo, rejeito e resíduo", "geo_lr", [
      ["O papel limpo é um exemplo de resíduo reciclável?", ["resíduo reciclável","resíduo orgânico","resíduo perigoso","lixo comum"], 0, "O papel limpo pode voltar ao ciclo da reciclagem."],
      ["Qual destas opções combina com resíduo reciclável?", ["papel limpo","casca de fruta","pilha usada","garrafa PET limpa"], 0, "O papel limpo pode voltar ao ciclo da reciclagem."],
      ["Para onde o papel limpo deve ir?", ["reciclagem","compostagem","coleta especial","lixo comum"], 0, "O papel limpo pode voltar ao ciclo da reciclagem."],
      ["O que fazemos com o papel limpo?", ["ir para reciclagem","virar adubo","ter descarte especial","ser separado corretamente"], 0, "O papel limpo pode voltar ao ciclo da reciclagem."],
      ["Por que o papel limpo precisa de cuidado no descarte?", ["pode ser reaproveitado","vem de seres vivos","pode contaminar o ambiente","não deve ser misturado"], 0, "O papel limpo pode voltar ao ciclo da reciclagem."],
      ["O casca de fruta é um exemplo de resíduo orgânico?", ["resíduo orgânico","resíduo reciclável","resíduo perigoso","lixo comum"], 0, "Restos de frutas são orgânicos e podem virar adubo."],
      ["Qual destas opções combina com resíduo orgânico?", ["casca de fruta","papel limpo","pilha usada","garrafa PET limpa"], 0, "Restos de frutas são orgânicos e podem virar adubo."],
      ["Para onde o casca de fruta deve ir?", ["compostagem","reciclagem","coleta especial","lixo comum"], 0, "Restos de frutas são orgânicos e podem virar adubo."],
      ["O que fazemos com o casca de fruta?", ["virar adubo","ir para reciclagem","ter descarte especial","ser separado corretamente"], 0, "Restos de frutas são orgânicos e podem virar adubo."],
      ["Por que o casca de fruta precisa de cuidado no descarte?", ["vem de seres vivos","pode ser reaproveitado","pode contaminar o ambiente","não deve ser misturado"], 0, "Restos de frutas são orgânicos e podem virar adubo."],
      ["O pilha usada é um exemplo de resíduo perigoso?", ["resíduo perigoso","resíduo reciclável","resíduo orgânico","lixo comum"], 0, "Pilhas exigem descarte correto por causa dos materiais que contêm."],
      ["Qual destas opções combina com resíduo perigoso?", ["pilha usada","papel limpo","casca de fruta","garrafa PET limpa"], 0, "Pilhas exigem descarte correto por causa dos materiais que contêm."],
      ["Para onde o pilha usada deve ir?", ["coleta especial","reciclagem","compostagem","lixo comum"], 0, "Pilhas exigem descarte correto por causa dos materiais que contêm."],
      ["O que fazemos com o pilha usada?", ["ter descarte especial","ir para reciclagem","virar adubo","ser separado corretamente"], 0, "Pilhas exigem descarte correto por causa dos materiais que contêm."],
      ["Por que o pilha usada precisa de cuidado no descarte?", ["pode contaminar o ambiente","pode ser reaproveitado","vem de seres vivos","não deve ser misturado"], 0, "Pilhas exigem descarte correto por causa dos materiais que contêm."],
      ["O garrafa PET limpa é um exemplo de resíduo reciclável?", ["resíduo reciclável","resíduo orgânico","resíduo perigoso","lixo comum"], 0, "O plástico limpo pode ser separado para reciclagem."],
      ["Qual destas opções combina com resíduo reciclável?", ["garrafa PET limpa","papel limpo","casca de fruta","pilha usada"], 0, "O plástico limpo pode ser separado para reciclagem."],
      ["Para onde o garrafa PET limpa deve ir?", ["reciclagem","compostagem","coleta especial","lixo comum"], 0, "O plástico limpo pode ser separado para reciclagem."],
      ["O que fazemos com o garrafa PET limpa?", ["ir para reciclagem","virar adubo","ter descarte especial","ser separado corretamente"], 0, "O plástico limpo pode ser separado para reciclagem."],
      ["Por que o garrafa PET limpa precisa de cuidado no descarte?", ["pode ser reaproveitada","pode ser reaproveitado","vem de seres vivos","pode contaminar o ambiente"], 0, "O plástico limpo pode ser separado para reciclagem."],
      ["O resto de comida é um exemplo de resíduo orgânico?", ["resíduo orgânico","resíduo reciclável","resíduo perigoso","lixo comum"], 0, "Restos de comida são orgânicos e podem ser compostados."],
      ["Qual destas opções combina com resíduo orgânico?", ["resto de comida","papel limpo","casca de fruta","pilha usada"], 0, "Restos de comida são orgânicos e podem ser compostados."],
      ["Para onde o resto de comida deve ir?", ["compostagem","reciclagem","coleta especial","lixo comum"], 0, "Restos de comida são orgânicos e podem ser compostados."],
      ["O que fazemos com o resto de comida?", ["virar adubo","ir para reciclagem","ter descarte especial","ser separado corretamente"], 0, "Restos de comida são orgânicos e podem ser compostados."],
      ["Por que o resto de comida precisa de cuidado no descarte?", ["vem de seres vivos","pode ser reaproveitado","pode contaminar o ambiente","não deve ser misturado"], 0, "Restos de comida são orgânicos e podem ser compostados."]
    ]));
    geographyQuestions.push(...buildQuestions("geografia", "tipos_residuos_solidos", "Os tipos de resíduos sólidos", "geo_trs", [
      ["O resto de comida é um exemplo de orgânico?", ["orgânico","reciclável","eletrônico","perigoso"], 0, "Restos de comida são resíduos orgânicos."],
      ["Qual destas opções combina com orgânico?", ["resto de comida","papel limpo","celular velho","tijolo quebrado"], 0, "Restos de comida são resíduos orgânicos."],
      ["Para onde o resto de comida deve ir?", ["lixeira orgânica","coleta seletiva","ponto eletrônico","coleta especial"], 0, "Restos de comida são resíduos orgânicos."],
      ["O que fazemos com o resto de comida?", ["ser compostado","seguir para reciclagem","ir para descarte eletrônico","ter descarte especial"], 0, "Restos de comida são resíduos orgânicos."],
      ["Por que o resto de comida precisa de cuidado no descarte?", ["vem de seres vivos","pode ser reciclado","tem peças e fios","exige cuidado especial"], 0, "Restos de comida são resíduos orgânicos."],
      ["O papel limpo é um exemplo de reciclável?", ["reciclável","orgânico","eletrônico","perigoso"], 0, "Papel limpo costuma entrar na reciclagem."],
      ["Qual destas opções combina com reciclável?", ["papel limpo","resto de comida","celular velho","tijolo quebrado"], 0, "Papel limpo costuma entrar na reciclagem."],
      ["Para onde o papel limpo deve ir?", ["coleta seletiva","lixeira orgânica","ponto eletrônico","coleta especial"], 0, "Papel limpo costuma entrar na reciclagem."],
      ["O que fazemos com o papel limpo?", ["seguir para reciclagem","ser compostado","ir para descarte eletrônico","ter descarte especial"], 0, "Papel limpo costuma entrar na reciclagem."],
      ["Por que o papel limpo precisa de cuidado no descarte?", ["pode ser reciclado","vem de seres vivos","tem peças e fios","exige cuidado especial"], 0, "Papel limpo costuma entrar na reciclagem."],
      ["O celular velho é um exemplo de eletrônico?", ["eletrônico","orgânico","reciclável","perigoso"], 0, "Aparelhos velhos fazem parte do lixo eletrônico."],
      ["Qual destas opções combina com eletrônico?", ["celular velho","resto de comida","papel limpo","tijolo quebrado"], 0, "Aparelhos velhos fazem parte do lixo eletrônico."],
      ["Para onde o celular velho deve ir?", ["ponto eletrônico","lixeira orgânica","coleta seletiva","coleta especial"], 0, "Aparelhos velhos fazem parte do lixo eletrônico."],
      ["O que fazemos com o celular velho?", ["ir para descarte eletrônico","ser compostado","seguir para reciclagem","ter descarte especial"], 0, "Aparelhos velhos fazem parte do lixo eletrônico."],
      ["Por que o celular velho precisa de cuidado no descarte?", ["tem peças e fios","vem de seres vivos","pode ser reciclado","exige cuidado especial"], 0, "Aparelhos velhos fazem parte do lixo eletrônico."],
      ["O tijolo quebrado é um exemplo de da construção civil?", ["da construção civil","orgânico","reciclável","eletrônico"], 0, "Tijolos quebrados são resíduos da construção civil."],
      ["Qual destas opções combina com da construção civil?", ["tijolo quebrado","resto de comida","papel limpo","celular velho"], 0, "Tijolos quebrados são resíduos da construção civil."],
      ["Para onde o tijolo quebrado deve ir?", ["caçamba de obra","lixeira orgânica","coleta seletiva","ponto eletrônico"], 0, "Tijolos quebrados são resíduos da construção civil."],
      ["O que fazemos com o tijolo quebrado?", ["ser levado para obra","ser compostado","seguir para reciclagem","ir para descarte eletrônico"], 0, "Tijolos quebrados são resíduos da construção civil."],
      ["Por que o tijolo quebrado precisa de cuidado no descarte?", ["é sobra de obra","vem de seres vivos","pode ser reciclado","tem peças e fios"], 0, "Tijolos quebrados são resíduos da construção civil."],
      ["O pilha usada é um exemplo de perigoso?", ["perigoso","orgânico","reciclável","eletrônico"], 0, "Pilhas usadas podem contaminar o ambiente."],
      ["Qual destas opções combina com perigoso?", ["pilha usada","resto de comida","papel limpo","celular velho"], 0, "Pilhas usadas podem contaminar o ambiente."],
      ["Para onde o pilha usada deve ir?", ["coleta especial","lixeira orgânica","coleta seletiva","ponto eletrônico"], 0, "Pilhas usadas podem contaminar o ambiente."],
      ["O que fazemos com o pilha usada?", ["ter descarte especial","ser compostado","seguir para reciclagem","ir para descarte eletrônico"], 0, "Pilhas usadas podem contaminar o ambiente."],
      ["Por que o pilha usada precisa de cuidado no descarte?", ["exige cuidado especial","vem de seres vivos","pode ser reciclado","tem peças e fios"], 0, "Pilhas usadas podem contaminar o ambiente."]
    ]));
    geographyQuestions.push(...buildQuestions("geografia", "destino_residuos_solidos", "O destino dos resíduos sólidos", "geo_drs", [
      ["O papel limpo é um exemplo de reciclagem?", ["reciclagem","compostagem","coleta especial","aterro sanitário"], 0, "Papel limpo pode voltar para a reciclagem."],
      ["Qual destas opções combina com reciclagem?", ["papel limpo","resto de comida","pilha usada","lixo misturado"], 0, "Papel limpo pode voltar para a reciclagem."],
      ["Para onde o papel limpo deve ir?", ["reciclagem","compostagem","coleta especial","aterro sanitário"], 0, "Papel limpo pode voltar para a reciclagem."],
      ["O que fazemos com o papel limpo?", ["ser reciclado","virar adubo","ter destino especial","ser levado ao aterro"], 0, "Papel limpo pode voltar para a reciclagem."],
      ["Por que o papel limpo precisa de cuidado no descarte?", ["transforma material usado em novo produto","vira adubo","cuida de material perigoso","recebe resíduos com controle"], 0, "Papel limpo pode voltar para a reciclagem."],
      ["O resto de comida é um exemplo de compostagem?", ["compostagem","reciclagem","coleta especial","aterro sanitário"], 0, "Restos de comida podem ser compostados."],
      ["Qual destas opções combina com compostagem?", ["resto de comida","papel limpo","pilha usada","lixo misturado"], 0, "Restos de comida podem ser compostados."],
      ["Para onde o resto de comida deve ir?", ["compostagem","reciclagem","coleta especial","aterro sanitário"], 0, "Restos de comida podem ser compostados."],
      ["O que fazemos com o resto de comida?", ["virar adubo","ser reciclado","ter destino especial","ser levado ao aterro"], 0, "Restos de comida podem ser compostados."],
      ["Por que o resto de comida precisa de cuidado no descarte?", ["vira adubo","transforma material usado em novo produto","cuida de material perigoso","recebe resíduos com controle"], 0, "Restos de comida podem ser compostados."],
      ["O pilha usada é um exemplo de coleta especial?", ["coleta especial","reciclagem","compostagem","aterro sanitário"], 0, "Pilhas precisam de coleta especial."],
      ["Qual destas opções combina com coleta especial?", ["pilha usada","papel limpo","resto de comida","lixo misturado"], 0, "Pilhas precisam de coleta especial."],
      ["Para onde o pilha usada deve ir?", ["coleta especial","reciclagem","compostagem","aterro sanitário"], 0, "Pilhas precisam de coleta especial."],
      ["O que fazemos com o pilha usada?", ["ter destino especial","ser reciclado","virar adubo","ser levado ao aterro"], 0, "Pilhas precisam de coleta especial."],
      ["Por que o pilha usada precisa de cuidado no descarte?", ["cuida de material perigoso","transforma material usado em novo produto","vira adubo","recebe resíduos com controle"], 0, "Pilhas precisam de coleta especial."],
      ["O lixo misturado é um exemplo de aterro sanitário?", ["aterro sanitário","reciclagem","compostagem","coleta especial"], 0, "O aterro sanitário recebe resíduos com cuidado ambiental."],
      ["Qual destas opções combina com aterro sanitário?", ["lixo misturado","papel limpo","resto de comida","pilha usada"], 0, "O aterro sanitário recebe resíduos com cuidado ambiental."],
      ["Para onde o lixo misturado deve ir?", ["aterro sanitário","reciclagem","compostagem","coleta especial"], 0, "O aterro sanitário recebe resíduos com cuidado ambiental."],
      ["O que fazemos com o lixo misturado?", ["ser levado ao aterro","ser reciclado","virar adubo","ter destino especial"], 0, "O aterro sanitário recebe resíduos com cuidado ambiental."],
      ["Por que o lixo misturado precisa de cuidado no descarte?", ["recebe resíduos com controle","transforma material usado em novo produto","vira adubo","cuida de material perigoso"], 0, "O aterro sanitário recebe resíduos com cuidado ambiental."],
      ["O papelão limpo é um exemplo de coleta seletiva?", ["coleta seletiva","reciclagem","compostagem","coleta especial"], 0, "A coleta seletiva separa os resíduos por material."],
      ["Qual destas opções combina com coleta seletiva?", ["papelão limpo","papel limpo","resto de comida","pilha usada"], 0, "A coleta seletiva separa os resíduos por material."],
      ["Para onde o papelão limpo deve ir?", ["coleta seletiva","reciclagem","compostagem","coleta especial"], 0, "A coleta seletiva separa os resíduos por material."],
      ["O que fazemos com o papelão limpo?", ["passar pela coleta seletiva","ser reciclado","virar adubo","ter destino especial"], 0, "A coleta seletiva separa os resíduos por material."],
      ["Por que o papelão limpo precisa de cuidado no descarte?", ["separa os materiais por tipo","transforma material usado em novo produto","vira adubo","cuida de material perigoso"], 0, "A coleta seletiva separa os resíduos por material."]
    ]));
    geographyQuestions.push(...buildQuestions("geografia", "sustentabilidade", "Sustentabilidade", "geo_sus", [
      ["O economizar água é um exemplo de uma atitude sustentável?", ["uma atitude sustentável","economizar água","economizar energia","reutilizar"], 0, "Poupar água ajuda o planeta e as próximas gerações."],
      ["Qual destas opções combina com uma atitude sustentável?", ["economizar água","desligar a luz","reutilizar potes","plantar árvores"], 0, "Poupar água ajuda o planeta e as próximas gerações."],
      ["Para onde o economizar água deve ir?", ["usar menos água","desligar a luz","reaproveitar potes","cuidar das plantas"], 0, "Poupar água ajuda o planeta e as próximas gerações."],
      ["O que fazemos com o economizar água?", ["ser sustentável","ajudar o planeta","evitar desperdício","cuidar da natureza"], 0, "Poupar água ajuda o planeta e as próximas gerações."],
      ["Por que o economizar água precisa de cuidado no descarte?", ["preserva recursos para o futuro","diminui o gasto de energia","evita desperdício","melhora o ambiente"], 0, "Poupar água ajuda o planeta e as próximas gerações."],
      ["O desligar a luz é um exemplo de uma atitude sustentável?", ["uma atitude sustentável","economizar água","economizar energia","reutilizar"], 0, "Economizar energia é parte da sustentabilidade."],
      ["Qual destas opções combina com uma atitude sustentável?", ["desligar a luz","economizar água","reutilizar potes","plantar árvores"], 0, "Economizar energia é parte da sustentabilidade."],
      ["Para onde o desligar a luz deve ir?", ["desligar a luz","usar menos água","reaproveitar potes","cuidar das plantas"], 0, "Economizar energia é parte da sustentabilidade."],
      ["O que fazemos com o desligar a luz?", ["evitar desperdício","ser sustentável","ajudar o planeta","cuidar da natureza"], 0, "Economizar energia é parte da sustentabilidade."],
      ["Por que o desligar a luz precisa de cuidado no descarte?", ["diminui o gasto de energia","preserva recursos para o futuro","evita desperdício","melhora o ambiente"], 0, "Economizar energia é parte da sustentabilidade."],
      ["O reutilizar potes é um exemplo de uma atitude sustentável?", ["uma atitude sustentável","economizar água","economizar energia","reutilizar"], 0, "Reutilizar reduz o descarte de materiais."],
      ["Qual destas opções combina com uma atitude sustentável?", ["reutilizar potes","economizar água","desligar a luz","plantar árvores"], 0, "Reutilizar reduz o descarte de materiais."],
      ["Para onde o reutilizar potes deve ir?", ["reaproveitar potes","usar menos água","desligar a luz","cuidar das plantas"], 0, "Reutilizar reduz o descarte de materiais."],
      ["O que fazemos com o reutilizar potes?", ["ajudar o planeta","ser sustentável","evitar desperdício","cuidar da natureza"], 0, "Reutilizar reduz o descarte de materiais."],
      ["Por que o reutilizar potes precisa de cuidado no descarte?", ["evita desperdício","preserva recursos para o futuro","diminui o gasto de energia","melhora o ambiente"], 0, "Reutilizar reduz o descarte de materiais."],
      ["O plantar árvores é um exemplo de uma atitude sustentável?", ["uma atitude sustentável","economizar água","economizar energia","reutilizar"], 0, "As árvores ajudam o solo, o ar e os seres vivos."],
      ["Qual destas opções combina com uma atitude sustentável?", ["plantar árvores","economizar água","desligar a luz","reutilizar potes"], 0, "As árvores ajudam o solo, o ar e os seres vivos."],
      ["Para onde o plantar árvores deve ir?", ["cuidar das plantas","usar menos água","desligar a luz","reaproveitar potes"], 0, "As árvores ajudam o solo, o ar e os seres vivos."],
      ["O que fazemos com o plantar árvores?", ["cuidar da natureza","ser sustentável","ajudar o planeta","evitar desperdício"], 0, "As árvores ajudam o solo, o ar e os seres vivos."],
      ["Por que o plantar árvores precisa de cuidado no descarte?", ["melhora o ambiente","preserva recursos para o futuro","diminui o gasto de energia","evita desperdício"], 0, "As árvores ajudam o solo, o ar e os seres vivos."],
      ["O usar transporte coletivo é um exemplo de uma atitude sustentável?", ["uma atitude sustentável","economizar água","economizar energia","reutilizar"], 0, "Usar ônibus ou van pode diminuir a poluição."],
      ["Qual destas opções combina com uma atitude sustentável?", ["usar transporte coletivo","economizar água","desligar a luz","reutilizar potes"], 0, "Usar ônibus ou van pode diminuir a poluição."],
      ["Para onde o usar transporte coletivo deve ir?", ["reduzir carros","usar menos água","desligar a luz","reaproveitar potes"], 0, "Usar ônibus ou van pode diminuir a poluição."],
      ["O que fazemos com o usar transporte coletivo?", ["pensar no futuro","ser sustentável","ajudar o planeta","evitar desperdício"], 0, "Usar ônibus ou van pode diminuir a poluição."],
      ["Por que o usar transporte coletivo precisa de cuidado no descarte?", ["reduz a poluição","preserva recursos para o futuro","diminui o gasto de energia","evita desperdício"], 0, "Usar ônibus ou van pode diminuir a poluição."]
    ]));
    geographyQuestions.push(...buildQuestions("geografia", "cinco_rs", "A prática dos 5 Rs", "geo_5r", [
      ["O repensar é um exemplo de um dos 5 Rs?", ["um dos 5 Rs","repensar","recusar","reduzir"], 0, "Repensar é pensar antes de comprar ou jogar fora."],
      ["Qual destas opções combina com um dos 5 Rs?", ["repensar","recusar","reduzir","reutilizar"], 0, "Repensar é pensar antes de comprar ou jogar fora."],
      ["Para onde o repensar deve ir?", ["pensar antes","não aceitar","usar menos","usar de novo"], 0, "Repensar é pensar antes de comprar ou jogar fora."],
      ["O que fazemos com o repensar?", ["repensar o consumo","recusar o que não precisa","reduzir o uso","reutilizar objetos"], 0, "Repensar é pensar antes de comprar ou jogar fora."],
      ["Por que o repensar precisa de cuidado no descarte?", ["ajuda a evitar desperdício","evita excesso","diminui o consumo","dá nova função ao objeto"], 0, "Repensar é pensar antes de comprar ou jogar fora."],
      ["O recusar é um exemplo de um dos 5 Rs?", ["um dos 5 Rs","repensar","recusar","reduzir"], 0, "Recusar é não pegar o que não será usado."],
      ["Qual destas opções combina com um dos 5 Rs?", ["recusar","repensar","reduzir","reutilizar"], 0, "Recusar é não pegar o que não será usado."],
      ["Para onde o recusar deve ir?", ["não aceitar","pensar antes","usar menos","usar de novo"], 0, "Recusar é não pegar o que não será usado."],
      ["O que fazemos com o recusar?", ["recusar o que não precisa","repensar o consumo","reduzir o uso","reutilizar objetos"], 0, "Recusar é não pegar o que não será usado."],
      ["Por que o recusar precisa de cuidado no descarte?", ["evita excesso","ajuda a evitar desperdício","diminui o consumo","dá nova função ao objeto"], 0, "Recusar é não pegar o que não será usado."],
      ["O reduzir é um exemplo de um dos 5 Rs?", ["um dos 5 Rs","repensar","recusar","reduzir"], 0, "Reduzir é usar menos e desperdiçar menos."],
      ["Qual destas opções combina com um dos 5 Rs?", ["reduzir","repensar","recusar","reutilizar"], 0, "Reduzir é usar menos e desperdiçar menos."],
      ["Para onde o reduzir deve ir?", ["usar menos","pensar antes","não aceitar","usar de novo"], 0, "Reduzir é usar menos e desperdiçar menos."],
      ["O que fazemos com o reduzir?", ["reduzir o uso","repensar o consumo","recusar o que não precisa","reutilizar objetos"], 0, "Reduzir é usar menos e desperdiçar menos."],
      ["Por que o reduzir precisa de cuidado no descarte?", ["diminui o consumo","ajuda a evitar desperdício","evita excesso","dá nova função ao objeto"], 0, "Reduzir é usar menos e desperdiçar menos."],
      ["O reutilizar é um exemplo de um dos 5 Rs?", ["um dos 5 Rs","repensar","recusar","reduzir"], 0, "Reutilizar é aproveitar o que ainda serve."],
      ["Qual destas opções combina com um dos 5 Rs?", ["reutilizar","repensar","recusar","reduzir"], 0, "Reutilizar é aproveitar o que ainda serve."],
      ["Para onde o reutilizar deve ir?", ["usar de novo","pensar antes","não aceitar","usar menos"], 0, "Reutilizar é aproveitar o que ainda serve."],
      ["O que fazemos com o reutilizar?", ["reutilizar objetos","repensar o consumo","recusar o que não precisa","reduzir o uso"], 0, "Reutilizar é aproveitar o que ainda serve."],
      ["Por que o reutilizar precisa de cuidado no descarte?", ["dá nova função ao objeto","ajuda a evitar desperdício","evita excesso","diminui o consumo"], 0, "Reutilizar é aproveitar o que ainda serve."],
      ["O reciclar é um exemplo de um dos 5 Rs?", ["um dos 5 Rs","repensar","recusar","reduzir"], 0, "Reciclar transforma um material usado em outro produto."],
      ["Qual destas opções combina com um dos 5 Rs?", ["reciclar","repensar","recusar","reduzir"], 0, "Reciclar transforma um material usado em outro produto."],
      ["Para onde o reciclar deve ir?", ["transformar material","pensar antes","não aceitar","usar menos"], 0, "Reciclar transforma um material usado em outro produto."],
      ["O que fazemos com o reciclar?", ["reciclar materiais","repensar o consumo","recusar o que não precisa","reduzir o uso"], 0, "Reciclar transforma um material usado em outro produto."],
      ["Por que o reciclar precisa de cuidado no descarte?", ["transforma resíduos em produtos","ajuda a evitar desperdício","evita excesso","diminui o consumo"], 0, "Reciclar transforma um material usado em outro produto."]
    ]));
    geographyQuestions.push(...buildQuestions("geografia", "atividades_adicionais_geografia", "Atividades adicionais", "geo_ad", [
      ["O separar papel é um exemplo de coleta seletiva?", ["coleta seletiva","sustentabilidade","reciclagem","compostagem"], 0, "Separar o papel ajuda na coleta seletiva."],
      ["Qual destas opções combina com coleta seletiva?", ["separar papel","economizar água","reutilizar potes","resto de comida"], 0, "Separar o papel ajuda na coleta seletiva."],
      ["Para onde o separar papel deve ir?", ["papel separado","água economizada","material reaproveitado","resto de comida"], 0, "Separar o papel ajuda na coleta seletiva."],
      ["O que fazemos com o separar papel?", ["separar os resíduos","economizar água","reutilizar materiais","fazer compostagem"], 0, "Separar o papel ajuda na coleta seletiva."],
      ["Por que o separar papel precisa de cuidado no descarte?", ["ajuda a cuidar do ambiente","evita desperdício","reduz a poluição","transforma materiais"], 0, "Separar o papel ajuda na coleta seletiva."],
      ["O economizar água é um exemplo de sustentabilidade?", ["sustentabilidade","coleta seletiva","reciclagem","compostagem"], 0, "Poupar água é uma prática sustentável."],
      ["Qual destas opções combina com sustentabilidade?", ["economizar água","separar papel","reutilizar potes","resto de comida"], 0, "Poupar água é uma prática sustentável."],
      ["Para onde o economizar água deve ir?", ["água economizada","papel separado","material reaproveitado","resto de comida"], 0, "Poupar água é uma prática sustentável."],
      ["O que fazemos com o economizar água?", ["economizar água","separar os resíduos","reutilizar materiais","fazer compostagem"], 0, "Poupar água é uma prática sustentável."],
      ["Por que o economizar água precisa de cuidado no descarte?", ["evita desperdício","ajuda a cuidar do ambiente","reduz a poluição","transforma materiais"], 0, "Poupar água é uma prática sustentável."],
      ["O reutilizar potes é um exemplo de reciclagem?", ["reciclagem","coleta seletiva","sustentabilidade","compostagem"], 0, "Reutilizar potes dá nova utilidade ao objeto."],
      ["Qual destas opções combina com reciclagem?", ["reutilizar potes","separar papel","economizar água","resto de comida"], 0, "Reutilizar potes dá nova utilidade ao objeto."],
      ["Para onde o reutilizar potes deve ir?", ["material reaproveitado","papel separado","água economizada","resto de comida"], 0, "Reutilizar potes dá nova utilidade ao objeto."],
      ["O que fazemos com o reutilizar potes?", ["reutilizar materiais","separar os resíduos","economizar água","fazer compostagem"], 0, "Reutilizar potes dá nova utilidade ao objeto."],
      ["Por que o reutilizar potes precisa de cuidado no descarte?", ["transforma materiais","ajuda a cuidar do ambiente","evita desperdício","reduz a poluição"], 0, "Reutilizar potes dá nova utilidade ao objeto."],
      ["O resto de comida é um exemplo de compostagem?", ["compostagem","coleta seletiva","sustentabilidade","reciclagem"], 0, "Restos de comida podem virar adubo."],
      ["Qual destas opções combina com compostagem?", ["resto de comida","separar papel","economizar água","reutilizar potes"], 0, "Restos de comida podem virar adubo."],
      ["Para onde o resto de comida deve ir?", ["resto de comida","papel separado","água economizada","material reaproveitado"], 0, "Restos de comida podem virar adubo."],
      ["O que fazemos com o resto de comida?", ["fazer compostagem","separar os resíduos","economizar água","reutilizar materiais"], 0, "Restos de comida podem virar adubo."],
      ["Por que o resto de comida precisa de cuidado no descarte?", ["reduz a poluição","ajuda a cuidar do ambiente","evita desperdício","transforma materiais"], 0, "Restos de comida podem virar adubo."],
      ["O pensar antes de comprar é um exemplo de 5 Rs?", ["5 Rs","coleta seletiva","sustentabilidade","reciclagem"], 0, "Pensar antes de comprar ajuda a consumir com cuidado."],
      ["Qual destas opções combina com 5 Rs?", ["pensar antes de comprar","separar papel","economizar água","reutilizar potes"], 0, "Pensar antes de comprar ajuda a consumir com cuidado."],
      ["Para onde o pensar antes de comprar deve ir?", ["consumo consciente","papel separado","água economizada","material reaproveitado"], 0, "Pensar antes de comprar ajuda a consumir com cuidado."],
      ["O que fazemos com o pensar antes de comprar?", ["pensar no consumo","separar os resíduos","economizar água","reutilizar materiais"], 0, "Pensar antes de comprar ajuda a consumir com cuidado."],
      ["Por que o pensar antes de comprar precisa de cuidado no descarte?", ["melhora a cidade","ajuda a cuidar do ambiente","evita desperdício","reduz a poluição"], 0, "Pensar antes de comprar ajuda a consumir com cuidado."]
    ]));

questions.push(...geographyQuestions);

  // ─── HISTÓRIA ─────────────────────────────────────────────────────────────
  const historyQuestions = [
    ...buildQuestions("historia", "monumentos_historicos", "Monumentos Históricos", "his_mh", [
      ["O que é um monumento histórico?", ["Uma construção ou obra que guarda memória importante", "Um tipo de brinquedo antigo", "Uma placa de sinalização de trânsito", "Uma loja muito grande"], 0, "Monumentos históricos são obras que preservam a memória de fatos, pessoas ou períodos importantes."],
      ["Por que as cidades preservam monumentos históricos?", ["Para lembrar a história e a cultura do lugar", "Para decorar apenas as janelas", "Porque não sabem o que fazer com eles", "Para esconder as ruas"], 0, "Preservar monumentos ajuda a guardar a memória coletiva e a identidade de um lugar."],
      ["O Cristo Redentor, no Rio de Janeiro, é um exemplo de:", ["monumento histórico e símbolo do Brasil", "ponte sobre um rio", "tipo de veículo antigo", "escola de música"], 0, "O Cristo Redentor é um dos monumentos mais famosos do Brasil e do mundo."],
      ["Quando visitamos um monumento histórico, podemos aprender sobre:", ["a história do lugar e de seu povo", "somente receitas de cozinha", "apenas esportes aquáticos", "somente animais marinhos"], 0, "Os monumentos contam histórias sobre o passado de um lugar e de seu povo."],
      ["O que é uma estátua histórica?", ["Uma escultura feita para homenagear uma pessoa ou fato importante", "Uma máquina de lavar roupa", "Um tipo de veículo", "Uma ferramenta de jardinagem"], 0, "Estátuas históricas são esculturas que homenageiam pessoas ou eventos relevantes para a história."],
      ["Uma praça com uma estátua de um personagem histórico mostra:", ["homenagem a alguém importante para a cidade ou país", "que a praça é um estacionamento", "que a escultura serve só de enfeite", "que ninguém usa aquela praça"], 0, "Estátuas em praças geralmente homenageiam figuras que foram importantes para a história local."],
      ["Por que é importante cuidar dos monumentos históricos?", ["Para que as próximas gerações também possam conhecer a história", "Porque são caros de substituir por outros enfeites", "Para que funcionem como sinais de trânsito", "Porque são feitos de borracha"], 0, "Cuidar dos monumentos garante que a história seja transmitida às futuras gerações."],
      ["O Pelourinho, em Salvador, é considerado um patrimônio histórico porque:", ["preserva a arquitetura e a memória do período colonial", "é um tipo de parque de diversões", "foi construído ontem", "não tem nenhuma história"], 0, "O Pelourinho guarda construções e memórias do Brasil colonial."],
      ["Um museu pode guardar:", ["objetos históricos que contam sobre o passado", "somente brinquedos novos", "apenas alimentos frescos", "somente carros modernos"], 0, "Museus guardam objetos, documentos e obras que ajudam a conhecer o passado."],
      ["As ruínas de uma construção antiga podem ser preservadas para:", ["mostrar como eram as construções no passado", "servir apenas como estacionamento", "esconder lixo", "construir shoppings em cima sem critério"], 0, "Ruínas são preservadas porque contam como viviam as pessoas em outras épocas."],
      ["Monumento pode ser feito de:", ["pedra, bronze, madeira e outros materiais duráveis", "somente gelo e sabão", "apenas papel higiênico", "somente tinta de caneta"], 0, "Monumentos são construídos com materiais resistentes para durar muitos anos."],
      ["Ouro Preto, em Minas Gerais, ficou famosa na história do Brasil pelo:", ["ciclo do ouro e sua arquitetura histórica", "cultivo de tomates", "turismo espacial", "fabricação de celulares"], 0, "Ouro Preto foi um importante centro durante o período colonial, especialmente no ciclo do ouro."],
      ["Uma placa em uma parede indicando que um prédio é tombado significa:", ["que ele é protegido como patrimônio histórico", "que ele vai ser demolido hoje", "que é proibido entrar nele para sempre", "que pertence a uma fábrica"], 0, "Um imóvel tombado é legalmente protegido para preservar seu valor histórico e cultural."],
      ["Quando o governo cuida de um monumento, ele está fazendo:", ["preservação do patrimônio histórico", "propaganda comercial", "demolição planejada", "reforma desnecessária"], 0, "Preservar patrimônios históricos é uma responsabilidade do governo e da sociedade."],
      ["Monumentos históricos ajudam crianças a:", ["aprender sobre o passado de forma concreta", "brincar de videogame", "aprender matemática avançada", "praticar natação"], 0, "Ver monumentos de perto torna o aprendizado sobre o passado mais real e interessante."],
      ["O Teatro Amazonas, em Manaus, é um exemplo de monumento que conta sobre:", ["a riqueza do período da borracha na Amazônia", "a história do xadrez", "como se faz pão", "a chegada do metrô"], 0, "O Teatro Amazonas foi construído durante o ciclo da borracha e representa essa época da história."],
      ["Monumentos podem estar em:", ["cidades, parques, praças e outros espaços públicos", "somente dentro de casas fechadas", "apenas no fundo do mar", "somente no espaço sideral"], 0, "Monumentos históricos estão em espaços públicos para que todos possam ver e aprender."],
      ["Uma escultura que representa um herói da Independência do Brasil ajuda as pessoas a:", ["lembrar da luta pela liberdade do país", "aprender a cozinhar", "jogar futebol melhor", "aprender inglês"], 0, "Esculturas de heróis históricos mantêm viva a memória de quem lutou pela história do país."],
      ["O que significa dizer que um lugar tem valor histórico?", ["Que ele guarda memórias e faz parte da história do povo", "Que ele é muito caro para comprar", "Que é proibido entrar", "Que ele foi construído hoje"], 0, "Valor histórico significa que o lugar tem importância para a memória e identidade de um povo."],
      ["Uma fortaleza antiga às margens do mar pode contar sobre:", ["a defesa do território em outros tempos", "festas de aniversário", "como plantar flores", "como funciona um elevador"], 0, "Fortalezas foram construídas para defender territórios e contam sobre conflitos e estratégias do passado."],
      ["Quando destruímos um monumento histórico, perdemos:", ["parte da memória e identidade coletiva", "apenas uma decoração qualquer", "somente uma pedra velha", "espaço para estacionar carros"], 0, "A destruição de monumentos apaga parte da história e da identidade de um povo."],
      ["O que é um patrimônio tombado?", ["Um bem protegido legalmente para preservar sua importância histórica", "Um patrimônio que caiu no chão", "Uma loja antiga sem importância", "Uma obra que vai ser demolida"], 0, "Tombar um bem significa reconhecer e proteger legalmente sua importância histórica ou cultural."],
      ["Monumentos históricos podem ser visitados por turistas porque:", ["ajudam a conhecer a história e a cultura do lugar", "são ótimos para praticar escalada", "servem somente para shows de música", "não têm nada de especial"], 0, "Turistas visitam monumentos históricos para aprender sobre a história e a cultura local."],
      ["Uma árvore plantada por uma pessoa famosa no passado pode se tornar:", ["parte da memória histórica de um lugar", "apenas uma sombra comum", "um tipo de veículo", "uma máquina elétrica"], 0, "Objetos e locais ligados a pessoas históricas ganham valor como parte da memória coletiva."],
      ["Por que escolas fazem visitas a monumentos históricos?", ["Para que os alunos aprendam de forma direta sobre a história", "Porque os museus são mais baratos que livrarias", "Para que os alunos descansem das aulas", "Porque os professores querem passear"], 0, "Visitas a monumentos tornam o aprendizado histórico concreto e significativo."]
    ]),
    ...buildQuestions("historia", "ruas_memorias", "As Ruas: Espaços e Memórias", "his_rm", [
      ["As ruas de uma cidade guardam:", ["memórias, histórias e a vida das pessoas ao longo do tempo", "somente asfalto e calçadas novas", "apenas carros e motos", "somente semáforos"], 0, "As ruas são espaços de convivência e carregam a memória de gerações."],
      ["Por que muitas ruas têm o nome de pessoas famosas?", ["Para homenagear quem foi importante para a história do lugar", "Porque é mais fácil dar nomes de pessoas", "Para confundir os moradores", "Porque as ruas escolhem os próprios nomes"], 0, "Nomear ruas com nomes de figuras históricas é uma forma de homenagear e lembrar essas pessoas."],
      ["Uma rua antiga com paralelepípedos pode contar sobre:", ["como era a cidade em outros tempos", "somente o futuro da cidade", "apenas o número de carros", "somente a velocidade do vento"], 0, "O tipo de pavimentação antiga revela como a cidade era em épocas passadas."],
      ["Quando caminhamos por um bairro antigo, podemos perceber:", ["marcas do tempo nas construções e nos espaços", "que tudo é idêntico a um bairro novo", "que as ruas não têm história", "que não há nada para observar"], 0, "Bairros antigos guardam na arquitetura e nos espaços as marcas de diferentes períodos históricos."],
      ["Uma praça no centro de uma cidade costuma ser:", ["um espaço de encontro, memória e história", "apenas um estacionamento", "um local onde só passam carros", "um lugar sem importância"], 0, "Praças centrais costumam ser pontos de convivência com importância histórica e cultural."],
      ["Fotografias antigas de uma rua ajudam a:", ["comparar como o lugar era antes e como está hoje", "aprender a dirigir", "escolher a cor da casa", "saber a previsão do tempo"], 0, "Fotos antigas permitem comparar transformações nos espaços ao longo do tempo."],
      ["O que é memória afetiva de um lugar?", ["A ligação emocional que as pessoas têm com um espaço ou lugar", "Uma máquina que guarda memórias", "Uma placa de trânsito especial", "Um tipo de construção nova"], 0, "Memória afetiva é a relação emocional que sentimos com lugares que fazem parte da nossa vida."],
      ["Quando moradores antigos contam histórias sobre uma rua, eles estão:", ["preservando a memória e a história do lugar", "inventando histórias sem importância", "apenas reclamando do bairro", "ensinando como consertar carros"], 0, "Os relatos de moradores antigos são fontes históricas importantes para conhecer a história local."],
      ["Uma escola pública que funciona há muitos anos pode ser considerada:", ["parte da memória e história da comunidade", "apenas um prédio qualquer", "uma construção sem importância", "algo que deve ser demolido"], 0, "Espaços como escolas antigas fazem parte da história e da memória das comunidades."],
      ["Ruas, praças e parques fazem parte do chamado espaço:", ["público", "privado", "secreto", "subterrâneo"], 0, "Ruas, praças e parques são espaços públicos, de uso de todos."],
      ["Por que é importante conhecer a história do bairro onde moramos?", ["Para entender de onde viemos e valorizar o lugar", "Porque é obrigatório pela lei", "Para saber o preço dos imóveis", "Para mudar de bairro mais rápido"], 0, "Conhecer a história do bairro fortalece a identidade e o sentimento de pertencimento."],
      ["Um chafariz antigo em uma praça pode contar que:", ["antigamente a população buscava água ali", "sempre existiram encanamentos modernos", "o lugar nunca teve pessoas vivendo", "a praça foi construída ontem"], 0, "Chafarizes antigos mostram como as pessoas obtinham água antes da modernização do saneamento."],
      ["O que significa dizer que uma rua tem 'história'?", ["Que ela tem relação com fatos e pessoas do passado", "Que ela é comprida demais", "Que ela sempre esteve asfaltada", "Que ela tem muitos semáforos"], 0, "Uma rua tem história quando está ligada a eventos, pessoas ou transformações importantes do passado."],
      ["Muros com pinturas artísticas em uma rua podem mostrar:", ["a cultura e as mensagens da comunidade", "apenas erros de pintura", "que o muro está quebrado", "que a rua é privada"], 0, "Pinturas em muros chamadas de grafite ou arte urbana expressam a cultura e a voz da comunidade."],
      ["Uma igrejinha antiga no centro do bairro provavelmente indica:", ["que o bairro tem uma longa história", "que o bairro foi fundado ontem", "que é proibido circular nas ruas ao redor", "que o bairro não tem moradores"], 0, "Construções religiosas antigas são marcos da história e do surgimento de comunidades."],
      ["Quando reformamos uma rua preservando seu calçamento histórico, estamos:", ["respeitando a memória e a história do lugar", "destruindo a cidade", "cometendo um erro de planejamento", "impedindo o progresso"], 0, "Preservar elementos históricos durante reformas é uma forma de respeitar a memória do lugar."],
      ["O que é um bairro histórico?", ["Uma área da cidade que guarda construções e memórias do passado", "Um bairro criado recentemente", "Uma área sem moradores", "Um lugar onde só moram idosos"], 0, "Bairros históricos concentram construções e memórias de diferentes períodos da história da cidade."],
      ["Mapas antigos de uma cidade ajudam a perceber:", ["como o espaço foi mudando ao longo do tempo", "somente a posição das escolas atuais", "apenas onde ficam os shoppings", "somente o trajeto do ônibus"], 0, "Mapas históricos permitem ver a evolução dos espaços urbanos ao longo do tempo."],
      ["Por que algumas cidades têm ruas muito antigas com pedras irregulares?", ["Porque essas ruas foram construídas em épocas em que o asfalto não existia", "Porque as pedras são mais baratas hoje", "Porque as pessoas não gostam de asfalto", "Porque as pedras crescem naturalmente"], 0, "Ruas de pedra são vestígios de épocas anteriores ao uso do asfalto e contam sobre a história urbana."],
      ["Uma rua com o nome de uma data histórica, como 7 de Setembro, lembra:", ["um fato importante da história do Brasil", "o dia do fundador da cidade sempre", "somente o calendário escolar", "apenas o dia do aniversário do prefeito"], 0, "Ruas com nomes de datas históricas homenageiam eventos importantes para a história nacional."],
      ["Quando vizinhos se reúnem para cuidar de uma praça, eles estão:", ["valorizando o espaço público e a memória coletiva", "apenas limpando para evitar multas", "agindo contra as regras da cidade", "tomando conta de uma propriedade privada"], 0, "Cuidar dos espaços públicos é um ato de cidadania e valorização da memória coletiva."],
      ["Uma rua muito movimentada no passado que hoje está quieta pode mostrar:", ["que o uso e a história dos espaços mudam com o tempo", "que a rua nunca foi importante", "que sempre foi assim", "que a cidade não cresce"], 0, "A transformação das ruas ao longo do tempo reflete as mudanças na vida e no uso da cidade."],
      ["Por que as pessoas costumam ter saudade de lugares onde cresceram?", ["Porque esses lugares guardam memórias e experiências de vida", "Porque são obrigadas a sentir saudade", "Porque os lugares são sempre melhores no passado", "Porque todas as pessoas gostam de ruas"], 0, "Os lugares que fazemos parte deixam marcas afetivas que geram memória e saudade."],
      ["Uma feira popular que acontece na mesma rua há muitos anos é parte da:", ["memória e da cultura do bairro", "história do trânsito apenas", "administração do orçamento público", "programação de televisão"], 0, "Feiras e eventos recorrentes em um espaço fazem parte da memória e identidade cultural do lugar."],
      ["O que podemos aprender observando as diferentes construções de uma rua?", ["Como o bairro mudou e cresceu ao longo do tempo", "Somente a cor preferida dos moradores", "Apenas o número de andares das casas", "Somente quanto custaram as obras"], 0, "Observar construções de diferentes épocas em uma mesma rua revela a história e o crescimento do lugar."]
    ]),
    ...buildQuestions("historia", "o_que_e_cultura", "O que é Cultura", "his_oc", [
      ["O que é cultura?", ["O conjunto de costumes, valores, ideias e criações de um grupo de pessoas", "Apenas livros e museus", "Somente a língua falada", "Apenas roupas e comidas"], 0, "Cultura é tudo o que um grupo humano cria, valoriza e transmite, incluindo costumes, arte, língua e muito mais."],
      ["A comida típica de uma região faz parte da:", ["cultura daquele lugar", "matemática local", "lei de trânsito", "ciência do solo"], 0, "A culinária típica é uma das expressões mais ricas da cultura de um povo."],
      ["Quando aprendemos a língua portuguesa, estamos participando de uma:", ["herança cultural", "competição esportiva", "prova de matemática", "atividade física"], 0, "A língua é um dos principais elementos da cultura, transmitida de geração em geração."],
      ["Dançar forró, samba ou funk é uma forma de expressar:", ["a cultura do povo brasileiro", "somente aptidão esportiva", "apenas habilidades matemáticas", "somente regras de gramática"], 0, "A dança é uma expressão cultural que reflete os costumes e sentimentos de um povo."],
      ["A cultura de um povo pode ser transmitida:", ["pela família, pela escola, pelas festas e pela arte", "somente por livros científicos", "apenas por leis do governo", "somente por máquinas"], 0, "A transmissão cultural acontece de muitas formas: pela convivência, pela arte, pela escola e pela família."],
      ["Quando avós contam histórias para os netos, estão:", ["transmitindo a cultura e a memória da família", "perdendo tempo", "ensinando matemática avançada", "treinando para concursos"], 0, "Contar histórias é uma das formas mais antigas de transmitir cultura e memória."],
      ["A arte, a música e a literatura fazem parte da:", ["cultura de um povo", "ciência exata", "educação física", "engenharia civil"], 0, "Arte, música e literatura são expressões culturais que refletem os valores e sentimentos de um povo."],
      ["Diferentes países têm culturas diferentes porque:", ["cada povo tem sua própria história, costumes e formas de viver", "todos os países têm leis iguais", "a natureza de todos os lugares é idêntica", "todos falam a mesma língua"], 0, "A diversidade cultural existe porque cada povo desenvolveu sua própria história e modo de vida."],
      ["Uma festa popular como a Festa Junina é um exemplo de:", ["expressão cultural brasileira", "competição científica", "prova de ciências", "atividade de educação física"], 0, "A Festa Junina é uma tradição cultural que mistura elementos europeus e brasileiros."],
      ["Quando brincamos de amarelinha ou pião, estamos praticando:", ["uma tradição cultural", "apenas um exercício físico obrigatório", "uma competição olímpica", "uma atividade científica"], 0, "Brincadeiras tradicionais fazem parte do patrimônio cultural de um povo."],
      ["O que significa respeitar a cultura do outro?", ["Aceitar que cada povo tem seu modo próprio de viver e criar", "Achar que todas as culturas são iguais", "Impor os próprios costumes aos outros", "Ignorar as diferenças culturais"], 0, "Respeitar a cultura do outro significa reconhecer o valor e a legitimidade de modos de vida diferentes."],
      ["A culinária, a música, a dança e a língua são exemplos de elementos da:", ["cultura", "tecnologia industrial", "ciência espacial", "engenharia de pontes"], 0, "Culinária, música, dança e língua são expressões centrais da cultura de qualquer povo."],
      ["Cultura popular são as criações e costumes que:", ["surgem e são valorizados pelo povo em seu cotidiano", "vêm somente das universidades", "são feitas apenas por reis e nobres", "são importadas de outros países"], 0, "Cultura popular é aquela criada e transmitida pelo povo em seu dia a dia."],
      ["Quando aprendemos com pessoas mais velhas da família, estamos:", ["recebendo uma herança cultural", "praticando educação física", "fazendo atividade científica", "apenas ouvindo histórias sem valor"], 0, "Aprender com os mais velhos é receber a herança cultural acumulada ao longo do tempo."],
      ["A forma como as pessoas se vestem pode refletir:", ["sua cultura, religião e modo de vida", "apenas o clima do lugar", "somente o preço das roupas", "apenas o gosto pessoal sem nenhuma relação cultural"], 0, "O vestuário está relacionado à cultura, identidade, religião e contexto histórico de um povo."],
      ["Quando artistas criam pinturas, músicas ou esculturas, estão:", ["contribuindo para a cultura do seu povo", "apenas fazendo um passatempo", "treinando para competições esportivas", "cumprindo uma obrigação de trânsito"], 0, "A arte é uma das formas mais ricas de expressão e construção da cultura."],
      ["Uma criança que aprende a tocar viola caipira está aprendendo:", ["uma tradição cultural brasileira", "apenas um instrumento sem história", "uma técnica de informática", "somente um esporte"], 0, "A viola caipira é um instrumento ligado à cultura rural brasileira, com raízes históricas profundas."],
      ["Cultura pode ser vivida nas:", ["festas, brincadeiras, músicas, comidas, histórias e muitas outras coisas", "apenas escolas particulares", "somente nas grandes cidades", "apenas durante as férias"], 0, "A cultura está presente em todos os momentos da vida cotidiana."],
      ["O carnaval é uma festa que representa a cultura brasileira porque:", ["mistura ritmos, danças, fantasias e tradições de várias origens", "é obrigatório em todos os países", "só ocorre no Rio de Janeiro", "foi criado há cinco anos"], 0, "O carnaval reúne múltiplas influências e expressões culturais que caracterizam o Brasil."],
      ["Quando crianças aprendem a fazer artesanato local, estão:", ["preservando uma tradição cultural", "perdendo tempo de estudo", "praticando somente habilidades manuais sem valor cultural", "copiando culturas de outros países"], 0, "O artesanato tradicional é uma expressão cultural que deve ser preservada e transmitida."],
      ["O que é diversidade cultural?", ["A riqueza que vem de diferentes culturas, costumes e tradições convivendo", "Quando todos têm a mesma cultura", "A ausência de diferenças entre os povos", "Quando um povo proíbe outras culturas"], 0, "Diversidade cultural é a convivência de diferentes culturas, que enriquece a sociedade."],
      ["Uma cidade que tem festas, museus, teatros e mercados populares mostra:", ["uma vida cultural rica e diversa", "que não precisa de escolas", "que as pessoas não têm o que fazer", "que só existem atividades culturais pagas"], 0, "A variedade de atividades culturais é sinal de uma comunidade rica e diversa culturalmente."],
      ["Quando um grupo preserva suas danças e músicas tradicionais, está:", ["mantendo viva sua identidade cultural", "perdendo tempo com coisas sem valor", "imitando outros grupos", "descumprindo as leis"], 0, "Preservar danças e músicas tradicionais é uma forma de manter a identidade cultural."],
      ["Cultura não é somente o que vemos nos museus, mas também:", ["o modo de viver, de falar, de comer e de se relacionar no dia a dia", "apenas obras de arte muito caras", "somente coisas de outros países", "apenas o que está escrito em livros"], 0, "Cultura está presente em todos os aspectos da vida cotidiana, não apenas nas instituições formais."],
      ["Por que é importante conhecer diferentes culturas?", ["Para aprender, respeitar e enriquecer nossa visão de mundo", "Para copiar todos os costumes estrangeiros", "Para criticar quem é diferente", "Porque é obrigatório por lei"], 0, "Conhecer outras culturas amplia nossa compreensão do mundo e estimula o respeito à diversidade."]
    ]),
    ...buildQuestions("historia", "patrimonios_culturais", "Patrimônios Culturais", "his_pc", [
      ["O que é um patrimônio cultural?", ["Um bem material ou imaterial de valor para a história e cultura de um povo", "Uma loja com muitos produtos", "Um tipo de carro antigo", "Apenas dinheiro guardado no banco"], 0, "Patrimônio cultural é tudo aquilo que tem valor para a identidade, memória e história de um grupo."],
      ["Patrimônios culturais podem ser:", ["materiais, como prédios, ou imateriais, como músicas e festas", "somente dinheiro e joias", "apenas veículos antigos", "somente máquinas industriais"], 0, "Patrimônios culturais incluem tanto bens físicos (prédios, objetos) quanto imateriais (saberes, tradições)."],
      ["Qual órgão no Brasil cuida do patrimônio histórico e artístico nacional?", ["IPHAN - Instituto do Patrimônio Histórico e Artístico Nacional", "DETRAN", "IBGE", "Anatel"], 0, "O IPHAN é responsável por identificar, documentar e preservar o patrimônio cultural brasileiro."],
      ["A cidade de Ouro Preto, em Minas Gerais, é Patrimônio Mundial da UNESCO porque:", ["preserva a arquitetura e a memória do Brasil colonial e do período do ouro", "foi construída no século XXI", "não tem nenhuma construção antiga", "ficou famosa por causa do futebol"], 0, "Ouro Preto é reconhecida mundialmente por sua arquitetura barroca e seu valor histórico do período colonial."],
      ["O que é a UNESCO?", ["Uma organização da ONU que protege o patrimônio cultural e natural do mundo", "Uma escola de futebol", "Uma empresa de informática", "Um banco internacional"], 0, "A UNESCO é a agência da ONU responsável por educação, ciência, cultura e comunicação, incluindo a proteção do patrimônio mundial."],
      ["O Frevo, dança típica do Recife e de Olinda, é considerado patrimônio cultural porque:", ["representa uma tradição artística e cultural única do povo brasileiro", "é obrigatório em todas as escolas", "foi inventado há dois anos", "vem de outro país"], 0, "O Frevo foi reconhecido como Patrimônio Cultural Imaterial da Humanidade pela UNESCO."],
      ["Um patrimônio cultural imaterial pode ser:", ["uma dança, uma receita de comida, uma lenda ou uma festa tradicional", "somente um prédio tombado", "apenas um objeto de museu", "somente um documento escrito"], 0, "Patrimônio imaterial inclui saberes, práticas e expressões culturais transmitidos pela tradição oral e pela vivência."],
      ["Por que é importante preservar os patrimônios culturais?", ["Para manter a memória, a identidade e a história do povo", "Porque são muito caros", "Para que ninguém possa usar", "Para evitar que turistas visitem"], 0, "Preservar patrimônios culturais significa guardar a memória e a identidade de um povo para as futuras gerações."],
      ["O Bumba Meu Boi, festa tradicional do Maranhão, é um exemplo de:", ["patrimônio cultural imaterial brasileiro", "competição esportiva nacional", "festa criada por turistas", "evento sem ligação com a história"], 0, "O Bumba Meu Boi é uma festa folclórica tradicional com raízes indígenas, africanas e europeias."],
      ["O que acontece quando um bem é declarado Patrimônio Mundial pela UNESCO?", ["Ele recebe proteção e reconhecimento internacional", "Ele passa a pertencer a outro país", "Ele é destruído e reconstruído em outro lugar", "Ele é vendido para o maior interessado"], 0, "A declaração de Patrimônio Mundial pela UNESCO traz reconhecimento, proteção e visibilidade internacional."],
      ["A Capoeira, criada no Brasil por africanos escravizados, é um patrimônio cultural porque:", ["representa luta, dança, música e resistência do povo negro", "é um esporte olímpico antigo da Europa", "foi inventada na Asia", "não tem nenhuma história por trás"], 0, "A Capoeira é Patrimônio Cultural Imaterial da Humanidade pela UNESCO, representando a resistência e criatividade dos africanos no Brasil."],
      ["Quando visitamos um lugar tombado, devemos:", ["respeitar o espaço e não danificar nada", "pichar as paredes", "remover peças históricas", "fazer obras sem autorização"], 0, "Visitar patrimônios culturais exige respeito, pois eles pertencem a toda a sociedade."],
      ["O Pelourinho, em Salvador, é famoso por:", ["sua arquitetura colonial e sua ligação com a história afro-brasileira", "ser o maior shopping do Brasil", "ter o maior aeroporto do nordeste", "ser um bairro construído recentemente"], 0, "O Pelourinho é Patrimônio Mundial da UNESCO e guarda a memória da história colonial e afro-brasileira."],
      ["Por que as receitas de comidas típicas regionais podem ser consideradas patrimônio cultural?", ["Porque representam saberes e tradições de um povo transmitidos por gerações", "Porque são registradas em cartórios", "Porque são feitas somente por chefs famosos", "Porque aparecem em livros de ciências"], 0, "Receitas tradicionais são patrimônio imaterial pois guardam saberes culturais transmitidos de geração em geração."],
      ["Uma festa de colheita que acontece todo ano em uma comunidade pode ser considerada:", ["patrimônio cultural imaterial daquela comunidade", "apenas uma reunião de vizinhos", "um evento sem importância histórica", "somente uma obrigação religiosa"], 0, "Festas tradicionais de colheita fazem parte do patrimônio imaterial de comunidades rurais e tradicionais."],
      ["Patrimônios naturais também existem, como:", ["a Floresta Amazônica e as Cataratas do Iguaçu", "as ruas de asfalto das cidades", "os shopping centers", "os satélites artificiais"], 0, "Patrimônios naturais são áreas de grande beleza ou importância ecológica reconhecidas internacionalmente."],
      ["O artesanato de barro de Caruaru, em Pernambuco, é um exemplo de:", ["expressão cultural e patrimônio artístico popular", "produto industrial sem tradição", "importação de outro país", "atividade científica"], 0, "O artesanato de barro de Caruaru tem raízes na cultura popular nordestina e é reconhecido como patrimônio cultural."],
      ["Quando um patrimônio cultural é destruído, perdemos:", ["parte da memória e identidade do povo", "apenas um objeto velho", "somente dinheiro do governo", "somente um espaço físico"], 0, "A destruição de patrimônios apaga parte da história e da identidade cultural de um povo."],
      ["O que é o folclore?", ["O conjunto de tradições, lendas, músicas e costumes populares de um povo", "Uma disciplina científica avançada", "Um esporte radical", "Apenas histórias inventadas sem importância"], 0, "O folclore é parte do patrimônio cultural imaterial, reunindo as tradições populares transmitidas oralmente."],
      ["Uma pintura rupestre encontrada em uma caverna é um patrimônio porque:", ["mostra como viviam as pessoas muito tempo atrás", "é apenas uma mancha na pedra", "foi pintada ontem por turistas", "não tem nenhum valor histórico"], 0, "Pinturas rupestres são registros históricos de povos que viveram há milhares de anos."],
      ["O Dia do Patrimônio Cultural é comemorado para:", ["conscientizar as pessoas sobre a importância de preservar a história e a cultura", "fechar todos os museus do país", "vender objetos antigos", "demolir prédios históricos"], 0, "O Dia do Patrimônio conscientiza a sociedade sobre a importância de preservar a memória e a identidade cultural."],
      ["Museus, bibliotecas e arquivos históricos servem para:", ["guardar e transmitir a memória e o patrimônio cultural", "apenas guardar objetos velhos sem uso", "somente vender ingressos para turistas", "servir de garagem para carros"], 0, "Essas instituições são fundamentais para preservar e transmitir o patrimônio cultural às futuras gerações."],
      ["Quando uma criança aprende uma lenda indígena, ela está:", ["tendo contato com o patrimônio cultural imaterial do Brasil", "praticando apenas leitura", "aprendendo somente sobre animais", "cumprindo uma obrigação escolar sem valor cultural"], 0, "Lendas indígenas fazem parte do patrimônio cultural imaterial e transmitem a visão de mundo desses povos."],
      ["O que pode acontecer com um patrimônio cultural sem cuidado?", ["Pode se deteriorar e ser perdido para sempre", "Fica cada vez mais bonito sozinho", "Cresce com o tempo", "Não sofre nenhum dano"], 0, "Sem preservação, patrimônios culturais podem se deteriorar e desaparecer, levando consigo parte da memória histórica."],
      ["Por que a escola é um espaço importante para preservar o patrimônio cultural?", ["Porque ensina às crianças o valor da história, da arte e das tradições", "Porque é obrigada a guardar objetos antigos", "Porque substitui os museus", "Porque vende patrimônios culturais"], 0, "A escola forma cidadãos conscientes do valor do patrimônio cultural e da importância de preservá-lo."]
    ]),
    ...buildQuestions("historia", "transformacao_cultura", "Transformação da Cultura", "his_tc", [
      ["A cultura de um povo pode mudar com o tempo?", ["Sim, a cultura se transforma com novas experiências e contatos", "Não, a cultura nunca muda", "Apenas as roupas mudam, o resto fica igual", "Só muda quando o governo ordena"], 0, "A cultura é dinâmica e se transforma ao longo do tempo com novas experiências, contatos e gerações."],
      ["Quando duas culturas se encontram, o que pode acontecer?", ["Elas podem se influenciar e criar novas formas culturais", "Uma sempre destrói a outra", "Elas ficam completamente separadas para sempre", "Não acontece nada"], 0, "O contato entre culturas é chamado de troca cultural e pode gerar novas expressões e tradições."],
      ["A mistura de culturas indígena, africana e europeia formou:", ["a cultura brasileira", "a cultura japonesa", "a cultura australiana", "a cultura esquimó"], 0, "A cultura brasileira foi formada pela mistura de influências indígenas, africanas e europeias."],
      ["Quando jovens criam novas músicas baseadas em ritmos antigos, estão:", ["transformando e renovando a cultura", "destruindo a cultura", "imitando outros países", "cometendo erros musicais"], 0, "A renovação cultural acontece quando gerações mais jovens reinterpretam e transformam as tradições."],
      ["A tecnologia, como a internet, pode influenciar a cultura porque:", ["facilita o contato com outras culturas e novas formas de expressão", "apaga toda a cultura anterior", "não tem nenhum efeito sobre os costumes", "é usada somente por cientistas"], 0, "A internet facilita o contato entre culturas e acelera as transformações culturais."],
      ["Uma palavra de origem indígena usada em nossa língua mostra:", ["a influência da cultura indígena na formação da língua portuguesa do Brasil", "que estamos aprendendo um idioma estrangeiro", "que a língua não muda", "que os indígenas inventaram o português"], 0, "Muitas palavras do português brasileiro têm origem nas línguas indígenas, mostrando essa troca cultural."],
      ["O que é aculturação?", ["O processo em que um grupo adota elementos da cultura de outro grupo", "A destruição completa de uma cultura", "A criação de uma nova língua do zero", "O isolamento total de um povo"], 0, "Aculturação é quando uma cultura incorpora elementos de outra com quem tem contato."],
      ["Quando imigrantes chegam a um novo país, podem:", ["trazer sua cultura e ao mesmo tempo aprender a do novo lugar", "apagar completamente a própria cultura", "impedir que haja qualquer troca cultural", "ser proibidos de manter seus costumes"], 0, "Imigrantes contribuem para a diversidade cultural ao trazerem sua herança e ao mesmo tempo se integrarem."],
      ["A culinária brasileira tem pratos com influência africana, como:", ["acarajé, vatapá e moqueca", "sushi e temaki", "pizza e macarrão", "tacos e burritos"], 0, "O acarajé, o vatapá e a moqueca são exemplos de pratos com forte influência africana na culinária brasileira."],
      ["Quando uma festa tradicional incorpora elementos novos sem perder sua essência, ela está:", ["se transformando sem perder a identidade cultural", "sendo destruída", "sendo copiada de outro país", "perdendo seu valor histórico"], 0, "A transformação cultural que preserva a essência é uma forma de manter a tradição viva e relevante."],
      ["Por que culturas mudam com o tempo?", ["Porque as pessoas vivem novas experiências e entram em contato com outras culturas", "Porque as leis obrigam a mudar", "Porque as antigas culturas eram erradas", "Porque o clima força as mudanças"], 0, "A cultura muda porque as pessoas aprendem, viajam, se comunicam e criam novas formas de viver."],
      ["O que é globalização cultural?", ["A difusão de elementos culturais por todo o mundo por meio da comunicação e do comércio", "A criação de uma única cultura para todos os povos", "O isolamento das culturas locais", "A proibição de trocas culturais"], 0, "A globalização cultural é a circulação de costumes, músicas, modas e ideias entre diferentes países e povos."],
      ["Quando vemos influência japonesa em animações, músicas e culinária no Brasil, estamos percebendo:", ["o resultado da troca cultural entre os dois países", "que o Brasil está se tornando japonês", "que a cultura brasileira desapareceu", "que as culturas não se misturam"], 0, "A presença de elementos japoneses no Brasil reflete a imigração japonesa e a troca cultural ao longo do tempo."],
      ["Uma tradição que muda um pouco a cada geração mas continua existindo mostra:", ["que a cultura é viva e dinâmica", "que a tradição vai desaparecer em breve", "que as novas gerações não respeitam o passado", "que a mudança é sempre negativa"], 0, "Tradições que se adaptam a cada geração permanecem vivas justamente porque se renovam."],
      ["O rap e o funk são ritmos que surgiram de:", ["influências culturais diversas, especialmente da música afro-americana", "tradições medievais europeias", "músicas clássicas sem transformações", "músicas indígenas amazônicas"], 0, "Rap e funk têm raízes na música afro-americana e foram transformados e adaptados em diferentes culturas."],
      ["Quando uma criança aprende com os avós e também com a escola e a internet, ela está:", ["construindo sua identidade cultural com influências diversas", "misturando coisas que não combinam", "perdendo a cultura familiar", "criando problemas de identidade"], 0, "A identidade cultural de uma pessoa se forma a partir de múltiplas influências ao longo da vida."],
      ["O que acontece quando uma cultura proíbe toda influência externa?", ["Ela pode se isolar e perder oportunidades de crescimento e troca", "Ela fica mais forte e rica", "Ela nunca muda e fica perfeita", "Ela vira a mais respeitada do mundo"], 0, "O isolamento cultural pode empobrecer uma cultura ao impedir trocas enriquecedoras com outros povos."],
      ["A língua portuguesa falada no Brasil tem influências de:", ["português europeu, línguas indígenas e línguas africanas", "somente latim clássico", "apenas o inglês moderno", "somente o espanhol"], 0, "O português brasileiro é resultado de séculos de mistura com línguas indígenas, africanas e outras línguas imigrantes."],
      ["Quando músicas tradicionais são gravadas e disponibilizadas na internet, elas:", ["alcançam mais pessoas e contribuem para sua preservação", "deixam de ser tradicionais automaticamente", "perdem todo o seu valor cultural", "são proibidas de ser ouvidas"], 0, "A tecnologia pode ajudar a preservar e difundir as tradições culturais."],
      ["Uma criança que aprende a falar duas línguas está:", ["ampliando sua capacidade cultural e de comunicação", "esquecendo sua cultura de origem", "fazendo algo desnecessário", "cometendo um erro educacional"], 0, "O bilinguismo enriquece a pessoa culturalmente e amplia suas possibilidades de comunicação."],
      ["Quando novas gerações não aprendem as tradições dos mais velhos, pode acontecer:", ["a perda de parte do patrimônio cultural imaterial", "o fortalecimento da cultura", "a criação de melhores tradições sempre", "nada de relevante"], 0, "A não transmissão das tradições pode resultar na perda do patrimônio cultural imaterial."],
      ["A moda no vestir também é uma forma de expressão cultural porque:", ["reflete valores, identidade e influências de cada época", "é apenas uma questão de conforto", "não tem nenhuma relação com a história", "é sempre igual em todos os países"], 0, "A moda expressa a cultura, a identidade e os valores de cada época e sociedade."],
      ["Quando um artista brasileiro cria uma obra com influência de várias culturas, está:", ["mostrando a riqueza da diversidade cultural", "copiando sem criatividade", "negando a cultura brasileira", "infringindo as leis de direitos autorais"], 0, "A criatividade cultural muitas vezes nasce da mistura e reinterpretação de diferentes influências."],
      ["O processo de transformação cultural é considerado natural porque:", ["os povos sempre viveram em contato uns com os outros e aprenderam entre si", "as culturas precisam mudar por obrigação legal", "a mudança é sempre negativa e evitável", "as culturas nascem perfeitas e precisam ser mantidas iguais"], 0, "A transformação cultural é natural pois resulta do contato humano, das experiências e das novas gerações."],
      ["Preservar a cultura e ao mesmo tempo permitir que ela se transforme é importante porque:", ["garante que a tradição sobreviva de forma viva e relevante", "impede qualquer mudança cultural", "destrói as tradições mais antigas", "faz com que todos tenham a mesma cultura"], 0, "Equilibrar preservação e transformação mantém a cultura viva, relevante e conectada às novas gerações."]
    ]),
    ...buildQuestions("historia", "festividades_tradicoes", "Festividades e Tradições", "his_ft", [
      ["O que é uma tradição?", ["Um costume ou prática passada de geração em geração", "Uma lei que todo mundo deve seguir", "Uma invenção tecnológica recente", "Um tipo de construção moderna"], 0, "Tradição é um conjunto de costumes, práticas e valores transmitidos ao longo do tempo dentro de um grupo."],
      ["A Festa Junina celebra:", ["as tradições rurais, especialmente do Nordeste brasileiro", "a chegada do verão no Hemisfério Norte", "a independência do Brasil", "o aniversário de uma cidade"], 0, "A Festa Junina tem origem nos festejos europeus e foi adaptada no Brasil, especialmente no Nordeste."],
      ["O Carnaval brasileiro é famoso em todo o mundo por:", ["sua música, dança, fantasias e diversidade cultural", "ser uma festa somente religiosa", "ocorrer apenas no Rio de Janeiro", "ser uma tradição com menos de dez anos"], 0, "O Carnaval brasileiro é reconhecido mundialmente por sua riqueza cultural e diversidade de expressões."],
      ["O Dia de Finados, comemorado em 2 de novembro, é uma tradição que:", ["homenageia os que já morreram e mantém a memória dos entes queridos", "comemora o fim do ano escolar", "celebra a chegada da primavera", "festeja a fundação de cidades"], 0, "O Dia de Finados é uma tradição cultural e religiosa de respeito e lembrança aos que já se foram."],
      ["As festas indígenas, como o Kuarup, são tradições que:", ["celebram a cultura, os antepassados e a relação com a natureza", "foram criadas por turistas", "ocorrem somente em museus", "não têm relação com a cultura indígena"], 0, "O Kuarup é uma cerimônia indígena que homenageia os mortos e celebra a vida, realizada por vários povos do Alto Xingu."],
      ["O folclore brasileiro inclui personagens como:", ["Saci-Pererê, Curupira e Boto", "Rei Artur e os Cavaleiros da Távola Redonda", "Dragões europeus medievais", "Astronautas e robôs futuristas"], 0, "O folclore brasileiro tem personagens próprios como o Saci-Pererê, o Curupira e o Boto, ligados à cultura nacional."],
      ["O Dia do Folclore é comemorado em:", ["22 de agosto", "7 de setembro", "15 de novembro", "1 de maio"], 0, "O Dia do Folclore é celebrado em 22 de agosto, data estabelecida para valorizar as tradições populares brasileiras."],
      ["A capoeira, além de luta e dança, é também:", ["uma tradição cultural com música e ritual próprios", "apenas um esporte sem história", "uma brincadeira infantil sem regras", "uma dança importada da Europa recentemente"], 0, "A capoeira é uma expressão cultural completa com música (berimbau), ritual, dança e luta."],
      ["Qual instrumento é símbolo da música nordestina brasileira?", ["A sanfona (acordeão)", "O violino clássico", "A bateria eletrônica", "O sitar indiano"], 0, "A sanfona é um instrumento central na música forró e baião, tradições musicais do Nordeste brasileiro."],
      ["O que são as congadas?", ["Festas afro-brasileiras que celebram a cultura e a resistência dos povos africanos", "Festas europeias medievais trazidas pelos portugueses", "Competições esportivas regionais", "Feiras de artesanato sem ligação histórica"], 0, "As congadas são manifestações culturais de origem africana que celebram a resistência e a fé do povo negro."],
      ["A Festa do Divino Espírito Santo é uma tradição religiosa e cultural que vem de:", ["Portugal e foi adaptada no Brasil", "países africanos", "populações indígenas do Sul do Brasil", "colonizadores holandeses"], 0, "A Festa do Divino tem origem portuguesa e foi adotada e transformada no Brasil ao longo dos séculos."],
      ["O maracatu é uma expressão cultural típica de:", ["Pernambuco, no Nordeste do Brasil", "Rio Grande do Sul", "Amazônia", "São Paulo"], 0, "O maracatu é uma manifestação afro-brasileira de Pernambuco, com raízes na cultura africana."],
      ["Quando as crianças brincam de cirandas e rodas cantadas, estão praticando:", ["tradições da cultura popular infantil", "apenas exercícios físicos", "atividades sem valor histórico", "esportes olímpicos"], 0, "Cirandas e rodas cantadas são parte do folclore e da tradição cultural infantil brasileira."],
      ["O bumba-meu-boi, do Maranhão, conta a história de:", ["a morte e a ressurreição de um boi, misturando culturas indígena, africana e europeia", "uma batalha naval histórica", "a vida de um pescador famoso", "um rei medieval europeu"], 0, "O bumba-meu-boi é uma festa folclórica que narra a história do boi e mistura influências das três culturas formadoras do Brasil."],
      ["A Festa da Uva, em Caxias do Sul, celebra:", ["as tradições da imigração italiana e a produção de uvas", "a história dos povos indígenas gaúchos", "a chegada dos portugueses ao Sul do Brasil", "a cultura africana no Rio Grande do Sul"], 0, "A Festa da Uva de Caxias do Sul celebra a cultura italiana trazida pelos imigrantes e a tradição vitivinícola regional."],
      ["O que é uma lenda?", ["Uma história fantástica passada de geração em geração que explica fenômenos ou ensina valores", "Um livro de leis antigas", "Uma lista de compras histórica", "Um tipo de construção tradicional"], 0, "Lendas são narrativas fantásticas do folclore que explicam fenômenos naturais ou transmitem valores culturais."],
      ["A tradição da tainha, no litoral catarinense, é uma festa que celebra:", ["a pesca artesanal e a cultura litorânea", "a história da capital do estado", "o aniversário de um herói histórico", "a chegada de imigrantes alemães"], 0, "A Festa da Tainha celebra a pesca artesanal e a cultura das comunidades litorâneas de Santa Catarina."],
      ["Por que as festas tradicionais costumam ter música, dança e comidas típicas?", ["Porque esses elementos expressam a identidade e a alegria de uma cultura", "Porque é uma exigência legal", "Porque facilitam a venda de produtos", "Porque são mais baratas de organizar"], 0, "Música, dança e culinária são expressões centrais da cultura que ganham destaque nas festas tradicionais."],
      ["A tradição de soltar balões no céu é hoje proibida no Brasil porque:", ["causa incêndios e riscos ambientais", "foi inventada por outros países", "não faz parte da cultura brasileira", "é considerada uma brincadeira infantil"], 0, "A soltura de balões é proibida no Brasil por representar risco de incêndio, apesar de sua origem em festas juninas."],
      ["As festas religiosas como o Círio de Nazaré, no Pará, mostram:", ["a fé e a cultura de um povo expressa em uma procissão tradicional", "apenas turismo religioso sem tradição", "uma competição entre cidades", "uma exigência do governo estadual"], 0, "O Círio de Nazaré é uma das maiores manifestações religiosas e culturais do Brasil, reunindo milhões de fiéis em Belém."],
      ["O que é a quadrilha junina?", ["Uma dança típica das festas juninas com pares e coreografia animada", "Uma dança clássica de balé", "Uma luta marcial nordestina", "Um tipo de jogo de cartas"], 0, "A quadrilha junina é uma dança animada e colorida que faz parte das festas juninas, com raízes na quadrilha europeia."],
      ["As tradições passadas pelos avós para os netos são importantes porque:", ["mantêm viva a memória e a identidade cultural da família e da comunidade", "são obrigatórias por lei", "substituem a educação escolar", "são sempre melhores do que as novas tradições"], 0, "A transmissão de tradições entre gerações fortalece a identidade cultural e a memória coletiva."],
      ["A capoeira angola e a capoeira regional são:", ["variações de uma mesma tradição cultural com estilos diferentes", "esportes completamente diferentes sem relação", "invenções recentes sem raízes históricas", "danças importadas da África recentemente"], 0, "A capoeira angola e a regional são estilos diferentes de uma mesma arte marcial e expressão cultural afro-brasileira."],
      ["Quando uma comunidade realiza a mesma festa há cem anos, isso mostra:", ["força e continuidade da tradição cultural", "que a festa é obrigatória por lei", "que as pessoas não têm criatividade", "que nada mais acontece no lugar"], 0, "A repetição de festas ao longo do tempo mostra a importância dessa tradição para a identidade da comunidade."],
      ["Por que é importante que as crianças participem das festas e tradições da sua cultura?", ["Para conhecer e valorizar a própria história, identidade e modo de viver", "Porque é obrigatório para passar de ano", "Para aprender somente a dançar", "Para ganhar presentes"], 0, "Participar das tradições culturais ajuda as crianças a construírem sua identidade e a valorizarem a história do seu povo."]
    ])
  ];

  questions.push(...historyQuestions);

  const SUBJECT_META = {
    portugues:  { name: "Português",   icon: "📖", available: true  },
    matematica: { name: "Matemática",  icon: "🔢", available: true  },
    historia:   { name: "História",    icon: "🏛️", available: true  },
    ciencias:   { name: "Ciências",    icon: "🔬", available: true  },
    ingles:     { name: "Inglês",      icon: "🌍", available: true  },
    geografia:  { name: "Geografia",   icon: "🗺️", available: true  }
  };

  const TOPIC_META = {
    interpretacao:        { name: "Interpretação de Texto",            icon: "📖" },
    ordem_alfabetica:     { name: "Ordem Alfabética",                icon: "🔤" },
    classificacao_silabica: { name: "Classificação Silábica",         icon: "🔡" },
    encontros_vocais:     { name: "Encontros Vocálicos",             icon: "🎶" },
    letra_z:              { name: "A letra Z",                       icon: "⚡" },
    letra_s:              { name: "A letra S",                       icon: "🔠" },
    substantivos_masculinos: { name: "Substantivos Masculinos",      icon: "👦" },
    substantivos_femininos: { name: "Substantivos Femininos",        icon: "👧" },
    substantivos_simples_compostos: { name: "Substantivos Simples e Compostos", icon: "➕" },
    substantivos_coletivos: { name: "Substantivos Coletivos",         icon: "🧩" },
    atividades_adicionais: { name: "Atividades Adicionais",         icon: "✅" },
    ca_ce_ci_co_cu:      { name: "Usos do CA, CE, CI, CO e CU",       icon: "🔤" },
    substantivos_proprios:{ name: "Substantivos Próprios e Comuns",    icon: "🏷️" },
    singular_plural:      { name: "Singular e Plural",                 icon: "1️⃣" },
    maiusculas_dt:        { name: "Maiúsculas e Minúsculas: D e T",    icon: "🔡" },
    grau:                 { name: "Grau: Diminutivo e Aumentativo",    icon: "📏" },
    derivados:            { name: "Substantivos Derivados",            icon: "🌱" },
    maiusculas_cg:        { name: "Maiúsculas e Minúsculas: C e G",    icon: "🔡" },
    genero:               { name: "Substantivos Masculino e Feminino", icon: "👫" },
    dobro_triplo_quadruplo_quintuplo: { name: "Dobro, Triplo, Quádruplo e Quíntuplo", icon: "2x" },
    comparando_ordenando_numeros: { name: "Comparando e Ordenando Números", icon: "🔢" },
    horas_relogios:          { name: "As Horas e os Relógios", icon: "⏰" },
    multiplicacao_10_100_1000_zero: { name: "Multiplicação por 10, 100, 1.000 ou Zero", icon: "✖️" },
    medidas_capacidade_massa: { name: "Medidas de Capacidade e de Massa", icon: "⚖️" },
    solidos_geometricos_mais_conhecidos: { name: "Sólidos Geométricos Mais Conhecidos", icon: "🧊" },
    solidos_para_montar:      { name: "Sólidos para Montar", icon: "🧩" },
    atividades_adicionais:    { name: "Atividades Adicionais", icon: "✅" },
    atividades_adicionais_matematica: { name: "Atividades Adicionais de Matemática", icon: "✅" },
    platelmintos:         { name: "Características e Desenvolvimento dos Platelmintos", icon: "🪱" },
    nematoides:           { name: "Características e Desenvolvimento dos Nematoides", icon: "🔬" },
    moluscos:             { name: "Características e Desenvolvimento dos Moluscos", icon: "🐚" },
    anelideos:            { name: "Características e Desenvolvimento dos Anelídeos", icon: "🪱" },
    easter_eggs:          { name: "Celebrations - Easter Eggs", icon: "🥚" },
    parts_house:          { name: "Parts of House", icon: "🏠" },
    there_is_are:         { name: "There is / There are", icon: "🧩" },
    there_negative:       { name: "There is / There are / Negative Form", icon: "🚫" },
    there_interrogative:  { name: "There is / There are / Interrogative Form", icon: "❓" },
    mothers_day:          { name: "Celebrations - Mother's Day", icon: "💐" },
    food:                 { name: "Food", icon: "🍎" },
    colors:               { name: "Colors", icon: "🎨" },
    monumentos_historicos: { name: "Monumentos Históricos",           icon: "🏛️" },
    ruas_memorias:         { name: "As Ruas: Espaços e Memórias",     icon: "🛤️" },
    o_que_e_cultura:       { name: "O que é Cultura",                 icon: "🎭" },
    patrimonios_culturais: { name: "Patrimônios Culturais",           icon: "🏺" },
    transformacao_cultura: { name: "Transformação da Cultura",        icon: "🔄" },
    festividades_tradicoes:{ name: "Festividades e Tradições",        icon: "🎉" },
    o_que_e_lixo_rejeito_residuo: { name: "O que é lixo, rejeito e resíduo", icon: "🗑️" },
    tipos_residuos_solidos: { name: "Os tipos de resíduos sólidos", icon: "♻️" },
    destino_residuos_solidos: { name: "O destino dos resíduos sólidos", icon: "🚛" },
    sustentabilidade: { name: "Sustentabilidade", icon: "🌱" },
    cinco_rs: { name: "A prática dos 5 Rs", icon: "5️⃣" },
    atividades_adicionais_geografia: { name: "Atividades adicionais", icon: "🧠" }
  };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return {
    getAll: () => questions,
    getByTopic: (topic) => topic === "all" ? questions : questions.filter(q => q.topic === topic),
    getTopics: () => Object.keys(TOPIC_META),
    getTopicInfo: (topic) => ({
      ...TOPIC_META[topic],
      count: questions.filter(q => q.topic === topic).length
    }),
    getSubjects: () => Object.keys(SUBJECT_META),
    getSubjectInfo: (subject) => ({
      ...SUBJECT_META[subject],
      count: questions.filter(q => q.subject === subject).length
    }),
    getTopicsBySubject: (subject) => {
      const seen = new Set();
      return questions
        .filter(q => q.subject === subject)
        .map(q => q.topic)
        .filter(t => seen.has(t) ? false : seen.add(t));
    },
    getRandom: (count, topic, subject) => {
      let pool = questions;
      if (subject && subject !== 'all') pool = pool.filter(q => q.subject === subject);
      if (topic   && topic   !== 'all') pool = pool.filter(q => q.topic   === topic);
      return shuffle(pool).slice(0, Math.min(count, pool.length));
    }
  };
})();
