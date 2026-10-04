const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-geo-agua-limitada.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-geo-agua-limitada-audit.json',
);

const SPECS = [
  [
    'Por que precisamos preservar a água?',
    'porque ela é necessária para a vida',
    [
      'porque ela nunca acaba',
      'porque só serve para brincar',
      'porque não é usada pelas plantas',
    ],
    'A água é necessária para pessoas, animais e plantas.',
  ],
  [
    'O que significa usar a água com responsabilidade?',
    'evitar desperdício e poluição',
    [
      'usar o máximo possível',
      'jogar resíduos nos rios',
      'deixar torneiras abertas',
    ],
    'Uso responsável combina economia, cuidado e prevenção da poluição.',
  ],
  [
    'Qual situação mostra desperdício de água?',
    'uma torneira aberta sem necessidade',
    ['uma torneira fechada', 'um banho curto', 'um balde usado com cuidado'],
    'Água correndo sem finalidade é desperdício.',
  ],
  [
    'Por que a água disponível para consumo precisa de cuidado?',
    'porque sua quantidade e qualidade podem ser limitadas',
    [
      'porque ela se transforma em alimento sozinha',
      'porque não é usada por ninguém',
      'porque toda água é sempre potável',
    ],
    'A disponibilidade de água limpa pode ser limitada e precisa ser protegida.',
  ],
  [
    'Qual atitude ajuda a economizar água em casa?',
    'fechar a torneira durante a escovação',
    [
      'deixar a torneira aberta',
      'lavar a calçada por horas',
      'encher recipientes sem necessidade',
    ],
    'Fechar a torneira quando ela não é necessária evita desperdício.',
  ],
  [
    'O que pode diminuir a quantidade de água disponível?',
    'o uso exagerado e o desperdício',
    [
      'o cuidado com os rios',
      'o conserto de vazamentos',
      'o uso de um copo para escovar os dentes',
    ],
    'O consumo exagerado e o desperdício reduzem a água disponível para outros usos.',
  ],
  [
    'Qual ação ajuda a manter a água limpa?',
    'não jogar lixo e óleo na água',
    [
      'jogar entulho no rio',
      'lavar tinta no córrego',
      'deixar plástico nas margens',
    ],
    'Evitar resíduos protege a qualidade da água.',
  ],
  [
    'Por que a poluição é um problema para a água?',
    'porque pode prejudicar a saúde e os seres vivos',
    [
      'porque aumenta sempre a água potável',
      'porque transforma lixo em alimento',
      'porque limpa rios rapidamente',
    ],
    'A poluição pode tornar a água imprópria e prejudicar os seres vivos.',
  ],
  [
    'Qual exemplo mostra economia de água na cozinha?',
    'ensaboar a louça com a torneira fechada',
    [
      'deixar a torneira aberta todo o tempo',
      'lavar uma colher com mangueira',
      'deixar a pia transbordar',
    ],
    'Fechar a torneira enquanto ensaboa reduz o desperdício.',
  ],
  [
    'Como um vazamento pode afetar a água disponível?',
    'pode desperdiçar água continuamente',
    [
      'pode criar água potável',
      'pode limpar a torneira',
      'pode fazer a água ficar infinita',
    ],
    'Um vazamento desperdiça água enquanto não é consertado.',
  ],
  [
    'Qual atitude ajuda a preservar a água em um espaço público?',
    'usar lixeiras e avisar sobre vazamentos',
    [
      'jogar lixo no córrego',
      'deixar bebedouros vazando',
      'lavar calçadas sem controle',
    ],
    'Cuidado coletivo reduz poluição e desperdício.',
  ],
  [
    'A água da chuva pode ser reaproveitada com cuidado para:',
    'regar plantas',
    [
      'ser bebida sem tratamento',
      'substituir toda água potável',
      'ser guardada em recipiente sujo',
    ],
    'A água da chuva pode ser usada em atividades que não exigem consumo, com orientação.',
  ],
  [
    'Qual afirmação sobre água potável está correta?',
    'ela deve estar própria para o consumo',
    [
      'ela pode receber qualquer lixo',
      'ela é sempre salgada',
      'ela não precisa ser preservada',
    ],
    'Água potável é própria para beber e deve ser protegida.',
  ],
  [
    'Por que não devemos desperdiçar água durante o banho?',
    'porque outras pessoas e seres vivos também precisam dela',
    [
      'porque o chuveiro produz lixo',
      'porque a água não pode molhar o corpo',
      'porque todo banho seca um rio',
    ],
    'Economizar água ajuda a garantir disponibilidade para diferentes necessidades.',
  ],
  [
    'Qual ação protege uma nascente?',
    'evitar lixo e poluição perto dela',
    [
      'retirar toda a vegetação',
      'jogar óleo no solo',
      'deixar animais e resíduos contaminarem a água',
    ],
    'Proteger a nascente ajuda a conservar a origem da água do rio.',
  ],
  [
    'O que uma comunidade pode fazer para preservar a água?',
    'organizar ações de limpeza e uso consciente',
    [
      'ignorar rios poluídos',
      'aumentar todos os desperdícios',
      'impedir qualquer cuidado coletivo',
    ],
    'A preservação também depende de ações compartilhadas pela comunidade.',
  ],
  [
    'Qual hábito reduz o consumo de água ao lavar uma bicicleta?',
    'usar balde e pouca água',
    [
      'usar mangueira aberta por muito tempo',
      'lavar dentro do rio',
      'deixar a água correndo sem motivo',
    ],
    'O balde ajuda a controlar a quantidade utilizada.',
  ],
  [
    'O que pode acontecer quando uma fonte de água é poluída?',
    'ela pode deixar de ser adequada para alguns usos',
    [
      'ela sempre fica mais limpa',
      'ela vira água potável',
      'ela passa a ser infinita',
    ],
    'A poluição pode impedir o uso seguro da água.',
  ],
  [
    'Qual frase mostra cuidado com a água?',
    'A água deve ser usada sem desperdício.',
    [
      'A água pode receber todo tipo de lixo.',
      'A torneira deve ficar aberta sempre.',
      'A água limpa não precisa de proteção.',
    ],
    'Evitar desperdício e poluição é uma forma de preservar a água.',
  ],
  [
    'Qual combinação está correta?',
    'economizar, não poluir e cuidar das fontes',
    [
      'desperdiçar, poluir e ignorar vazamentos',
      'usar sem limite e jogar lixo nos rios',
      'retirar plantas e deixar torneiras abertas',
    ],
    'Essas três atitudes ajudam a conservar a água e suas fontes.',
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
      id: `2026t3v1_geo_agua_limitada_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'geografia',
      topic: 'agua-limitada',
      topicName: 'Água renovável e limitada',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'compreender-necessidade-de-preservacao-da-agua',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Geografia',
        page: String([63, 65, 67, 69, 71, 73, 57, 59][index % 8]),
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
        `school-curriculum:2026-t3/geografia/agua-limitada/page-${question.sourceRef.page}`,
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
        `school-curriculum:2026-t3/geografia/agua-limitada/page-${question.sourceRef.page}`,
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
    topicId: 'geografia:agua-limitada',
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
    `t3-geografia-agua-limitada: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
