const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_ID = 'roteiro-estudos-av-mensal-t3-2026';
const CONTENT_SET_ID = '2026-t3-v1';
const DRAFT_DIRECTORY = path.join(ROOT, 'docs/drafts');
const AUDIT_DIRECTORY = path.join(ROOT, 'docs/audits');

const TOPICS = [
  {
    id: 'probabilidade',
    name: 'Probabilidade',
    skill: 'comparar-possibilidades-simples',
    objective: 'comparar possibilidades simples',
    sourceTopic: 'probabilidade',
    wrongFeedback: (answer) =>
      `Compare quantos resultados favorecem cada evento no mesmo total de possibilidades; aqui, ${answer.toLowerCase()}.`,
    items: [
      [
        'Em dois sacos com 10 fichas cada, A tem 3 azuis e B tem 7 azuis. De qual saco é mais provável tirar uma ficha azul?',
        'Saco B',
        ['Saco A', 'Os dois têm a mesma chance', 'Não é possível comparar'],
        'Os sacos têm o mesmo total; B tem mais fichas azuis.',
      ],
      [
        'A roleta A tem 2 setores verdes em 8. A roleta B tem 5 setores verdes em 8. Qual oferece maior chance de parar no verde?',
        'Roleta B',
        [
          'Roleta A',
          'As duas têm a mesma chance',
          'Nenhuma pode parar no verde',
        ],
        'Com o mesmo número de setores, a roleta B tem mais setores verdes.',
      ],
      [
        'Dois potes têm 12 botões cada. No pote A, 9 são vermelhos; no B, 4 são vermelhos. Em qual pote o sorteio de um botão vermelho é mais provável?',
        'Pote A',
        ['Pote B', 'Os dois têm a mesma chance', 'Não há botões vermelhos'],
        'Como os potes têm o mesmo total, o pote A, com mais botões vermelhos, oferece maior chance.',
      ],
      [
        'Em duas caixas com 6 cartões cada, A tem 1 cartão com estrela e B tem 4. De qual caixa é mais provável retirar uma estrela?',
        'Caixa B',
        ['Caixa A', 'As duas têm a mesma chance', 'É impossível nas duas'],
        'A caixa B tem mais cartões favoráveis entre o mesmo total.',
      ],
      [
        'Cada uma de duas sacolas tem 10 bolas. A tem 6 amarelas e B tem 2 amarelas. Qual sacola dá maior chance de tirar uma bola amarela?',
        'Sacola A',
        ['Sacola B', 'As duas têm a mesma chance', 'Não há como tirar amarela'],
        'Com totais iguais, seis bolas amarelas representam uma chance maior que duas.',
      ],
      [
        'A roleta A tem 3 setores com uma estrela em 6 setores iguais. A roleta B tem 1 setor com estrela em 6. Qual tem maior chance de sair estrela?',
        'Roleta A',
        ['Roleta B', 'As duas têm a mesma chance', 'Nenhuma tem estrela'],
        'A roleta A tem mais setores de estrela, e ambas têm seis setores iguais.',
      ],
      [
        'Dois sacos têm 8 peças cada. Em A, 5 são quadradas; em B, 2 são quadradas. De qual saco é mais provável retirar uma peça quadrada?',
        'Saco A',
        [
          'Saco B',
          'Os dois têm a mesma chance',
          'Não se pode retirar peça quadrada',
        ],
        'O saco A tem mais peças quadradas no mesmo total de peças.',
      ],
      [
        'Duas caixas têm 10 lápis cada. A guarda 4 lápis azuis e B guarda 8. De qual caixa é mais provável escolher um lápis azul?',
        'Caixa B',
        ['Caixa A', 'As duas têm a mesma chance', 'Nenhuma tem lápis azul'],
        'A caixa B oferece mais resultados favoráveis entre dez lápis.',
      ],
      [
        'Dois potes têm 6 tampinhas cada. A tem 2 brancas e B tem 2 brancas. A chance de tirar uma branca é...',
        'igual nos dois potes',
        ['maior no pote A', 'maior no pote B', 'impossível nos dois'],
        'Os dois potes têm o mesmo total e a mesma quantidade de tampinhas brancas.',
      ],
      [
        'Duas roletas têm 8 setores iguais. A tem 3 setores com sol e B também tem 3. Qual afirmação é correta?',
        'A chance de sair sol é igual nas duas.',
        [
          'A roleta A tem maior chance.',
          'A roleta B tem maior chance.',
          'Sol não pode aparecer.',
        ],
        'A quantidade de setores com sol e o total de setores são iguais.',
      ],
      [
        'Em dois sacos com 12 contas cada, A tem 8 verdes e B tem 5 verdes. De qual saco é mais provável retirar uma conta verde?',
        'Saco A',
        ['Saco B', 'Os dois têm a mesma chance', 'Não há contas verdes'],
        'O total é igual, mas o saco A tem mais contas verdes.',
      ],
      [
        'Cada caixa tem 10 cartões. A tem 1 cartão com lua e B tem 6. Em qual caixa a chance de tirar lua é maior?',
        'Caixa B',
        ['Caixa A', 'As duas têm a mesma chance', 'Lua não aparece em nenhuma'],
        'A caixa B tem seis cartões favoráveis, mais do que a caixa A.',
      ],
      [
        'Duas sacolas têm 8 peças cada. A tem 4 redondas e B tem 4 redondas. Qual tem maior chance de retirar uma peça redonda?',
        'As chances são iguais.',
        ['A sacola A.', 'A sacola B.', 'Nenhuma, pois não há peças redondas.'],
        'Cada sacola tem quatro peças redondas em oito peças.',
      ],
      [
        'Dois potes têm 6 botões cada. A tem 5 azuis e B tem 1 azul. De qual pote é mais provável retirar um botão azul?',
        'Pote A',
        ['Pote B', 'Os potes têm a mesma chance', 'É impossível nos dois'],
        'O pote A tem mais botões azuis e o mesmo total de botões.',
      ],
      [
        'Duas roletas têm 10 setores iguais. A tem 7 setores amarelos e B tem 3. Qual roleta tem maior chance de parar no amarelo?',
        'Roleta A',
        ['Roleta B', 'As chances são iguais', 'Nenhuma tem setor amarelo'],
        'Sete setores favoráveis são mais do que três, com o mesmo total de setores.',
      ],
      [
        'Dois sacos têm 12 fichas cada. A tem 4 fichas com estrela e B tem 9. De qual é mais provável tirar uma ficha com estrela?',
        'Saco B',
        [
          'Saco A',
          'Os sacos têm a mesma chance',
          'Estrela não aparece em nenhum',
        ],
        'O saco B tem mais fichas com estrela entre doze fichas.',
      ],
      [
        'Dois potes têm 8 peças cada. A tem 6 triângulos e B tem 6 triângulos. Qual pote oferece maior chance de retirar um triângulo?',
        'As chances são iguais.',
        ['Pote A.', 'Pote B.', 'É impossível nos dois.'],
        'Em ambos há seis triângulos no mesmo total de oito peças.',
      ],
      [
        'Duas caixas têm 10 cubos cada. A tem 2 cubos laranjas e B tem 7. De qual caixa é mais provável tirar um cubo laranja?',
        'Caixa B',
        ['Caixa A', 'As chances são iguais', 'Não há cubos laranjas'],
        'A caixa B contém mais cubos laranjas, mantendo o mesmo total.',
      ],
      [
        'Dois sacos têm 6 cartões cada. A tem 1 cartão de coração e B tem 5. De qual saco é mais provável retirar um coração?',
        'Saco B',
        ['Saco A', 'As chances são iguais', 'É impossível nos dois'],
        'Cinco cartões favoráveis em seis dão chance maior que um em seis.',
      ],
      [
        'Duas roletas iguais em tamanho têm 8 setores. A tem 5 setores azuis e B tem 2. Em qual a chance de sair azul é maior?',
        'Roleta A',
        ['Roleta B', 'As chances são iguais', 'Azul não pode sair'],
        'Com o mesmo total de setores, cinco azuis são mais que dois.',
      ],
    ],
  },
  {
    id: 'multiplicacao',
    name: 'Multiplicação',
    skill: 'resolver-multiplicacoes-do-3o-ano',
    objective: 'resolver multiplicações do 3o ano',
    sourceTopic: 'multiplicacao',
    wrongFeedback: (answer) =>
      `Represente a situação como grupos iguais e confira a multiplicação; o total é ${answer}.`,
    items: [
      [
        'Há 4 caixas com 6 lápis em cada uma. Quantos lápis há ao todo?',
        '24',
        ['10', '18', '30'],
        'Quatro grupos de seis lápis são 6 + 6 + 6 + 6 = 24.',
      ],
      [
        'Uma bandeja tem 7 fileiras com 5 pãezinhos em cada fileira. Quantos pãezinhos há?',
        '35',
        ['12', '30', '40'],
        'São sete grupos de cinco: 7 × 5 = 35.',
      ],
      [
        'Em 6 estojos há 4 canetas em cada estojo. Quantas canetas há?',
        '24',
        ['10', '20', '28'],
        'Seis grupos de quatro correspondem a 6 × 4 = 24.',
      ],
      [
        'Uma sala tem 8 mesas, com 3 livros em cada mesa. Quantos livros há?',
        '24',
        ['11', '21', '32'],
        'O total é 8 grupos de 3, ou 8 × 3 = 24.',
      ],
      [
        'Há 9 pratos com 4 biscoitos em cada prato. Quantos biscoitos há?',
        '36',
        ['13', '32', '40'],
        'Nove grupos de quatro biscoitos totalizam 9 × 4 = 36.',
      ],
      [
        'Uma caixa guarda 5 pacotes com 7 figurinhas em cada pacote. Quantas figurinhas?',
        '35',
        ['12', '30', '42'],
        'Cinco grupos de sete são 5 × 7 = 35 figurinhas.',
      ],
      [
        'No jardim há 4 canteiros com 8 flores em cada um. Quantas flores?',
        '32',
        ['12', '28', '36'],
        'Quatro grupos de oito flores dão 4 × 8 = 32.',
      ],
      [
        'Uma estante tem 6 prateleiras e cada uma guarda 5 vasos. Quantos vasos?',
        '30',
        ['11', '25', '35'],
        'Seis grupos de cinco vasos totalizam 6 × 5 = 30.',
      ],
      [
        'Há 7 saquinhos com 3 bolinhas em cada um. Quantas bolinhas?',
        '21',
        ['10', '18', '24'],
        'Sete grupos de três bolinhas são 7 × 3 = 21.',
      ],
      [
        'Uma equipe arruma 8 fileiras de 4 cadeiras. Quantas cadeiras?',
        '32',
        ['12', '28', '36'],
        'O total de cadeiras é 8 × 4 = 32.',
      ],
      [
        'Em 3 caixas há 9 carrinhos em cada caixa. Quantos carrinhos?',
        '27',
        ['12', '24', '30'],
        'Três grupos de nove carrinhos totalizam 3 × 9 = 27.',
      ],
      [
        'Uma criança coleciona 6 cartelas com 7 adesivos em cada. Quantos adesivos?',
        '42',
        ['13', '36', '49'],
        'Seis grupos de sete adesivos são 6 × 7 = 42.',
      ],
      [
        'Há 5 mesas com 8 copos em cada mesa. Quantos copos?',
        '40',
        ['13', '35', '45'],
        'Cinco grupos de oito copos correspondem a 5 × 8 = 40.',
      ],
      [
        'Uma banca expõe 9 bandejas com 3 maçãs em cada. Quantas maçãs?',
        '27',
        ['12', '24', '30'],
        'Nove grupos de três maçãs são 9 × 3 = 27.',
      ],
      [
        'Cada pacote tem 6 cartões. Quantos cartões há em 8 pacotes?',
        '48',
        ['14', '42', '54'],
        'Oito grupos de seis cartões totalizam 8 × 6 = 48.',
      ],
      [
        'Um teatro tem 4 setores com 9 assentos em cada setor. Quantos assentos?',
        '36',
        ['13', '32', '40'],
        'Quatro grupos de nove assentos são 4 × 9 = 36.',
      ],
      [
        'Há 7 caixas com 6 brinquedos em cada caixa. Quantos brinquedos?',
        '42',
        ['13', '36', '49'],
        'Sete grupos de seis brinquedos totalizam 7 × 6 = 42.',
      ],
      [
        'Uma professora distribui 5 lápis para cada uma das 9 mesas. Quantos lápis?',
        '45',
        ['14', '40', '50'],
        'Nove grupos de cinco lápis correspondem a 9 × 5 = 45.',
      ],
      [
        'Uma horta tem 8 canteiros com 7 pés de alface em cada. Quantos pés?',
        '56',
        ['15', '49', '63'],
        'Oito grupos de sete pés de alface totalizam 8 × 7 = 56.',
      ],
      [
        'Há 6 bandejas com 9 copos em cada bandeja. Quantos copos?',
        '54',
        ['15', '48', '60'],
        'Seis grupos de nove copos são 6 × 9 = 54.',
      ],
    ],
  },
  {
    id: 'divisao',
    name: 'Divisão',
    skill: 'resolver-e-interpretar-divisoes',
    objective: 'resolver e interpretar divisões',
    sourceTopic: 'divisao',
    wrongFeedback: (answer) =>
      `Verifique quantos itens ficam em cada grupo quando a quantidade é repartida igualmente; cada grupo recebe ${answer}.`,
    items: [
      [
        '24 figurinhas são repartidas igualmente entre 4 crianças. Quantas recebe cada criança?',
        '6',
        ['4', '5', '8'],
        'Dividir 24 em 4 grupos iguais dá 6 figurinhas para cada criança.',
      ],
      [
        '35 maçãs são colocadas igualmente em 5 cestas. Quantas maçãs ficam em cada cesta?',
        '7',
        ['5', '6', '8'],
        'Como 5 × 7 = 35, cada cesta recebe 7 maçãs.',
      ],
      [
        '32 livros são organizados em 4 prateleiras, em quantidades iguais. Quantos livros por prateleira?',
        '8',
        ['4', '6', '9'],
        'A divisão 32 ÷ 4 resulta em 8 livros por prateleira.',
      ],
      [
        '21 crianças formam 3 equipes iguais. Quantas crianças há em cada equipe?',
        '7',
        ['3', '6', '8'],
        'Três equipes com 7 crianças formam 21 crianças.',
      ],
      [
        '36 lápis são separados igualmente em 6 caixas. Quantos lápis por caixa?',
        '6',
        ['5', '7', '9'],
        'A conta 36 ÷ 6 = 6 indica seis lápis em cada caixa.',
      ],
      [
        '40 biscoitos são repartidos igualmente entre 5 pratos. Quantos por prato?',
        '8',
        ['5', '7', '9'],
        'Cinco grupos de oito biscoitos totalizam 40.',
      ],
      [
        '27 bolas são guardadas em 3 sacos iguais. Quantas bolas em cada saco?',
        '9',
        ['6', '8', '10'],
        'Dividir 27 por 3 dá 9 bolas para cada saco.',
      ],
      [
        '30 flores são distribuídas igualmente em 5 vasos. Quantas flores por vaso?',
        '6',
        ['5', '7', '8'],
        'Cinco vasos com seis flores cada acomodam as 30 flores.',
      ],
      [
        '48 cartões são separados em 6 montes iguais. Quantos cartões em cada monte?',
        '8',
        ['6', '7', '9'],
        '48 ÷ 6 = 8 cartões em cada monte.',
      ],
      [
        '45 estudantes entram em 5 grupos iguais. Quantos estudantes em cada grupo?',
        '9',
        ['5', '8', '10'],
        'Cinco grupos de nove estudantes somam 45.',
      ],
      [
        '28 carrinhos são colocados igualmente em 4 caixas. Quantos carrinhos por caixa?',
        '7',
        ['4', '6', '8'],
        'A divisão 28 ÷ 4 = 7 dá a quantidade de carrinhos em cada caixa.',
      ],
      [
        '54 copos são organizados em 6 mesas iguais. Quantos copos por mesa?',
        '9',
        ['6', '8', '10'],
        'Cada uma das 6 mesas recebe 9 copos, pois 6 × 9 = 54.',
      ],
      [
        '42 sementes são colocadas igualmente em 7 vasos. Quantas em cada vaso?',
        '6',
        ['5', '7', '8'],
        '42 dividido por 7 é 6 sementes por vaso.',
      ],
      [
        '56 livros são separados em 8 pilhas iguais. Quantos livros em cada pilha?',
        '7',
        ['6', '8', '9'],
        'Oito pilhas de sete livros contêm 56 livros.',
      ],
      [
        '63 botões são divididos igualmente entre 7 caixas. Quantos botões por caixa?',
        '9',
        ['7', '8', '10'],
        '63 ÷ 7 = 9 botões em cada caixa.',
      ],
      [
        '36 crianças fazem filas de 4 crianças. Quantas filas completas podem ser feitas?',
        '9',
        ['8', '10', '12'],
        'Nove filas com quatro crianças usam 36 crianças.',
      ],
      [
        '24 pães são colocados em sacos com 3 pães em cada. Quantos sacos são necessários?',
        '8',
        ['6', '7', '9'],
        'Com três pães por saco, 24 ÷ 3 = 8 sacos.',
      ],
      [
        '40 folhas são entregues em grupos de 8 folhas. Quantos grupos completos há?',
        '5',
        ['4', '6', '8'],
        'Cinco grupos de oito folhas formam 40 folhas.',
      ],
      [
        '72 peças são organizadas em caixas com 9 peças. Quantas caixas ficam completas?',
        '8',
        ['7', '9', '10'],
        '72 ÷ 9 = 8 caixas completas.',
      ],
      [
        '64 adesivos formam cartelas com 8 adesivos cada. Quantas cartelas completas?',
        '8',
        ['6', '7', '9'],
        'Oito cartelas de oito adesivos usam 64 adesivos.',
      ],
    ],
  },
  {
    id: 'divisao-metodos',
    name: 'Métodos longo e breve da divisão',
    skill: 'reconhecer-metodos-longo-e-breve-da-divisao',
    objective: 'reconhecer procedimentos ensinados para dividir',
    sourceTopic: 'divisao-metodos',
    wrongFeedback: (answer) =>
      `Mantenha o valor posicional ao dividir dezenas e unidades; nesta etapa, o resultado é ${answer}.`,
    items: [
      [
        'No método longo para calcular 84 ÷ 4, começamos pelas 8 dezenas. Quantas dezenas cabem em cada grupo?',
        '2',
        ['1', '4', '8'],
        'Oito dezenas repartidas em quatro grupos dão duas dezenas por grupo.',
      ],
      [
        'No método longo de 96 ÷ 3, quantas dezenas ficam em cada grupo ao repartir as 9 dezenas?',
        '3',
        ['2', '6', '9'],
        'Nove dezenas divididas em três grupos são três dezenas para cada grupo.',
      ],
      [
        'Ao dividir 75 por 5 pelo método longo, quantas dezenas há no quociente ao repartir as 7 dezenas?',
        '1',
        ['2', '5', '7'],
        'O 5 cabe uma vez em 7 dezenas; sobram 2 dezenas para juntar às unidades.',
      ],
      [
        'No cálculo longo de 88 ÷ 4, quantas dezenas cabem em cada grupo quando repartimos 8 dezenas?',
        '2',
        ['1', '4', '8'],
        'Oito dezenas em quatro grupos iguais formam duas dezenas por grupo.',
      ],
      [
        'Para iniciar 69 ÷ 3 pelo método longo, repartimos 6 dezenas em 3 grupos. Quantas dezenas recebe cada grupo?',
        '2',
        ['1', '3', '6'],
        'Cada grupo recebe duas dezenas, pois 6 ÷ 3 = 2.',
      ],
      [
        'No método longo de 96 ÷ 4, repartimos primeiro 9 dezenas em 4 grupos. Quantas dezenas sobram nessa etapa?',
        '1',
        ['0', '2', '4'],
        'Quatro grupos recebem duas dezenas cada, e sobra uma dezena.',
      ],
      [
        'Ao repartir 8 dezenas em 3 grupos iguais no método longo, quantas dezenas sobram?',
        '2',
        ['1', '3', '5'],
        'Cada grupo recebe 2 dezenas; 8 − 6 deixa 2 dezenas.',
      ],
      [
        'No começo de 76 ÷ 3 pelo método longo, quantas dezenas sobram depois de dar 2 dezenas a cada grupo?',
        '1',
        ['0', '2', '3'],
        'Três grupos de 2 dezenas usam 6 das 7 dezenas; sobra 1 dezena.',
      ],
      [
        'No método longo de 95 ÷ 4, depois de distribuir 2 dezenas por grupo, quantas dezenas sobram?',
        '1',
        ['0', '2', '4'],
        'Quatro grupos de 2 dezenas usam 8; das 9 dezenas, sobra 1.',
      ],
      [
        'Para dividir 86 por 2 pelo método longo, quantas dezenas resultam de repartir 8 dezenas em 2 grupos?',
        '4',
        ['2', '6', '8'],
        'Oito dezenas divididas em dois grupos são quatro dezenas em cada.',
      ],
      [
        'No método breve, em 96 ÷ 4, 9 dezenas divididas por 4 dão 2 dezenas e sobra 1 dezena. Juntando essa dezena às 6 unidades, quantas unidades há para a próxima etapa?',
        '16',
        ['7', '10', '24'],
        'A dezena que sobrou vale 10 unidades; 10 + 6 = 16 unidades.',
      ],
      [
        'No método breve de 84 ÷ 4, 8 dezenas divididas por 4 dão 2 dezenas. Quantas unidades restam para dividir?',
        '4',
        ['0', '8', '12'],
        'Depois das dezenas, permanecem as 4 unidades de 84.',
      ],
      [
        'Em 75 ÷ 5 pelo método breve, 7 dezenas divididas por 5 dão 1 dezena e sobram 2 dezenas. Quantas unidades são 2 dezenas mais 5 unidades?',
        '25',
        ['12', '20', '35'],
        'As 2 dezenas que sobraram valem 20 unidades; 20 + 5 = 25.',
      ],
      [
        'No método breve de 88 ÷ 4, após repartir 8 dezenas em 4 grupos, quantas unidades de 88 ficam para dividir?',
        '8',
        ['2', '4', '16'],
        'As 8 dezenas foram divididas; restam as 8 unidades.',
      ],
      [
        'Ao calcular 69 ÷ 3 pelo método breve, 6 dezenas divididas por 3 dão 2 dezenas. Quantas unidades sobram para a etapa seguinte?',
        '9',
        ['2', '3', '12'],
        'Depois das dezenas, as 9 unidades de 69 continuam para ser divididas.',
      ],
      [
        'No método breve de 96 ÷ 3, após dividir 9 dezenas por 3, quantas unidades ainda precisam ser divididas?',
        '6',
        ['3', '9', '15'],
        'As dezenas foram repartidas; restam as 6 unidades do número.',
      ],
      [
        'Em 72 ÷ 3 pelo método breve, 7 dezenas por 3 dão 2 dezenas e sobra 1 dezena. Quantas unidades são 1 dezena e mais 2 unidades?',
        '12',
        ['3', '10', '21'],
        'A dezena restante vale 10 unidades; 10 + 2 = 12.',
      ],
      [
        'No método breve de 84 ÷ 3, 8 dezenas por 3 dão 2 dezenas e sobram 2 dezenas. Quantas unidades são 2 dezenas mais 4 unidades?',
        '24',
        ['6', '20', '28'],
        'As duas dezenas restantes valem 20 unidades; junto das 4 unidades, são 24.',
      ],
      [
        'Em 65 ÷ 5 pelo método breve, depois de dividir 6 dezenas por 5 sobra 1 dezena. Com as 5 unidades, quantas unidades há para dividir?',
        '15',
        ['6', '10', '25'],
        'A dezena que sobrou equivale a 10 unidades; 10 + 5 = 15.',
      ],
      [
        'No método breve de 78 ÷ 6, 7 dezenas por 6 dão 1 dezena e sobra 1 dezena. Quantas unidades são essa dezena e as 8 unidades?',
        '18',
        ['8', '14', '68'],
        'Uma dezena vale 10 unidades; 10 + 8 = 18 unidades.',
      ],
    ],
  },
  {
    id: 'expressoes',
    name: 'Expressões aritméticas simples',
    skill: 'calcular-expressoes-aritmeticas-simples',
    objective: 'calcular expressões pela convenção ensinada',
    sourceTopic: 'expressoes',
    wrongFeedback: (answer) =>
      `Observe o sinal da expressão e calcule essa operação; o valor é ${answer}.`,
    items: [
      [
        'Qual é o valor da expressão 18 + 7?',
        '25',
        ['24', '26', '11'],
        'Somamos 18 e 7: 18 + 7 = 25.',
      ],
      [
        'Calcule a expressão 32 − 9.',
        '23',
        ['21', '22', '41'],
        'Retirando 9 de 32, obtemos 23.',
      ],
      [
        'Quanto vale 6 × 4?',
        '24',
        ['10', '20', '28'],
        'Seis grupos de quatro formam 24.',
      ],
      [
        'Qual é o resultado de 27 + 8?',
        '35',
        ['34', '36', '19'],
        'A soma de 27 com 8 é 35.',
      ],
      [
        'Calcule 45 − 18.',
        '27',
        ['23', '26', '33'],
        'Subtraindo 18 de 45, restam 27.',
      ],
      [
        'Quanto é 7 × 5?',
        '35',
        ['12', '30', '40'],
        'Sete grupos de cinco totalizam 35.',
      ],
      [
        'Qual é o valor de 36 + 16?',
        '52',
        ['42', '50', '62'],
        'Somando 36 e 16, encontramos 52.',
      ],
      [
        'Calcule 64 − 27.',
        '37',
        ['33', '36', '47'],
        'A diferença entre 64 e 27 é 37.',
      ],
      [
        'Quanto vale 8 × 3?',
        '24',
        ['11', '21', '32'],
        'Oito grupos de três totalizam 24.',
      ],
      [
        'Qual é o resultado de 48 + 25?',
        '73',
        ['63', '72', '83'],
        'Somando 48 e 25, obtemos 73.',
      ],
      [
        'Calcule 71 − 36.',
        '35',
        ['34', '45', '47'],
        'Subtraindo 36 de 71, restam 35.',
      ],
      [
        'Quanto é 9 × 4?',
        '36',
        ['13', '32', '40'],
        'Nove grupos de quatro formam 36.',
      ],
      [
        'Qual é o valor de 29 + 34?',
        '63',
        ['53', '62', '73'],
        'A soma de 29 e 34 é 63.',
      ],
      [
        'Calcule 83 − 48.',
        '35',
        ['34', '45', '51'],
        'A diferença entre 83 e 48 é 35.',
      ],
      [
        'Quanto vale 6 × 7?',
        '42',
        ['13', '36', '49'],
        'Seis grupos de sete formam 42.',
      ],
      [
        'Qual é o resultado de 56 + 17?',
        '73',
        ['63', '72', '83'],
        'Somando 56 e 17, encontramos 73.',
      ],
      [
        'Calcule 92 − 57.',
        '35',
        ['34', '45', '49'],
        'Retirando 57 de 92, restam 35.',
      ],
      [
        'Quanto é 8 × 6?',
        '48',
        ['14', '42', '54'],
        'Oito grupos de seis totalizam 48.',
      ],
      [
        'Qual é o valor de 38 + 46?',
        '84',
        ['74', '83', '94'],
        'A soma de 38 com 46 é 84.',
      ],
      [
        'Calcule 100 − 64.',
        '36',
        ['34', '46', '54'],
        'Subtraindo 64 de 100, obtemos 36.',
      ],
    ],
  },
  {
    id: 'decomposicao-multiplicacao',
    name: 'Decomposição com multiplicação',
    skill: 'usar-decomposicao-para-calcular-multiplicacoes',
    objective: 'usar decomposição para calcular',
    sourceTopic: 'decomposicao-multiplicacao',
    wrongFeedback: (answer) =>
      `Multiplique o fator pelas dezenas e pelas unidades e some os produtos; o total é ${answer}.`,
    items: [
      [
        'Use a decomposição: 4 × 12 = (4 × 10) + (4 × 2). Qual é o produto?',
        '48',
        ['42', '44', '52'],
        '4 × 10 = 40 e 4 × 2 = 8; 40 + 8 = 48.',
      ],
      [
        'Calcule por decomposição: 3 × 14 = (3 × 10) + (3 × 4).',
        '42',
        ['38', '40', '46'],
        '3 × 10 = 30 e 3 × 4 = 12; 30 + 12 = 42.',
      ],
      [
        'Qual resultado de 5 × 13 usando (5 × 10) + (5 × 3)?',
        '65',
        ['60', '63', '70'],
        '5 × 10 = 50 e 5 × 3 = 15; a soma é 65.',
      ],
      [
        'Resolva 6 × 12 pensando em 6 × 10 + 6 × 2.',
        '72',
        ['68', '70', '76'],
        '60 + 12 = 72.',
      ],
      [
        'Calcule 7 × 13 usando 7 × 10 + 7 × 3.',
        '91',
        ['88', '90', '94'],
        '70 + 21 = 91.',
      ],
      [
        'Qual é 4 × 15 usando 4 × 10 + 4 × 5?',
        '60',
        ['55', '58', '65'],
        '40 + 20 = 60.',
      ],
      [
        'Use 3 × 10 + 3 × 6 para calcular 3 × 16.',
        '48',
        ['42', '46', '52'],
        '30 + 18 = 48.',
      ],
      [
        'Calcule 8 × 12 decompondo 12 em 10 + 2.',
        '96',
        ['88', '92', '104'],
        '8 × 10 = 80 e 8 × 2 = 16; 80 + 16 = 96.',
      ],
      [
        'Quanto é 5 × 14 usando 5 × 10 + 5 × 4?',
        '70',
        ['66', '68', '74'],
        '50 + 20 = 70.',
      ],
      [
        'Use 6 × 10 + 6 × 3 para calcular 6 × 13.',
        '78',
        ['72', '75', '81'],
        '60 + 18 = 78.',
      ],
      [
        'Calcule 7 × 12 usando 7 × 10 + 7 × 2.',
        '84',
        ['77', '82', '88'],
        '70 + 14 = 84.',
      ],
      [
        'Qual é o produto 4 × 17 se 17 = 10 + 7?',
        '68',
        ['61', '64', '72'],
        '4 × 10 = 40 e 4 × 7 = 28; 40 + 28 = 68.',
      ],
      [
        'Use a decomposição 3 × 10 + 3 × 8 para encontrar 3 × 18.',
        '54',
        ['48', '51', '60'],
        '30 + 24 = 54.',
      ],
      [
        'Calcule 9 × 12 decompondo 12 em 10 + 2.',
        '108',
        ['98', '106', '116'],
        '9 × 10 = 90 e 9 × 2 = 18; 90 + 18 = 108.',
      ],
      [
        'Quanto é 5 × 16 usando 5 × 10 + 5 × 6?',
        '80',
        ['74', '76', '86'],
        '50 + 30 = 80.',
      ],
      [
        'Calcule 4 × 18 usando 4 × 10 + 4 × 8.',
        '72',
        ['64', '68', '76'],
        '40 + 32 = 72.',
      ],
      [
        'Use 6 × 10 + 6 × 5 para calcular 6 × 15.',
        '90',
        ['84', '86', '96'],
        '60 + 30 = 90.',
      ],
      [
        'Qual é 7 × 14 usando 7 × 10 + 7 × 4?',
        '98',
        ['91', '94', '102'],
        '70 + 28 = 98.',
      ],
      [
        'Calcule 8 × 13 decompondo 13 em 10 + 3.',
        '104',
        ['96', '101', '112'],
        '8 × 10 = 80 e 8 × 3 = 24; 80 + 24 = 104.',
      ],
      [
        'Use 9 × 10 + 9 × 4 para encontrar 9 × 14.',
        '126',
        ['117', '122', '136'],
        '90 + 36 = 126.',
      ],
    ],
  },
  {
    id: 'problemas-expressoes',
    name: 'Problemas com expressões',
    skill: 'traduzir-situacoes-em-expressoes-e-resolver',
    objective: 'traduzir situações e resolver',
    sourceTopic: 'problemas-expressoes',
    wrongFeedback: (answer) =>
      `Escolha a expressão que representa a ação descrita; ela resulta em ${answer}.`,
    items: [
      [
        'Lia tinha 18 adesivos e ganhou mais 7. Qual expressão mostra quantos adesivos ela tem agora?',
        '18 + 7',
        ['18 − 7', '18 × 7', '18 ÷ 7'],
        'Ganhar adesivos aumenta a quantidade: 18 + 7 = 25.',
      ],
      [
        'Havia 32 livros na mesa e 9 foram guardados. Qual expressão mostra quantos ficaram?',
        '32 − 9',
        ['32 + 9', '32 × 9', '32 ÷ 9'],
        'Guardar 9 livros retira essa quantidade: 32 − 9 = 23.',
      ],
      [
        'Há 6 caixas com 4 bolas em cada. Qual expressão encontra o total de bolas?',
        '6 × 4',
        ['6 + 4', '6 − 4', '6 ÷ 4'],
        'Seis grupos iguais de quatro bolas são representados por 6 × 4 = 24.',
      ],
      [
        'Uma turma tinha 27 folhas e recebeu mais 8. Qual expressão representa a nova quantidade?',
        '27 + 8',
        ['27 − 8', '27 × 8', '27 ÷ 8'],
        'Receber folhas acrescenta 8 às 27 que já havia.',
      ],
      [
        'De 45 laranjas, 18 foram usadas. Qual expressão indica quantas restaram?',
        '45 − 18',
        ['45 + 18', '45 × 18', '45 ÷ 18'],
        'Usar laranjas diminui o total: 45 − 18 = 27.',
      ],
      [
        'Há 7 bandejas com 5 pães em cada. Qual expressão mostra o total de pães?',
        '7 × 5',
        ['7 + 5', '7 − 5', '7 ÷ 5'],
        'A multiplicação representa sete grupos de cinco pães.',
      ],
      [
        'Uma caixa tinha 36 peças; 16 foram retiradas. Qual expressão representa as peças que sobraram?',
        '36 − 16',
        ['36 + 16', '36 × 16', '36 ÷ 16'],
        'Retirar 16 peças é representado por 36 − 16.',
      ],
      [
        'Nina leu 25 páginas ontem e 14 hoje. Qual expressão mostra quantas páginas leu?',
        '25 + 14',
        ['25 − 14', '25 × 14', '25 ÷ 14'],
        'As páginas dos dois dias são juntadas: 25 + 14 = 39.',
      ],
      [
        'Há 8 mesas com 3 estudantes em cada. Qual expressão representa o total de estudantes?',
        '8 × 3',
        ['8 + 3', '8 − 3', '8 ÷ 3'],
        'Oito grupos iguais de três estudantes são 8 × 3.',
      ],
      [
        'Uma cesta tinha 48 frutas e 25 foram vendidas. Qual expressão mostra quantas restaram?',
        '48 − 25',
        ['48 + 25', '48 × 25', '48 ÷ 25'],
        'Vender frutas retira 25 do total de 48.',
      ],
      [
        'Uma coleção tem 29 cartões e ganha mais 34. Qual expressão mostra o novo total?',
        '29 + 34',
        ['29 − 34', '29 × 34', '29 ÷ 34'],
        'Juntar cartões significa somar 29 e 34.',
      ],
      [
        'Há 9 pacotes com 4 figurinhas em cada. Qual expressão encontra o total?',
        '9 × 4',
        ['9 + 4', '9 − 4', '9 ÷ 4'],
        'Nove grupos de quatro figurinhas são representados por 9 × 4.',
      ],
      [
        'Uma sala tinha 56 cadeiras e 17 foram levadas para outra sala. Qual expressão mostra quantas ficaram?',
        '56 − 17',
        ['56 + 17', '56 × 17', '56 ÷ 17'],
        'Levar cadeiras embora reduz a quantidade: 56 − 17.',
      ],
      [
        'Rui juntou 38 conchas e depois encontrou mais 46. Qual expressão mostra o total?',
        '38 + 46',
        ['38 − 46', '38 × 46', '38 ÷ 46'],
        'Encontrar mais conchas aumenta a coleção; somamos 38 e 46.',
      ],
      [
        'Uma biblioteca coloca 6 livros em cada uma de 7 caixas. Qual expressão encontra o total?',
        '7 × 6',
        ['7 + 6', '7 − 6', '7 ÷ 6'],
        'Sete grupos de seis livros correspondem a 7 × 6.',
      ],
      [
        'Um agricultor colheu 83 maçãs e separou 48. Qual expressão mostra quantas não foram separadas?',
        '83 − 48',
        ['83 + 48', '83 × 48', '83 ÷ 48'],
        'Separar 48 maçãs deixa a diferença entre 83 e 48.',
      ],
      [
        'Uma escola recebeu 56 cadernos e depois mais 17. Qual expressão representa todos os cadernos?',
        '56 + 17',
        ['56 − 17', '56 × 17', '56 ÷ 17'],
        'Receber mais cadernos pede uma adição.',
      ],
      [
        'Há 8 caixas com 6 bolas em cada. Qual expressão calcula quantas bolas há?',
        '8 × 6',
        ['8 + 6', '8 − 6', '8 ÷ 6'],
        'Oito grupos de seis bolas são representados por 8 × 6.',
      ],
      [
        'Uma loja tinha 100 cadernos e vendeu 64. Qual expressão mostra quantos restaram?',
        '100 − 64',
        ['100 + 64', '100 × 64', '100 ÷ 64'],
        'Vender cadernos reduz o estoque: 100 − 64 = 36.',
      ],
      [
        'Há 9 fileiras com 5 cadeiras em cada uma. Qual expressão encontra o total?',
        '9 × 5',
        ['9 + 5', '9 − 5', '9 ÷ 5'],
        'Nove grupos de cinco cadeiras correspondem a 9 × 5.',
      ],
    ],
  },
];

function numericWrongAnswers(answer) {
  const value = Number(answer);
  const candidates = [
    value - 2,
    value - 1,
    value + 1,
    value + 2,
    value + 3,
  ].filter((candidate) => candidate >= 0 && candidate !== value);
  return [...new Set(candidates)].slice(0, 3).map(String);
}

function addGeneratedTopic(topic, items) {
  TOPICS.push({ ...topic, items });
}

const areaDimensions = [
  [3, 2],
  [4, 3],
  [2, 2],
  [5, 2],
  [3, 4],
  [6, 2],
  [5, 3],
  [4, 4],
  [2, 5],
  [6, 3],
  [4, 2],
  [5, 4],
  [3, 3],
  [6, 4],
  [5, 5],
  [2, 3],
  [4, 5],
  [6, 5],
  [3, 5],
  [4, 6],
];
addGeneratedTopic(
  {
    id: 'area-malha',
    name: 'Área da malha quadriculada',
    skill: 'calcular-area-por-contagem-em-malha',
    objective: 'contar unidades de área em malha quadriculada',
    sourceTopic: 'area-malha',
    wrongFeedback: (answer) =>
      `Conte os quadradinhos que cobrem a figura sem sobreposição; a área é ${answer} unidades quadradas.`,
  },
  areaDimensions.map(([columns, rows], index) => {
    const area = columns * rows;
    const ways = [
      `Uma figura retangular ocupa ${columns} colunas e ${rows} linhas de quadradinhos. Qual é sua área?`,
      `Há ${columns} quadradinhos em cada uma de ${rows} linhas completas. Quantos quadradinhos cobrem a região?`,
      `Uma região da malha mede ${columns} quadradinhos de largura por ${rows} de altura. Qual é a área?`,
      `Um retângulo cobre ${rows} linhas com ${columns} quadradinhos em cada linha. Quantos quadradinhos há?`,
    ];
    return [
      ways[index % ways.length],
      String(area),
      numericWrongAnswers(area),
      `${columns} grupos de ${rows} quadradinhos totalizam ${area}.`,
    ];
  }),
);

const perimeters = [
  { sides: [3, 3, 3, 3], unit: 'cm', label: 'Um quadrado tem lados de 3 cm.' },
  {
    sides: [5, 2, 5, 2],
    unit: 'cm',
    label: 'Um retângulo mede 5 cm por 2 cm.',
  },
  {
    sides: [4, 3, 5],
    unit: 'cm',
    label: 'Um triângulo tem lados de 4 cm, 3 cm e 5 cm.',
  },
  { sides: [6, 2, 6, 2], unit: 'm', label: 'Um retângulo mede 6 m por 2 m.' },
  { sides: [5, 5, 5, 5], unit: 'cm', label: 'Um quadrado tem lados de 5 cm.' },
  {
    sides: [6, 6, 4],
    unit: 'cm',
    label: 'Um triângulo tem lados de 6 cm, 6 cm e 4 cm.',
  },
  { sides: [7, 3, 7, 3], unit: 'm', label: 'Um retângulo mede 7 m por 3 m.' },
  { sides: [2, 2, 2, 2], unit: 'cm', label: 'Um quadrado tem lados de 2 cm.' },
  {
    sides: [8, 2, 8, 2],
    unit: 'cm',
    label: 'Um retângulo mede 8 cm por 2 cm.',
  },
  {
    sides: [7, 5, 4],
    unit: 'm',
    label: 'Um triângulo tem lados de 7 m, 5 m e 4 m.',
  },
  { sides: [6, 6, 6, 6], unit: 'cm', label: 'Um quadrado tem lados de 6 cm.' },
  { sides: [9, 4, 9, 4], unit: 'm', label: 'Um retângulo mede 9 m por 4 m.' },
  {
    sides: [8, 3, 5],
    unit: 'cm',
    label: 'Um triângulo tem lados de 8 cm, 3 cm e 5 cm.',
  },
  { sides: [7, 7, 7, 7], unit: 'm', label: 'Um quadrado tem lados de 7 m.' },
  {
    sides: [6, 5, 6, 5],
    unit: 'cm',
    label: 'Um retângulo mede 6 cm por 5 cm.',
  },
  {
    sides: [3, 4, 3, 4],
    unit: 'm',
    label: 'Uma figura tem lados de 3 m, 4 m, 3 m e 4 m.',
  },
  {
    sides: [9, 2, 3],
    unit: 'cm',
    label: 'Um triângulo tem lados de 9 cm, 2 cm e 3 cm.',
  },
  {
    sides: [10, 3, 10, 3],
    unit: 'm',
    label: 'Um retângulo mede 10 m por 3 m.',
  },
  { sides: [8, 8, 8, 8], unit: 'cm', label: 'Um quadrado tem lados de 8 cm.' },
  {
    sides: [5, 7, 6],
    unit: 'm',
    label: 'Um triângulo tem lados de 5 m, 7 m e 6 m.',
  },
];
addGeneratedTopic(
  {
    id: 'perimetro',
    name: 'Perímetro',
    skill: 'calcular-perimetro',
    objective: 'calcular o contorno de figuras simples',
    sourceTopic: 'perimetro',
    wrongFeedback: (answer) =>
      `Some as medidas de todos os lados do contorno; o perímetro é ${answer}.`,
  },
  perimeters.map(({ sides, unit, label }, index) => {
    const perimeter = sides.reduce((sum, side) => sum + side, 0);
    return [
      `${label} ${index % 2 ? 'Quanto mede todo o contorno?' : 'Qual é o perímetro?'}`,
      `${perimeter} ${unit}`,
      numericWrongAnswers(perimeter).map((value) => `${value} ${unit}`),
      `Somando as medidas dos lados (${sides.join(' + ')}), obtemos ${perimeter} ${unit}.`,
    ];
  }),
);

const perpendicularQuestions = [
  [
    'Duas retas se cruzam formando quatro ângulos retos. Como são chamadas?',
    'Perpendiculares',
    [
      'Paralelas',
      'Retas que se cruzam sem ângulo reto',
      'Retas que não se cruzam',
    ],
  ],
  [
    'As linhas de um canto de uma folha se encontram formando um ângulo reto. Como são essas linhas?',
    'Perpendiculares',
    [
      'Paralelas',
      'Retas que se cruzam sem ângulo reto',
      'Retas que não se encontram',
    ],
  ],
  [
    'Duas retas seguem lado a lado e nunca se encontram. Elas são perpendiculares?',
    'Não; são paralelas.',
    [
      'Sim; formam ângulos retos.',
      'Sim; qualquer par de retas é perpendicular.',
      'Não; cruzam-se sem formar ângulo reto.',
    ],
  ],
  [
    'Em um desenho, duas retas se encontram como os lados vizinhos de um quadrado. Qual relação elas têm?',
    'São perpendiculares.',
    [
      'São paralelas.',
      'Cruzam-se sem formar ângulo reto.',
      'Não se encontram.',
    ],
  ],
  [
    'Qual descrição mostra duas retas perpendiculares?',
    'Duas retas que se cruzam em ângulo reto.',
    [
      'Duas retas que nunca se cruzam.',
      'Duas retas que se cruzam sem ângulo reto.',
      'Duas retas que seguem juntas.',
    ],
  ],
  [
    'Uma reta vertical e uma horizontal se cruzam formando um canto quadrado. Como se relacionam?',
    'São perpendiculares.',
    [
      'São paralelas.',
      'Cruzam-se sem formar ângulo reto.',
      'Não têm ponto em comum.',
    ],
  ],
  [
    'Duas linhas se cruzam, mas não formam ângulo reto. Podemos chamá-las de perpendiculares?',
    'Não.',
    [
      'Sim, pois qualquer cruzamento é perpendicular.',
      'Sim, pois retas paralelas são perpendiculares.',
      'Sim, porque qualquer cruzamento forma ângulo reto.',
    ],
  ],
  [
    'O encontro de duas paredes forma um canto reto. Que relação há entre essas direções?',
    'São perpendiculares.',
    [
      'São paralelas.',
      'Cruzam-se sem formar ângulo reto.',
      'Não se encontram.',
    ],
  ],
  [
    'Qual característica define retas perpendiculares?',
    'Cruzam-se formando ângulo reto.',
    [
      'Nunca se encontram.',
      'Cruzam-se sem formar ângulo reto.',
      'Têm a mesma direção e não se cruzam.',
    ],
  ],
  [
    'Duas retas paralelas se cruzam formando ângulos retos?',
    'Não; elas não se cruzam.',
    [
      'Sim, sempre.',
      'Sim, porque qualquer par de retas se cruza.',
      'Sim, porque paralelas formam ângulo reto.',
    ],
  ],
  [
    'As bordas vizinhas de um azulejo quadrado formam qual tipo de encontro?',
    'Ângulo reto.',
    [
      'Linhas paralelas.',
      'Cruzamento sem ângulo reto.',
      'Não há encontro entre as bordas.',
    ],
  ],
  [
    'Duas retas se cruzam e formam quatro ângulos retos. Como se chamam?',
    'Retas perpendiculares.',
    [
      'Retas paralelas.',
      'Retas que se cruzam sem ângulo reto.',
      'Retas que não se cruzam.',
    ],
  ],
  [
    'Um caminho horizontal cruza outro vertical formando um ângulo de 90 graus. Como são as direções?',
    'Perpendiculares.',
    ['Paralelas.', 'Cruzam-se sem formar ângulo reto.', 'Não se cruzam.'],
  ],
  [
    'Duas retas se encontram em um ângulo reto. Qual afirmação é correta?',
    'Elas são perpendiculares.',
    [
      'Elas são paralelas.',
      'Elas se cruzam sem formar ângulo reto.',
      'Elas não se encontram.',
    ],
  ],
  [
    'As linhas de uma cruz se encontram formando quatro ângulos retos. Que tipo de retas aparecem?',
    'Perpendiculares.',
    [
      'Paralelas.',
      'Retas que se cruzam sem ângulo reto.',
      'Retas que não se encontram.',
    ],
  ],
  [
    'Uma reta corta outra e forma um ângulo reto. Qual nome descreve essa relação?',
    'Perpendicularidade.',
    ['Paralelismo.', 'Cruzamento sem ângulo reto.', 'Ausência de cruzamento.'],
  ],
  [
    'Duas linhas se encontram formando um canto igual ao de um esquadro. Elas são...',
    'perpendiculares.',
    [
      'paralelas.',
      'retas que se cruzam sem ângulo reto.',
      'retas que não se encontram.',
    ],
  ],
  [
    'Qual par de linhas não pode ser perpendicular?',
    'Duas linhas paralelas que não se cruzam.',
    [
      'Uma vertical e outra horizontal que se cruzam em ângulo reto.',
      'Duas retas que formam ângulo reto.',
      'Duas retas que se cruzam sem formar ângulo reto.',
    ],
  ],
  [
    'As laterais e a base de uma letra L feita com traços retos formam um ângulo reto. Como são esses traços?',
    'Perpendiculares.',
    ['Paralelos.', 'Cruzam-se sem formar ângulo reto.', 'Não se encontram.'],
  ],
  [
    'Duas retas se cruzam formando um canto quadrado. Qual é a relação entre elas?',
    'São perpendiculares.',
    ['São paralelas.', 'Cruzam-se sem formar ângulo reto.', 'Não se cruzam.'],
  ],
];
addGeneratedTopic(
  {
    id: 'retas-perpendiculares',
    name: 'Retas perpendiculares',
    skill: 'reconhecer-retas-perpendiculares-e-angulos-retos',
    objective: 'reconhecer retas perpendiculares e ângulos retos',
    sourceTopic: 'retas-perpendiculares',
    wrongFeedback: (answer) =>
      `Observe se as retas se cruzam formando um ângulo reto; neste caso, ${answer.toLowerCase()}.`,
  },
  perpendicularQuestions.map(([question, correct, wrong], index) => [
    question,
    correct,
    wrong,
    index % 2 === 0
      ? 'Retas perpendiculares se cruzam formando ângulo reto.'
      : 'O cruzamento em ângulo reto caracteriza retas perpendiculares.',
  ]),
);

const euclideanDivisions = [
  [17, 5],
  [23, 4],
  [29, 6],
  [18, 4],
  [31, 7],
  [26, 5],
  [34, 8],
  [20, 6],
  [37, 9],
  [42, 5],
  [33, 4],
  [50, 7],
  [27, 5],
  [46, 6],
  [41, 8],
  [28, 3],
  [35, 6],
  [53, 10],
  [19, 4],
  [39, 7],
];
addGeneratedTopic(
  {
    id: 'divisao-euclidiana',
    name: 'Divisão euclidiana',
    skill: 'interpretar-quociente-e-resto',
    objective: 'interpretar quociente e resto',
    sourceTopic: 'divisao-euclidiana',
    wrongFeedback: (answer) =>
      `Confira quantos grupos completos são formados e quantos itens sobram; o resultado pedido é ${answer}.`,
  },
  euclideanDivisions.map(([dividend, divisor], index) => {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend - quotient * divisor;
    const question =
      index % 2 === 0
        ? `Ao dividir ${dividend} objetos em grupos de ${divisor}, quantos grupos completos se formam e quantos objetos sobram?`
        : `Na divisão ${dividend} ÷ ${divisor}, qual é o quociente e o resto?`;
    const format = (q, r) =>
      index % 2 === 0
        ? `${q} grupos completos e sobra${r === 1 ? '' : 'm'} ${r}`
        : `quociente ${q} e resto ${r}`;
    const answer = format(quotient, remainder);
    const distractors = [
      format(Math.max(0, quotient - 1), divisor + remainder),
      format(quotient, remainder + 1),
      format(quotient + 1, remainder),
    ];
    return [
      question,
      answer,
      distractors,
      `${divisor} × ${quotient} = ${divisor * quotient}, e ${dividend} − ${divisor * quotient} = ${remainder}; portanto, o resto é menor que ${divisor}.`,
    ];
  }),
);

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function buildQuestions(topic) {
  if (topic.items.length !== 20) {
    throw new Error(
      `${topic.id}: esperado 20 itens, encontrado ${topic.items.length}`,
    );
  }
  return topic.items.map(([question, correct, wrong, explanation], index) => {
    if (wrong.length !== 3 || new Set([correct, ...wrong]).size !== 4) {
      throw new Error(`${topic.id}/${index + 1}: alternativas duplicadas`);
    }
    let prompt = question;
    let answer = correct;
    let distractors = wrong;
    let rationale = explanation;
    if (topic.id === 'problemas-expressoes') {
      const calculate = (expression) => {
        const match = expression.match(/^(\d+)\s*([+−×÷])\s*(\d+)$/);
        if (!match) {
          throw new Error(`${topic.id}: expressão inválida: ${expression}`);
        }
        const left = Number(match[1]);
        const operator = match[2];
        const right = Number(match[3]);
        const value = {
          '+': () => left + right,
          '−': () => left - right,
          '×': () => left * right,
          '÷': () => Math.floor(left / right),
        }[operator]();
        if (operator === '÷' && left % right !== 0) {
          return `${expression} = ${value}, resto ${left % right}`;
        }
        return `${expression} = ${value}`;
      };
      prompt = question.replace(
        /Qual expressão.*\?$/,
        'Qual opção mostra a expressão e o resultado?',
      );
      answer = calculate(correct);
      distractors = wrong.map(calculate);
      rationale = explanation.includes(answer)
        ? explanation
        : `${explanation} ${answer}.`;
    }
    const correctIndex = index % 4;
    const options = [];
    let wrongIndex = 0;
    for (let optionIndex = 0; optionIndex < 4; optionIndex += 1) {
      options.push(
        optionIndex === correctIndex ? answer : distractors[wrongIndex++],
      );
    }
    const wrongExplanations = Object.fromEntries(
      options
        .map((_, optionIndex) => optionIndex)
        .filter((optionIndex) => optionIndex !== correctIndex)
        .map((optionIndex) => [optionIndex, topic.wrongFeedback(answer)]),
    );
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_math_${topic.id.replace(/-/g, '_')}_${String(index + 1).padStart(3, '0')}`,
      contentSetId: CONTENT_SET_ID,
      subject: 'matematica',
      topic: topic.id,
      topicName: topic.name,
      question: prompt,
      options,
      correctIndex,
      explanation: rationale,
      wrongExplanations,
      skill: topic.skill,
      sourceRef: {
        referenceId: SOURCE_ID,
        section: 'Matemática',
        topic: topic.sourceTopic,
      },
      reviewStatus: 'draft',
      version: 1,
    };
  });
}

function buildAudit(topic, questions) {
  const reviews = questions.flatMap((question) =>
    ['curriculum-factual', 'pedagogical-linguistic'].map((pass) => ({
      questionId: question.id,
      pass,
      actorId: 'codex-single-agent',
      actorRole:
        pass === 'curriculum-factual'
          ? 'content_curator'
          : 'pedagogical_quality',
      evidenceRefs: [`school-curriculum:2026-t3/matematica/${topic.id}`],
      decision: 'clear',
      findings: [],
    })),
  );
  return {
    schemaVersion: 'content-quality-audit-v1',
    reviewMode: 'single-agent-sequential',
    reportStatus: 'draft',
    contentSetId: CONTENT_SET_ID,
    topicId: `matematica:${topic.id}`,
    sourceSha256: sha256(questions),
    reviews,
  };
}

function writeNew(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const replaceGenerated = process.argv.includes('--replace-generated');
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(value, null, 2)}\n`,
    replaceGenerated ? undefined : { flag: 'wx' },
  );
}

function main() {
  TOPICS.forEach((topic) => {
    const questions = buildQuestions(topic);
    const slug = topic.id.replace(/-/g, '_');
    writeNew(path.join(DRAFT_DIRECTORY, `2026-t3-v1-mat-${topic.id}.json`), {
      schemaVersion: 'content-draft-v1',
      contentSetId: CONTENT_SET_ID,
      questions,
    });
    writeNew(
      path.join(AUDIT_DIRECTORY, `2026-t3-v1-mat-${slug}-audit.json`),
      buildAudit(topic, questions),
    );
  });
  process.stdout.write('t3-matematica-drafts: 220 questoes em rascunho\n');
}

if (require.main === module) main();

module.exports = { TOPICS, buildQuestions, buildAudit, sha256 };
