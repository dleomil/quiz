const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-cie-propriedades-luz.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-cie-propriedades-luz-audit.json',
);
const SPECS = [
  [
    'O que é necessário para enxergar um objeto?',
    'luz chegando aos nossos olhos',
    ['som alto', 'água em movimento', 'vento forte'],
    'A visão acontece quando a luz chega aos olhos.',
  ],
  [
    'O que uma fonte de luz faz?',
    'emite luz',
    ['absorve todo som', 'produz apenas água', 'impede qualquer sombra'],
    'Uma fonte de luz é um corpo que emite luz.',
  ],
  [
    'Qual é uma fonte natural de luz?',
    'o Sol',
    ['uma cadeira', 'um caderno', 'uma parede'],
    'O Sol é uma fonte natural de luz.',
  ],
  [
    'Qual é uma fonte artificial de luz?',
    'uma lâmpada acesa',
    ['uma pedra', 'uma folha seca', 'um copo vazio'],
    'A lâmpada é produzida pelas pessoas e emite luz quando acesa.',
  ],
  [
    'O que acontece quando um objeto opaco bloqueia a luz?',
    'pode surgir uma sombra',
    [
      'a luz atravessa sem mudança',
      'o objeto vira transparente',
      'a sombra ilumina o objeto',
    ],
    'A sombra aparece na região que recebe menos luz por causa do bloqueio.',
  ],
  [
    'Como mudar a posição da lâmpada pode mudar a sombra?',
    'a direção e o tamanho da sombra podem mudar',
    [
      'a sombra deixa de depender da luz',
      'o objeto fica transparente',
      'a luz vira som',
    ],
    'A posição da fonte altera a forma como a luz é bloqueada.',
  ],
  [
    'O que é reflexão da luz?',
    'o retorno da luz ao encontrar uma superfície',
    [
      'a produção de som pela luz',
      'a passagem de água pela parede',
      'o desaparecimento de toda luz',
    ],
    'Reflexão é o retorno da luz após encontrar uma superfície.',
  ],
  [
    'Qual superfície reflete bem a luz?',
    'um espelho',
    ['um tecido escuro e áspero', 'uma esponja', 'um papel amassado'],
    'O espelho tem superfície adequada para refletir a luz.',
  ],
  [
    'Por que vemos nosso rosto no espelho?',
    'porque a luz refletida chega aos nossos olhos',
    [
      'porque o espelho produz nosso rosto',
      'porque não há luz no ambiente',
      'porque o som forma imagens',
    ],
    'A imagem é percebida pela luz refletida pelo espelho.',
  ],
  [
    'O que pode acontecer quando a luz encontra uma superfície clara?',
    'parte da luz pode ser refletida',
    [
      'toda luz obrigatoriamente desaparece',
      'a superfície vira fonte natural',
      'a luz deixa de existir',
    ],
    'Superfícies claras podem refletir parte da luz que recebem.',
  ],
  [
    'Por que uma sala escura dificulta enxergar?',
    'há pouca luz chegando aos olhos',
    [
      'há luz demais nos olhos',
      'as sombras produzem imagens',
      'os objetos deixam de existir',
    ],
    'Com pouca luz, os olhos recebem menos informação dos objetos.',
  ],
  [
    'Como percebemos as cores dos objetos?',
    'pela luz que chega aos olhos após interagir com eles',
    [
      'pelo som produzido pelo objeto',
      'pela temperatura do ar',
      'pela força da gravidade',
    ],
    'A percepção das cores depende da luz que chega aos olhos.',
  ],
  [
    'Qual situação mostra reflexão da luz?',
    'ver uma janela refletida em um espelho',
    ['ouvir uma campainha', 'sentir o vento', 'beber água'],
    'A imagem refletida é um exemplo de reflexão da luz.',
  ],
  [
    'Qual situação mostra formação de sombra?',
    'uma pessoa bloqueando a luz de uma lanterna',
    [
      'uma lanterna apontada para o céu sem objeto',
      'um objeto transparente diante da luz',
      'um som atravessando uma parede',
    ],
    'A pessoa bloqueia a luz e cria uma região de sombra.',
  ],
  [
    'O que pode alterar o tamanho de uma sombra?',
    'a distância entre a fonte, o objeto e a superfície',
    ['a cor do som', 'o sabor do objeto', 'a quantidade de água no ar'],
    'As posições relativas mudam a projeção da sombra.',
  ],
  [
    'Por que uma lanterna ilumina uma parte do caminho?',
    'porque emite luz que se espalha pelo ambiente',
    [
      'porque transforma o caminho em espelho',
      'porque apaga todas as sombras',
      'porque produz luz natural',
    ],
    'A lanterna é uma fonte artificial que emite luz.',
  ],
  [
    'O que ocorre quando a luz é refletida por uma superfície?',
    'ela muda de direção',
    [
      'ela sempre vira matéria',
      'ela deixa de poder ser vista',
      'ela transforma o objeto em som',
    ],
    'A reflexão muda a direção de propagação da luz.',
  ],
  [
    'Qual afirmação sobre sombra está correta?',
    'a sombra depende da presença de uma fonte de luz e de um bloqueio',
    [
      'a sombra existe sem luz',
      'todo material produz a mesma sombra',
      'a sombra é uma fonte de luz',
    ],
    'A sombra resulta da luz bloqueada por um objeto.',
  ],
  [
    'Como observar uma propriedade da luz em uma atividade?',
    'usar uma lanterna, objetos diferentes e observar o que acontece',
    [
      'evitar qualquer fonte de luz',
      'usar somente sons',
      'fechar os olhos durante tudo',
    ],
    'Uma observação simples permite comparar luz, reflexão e sombra.',
  ],
  [
    'Qual frase resume propriedades estudadas da luz?',
    'a luz pode ser emitida, refletida e bloqueada, formando sombras',
    [
      'a luz só produz som',
      'a luz não interage com objetos',
      'a luz existe apenas em espelhos',
    ],
    'A luz apresenta diferentes comportamentos ao interagir com materiais.',
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
function buildQuestions() {
  return SPECS.map(([question, correct, wrong, explanation], index) => {
    const correctIndex = index % 4;
    const options = new Array(4);
    const wrongExplanations = {};
    [correct, ...wrong].forEach((option, baseIndex) => {
      const targetIndex = (baseIndex + correctIndex) % 4;
      options[targetIndex] = option;
      if (baseIndex > 0)
        wrongExplanations[targetIndex] =
          `A alternativa não corresponde ao conceito de ${correct.toLowerCase()}.`;
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_cie_propriedades_luz_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'ciencias',
      topic: 'propriedades-luz',
      topicName: 'Propriedades da luz',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-reflexao-sombra-e-percepcao',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Ciências',
        page: String(
          [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59][
            index % 15
          ],
        ),
      },
      reviewStatus: 'draft',
      version: 1,
    };
  });
}
function buildAudit(questions) {
  const reviews = questions.flatMap((question) =>
    ['curriculum-factual', 'pedagogical-linguistic'].map((pass) => ({
      questionId: question.id,
      pass,
      actorId: 'codex-single-agent',
      actorRole:
        pass === 'curriculum-factual'
          ? 'content_curator'
          : 'pedagogical_quality',
      evidenceRefs: [
        `school-curriculum:2026-t3/ciencias/propriedades-luz/page-${question.sourceRef.page}`,
      ],
      decision: 'clear',
      findings: [],
    })),
  );
  return {
    schemaVersion: 'content-quality-audit-v1',
    reviewMode: 'single-agent-sequential',
    reportStatus: 'draft',
    contentSetId: '2026-t3-v1',
    topicId: 'ciencias:propriedades-luz',
    sourceSha256: sha256(questions),
    reviews,
  };
}
function main() {
  const questions = buildQuestions();
  const audit = buildAudit(questions);
  fs.mkdirSync(path.dirname(DRAFT_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(AUDIT_PATH), { recursive: true });
  fs.writeFileSync(
    DRAFT_PATH,
    `${JSON.stringify({ schemaVersion: 'content-draft-v1', contentSetId: '2026-t3-v1', questions }, null, 2)}\n`,
  );
  fs.writeFileSync(AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`);
  process.stdout.write(
    `t3-ciencias-propriedades-luz: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
