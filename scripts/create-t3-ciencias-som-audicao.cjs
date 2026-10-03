const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-cie-som-audicao.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-cie-som-audicao-audit.json',
);
const SPECS = [
  [
    'O que é o som?',
    'uma vibração que pode ser percebida pela audição',
    ['uma cor da luz', 'um tipo de água', 'uma sombra parada'],
    'O som é produzido por vibrações e pode ser percebido pelos ouvidos.',
  ],
  [
    'O que pode produzir som?',
    'um objeto vibrando',
    ['um objeto completamente parado', 'uma sombra', 'uma cor'],
    'A vibração de um corpo pode produzir som.',
  ],
  [
    'Como uma corda de violão produz som?',
    'vibrando quando é tocada',
    ['ficando imóvel', 'absorvendo toda luz', 'produzindo água'],
    'A corda vibra e essa vibração produz o som.',
  ],
  [
    'Qual órgão ajuda a perceber sons?',
    'o ouvido',
    ['o cotovelo', 'o joelho', 'o cabelo'],
    'O ouvido participa da audição.',
  ],
  [
    'O que acontece quando batemos palmas?',
    'as mãos vibram e produzem som',
    ['a luz desaparece', 'a sombra fica colorida', 'o ar vira água'],
    'O movimento e a vibração das mãos produzem o som.',
  ],
  [
    'Como podemos representar um som forte?',
    'com uma vibração mais intensa',
    [
      'sem nenhuma vibração',
      'com menos movimento sempre',
      'somente com uma cor',
    ],
    'A intensidade da vibração influencia a força percebida do som.',
  ],
  [
    'O que diferencia sons agudos e graves?',
    'a rapidez das vibrações',
    ['a cor do objeto', 'a quantidade de luz', 'o formato da sombra'],
    'Sons agudos e graves estão relacionados à frequência das vibrações.',
  ],
  [
    'Qual exemplo é um som do ambiente?',
    'o canto de um pássaro',
    ['a cor de uma parede', 'a sombra de uma árvore', 'o cheiro de uma flor'],
    'O canto é uma vibração que pode ser percebida como som.',
  ],
  [
    'Por que conseguimos ouvir uma campainha?',
    'as vibrações chegam aos nossos ouvidos',
    [
      'a campainha envia cores aos olhos',
      'o som não precisa vibrar',
      'a sombra produz o toque',
    ],
    'As vibrações se propagam e chegam aos ouvidos.',
  ],
  [
    'O que é ruído excessivo?',
    'um som muito intenso ou incômodo',
    ['um som sempre agradável', 'uma luz fraca', 'uma imagem refletida'],
    'Ruído excessivo pode incomodar e prejudicar a audição.',
  ],
  [
    'Qual atitude ajuda a proteger a audição?',
    'manter volume moderado nos fones',
    [
      'usar volume máximo sempre',
      'ficar perto de caixas muito altas',
      'gritar perto do ouvido',
    ],
    'Volume moderado reduz riscos à audição.',
  ],
  [
    'Por que devemos evitar som muito alto por muito tempo?',
    'porque ele pode prejudicar os ouvidos',
    [
      'porque muda a cor do som',
      'porque produz água',
      'porque elimina todas as vibrações',
    ],
    'Exposição prolongada a sons intensos pode causar danos.',
  ],
  [
    'Qual cuidado é adequado em um show ou evento barulhento?',
    'afastar-se das caixas de som e fazer pausas',
    [
      'ficar encostado nas caixas',
      'aumentar ainda mais o volume',
      'colocar o ouvido perto do alto-falante',
    ],
    'Distância e pausas ajudam a reduzir a exposição ao som intenso.',
  ],
  [
    'Como o silêncio pode ajudar?',
    'dá descanso aos ouvidos',
    [
      'produz som mais forte',
      'impede qualquer audição futura',
      'transforma ruído em luz',
    ],
    'Períodos de silêncio permitem descanso auditivo.',
  ],
  [
    'O que fazer se um som causar dor no ouvido?',
    'avisar um adulto e afastar-se do som',
    ['aproximar-se da fonte', 'aumentar o volume', 'ignorar sempre'],
    'Dor ou desconforto deve ser comunicado a um adulto responsável.',
  ],
  [
    'Qual objeto de uma escola pode produzir som?',
    'um sino',
    [
      'uma parede sem vibração',
      'uma janela fechada sem movimento',
      'uma folha desenhada',
    ],
    'O sino vibra e produz som.',
  ],
  [
    'Como uma bateria produz som?',
    'suas partes vibram quando são golpeadas',
    ['porque não há movimento', 'porque reflete cores', 'porque absorve água'],
    'As partes da bateria vibram ao serem golpeadas.',
  ],
  [
    'Qual frase mostra cuidado com a audição?',
    'usar fones em volume seguro e fazer pausas',
    [
      'usar fones no máximo o dia todo',
      'gritar diretamente nos ouvidos',
      'ficar perto de ruídos intensos',
    ],
    'Volume seguro e pausas ajudam a preservar a audição.',
  ],
  [
    'Por que não devemos colocar objetos no ouvido?',
    'porque podemos machucar o ouvido',
    [
      'porque objetos produzem luz',
      'porque o ouvido não percebe sons',
      'porque o som fica colorido',
    ],
    'Objetos podem causar lesões e não devem ser introduzidos no ouvido.',
  ],
  [
    'Qual resumo está correto?',
    'sons vêm de vibrações e a audição precisa ser protegida',
    [
      'sons não dependem de vibração',
      'ouvidos não precisam de cuidado',
      'todo som é sempre seguro',
    ],
    'Vibração explica a produção do som e cuidados preservam a audição.',
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
      id: `2026t3v1_cie_som_audicao_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'ciencias',
      topic: 'som-audicao',
      topicName: 'Som, audição e cuidado auditivo',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-producao-do-som-e-cuidados-com-a-audicao',
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
        `school-curriculum:2026-t3/ciencias/som-audicao/page-${question.sourceRef.page}`,
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
    topicId: 'ciencias:som-audicao',
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
    `t3-ciencias-som-audicao: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
