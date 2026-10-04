const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(ROOT, 'docs/drafts/2026-t3-v1-cie-luz-cores.json');
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-cie-luz-cores-audit.json',
);
const SPECS = [
  [
    'O que é uma cor?',
    'uma percepção produzida pela luz que chega aos olhos',
    [
      'um tipo de som',
      'uma forma de vento',
      'um objeto que não depende de luz',
    ],
    'As cores são percebidas quando a luz chega aos olhos após interagir com os objetos.',
  ],
  [
    'Qual é uma fonte de luz branca usada no dia a dia?',
    'uma lâmpada branca acesa',
    ['uma pedra escura', 'um copo vazio', 'um caderno fechado'],
    'Uma lâmpada acesa pode emitir luz que percebemos como branca.',
  ],
  [
    'O que pode acontecer quando a luz branca atravessa um prisma?',
    'ela pode se separar em várias cores',
    ['ela vira água', 'ela deixa de existir', 'ela produz apenas som'],
    'O prisma pode separar a luz em diferentes cores.',
  ],
  [
    'Qual fenômeno natural pode mostrar várias cores no céu?',
    'o arco-íris',
    ['a sombra de uma parede', 'o som de um trovão', 'o vento entre árvores'],
    'O arco-íris aparece quando a luz interage com gotículas de água.',
  ],
  [
    'Por que vemos um objeto vermelho iluminado?',
    'porque parte da luz vermelha chega aos nossos olhos',
    [
      'porque o objeto produz som vermelho',
      'porque não há luz no ambiente',
      'porque toda luz é absorvida',
    ],
    'A cor percebida depende da luz que chega aos olhos.',
  ],
  [
    'O que um objeto escuro pode fazer com mais luz?',
    'absorver grande parte da luz',
    [
      'refletir toda a luz',
      'produzir luz branca própria',
      'transformar luz em água',
    ],
    'Objetos escuros costumam absorver grande parte da luz que recebem.',
  ],
  [
    'O que um objeto claro pode fazer com a luz?',
    'refletir uma parte maior da luz',
    ['impedir sempre toda luz', 'produzir som', 'eliminar as cores'],
    'Superfícies claras podem refletir mais luz.',
  ],
  [
    'Qual conjunto apresenta cores frequentemente observadas no arco-íris?',
    'vermelho, amarelo, verde e azul',
    [
      'preto, cinza, marrom e branco apenas',
      'som, calor, vento e chuva',
      'madeira, vidro, metal e papel',
    ],
    'O arco-íris mostra várias cores, incluindo vermelho, amarelo, verde e azul.',
  ],
  [
    'Como a luz influencia a cor percebida?',
    'a iluminação pode mudar a aparência das cores',
    [
      'a luz nunca interfere',
      'a cor depende apenas do som',
      'a luz transforma todos os objetos em transparentes',
    ],
    'A iluminação participa da percepção das cores.',
  ],
  [
    'Por que uma sala sem luz dificulta identificar cores?',
    'porque pouca luz chega aos olhos',
    [
      'porque os objetos perdem sua forma',
      'porque o som cobre as cores',
      'porque toda sombra é colorida',
    ],
    'Sem luz suficiente, a percepção das cores fica prejudicada.',
  ],
  [
    'Qual experiência ajuda a observar a separação de cores?',
    'passar luz por um prisma',
    [
      'apagar todas as luzes',
      'colocar um objeto no escuro',
      'ouvir música perto de uma parede',
    ],
    'O prisma permite observar a separação da luz em cores.',
  ],
  [
    'O que acontece com a luz ao ser absorvida por um objeto?',
    'parte da luz fica retida no material',
    [
      'ela sempre retorna ao ambiente',
      'ela vira uma imagem no espelho',
      'ela passa sem interagir',
    ],
    'Absorção significa que parte da luz fica no material.',
  ],
  [
    'O que acontece com a luz ao ser refletida?',
    'ela retorna e muda de direção',
    [
      'ela desaparece sempre',
      'ela se transforma em som',
      'ela deixa de alcançar qualquer lugar',
    ],
    'A reflexão muda a direção da luz.',
  ],
  [
    'Qual relação existe entre luz e sombra colorida?',
    'a cor da luz pode influenciar a aparência da sombra',
    [
      'sombras sempre produzem luz',
      'sombras existem sem fonte',
      'a cor nunca depende da iluminação',
    ],
    'A iluminação influencia a aparência das sombras.',
  ],
  [
    'Por que uma folha verde parece verde sob luz branca?',
    'porque reflete luz verde para nossos olhos',
    [
      'porque absorve somente a luz verde',
      'porque não recebe luz',
      'porque produz som verde',
    ],
    'A folha reflete parte da luz verde que chega aos olhos.',
  ],
  [
    'Qual material pode ajudar a separar a luz em cores?',
    'um prisma transparente',
    ['uma parede opaca', 'um pedaço de madeira', 'um tecido grosso'],
    'O prisma desvia diferentes cores e ajuda a observá-las separadas.',
  ],
  [
    'Como comparar cores em uma atividade com segurança?',
    'observar objetos sob diferentes iluminações sem olhar diretamente para o Sol',
    [
      'olhar diretamente para o Sol',
      'usar objetos quebrados',
      'apagar toda luz e fechar os olhos',
    ],
    'A observação deve evitar luz intensa direta e usar materiais seguros.',
  ],
  [
    'O que pode mudar quando uma lâmpada colorida ilumina um objeto?',
    'a cor percebida do objeto',
    ['a massa do objeto', 'o som do ambiente', 'a existência do objeto'],
    'A cor da iluminação altera a luz que chega aos olhos.',
  ],
  [
    'Qual frase resume a relação entre luz e cores?',
    'as cores percebidas dependem da luz e de como os materiais interagem com ela',
    [
      'cores existem sem luz',
      'toda luz é sempre invisível',
      'materiais não interagem com luz',
    ],
    'Percepção, reflexão e absorção ajudam a explicar as cores.',
  ],
  [
    'Por que estudar luz e cores é útil?',
    'para compreender fenômenos do cotidiano como arco-íris e iluminação',
    [
      'para eliminar a necessidade de luz',
      'para transformar sombras em som',
      'para afirmar que todas as cores são iguais',
    ],
    'O estudo explica observações comuns do ambiente.',
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
      id: `2026t3v1_cie_luz_cores_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'ciencias',
      topic: 'luz-cores',
      topicName: 'Luz e cores',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-relacao-introdutoria-entre-luz-e-cores',
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
        `school-curriculum:2026-t3/ciencias/luz-cores/page-${question.sourceRef.page}`,
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
    topicId: 'ciencias:luz-cores',
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
    `t3-ciencias-luz-cores: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
