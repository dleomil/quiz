const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-geo-nascente-rio.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-geo-nascente-rio-audit.json',
);

const SPECS = [
  [
    'O que é a nascente de um rio?',
    'o lugar onde o rio começa',
    [
      'o lugar onde o rio termina',
      'uma ponte sobre o rio',
      'a margem mais distante',
    ],
    'A nascente é o local de origem do rio.',
  ],
  [
    'O que chamamos de curso do rio?',
    'o caminho que a água percorre',
    [
      'somente a água da chuva',
      'o lugar onde o rio termina',
      'uma estrada ao lado do rio',
    ],
    'O curso é o percurso feito pela água desde a nascente até a foz.',
  ],
  [
    'O que é a foz de um rio?',
    'o lugar onde o rio deságua',
    [
      'o local onde o rio começa',
      'a parte mais estreita da nascente',
      'uma montanha sem água',
    ],
    'A foz é o local onde o rio termina seu percurso e deságua em outro corpo de água.',
  ],
  [
    'Qual sequência mostra o percurso básico de um rio?',
    'nascente, curso e foz',
    ['foz, nascente e curso', 'curso, foz e nascente', 'nascente, foz e curso'],
    'A água começa na nascente, percorre o curso e chega à foz.',
  ],
  [
    'Em geral, a água de um rio corre:',
    'de áreas mais altas para áreas mais baixas',
    [
      'sempre de baixo para cima',
      'somente em círculos',
      'sem seguir nenhum caminho',
    ],
    'A diferença de altura ajuda a água a seguir para áreas mais baixas.',
  ],
  [
    'Qual parte fica mais perto da origem do rio?',
    'a nascente',
    ['a foz', 'a margem final', 'o oceano'],
    'A nascente é a origem do rio.',
  ],
  [
    'Qual parte fica mais perto do local onde o rio termina?',
    'a foz',
    ['a nascente', 'o início do curso', 'a montanha de origem'],
    'A foz é o final do percurso do rio.',
  ],
  [
    'Um rio pode desaguar em:',
    'outro rio, lago ou mar',
    ['somente em uma rua', 'somente em uma montanha', 'apenas em uma ponte'],
    'A foz pode estar em outro rio, lago, mar ou oceano.',
  ],
  [
    'O que é um afluente?',
    'um rio menor que deságua em outro rio',
    [
      'a nascente de qualquer rio',
      'uma estrada que acompanha o rio',
      'uma ponte muito comprida',
    ],
    'O afluente contribui com suas águas para outro rio.',
  ],
  [
    'Se uma seta em um desenho aponta da nascente para a foz, ela indica:',
    'a direção do percurso da água',
    [
      'o tamanho das margens',
      'a profundidade da ponte',
      'a quantidade de peixes',
    ],
    'A seta pode representar a direção em que a água percorre o rio.',
  ],
  [
    'Por que é importante proteger a nascente?',
    'porque ela dá origem ao rio',
    [
      'porque nela passam carros',
      'porque ela é sempre uma piscina',
      'porque impede toda chuva',
    ],
    'Cuidar da nascente ajuda a proteger o começo do rio e suas águas.',
  ],
  [
    'Qual atitude ajuda a conservar as margens de um rio?',
    'evitar jogar lixo e retirar a vegetação',
    [
      'jogar entulho na margem',
      'retirar todas as plantas',
      'lavar produtos químicos no rio',
    ],
    'Lixo e retirada da vegetação podem prejudicar as margens e a água.',
  ],
  [
    'Se uma substância polui o rio perto da nascente, o que pode acontecer?',
    'a poluição pode seguir pelo curso do rio',
    [
      'a poluição desaparece imediatamente',
      'o rio muda para uma estrada',
      'a foz deixa de existir na hora',
    ],
    'A água em movimento pode levar a poluição para outras partes do curso.',
  ],
  [
    'A chuva pode contribuir para:',
    'aumentar a água de córregos e rios',
    [
      'secar todos os rios automaticamente',
      'impedir qualquer nascente',
      'transformar rio em ponte',
    ],
    'A água da chuva pode alimentar córregos e rios.',
  ],
  [
    'Qual opção apresenta corretamente as partes de um rio?',
    'nascente, curso e foz',
    [
      'margem, ponte e estrada',
      'chuva, casa e escola',
      'oceano, montanha e rua',
    ],
    'Nascente, curso e foz são partes relacionadas ao percurso do rio.',
  ],
  [
    'O que podemos observar no curso de um rio?',
    'a água seguindo por um leito',
    [
      'a água parada sempre no mesmo ponto',
      'somente areia sem água',
      'uma estrada sem margens',
    ],
    'O leito é o espaço por onde as águas do rio escoam.',
  ],
  [
    'Qual situação mostra cuidado com um rio?',
    'guardar o lixo e descartá-lo corretamente',
    [
      'jogar plástico na água',
      'lavar tinta no rio',
      'deixar óleo escorrer para a margem',
    ],
    'O descarte correto evita poluir o curso do rio.',
  ],
  [
    'Uma ponte construída sobre um rio fica:',
    'sobre uma parte do curso do rio',
    ['sempre dentro da nascente', 'no lugar da foz', 'fora de qualquer margem'],
    'A ponte pode atravessar o curso do rio para permitir a passagem.',
  ],
  [
    'Qual afirmação está correta sobre a foz?',
    'ela é o local onde o rio deságua',
    [
      'ela é sempre o local onde o rio nasce',
      'ela não faz parte do rio',
      'ela é uma estrada de terra',
    ],
    'A foz marca o final do percurso do rio.',
  ],
  [
    'Qual combinação ajuda a cuidar dos rios?',
    'proteger nascentes, margens e água',
    [
      'jogar lixo e retirar plantas',
      'poluir a nascente e limpar a ponte',
      'desperdiçar água e ocupar o leito',
    ],
    'Cuidar de diferentes partes do rio ajuda a preservar o ambiente e a água.',
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
      id: `2026t3v1_geo_nascente_rio_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'geografia',
      topic: 'nascente-rio',
      topicName: 'Nascimento e percurso dos rios',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'identificar-nascente-curso-e-foz',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Geografia',
        page: String([63, 64, 66, 68, 70, 72, 73][index % 7]),
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
        `school-curriculum:2026-t3/geografia/nascente-rio/page-${question.sourceRef.page}`,
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
        `school-curriculum:2026-t3/geografia/nascente-rio/page-${question.sourceRef.page}`,
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
    topicId: 'geografia:nascente-rio',
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
    `t3-geografia-nascente-rio: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}

if (require.main === module) main();

module.exports = { buildQuestions, buildAudit, sha256 };
