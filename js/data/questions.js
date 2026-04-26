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

    const subtractionReservePairs = [
      [432, 158], [705, 278], [864, 397], [931, 486], [620, 185],
      [540, 267], [812, 439], [703, 258], [950, 476], [684, 295],
      [761, 384], [843, 567], [904, 458], [670, 286], [725, 348],
      [810, 456], [963, 579], [742, 368], [880, 497], [651, 274]
    ];

    mathQuestions.push(...buildQuestions("matematica", "subtracao_reserva", "Subtracao com Reserva", "mat_sr",
      subtractionReservePairs.map(([a, b]) => {
        const correct = a - b;
        return makeEntry(
          `Quanto e ${a} - ${b}?`,
          correct,
          [correct + 10, correct - 10, correct + 100, correct + 1],
          `Para resolver ${a} - ${b}, e preciso fazer a subtracao com reagrupamento quando falta dezena ou centena.`
        );
      })
    ));

    const thousandPairs = [
      [1250, 486], [2034, 875], [3400, 1587], [4123, 1968], [5005, 2479],
      [6200, 3586], [7314, 2897], [8402, 4758], [9001, 3864], [1540, 697],
      [2603, 1489], [3780, 2596], [4821, 1738], [6104, 2895], [7420, 3567]
    ];

    mathQuestions.push(...buildQuestions("matematica", "subtracao_milhar", "Subtraindo com Milhar", "mat_sm",
      thousandPairs.map(([a, b]) => {
        const correct = a - b;
        return makeEntry(
          `Quanto e ${a} - ${b}?`,
          correct,
          [correct + 100, correct - 100, correct + 10, correct + 1000],
          `Nessa conta, alem das centenas, pode ser necessario pedir emprestado tambem no milhar.`
        );
      })
    ));

    const addSubProblems = [
      ["Lia tinha 245 figurinhas e ganhou mais 128. Com quantas figurinhas ela ficou?", 373, [363, 383, 327], "Somamos as figurinhas que Lia tinha com as que ela ganhou: 245 + 128."],
      ["Uma biblioteca tinha 560 livros. Depois emprestou 187. Quantos livros ficaram na biblioteca?", 373, [383, 347, 273], "Para saber quantos ficaram, fazemos 560 - 187."],
      ["No passeio, 318 alunos foram de manha e 206 a tarde. Quantos alunos participaram ao todo?", 524, [514, 534, 424], "Como queremos o total, fazemos 318 + 206."],
      ["Pedro juntou 450 tampinhas e usou 175 em uma atividade. Quantas tampinhas sobraram?", 275, [265, 285, 375], "Para descobrir o que sobrou, fazemos 450 - 175."],
      ["Uma escola arrecadou 126 caixas de leite na segunda e 239 na terca. Quantas caixas foram arrecadadas nos dois dias?", 365, [355, 375, 465], "Somamos as caixas dos dois dias: 126 + 239."],
      ["Ana guardou 704 reais para uma viagem e gastou 286 reais. Quanto ainda restou?", 418, [408, 428, 318], "O valor que restou e 704 - 286."],
      ["Um mercado vendeu 315 paes pela manha e 184 a tarde. Quantos paes vendeu no dia?", 499, [489, 509, 399], "Somamos as vendas da manha e da tarde."],
      ["Numa fazenda havia 930 laranjas colhidas. Depois 458 foram vendidas. Quantas laranjas sobraram?", 472, [462, 482, 372], "Para saber o que sobrou, fazemos 930 - 458."],
      ["Julia leu 128 paginas de um livro e depois mais 147 paginas. Quantas paginas ela leu ao todo?", 275, [265, 285, 175], "Somamos as paginas lidas nas duas partes."],
      ["Havia 600 litros de agua em uma caixa. Foram usados 238 litros. Quantos litros ainda ficaram?", 362, [352, 372, 262], "Subtraimos os litros usados dos litros que havia antes."],
      ["Uma loja vendeu 432 brinquedos em abril e 156 em maio. Quantos brinquedos vendeu nesses dois meses?", 588, [578, 598, 488], "Como e o total de dois meses, somamos 432 + 156."],
      ["Em um album cabem 800 fotos. Ja foram colocadas 467 fotos. Quantos espacos ainda faltam preencher?", 333, [323, 343, 433], "Fazemos 800 - 467 para saber quantos espacos ainda faltam."],
      ["Um parque recebeu 219 visitantes de manha e 312 a tarde. Quantas pessoas visitaram o parque?", 531, [521, 541, 431], "Somamos os visitantes dos dois periodos."],
      ["Carlos tinha 980 pontos em um jogo e perdeu 365 pontos. Com quantos pontos ele ficou?", 615, [605, 625, 515], "Para saber a nova pontuacao, fazemos 980 - 365."],
      ["No deposito havia 155 caixas azuis e 244 caixas vermelhas. Quantas caixas havia no total?", 399, [389, 409, 299], "Somamos as caixas azuis e vermelhas."],
      ["Uma professora comprou 750 folhas e usou 298 em atividades. Quantas folhas sobraram?", 452, [442, 462, 352], "O numero de folhas que sobraram e 750 - 298."],
      ["Um onibus levou 186 pessoas pela manha e 207 a tarde. Quantas pessoas foram levadas ao todo?", 393, [383, 403, 293], "Somamos 186 + 207."],
      ["Numa gincana, a equipe azul fez 640 pontos e perdeu 285 em uma prova. Quantos pontos restaram?", 355, [345, 365, 255], "Subtraimos os pontos perdidos dos pontos que a equipe tinha."],
      ["Um clube tinha 321 bolas e comprou mais 179. Quantas bolas passou a ter?", 500, [490, 510, 400], "321 + 179 = 500."],
      ["Marina juntou 1000 pecas de montar e doou 468. Com quantas pecas ela ficou?", 532, [522, 542, 432], "Fazemos 1000 - 468 para descobrir quantas pecas restaram."]
    ];

    mathQuestions.push(...buildQuestions("matematica", "problemas_adicao_subtracao", "Problemas com Adicao e Subtracao", "mat_pas",
      addSubProblems.map(([question, correct, wrongs, explanation]) => makeEntry(question, correct, wrongs, explanation))
    ));

    const multiplicationBasicPairs = [
      [2, 8], [3, 6], [4, 7], [5, 9], [6, 4],
      [7, 5], [8, 3], [9, 4], [10, 6], [3, 9],
      [4, 8], [5, 7], [6, 6], [7, 8], [8, 5],
      [9, 7], [10, 4], [2, 12], [3, 11], [4, 9]
    ];

    mathQuestions.push(...buildQuestions("matematica", "multiplicacao_basica", "Multiplicacao - Operacoes Basicas", "mat_mb",
      multiplicationBasicPairs.map(([a, b]) => {
        const correct = a * b;
        return makeEntry(
          `Quanto e ${a} x ${b}?`,
          correct,
          [correct + a, correct - a, correct + b, correct + 1],
          `Multiplicar ${a} x ${b} e somar ${a} ${b} vezes, ou ${b} ${a} vezes.`
        );
      })
    ));

    const multiplicationProblems = [
      ["Cada caixa tem 6 lapis. Quantos lapis ha em 8 caixas?", 48, [42, 54, 56], "Se cada caixa tem 6 lapis, fazemos 6 x 8."],
      ["Uma professora organizou 7 filas com 5 alunos em cada uma. Quantos alunos estavam nas filas?", 35, [30, 40, 42], "Basta multiplicar 7 filas por 5 alunos."],
      ["Um pacote tem 4 figurinhas. Quantas figurinhas ha em 9 pacotes?", 36, [32, 40, 45], "Fazemos 4 x 9 para descobrir o total."],
      ["Joao plantou 3 mudas em cada vaso. Se ele tem 12 vasos, quantas mudas plantou?", 36, [30, 39, 48], "O total e 3 x 12."],
      ["No teatro, cada fileira tem 8 cadeiras. Quantas cadeiras ha em 6 fileiras?", 48, [42, 54, 46], "Como sao 6 grupos de 8 cadeiras, fazemos 8 x 6."],
      ["Uma aranha tem 8 patas. Quantas patas tem 5 aranhas?", 40, [32, 45, 48], "Multiplicamos 8 patas por 5 aranhas."],
      ["Cada semana tem 7 dias. Quantos dias ha em 4 semanas?", 28, [21, 24, 35], "Fazemos 7 x 4."],
      ["Uma bandeja leva 10 copos. Quantos copos cabem em 3 bandejas?", 30, [20, 33, 40], "Sao 3 grupos de 10 copos."],
      ["Cada time ganhou 9 medalhas. Quantas medalhas ganharam 4 times?", 36, [27, 40, 45], "Multiplicamos 9 x 4."],
      ["Uma caixa de ovos tem 12 ovos. Quantos ovos ha em 2 caixas?", 24, [14, 22, 26], "Sao 2 grupos de 12 ovos."],
      ["Cada aluno recebeu 5 livros. Quantos livros foram entregues a 9 alunos?", 45, [40, 50, 54], "Basta calcular 5 x 9."],
      ["Em cada mesa ha 4 cadeiras. Quantas cadeiras ha em 11 mesas?", 44, [40, 48, 54], "Temos 11 grupos de 4 cadeiras."],
      ["Uma loja montou 6 estantes com 7 caixas em cada uma. Quantas caixas foram colocadas?", 42, [36, 48, 49], "Fazemos 6 x 7."],
      ["Cada pacote tem 3 biscoitos. Quantos biscoitos ha em 15 pacotes?", 45, [30, 42, 48], "Sao 15 grupos de 3 biscoitos."],
      ["Um jardim tem 9 canteiros com 2 flores em cada um. Quantas flores ha ao todo?", 18, [11, 16, 20], "O total e 9 x 2."],
      ["Cada album tem 8 paginas. Quantas paginas ha em 7 albuns?", 56, [48, 54, 64], "Fazemos 8 x 7."],
      ["Uma bicicleta tem 2 rodas. Quantas rodas ha em 13 bicicletas?", 26, [24, 28, 23], "Multiplicamos 2 x 13."],
      ["Cada caixa guarda 9 bolas. Quantas bolas ha em 5 caixas?", 45, [36, 40, 54], "Sao 5 grupos de 9 bolas."],
      ["Uma fazenda tem 4 currais com 6 vacas em cada um. Quantas vacas ha?", 24, [20, 28, 30], "Calculamos 4 x 6."],
      ["Em cada saco ha 7 laranjas. Quantas laranjas ha em 8 sacos?", 56, [49, 54, 63], "Basta multiplicar 7 x 8."]
    ];

    mathQuestions.push(...buildQuestions("matematica", "multiplicacao_problemas", "Multiplicacao e Problemas", "mat_mp",
      multiplicationProblems.map(([question, correct, wrongs, explanation]) => makeEntry(question, correct, wrongs, explanation))
    ));

    const multiplicationReservePairs = [
      [124, 3], [215, 4], [306, 5], [418, 2], [527, 3],
      [638, 4], [749, 2], [856, 3], [912, 4], [135, 6],
      [247, 3], [359, 2], [468, 5], [574, 4], [683, 3]
    ];

    mathQuestions.push(...buildQuestions("matematica", "multiplicacao_reserva", "Multiplicacao com Reserva", "mat_mr",
      multiplicationReservePairs.map(([a, b]) => {
        const correct = a * b;
        return makeEntry(
          `Quanto e ${a} x ${b}?`,
          correct,
          [correct + b * 10, correct - b * 10, correct + 100, correct + b],
          `Na multiplicacao ${a} x ${b}, algumas ordens passam valor para a ordem seguinte, por isso ha reserva.`
        );
      })
    ));

    const circleEntries = [
      ["Qual figura geometrica e redonda por inteiro?", "circulo", ["quadrado", "triangulo", "retangulo"], "O circulo e a figura toda preenchida e redonda."],
      ["A linha que forma a volta do circulo recebe o nome de:", "circunferencia", ["segmento", "lado", "vertice"], "Circunferencia e a linha curva que contorna o circulo."],
      ["O centro de um circulo fica:", ["bem no meio da figura", "em um canto", "fora da figura", "na ponta da linha"], 0, "O centro e o ponto que fica no meio do circulo."],
      ["Qual objeto lembra mais um circulo?", "moeda", ["livro", "lapis", "porta"], "A moeda tem formato redondo, parecido com um circulo."],
      ["A borda de uma roda lembra mais:", "uma circunferencia", ["um triangulo", "um retangulo", "uma linha reta"], "A borda da roda e uma linha curva fechada, como a circunferencia."],
      ["Se uma figura e redonda e fechada, ela pode ser um:", "circulo", ["quadrado", "losango", "trapezio"], "O circulo e uma figura fechada e redonda."],
      ["Qual dos nomes combina com a parte de dentro de uma figura redonda?", "circulo", ["circunferencia", "segmento", "ponto final"], "Circulo e a regiao interna; circunferencia e o contorno."],
      ["O que e a circunferencia?", "o contorno do circulo", ["o centro da figura", "uma linha reta", "a metade do circulo"], "Circunferencia e a linha curva que contorna o circulo."],
      ["Em uma pizza inteira vista de cima, o formato se parece mais com:", "circulo", ["triangulo", "retangulo", "cubo"], "A pizza inteira tem forma parecida com um circulo."],
      ["Qual figura nao tem cantos nem lados retos?", "circulo", ["quadrado", "retangulo", "triangulo"], "O circulo nao possui lados retos nem cantos."],
      ["O bambole pode lembrar melhor:", "uma circunferencia", ["um quadrado", "um cone", "um cubo"], "O bambole parece um contorno redondo."],
      ["Quando desenhamos so a volta de uma figura redonda, desenhamos a:", "circunferencia", ["diagonal", "altura", "tabuada"], "A volta da figura redonda recebe o nome de circunferencia."]
    ];

    mathQuestions.push(...buildQuestions("matematica", "circulos_circunferencias", "Circulos e Circunferencias", "mat_cc",
      circleEntries.map(entry => Array.isArray(entry[1])
        ? [entry[0], entry[1], entry[2], entry[3]]
        : makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const segmentEntries = [
      ["Um segmento de reta e:", "uma parte de reta com comeco e fim", ["uma curva fechada", "uma conta de multiplicar", "um circulo inteiro"], "O segmento de reta tem dois extremos: um inicio e um fim."],
      ["Qual desenho lembra um segmento de reta?", "uma linha reta curta", ["uma roda", "um arco", "um circulo"], "O segmento de reta parece uma linha reta limitada por dois pontos."],
      ["Se marcamos os pontos A e B e ligamos com uma linha reta, formamos:", "o segmento AB", ["uma circunferencia", "um triangulo", "um cubo"], "Dois pontos ligados por uma reta formam um segmento."],
      ["Um segmento de reta pode ser:", "horizontal, vertical ou inclinado", ["somente redondo", "somente curvo", "sempre em zigue-zague"], "Segmentos podem aparecer em varias posicoes, mas continuam retos."],
      ["O segmento de reta e diferente da linha curva porque:", "ele nao faz curva", ["ele nao tem tamanho", "ele nao pode ser desenhado", "ele sempre e redondo"], "Um segmento de reta segue sempre reto."],
      ["Ao desenhar a borda de uma folha de caderno, vemos muitos:", "segmentos de reta", ["circulos", "espirais", "ondas"], "Os lados de uma folha sao exemplos de segmentos de reta."],
      ["Uma regua ajuda a desenhar:", "segmentos de reta", ["circulos perfeitos sem compasso", "ondas do mar", "nuvens"], "A regua ajuda a fazer linhas retas."],
      ["Quando um segmento liga dois pontos, ele mostra:", "a distancia reta entre eles", ["o nome do caderno", "a cor dos pontos", "uma multiplicacao"], "O segmento representa a ligacao reta entre os pontos."],
      ["Qual objeto tem bordas que parecem segmentos de reta?", "um livro", ["uma bola", "uma moeda", "um prato"], "As bordas retas do livro lembram segmentos de reta."],
      ["Um segmento de reta sempre tem:", "dois extremos", ["tres centros", "quatro curvas", "nenhum fim"], "Todo segmento de reta tem um inicio e um fim."],
      ["Se a linha esta torcida, ela nao e:", "segmento de reta", ["linha", "desenho", "figura"], "Para ser segmento, a linha precisa ser reta."],
      ["Um lado de um quadrado e um exemplo de:", "segmento de reta", ["circunferencia", "diametro", "curva aberta"], "Cada lado de um quadrado e um segmento de reta."],
      ["Quando medimos um lado reto de uma figura, estamos medindo um:", "segmento de reta", ["circulo", "angulo redondo", "contorno curvo"], "Lados retos de figuras sao segmentos de reta."],
      ["Uma cerca feita com hastes retas lembra varios:", "segmentos de reta", ["circulos concentricos", "arcos completos", "ondas fechadas"], "Cada haste reta pode lembrar um segmento de reta."]
    ];

    mathQuestions.push(...buildQuestions("matematica", "segmentos_reta", "Segmentos de Reta", "mat_seg",
      segmentEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const lengthEntries = [
      ["O segmento AB mede 5 cm e o segmento CD mede 8 cm. Qual e o maior?", "segmento CD", ["segmento AB", "os dois tem a mesma medida", "nenhum deles"], "Como 8 cm e maior que 5 cm, o segmento CD e maior."],
      ["Um segmento mede 7 cm. Outro mede 7 cm. O que podemos dizer?", "eles tem o mesmo comprimento", ["o primeiro e maior", "o segundo e menor", "nao da para comparar"], "Se os dois medem 7 cm, tem o mesmo comprimento."],
      ["Se um segmento mede 9 cm e outro 4 cm, qual e a diferenca entre eles?", "5 cm", ["4 cm", "6 cm", "13 cm"], "A diferenca e 9 - 4 = 5 cm."],
      ["Qual instrumento usamos para medir um segmento desenhado no caderno?", "regua", ["borracha", "apontador", "compasso de circulo"], "A regua e usada para medir comprimentos retos."],
      ["Um segmento mede 3 cm. Se ele aumentar 2 cm, passara a medir:", "5 cm", ["4 cm", "6 cm", "1 cm"], "Somamos 3 cm + 2 cm = 5 cm."],
      ["Um segmento mede 10 cm. Se tirarmos 4 cm, quanto resta?", "6 cm", ["5 cm", "7 cm", "14 cm"], "Subtraimos 10 cm - 4 cm."],
      ["O segmento EF mede 12 cm. O segmento GH mede 15 cm. Quantos centimetros o GH tem a mais?", "3 cm", ["2 cm", "4 cm", "27 cm"], "Fazemos 15 - 12 = 3 cm."],
      ["Dois segmentos medem 6 cm e 8 cm. Juntos, medem:", "14 cm", ["12 cm", "13 cm", "15 cm"], "Somamos os dois comprimentos: 6 + 8."],
      ["Se um lado de um retangulo mede 9 cm, essa medida representa o comprimento de um:", "segmento de reta", ["circulo", "ponto", "curva"], "O lado reto da figura e um segmento de reta."],
      ["O segmento JK mede 11 cm. Qual opcao mostra essa medida?", "11 cm", ["10 cm", "12 cm", "21 cm"], "A medida informada do segmento JK e 11 cm."],
      ["Se o segmento LM mede 4 cm e o segmento NO mede o dobro, quanto mede NO?", "8 cm", ["6 cm", "7 cm", "12 cm"], "O dobro de 4 cm e 8 cm."],
      ["Um segmento de 16 cm foi dividido em 2 partes iguais. Quanto mede cada parte?", "8 cm", ["6 cm", "7 cm", "9 cm"], "Metade de 16 cm e 8 cm."],
      ["Se um segmento mede 14 cm e outro mede 9 cm, qual e o menor?", "o de 9 cm", ["o de 14 cm", "os dois sao iguais", "nenhum deles"], "Entre 14 e 9, o menor e 9."],
      ["Para saber se um segmento e maior ou menor que outro, precisamos:", "comparar suas medidas", ["adivinhar", "olhar so a cor", "contar as letras do nome"], "A comparacao correta e feita pelas medidas."]
    ];

    mathQuestions.push(...buildQuestions("matematica", "comprimento_segmentos", "Comprimento dos Segmentos de Reta", "mat_cs",
      lengthEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    return mathQuestions;
  }

  const mathQuestions = generateMathQuestions();
  questions.push(...mathQuestions);

  function generateScienceQuestions() {
    const scienceQuestions = [];

    const birdEntries = [
      ["As aves tem o corpo coberto principalmente por:", "penas", ["pelos", "escamas secas", "casca"], "As aves possuem penas, que ajudam na protecao e, em muitos casos, no voo."],
      ["Qual destes animais e uma ave?", "galinha", ["cachorro", "sapo", "peixe"], "A galinha e uma ave."],
      ["As aves nascem, em geral, de:", "ovos", ["sementes", "casulos de pano", "potes"], "A maior parte das aves nasce de ovos."],
      ["O bico das aves ajuda a:", "pegar alimentos", ["respirar debaixo d'agua", "cavar tuneis profundos", "subir em paredes lisas"], "O bico ajuda a pegar, cortar ou quebrar alimentos."],
      ["Muitas aves conseguem voar porque tem:", "asas", ["barbatanas", "nadadeiras", "antenas"], "As asas ajudam muitas aves a voar."],
      ["Nem toda ave voa, mas toda ave tem:", "penas", ["escamas grossas", "barbatana", "casco"], "Mesmo aves que nao voam possuem penas."],
      ["O filhote da ave se desenvolve primeiro:", "dentro do ovo", ["dentro de uma bolsa", "no solo sem protecao", "num casulo de seda"], "O embriao da ave se desenvolve dentro do ovo."],
      ["Uma caracteristica das aves e ter:", "duas patas e duas asas", ["quatro patas e chifres", "seis patas", "oito patas"], "As aves costumam ter duas patas e duas asas."],
      ["A ave usa o ninho principalmente para:", "proteger ovos e filhotes", ["guardar leite", "nadar no rio", "cavar o solo"], "O ninho ajuda a proteger os ovos e os filhotes."],
      ["Qual destas partes ajuda a ave a se equilibrar durante o voo?", "cauda", ["casco", "barbatana dorsal", "guelras"], "A cauda ajuda no equilibrio e na direcao."],
      ["O pinguim e uma ave que:", "nao voa, mas nada", ["voa muito alto", "vive so em arvores", "tem pelos"], "O pinguim e uma ave adaptada a nadar."],
      ["A galinha, o pato e o passarinho sao exemplos de:", "aves", ["mamiferos", "invertebrados", "anfibios"], "Todos eles pertencem ao grupo das aves."],
      ["A casca do ovo ajuda a:", "proteger o embriao", ["dar leite ao filhote", "fazer o filhote respirar na agua", "virar pena"], "A casca protege o que esta se desenvolvendo."],
      ["As penas das aves ajudam tambem a:", "manter a temperatura do corpo", ["produzir leite", "substituir os ossos", "virar alimento"], "As penas ajudam a proteger do frio e do calor."],
      ["Quando o filhote sai do ovo, ocorre a:", "eclosao", ["migracao", "hibernacao", "fermentacao"], "Eclosao e a saida do filhote do ovo."],
      ["Muitas aves alimentam seus filhotes levando comida ao:", "ninho", ["aquario", "casulo", "buraco no gelo"], "Os adultos levam alimento ate o ninho."],
      ["Aves respiram por:", "pulmoes", ["guelras", "barbatanas", "poros da esponja"], "As aves respiram por pulmoes."],
      ["Um ovo de ave precisa, em muitos casos, ficar aquecido para:", "o filhote se desenvolver bem", ["virar pedra", "mudar de cor", "encher de agua"], "O calor ajuda o embriao a crescer."],
      ["O pato e adaptado a viver perto da agua porque:", "suas patas ajudam a nadar", ["tem guelras", "vive preso ao fundo", "nao precisa respirar"], "As patas do pato ajudam na locomocao na agua."],
      ["A coruja e uma ave conhecida por:", "ter bico, penas e asas", ["ter barbatanas", "ter casco duro", "ter seis patas"], "A coruja tem as caracteristicas comuns das aves."],
      ["Uma diferenca entre aves e mamiferos e que as aves:", "tem penas", ["produzem leite", "amam os filhotes com mamas", "tem pelos por todo o corpo"], "Penas sao caracteristicas tipicas das aves."],
      ["Quando uma ave cuida dos ovos ate o nascimento, ela esta:", "chocando os ovos", ["trocando as penas", "hibernando", "cavando um tunel"], "Chocar e manter os ovos aquecidos e protegidos."],
      ["O avestruz e uma ave grande que:", "nao voa", ["vive no fundo do mar", "tem pelo", "bota filhotes vivos"], "O avestruz e uma ave que nao voa."],
      ["As aves fazem parte dos animais:", "vertebrados", ["sem coluna vertebral", "sem esqueleto", "que vivem presos"], "As aves possuem coluna vertebral."],
      ["Aprender sobre o desenvolvimento das aves mostra que elas:", "crescem desde o ovo ate a fase adulta", ["nascem adultas", "nunca mudam de tamanho", "nao precisam de cuidado"], "As aves passam por etapas de desenvolvimento."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "aves", "Caracteristicas e Desenvolvimento das Aves", "cie_av",
      birdEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const mammalEntries = [
      ["Os mamiferos tem o corpo coberto principalmente por:", "pelos", ["penas", "casca", "espinhos de planta"], "Os mamiferos costumam ter pelos no corpo."],
      ["Qual destes animais e um mamifero?", "gato", ["pombo", "tartaruga", "peixe"], "O gato e um mamifero."],
      ["Uma caracteristica dos mamiferos e que as maes:", "produzem leite para os filhotes", ["botam ovos em ninhos sempre", "respiram por guelras", "vivem presas em rochas"], "As maes mamiferas alimentam os filhotes com leite."],
      ["Os filhotes dos mamiferos mamam porque:", "se alimentam do leite da mae", ["precisam quebrar a casca do ovo", "respiram debaixo d'agua", "vivem grudados nas pedras"], "Mamiferos se alimentam do leite materno no inicio da vida."],
      ["Qual destes animais tambem e mamifero?", "baleia", ["sardinha", "polvo", "galinha"], "A baleia e um mamifero, mesmo vivendo na agua."],
      ["Os mamiferos respiram por:", "pulmoes", ["guelras", "poros", "penas"], "Mamiferos respiram por pulmoes."],
      ["A maioria dos mamiferos nasce:", "da barriga da mae", ["de ovos com casca dura", "de sementes", "de casulos"], "A maior parte dos mamiferos e vivipara."],
      ["O cachorro, o cavalo e o macaco sao exemplos de:", "mamiferos", ["aves", "invertebrados", "cnidarios"], "Todos pertencem ao grupo dos mamiferos."],
      ["Os mamiferos sao animais:", "vertebrados", ["sem coluna vertebral", "sem ossos", "que vivem presos"], "Mamiferos possuem coluna vertebral."],
      ["Uma caracteristica dos mamiferos e cuidar dos filhotes por um tempo porque:", "os filhotes precisam de protecao e alimento", ["os filhotes nascem voando", "os filhotes vivem em ovos", "os filhotes nao crescem"], "Em geral, os filhotes precisam de cuidado depois de nascer."],
      ["O ser humano faz parte do grupo dos:", "mamiferos", ["aves", "poriferos", "cnidarios"], "As pessoas sao mamiferos."],
      ["Qual animal e mamifero e vive no mar?", "golfinho", ["tubarao", "agua-viva", "estrela-do-mar"], "O golfinho e um mamifero aquatico."],
      ["Os pelos dos mamiferos podem ajudar a:", "proteger e manter a temperatura do corpo", ["virar asas", "produzir ovos", "respirar na agua"], "Os pelos ajudam na protecao e no controle da temperatura."],
      ["Um filhote de mamifero cresce e se desenvolve com ajuda:", "da mae e do alimento", ["somente da casca", "de barbatanas", "de rochas"], "O cuidado da mae e a alimentacao ajudam no desenvolvimento."],
      ["O morcego e um mamifero que:", "voa", ["tem penas", "respira por guelras", "nasce de ovo com casca"], "Mesmo voando, o morcego e mamifero."],
      ["A vaca e um mamifero porque:", "tem pelos e amamenta o bezerro", ["tem penas e bico", "vive presa a rochas", "tem tentaculos"], "A vaca apresenta caracteristicas tipicas dos mamiferos."],
      ["Mamiferos e aves se parecem porque ambos:", "sao vertebrados", ["produzem leite", "tem penas", "vivem em ovos sempre"], "Os dois grupos tem coluna vertebral."],
      ["Qual destes animais nao e mamifero?", "pato", ["coelho", "onca", "cavalo"], "O pato e uma ave."],
      ["Os mamiferos podem viver:", "na terra, na agua e ate voando", ["somente em arvores", "so no mar", "apenas em cavernas"], "Existem mamiferos terrestres, aquaticos e voadores."],
      ["Um bebe humano se alimenta primeiro de:", "leite", ["sementes", "algas", "rochas"], "O leite e o primeiro alimento do bebe."],
      ["O elefante e mamifero e seu filhote nasce:", "da barriga da mae", ["de ovo duro", "de um casulo", "de uma concha"], "Como outros mamiferos, nasce do corpo da mae."],
      ["Os mamiferos costumam ter temperatura do corpo:", "mais estavel", ["igual a da agua sempre", "sempre fria como gelo", "nula"], "Mamiferos mantem a temperatura corporal mais estavel."],
      ["Uma das etapas do desenvolvimento dos mamiferos e:", "crescer ate a fase adulta", ["virar planta", "trocar penas", "grudar em rochas"], "Os mamiferos passam por fases de crescimento."],
      ["Os filhotes de mamiferos dependem muito dos adultos no inicio porque:", "ainda estao aprendendo a viver", ["ja nascem adultos", "voam logo ao nascer", "nao precisam de alimento"], "No inicio, os filhotes precisam de alimento e protecao."],
      ["Estudar os mamiferos ajuda a perceber que esse grupo:", "tem varias especies com caracteristicas em comum", ["e formado so por animais grandes", "vive so em florestas", "nao cuida dos filhotes"], "Apesar das diferencas, os mamiferos compartilham caracteristicas importantes."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "mamiferos", "Caracteristicas e Desenvolvimento dos Mamiferos", "cie_ma",
      mammalEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const invertebrateEntries = [
      ["Os invertebrados sao animais que:", "nao tem coluna vertebral", ["tem pelos", "tem penas", "produzem leite"], "Invertebrados nao possuem coluna vertebral."],
      ["Qual destes animais e invertebrado?", "borboleta", ["gato", "pombo", "sapo"], "A borboleta nao tem coluna vertebral."],
      ["Formiga, aranha e minhoca sao exemplos de:", "invertebrados", ["mamiferos", "aves", "repteis grandes"], "Esses animais nao possuem coluna vertebral."],
      ["Um caracol e um invertebrado porque:", "nao tem coluna vertebral", ["tem pelos", "tem asas com penas", "produz leite"], "Caracois sao invertebrados."],
      ["Qual destes grupos reune apenas invertebrados?", "polvo, borboleta e minhoca", ["cachorro, gato e cavalo", "pato, arara e coruja", "golfinho, baleia e peixe"], "Polvo, borboleta e minhoca sao invertebrados."],
      ["A aranha e um invertebrado que tem:", "oito patas", ["duas asas", "penas", "casco de tartaruga"], "Aranhas sao invertebrados e costumam ter oito patas."],
      ["A minhoca ajuda o solo porque:", "vive e se move na terra", ["voa em bandos", "nada em rios fundos", "produz leite"], "A minhoca vive no solo e pode ajuda-lo a ficar mais aerado."],
      ["O polvo e um invertebrado que vive:", "na agua", ["somente no deserto", "so em arvores", "somente em ninhos"], "O polvo e um invertebrado marinho."],
      ["Uma caracteristica comum de muitos invertebrados e:", "ter o corpo sem coluna vertebral", ["ter bico e penas", "ter pelos e mamas", "ter casco osseo interno"], "Essa e a principal caracteristica do grupo."],
      ["Qual destes animais nao e invertebrado?", "coelho", ["abelha", "aranha", "caracol"], "O coelho e vertebrado, pois tem coluna vertebral."],
      ["Os insetos fazem parte dos:", "invertebrados", ["mamiferos", "aves", "anfibios"], "Insetos sao animais invertebrados."],
      ["A borboleta passa por mudancas no crescimento. Isso faz parte do seu:", "desenvolvimento", ["congelamento", "sono profundo eterno", "voo sem asas"], "No desenvolvimento, alguns invertebrados passam por transformacoes."],
      ["A joaninha e um exemplo de:", "inseto invertebrado", ["mamifero voador", "ave pequena", "peixe colorido"], "A joaninha e um inseto e, portanto, um invertebrado."],
      ["As conchas podem proteger alguns invertebrados, como:", "caracois", ["gatos", "galinhas", "cavalos"], "Caracois podem viver protegidos por conchas."],
      ["Muitos invertebrados sao pequenos e vivem:", "em muitos lugares diferentes", ["somente no ceu", "apenas no gelo", "so em telhados"], "Invertebrados vivem em diversos ambientes."],
      ["A abelha e importante porque:", "ajuda na polinizacao", ["produz leite", "tem penas", "vive grudada em rochas do mar"], "A abelha ajuda as plantas na polinizacao."],
      ["O corpo mole e uma caracteristica comum em alguns invertebrados como:", "o polvo", ["a galinha", "o cavalo", "o cachorro"], "O polvo e um invertebrado de corpo mole."],
      ["Insetos, aracnideos e moluscos sao grupos de:", "invertebrados", ["somente mamiferos", "somente aves", "somente vertebrados aquaticos"], "Esses grupos fazem parte dos invertebrados."],
      ["A minhoca nao tem patas, mas consegue se locomover porque:", "move o corpo pelo solo", ["voa com asas", "nada com barbatanas", "corre com cascos"], "A minhoca se move contraindo e esticando o corpo."],
      ["Os invertebrados podem ser encontrados:", "na terra e na agua", ["somente no fundo do mar", "so em cidades", "apenas dentro de ovos"], "Invertebrados vivem em muitos ambientes."],
      ["O desenvolvimento da borboleta comeca como:", "ovo", ["filhote com pelos", "planta", "peixe"], "A borboleta comeca seu ciclo no ovo."],
      ["Uma lagarta se transforma em borboleta. Isso mostra:", "mudancas no desenvolvimento", ["que e mamifero", "que tem coluna vertebral", "que produz leite"], "A borboleta passa por etapas de desenvolvimento."],
      ["O caranguejo e um invertebrado que pode viver:", "em areas proximas da agua", ["somente em ninhos de ave", "apenas em florestas altas", "dentro de tocas de mamiferos"], "Caranguejos sao invertebrados ligados a ambientes aquaticos ou umidos."],
      ["Aprender sobre invertebrados e importante porque eles:", "fazem parte da natureza e dos ecossistemas", ["nao tem funcao nenhuma", "sao todos iguais", "vivem apenas em livros"], "Os invertebrados sao muito importantes para a vida na Terra."],
      ["Os invertebrados recebem esse nome por causa da:", "falta de coluna vertebral", ["presenca de bico", "quantidade de pelos", "forma do ovo"], "O nome do grupo vem da ausencia de coluna vertebral."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "invertebrados", "Estudo dos Invertebrados", "cie_in",
      invertebrateEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const poriferaEntries = [
      ["Os poriferos sao conhecidos popularmente como:", "esponjas-do-mar", ["algas", "corais", "estrelas-do-mar"], "Os poriferos sao chamados de esponjas-do-mar."],
      ["Os poriferos vivem principalmente:", "na agua", ["somente na terra", "no deserto", "em ninhos de aves"], "As esponjas vivem em ambiente aquatico."],
      ["O corpo dos poriferos tem muitos:", "poros", ["pelos", "bicos", "asas"], "Poros sao pequenas aberturas por onde a agua passa."],
      ["Os poriferos sao animais:", "invertebrados", ["mamiferos", "aves", "repteis"], "Esponjas-do-mar nao tem coluna vertebral."],
      ["A agua entra no corpo das esponjas pelos:", "poros", ["pulmoes", "penas", "mamilos"], "Os poros permitem a entrada da agua."],
      ["Os poriferos costumam viver:", "presos a rochas ou superficies", ["voando no ceu", "correndo no campo", "saltando em galhos"], "As esponjas vivem fixas em um lugar."],
      ["Uma esponja-do-mar se alimenta quando:", "a agua passa pelo seu corpo", ["ela mastiga folhas", "ela caça com bico", "ela produz leite"], "A agua leva pequenas particulas de alimento."],
      ["Os poriferos tem corpo:", "simples", ["cheio de ossos", "com penas", "com casco articulado"], "As esponjas tem organizacao corporal simples."],
      ["Qual destes animais e um porifero?", "esponja-do-mar", ["golfinho", "galinha", "borboleta"], "A esponja-do-mar pertence ao grupo dos poriferos."],
      ["Os poriferos respiram e se alimentam com a ajuda:", "da circulacao de agua no corpo", ["de asas", "de patas fortes", "de casca de ovo"], "A agua que passa pelo corpo ajuda em varias funcoes."],
      ["Os poriferos costumam ser encontrados em:", "mares e outros ambientes aquaticos", ["somente em arvores", "apenas em desertos", "ninhos de mamiferos"], "Sao animais aquaticos."],
      ["Uma caracteristica marcante dos poriferos e:", "ter muitos poros no corpo", ["ter mamas", "ter bico", "ter pelos longos"], "O proprio nome do grupo lembra a presenca de poros."],
      ["Os poriferos se desenvolvem em ambiente:", "aquatico", ["aereo", "terrestre seco", "subterraneo"], "O desenvolvimento ocorre na agua."],
      ["Uma esponja-do-mar pode ficar parada no mesmo lugar porque:", "vive fixa a uma superficie", ["voa para procurar comida", "anda com patas", "salta como sapo"], "Ela costuma ficar presa a rochas ou recifes."],
      ["Os poriferos sao chamados de animais filtradores porque:", "retiram alimento da agua que passa pelo corpo", ["caçam com dentes", "mastigam folhas", "produzem leite"], "Eles filtram pequenas particulas de alimento."],
      ["O estudo dos poriferos mostra um tipo de animal:", "simples e aquatico", ["com pelos e mamas", "com penas e bico", "com coluna vertebral grande"], "Esponjas sao animais aquaticos de corpo simples."],
      ["A agua sai do corpo da esponja por uma abertura maior depois de:", "passar pelos poros", ["virar ovo", "formar penas", "ser mastigada"], "A agua entra pelos poros e sai por uma abertura maior."],
      ["Os poriferos fazem parte do grupo dos:", "invertebrados", ["mamiferos", "aves", "anfibios"], "Eles nao tem coluna vertebral."],
      ["Uma crianca que ve uma esponja-do-mar observa um ser vivo que:", "vive na agua", ["vive no telhado", "vive em livro", "vive no ar"], "As esponjas-do-mar sao seres vivos aquaticos."],
      ["Os poriferos nao se locomovem como muitos outros animais porque:", "ficam fixos", ["tem asas pequenas", "tem pernas quebradas", "vivem dormindo"], "A maioria permanece presa a superficies."],
      ["Um ambiente favoravel aos poriferos e:", "o mar", ["a copa das arvores", "o deserto quente", "o patio da escola"], "Muitos poriferos vivem no mar."],
      ["O nome porifero lembra a ideia de:", "poros", ["pelos", "penas", "patas"], "O grupo recebeu esse nome por causa dos poros no corpo."],
      ["Os poriferos ajudam a mostrar que existem animais:", "bem diferentes uns dos outros", ["todos iguais", "so terrestres", "somente voadores"], "A diversidade animal inclui grupos muito simples e especiais."],
      ["A esponja-do-mar nao e planta; ela e:", "animal", ["fungo", "pedra", "algodao"], "Apesar de ficar parada, a esponja-do-mar e um animal."],
      ["Estudar poriferos ajuda a entender melhor os animais que:", "vivem na agua e filtram alimento", ["produzem leite", "tem penas", "tem pelos grossos"], "Os poriferos sao um grupo aquatico com modo de vida proprio."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "poriferos", "Caracteristicas e Desenvolvimento dos Poriferos", "cie_po",
      poriferaEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const cnidariaEntries = [
      ["As aguas-vivas e as anemonas-do-mar pertencem ao grupo dos:", "cnidarios", ["mamiferos", "aves", "poriferos"], "Aguas-vivas e anemonas sao cnidarios."],
      ["Muitos cnidarios vivem:", "na agua", ["somente na terra", "em arvores secas", "em ninhos"], "Cnidarios sao, em geral, aquaticos."],
      ["Uma caracteristica dos cnidarios e ter:", "tentaculos", ["penas", "pelos", "mamas"], "Tentaculos sao comuns nesse grupo."],
      ["A agua-viva e um animal:", "invertebrado", ["mamifero", "ave", "reptil com casco"], "Ela nao tem coluna vertebral."],
      ["Os tentaculos dos cnidarios ajudam a:", "capturar alimento e se defender", ["produzir leite", "voar", "quebrar sementes com bico"], "Os tentaculos ajudam na alimentacao e defesa."],
      ["Qual destes animais e um cnidario?", "anemona-do-mar", ["cavalo", "pinguim", "minhoca"], "A anemona-do-mar faz parte dos cnidarios."],
      ["Os cnidarios vivem principalmente em:", "mares", ["desertos", "campos secos", "casas"], "Muitos cnidarios vivem em ambientes marinhos."],
      ["A agua-viva tem corpo:", "mole", ["com ossos", "com penas", "com casco duro"], "A agua-viva possui corpo mole."],
      ["Os cnidarios fazem parte dos:", "invertebrados", ["vertebrados", "mamiferos", "aves"], "Eles nao possuem coluna vertebral."],
      ["Uma anemona-do-mar pode ficar presa em:", "rochas", ["nuvens", "galhos secos", "telhados"], "Muitas anemonas ficam fixas em superficies."],
      ["Os cnidarios podem usar os tentaculos para:", "levar alimento ate a boca", ["produzir ovos com casca", "correr no campo", "voar em bando"], "Os tentaculos ajudam a capturar e levar alimento."],
      ["A agua-viva se movimenta na agua com ajuda do seu:", "corpo gelatinoso", ["casco com patas", "bico", "asa com penas"], "O corpo ajuda no deslocamento na agua."],
      ["Os cnidarios sao animais:", "aquaticos", ["terrestres com pelos", "aereos com penas", "subterraneos com casco"], "Vivem principalmente na agua."],
      ["Uma diferenca entre poriferos e cnidarios e que os cnidarios:", "tem tentaculos", ["produzem leite", "tem pelos", "voam"], "Tentaculos sao uma marca dos cnidarios."],
      ["O corpo de muitos cnidarios pode parecer:", "uma bolsa mole com tentaculos", ["um retangulo duro", "um ninho com ovos", "um quadrado com patas"], "Esse formato aparece em varios cnidarios."],
      ["A anemona-do-mar se alimenta com a ajuda dos:", "tentaculos", ["pelos", "pulmoes", "cascos"], "Os tentaculos ajudam a capturar o alimento."],
      ["Cnidarios podem causar ardencia ao tocar porque alguns possuem:", "celulas que ajudam na defesa", ["penas quentes", "casca grossa", "mamas"], "Essas celulas ajudam na protecao e captura de alimento."],
      ["Os corais fazem parte do grupo dos:", "cnidarios", ["mamiferos", "aves", "poriferos"], "Corais tambem pertencem aos cnidarios."],
      ["Os cnidarios ajudam a mostrar a diversidade da vida:", "nos ambientes aquaticos", ["somente nas florestas", "so nas cidades", "somente nos desertos"], "Ha muitos tipos de animais vivendo na agua."],
      ["A agua-viva e um exemplo de animal com corpo:", "mole e sem ossos", ["com pelos e mamas", "com penas e bico", "com casco de tartaruga"], "Ela nao tem esqueleto interno osseo."],
      ["Os cnidarios crescem e se desenvolvem em ambiente:", "aquatico", ["aereo", "terrestre seco", "subterraneo"], "Seu desenvolvimento acontece na agua."],
      ["Uma caracteristica dos cnidarios e que muitos deles:", "vivem no mar", ["amam os filhotes com leite", "tem penas para voar", "nascem de sementes"], "A maior parte dos cnidarios vive no mar."],
      ["Os cnidarios sao importantes nos estudos de ciencias porque:", "mostram um tipo diferente de invertebrado", ["sao mamiferos pequenos", "sao aves aquaticas", "nao sao animais"], "Eles ajudam a entender a diversidade dos animais invertebrados."],
      ["Uma anemona-do-mar nao e planta; ela e:", "animal", ["alga", "pedra", "flor terrestre"], "Apesar da aparencia, a anemona-do-mar e um animal."],
      ["Estudar cnidarios ajuda a conhecer melhor animais com:", "tentaculos e vida aquatica", ["pelos e leite", "penas e bico", "coluna vertebral e asas"], "Esse grupo tem caracteristicas proprias, como tentaculos e vida aquatica."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "cnidarios", "Caracteristicas e Desenvolvimento dos Cnidarios", "cie_cn",
      cnidariaEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
    ));

    const extraEntries = [
      ["Qual grupo tem animais com penas?", "aves", ["mamiferos", "poriferos", "cnidarios"], "As penas sao caracteristicas das aves."],
      ["Qual grupo alimenta os filhotes com leite?", "mamiferos", ["aves", "cnidarios", "poriferos"], "Mamiferos produzem leite para os filhotes."],
      ["Qual grupo inclui esponjas-do-mar?", "poriferos", ["aves", "mamiferos", "repteis"], "Esponjas-do-mar sao poriferos."],
      ["Qual grupo inclui aguas-vivas?", "cnidarios", ["mamiferos", "aves", "poriferos"], "Aguas-vivas fazem parte dos cnidarios."],
      ["Borboletas, aranhas e minhocas pertencem ao grupo dos:", "invertebrados", ["mamiferos", "aves", "poriferos"], "Eles nao tem coluna vertebral."],
      ["A galinha bota ovo. Isso mostra uma caracteristica das:", "aves", ["baleias", "vacas", "esponjas"], "Aves, em geral, se desenvolvem a partir de ovos."],
      ["O cachorro e um mamifero porque:", "mama quando filhote", ["tem tentaculos", "vive preso a rochas", "tem penas"], "O cachorro e mamifero e mama quando pequeno."],
      ["A esponja-do-mar vive fixa e tem muitos:", "poros", ["bicos", "pelos", "cascos"], "Poriferos possuem muitos poros no corpo."],
      ["Uma agua-viva usa tentaculos para:", "capturar alimento", ["produzir leite", "quebrar sementes", "voar"], "Os tentaculos ajudam na alimentacao e defesa."],
      ["O pinguim e classificado como:", "ave", ["mamifero", "cnidario", "porifero"], "Mesmo sem voar, o pinguim e uma ave."],
      ["A baleia e classificada como:", "mamifero", ["peixe", "ave", "invertebrado"], "A baleia respira por pulmoes e amamenta."],
      ["A joaninha e um exemplo de:", "invertebrado", ["mamifero", "ave", "cnidario"], "A joaninha nao tem coluna vertebral."],
      ["Anemona-do-mar e mais parecida com:", "cnidarios", ["mamiferos", "aves", "poriferos terrestres"], "A anemona pertence aos cnidarios."],
      ["Um ninho com ovos e filhotes lembra mais o estudo de:", "aves", ["mamiferos", "poriferos", "cnidarios"], "Ninhos e ovos sao muito associados ao estudo das aves."],
      ["Um filhote mamando lembra o grupo dos:", "mamiferos", ["aves", "cnidarios", "poriferos"], "Mamar leite e caracteristica de mamiferos."],
      ["Se o animal nao tem coluna vertebral, ele pode ser:", "invertebrado", ["ave", "mamifero com pelos", "vertebrado"], "Animais sem coluna vertebral sao invertebrados."],
      ["Poriferos e cnidarios tem em comum o fato de viverem principalmente:", "na agua", ["no deserto", "em arvores secas", "em telhados"], "Os dois grupos sao basicamente aquaticos."],
      ["Aves e mamiferos tem em comum o fato de serem:", "vertebrados", ["invertebrados", "sem pulmoes", "sem desenvolvimento"], "Ambos possuem coluna vertebral."],
      ["Uma borboleta nao pertence ao grupo das aves porque:", "nao tem penas nem bico", ["bota ovo", "voa", "e pequena"], "Voar nao basta para ser ave; e preciso ter caracteristicas do grupo."],
      ["Um animal com tentaculos e vida marinha pode pertencer aos:", "cnidarios", ["mamiferos", "aves", "animais com pelos"], "Tentaculos sao comuns entre cnidarios."],
      ["Um animal com corpo poroso, preso a rochas e filtrador lembra os:", "poriferos", ["mamiferos", "aves", "repteis"], "Essas sao caracteristicas das esponjas-do-mar."],
      ["Uma atividade extra de ciencias importante ao estudar animais e:", "comparar caracteristicas dos grupos", ["decorar sem observar", "misturar grupos sem criterio", "ignorar diferencas"], "Comparar grupos ajuda a aprender melhor."],
      ["Quando organizamos aves, mamiferos e invertebrados, estamos:", "classificando animais", ["desenhando mapas", "plantando sementes", "medindo segmentos"], "Classificar e separar por caracteristicas."],
      ["Observar o desenvolvimento dos animais ajuda a entender:", "como eles crescem e mudam", ["que nascem sempre adultos", "que nao precisam de alimento", "que todos vivem iguais"], "Os animais passam por etapas de desenvolvimento."],
      ["As atividades adicionais desses temas ajudam o aluno a:", "comparar, identificar e explicar caracteristicas", ["apenas copiar palavras", "decorar nomes sem sentido", "esquecer os grupos"], "Atividades bem feitas ajudam a compreender melhor os grupos animais."]
    ];

    scienceQuestions.push(...buildQuestions("ciencias", "atividades_animais", "Atividades Adicionais sobre os Animais", "cie_at",
      extraEntries.map(entry => makeEntry(entry[0], entry[1], entry[2], entry[3], (v) => v))
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
      makeEntry(`Se queremos negar a existencia de uma janela, usamos:`, "There is not", ["There are not", "Are there", "There are"], `Para uma janela so, usamos a forma singular negativa.`, (v) => v),
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
      makeEntry(`Como perguntamos "Ha tres livros na mesa?"`, "Are there three books on the table?", ["Is there three books on the table?", "There are three books on the table?", "Are there a book on the table?"], `Para pergunta com plural usamos "Are there...?"`, (v) => v),
      makeEntry(`Complete: "__ there one apple in the bag?"`, "Is", ["Are", "There", "Do"], `Com uma maca, usamos "Is there".`, (v) => v),
      makeEntry(`Complete: "__ there five apples in the bag?"`, "Are", ["Is", "There", "Do"], `Com cinco macas, usamos "Are there".`, (v) => v),
      makeEntry(`Qual pergunta esta correta?`, "Is there a chair in the room?", ["Are there a chair in the room?", "There is a chair in the room?", "Is there chairs in the room?"], `Singular pede "Is there".`, (v) => v),
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

  const geographyQuestions = [
    ...buildQuestions("geografia", "povos_espacos", "Os Povos e os Espacos em que Vivem", "geo_pe", [
      ["O que pode influenciar o jeito de viver de um povo?", ["Apenas a cor da roupa", "O lugar onde vive e seus costumes", "Somente a idade das pessoas", "Apenas o nome da cidade"], 1, "O lugar, o clima, a natureza e os costumes ajudam a formar o modo de vida de cada povo."],
      ["Quem mora perto de um rio costuma usar mais esse espaco para:", ["pescar e se locomover", "andar de metro", "plantar no asfalto", "guardar neve"], 0, "Muitos grupos que vivem perto dos rios pescam e usam barcos para se deslocar."],
      ["Uma aldeia indigena pode estar localizada:", ["em diferentes regioes do Brasil", "somente no deserto", "apenas no centro de grandes cidades", "somente no exterior"], 0, "Os povos indigenas vivem em diferentes regioes brasileiras, em lugares variados."],
      ["Um bairro com muitos predios, lojas e ruas movimentadas faz parte mais comum de:", ["uma cidade", "uma floresta fechada", "uma caverna", "um acampamento de praia"], 0, "Predios, ruas e comercio sao elementos frequentes das cidades."],
      ["No campo, e comum encontrar:", ["plantacoes e criacao de animais", "muitos viadutos", "grandes aeroportos em toda parte", "arranha-ceus por todos os lados"], 0, "No campo sao comuns as areas de plantio, pasto e criacao de animais."],
      ["Os povos adaptam suas moradias e atividades ao lugar onde vivem porque:", ["cada lugar tem caracteristicas proprias", "todos os lugares sao iguais", "a natureza nao interfere na vida humana", "as pessoas nao escolhem como viver"], 0, "Cada lugar tem clima, relevo, vegetacao e recursos diferentes, que influenciam a vida das pessoas."],
      ["Ribeirinhos sao pessoas que vivem:", ["perto de rios", "no alto de montanhas nevadas", "apenas em capitais", "dentro de fabricas"], 0, "Ribeirinhos vivem em areas proximas aos rios e costumam ter forte relacao com eles."],
      ["Quando comparamos campo e cidade, podemos dizer que:", ["sao espacos com caracteristicas diferentes", "um deles nao tem pessoas", "os dois sao exatamente iguais", "apenas a cidade produz alimentos"], 0, "Campo e cidade tem organizacoes e paisagens diferentes, mas ambos sao importantes."],
      ["Uma comunidade que vive perto da floresta pode usar esse espaco para:", ["retirar recursos com cuidado e respeito", "construir predios em todas as arvores", "asfaltar todos os caminhos", "eliminar toda a vegetacao"], 0, "Muitas comunidades usam recursos da floresta com cuidado para manter seu modo de vida."],
      ["Em lugares muito quentes, as pessoas costumam:", ["usar roupas e habitos adequados ao clima", "andar sempre com roupa de neve", "ignorar completamente o clima", "morar apenas no subsolo"], 0, "O clima influencia roupas, horarios, casas e outras escolhas do dia a dia."],
      ["Uma praia, um rio e um mangue sao exemplos de:", ["espacos naturais diferentes", "tipos de carros", "nomes de bairros", "somente ruas da cidade"], 0, "Praia, rio e mangue sao ambientes naturais com caracteristicas proprias."],
      ["Quando um povo conhece muito bem o lugar onde vive, ele pode:", ["aprender a usar melhor os recursos desse lugar", "deixar de observar a natureza", "esquecer todos os caminhos", "nao precisar conviver com ninguem"], 0, "Conhecer o lugar ajuda a plantar, pescar, circular e viver melhor nele."],
      ["O espaco onde uma comunidade vive pode influenciar:", ["alimentacao, moradia e trabalho", "somente o nome das pessoas", "apenas a cor dos cadernos", "so o horario do recreio"], 0, "O lugar de vivencia influencia muitos aspectos do cotidiano."],
      ["Quem vive proximo ao mar pode ter atividades ligadas:", ["a pesca e aos barcos", "ao cultivo de neve", "a mineracao em cavernas de gelo", "ao transito de metro"], 0, "Em areas litoraneas, e comum a relacao com o mar, a pesca e as embarcacoes."],
      ["Uma mesma cidade pode ter:", ["grupos de pessoas com costumes diferentes", "apenas um tipo de moradia", "somente um tipo de trabalho", "uma unica rua"], 0, "Nas cidades convivem pessoas de origens, habitos e historias variadas."],
      ["Quando observamos um lugar, percebemos que ele tem:", ["elementos naturais e elementos construidos", "somente arvores", "somente carros", "apenas agua"], 0, "Os lugares podem ter natureza e tambem construcoes humanas."],
      ["Povos que vivem em regioes frias, quentes ou chuvosas podem:", ["adaptar seus costumes ao clima", "ter exatamente a mesma rotina em todos os lugares", "nao precisar de moradia", "viver sem observar o tempo"], 0, "O clima influencia a forma como as pessoas organizam o dia a dia."],
      ["Uma comunidade perto da mata pode conhecer bem:", ["plantas, trilhas e animais da regiao", "apenas nomes de ruas", "somente elevadores", "somente semaforos"], 0, "Quem vive perto da mata costuma conhecer melhor esse ambiente."],
      ["Os espacos em que os povos vivem mudam com o tempo porque:", ["a natureza e as pessoas transformam os lugares", "nada muda nunca", "somente os mapas mudam", "as casas andam sozinhas"], 0, "Os lugares mudam por causa da natureza e das acoes humanas."],
      ["Uma pracinha do bairro e um espaco de:", ["convivencia", "mineracao", "navegacao oceanica", "voo espacial"], 0, "A praca e um espaco de encontro, brincadeira e convivencia."],
      ["Quando dizemos que um povo tem forte ligacao com seu territorio, queremos dizer que:", ["o lugar e importante para sua vida e cultura", "o povo nao conhece o lugar", "o territorio e apenas decoracao", "as pessoas nunca usam esse espaco"], 0, "Para muitos povos, o territorio faz parte da historia, do trabalho e da cultura."],
      ["Moradias podem ser diferentes de um lugar para outro porque:", ["as necessidades e os materiais disponiveis mudam", "todas as casas precisam ser iguais", "o clima nao importa", "as pessoas nao escolhem onde morar"], 0, "Materiais, clima e costumes influenciam o tipo de moradia."],
      ["Um lugar com rios largos e muitas canoas mostra uma vida muito ligada:", ["a agua", "ao gelo", "ao deserto", "aos tuneis subterraneos"], 0, "Barcos e canoas indicam uma relacao forte com rios e aguas."],
      ["Os povos e os espacos em que vivem se relacionam porque:", ["as pessoas usam, cuidam e transformam os lugares", "os lugares nao fazem diferenca", "as pessoas vivem sem ocupar espacos", "somente os animais mudam os lugares"], 0, "As pessoas se relacionam com os lugares onde vivem de varias maneiras."],
      ["Comparar diferentes lugares ajuda a entender que:", ["existem muitos modos de viver", "todo mundo vive igual", "somente a cidade e importante", "o campo nao faz parte do pais"], 0, "Cada lugar tem caracteristicas proprias e isso cria diferentes modos de vida."]
    ]),
    ...buildQuestions("geografia", "populacoes_tradicionais", "As Populacoes Tradicionais", "geo_pt", [
      ["Populacoes tradicionais sao grupos que:", ["mantem costumes e saberes ligados ao territorio", "vivem apenas em predios altos", "nao possuem historia", "existem apenas em livros"], 0, "Populacoes tradicionais mantem modos de vida, costumes e saberes ligados ao lugar onde vivem."],
      ["Qual grupo e exemplo de populacao tradicional no Brasil?", ["ribeirinhos", "motoristas de formula 1", "astronautas", "pilotos de submarino"], 0, "Ribeirinhos sao um exemplo de populacao tradicional brasileira."],
      ["Povos indigenas sao importantes populacoes tradicionais porque:", ["fazem parte da historia e da diversidade do Brasil", "surgiram apenas recentemente", "vivem todos do mesmo jeito", "nao tem relacao com o territorio"], 0, "Os povos indigenas fazem parte da historia do Brasil e possuem grande diversidade cultural."],
      ["Quilombolas sao comunidades ligadas historicamente:", ["a resistencia de pessoas negras", "a exploracao do espaco sideral", "a navegacao em submarinos", "a vida em castelos medievais"], 0, "Comunidades quilombolas tem forte relacao com a resistencia historica de pessoas negras."],
      ["Uma caracteristica comum de muitas populacoes tradicionais e:", ["transmitir saberes de geracao em geracao", "mudar de idioma toda semana", "nao conhecer o lugar onde vivem", "evitar qualquer convivencia"], 0, "Esses conhecimentos costumam ser passados de geracao em geracao."],
      ["Ribeirinhos costumam viver:", ["nas margens dos rios", "apenas em avenidas largas", "no meio de desertos gelados", "somente dentro de shoppings"], 0, "Ribeirinhos vivem proximo aos rios."],
      ["Caiçaras vivem, em geral, em areas proximas:", ["ao litoral", "a geleiras", "a crateras vulcanicas", "a tunel de metro"], 0, "Caiçaras costumam viver em areas litoraneas, perto do mar e da mata."],
      ["Seringueiros ficaram conhecidos pelo trabalho de retirar:", ["latex da seringueira", "sal do fundo do mar", "carvao de fabrica", "neve das montanhas"], 0, "Seringueiros retiram latex da seringueira."],
      ["Muitos conhecimentos das populacoes tradicionais envolvem:", ["plantas, rios, florestas e clima", "apenas elevadores e arranha-ceus", "somente jogos eletronicos", "apenas estradas asfaltadas"], 0, "Essas populacoes costumam conhecer bem a natureza ao seu redor."],
      ["As populacoes tradicionais vivem exatamente todas do mesmo jeito?", ["nao, cada grupo tem costumes proprios", "sim, todas vivem igual", "sim, todas moram no mesmo lugar", "nao, porque nenhuma tem tradicoes"], 0, "Existem muitos grupos tradicionais, cada um com caracteristicas proprias."],
      ["O territorio e importante para as populacoes tradicionais porque:", ["faz parte de sua cultura e sobrevivencia", "serve apenas para passeio", "nao tem relacao com a vida delas", "e usado somente uma vez por ano"], 0, "O territorio esta ligado ao trabalho, a cultura e a memoria dessas populacoes."],
      ["Uma tradicao pode ser:", ["um costume mantido ao longo do tempo", "uma rua nova", "um poste de luz", "um tipo de elevador"], 0, "Tradicao e um costume, saber ou pratica que continua com o tempo."],
      ["As moradias das populacoes tradicionais podem variar porque:", ["dependem do ambiente e dos costumes locais", "todas precisam ser iguais", "a natureza nao interfere", "somente arquitetos escolhem"], 0, "Cada grupo se organiza de acordo com o lugar e seus costumes."],
      ["Uma comunidade quilombola ajuda a lembrar:", ["a luta e a resistencia do povo negro", "apenas brincadeiras de praia", "a vida nos polos", "o transito das metropoles"], 0, "As comunidades quilombolas guardam memorias importantes da resistencia negra."],
      ["O trabalho de muitas populacoes tradicionais costuma estar ligado:", ["a natureza e ao territorio", "somente ao metro e ao trem", "apenas a computadores industriais", "somente a aeroportos"], 0, "Pesca, plantio, coleta e extrativismo sao exemplos dessa ligacao."],
      ["O que significa dizer que um povo tem saberes tradicionais?", ["que ele guarda conhecimentos construidos ao longo do tempo", "que ele nao aprende nada", "que ele so conhece cidades grandes", "que esqueceu sua historia"], 0, "Saberes tradicionais sao conhecimentos acumulados e passados adiante."],
      ["As populacoes tradicionais ajudam a mostrar que o Brasil e:", ["diverso", "igual em todos os lugares", "formado por uma cultura so", "sem diferencas regionais"], 0, "Esses grupos mostram a grande diversidade cultural brasileira."],
      ["Uma comunidade que pesca, navega e conhece o tempo do rio pode ser:", ["ribeirinha", "subterranea", "espacial", "montanhista de neve"], 0, "Essas caracteristicas combinam com comunidades ribeirinhas."],
      ["Costumes como festas, cantos, comidas e historias fazem parte da:", ["cultura", "sinalizacao de transito", "engenharia de pontes", "meteorologia espacial"], 0, "Esses elementos fazem parte da cultura de um povo."],
      ["Muitas populacoes tradicionais usam os recursos naturais com:", ["conhecimento e experiencia", "descuido sempre", "medo de qualquer planta", "sem observar o ambiente"], 0, "Essas populacoes desenvolvem conhecimentos sobre o uso dos recursos do lugar."],
      ["Quem aprende com os mais velhos da comunidade esta ajudando a:", ["manter a tradicao", "apagar a memoria do grupo", "mudar o nome do rio", "destruir a paisagem"], 0, "Aprender com os mais velhos ajuda a manter conhecimentos e costumes."],
      ["As populacoes tradicionais podem viver:", ["no campo, na floresta, no litoral e perto dos rios", "somente em capitais", "somente em outros paises", "apenas em desertos"], 0, "Esses grupos vivem em diferentes territorios do Brasil."],
      ["O respeito as populacoes tradicionais e importante porque:", ["seus modos de vida merecem valorizacao", "seus conhecimentos nao contam", "so a vida urbana importa", "nao fazem parte do Brasil"], 0, "Essas populacoes fazem parte da sociedade brasileira e merecem respeito."],
      ["Quando uma comunidade preserva sua lingua, suas historias e seus costumes, ela esta:", ["mantendo sua identidade cultural", "apagando sua memoria", "deixando de existir", "imitando todas as outras"], 0, "A identidade cultural aparece nos costumes, na lingua e nas tradicoes."],
      ["Aprender sobre populacoes tradicionais ajuda a:", ["conhecer melhor a diversidade do Brasil", "achar que todos vivem iguais", "esquecer a historia do pais", "valorizar so as grandes cidades"], 0, "Esse estudo ajuda a compreender melhor o pais e seus diferentes grupos."]
    ]),
    ...buildQuestions("geografia", "importancia_pop_trad", "A Importancia das Populacoes Tradicionais", "geo_ip", [
      ["Por que as populacoes tradicionais sao importantes para o Brasil?", ["porque ajudam a preservar culturas e conhecimentos", "porque vivem todas na mesma cidade", "porque nao usam a natureza", "porque nao fazem parte da historia"], 0, "Elas ajudam a preservar culturas, historias e conhecimentos valiosos."],
      ["Muitos conhecimentos sobre plantas e natureza foram mantidos por:", ["populacoes tradicionais", "semaforos", "arranha-ceus", "foguetes"], 0, "Diversas populacoes tradicionais guardam conhecimentos sobre plantas e ambientes."],
      ["Valorizar as populacoes tradicionais e importante para:", ["respeitar a diversidade cultural", "fazer todos viverem do mesmo jeito", "apagar costumes antigos", "esquecer a historia"], 0, "Valorizar esses grupos e respeitar a diversidade cultural do pais."],
      ["Quando uma comunidade protege um rio ou uma floresta, ela pode estar ajudando:", ["o meio ambiente", "o aumento da poluicao", "a destruicao da paisagem", "o desaparecimento da natureza"], 0, "O cuidado com rios e florestas ajuda na preservacao ambiental."],
      ["As populacoes tradicionais ensinam que e possivel:", ["viver com respeito ao lugar onde se mora", "usar a natureza sem pensar", "poluir todos os rios", "derrubar toda a mata"], 0, "Muitos desses grupos mostram formas cuidadosas de uso do territorio."],
      ["A comida, o artesanato e as festas tradicionais ajudam a conservar:", ["a cultura", "somente o transito", "apenas o horario escolar", "somente a iluminacao publica"], 0, "Esses elementos fazem parte da cultura e da identidade de um povo."],
      ["Quando respeitamos os povos tradicionais, estamos respeitando tambem:", ["suas historias e identidades", "somente suas casas", "apenas seus nomes", "somente seus sapatos"], 0, "Respeitar os povos tradicionais e respeitar sua historia, cultura e modo de vida."],
      ["Os saberes tradicionais podem ajudar as novas geracoes a:", ["aprender sobre natureza e convivencia", "esquecer o lugar onde vivem", "viver sem cultura", "nao cuidar de nada"], 0, "Esses saberes podem ensinar sobre natureza, trabalho e vida em comunidade."],
      ["Muitas populacoes tradicionais cuidam do territorio porque:", ["dependem dele para viver", "nao conhecem esse lugar", "querem abandonar a regiao", "usam o territorio so em ferias"], 0, "O territorio e fundamental para sua vida, cultura e trabalho."],
      ["Aprender sobre quilombolas, indigenas e ribeirinhos nos ajuda a:", ["entender melhor a formacao do Brasil", "achar que o Brasil tem um povo so", "pensar que so a cidade importa", "esquecer os outros grupos"], 0, "Esses grupos ajudam a compreender a historia e a diversidade do pais."],
      ["Uma comunidade que conhece o tempo da chuva, do rio e da plantacao tem um saber importante sobre:", ["a natureza", "o espaco sideral", "somente videogames", "apenas sinais de transito"], 0, "Esse tipo de conhecimento vem da observacao da natureza ao longo do tempo."],
      ["As populacoes tradicionais podem contribuir para a preservacao de:", ["florestas, rios e costumes", "apenas estacionamentos", "somente semaforos", "predios abandonados"], 0, "Elas ajudam a preservar ambientes e tambem tradicoes culturais."],
      ["Quando um povo mantem sua memoria viva, ele ajuda a proteger:", ["sua identidade", "apenas o nome da rua", "somente um objeto", "nenhum costume"], 0, "Memoria e identidade caminham juntas."],
      ["O artesanato tradicional e importante porque:", ["expressa cultura e conhecimentos", "serve apenas para decorar vitrines", "nao tem relacao com a historia", "substitui toda forma de trabalho"], 0, "O artesanato pode mostrar costumes, materiais do lugar e identidades."],
      ["Conhecer populacoes tradicionais ajuda a combater:", ["o preconceito", "o respeito", "a convivencia", "a curiosidade"], 0, "Quando conhecemos melhor os outros grupos, fica mais facil combater preconceitos."],
      ["Uma floresta preservada pode ser importante para muitos povos porque:", ["fornece recursos e faz parte de sua vida", "nao tem utilidade nenhuma", "existe apenas para fotos", "nao se relaciona com ninguem"], 0, "Muitos povos dependem da floresta para viver e manter sua cultura."],
      ["As populacoes tradicionais mostram que o conhecimento tambem pode ser aprendido:", ["na experiencia e na convivenca", "somente em elevadores", "apenas em lojas", "somente em aeroportos"], 0, "O conhecimento tambem e construido no dia a dia, na observacao e na convivenca."],
      ["Respeitar o modo de vida de outros povos significa:", ["entender que existem diferentes formas de viver", "achar que todos precisam viver igual", "nao ouvir ninguem", "rir dos costumes alheios"], 0, "Existem diferentes modos de vida, e todos merecem respeito."],
      ["A preservacao de cantos, dancas e historias tradicionais e importante porque:", ["guarda a memoria cultural", "apaga a identidade do povo", "nao ensina nada", "serve apenas para o passado"], 0, "Esses elementos ajudam a manter viva a memoria cultural."],
      ["Quando uma comunidade conhece plantas da regiao, esse saber pode ser importante para:", ["alimentacao e cuidados do dia a dia", "destruir a mata", "aumentar a poluicao", "esquecer o lugar"], 0, "Conhecer plantas pode ajudar na alimentacao e em usos tradicionais do cotidiano."],
      ["As populacoes tradicionais sao importantes tambem porque:", ["ensinam sobre respeito a natureza", "mostram que a natureza nao importa", "vivem sem comunidade", "nao tem costumes"], 0, "Muitos desses grupos ensinam formas de relacao cuidadosa com o ambiente."],
      ["A diversidade de povos no Brasil faz o pais ser:", ["mais rico culturalmente", "igual em todos os lugares", "sem historia", "formado por uma cultura unica"], 0, "A diversidade cultural torna o pais mais rico em saberes e tradicoes."],
      ["Ao estudar populacoes tradicionais, aprendemos que os territorios podem guardar:", ["memorias, costumes e saberes", "apenas carros", "somente postes", "somente placas"], 0, "Os territorios guardam historias e modos de vida."],
      ["Uma escola que valoriza povos tradicionais ajuda os alunos a serem:", ["mais respeitosos e atentos a diversidade", "menos curiosos", "mais preconceituosos", "indiferentes a cultura"], 0, "Valorizar esses temas ajuda a formar respeito e empatia."],
      ["Proteger culturas tradicionais e importante para que:", ["elas continuem vivas no presente e no futuro", "desaparecam mais rapido", "todo mundo esqueca suas origens", "somente os adultos aprendam"], 0, "A protecao cultural ajuda esses conhecimentos e costumes a continuarem vivos."]
    ]),
    ...buildQuestions("geografia", "campo_cidade", "Campo e Cidade", "geo_cc", [
      ["No campo, e mais comum encontrar:", ["areas de plantio", "grandes viadutos", "muitos arranha-ceus", "linhas de metro em toda parte"], 0, "No campo sao comuns os espacos de plantio e criacao de animais."],
      ["Na cidade, e mais comum encontrar:", ["predios, lojas e avenidas", "grandes pastagens em todas as ruas", "plantacoes em cada quarteirao", "somente trilhas na mata"], 0, "Predios, comercio e avenidas sao comuns nas cidades."],
      ["Campo e cidade se relacionam porque:", ["um depende do outro", "nao tem nenhuma ligacao", "ficam sempre em paises diferentes", "um deles nao tem pessoas"], 0, "Campo e cidade trocam produtos, servicos e pessoas."],
      ["Um alimento como o arroz geralmente comeca a ser produzido:", ["no campo", "na lua", "num viaduto", "no estacionamento"], 0, "Muitos alimentos sao produzidos no campo."],
      ["Muitas lojas, escolas e hospitais se concentram mais:", ["na cidade", "no fundo do rio", "na copa das arvores", "somente em cavernas"], 0, "Esses servicos costumam aparecer em maior quantidade nas cidades."],
      ["Uma diferenca entre campo e cidade e que:", ["as paisagens costumam ser diferentes", "os dois sao iguais em tudo", "somente o campo tem pessoas", "somente a cidade tem natureza"], 0, "Campo e cidade possuem paisagens e atividades diferentes."],
      ["O leite que chega ao mercado muitas vezes vem:", ["do campo", "de um vulcao", "do mar profundo", "do telhado da escola"], 0, "Produtos como leite costumam vir da criacao de animais no campo."],
      ["Quem mora na cidade tambem depende do campo porque:", ["precisa de alimentos e materias-primas", "nao usa nada vindo da natureza", "produz tudo sozinho em casa", "vive sem agua e comida"], 0, "A cidade depende do campo para receber muitos produtos."],
      ["Quem mora no campo tambem pode depender da cidade para:", ["acessar alguns servicos e comércios", "plantar nuvens", "pescar no deserto", "morar em submarino"], 0, "Campo e cidade trocam produtos e servicos."],
      ["Uma feira com frutas, legumes e verduras mostra a ligacao entre:", ["campo e cidade", "praia e deserto", "ceu e oceano", "montanha e lua"], 0, "Muitos alimentos produzidos no campo sao vendidos na cidade."],
      ["No campo, e comum haver trabalhos ligados:", ["a agricultura", "apenas ao transito", "somente a elevadores", "a voos espaciais"], 0, "A agricultura e uma atividade frequente no campo."],
      ["Na cidade, e comum encontrar mais:", ["comercio e servicos", "grandes areas de pasto em toda parte", "somente barcos de pesca", "somente ocas"], 0, "Comercio e servicos sao bastante presentes nas cidades."],
      ["O caminho do alimento ate nossa casa pode envolver:", ["producao no campo e venda na cidade", "nascimento no semaforo", "producao no elevador", "cultivo no asfalto"], 0, "Muitos alimentos sao produzidos no campo e vendidos na cidade."],
      ["As pessoas do campo e da cidade podem ter:", ["rotinas diferentes", "exatamente as mesmas atividades em todos os dias", "a mesma paisagem em volta", "somente o mesmo tipo de trabalho"], 0, "As rotinas variam conforme o lugar e as atividades realizadas."],
      ["Uma criacao de galinhas e exemplo de atividade mais comum:", ["no campo", "no meio de um viaduto", "dentro do cinema", "sob a areia da praia"], 0, "A criacao de animais e uma atividade comum no campo."],
      ["Um predio com muitos apartamentos e mais comum:", ["na cidade", "no meio da floresta", "no fundo do rio", "num pasto"], 0, "Edificios com varios apartamentos sao mais comuns nas cidades."],
      ["Campo e cidade fazem parte:", ["do mesmo pais e da vida das pessoas", "de planetas diferentes", "de mundos sem relacao", "de historias sem pessoas"], 0, "Campo e cidade fazem parte da organizacao do espaco geográfico."],
      ["Quando compramos pao na padaria, podemos lembrar que o trigo veio:", ["da natureza e do campo", "do fundo do oceano", "de um estacionamento", "de um tunel"], 0, "O trigo e um produto agricola ligado ao campo."],
      ["Uma area com poucas casas espalhadas e muito terreno pode indicar:", ["campo", "centro de metropole", "shopping subterraneo", "porto espacial"], 0, "Espacos mais abertos e com menos construcao costumam aparecer no campo."],
      ["Uma area com ruas, semaforos e muitos carros pode indicar:", ["cidade", "roca", "mata fechada", "aldeia em floresta"], 0, "Esses elementos sao comuns na paisagem urbana."],
      ["As escolas podem existir no campo e na cidade porque:", ["as pessoas vivem nos dois espacos", "so a cidade tem criancas", "so o campo tem familias", "apenas um lugar precisa estudar"], 0, "Tanto no campo quanto na cidade existem familias, criancas e escolas."],
      ["A cidade envia ao campo, entre outras coisas:", ["servicos e produtos industrializados", "rios e montanhas", "sementes de nuvem", "areia do deserto"], 0, "A cidade tambem envia mercadorias e servicos ao campo."],
      ["O campo envia a cidade, entre outros produtos:", ["alimentos", "predios prontos", "linhas de metro", "semaforos cultivados"], 0, "O campo fornece alimentos e materias-primas para a cidade."],
      ["Comparar campo e cidade ajuda a perceber:", ["aproximacoes e diferencas", "que um dos dois nao existe", "que sao exatamente o mesmo lugar", "que nenhum deles muda"], 0, "Os dois espacos tem diferencas, mas tambem se relacionam."],
      ["Uma das ideias mais importantes sobre campo e cidade e que:", ["os dois sao importantes para a vida em sociedade", "somente a cidade importa", "somente o campo existe", "um deve acabar com o outro"], 0, "Campo e cidade sao espacos importantes e interligados."]
    ]),
    ...buildQuestions("geografia", "paisagens_transformacao", "Paisagens em Transformacao", "geo_pa", [
      ["Uma paisagem natural e aquela em que aparecem mais:", ["rios, morros e vegetacao", "predios e avenidas", "semaforos e viadutos", "shoppings e estacionamentos"], 0, "Paisagens naturais apresentam elementos da natureza."],
      ["Uma paisagem humanizada e aquela que foi mais transformada por:", ["acoes humanas", "somente o vento", "apenas a chuva", "somente o sol"], 0, "Paisagens humanizadas mostram forte acao das pessoas."],
      ["Uma ponte construida sobre um rio e exemplo de:", ["transformacao da paisagem", "animal em migracao", "fenomeno do espaco", "chuva de granizo"], 0, "A construcao de uma ponte muda a paisagem."],
      ["A chuva forte pode mudar uma paisagem quando:", ["forma enxurradas ou desgasta o solo", "constroi predios sozinha", "pinta muros", "apaga rios do mapa"], 0, "Processos naturais, como a chuva, podem transformar os lugares."],
      ["Quando uma area com mata vira bairro, houve:", ["mudanca na paisagem", "apenas troca de nome", "nenhuma transformacao", "somente mudanca de cor do ceu"], 0, "A construcao de um bairro modifica a paisagem."],
      ["Montanhas, rios e lagos sao exemplos de elementos:", ["naturais", "industriais", "digitais", "subterraneos artificiais"], 0, "Esses sao elementos da natureza."],
      ["Casas, ruas e pontes sao elementos:", ["construidos pelas pessoas", "nascidos sozinhos na natureza", "apenas imaginarios", "tipicos do fundo do mar"], 0, "Esses elementos foram construidos pelos seres humanos."],
      ["Uma plantacao em grande area mostra uma paisagem:", ["transformada pelo trabalho humano", "sem nenhuma acao humana", "feita apenas pelo vento", "totalmente submarina"], 0, "O plantio modifica a paisagem original."],
      ["O crescimento de uma cidade pode causar:", ["mais construcoes e mudancas no lugar", "desaparecimento de todas as pessoas", "parada completa do tempo", "fim de toda agua do planeta"], 0, "Quando a cidade cresce, a paisagem costuma mudar bastante."],
      ["O rio, o clima e o relevo fazem parte de processos:", ["naturais", "somente escolares", "industriais apenas", "inventados"], 0, "Sao elementos e processos ligados a natureza."],
      ["Uma estrada aberta no meio da mata e exemplo de:", ["paisagem humanizada", "animal em repouso", "chuva leve", "nuvem baixa"], 0, "A estrada foi feita por pessoas e mudou a paisagem."],
      ["A paisagem do bairro pode mudar com o tempo por causa de:", ["obras, chuvas e crescimento da populacao", "somente o nome da rua", "apenas a troca de uniforme", "somente as ferias"], 0, "Obras e processos naturais podem transformar o bairro."],
      ["Uma enchente pode modificar a paisagem porque:", ["a agua ocupa e altera espacos", "constroi escolas novas", "planta arvores sozinha", "faz surgir montanhas"], 0, "A agua pode alterar ruas, margens e outras partes da paisagem."],
      ["Uma praca com arvores, bancos e brinquedos mistura elementos:", ["naturais e construidos", "somente naturais", "somente marinhos", "somente espaciais"], 0, "A praca mistura vegetacao com estruturas feitas pelas pessoas."],
      ["As paisagens dos lugares onde vivemos:", ["podem mudar ao longo do tempo", "nunca se transformam", "sao sempre identicas", "nao tem historia"], 0, "As paisagens mudam por acao humana e por processos naturais."],
      ["Quando nasce um loteamento novo, a paisagem costuma ganhar:", ["mais ruas e casas", "mais geleiras", "mais crateras", "mais ondas do mar"], 0, "Novas moradias e ruas transformam a paisagem."],
      ["Uma mata preservada e um exemplo mais proximo de paisagem:", ["natural", "industrial", "subterranea", "digital"], 0, "Ela apresenta predominio de elementos naturais."],
      ["Uma area com predios, asfalto e postes e mais parecida com uma paisagem:", ["humanizada", "selvagem intocada", "marinha", "desertica gelada"], 0, "Esses elementos mostram forte transformacao humana."],
      ["O deslizamento de terra e um exemplo de processo:", ["natural", "causado por semaforo", "feito por elevadores", "inventado em laboratorio escolar"], 0, "Deslizamentos sao processos naturais, embora possam ser agravados por acoes humanas."],
      ["Observar fotos antigas e atuais de um lugar ajuda a perceber:", ["as transformacoes da paisagem", "que nada mudou", "somente a cor do papel", "apenas o horario do dia"], 0, "Comparar imagens ajuda a identificar mudancas ocorridas com o tempo."],
      ["Uma represa, uma ponte e uma avenida mostram:", ["acao humana na paisagem", "ausencia de pessoas", "somente vegetacao", "paisagem sem historia"], 0, "Essas obras transformam os lugares."],
      ["A natureza tambem muda os lugares por meio de:", ["vento, chuva e rios", "apenas canetas", "somente escadas", "apenas semaforos"], 0, "Vento, chuva e agua sao exemplos de agentes naturais."],
      ["As pessoas transformam a paisagem quando:", ["constroem, plantam e abrem caminhos", "ficam olhando o ceu", "nao usam nenhum espaco", "apenas contam historias"], 0, "Construcoes e atividades humanas alteram os lugares."],
      ["Entender as paisagens ajuda a conhecer:", ["como um lugar e e como ele mudou", "somente o nome das pessoas", "apenas o horario da escola", "somente o numero das casas"], 0, "A paisagem revela caracteristicas e transformacoes do lugar."],
      ["Quando cuidamos de uma paisagem, estamos ajudando a:", ["preservar o lugar", "destruir o ambiente", "aumentar o lixo", "apagar a historia"], 0, "Cuidar do lugar ajuda a mante-lo melhor para todos."]
    ]),
    ...buildQuestions("geografia", "trabalho_recursos", "Trabalho e Produtos da Natureza", "geo_tr", [
      ["Frutas, verduras e legumes sao produtos que podem vir:", ["da natureza e do trabalho no campo", "de semaforos", "de estacionamentos", "de tuneis de metro"], 0, "Muitos alimentos vem da natureza e do trabalho das pessoas no campo."],
      ["A pesca e um trabalho ligado principalmente:", ["a rios, lagos e mares", "a desertos gelados", "a avenidas", "a arranha-ceus"], 0, "A pesca depende de ambientes com agua."],
      ["O agricultor trabalha, em geral, com:", ["plantio e cuidado da terra", "pilotagem de submarinos", "construcao de foguetes", "controle de semaforos"], 0, "O agricultor planta e cuida da producao agrícola."],
      ["A madeira, quando retirada com cuidado e autorizacao, vem:", ["das arvores", "das nuvens", "do asfalto", "dos postes"], 0, "A madeira vem das arvores e deve ser usada com responsabilidade."],
      ["O peixe que comemos pode ser um produto obtido por meio da:", ["pesca", "mineracao", "montagem de predios", "fabricacao de tijolos"], 0, "A pesca e uma atividade que fornece peixes."],
      ["O leite e um produto ligado ao trabalho com:", ["criacao de animais", "viadutos", "barcos de corrida", "montanhas nevadas"], 0, "O leite vem da criacao de animais, como vacas."],
      ["Extrativismo e uma atividade em que as pessoas retiram da natureza:", ["produtos como frutos, latex e castanhas", "apenas predios", "somente carros", "apenas placas"], 0, "No extrativismo, retiram-se recursos naturais como frutos, sementes e latex."],
      ["Uma pessoa que planta feijao esta trabalhando com:", ["agricultura", "navegacao aerea", "mineracao marinha", "transito urbano"], 0, "Plantar faz parte da agricultura."],
      ["A argila usada para fazer tijolos e um recurso retirado:", ["da natureza", "de televisores", "de elevadores", "de semaforos"], 0, "A argila e um recurso natural usado na producao de materiais."],
      ["Castanha, acai e borracha podem ser exemplos de produtos do:", ["extrativismo", "asfalto", "transito", "espaco sideral"], 0, "Esses sao produtos que podem ser obtidos por atividades extrativistas."],
      ["Quando dizemos que um produto vem da natureza, queremos dizer que ele:", ["tem origem em elementos naturais", "nasceu no supermercado", "foi criado pelo semaforo", "surgiu do nada"], 0, "Produtos da natureza tem origem em plantas, animais, minerais ou outros elementos naturais."],
      ["A agua e importante para a agricultura porque:", ["ajuda no crescimento das plantas", "substitui todo tipo de solo", "faz nascer predios", "troca sementes por cimento"], 0, "As plantas precisam de agua para crescer."],
      ["Uma mina e um lugar de onde podem ser retirados:", ["minerais", "peixes", "galinhas", "livros"], 0, "Minerais sao recursos retirados do subsolo."],
      ["O mel e um produto ligado ao trabalho de:", ["abelhas e apicultores", "peixes e pescadores", "mineiros", "pedreiros"], 0, "O mel envolve a producao das abelhas e o trabalho da apicultura."],
      ["A mandioca pode ser usada para fazer:", ["farinha", "cimento", "gasolina", "vidro"], 0, "A mandioca e um alimento que pode ser transformado em farinha."],
      ["Quando compramos um caderno, podemos lembrar que o papel vem principalmente:", ["da madeira", "da agua do mar", "do ferro", "do plastico apenas"], 0, "O papel costuma ser produzido a partir da madeira."],
      ["A criacao de galinhas pode fornecer:", ["ovos", "ouro", "sal", "tijolos"], 0, "A criacao de galinhas pode fornecer ovos."],
      ["O sal de cozinha pode ser retirado:", ["da natureza", "apenas das padarias", "somente dos rios de montanha", "de livros antigos"], 0, "O sal e um recurso natural."],
      ["Respeitar o tempo da natureza e importante no trabalho porque:", ["muitos produtos dependem do clima e das estacoes", "a natureza nao interfere em nada", "tudo nasce em um dia", "nao existe plantio"], 0, "Clima e estacoes influenciam plantio, colheita e outras atividades."],
      ["O barro pode ser usado para fazer:", ["tijolos e vasos", "peixes e leite", "papel e borracha", "semaforos e avioes"], 0, "O barro ou argila e usado em tijolos, telhas e vasos."],
      ["Uma pessoa que coleta frutos na floresta pode estar realizando:", ["extrativismo", "aviacao", "urbanizacao", "cartografia"], 0, "Coletar frutos na floresta e um exemplo de extrativismo."],
      ["O trabalho humano transforma produtos da natureza quando:", ["leva a materia-prima para o uso no dia a dia", "faz a natureza desaparecer", "impede todas as colheitas", "retira o clima do lugar"], 0, "O trabalho ajuda a transformar recursos naturais em produtos usados pelas pessoas."],
      ["Uma horta escolar mostra que os alimentos:", ["podem ser cultivados com cuidado", "nascem prontos no mercado", "vem das ruas asfaltadas", "aparecem sem plantio"], 0, "Uma horta mostra o cultivo dos alimentos."],
      ["A pesca, a agricultura e o extrativismo sao atividades ligadas:", ["ao uso de recursos naturais", "somente a grandes predios", "apenas ao transito intenso", "somente a internet"], 0, "Essas atividades dependem da natureza e do trabalho das pessoas."],
      ["Aprender de onde vem os produtos que usamos ajuda a:", ["valorizar o trabalho e a natureza", "achar que tudo nasce nas lojas", "esquecer o campo", "desprezar quem produz"], 0, "Conhecer a origem dos produtos ajuda a valorizar quem produz e o ambiente."]
    ])
  ];

  questions.push(...geographyQuestions);

  const SUBJECT_META = {
    portugues:  { name: "Português",   icon: "📖", available: true  },
    matematica: { name: "Matemática",  icon: "🔢", available: true  },
    historia:   { name: "História",    icon: "🏛️", available: false },
    ciencias:   { name: "Ciências",    icon: "🔬", available: true  },
    ingles:     { name: "Inglês",      icon: "🌍", available: true  },
    geografia:  { name: "Geografia",   icon: "🗺️", available: true  }
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
    genero:               { name: "Substantivos Masculino e Feminino", icon: "👫" },
    subtracao_reserva:    { name: "Subtração com Reserva", icon: "➖" },
    subtracao_milhar:     { name: "Subtraindo com Milhar", icon: "🏦" },
    problemas_adicao_subtracao: { name: "Problemas com Adição e Subtração", icon: "🧠" },
    multiplicacao_basica: { name: "Multiplicação - Operações Básicas", icon: "✖️" },
    multiplicacao_problemas: { name: "Multiplicação e Problemas", icon: "📦" },
    multiplicacao_reserva: { name: "Multiplicação com Reserva", icon: "🔢" },
    circulos_circunferencias: { name: "Círculos e Circunferências", icon: "⭕" },
    segmentos_reta:       { name: "Segmentos de Reta", icon: "📏" },
    comprimento_segmentos:{ name: "Comprimento dos Segmentos de Reta", icon: "📐" },
    aves:                 { name: "Características e Desenvolvimento das Aves", icon: "🐦" },
    mamiferos:            { name: "Características e Desenvolvimento dos Mamíferos", icon: "🐶" },
    invertebrados:        { name: "Estudo dos Invertebrados", icon: "🪲" },
    poriferos:            { name: "Características e Desenvolvimento dos Poríferos", icon: "🧽" },
    cnidarios:            { name: "Características e Desenvolvimento dos Cnidários", icon: "🌊" },
    atividades_animais:   { name: "Atividades Adicionais sobre os Animais", icon: "🔎" },
    easter_eggs:          { name: "Celebrations - Easter Eggs", icon: "🥚" },
    parts_house:          { name: "Parts of House", icon: "🏠" },
    there_is_are:         { name: "There is / There are", icon: "🧩" },
    there_negative:       { name: "There is / There are / Negative Form", icon: "🚫" },
    there_interrogative:  { name: "There is / There are / Interrogative Form", icon: "❓" },
    mothers_day:          { name: "Celebrations - Mother's Day", icon: "💐" },
    food:                 { name: "Food", icon: "🍎" },
    colors:               { name: "Colors", icon: "🎨" },
    povos_espacos:        { name: "Os Povos e os Espaços em que Vivem", icon: "🧭" },
    populacoes_tradicionais: { name: "As Populações Tradicionais", icon: "🏘️" },
    importancia_pop_trad: { name: "A Importância das Populações Tradicionais", icon: "🌱" },
    campo_cidade:         { name: "Campo e Cidade", icon: "🏙️" },
    paisagens_transformacao: { name: "Paisagens em Transformação", icon: "🌄" },
    trabalho_recursos:    { name: "Trabalho e Produtos da Natureza", icon: "🧺" }
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
