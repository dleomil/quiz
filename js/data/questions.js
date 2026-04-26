const QuestionsDB = (function () {
  const questions = [
    // ─── INTERPRETAÇÃO DE TEXTO ───────────────────────────────────────────────
    {
      id: "int_001", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
      question: "Onde Pedro e Ana foram no domingo?",
      options: ["À praia", "Ao parque", "À escola", "Ao shopping"],
      correctIndex: 1,
      explanation: "O texto diz claramente: 'Pedro e Ana foram ao parque no domingo.'",
      wrongExplanations: { 0: "O texto não menciona praia.", 2: "Foi um passeio de lazer, não à escola.", 3: "O texto não menciona shopping." }
    },
    {
      id: "int_002", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
      question: "O que Pedro e Ana fizeram no parque?",
      options: ["Nadaram na piscina", "Jogaram futebol", "Brincaram no balanço e no escorregador", "Desenharam"],
      correctIndex: 2,
      explanation: "O texto diz: 'Eles brincaram no balanço e no escorregador.'",
      wrongExplanations: { 0: "Não há menção a piscina no texto.", 1: "Futebol não é mencionado.", 3: "Desenho não é mencionado no texto." }
    },
    {
      id: "int_003", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
      question: "Qual sabor de sorvete Pedro e Ana comeram?",
      options: ["Morango", "Baunilha", "Limão", "Chocolate"],
      correctIndex: 3,
      explanation: "O texto diz: 'comeram sorvete de chocolate.'",
      wrongExplanations: { 0: "O texto não menciona morango.", 1: "O texto não menciona baunilha.", 2: "O texto não menciona limão." }
    },
    {
      id: "int_004", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
      question: "Como foi o dia de Pedro e Ana?",
      options: ["Chato e triste", "Cansativo", "Muito divertido", "Assustador"],
      correctIndex: 2,
      explanation: "O texto termina dizendo: 'Foi um dia muito divertido!'",
      wrongExplanations: { 0: "O texto diz o contrário: foi divertido!", 1: "O texto não menciona cansaço.", 3: "O texto não menciona susto." }
    },
    {
      id: "int_005", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Pedro e Ana foram ao parque no domingo. Eles brincaram no balanço e no escorregador. Depois, comeram sorvete de chocolate. Foi um dia muito divertido!",
      question: "Em que dia da semana foi o passeio?",
      options: ["Sábado", "Segunda-feira", "Domingo", "Sexta-feira"],
      correctIndex: 2,
      explanation: "O texto começa dizendo 'foram ao parque no domingo'.",
      wrongExplanations: { 0: "O texto diz domingo, não sábado.", 1: "O texto diz domingo, não segunda.", 3: "O texto diz domingo, não sexta." }
    },
    {
      id: "int_006", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
      question: "Como se chama o cachorro do texto?",
      options: ["Bob", "Rex", "Thor", "Pluto"],
      correctIndex: 1,
      explanation: "O texto diz: 'O cachorro Rex estava com fome.'",
      wrongExplanations: { 0: "Bob não é mencionado no texto.", 2: "Thor não aparece no texto.", 3: "Pluto não é o nome do cachorro." }
    },
    {
      id: "int_007", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
      question: "Por que Rex latiu?",
      options: ["Para brincar", "Porque estava assustado", "Para chamar a dona", "Porque viu outro cachorro"],
      correctIndex: 2,
      explanation: "O texto diz: 'Ele latiu para chamar a dona.'",
      wrongExplanations: { 0: "O texto não menciona brincadeira.", 1: "O texto não menciona susto.", 3: "O texto não menciona outro cachorro." }
    },
    {
      id: "int_008", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
      question: "O que a dona colocou na tigela de Rex?",
      options: ["Água", "Leite", "Osso", "Ração"],
      correctIndex: 3,
      explanation: "O texto diz: 'colocou ração na tigela de Rex.'",
      wrongExplanations: { 0: "O texto não menciona água na tigela.", 1: "O texto não menciona leite.", 2: "O texto não menciona osso." }
    },
    {
      id: "int_009", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
      question: "Como Rex ficou depois de comer?",
      options: ["Bravo", "Triste", "Feliz", "Assustado"],
      correctIndex: 2,
      explanation: "O texto diz: 'O cachorro abanou o rabo feliz.'",
      wrongExplanations: { 0: "O texto diz que Rex ficou feliz.", 1: "Rex ficou feliz, não triste.", 3: "Rex ficou feliz, não assustado." }
    },
    {
      id: "int_010", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "O cachorro Rex estava com fome. Ele latiu para chamar a dona. A dona foi até a cozinha e colocou ração na tigela de Rex. O cachorro abanou o rabo feliz.",
      question: "Para onde a dona foi buscar a comida?",
      options: ["Para o quarto", "Para o banheiro", "Para a sala", "Para a cozinha"],
      correctIndex: 3,
      explanation: "O texto diz: 'A dona foi até a cozinha.'",
      wrongExplanations: { 0: "O texto diz cozinha, não quarto.", 1: "O texto diz cozinha, não banheiro.", 2: "O texto diz cozinha, não sala." }
    },
    {
      id: "int_011", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Na floresta, morava uma borboleta colorida. Suas asas tinham as cores do arco-íris. Todos os animais a admiravam. A borboleta se chamava Bela.",
      question: "Onde morava a borboleta?",
      options: ["No mar", "Na floresta", "Na cidade", "No jardim"],
      correctIndex: 1,
      explanation: "O texto começa: 'Na floresta, morava uma borboleta colorida.'",
      wrongExplanations: { 0: "O texto diz floresta, não mar.", 2: "A borboleta vivia na floresta, não na cidade.", 3: "O texto diz floresta, não jardim." }
    },
    {
      id: "int_012", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Na floresta, morava uma borboleta colorida. Suas asas tinham as cores do arco-íris. Todos os animais a admiravam. A borboleta se chamava Bela.",
      question: "O que havia de especial nas asas da borboleta?",
      options: ["Eram muito grandes", "Eram pequenas e frágeis", "Tinham as cores do arco-íris", "Eram transparentes"],
      correctIndex: 2,
      explanation: "O texto diz: 'Suas asas tinham as cores do arco-íris.'",
      wrongExplanations: { 0: "O texto não menciona o tamanho das asas.", 1: "O texto não diz isso.", 3: "O texto não diz que as asas eram transparentes." }
    },
    {
      id: "int_013", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Na floresta, morava uma borboleta colorida. Suas asas tinham as cores do arco-íris. Todos os animais a admiravam. A borboleta se chamava Bela.",
      question: "Como os outros animais se sentiam em relação à borboleta?",
      options: ["Com medo", "Com raiva", "A admiravam", "A ignoravam"],
      correctIndex: 2,
      explanation: "O texto diz: 'Todos os animais a admiravam.'",
      wrongExplanations: { 0: "O texto não menciona medo.", 1: "O texto não menciona raiva.", 3: "O oposto: os animais a admiravam." }
    },
    {
      id: "int_014", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Na floresta, morava uma borboleta colorida. Suas asas tinham as cores do arco-íris. Todos os animais a admiravam. A borboleta se chamava Bela.",
      question: "Qual era o nome da borboleta?",
      options: ["Ana", "Lua", "Bela", "Flora"],
      correctIndex: 2,
      explanation: "O texto diz: 'A borboleta se chamava Bela.'",
      wrongExplanations: { 0: "Ana não é mencionado no texto.", 1: "Lua não é o nome da borboleta.", 3: "Flora não aparece no texto." }
    },
    {
      id: "int_015", subject: "portugues", topic: "interpretacao",
      topicName: "Interpretação de Texto",
      text: "Na floresta, morava uma borboleta colorida. Suas asas tinham as cores do arco-íris. Todos os animais a admiravam. A borboleta se chamava Bela.",
      question: "Como era a borboleta?",
      options: ["Cinza", "Preta e branca", "Colorida", "Transparente"],
      correctIndex: 2,
      explanation: "O texto diz: 'morava uma borboleta colorida.'",
      wrongExplanations: { 0: "O texto não menciona cinza.", 1: "O texto diz colorida, não preta e branca.", 3: "O texto diz colorida, não transparente." }
    },

    // ─── USOS DO CA, CE, CI, CO, CU ───────────────────────────────────────────
    {
      id: "ca_001", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Qual dessas palavras começa com o som de 'KA'?",
      options: ["Cebola", "Cidade", "Casa", "Cigarro"],
      correctIndex: 2,
      explanation: "A palavra 'casa' usa a sílaba CA, que tem o som de 'KA'. Quando o C vem antes de A, tem som de K.",
      wrongExplanations: { 0: "'Cebola' tem CE — som de S, não de K.", 1: "'Cidade' tem CI — som de S, não de K.", 3: "'Cigarro' tem CI — som de S." }
    },
    {
      id: "ca_002", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Em qual palavra o C tem o som de S?",
      options: ["Copo", "Cama", "Cubo", "Cidade"],
      correctIndex: 3,
      explanation: "Em 'cidade', o C vem antes do I, então tem som de S. C antes de E ou I = som de S.",
      wrongExplanations: { 0: "'Copo' tem CO — som de K.", 1: "'Cama' tem CA — som de K.", 2: "'Cubo' tem CU — som de K." }
    },
    {
      id: "ca_003", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Qual dessas palavras tem o som de 'KO'?",
      options: ["Cenoura", "Cinto", "Cobra", "Cisne"],
      correctIndex: 2,
      explanation: "'Cobra' começa com CO, que tem o som de 'KO'. C + O = som de K.",
      wrongExplanations: { 0: "'Cenoura' tem CE — som de S.", 1: "'Cinto' tem CI — som de S.", 3: "'Cisne' tem CI — som de S." }
    },
    {
      id: "ca_004", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "A palavra 'cuidado' começa com qual sílaba?",
      options: ["CA", "CE", "CI", "CU"],
      correctIndex: 3,
      explanation: "'Cuidado' começa com CU (cu-i-da-do). O C antes do U tem som de K.",
      wrongExplanations: { 0: "CA tem A depois do C. 'Cuidado' começa com CU.", 1: "CE tem E depois do C.", 2: "CI tem I depois do C." }
    },
    {
      id: "ca_005", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Qual das opções tem duas palavras que começam com CI?",
      options: ["Casa, cobra", "Cidade, circo", "Campo, copo", "Cuidado, cubo"],
      correctIndex: 1,
      explanation: "'Cidade' e 'circo' começam com CI. O C antes do I tem som de S.",
      wrongExplanations: { 0: "'Casa' tem CA e 'cobra' tem CO.", 2: "'Campo' tem CA e 'copo' tem CO.", 3: "'Cuidado' e 'cubo' têm CU." }
    },
    {
      id: "ca_006", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "A palavra 'cenoura' começa com qual sílaba?",
      options: ["CA", "CE", "CI", "CO"],
      correctIndex: 1,
      explanation: "'Cenoura' começa com CE (ce-nou-ra). O C antes de E tem som de S.",
      wrongExplanations: { 0: "CA teria A depois do C.", 2: "CI teria I depois do C.", 3: "CO teria O depois do C." }
    },
    {
      id: "ca_007", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Em qual das palavras o C não tem som de K?",
      options: ["Casa", "Copo", "Cereal", "Cubo"],
      correctIndex: 2,
      explanation: "Em 'cereal', o C vem antes do E, então tem som de S, não de K.",
      wrongExplanations: { 0: "'Casa' tem CA — som de K.", 1: "'Copo' tem CO — som de K.", 3: "'Cubo' tem CU — som de K." }
    },
    {
      id: "ca_008", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Qual palavra usa a sílaba CA?",
      options: ["Cidade", "Circo", "Caneta", "Cenoura"],
      correctIndex: 2,
      explanation: "'Caneta' começa com CA (ca-ne-ta). C antes de A tem som de K.",
      wrongExplanations: { 0: "'Cidade' começa com CI.", 1: "'Circo' começa com CI.", 3: "'Cenoura' começa com CE." }
    },
    {
      id: "ca_009", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "A palavra 'coelho' começa com qual sílaba?",
      options: ["CA", "CE", "CO", "CU"],
      correctIndex: 2,
      explanation: "'Coelho' começa com CO (co-e-lho). C antes de O tem som de K.",
      wrongExplanations: { 0: "CA teria A logo depois do C.", 1: "CE teria E logo depois do C com som de S.", 3: "CU teria U logo depois do C." }
    },
    {
      id: "ca_010", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Qual animal tem nome que começa com CE?",
      options: ["Cobra", "Cachorro", "Cervo", "Coelho"],
      correctIndex: 2,
      explanation: "'Cervo' começa com CE. O cervo é um animal de floresta com chifres.",
      wrongExplanations: { 0: "'Cobra' começa com CO.", 1: "'Cachorro' começa com CA.", 3: "'Coelho' começa com CO." }
    },
    {
      id: "ca_011", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "A palavra 'coco' tem quantas sílabas CO?",
      options: ["Nenhuma", "Uma", "Duas", "Três"],
      correctIndex: 2,
      explanation: "'Coco' se divide em co-co. São duas sílabas CO.",
      wrongExplanations: { 0: "'Coco' tem duas sílabas CO.", 1: "'Coco' tem duas sílabas CO, não uma.", 3: "'Coco' tem apenas duas sílabas." }
    },
    {
      id: "ca_012", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Em qual palavra o C tem som de S antes de uma vogal?",
      options: ["Cama", "Corda", "Cuia", "Cinema"],
      correctIndex: 3,
      explanation: "Em 'cinema', o C vem antes do I, então tem o som de S. CI = som de S.",
      wrongExplanations: { 0: "'Cama' tem CA — som de K.", 1: "'Corda' tem CO — som de K.", 2: "'Cuia' tem CU — som de K." }
    },
    {
      id: "ca_013", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Qual a regra do C antes de E ou I?",
      options: ["Tem som de K", "Tem som de S", "Tem som de G", "Não tem som"],
      correctIndex: 1,
      explanation: "Quando o C vem antes de E ou I, ele tem som de S. Exemplos: cidade (CI), cenoura (CE).",
      wrongExplanations: { 0: "Som de K é para CA, CO e CU.", 2: "O C nunca tem som de G.", 3: "O C sempre tem som, de K ou de S." }
    },
    {
      id: "ca_014", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Quais sílabas com C têm som de K?",
      options: ["CE e CI", "CA, CO e CU", "Todas têm som de K", "Nenhuma tem som de K"],
      correctIndex: 1,
      explanation: "CA, CO e CU têm som de K (casa, cobra, cubo). CE e CI têm som de S.",
      wrongExplanations: { 0: "CE e CI têm som de S, não de K.", 2: "CE e CI têm som de S.", 3: "CA, CO e CU têm som de K." }
    },
    {
      id: "ca_015", subject: "portugues", topic: "ca_ce_ci_co_cu",
      topicName: "Usos do CA, CE, CI, CO e CU",
      question: "Complete: a palavra 'cu___dado' vira 'cuidado'. Qual sílaba foi usada?",
      options: ["CA", "CE", "CI", "CU"],
      correctIndex: 3,
      explanation: "'Cuidado' começa com a sílaba CU. C + U = som de K.",
      wrongExplanations: { 0: "CA formaria 'caidade', que não é palavra.", 1: "CE formaria 'ceidade', que não é palavra.", 2: "CI formaria 'ciidade', que não é palavra." }
    },

    // ─── SUBSTANTIVOS PRÓPRIOS E COMUNS ───────────────────────────────────────
    {
      id: "sp_001", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "Qual das palavras é um substantivo próprio?",
      options: ["cidade", "cachorro", "Brasil", "escola"],
      correctIndex: 2,
      explanation: "'Brasil' é um substantivo próprio porque é o nome específico de um país. Substantivos próprios sempre começam com letra maiúscula.",
      wrongExplanations: { 0: "'Cidade' é um nome geral — substantivo comum.", 1: "'Cachorro' é um nome geral — substantivo comum.", 3: "'Escola' é um nome geral — substantivo comum." }
    },
    {
      id: "sp_002", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "Qual das palavras é um substantivo comum?",
      options: ["Pedro", "menino", "São Paulo", "Ana"],
      correctIndex: 1,
      explanation: "'Menino' é um substantivo comum porque é um nome geral para qualquer menino.",
      wrongExplanations: { 0: "'Pedro' é nome de pessoa — substantivo próprio.", 2: "'São Paulo' é nome de cidade — substantivo próprio.", 3: "'Ana' é nome de pessoa — substantivo próprio." }
    },
    {
      id: "sp_003", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "'A professora Carla ensina matemática.' Qual é o substantivo próprio?",
      options: ["professora", "ensina", "Carla", "matemática"],
      correctIndex: 2,
      explanation: "'Carla' é o nome específico de uma pessoa, portanto é substantivo próprio.",
      wrongExplanations: { 0: "'Professora' é um cargo geral — substantivo comum.", 1: "'Ensina' é um verbo, não substantivo.", 3: "'Matemática' é nome geral de uma matéria — substantivo comum." }
    },
    {
      id: "sp_004", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "Qual opção contém apenas substantivos próprios?",
      options: ["gato, casa, árvore", "Rio de Janeiro, Maria, Bolinha", "escola, aluno, livro", "mar, sol, lua"],
      correctIndex: 1,
      explanation: "Rio de Janeiro (lugar), Maria (pessoa) e Bolinha (nome de animal) são todos substantivos próprios.",
      wrongExplanations: { 0: "Gato, casa e árvore são nomes gerais — substantivos comuns.", 2: "Escola, aluno e livro são nomes gerais — substantivos comuns.", 3: "Mar, sol e lua são nomes gerais — substantivos comuns." }
    },
    {
      id: "sp_005", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "'Meu gato se chama Mingau.' Qual é o substantivo comum?",
      options: ["Mingau", "gato", "meu", "chama"],
      correctIndex: 1,
      explanation: "'Gato' é o nome geral para qualquer gato — substantivo comum. 'Mingau' é o nome específico desse gato.",
      wrongExplanations: { 0: "'Mingau' é o nome específico do gato — substantivo próprio.", 2: "'Meu' é pronome possessivo.", 3: "'Chama' é um verbo." }
    },
    {
      id: "sp_006", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "Os substantivos próprios devem ser escritos com:",
      options: ["letra minúscula", "letra maiúscula no início", "todas as letras maiúsculas", "sublinhado"],
      correctIndex: 1,
      explanation: "Substantivos próprios sempre começam com letra maiúscula, como 'Pedro', 'Brasil' e 'São Paulo'.",
      wrongExplanations: { 0: "Nomes próprios não são escritos com minúscula.", 2: "Só a primeira letra é maiúscula, não todas.", 3: "Não usamos sublinhado para marcar substantivos próprios." }
    },
    {
      id: "sp_007", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "Qual das palavras é um substantivo próprio?",
      options: ["país", "rio", "Amazonas", "montanha"],
      correctIndex: 2,
      explanation: "'Amazonas' é substantivo próprio: é o nome específico de um rio e de um estado.",
      wrongExplanations: { 0: "'País' é nome geral — substantivo comum.", 1: "'Rio' é nome geral — substantivo comum.", 3: "'Montanha' é nome geral — substantivo comum." }
    },
    {
      id: "sp_008", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "'O menino Lucas mora em Campinas.' Quantos substantivos próprios há?",
      options: ["Nenhum", "Um", "Dois", "Três"],
      correctIndex: 2,
      explanation: "'Lucas' (nome de pessoa) e 'Campinas' (nome de cidade) são os dois substantivos próprios.",
      wrongExplanations: { 0: "Há dois substantivos próprios: Lucas e Campinas.", 1: "São dois: Lucas e Campinas.", 3: "São apenas dois: Lucas e Campinas." }
    },
    {
      id: "sp_009", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "Qual é o substantivo comum na lista?",
      options: ["Maria", "Brasília", "Outubro", "livro"],
      correctIndex: 3,
      explanation: "'Livro' é um nome geral — qualquer livro —, portanto é substantivo comum.",
      wrongExplanations: { 0: "'Maria' é nome de pessoa — substantivo próprio.", 1: "'Brasília' é nome de cidade — substantivo próprio.", 2: "'Outubro' é nome de mês, escrito com maiúscula neste exemplo mas é tratado como comum no uso." }
    },
    {
      id: "sp_010", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "'Eu gosto de comer maçã.' A palavra 'maçã' é:",
      options: ["Substantivo próprio", "Substantivo comum", "Verbo", "Adjetivo"],
      correctIndex: 1,
      explanation: "'Maçã' é substantivo comum porque nomeia uma fruta de forma geral, não uma maçã específica.",
      wrongExplanations: { 0: "Substantivo próprio é nome específico de algo único, como 'Brasil'.", 2: "'Gosto' é o verbo da frase, não 'maçã'.", 3: "Adjetivo é palavra que descreve qualidade, como 'bonita'." }
    },
    {
      id: "sp_011", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "Qual frase usa corretamente a maiúscula do substantivo próprio?",
      options: ["Meu amigo pedro é legal.", "Meu amigo Pedro é legal.", "meu amigo pedro é legal.", "Meu AMIGO Pedro é legal."],
      correctIndex: 1,
      explanation: "Substantivos próprios como 'Pedro' sempre começam com letra maiúscula.",
      wrongExplanations: { 0: "'Pedro' deve ter P maiúsculo por ser nome próprio.", 2: "A frase deve começar com maiúscula e 'Pedro' também.", 3: "Só 'Pedro' e o início de frase precisam de maiúscula." }
    },
    {
      id: "sp_012", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "'O rio que passa pela cidade é o rio Tietê.' Qual palavra é substantivo próprio?",
      options: ["rio (1ª vez)", "cidade", "Tietê", "passa"],
      correctIndex: 2,
      explanation: "'Tietê' é o nome específico desse rio — substantivo próprio.",
      wrongExplanations: { 0: "O primeiro 'rio' é substantivo comum (nome geral).", 1: "'Cidade' é substantivo comum.", 3: "'Passa' é um verbo." }
    },
    {
      id: "sp_013", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "Qual lista contém apenas substantivos comuns?",
      options: ["Brasil, Pedro, Natal", "escola, menina, cachorro", "Amazonas, Maria, São Paulo", "domingo, livro, João"],
      correctIndex: 1,
      explanation: "'Escola', 'menina' e 'cachorro' são nomes gerais — todos substantivos comuns.",
      wrongExplanations: { 0: "Brasil, Pedro e Natal são substantivos próprios.", 2: "Amazonas, Maria e São Paulo são substantivos próprios.", 3: "João é substantivo próprio." }
    },
    {
      id: "sp_014", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "Os meses do ano em português são escritos com letra:",
      options: ["Maiúscula", "Minúscula", "Alternada", "Sublinhada"],
      correctIndex: 1,
      explanation: "Em português, os meses (janeiro, fevereiro...) são escritos com letra minúscula pois são considerados substantivos comuns.",
      wrongExplanations: { 0: "Em inglês se usa maiúscula, mas não em português.", 2: "Não existe essa regra.", 3: "Sublinhado não é regra de escrita dos meses." }
    },
    {
      id: "sp_015", subject: "portugues", topic: "substantivos_proprios",
      topicName: "Substantivos Próprios e Comuns",
      question: "'Minha escola se chama Etapa.' A palavra 'Etapa' é:",
      options: ["Substantivo comum", "Adjetivo", "Substantivo próprio", "Verbo"],
      correctIndex: 2,
      explanation: "'Etapa' é o nome específico de uma escola — substantivo próprio, escrito com maiúscula.",
      wrongExplanations: { 0: "'Escola' seria substantivo comum; 'Etapa' é o nome específico.", 1: "Adjetivo descreve qualidade. 'Etapa' é nome.", 3: "'Chama' é o verbo da frase." }
    },

    // ─── SINGULAR E PLURAL ────────────────────────────────────────────────────
    {
      id: "pl_001", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'livro'?",
      options: ["livros", "livres", "livrois", "livrons"],
      correctIndex: 0,
      explanation: "Para fazer o plural de palavras terminadas em vogal, adicionamos -s. 'Livro' → 'livros'.",
      wrongExplanations: { 1: "'Livres' não é o plural de 'livro'.", 2: "'Livrois' não existe.", 3: "'Livrons' não existe." }
    },
    {
      id: "pl_002", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'flor'?",
      options: ["flors", "flores", "floris", "florens"],
      correctIndex: 1,
      explanation: "Palavras terminadas em -r fazem o plural com -es. 'Flor' → 'flores'.",
      wrongExplanations: { 0: "'Flors' não é a forma correta.", 2: "'Floris' não existe.", 3: "'Florens' não existe." }
    },
    {
      id: "pl_003", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'animal'?",
      options: ["animals", "animales", "animais", "animáis"],
      correctIndex: 2,
      explanation: "Palavras terminadas em -l fazem o plural trocando -l por -is. 'Animal' → 'animais'.",
      wrongExplanations: { 0: "'Animals' seria o plural em inglês, não em português.", 1: "'Animales' não existe em português.", 3: "'Animáis' não tem acento." }
    },
    {
      id: "pl_004", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'viagem'?",
      options: ["viagens", "viajens", "viajins", "viagems"],
      correctIndex: 0,
      explanation: "Palavras terminadas em -m fazem o plural trocando -m por -ns. 'Viagem' → 'viagens'.",
      wrongExplanations: { 1: "'Viajens' troca o G, o que está errado.", 2: "'Viajins' está errado.", 3: "Nunca adicionamos -s a palavras terminadas em -m." }
    },
    {
      id: "pl_005", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'pão'?",
      options: ["pãos", "pãons", "pães", "pões"],
      correctIndex: 2,
      explanation: "A palavra 'pão' tem plural irregular: 'pães'. É uma das exceções que devemos memorizar.",
      wrongExplanations: { 0: "'Pãos' não é o plural correto de 'pão'.", 1: "'Pãons' não existe.", 3: "'Pões' não é o plural de 'pão'." }
    },
    {
      id: "pl_006", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual frase está no plural corretamente?",
      options: ["As meninas amam suas bonecas.", "As menina amam suas boneca.", "A meninas amam suas bonecas.", "As meninas ama suas bonecas."],
      correctIndex: 0,
      explanation: "O plural de 'menina' é 'meninas', de 'boneca' é 'bonecas'. O verbo 'amar' no plural fica 'amam'.",
      wrongExplanations: { 1: "'Menina' e 'boneca' precisam de -s no plural.", 2: "O artigo 'A' deve ser 'As' para plural feminino.", 3: "O verbo deve concordar: 'amam', não 'ama'." }
    },
    {
      id: "pl_007", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'voz'?",
      options: ["vozs", "vogais", "vozes", "vozins"],
      correctIndex: 2,
      explanation: "Palavras terminadas em -z fazem o plural com -es. 'Voz' → 'vozes'.",
      wrongExplanations: { 0: "Palavras em -z não recebem só -s.", 1: "'Vogais' é o plural de 'vogal', não de 'voz'.", 3: "'Vozins' não existe." }
    },
    {
      id: "pl_008", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o singular de 'cadeiras'?",
      options: ["cadeiro", "cadeirinha", "cadeira", "cadeirão"],
      correctIndex: 2,
      explanation: "'Cadeiras' é o plural de 'cadeira'. Retiramos o -s para voltar ao singular.",
      wrongExplanations: { 0: "'Cadeiro' não é o singular de 'cadeiras'.", 1: "'Cadeirinha' é o diminutivo, não o singular.", 3: "'Cadeirão' é o aumentativo." }
    },
    {
      id: "pl_009", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'chapéu'?",
      options: ["chapéus", "chapéues", "chapéis", "chapéuns"],
      correctIndex: 0,
      explanation: "A maioria das palavras terminadas em -u fazem o plural com -s. 'Chapéu' → 'chapéus'.",
      wrongExplanations: { 1: "'Chapéues' não é forma correta.", 2: "'Chapéis' seria para palavras em -el (papel → papéis).", 3: "'Chapéuns' não existe." }
    },
    {
      id: "pl_010", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'mão'?",
      options: ["mãos", "mães", "mões", "mãons"],
      correctIndex: 0,
      explanation: "O plural de 'mão' é 'mãos'. Esta palavra forma o plural com -ãos.",
      wrongExplanations: { 1: "'Mães' é o plural de 'mãe', não de 'mão'.", 2: "'Mões' não existe.", 3: "'Mãons' não existe." }
    },
    {
      id: "pl_011", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'coração'?",
      options: ["corações", "coraçãos", "coraçães", "coraçais"],
      correctIndex: 0,
      explanation: "Palavras terminadas em -ão geralmente fazem o plural com -ões. 'Coração' → 'corações'.",
      wrongExplanations: { 1: "'Coraçãos' não é a forma correta.", 2: "'Coraçães' não existe.", 3: "'Coraçais' não existe." }
    },
    {
      id: "pl_012", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o singular de 'girassóis'?",
      options: ["girassólei", "girassolinho", "girassol", "girassoles"],
      correctIndex: 2,
      explanation: "'Girassóis' é o plural de 'girassol'. Palavras em -l fazem plural com -is.",
      wrongExplanations: { 0: "'Girassólei' não existe.", 1: "'Girassolinho' é o diminutivo.", 3: "'Girassoles' não existe em português." }
    },
    {
      id: "pl_013", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'papel'?",
      options: ["papéis", "papeles", "papels", "papelins"],
      correctIndex: 0,
      explanation: "'Papel' → 'papéis'. Palavras terminadas em -el fazem o plural com -éis.",
      wrongExplanations: { 1: "'Papeles' seria em espanhol.", 2: "Palavras em -l não recebem só -s.", 3: "'Papelins' não existe." }
    },
    {
      id: "pl_014", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'mar'?",
      options: ["mars", "mares", "maris", "marens"],
      correctIndex: 1,
      explanation: "'Mar' → 'mares'. Palavras terminadas em -r fazem o plural com -es.",
      wrongExplanations: { 0: "Palavras em -r não recebem só -s.", 2: "'Maris' não existe.", 3: "'Marens' não existe." }
    },
    {
      id: "pl_015", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual palavra está no plural?",
      options: ["menino", "casas", "lua", "livro"],
      correctIndex: 1,
      explanation: "'Casas' está no plural (casa + s). As outras palavras estão no singular.",
      wrongExplanations: { 0: "'Menino' está no singular.", 2: "'Lua' está no singular.", 3: "'Livro' está no singular." }
    },
    {
      id: "pl_016", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'limão'?",
      options: ["limãos", "limões", "limães", "limãons"],
      correctIndex: 1,
      explanation: "'Limão' → 'limões'. Esta palavra faz o plural com -ões.",
      wrongExplanations: { 0: "'Limãos' não é o plural correto.", 2: "'Limães' seria para outras palavras em -ão.", 3: "'Limãons' não existe." }
    },
    {
      id: "pl_017", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual frase tem o substantivo no singular?",
      options: ["As flores são bonitas.", "O cachorro late.", "Os gatos dormem.", "As crianças brincam."],
      correctIndex: 1,
      explanation: "Em 'O cachorro late', 'cachorro' está no singular. Nas outras frases os substantivos estão no plural.",
      wrongExplanations: { 0: "'Flores' está no plural.", 2: "'Gatos' está no plural.", 3: "'Crianças' está no plural." }
    },
    {
      id: "pl_018", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'pé'?",
      options: ["pés", "peis", "pes", "péis"],
      correctIndex: 0,
      explanation: "'Pé' → 'pés'. Palavras terminadas em vogal acentuada recebem -s.",
      wrongExplanations: { 1: "'Peis' não é o plural de 'pé'.", 2: "'Pes' perde o acento — forma errada.", 3: "'Péis' seria para palavras em -el." }
    },
    {
      id: "pl_019", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'nuvem'?",
      options: ["nuvems", "nuvenes", "nuvens", "nuvenis"],
      correctIndex: 2,
      explanation: "Palavras terminadas em -m fazem o plural com -ns. 'Nuvem' → 'nuvens'.",
      wrongExplanations: { 0: "Palavras em -m não recebem só -s.", 1: "'Nuvenes' não existe.", 3: "'Nuvenis' não existe." }
    },
    {
      id: "pl_020", subject: "portugues", topic: "singular_plural",
      topicName: "Singular e Plural",
      question: "Qual é o plural de 'azul'?",
      options: ["azuls", "azules", "azuis", "azuleis"],
      correctIndex: 2,
      explanation: "'Azul' → 'azuis'. Palavras terminadas em -l fazem o plural com -is.",
      wrongExplanations: { 0: "Palavras em -l não recebem só -s.", 1: "'Azules' seria em espanhol.", 3: "'Azuleis' não existe." }
    },

    // ─── USO DE D/T — MAIÚSCULAS E MINÚSCULAS ─────────────────────────────────
    {
      id: "dt_001", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Como devemos escrever 'domingo' no meio de uma frase?",
      options: ["Domingo", "DOMINGO", "domingo", "DoMiNgO"],
      correctIndex: 2,
      explanation: "Em português, os dias da semana são escritos com letra minúscula no meio da frase.",
      wrongExplanations: { 0: "'Domingo' com D maiúsculo só se estiver no início da frase.", 1: "Nunca escrevemos um dia inteiro em maiúsculas.", 3: "Isso não é regra ortográfica." }
    },
    {
      id: "dt_002", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Qual palavra começa com D maiúsculo por ser substantivo próprio?",
      options: ["dente", "dado", "Daniela", "domingo"],
      correctIndex: 2,
      explanation: "'Daniela' é um nome de pessoa (substantivo próprio) e deve ser escrito com D maiúsculo.",
      wrongExplanations: { 0: "'Dente' é substantivo comum — d minúsculo.", 1: "'Dado' é substantivo comum — d minúsculo.", 3: "'Domingo' é dia da semana — escrito em minúsculo no meio da frase." }
    },
    {
      id: "dt_003", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Como se escreve corretamente: 'hoje é terça-feira'?",
      options: ["Hoje é Terça-feira.", "hoje é terça-feira.", "Hoje é terça-feira.", "hoje é Terça-feira."],
      correctIndex: 2,
      explanation: "'Hoje' começa a frase (maiúsculo). 'Terça-feira' fica em minúsculo — dias da semana são minúsculos em português.",
      wrongExplanations: { 0: "'Terça-feira' não precisa de T maiúsculo no meio da frase.", 1: "O início de frase exige maiúscula: 'Hoje'.", 3: "'Terça-feira' não precisa de maiúscula no meio da frase." }
    },
    {
      id: "dt_004", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Qual frase está escrita corretamente?",
      options: ["ontem foi Domingo.", "Ontem foi domingo.", "Ontem foi Domingo.", "ontem foi domingo."],
      correctIndex: 1,
      explanation: "A frase começa com 'Ontem' (maiúsculo). 'Domingo' fica em minúsculo por ser dia da semana no meio do texto.",
      wrongExplanations: { 0: "A frase deve começar com maiúscula.", 2: "'Domingo' não precisa de D maiúsculo no meio da frase.", 3: "O início de frase exige letra maiúscula." }
    },
    {
      id: "dt_005", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "A palavra 'tia' deve ser escrita com T maiúsculo:",
      options: ["sempre", "no início de frase apenas", "quando a tia for famosa", "apenas no inverno"],
      correctIndex: 1,
      explanation: "'Tia' é substantivo comum, escrita com t minúsculo, exceto quando inicia uma frase.",
      wrongExplanations: { 0: "Só palavras no início da frase ou nomes próprios usam maiúscula.", 2: "A fama não muda a regra ortográfica.", 3: "A estação do ano não muda a regra ortográfica." }
    },
    {
      id: "dt_006", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Qual dessas palavras é escrita com T maiúsculo?",
      options: ["tarde", "terça", "Taubaté", "trabalho"],
      correctIndex: 2,
      explanation: "'Taubaté' é nome de cidade (substantivo próprio) e começa com T maiúsculo.",
      wrongExplanations: { 0: "'Tarde' é substantivo comum — t minúsculo.", 1: "'Terça' é dia da semana — t minúsculo no meio da frase.", 3: "'Trabalho' é substantivo comum — t minúsculo." }
    },
    {
      id: "dt_007", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Quando devemos usar letra maiúscula no início de uma palavra?",
      options: ["Quando a palavra é bonita", "Quando começa com vogal", "Quando é nome próprio ou início de frase", "Quando a palavra é longa"],
      correctIndex: 2,
      explanation: "Usamos maiúscula em nomes próprios (pessoas, lugares) e na primeira palavra de cada frase.",
      wrongExplanations: { 0: "A beleza da palavra não é critério ortográfico.", 1: "Vogais não determinam o uso de maiúsculas.", 3: "O tamanho da palavra não define o uso de maiúsculas." }
    },
    {
      id: "dt_008", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "'domingo é dia de descanso.' Como escrever corretamente?",
      options: ["Domingo é dia de Descanso.", "domingo é dia de descanso.", "Domingo é dia de descanso.", "DOMINGO é dia de descanso."],
      correctIndex: 2,
      explanation: "'Domingo' com maiúsculo inicia a frase. 'Dia' e 'descanso' ficam em minúsculo.",
      wrongExplanations: { 0: "'Descanso' não é nome próprio — não precisa de maiúscula.", 1: "O início da frase exige maiúscula.", 3: "Nunca escrevemos a palavra inteira em maiúsculas na frase normal." }
    },
    {
      id: "dt_009", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "'tenho uma tia que se chama teresa.' Forma correta:",
      options: ["Tenho uma tia que se chama teresa.", "Tenho uma Tia que se chama Teresa.", "Tenho uma tia que se chama Teresa.", "tenho uma tia que se chama Teresa."],
      correctIndex: 2,
      explanation: "'Tenho' inicia a frase (maiúsculo). 'Tia' é substantivo comum (minúsculo). 'Teresa' é nome próprio (maiúsculo).",
      wrongExplanations: { 0: "'Teresa' é nome próprio e deve ter T maiúsculo.", 1: "'Tia' não é nome próprio — t minúsculo.", 3: "A frase deve começar com maiúscula: 'Tenho'." }
    },
    {
      id: "dt_010", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "A palavra 'terremoto' deve ser escrita com T maiúsculo:",
      options: ["Sempre", "Só no início de frase", "Quando é grande", "Nunca"],
      correctIndex: 1,
      explanation: "'Terremoto' é substantivo comum, escrito com t minúsculo, exceto no início de uma frase.",
      wrongExplanations: { 0: "Substantivos comuns não levam maiúscula sempre.", 2: "O tamanho do terremoto não muda a ortografia.", 3: "No início de frase qualquer palavra começa com maiúscula." }
    },
    {
      id: "dt_011", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Após um ponto final, a próxima palavra começa com:",
      options: ["Letra minúscula", "Letra maiúscula", "Letra sublinhada", "Qualquer letra"],
      correctIndex: 1,
      explanation: "Após ponto final, a primeira palavra da nova frase deve começar com letra maiúscula.",
      wrongExplanations: { 0: "Depois de ponto final sempre usamos maiúscula.", 2: "Sublinhado não é regra após ponto final.", 3: "Há uma regra: sempre maiúscula após ponto final." }
    },
    {
      id: "dt_012", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Qual destas palavras usa D maiúsculo sempre?",
      options: ["dente", "dado", "Diego", "domingo"],
      correctIndex: 2,
      explanation: "'Diego' é nome de pessoa — substantivo próprio — e sempre usa D maiúsculo.",
      wrongExplanations: { 0: "'Dente' é substantivo comum — d minúsculo.", 1: "'Dado' é substantivo comum — d minúsculo.", 3: "'Domingo' é dia da semana — d minúsculo no meio da frase." }
    },
    {
      id: "dt_013", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Qual regra se aplica aos dias da semana em português?",
      options: ["Sempre maiúsculos", "Sempre minúsculos (exceto início de frase)", "Maiúsculos só nos feriados", "Maiúsculos só quando escritos por extenso"],
      correctIndex: 1,
      explanation: "Em português, os dias da semana são escritos com minúscula, exceto quando iniciam uma frase.",
      wrongExplanations: { 0: "Em português os dias não são sempre maiúsculos (diferente do inglês).", 2: "Feriado não muda a ortografia.", 3: "Escrever por extenso não muda a regra." }
    },
    {
      id: "dt_014", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Em 'Thiago foi a Teresópolis', quantas palavras têm T maiúsculo?",
      options: ["Nenhuma", "Uma", "Duas", "Três"],
      correctIndex: 2,
      explanation: "'Thiago' (nome de pessoa) e 'Teresópolis' (nome de cidade) têm T maiúsculo por serem substantivos próprios.",
      wrongExplanations: { 0: "Há dois T maiúsculos.", 1: "São dois: Thiago e Teresópolis.", 3: "São apenas dois." }
    },
    {
      id: "dt_015", subject: "portugues", topic: "maiusculas_dt",
      topicName: "Maiúsculas e Minúsculas: D e T",
      question: "Qual dessas frases está CORRETA?",
      options: ["Ela nasceu numa terça-Feira.", "ela nasceu numa terça-feira.", "Ela nasceu numa Terça-feira.", "Ela nasceu numa terça-feira."],
      correctIndex: 3,
      explanation: "'Ela' inicia a frase (maiúsculo). 'Terça-feira' é dia da semana e fica em minúsculo.",
      wrongExplanations: { 0: "'Feira' não precisa de F maiúsculo.", 1: "A frase deve começar com maiúscula.", 2: "'Terça-feira' não precisa de T maiúsculo no meio da frase." }
    },

    // ─── GRAU DOS SUBSTANTIVOS ─────────────────────────────────────────────────
    {
      id: "gr_001", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o diminutivo de 'casa'?",
      options: ["casarão", "casinha", "casona", "casaço"],
      correctIndex: 1,
      explanation: "O diminutivo de 'casa' é 'casinha'. O sufixo -inha indica que é pequena.",
      wrongExplanations: { 0: "'Casarão' é o aumentativo — uma casa muito grande.", 2: "'Casona' também é aumentativo.", 3: "'Casaço' não é forma padrão." }
    },
    {
      id: "gr_002", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o aumentativo de 'gato'?",
      options: ["gatinho", "gatazinha", "gatão", "gatinzinho"],
      correctIndex: 2,
      explanation: "O aumentativo de 'gato' é 'gatão'. O sufixo -ão indica um gato grande.",
      wrongExplanations: { 0: "'Gatinho' é o diminutivo — um gato pequeno.", 1: "'Gatazinha' é diminutivo feminino.", 3: "'Gatinzinho' é diminutivo duplo." }
    },
    {
      id: "gr_003", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "A palavra 'livrinho' é o _____ de 'livro':",
      options: ["Aumentativo", "Plural", "Singular", "Diminutivo"],
      correctIndex: 3,
      explanation: "'Livrinho' é o diminutivo de 'livro'. O sufixo -inho indica que é pequeno.",
      wrongExplanations: { 0: "O aumentativo seria 'livrão'.", 1: "Plural seria 'livros'.", 2: "'Livro' já é o singular." }
    },
    {
      id: "gr_004", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o diminutivo de 'pão'?",
      options: ["pãozão", "pãozito", "pãozinho", "pãosito"],
      correctIndex: 2,
      explanation: "O diminutivo de 'pão' é 'pãozinho'. Para palavras terminadas em -ão, usamos o sufixo -zinho.",
      wrongExplanations: { 0: "'Pãozão' seria um pão grande — aumentativo.", 1: "'Pãozito' não existe.", 3: "'Pãosito' não existe." }
    },
    {
      id: "gr_005", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "A palavra 'casarão' indica uma casa:",
      options: ["Pequena", "Bonita", "Grande", "Velha"],
      correctIndex: 2,
      explanation: "'Casarão' é o aumentativo de 'casa', indicando uma casa muito grande.",
      wrongExplanations: { 0: "Para pequena usaríamos 'casinha'.", 1: "O grau não indica beleza.", 3: "O grau não indica a idade da casa." }
    },
    {
      id: "gr_006", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o diminutivo de 'avó'?",
      options: ["avozão", "avozinha", "avonha", "avólinha"],
      correctIndex: 1,
      explanation: "O diminutivo de 'avó' é 'avozinha'. Usamos -zinha quando a palavra termina em vogal tônica.",
      wrongExplanations: { 0: "'Avozão' seria aumentativo.", 2: "'Avonha' não existe.", 3: "'Avólinha' não existe." }
    },
    {
      id: "gr_007", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "A palavra 'mesinha' é:",
      options: ["O plural de mesa", "O aumentativo de mesa", "O diminutivo de mesa", "Um nome próprio"],
      correctIndex: 2,
      explanation: "'Mesinha' é o diminutivo de 'mesa'. O sufixo -inha indica algo pequeno.",
      wrongExplanations: { 0: "Plural de mesa é 'mesas'.", 1: "Aumentativo seria 'mesona' ou 'mesão'.", 3: "Nomes próprios são de pessoas e lugares." }
    },
    {
      id: "gr_008", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o aumentativo de 'bola'?",
      options: ["bolinha", "bolazinha", "bolão", "boliça"],
      correctIndex: 2,
      explanation: "O aumentativo de 'bola' é 'bolão'. O sufixo -ão indica uma bola grande.",
      wrongExplanations: { 0: "'Bolinha' é o diminutivo — uma bola pequena.", 1: "'Bolazinha' é diminutivo.", 3: "'Boliça' não existe." }
    },
    {
      id: "gr_009", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "A palavra 'cafezinho' é o diminutivo de:",
      options: ["caf", "café", "cafera", "cafeira"],
      correctIndex: 1,
      explanation: "'Cafezinho' é o diminutivo de 'café'. Quando a palavra termina em vogal acentuada, usamos -zinho.",
      wrongExplanations: { 0: "'Caf' não é uma palavra.", 2: "'Cafera' não existe.", 3: "'Cafeira' não é a palavra base." }
    },
    {
      id: "gr_010", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual dessas palavras é um aumentativo?",
      options: ["gatinho", "livrinho", "bolão", "casinha"],
      correctIndex: 2,
      explanation: "'Bolão' é o aumentativo de 'bola' (-ão = grande). As outras palavras são diminutivos (-inho/-inha = pequeno).",
      wrongExplanations: { 0: "'Gatinho' é diminutivo de gato.", 1: "'Livrinho' é diminutivo de livro.", 3: "'Casinha' é diminutivo de casa." }
    },
    {
      id: "gr_011", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o diminutivo de 'flor'?",
      options: ["florão", "florzão", "florzinha", "florona"],
      correctIndex: 2,
      explanation: "O diminutivo de 'flor' é 'florzinha'. Quando a palavra termina em consoante, usamos -zinha.",
      wrongExplanations: { 0: "'Florão' é aumentativo.", 1: "'Florzão' seria aumentativo.", 3: "'Florona' é aumentativo." }
    },
    {
      id: "gr_012", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o diminutivo de 'sol'?",
      options: ["solão", "solzinho", "solaço", "solarão"],
      correctIndex: 1,
      explanation: "O diminutivo de 'sol' é 'solzinho', indicando um sol fraquinho.",
      wrongExplanations: { 0: "'Solão' seria um sol muito forte — aumentativo.", 2: "'Solaço' não é o diminutivo.", 3: "'Solarão' não é o diminutivo." }
    },
    {
      id: "gr_013", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o aumentativo de 'nariz'?",
      options: ["narizinho", "narizão", "narizuto", "narizeco"],
      correctIndex: 1,
      explanation: "O aumentativo de 'nariz' é 'narizão', indicando um nariz muito grande.",
      wrongExplanations: { 0: "'Narizinho' é o diminutivo.", 2: "'Narizuto' não existe.", 3: "'Narizeco' não existe." }
    },
    {
      id: "gr_014", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o diminutivo de 'cidade'?",
      options: ["cidadão", "cidadona", "cidadezinha", "cidadeção"],
      correctIndex: 2,
      explanation: "O diminutivo de 'cidade' é 'cidadezinha', indicando uma cidade pequena.",
      wrongExplanations: { 0: "'Cidadão' é uma palavra diferente (habitante da cidade).", 1: "'Cidadona' não é diminutivo.", 3: "'Cidadeção' não existe." }
    },
    {
      id: "gr_015", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o diminutivo de 'cachorro'?",
      options: ["cachorraço", "cachorrão", "cachorrinho", "cachorronaço"],
      correctIndex: 2,
      explanation: "O diminutivo de 'cachorro' é 'cachorrinho'. O sufixo -inho indica um cachorro pequeno.",
      wrongExplanations: { 0: "'Cachorraço' é aumentativo — cachorro grande.", 1: "'Cachorrão' é aumentativo.", 3: "'Cachorronaço' não é forma padrão." }
    },
    {
      id: "gr_016", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o aumentativo de 'chuva'?",
      options: ["chuvinha", "chuvazinha", "chuvaço", "chuvazinho"],
      correctIndex: 2,
      explanation: "O aumentativo de 'chuva' é 'chuvaço', indicando uma chuva muito forte.",
      wrongExplanations: { 0: "'Chuvinha' é o diminutivo — chuva fraquinha.", 1: "'Chuvazinha' é diminutivo.", 3: "'Chuvazinho' é diminutivo." }
    },
    {
      id: "gr_017", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "O sufixo -inho/-inha indica:",
      options: ["Um objeto grande", "Um objeto pequeno", "Um objeto colorido", "Um objeto velho"],
      correctIndex: 1,
      explanation: "O sufixo -inho/-inha forma o diminutivo, indicando que algo é pequeno ou querido.",
      wrongExplanations: { 0: "Para grande usamos -ão/-ona.", 2: "O grau não indica cor.", 3: "O grau não indica idade do objeto." }
    },
    {
      id: "gr_018", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "O sufixo -ão indica:",
      options: ["Algo pequeno", "Algo grande", "Algo rápido", "Algo antigo"],
      correctIndex: 1,
      explanation: "O sufixo -ão forma o aumentativo, indicando que algo é grande ou intenso.",
      wrongExplanations: { 0: "Para pequeno usamos -inho/-inha.", 2: "O grau não indica velocidade.", 3: "O grau não indica a época." }
    },
    {
      id: "gr_019", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual é o diminutivo de 'coração'?",
      options: ["coraçãozão", "coraçãozinho", "coraçãoto", "coraçãolim"],
      correctIndex: 1,
      explanation: "O diminutivo de 'coração' é 'coraçãozinho', indicando algo pequeno e querido.",
      wrongExplanations: { 0: "'Coraçãozão' seria aumentativo do diminutivo.", 2: "'Coraçãoto' não existe.", 3: "'Coraçãolim' não existe." }
    },
    {
      id: "gr_020", subject: "portugues", topic: "grau",
      topicName: "Grau dos Substantivos: Diminutivo e Aumentativo",
      question: "Qual frase usa o diminutivo corretamente?",
      options: ["O gatão era muito pequeninho.", "A casarão era linda.", "A borboletinha voava suavemente.", "O livrão tinha páginas minúsculas."],
      correctIndex: 2,
      explanation: "'Borboletinha' é o diminutivo de 'borboleta' — faz sentido dizer que uma borboletinha voava suavemente.",
      wrongExplanations: { 0: "'Gatão' é aumentativo — contradiz 'pequeninho'.", 1: "'Casarão' é aumentativo — não se combina com contexto de diminutivo.", 3: "'Livrão' é aumentativo — contradiz 'minúsculas'." }
    },

    // ─── SUBSTANTIVOS DERIVADOS ────────────────────────────────────────────────
    {
      id: "der_001", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "A palavra 'florista' vem de qual palavra?",
      options: ["florzinha", "floresta", "flor", "flora"],
      correctIndex: 2,
      explanation: "'Florista' é derivado de 'flor' com o sufixo -ista (pessoa que trabalha com flores).",
      wrongExplanations: { 0: "'Florzinha' é o diminutivo.", 1: "'Floresta' é outra palavra.", 3: "'Flora' tem outra origem." }
    },
    {
      id: "der_002", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "A palavra 'padaria' é derivada de:",
      options: ["pada", "pato", "pão", "padre"],
      correctIndex: 2,
      explanation: "'Padaria' é derivada de 'pão' (pão → padeiro → padaria). O sufixo -aria indica um lugar.",
      wrongExplanations: { 0: "'Pada' não é uma palavra.", 1: "'Pato' é um animal — sem relação.", 3: "'Padre' tem outra origem." }
    },
    {
      id: "der_003", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "Qual sufixo forma 'leiteiro' a partir de 'leite'?",
      options: ["-eiro", "-inho", "-ão", "-ista"],
      correctIndex: 0,
      explanation: "Leite + -eiro = leiteiro. O sufixo -eiro indica a pessoa que vende ou trabalha com algo.",
      wrongExplanations: { 1: "-inho forma diminutivo: 'leitinho'.", 2: "-ão forma aumentativo: 'leitão' (mas é outro sentido).", 3: "-ista forma 'leitista' — que não é palavra comum." }
    },
    {
      id: "der_004", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "A palavra 'sapateiro' é derivada de:",
      options: ["sapa", "sapinho", "sapato", "sapo"],
      correctIndex: 2,
      explanation: "'Sapateiro' vem de 'sapato' + -eiro. É a pessoa que faz ou conserta sapatos.",
      wrongExplanations: { 0: "'Sapa' não é uma palavra comum.", 1: "'Sapinho' é diminutivo de sapo.", 3: "'Sapo' é um animal — outra palavra." }
    },
    {
      id: "der_005", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "Qual sufixo indica um lugar onde se vende ou faz algo?",
      options: ["-inho", "-eiro", "-aria", "-ão"],
      correctIndex: 2,
      explanation: "O sufixo -aria indica um lugar: padaria (pão), livraria (livros), pizzaria, sorveteria (variante).",
      wrongExplanations: { 0: "-inho forma diminutivos.", 1: "-eiro indica a pessoa que faz algo.", 3: "-ão forma aumentativos." }
    },
    {
      id: "der_006", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "A palavra 'dentista' vem de:",
      options: ["dente", "dentes", "dentão", "denteira"],
      correctIndex: 0,
      explanation: "'Dentista' é derivada de 'dente' + -ista. O sufixo -ista indica uma profissão.",
      wrongExplanations: { 1: "'Dentes' é o plural — não forma diretamente 'dentista'.", 2: "'Dentão' é aumentativo.", 3: "'Denteira' é um objeto — não é a palavra base." }
    },
    {
      id: "der_007", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "Qual das palavras é derivada de 'livro'?",
      options: ["livrete", "livraria", "livrento", "livraca"],
      correctIndex: 1,
      explanation: "'Livraria' é derivada de 'livro' + -aria. É o lugar onde se vendem livros.",
      wrongExplanations: { 0: "'Livrete' existe mas é pouco usual.", 2: "'Livrento' não existe.", 3: "'Livraca' não existe." }
    },
    {
      id: "der_008", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "A palavra 'felicidade' vem de:",
      options: ["felino", "feliz", "feli", "felicito"],
      correctIndex: 1,
      explanation: "'Felicidade' é derivada de 'feliz' com o sufixo -dade, que indica uma qualidade.",
      wrongExplanations: { 0: "'Felino' é relativo a gatos.", 2: "'Feli' não é uma palavra.", 3: "'Felicito' é um verbo." }
    },
    {
      id: "der_009", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "Qual sufixo forma 'bondade', 'lealdade' e 'amizade'?",
      options: ["-ão", "-eiro", "-dade", "-inho"],
      correctIndex: 2,
      explanation: "O sufixo -dade indica qualidades ou estados. 'Bondade' (bom), 'lealdade' (leal), 'amizade' (amigo).",
      wrongExplanations: { 0: "-ão forma aumentativos.", 1: "-eiro indica profissão ou lugar.", 3: "-inho forma diminutivos." }
    },
    {
      id: "der_010", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "A palavra 'pescador' é derivada de:",
      options: ["peixe", "pescar", "pesca", "pescado"],
      correctIndex: 1,
      explanation: "'Pescador' vem de 'pescar' + -dor. O sufixo -dor indica a pessoa que pratica a ação.",
      wrongExplanations: { 0: "'Peixe' é o animal — 'pescador' vem do verbo pescar.", 2: "'Pesca' é o substantivo da ação.", 3: "'Pescado' é o peixe capturado." }
    },
    {
      id: "der_011", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "A palavra 'infeliz' é formada por:",
      options: ["prefixo in- + feliz", "feliz + sufixo -in", "inha + feliz", "É uma palavra simples"],
      correctIndex: 0,
      explanation: "'Infeliz' = prefixo 'in-' + 'feliz'. O prefixo 'in-' indica negação: infeliz = não feliz.",
      wrongExplanations: { 1: "O 'in-' vem antes da palavra, é prefixo e não sufixo.", 2: "'Inha' seria diminutivo.", 3: "'Infeliz' é uma palavra derivada por prefixação." }
    },
    {
      id: "der_012", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "Qual palavra é derivada de 'açúcar' com o sufixo -eira?",
      options: ["açucarado", "açucareira", "açúcares", "açucarão"],
      correctIndex: 1,
      explanation: "'Açucareira' = açúcar + -eira. É o recipiente onde se guarda o açúcar.",
      wrongExplanations: { 0: "'Açucarado' usa o sufixo -ado (adjetivo).", 2: "'Açúcares' é o plural.", 3: "'Açucarão' não é forma padrão." }
    },
    {
      id: "der_013", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "Qual sufixo indica a pessoa que faz ou vende algo?",
      options: ["-inha", "-eiro/-eira", "-ão", "-zinho"],
      correctIndex: 1,
      explanation: "O sufixo -eiro/-eira indica profissão: padeiro (vende pão), leiteiro (entrega leite), sapateiro.",
      wrongExplanations: { 0: "-inha forma diminutivos femininos.", 2: "-ão forma aumentativos.", 3: "-zinho forma diminutivos." }
    },
    {
      id: "der_014", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "A palavra 'livraria' tem o sufixo -aria que indica:",
      options: ["Uma pessoa", "Um lugar", "Uma qualidade", "Um objeto pequeno"],
      correctIndex: 1,
      explanation: "O sufixo -aria indica um lugar ou estabelecimento: livraria, padaria, pizzaria.",
      wrongExplanations: { 0: "Para pessoa usamos -eiro (livreiro).", 2: "Para qualidade usamos -dade.", 3: "Para objeto pequeno usamos -inho." }
    },
    {
      id: "der_015", subject: "portugues", topic: "derivados",
      topicName: "Substantivos Derivados",
      question: "De qual palavra vem 'professor'?",
      options: ["profeta", "profissão", "professar", "proferir"],
      correctIndex: 2,
      explanation: "'Professor' deriva do verbo 'professar' (ensinar, declarar). O sufixo -or indica quem realiza a ação.",
      wrongExplanations: { 0: "'Profeta' é outra palavra.", 1: "'Profissão' tem relação mas não é a palavra base direta.", 3: "'Proferir' é outro verbo." }
    },

    // ─── MAIÚSCULAS C/c E G/g ──────────────────────────────────────────────────
    {
      id: "cg_001", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Como devemos escrever 'carlos' quando é nome de pessoa?",
      options: ["carlos", "CARLOS", "Carlos", "cArlos"],
      correctIndex: 2,
      explanation: "'Carlos' é nome próprio (nome de pessoa) e começa com C maiúsculo.",
      wrongExplanations: { 0: "Nomes próprios não são escritos com minúscula.", 1: "Só a primeira letra é maiúscula, não todas.", 3: "Alternância de maiúsculas e minúsculas não é regra ortográfica." }
    },
    {
      id: "cg_002", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Qual das palavras abaixo precisa de C maiúsculo?",
      options: ["casa", "cebola", "Curitiba", "cachorro"],
      correctIndex: 2,
      explanation: "'Curitiba' é nome de cidade (substantivo próprio) e começa com C maiúsculo.",
      wrongExplanations: { 0: "'Casa' é substantivo comum — c minúsculo.", 1: "'Cebola' é substantivo comum — c minúsculo.", 3: "'Cachorro' é substantivo comum — c minúsculo." }
    },
    {
      id: "cg_003", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "A palavra 'Goiás' começa com G maiúsculo porque:",
      options: ["É uma palavra grande", "É o nome de um estado", "Começa com vogal", "Está sempre no início"],
      correctIndex: 1,
      explanation: "'Goiás' é nome de um estado brasileiro — substantivo próprio — e usa G maiúsculo.",
      wrongExplanations: { 0: "O tamanho da palavra não define o uso de maiúsculas.", 2: "O G não é uma vogal.", 3: "'Goiás' usa maiúsculo em qualquer posição por ser nome próprio." }
    },
    {
      id: "cg_004", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Qual frase está escrita corretamente?",
      options: ["a Capital do brasil é brasília.", "A capital do Brasil é Brasília.", "A Capital Do Brasil É Brasília.", "a capital do Brasil é Brasília."],
      correctIndex: 1,
      explanation: "'A' inicia a frase (maiúsculo). 'Capital' é substantivo comum (minúsculo). 'Brasil' e 'Brasília' são nomes próprios (maiúsculos).",
      wrongExplanations: { 0: "A frase deve começar com maiúscula.", 2: "Só nomes próprios e início de frase usam maiúscula.", 3: "A frase deve começar com maiúscula." }
    },
    {
      id: "cg_005", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Qual dessas palavras tem G maiúsculo?",
      options: ["gota", "gorila", "Gabriela", "galho"],
      correctIndex: 2,
      explanation: "'Gabriela' é nome de pessoa (substantivo próprio) e usa G maiúsculo.",
      wrongExplanations: { 0: "'Gota' é substantivo comum — g minúsculo.", 1: "'Gorila' é substantivo comum — g minúsculo.", 3: "'Galho' é substantivo comum — g minúsculo." }
    },
    {
      id: "cg_006", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Quando devemos usar G maiúsculo?",
      options: ["Quando o animal é grande", "Quando é substantivo próprio ou início de frase", "Quando a palavra tem mais de 5 letras", "Sempre que a palavra for bonita"],
      correctIndex: 1,
      explanation: "Usamos G maiúsculo em substantivos próprios (Gabriela, Goiás) e no início de frases.",
      wrongExplanations: { 0: "O tamanho do animal não determina a ortografia.", 2: "O número de letras não é critério.", 3: "A beleza da palavra não é critério ortográfico." }
    },
    {
      id: "cg_007", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "'meu gato se chama ginger.' Forma correta:",
      options: ["Meu gato se chama ginger.", "Meu gato se chama Ginger.", "meu Gato se chama Ginger.", "Meu Gato se chama ginger."],
      correctIndex: 1,
      explanation: "'Meu' inicia a frase (maiúsculo). 'Gato' é substantivo comum (minúsculo). 'Ginger' é nome do gato (maiúsculo).",
      wrongExplanations: { 0: "'Ginger' é nome próprio — precisa de maiúscula.", 2: "'Gato' é substantivo comum — não precisa de maiúscula.", 3: "'Gato' não precisa de G maiúsculo." }
    },
    {
      id: "cg_008", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Os nomes de países começam com letra:",
      options: ["Minúscula", "Maiúscula", "Sublinhada", "Em itálico"],
      correctIndex: 1,
      explanation: "Nomes de países são substantivos próprios e sempre começam com letra maiúscula: Brasil, China, França.",
      wrongExplanations: { 0: "Nomes de países nunca são com minúscula inicial.", 2: "Sublinhado não é regra ortográfica para países.", 3: "Itálico não é regra ortográfica para países." }
    },
    {
      id: "cg_009", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "'carolina foi à cidade de campinas.' Como reescrever corretamente?",
      options: ["Carolina foi à cidade de Campinas.", "Carolina foi à Cidade de Campinas.", "carolina foi à cidade de Campinas.", "Carolina Foi À Cidade De Campinas."],
      correctIndex: 0,
      explanation: "'Carolina' (nome próprio) e 'Campinas' (nome de cidade) têm maiúsculas. 'Cidade' é substantivo comum — minúsculo.",
      wrongExplanations: { 1: "'Cidade' é substantivo comum — não precisa de maiúscula.", 2: "'Carolina' é nome próprio — precisa de maiúscula.", 3: "Só nomes próprios e início de frase levam maiúsculas." }
    },
    {
      id: "cg_010", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Qual palavra deve ser sempre escrita com G maiúsculo?",
      options: ["galinha", "geada", "Gustavo", "garota"],
      correctIndex: 2,
      explanation: "'Gustavo' é nome de pessoa (substantivo próprio) — sempre escrito com G maiúsculo.",
      wrongExplanations: { 0: "'Galinha' é substantivo comum — g minúsculo.", 1: "'Geada' é substantivo comum — g minúsculo.", 3: "'Garota' é substantivo comum — g minúsculo." }
    },
    {
      id: "cg_011", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "A palavra 'camisa' deve ser escrita com C maiúsculo:",
      options: ["Sempre", "Só no início de frase", "No verão", "Só no plural"],
      correctIndex: 1,
      explanation: "'Camisa' é substantivo comum e usa c minúsculo, exceto quando inicia uma frase.",
      wrongExplanations: { 0: "Substantivos comuns não levam maiúscula sempre.", 2: "A estação do ano não muda a ortografia.", 3: "O plural não muda a regra de maiúsculas." }
    },
    {
      id: "cg_012", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Qual dessas cidades tem nome que começa com C maiúsculo?",
      options: ["são paulo", "curitiba", "Campinas", "belo horizonte"],
      correctIndex: 2,
      explanation: "'Campinas' é nome de cidade — escrito com C maiúsculo. As outras estão escritas incorretamente.",
      wrongExplanations: { 0: "'São Paulo' deveria ter S maiúsculo.", 1: "'Curitiba' deveria ter C maiúsculo.", 3: "'Belo Horizonte' deveria ter B maiúsculo." }
    },
    {
      id: "cg_013", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "A palavra 'geladeira' usa g minúsculo:",
      options: ["Só no verão", "Só quando está fria", "No meio da frase (é substantivo comum)", "Nunca"],
      correctIndex: 2,
      explanation: "'Geladeira' é substantivo comum — g minúsculo no meio da frase.",
      wrongExplanations: { 0: "A estação do ano não muda a ortografia.", 1: "A temperatura não muda a ortografia.", 3: "No início de frase qualquer palavra começa com maiúscula." }
    },
    {
      id: "cg_014", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Em 'Minha cidade favorita é Curitiba', qual palavra tem C maiúsculo?",
      options: ["cidade", "Curitiba", "As duas", "Nenhuma"],
      correctIndex: 1,
      explanation: "Só 'Curitiba' tem C maiúsculo por ser nome próprio de cidade. 'Cidade' é substantivo comum.",
      wrongExplanations: { 0: "'Cidade' é substantivo comum — c minúsculo.", 2: "Só 'Curitiba' leva C maiúsculo.", 3: "'Curitiba' leva C maiúsculo." }
    },
    {
      id: "cg_015", subject: "portugues", topic: "maiusculas_cg",
      topicName: "Maiúsculas e Minúsculas: C e G",
      question: "Qual frase mostra o uso correto de G maiúsculo e minúsculo?",
      options: ["o Garoto chama-se gabriel.", "O garoto chama-se Gabriel.", "O Garoto chama-se gabriel.", "o garoto chama-se Gabriel."],
      correctIndex: 1,
      explanation: "'O' inicia a frase (maiúsculo). 'Garoto' é substantivo comum (minúsculo). 'Gabriel' é nome próprio (maiúsculo).",
      wrongExplanations: { 0: "A frase deve começar com maiúscula.", 2: "'Garoto' não precisa de G maiúsculo.", 3: "A frase deve começar com maiúscula." }
    },

    // ─── SUBSTANTIVOS MASCULINO E FEMININO ────────────────────────────────────
    {
      id: "mf_001", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'gato'?",
      options: ["gatinha", "gatos", "gata", "gatão"],
      correctIndex: 2,
      explanation: "O feminino de 'gato' é 'gata'. Troca-se o -o pelo -a.",
      wrongExplanations: { 0: "'Gatinha' é o diminutivo feminino.", 1: "'Gatos' é o plural masculino.", 3: "'Gatão' é o aumentativo masculino." }
    },
    {
      id: "mf_002", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o masculino de 'professora'?",
      options: ["professorinho", "professorado", "professor", "professorão"],
      correctIndex: 2,
      explanation: "O masculino de 'professora' é 'professor'. Retira-se o -a do final.",
      wrongExplanations: { 0: "'Professorinho' é diminutivo.", 1: "'Professorado' é o conjunto de professores.", 3: "'Professorão' é aumentativo." }
    },
    {
      id: "mf_003", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'leão'?",
      options: ["leãona", "leoa", "leã", "leonina"],
      correctIndex: 1,
      explanation: "O feminino de 'leão' é 'leoa'. É uma forma irregular que devemos memorizar.",
      wrongExplanations: { 0: "'Leãona' não existe.", 2: "'Leã' não existe.", 3: "'Leonina' significa algo relacionado ao leão, mas não é o feminino direto." }
    },
    {
      id: "mf_004", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'rei'?",
      options: ["reia", "reis", "rainha", "reininha"],
      correctIndex: 2,
      explanation: "O feminino de 'rei' é 'rainha'. É uma forma completamente irregular.",
      wrongExplanations: { 0: "'Reia' não existe.", 1: "'Reis' é o plural masculino.", 3: "'Reininha' seria o diminutivo de rainha." }
    },
    {
      id: "mf_005", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o masculino de 'mãe'?",
      options: ["mãem", "macho", "pai", "mãeão"],
      correctIndex: 2,
      explanation: "O masculino de 'mãe' é 'pai'. São palavras completamente diferentes (formas irregulares).",
      wrongExplanations: { 0: "'Mãem' não existe.", 1: "'Macho' é um termo geral para animais.", 3: "'Mãeão' não existe." }
    },
    {
      id: "mf_006", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'aluno'?",
      options: ["alunoinha", "aluninha", "aluna", "alunoa"],
      correctIndex: 2,
      explanation: "O feminino de 'aluno' é 'aluna'. Troca-se o -o pelo -a.",
      wrongExplanations: { 0: "'Alunoinha' não existe.", 1: "'Aluninha' não é o feminino padrão.", 3: "'Alunoa' não existe." }
    },
    {
      id: "mf_007", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o masculino de 'vaca'?",
      options: ["vacão", "vacinho", "boi", "vacoa"],
      correctIndex: 2,
      explanation: "O masculino de 'vaca' é 'boi'. São palavras com raízes diferentes (forma irregular).",
      wrongExplanations: { 0: "'Vacão' seria aumentativo.", 1: "'Vacinho' seria diminutivo.", 3: "'Vacoa' não existe." }
    },
    {
      id: "mf_008", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "A palavra 'criança' é do gênero:",
      options: ["Masculino", "Feminino (sempre)", "Sem gênero", "Depende do nome"],
      correctIndex: 1,
      explanation: "'Criança' é sempre feminino gramaticalmente: 'a criança'. Mesmo que seja um menino, dizemos 'a criança'.",
      wrongExplanations: { 0: "Criança é sempre feminino gramaticalmente.", 2: "Todo substantivo em português tem gênero.", 3: "O gênero é fixo: sempre feminino." }
    },
    {
      id: "mf_009", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'doutor'?",
      options: ["doutorinha", "doutora", "doutoresa", "doutrix"],
      correctIndex: 1,
      explanation: "O feminino de 'doutor' é 'doutora'. Adiciona-se -a ao final.",
      wrongExplanations: { 0: "'Doutorinha' é diminutivo.", 2: "'Doutoresa' não existe.", 3: "'Doutrix' não existe." }
    },
    {
      id: "mf_010", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'herói'?",
      options: ["heroína", "heroí", "heroesa", "heroa"],
      correctIndex: 0,
      explanation: "O feminino de 'herói' é 'heroína'. É uma forma irregular.",
      wrongExplanations: { 1: "'Heroí' não existe.", 2: "'Heroesa' não existe.", 3: "'Heroa' não existe." }
    },
    {
      id: "mf_011", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o masculino de 'atriz'?",
      options: ["ator", "atrizão", "atrizinho", "atrim"],
      correctIndex: 0,
      explanation: "O masculino de 'atriz' é 'ator'. São formas irregulares com raízes diferentes.",
      wrongExplanations: { 1: "'Atrizão' seria aumentativo.", 2: "'Atrizinho' seria diminutivo.", 3: "'Atrim' não existe." }
    },
    {
      id: "mf_012", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "A palavra 'lápis' é do gênero:",
      options: ["Feminino", "Masculino", "Neutro", "Sem gênero"],
      correctIndex: 1,
      explanation: "'Lápis' é masculino: 'o lápis'. Dizemos 'o lápis azul'.",
      wrongExplanations: { 0: "Dizemos 'o lápis', não 'a lápis'.", 2: "Português não tem gênero neutro.", 3: "Todo substantivo tem gênero." }
    },
    {
      id: "mf_013", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'cavalo'?",
      options: ["cavala", "cavalinha", "égua", "cavaloa"],
      correctIndex: 2,
      explanation: "O feminino de 'cavalo' é 'égua'. É uma forma irregular com palavras completamente diferentes.",
      wrongExplanations: { 0: "'Cavala' é um tipo de peixe.", 1: "'Cavalinha' é o diminutivo.", 3: "'Cavaloa' não existe." }
    },
    {
      id: "mf_014", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'homem'?",
      options: ["homema", "homoa", "mulher", "humaninha"],
      correctIndex: 2,
      explanation: "O feminino de 'homem' é 'mulher'. São palavras totalmente diferentes (forma irregular).",
      wrongExplanations: { 0: "'Homema' não existe.", 1: "'Homoa' não existe.", 3: "'Humaninha' é diminutivo de humana." }
    },
    {
      id: "mf_015", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o masculino de 'rainha'?",
      options: ["rainhi", "reinão", "rei", "reinzinho"],
      correctIndex: 2,
      explanation: "O masculino de 'rainha' é 'rei'. São formas irregulares.",
      wrongExplanations: { 0: "'Rainhi' não existe.", 1: "'Reinão' seria aumentativo.", 3: "'Reinzinho' seria diminutivo." }
    },
    {
      id: "mf_016", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'cantor'?",
      options: ["cantorinha", "cantora", "cantriz", "cantoroa"],
      correctIndex: 1,
      explanation: "O feminino de 'cantor' é 'cantora'. Palavras em -or fazem o feminino com -ora.",
      wrongExplanations: { 0: "'Cantorinha' seria diminutivo.", 2: "'Cantriz' não é forma padrão.", 3: "'Cantoroa' não existe." }
    },
    {
      id: "mf_017", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o masculino de 'galinha'?",
      options: ["galinhoido", "galo", "galinhoão", "galinho"],
      correctIndex: 1,
      explanation: "O masculino de 'galinha' é 'galo'. São formas irregulares.",
      wrongExplanations: { 0: "'Galinhoido' não existe.", 2: "'Galinhoão' não existe.", 3: "'Galinho' seria um diminutivo inventado." }
    },
    {
      id: "mf_018", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o feminino de 'menino'?",
      options: ["meninoa", "menininha", "menina", "meninoinha"],
      correctIndex: 2,
      explanation: "O feminino de 'menino' é 'menina'. Troca-se o -o pelo -a.",
      wrongExplanations: { 0: "'Meninoa' não existe.", 1: "'Menininha' é diminutivo feminino.", 3: "'Meninoinha' não existe." }
    },
    {
      id: "mf_019", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual é o masculino de 'cadela'?",
      options: ["cadelão", "cachorro", "cadelinho", "cacho"],
      correctIndex: 1,
      explanation: "O masculino de 'cadela' é 'cachorro' (ou 'cão'). A cadela é a fêmea do cachorro.",
      wrongExplanations: { 0: "'Cadelão' seria aumentativo.", 2: "'Cadelinho' seria diminutivo.", 3: "'Cacho' é outra palavra (de cabelo ou de uva)." }
    },
    {
      id: "mf_020", subject: "portugues", topic: "genero",
      topicName: "Substantivos Masculino e Feminino",
      question: "Qual par está correto?",
      options: ["lobo / loba", "homem / homema", "rei / reia", "gato / gatoa"],
      correctIndex: 0,
      explanation: "O feminino de 'lobo' é 'loba'. Troca-se o -o pelo -a.",
      wrongExplanations: { 1: "O feminino de 'homem' é 'mulher', não 'homema'.", 2: "O feminino de 'rei' é 'rainha', não 'reia'.", 3: "O feminino de 'gato' é 'gata', não 'gatoa'." }
    }
  ];

  const SUBJECT_META = {
    portugues:  { name: "Português",   icon: "📖", available: true  },
    matematica: { name: "Matemática",  icon: "🔢", available: false },
    historia:   { name: "História",    icon: "🏛️", available: false },
    ciencias:   { name: "Ciências",    icon: "🔬", available: false },
    ingles:     { name: "Inglês",      icon: "🌍", available: false },
    geografia:  { name: "Geografia",   icon: "🗺️", available: false }
  };

  const TOPIC_META = {
    interpretacao:        { name: "Interpretação de Texto",            icon: "📖" },
    ca_ce_ci_co_cu:      { name: "Usos do CA, CE, CI, CO e CU",       icon: "🔤" },
    substantivos_proprios:{ name: "Substantivos Próprios e Comuns",    icon: "🏷️" },
    singular_plural:      { name: "Singular e Plural",                 icon: "1️⃣" },
    maiusculas_dt:        { name: "Maiúsculas e Minúsculas: D e T",    icon: "🔡" },
    grau:                 { name: "Grau: Diminutivo e Aumentativo",    icon: "📏" },
    derivados:            { name: "Substantivos Derivados",            icon: "🌱" },
    maiusculas_cg:        { name: "Maiúsculas e Minúsculas: C e G",    icon: "🔡" },
    genero:               { name: "Substantivos Masculino e Feminino", icon: "👫" }
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
