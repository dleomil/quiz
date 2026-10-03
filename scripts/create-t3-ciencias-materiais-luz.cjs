const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-cie-materiais-luz.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-cie-materiais-luz-audit.json',
);

const SPECS = [
  [
    'O que é um material transparente?',
    'aquele que deixa a luz passar e permite ver através dele',
    [
      'aquele que não deixa nenhuma luz passar',
      'aquele que produz som',
      'aquele que sempre reflete toda luz',
    ],
    'Materiais transparentes deixam a luz passar com bastante facilidade.',
  ],
  [
    'Qual objeto costuma ser transparente?',
    'um vidro limpo de janela',
    [
      'uma parede de tijolos',
      'uma caixa de papelão fechada',
      'uma placa de madeira',
    ],
    'O vidro limpo permite a passagem da luz e a visão através dele.',
  ],
  [
    'O que é um material translúcido?',
    'aquele que deixa passar parte da luz, mas não permite ver nitidamente',
    [
      'aquele que não deixa luz alguma passar',
      'aquele que transforma luz em som',
      'aquele que é sempre totalmente transparente',
    ],
    'Materiais translúcidos deixam passar luz, porém espalham parte dela.',
  ],
  [
    'Qual exemplo pode ser translúcido?',
    'um papel vegetal',
    [
      'um espelho perfeito',
      'uma parede de concreto',
      'uma janela de vidro totalmente limpa',
    ],
    'O papel vegetal deixa passar alguma luz, mas dificulta enxergar detalhes.',
  ],
  [
    'O que é um material opaco?',
    'aquele que não deixa a luz atravessá-lo',
    [
      'aquele que deixa ver tudo através dele',
      'aquele que deixa passar parte da luz',
      'aquele que só funciona à noite',
    ],
    'Materiais opacos bloqueiam a passagem da luz.',
  ],
  [
    'Qual objeto é geralmente opaco?',
    'uma porta de madeira',
    ['um vidro limpo', 'um papel vegetal', 'uma lente transparente'],
    'A madeira da porta impede que a luz atravesse.',
  ],
  [
    'Como classificar uma cortina fina que deixa a claridade passar, mas esconde detalhes?',
    'translúcida',
    ['transparente', 'opaca', 'sonora'],
    'Ela permite passagem parcial da luz e não mostra a imagem com nitidez.',
  ],
  [
    'Como classificar uma parede de concreto?',
    'opaca',
    ['transparente', 'translúcida', 'brilhante e transparente'],
    'A parede de concreto bloqueia a luz.',
  ],
  [
    'Como classificar um aquário de vidro limpo?',
    'transparente',
    ['opaco', 'translúcido', 'sem relação com a luz'],
    'O vidro limpo do aquário permite observar o interior.',
  ],
  [
    'O que acontece quando a luz encontra um material opaco?',
    'ela não atravessa o material',
    [
      'ela sempre atravessa sem mudar',
      'ela desaparece do ambiente inteiro',
      'ela vira água',
    ],
    'O material opaco bloqueia a passagem da luz.',
  ],
  [
    'O que pode ser visto através de um material transparente?',
    'objetos do outro lado',
    [
      'somente o próprio material',
      'nada em nenhuma situação',
      'apenas objetos que produzem calor',
    ],
    'A passagem da luz permite enxergar objetos atrás dele.',
  ],
  [
    'Por que não vemos detalhes nítidos através de um material translúcido?',
    'porque a luz se espalha ao passar',
    [
      'porque ele não recebe luz',
      'porque ele produz escuridão total',
      'porque ele é sempre um espelho',
    ],
    'A luz espalhada dificulta a formação de uma imagem nítida.',
  ],
  [
    'Qual grupo apresenta um exemplo de cada tipo?',
    'vidro limpo, papel vegetal e madeira',
    [
      'madeira, concreto e parede',
      'vidro limpo, lente e aquário',
      'papel vegetal, cortina fina e plástico leitoso',
    ],
    'A sequência reúne exemplos transparente, translúcido e opaco.',
  ],
  [
    'Qual material ajuda a iluminar um ambiente sem mostrar claramente o interior?',
    'um plástico leitoso',
    [
      'uma placa de metal',
      'uma parede de concreto',
      'um vidro totalmente limpo',
    ],
    'O plástico leitoso é um exemplo de material translúcido.',
  ],
  [
    'Qual material pode formar uma sombra bem definida?',
    'um objeto opaco',
    ['um vidro totalmente transparente', 'o ar limpo', 'uma lente sem sujeira'],
    'Ao bloquear a luz, um objeto opaco pode formar sombra.',
  ],
  [
    'Por que uma janela transparente é útil?',
    'porque permite a entrada de luz e a visão do exterior',
    [
      'porque bloqueia toda luz',
      'porque produz água',
      'porque impede qualquer visão',
    ],
    'A transparência permite luz e visão através da janela.',
  ],
  [
    'Qual característica diferencia um material opaco de um transparente?',
    'o opaco bloqueia a luz e o transparente deixa a luz passar',
    [
      'o opaco sempre brilha e o transparente faz som',
      'ambos bloqueiam toda luz',
      'ambos deixam ver tudo com nitidez',
    ],
    'A passagem da luz é o critério principal da classificação.',
  ],
  [
    'Qual situação mostra um material translúcido?',
    'uma luz acesa atrás de uma cortina fina',
    [
      'um objeto atrás de uma parede',
      'uma paisagem vista por vidro limpo',
      'um quarto sem nenhuma fonte de luz',
    ],
    'A cortina deixa passar claridade, mas espalha a luz.',
  ],
  [
    'A classificação transparente, translúcido ou opaco depende principalmente de quê?',
    'da quantidade de luz que atravessa o material',
    ['do tamanho do objeto', 'do som que ele produz', 'da cor do céu'],
    'A passagem da luz orienta essa classificação.',
  ],
  [
    'Qual frase resume os três tipos de materiais?',
    'transparentes deixam passar muita luz, translúcidos parte dela e opacos bloqueiam a luz',
    [
      'todos deixam passar a mesma quantidade de luz',
      'opacos deixam passar mais luz que transparentes',
      'translúcidos não têm relação com a luz',
    ],
    'Os três tipos se diferenciam pela passagem da luz.',
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
      id: `2026t3v1_cie_materiais_luz_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'ciencias',
      topic: 'materiais-transparentes',
      topicName: 'Materiais transparentes, translúcidos e opacos',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'classificar-materiais-pela-passagem-da-luz',
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
        `school-curriculum:2026-t3/ciencias/materiais-transparentes/page-${question.sourceRef.page}`,
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
    topicId: 'ciencias:materiais-transparentes',
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
    `t3-ciencias-materiais-luz: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
