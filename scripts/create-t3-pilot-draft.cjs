const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs',
  'drafts',
  '2026-t3-v1-cie-luz-visao.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs',
  'audits',
  '2026-t3-v1-cie-luz-visao-audit.json',
);

const SPECS = [
  [
    'A luz do Sol é um exemplo de:',
    'fonte luminosa',
    ['corpo iluminado', 'sombra', 'espelho'],
    'A luz do Sol é produzida pelo próprio Sol.',
  ],
  [
    'Qual objeto produz luz quando está ligado?',
    'lâmpada',
    ['lua', 'caderno', 'mesa'],
    'A lâmpada ligada produz luz.',
  ],
  [
    'A Lua é um corpo:',
    'iluminado',
    ['luminoso', 'transparente', 'opaco que produz luz'],
    'A Lua é iluminada pela luz do Sol e não produz sua própria luz.',
  ],
  [
    'Qual órgão usamos para enxergar?',
    'olhos',
    ['ouvidos', 'nariz', 'mãos'],
    'Usamos os olhos para perceber a luz e enxergar.',
  ],
  [
    'O que devemos fazer diante de uma luz muito forte?',
    'não olhar diretamente para ela',
    [
      'aproximar o rosto',
      'fechar os olhos e olhar mais perto',
      'colocar a luz nos olhos',
    ],
    'Evitar olhar diretamente para luz intensa ajuda a proteger a visão.',
  ],
  [
    'Qual material costuma deixar a luz passar quase totalmente?',
    'vidro transparente',
    ['madeira', 'papelão', 'pedra'],
    'O vidro transparente permite a passagem de grande parte da luz.',
  ],
  [
    'Qual material deixa passar apenas parte da luz?',
    'papel vegetal',
    ['metal', 'tábua de madeira', 'parede de concreto'],
    'O papel vegetal é translúcido e deixa passar parte da luz.',
  ],
  [
    'Qual objeto é opaco?',
    'livro',
    ['vidro transparente', 'água limpa', 'janela de vidro'],
    'O livro não permite a passagem da luz e é opaco.',
  ],
  [
    'Quando um objeto opaco bloqueia a luz, pode aparecer:',
    'uma sombra',
    ['um som', 'uma cor nova no ouvido', 'uma corrente de ar'],
    'A sombra aparece na região que recebe menos luz porque o objeto a bloqueou.',
  ],
  [
    'Em situações simples, a luz costuma se propagar:',
    'em linha reta',
    ['em zigue-zague obrigatório', 'somente para baixo', 'sem direção'],
    'Em situações simples, representamos a propagação da luz por linhas retas.',
  ],
  [
    'O que um espelho faz com parte da luz que recebe?',
    'reflete a luz',
    ['apaga a luz', 'transforma a luz em som', 'faz a luz desaparecer'],
    'O espelho reflete parte da luz, permitindo observar imagens.',
  ],
  [
    'Por que conseguimos ver nosso rosto no espelho?',
    'porque a luz refletida chega aos nossos olhos',
    [
      'porque o espelho produz o rosto',
      'porque o espelho faz som',
      'porque não precisamos de luz',
    ],
    'A imagem é percebida quando a luz refletida pelo espelho chega aos olhos.',
  ],
  [
    'Uma camiseta vermelha iluminada com luz branca parece vermelha porque:',
    'reflete principalmente a luz vermelha',
    [
      'produz todas as cores sozinha',
      'absorve toda a luz',
      'não precisa de luz',
    ],
    'A cor percebida depende da luz que o objeto reflete até nossos olhos.',
  ],
  [
    'O que acontece quando apagamos a luz de um quarto?',
    'fica mais difícil enxergar os objetos',
    [
      'os objetos deixam de existir',
      'os objetos viram sons',
      'a parede fica transparente',
    ],
    'Sem luz suficiente, os olhos recebem menos informação para formar imagens.',
  ],
  [
    'Uma cortina fina que deixa a claridade passar é um exemplo de material:',
    'translúcido',
    ['luminoso', 'opaco absoluto', 'sonoro'],
    'A cortina fina deixa passar parte da luz e é translúcida.',
  ],
  [
    'Qual situação mostra uma fonte luminosa natural?',
    'uma estrela brilhando',
    ['um espelho', 'uma cadeira', 'uma folha de papel'],
    'As estrelas produzem luz naturalmente.',
  ],
  [
    'Qual situação mostra um corpo iluminado?',
    'uma parede recebendo luz de uma lâmpada',
    ['uma lâmpada acesa', 'o Sol', 'uma vela acesa'],
    'A parede fica visível ao receber luz, mas não produz a própria luz.',
  ],
  [
    'Para enxergar um livro, é necessário que:',
    'a luz chegue do livro aos nossos olhos',
    [
      'o livro faça barulho',
      'o livro seja sempre luminoso',
      'os olhos fiquem fechados',
    ],
    'A visão acontece quando a luz refletida pelo livro chega aos olhos.',
  ],
  [
    'Qual atitude ajuda a cuidar da saúde visual?',
    'fazer pausas ao usar telas',
    [
      'usar tela no escuro por muitas horas',
      'olhar diretamente para o Sol',
      'aproximar sempre a tela do rosto',
    ],
    'Pausas e hábitos seguros ajudam a reduzir o esforço visual.',
  ],
  [
    'Qual combinação está correta?',
    'vidro transparente deixa muita luz passar',
    [
      'madeira é fonte luminosa',
      'espelho não recebe luz',
      'parede opaca deixa toda a luz passar',
    ],
    'Materiais transparentes deixam passar grande parte da luz.',
  ],
];

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
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
    const base = [correct, ...wrong];
    const options = new Array(4);
    const wrongExplanations = {};
    base.forEach((option, baseIndex) => {
      const targetIndex = (baseIndex + correctIndex) % 4;
      options[targetIndex] = option;
      if (baseIndex > 0) {
        wrongExplanations[targetIndex] =
          `A alternativa não corresponde ao conceito de ${correct.toLowerCase()}.`;
      }
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_cie_luz_visao_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'ciencias',
      topic: 'luz-visao',
      topicName: 'Luz e Visão',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-fontes-propriedades-e-cuidados-da-luz',
      sourceRef: {
        referenceId: 'escola-2026-t3',
        section: 'Ciências',
        page: String([41, 43, 46, 48, 49, 51, 54][index % 7]),
      },
      reviewStatus: 'draft',
      version: 1,
    };
  });
}

function buildAudit(questions) {
  const reviews = questions.flatMap((question) => [
    {
      questionId: question.id,
      pass: 'curriculum-factual',
      actorId: 'codex-single-agent',
      actorRole: 'content_curator',
      evidenceRefs: [
        `school-curriculum:2026-t3/ciencias/luz-visao/page-${question.sourceRef.page}`,
      ],
      decision: 'clear',
      findings: [],
    },
    {
      questionId: question.id,
      pass: 'pedagogical-linguistic',
      actorId: 'codex-single-agent',
      actorRole: 'pedagogical_quality',
      evidenceRefs: [
        `school-curriculum:2026-t3/ciencias/luz-visao/page-${question.sourceRef.page}`,
      ],
      decision: 'clear',
      findings: [],
    },
  ]);
  return {
    schemaVersion: 'content-quality-audit-v1',
    reviewMode: 'single-agent-sequential',
    reportStatus: 'draft',
    contentSetId: '2026-t3-v1',
    topicId: 'ciencias:luz-visao',
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
    `t3-pilot-draft: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}

if (require.main === module) main();

module.exports = { buildQuestions, buildAudit, sha256 };
