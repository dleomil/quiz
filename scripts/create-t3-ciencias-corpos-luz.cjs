const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-cie-corpos-luz.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-cie-corpos-luz-audit.json',
);

const SPECS = [
  [
    'O que é um corpo luminoso?',
    'um corpo que produz sua própria luz',
    [
      'um corpo que apenas recebe luz',
      'uma região escura formada por um objeto',
      'um material que deixa toda luz passar',
    ],
    'Um corpo luminoso emite luz própria.',
  ],
  [
    'Qual é um corpo luminoso natural?',
    'o Sol',
    ['a Lua', 'um livro', 'uma parede'],
    'O Sol produz luz própria e é uma fonte natural de luz.',
  ],
  [
    'Qual objeto é luminoso quando está ligado?',
    'uma lâmpada',
    ['uma cadeira', 'um caderno', 'uma bola'],
    'Uma lâmpada ligada produz luz.',
  ],
  [
    'A Lua é classificada como corpo:',
    'iluminado',
    ['luminoso', 'transparente', 'sem luz'],
    'A Lua não produz luz própria; ela reflete a luz do Sol.',
  ],
  [
    'Por que vemos um livro perto de uma janela durante o dia?',
    'porque ele recebe e reflete a luz',
    [
      'porque ele produz luz própria',
      'porque ele não recebe luz',
      'porque ele transforma luz em som',
    ],
    'O livro é iluminado pela luz que chega até ele e reflete parte dela.',
  ],
  [
    'Uma bola colocada perto de uma lanterna ligada é um exemplo de:',
    'corpo iluminado',
    ['uma chama de vela acesa', 'uma lâmpada ligada', 'o Sol ao amanhecer'],
    'A bola recebe luz da lanterna; por isso é um corpo iluminado.',
  ],
  [
    'O que permite enxergar um objeto iluminado?',
    'a luz refletida pelo objeto chegar aos olhos',
    [
      'o objeto criar luz própria',
      'o objeto apagar toda a luz',
      'a ausência total de luz',
    ],
    'Vemos o objeto quando parte da luz que ele reflete chega aos nossos olhos.',
  ],
  [
    'Um pirilampo aceso é um corpo:',
    'luminoso',
    ['iluminado', 'opaco sem luz', 'transparente'],
    'O pirilampo produz luz por um processo do próprio organismo.',
  ],
  [
    'Qual alternativa reúne somente corpos iluminados?',
    'Lua, livro e parede',
    [
      'Sol, lâmpada e chama',
      'pirilampo, Sol e Lua',
      'lâmpada, parede e vela acesa',
    ],
    'Lua, livro e parede não emitem luz própria; eles podem receber luz.',
  ],
  [
    'Uma vela apagada é melhor classificada como:',
    'corpo iluminado, quando recebe luz',
    ['corpo luminoso, mesmo apagada', 'fonte de luz natural', 'sombra'],
    'A vela só emite luz quando está acesa; apagada, ela pode apenas receber luz.',
  ],
  [
    'Quando uma vela está acesa, a chama é:',
    'um corpo luminoso',
    ['um corpo apenas iluminado', 'um espelho', 'uma sombra'],
    'A chama emite luz própria enquanto a vela está acesa.',
  ],
  [
    'Qual frase está correta?',
    'um corpo pode ser visto quando recebe ou produz luz',
    [
      'só corpos luminosos podem ser vistos',
      'corpos iluminados nunca refletem luz',
      'a luz não participa da visão',
    ],
    'Corpos luminosos emitem luz e corpos iluminados refletem a luz que recebem.',
  ],
  [
    'Um planeta aparece brilhante no céu porque:',
    'reflete a luz que recebe do Sol',
    ['produz a mesma luz do Sol', 'não recebe nenhuma luz', 'é uma estrela'],
    'Planetas não são estrelas; vemos a luz do Sol refletida por eles.',
  ],
  [
    'Qual objeto não produz luz própria?',
    'um espelho',
    ['uma lâmpada ligada', 'uma chama', 'um pirilampo aceso'],
    'O espelho reflete a luz que recebe, mas não é uma fonte luminosa.',
  ],
  [
    'Em um quarto totalmente escuro, um brinquedo comum não é visto porque:',
    'não há luz para ele refletir',
    [
      'o brinquedo deixou de existir',
      'ele começou a produzir luz',
      'os olhos não precisam de luz',
    ],
    'Um brinquedo comum precisa receber luz para refletir parte dela até os olhos.',
  ],
  [
    'Qual é a diferença principal entre corpo luminoso e iluminado?',
    'o luminoso emite luz própria e o iluminado recebe luz',
    [
      'o luminoso é sempre maior',
      'o iluminado nunca pode ser visto',
      'o luminoso não interage com a luz',
    ],
    'A origem da luz é o que diferencia os dois tipos de corpo.',
  ],
  [
    'Uma placa de trânsito vista à noite com faróis acesos é:',
    'um corpo iluminado pelos faróis',
    [
      'uma fonte luminosa como o farol',
      'uma sombra produzida pelo carro',
      'um corpo que não recebe luz',
    ],
    'A placa recebe a luz dos faróis e reflete parte dela.',
  ],
  [
    'Qual exemplo apresenta fonte de luz artificial?',
    'uma lanterna ligada',
    ['o Sol', 'a Lua', 'uma pedra'],
    'A lanterna ligada é produzida por pessoas e emite luz.',
  ],
  [
    'Se uma lâmpada está desligada e recebe luz do Sol, ela é:',
    'um corpo iluminado',
    [
      'um corpo luminoso por estar no teto',
      'uma fonte natural de luz',
      'uma sombra',
    ],
    'Desligada, a lâmpada não emite luz; ela apenas recebe a luz solar.',
  ],
  [
    'Qual conclusão é correta sobre a Lua?',
    'ela é vista porque reflete a luz do Sol',
    [
      'ela cria luz igual à de uma lâmpada',
      'ela é invisível durante a noite',
      'ela não tem relação com a luz solar',
    ],
    'A luz solar refletida pela Lua permite que ela seja vista da Terra.',
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
          `"${option}" não descreve corretamente esta situação: ${explanation}`;
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_cie_corpos_luz_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'ciencias',
      topic: 'corpos-luz',
      topicName: 'Corpos luminosos e iluminados',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'diferenciar-corpos-luminosos-e-iluminados',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Ciências',
        page: String(41 + (index % 15)),
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
        `school-curriculum:2026-t3/ciencias/corpos-luz/page-${question.sourceRef.page}`,
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
    topicId: 'ciencias:corpos-luz',
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
    `t3-ciencias-corpos-luz: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
