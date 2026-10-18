const { validateGeneratedQuestions } = require('./content-delivery.cjs');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-his-imigrantes-ibericos.json',
);
const SPECS = [
  [
    'O que significa imigração?',
    'a chegada a outro país para morar nele',
    [
      'uma viagem de férias a outro país',
      'a mudança de bairro na mesma cidade',
      'uma visita a parentes em outra cidade',
    ],
    'Imigração é a chegada de pessoas a um país diferente daquele em que viviam, para morar nele.',
    [
      'Uma viagem de férias é temporária e não tem como objetivo morar no país visitado.',
      'Mudar de bairro na mesma cidade não envolve a chegada a outro país.',
      'Visitar parentes em outra cidade não significa chegar a outro país para morar.',
    ],
  ],
  [
    'De quais países vieram os imigrantes portugueses e espanhóis?',
    'Portugal e Espanha',
    ['Portugal e Itália', 'Espanha e Alemanha', 'Itália e Japão'],
    'Os portugueses vieram de Portugal, e os espanhóis, da Espanha.',
    [
      'Portugal corresponde aos portugueses, mas os espanhóis vieram da Espanha, não da Itália.',
      'A Espanha corresponde aos espanhóis, mas os portugueses vieram de Portugal, não da Alemanha.',
      'Itália e Japão são países de origem de outros grupos de imigrantes.',
    ],
  ],
  [
    'Qual motivo levou parte dos imigrantes portugueses e espanhóis a buscar uma nova vida no Brasil?',
    'a busca por trabalho e novas oportunidades',
    [
      'a vontade de passar férias e voltar para casa',
      'o desejo de fazer uma visita curta a um museu',
      'a intenção de acompanhar um jogo e retornar ao país de origem',
    ],
    'A busca por trabalho e novas oportunidades motivou parte desses imigrantes. As razões para imigrar podiam variar entre as pessoas.',
    [
      'Passar férias e voltar para casa descreve uma viagem de turismo, não uma mudança para morar.',
      'Uma visita curta a um museu não envolve a mudança para morar no Brasil.',
      'Viajar para acompanhar um jogo e retornar não é estabelecer uma nova vida no país.',
    ],
  ],
  [
    'O que os imigrantes podem compartilhar com as pessoas do país onde passam a morar?',
    'línguas, receitas, costumes e conhecimentos',
    [
      'somente o nome do país de origem',
      'apenas objetos que cabem em uma mala',
      'apenas costumes aprendidos depois da chegada',
    ],
    'Além de objetos, os imigrantes levam experiências, conhecimentos e práticas culturais que podem compartilhar.',
    [
      'As pessoas podem compartilhar muito mais que o nome do país de origem, como receitas e conhecimentos.',
      'As experiências e os conhecimentos também acompanham as pessoas, mesmo sem ocupar espaço na mala.',
      'Os imigrantes também podem compartilhar costumes que já conheciam antes da chegada.',
    ],
  ],
  [
    'Por que não devemos dizer que todos os imigrantes viveram a mesma experiência?',
    'porque suas vidas, seus motivos e seus lugares de origem podiam ser diferentes',
    [
      'porque morar no mesmo país torna todas as histórias iguais',
      'porque a nacionalidade revela tudo sobre a vida de uma pessoa',
      'porque uma história de família explica a vida de todos os imigrantes',
    ],
    'As experiências de imigração variam. Pessoas de uma mesma nacionalidade também podem ter histórias diferentes.',
    [
      'Morar no mesmo país não torna iguais as experiências das pessoas.',
      'A nacionalidade não revela todos os acontecimentos e motivos da vida de uma pessoa.',
      'A história de uma família ajuda a conhecer essa família, mas não representa todos os imigrantes.',
    ],
  ],
  [
    'Qual situação é um exemplo de contribuição cultural?',
    'uma família compartilhar uma receita tradicional com seus vizinhos',
    [
      'uma família medir o tamanho de sua mala',
      'uma pessoa consultar a previsão do tempo antes de viajar',
      'uma pessoa calcular a distância entre duas cidades',
    ],
    'Compartilhar uma receita tradicional é uma forma de transmitir conhecimentos e práticas culturais.',
    [
      'Medir uma mala informa seu tamanho; essa situação não descreve o compartilhamento de uma prática cultural.',
      'Consultar a previsão do tempo ajuda a planejar a viagem; a situação não mostra uma prática cultural sendo compartilhada.',
      'Calcular uma distância fornece uma medida; a situação não descreve uma contribuição cultural à comunidade.',
    ],
  ],
  [
    'Qual conjunto reúne práticas culturais que comunidades de imigrantes podem compartilhar?',
    'receitas, festas e palavras usadas no dia a dia',
    [
      'distâncias, velocidades e pesos das malas',
      'previsões de chuva, temperaturas e ventos',
      'números de assentos, horários e preços de passagens',
    ],
    'Receitas, festas e palavras podem circular entre comunidades e participar da vida cultural.',
    [
      'Esse conjunto reúne medidas relacionadas a uma viagem, não as práticas culturais pedidas.',
      'Esse conjunto reúne informações sobre o tempo, não práticas culturais de comunidades.',
      'Esse conjunto reúne informações sobre passagens e transporte, não as práticas culturais pedidas.',
    ],
  ],
  [
    'Como os imigrantes portugueses e espanhóis puderam participar do trabalho no Brasil?',
    'em diferentes profissões e atividades',
    [
      'somente na mesma profissão de seus pais',
      'em uma única profissão escolhida para todos',
      'apenas em trabalhos sem contato com outras pessoas',
    ],
    'Os imigrantes participaram de diferentes atividades. Uma nacionalidade não determina uma única profissão.',
    [
      'A profissão dos pais não determina a única atividade que uma pessoa pode exercer.',
      'Pessoas de uma mesma nacionalidade podem exercer profissões diferentes.',
      'O trabalho também pode envolver contato e cooperação com outras pessoas.',
    ],
  ],
  [
    'Uma família de imigrantes compartilhou uma receita com os vizinhos. O que esse relato permite afirmar?',
    'que aquela família compartilhou uma prática cultural',
    [
      'que todas as famílias da mesma nacionalidade fizeram o mesmo',
      'que todos os imigrantes trabalhavam preparando essa receita',
      'que aquela receita era a única contribuição dos imigrantes',
    ],
    'O relato apresenta uma ação de uma família. Não permite atribuir a mesma ação a todas as pessoas de um grupo.',
    [
      'Um relato sobre uma família não comprova que todas as famílias fizeram o mesmo.',
      'Compartilhar uma receita não informa a profissão de todos os imigrantes.',
      'O relato mostra uma contribuição, mas não exclui a existência de outras.',
    ],
  ],
  [
    'O que pode acontecer quando grupos com costumes diferentes passam a conviver?',
    'podem ocorrer trocas culturais e também conflitos',
    [
      'todos os costumes ficam iguais logo no primeiro encontro',
      'somente o grupo que chegou muda seus costumes',
      'a convivência acontece sempre sem dificuldades',
    ],
    'A convivência pode envolver aprendizado e trocas, mas também diferenças e conflitos que precisam ser enfrentados.',
    [
      'As diferenças não desaparecem de uma vez quando as pessoas se encontram.',
      'Diferentes grupos podem participar das trocas culturais durante a convivência.',
      'A convivência também pode apresentar dificuldades e conflitos.',
    ],
  ],
  [
    'O que é uma comunidade?',
    'um grupo de pessoas ligadas por convivência, espaços ou interesses em comum',
    [
      'somente as pessoas que têm o mesmo sobrenome',
      'apenas as pessoas que nasceram no mesmo país',
      'somente quem exerce a mesma profissão',
    ],
    'Uma comunidade reúne pessoas com vínculos em comum. Elas não precisam ter a mesma origem ou profissão.',
    [
      'Pessoas com sobrenomes diferentes também podem fazer parte de uma comunidade.',
      'Uma comunidade pode reunir pessoas nascidas em países diferentes.',
      'Pessoas de profissões diferentes também podem pertencer à mesma comunidade.',
    ],
  ],
  [
    'Como os descendentes podem preservar a história de uma comunidade de imigrantes?',
    'guardando registros e compartilhando memórias, relatos e celebrações',
    [
      'apagando os nomes e as datas anotados nas fotografias',
      'trocando os relatos das famílias por histórias inventadas',
      'descartando cartas antigas antes de conhecer seu conteúdo',
    ],
    'Relatos, fotografias, cartas e celebrações podem ajudar a preservar e transmitir memórias de uma comunidade.',
    [
      'Apagar nomes e datas pode eliminar informações importantes para compreender as fotografias.',
      'Histórias inventadas não substituem relatos e registros sobre as experiências vividas.',
      'Descartar cartas sem examiná-las pode fazer a comunidade perder registros de sua história.',
    ],
  ],
  [
    'Quais fontes podem ajudar a estudar a história de uma família de imigrantes?',
    'cartas, fotografias, documentos e relatos de familiares',
    [
      'um palpite sobre a viagem, sem consultar registros ou relatos',
      'uma história inventada sobre a família, sem evidências',
      'uma data de chegada escolhida ao acaso',
    ],
    'Fontes diferentes podem ser comparadas para conhecer experiências de uma família de imigrantes.',
    [
      'Um palpite sem registros ou relatos não comprova como foi a viagem da família.',
      'Uma história inventada sem evidências não comprova as experiências da família.',
      'Uma data escolhida ao acaso não comprova quando a família chegou; é preciso consultar fontes.',
    ],
  ],
  [
    'Ao estudar a imigração, como devemos usar um sobrenome de família?',
    'como uma pista que deve ser investigada com outras fontes',
    [
      'como prova de que todos os parentes nasceram no mesmo país',
      'como uma informação suficiente para conhecer toda a história da família',
      'como prova de que o nome nunca mudou ao longo do tempo',
    ],
    'Sobrenomes podem oferecer pistas sobre origens familiares, mas precisam ser estudados junto com outros registros e relatos.',
    [
      'Pessoas de uma família podem nascer em países diferentes, mesmo tendo o mesmo sobrenome.',
      'Um sobrenome não informa sozinho toda a trajetória de uma família.',
      'Os nomes podem mudar; um sobrenome atual não prova que sempre foi escrito da mesma forma.',
    ],
  ],
  [
    'O que pode significar a integração de imigrantes em uma comunidade?',
    'participar da vida da comunidade e poder manter costumes de origem',
    [
      'abandonar todos os costumes de origem para poder conviver',
      'viver sem conversar com os vizinhos',
      'participar somente de atividades com pessoas da mesma origem',
    ],
    'A integração envolve participação na vida em sociedade. Ela não exige apagar a identidade cultural das pessoas.',
    [
      'Conviver não exige abandonar todos os costumes de origem; a diversidade pode ser respeitada.',
      'Conversar e criar vínculos com outras pessoas faz parte da participação na comunidade.',
      'A participação na comunidade pode incluir pessoas de diferentes origens.',
    ],
  ],
  [
    'Qual atitude demonstra respeito pelas histórias de imigrantes?',
    'ouvir os relatos e evitar julgar todo um grupo pela história de uma pessoa',
    [
      'imitar o sotaque de alguém para fazer os colegas rirem',
      'contar a história de uma família como se fosse igual à de todas as outras',
      'ignorar relatos de costumes diferentes dos nossos',
    ],
    'Ouvir com respeito e reconhecer histórias diferentes ajuda a evitar julgamentos injustos sobre um grupo inteiro.',
    [
      'Usar o sotaque de alguém para fazer piada pode humilhar essa pessoa.',
      'As famílias podem ter histórias diferentes, mesmo quando possuem a mesma origem.',
      'Relatos de costumes diferentes também merecem atenção e respeito.',
    ],
  ],
  [
    'Por que uma receita de família pode ajudar a estudar a história da imigração?',
    'porque pode guardar memórias e mostrar trocas culturais',
    [
      'porque revela sozinha todos os acontecimentos de uma viagem',
      'porque prova que todas as famílias cozinham da mesma maneira',
      'porque mostra que os costumes nunca mudam',
    ],
    'Uma receita pode ser transmitida entre gerações e adaptada no contato com outros costumes e ingredientes.',
    [
      'Uma receita pode oferecer pistas, mas não conta sozinha todos os acontecimentos de uma viagem.',
      'As receitas e as formas de cozinhar podem variar de uma família para outra.',
      'As receitas podem mudar e incorporar novos ingredientes e conhecimentos.',
    ],
  ],
  [
    'Qual cuidado devemos ter ao contar a história de imigrantes?',
    'evitar dizer que todas as pessoas de um grupo viveram da mesma forma',
    [
      'usar o relato de uma pessoa para explicar a vida de todas as outras',
      'escolher apenas histórias iguais à primeira que conhecemos',
      'desconsiderar registros que mostrem experiências diferentes',
    ],
    'Reconhecer diferenças entre pessoas e comunidades ajuda a compreender a diversidade das experiências de imigração.',
    [
      'Um relato individual não representa automaticamente a vida de todas as outras pessoas.',
      'Buscar apenas histórias iguais pode esconder experiências diferentes e importantes.',
      'Registros com experiências diferentes ajudam a conhecer a diversidade das histórias.',
    ],
  ],
  [
    'Como a presença de imigrantes portugueses e espanhóis passou a fazer parte da história do Brasil?',
    'pelas experiências, pelo trabalho e pelas relações de pessoas e comunidades',
    [
      'por uma única experiência vivida da mesma forma por todos',
      'somente pelas viagens, sem relação com a vida no Brasil',
      'apenas pela história de uma pessoa de cada país',
    ],
    'Essa presença foi construída por experiências e relações variadas, que fizeram parte da vida em sociedade.',
    [
      'As experiências dos imigrantes foram variadas, não uma única história igual para todos.',
      'A história da imigração também inclui a vida e as relações construídas depois da chegada.',
      'Muitas pessoas e comunidades fizeram parte dessa história, não apenas uma pessoa de cada país.',
    ],
  ],
  [
    'Qual frase resume de forma adequada a história de imigrantes portugueses e espanhóis no Brasil?',
    'Eles tiveram experiências variadas e contribuíram de diferentes formas para a sociedade.',
    [
      'Todos tiveram o mesmo motivo para vir e exerceram a mesma profissão.',
      'Seus costumes desapareceram assim que chegaram ao Brasil.',
      'Uma única família representa a história de todos os imigrantes.',
    ],
    'O estudo da imigração reconhece a diversidade das experiências e as contribuições de diferentes pessoas e comunidades.',
    [
      'Os motivos da imigração e as profissões podiam variar entre as pessoas.',
      'Os costumes podiam ser mantidos, compartilhados e transformados ao longo do tempo.',
      'Uma família tem sua própria história e não representa todas as experiências de um grupo.',
    ],
  ],
];
function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  return value;
}
function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(stableValue(value)))
    .digest('hex');
}
function buildQuestionsUnchecked() {
  return SPECS.map(
    ([question, correct, wrong, explanation, feedback], index) => {
      const correctIndex = index % 4;
      const options = new Array(4);
      const wrongExplanations = {};
      [correct, ...wrong].forEach((option, baseIndex) => {
        const targetIndex = (baseIndex + correctIndex) % 4;
        options[targetIndex] = option;
        if (baseIndex > 0)
          wrongExplanations[targetIndex] = feedback[baseIndex - 1];
      });
      return {
        schemaVersion: 'content-v1',
        id: `2026t3v1_his_imigrantes_ibericos_${String(index + 1).padStart(3, '0')}`,
        contentSetId: '2026-t3-v1',
        subject: 'historia',
        topic: 'imigrantes-portugueses-espanhois',
        topicName: 'Imigrantes portugueses e espanhóis',
        question,
        options,
        correctIndex,
        explanation,
        wrongExplanations,
        skill: 'identificar-presenca-e-contribuicoes-sem-generalizacoes',
        sourceRef: {
          referenceId: 'roteiro-estudos-av-mensal-t3-2026',
          section: 'História',
          page: String(
            [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104][
              index % 15
            ],
          ),
        },
        reviewStatus: 'draft',
        version: 2,
      };
    },
  );
}
function buildQuestions(...args) {
  return validateGeneratedQuestions(buildQuestionsUnchecked(...args));
}

function main() {
  const questions = buildQuestions();
  fs.mkdirSync(path.dirname(DRAFT_PATH), { recursive: true });
  fs.writeFileSync(
    DRAFT_PATH,
    `${JSON.stringify({ schemaVersion: 'content-draft-v1', contentSetId: '2026-t3-v1', questions }, null, 2)}\n`,
  );
  process.stdout.write(
    `t3-historia-imigrantes-ibericos: ${questions.length} questoes; revisao editorial deve ser registrada separadamente.\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, sha256 };
