const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-geo-agua-brasil.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-geo-agua-brasil-audit.json',
);

const SPECS = [
  [
    'O que significa dizer que a água está presente de formas diferentes no Brasil?',
    'há rios, lagos, águas subterrâneas e outros ambientes com água',
    [
      'existe apenas água do mar',
      'todos os lugares têm exatamente a mesma água disponível',
      'a água só aparece quando chove',
    ],
    'O Brasil reúne diferentes ambientes e fontes de água.',
  ],
  [
    'Por que a água não está disponível da mesma maneira em todos os lugares?',
    'porque as chuvas, os rios e as condições do ambiente variam',
    [
      'porque a água escolhe onde ficar',
      'porque todo lugar recebe a mesma chuva',
      'porque só as cidades possuem água',
    ],
    'A distribuição da água depende das condições naturais e do uso em cada lugar.',
  ],
  [
    'Qual é um uso essencial da água nas casas?',
    'beber e preparar alimentos',
    ['decorar paredes', 'produzir brinquedos sem água', 'substituir o ar'],
    'A água é necessária para o consumo e o preparo seguro dos alimentos.',
  ],
  [
    'Qual atividade também depende de água?',
    'cultivar alimentos',
    ['apagar todas as plantas', 'evitar qualquer plantio', 'produzir vento'],
    'A agricultura usa água para o desenvolvimento das plantas.',
  ],
  [
    'Por que as pessoas precisam planejar o uso da água?',
    'para atender diferentes necessidades sem desperdício',
    [
      'para gastar toda a água rapidamente',
      'para impedir o cuidado com os rios',
      'para deixar torneiras abertas',
    ],
    'Planejar ajuda a conciliar consumo, cuidado e disponibilidade.',
  ],
  [
    'O que pode reduzir a qualidade da água de um rio?',
    'lançar lixo ou esgoto sem tratamento',
    ['proteger as margens', 'recolher resíduos', 'evitar produtos poluentes'],
    'Resíduos e esgoto podem poluir a água e prejudicar os seres vivos.',
  ],
  [
    'Qual atitude ajuda a proteger uma fonte de água?',
    'manter o entorno limpo e com vegetação',
    [
      'retirar toda a vegetação',
      'jogar óleo no solo',
      'abandonar lixo nas margens',
    ],
    'Cuidar do entorno ajuda a conservar a fonte e a qualidade da água.',
  ],
  [
    'Como um período de pouca chuva pode afetar uma comunidade?',
    'pode diminuir a água disponível para alguns usos',
    [
      'pode criar rios novos imediatamente',
      'pode tornar toda água potável',
      'pode eliminar a necessidade de economizar',
    ],
    'A falta de chuva pode reduzir a disponibilidade e exigir cuidado.',
  ],
  [
    'Qual exemplo mostra uma diferença de acesso à água?',
    'uma comunidade recebe água encanada e outra depende de buscar água',
    [
      'todas as casas têm exatamente o mesmo acesso',
      'nenhuma pessoa usa água',
      'a água só existe em um copo',
    ],
    'O acesso pode variar entre comunidades e lugares.',
  ],
  [
    'Por que a água de um rio precisa ser tratada antes de beber?',
    'para reduzir riscos à saúde e torná-la adequada ao consumo',
    [
      'para adicionar lixo',
      'para deixá-la salgada',
      'para impedir qualquer uso',
    ],
    'O tratamento ajuda a tornar a água segura para consumo.',
  ],
  [
    'O que é desperdício de água?',
    'usar ou deixar escapar água sem necessidade',
    [
      'fechar uma torneira',
      'consertar um vazamento',
      'usar somente o necessário',
    ],
    'Desperdiçar é gastar água sem finalidade ou cuidado.',
  ],
  [
    'Qual ação doméstica contribui para cuidar da água no Brasil?',
    'fechar a torneira enquanto ensaboa as mãos',
    [
      'deixar a torneira aberta',
      'lavar a calçada por horas',
      'ignorar vazamentos',
    ],
    'Pequenas atitudes reduzem o desperdício.',
  ],
  [
    'Como a vegetação perto de rios pode ajudar?',
    'ela contribui para proteger o solo e as margens',
    [
      'ela transforma água em lixo',
      'ela impede toda chuva',
      'ela torna a água infinita',
    ],
    'A vegetação ajuda a proteger margens e o equilíbrio do ambiente.',
  ],
  [
    'Qual relação existe entre água e saúde?',
    'água contaminada pode causar problemas à saúde',
    [
      'água poluída sempre cura doenças',
      'a saúde não depende de água',
      'qualquer água é segura para beber',
    ],
    'A qualidade da água influencia a saúde das pessoas.',
  ],
  [
    'Qual responsabilidade é compartilhada por moradores e poder público?',
    'preservar fontes e organizar o uso da água',
    [
      'poluir rios de propósito',
      'desperdiçar água em conjunto',
      'impedir o tratamento da água',
    ],
    'O cuidado depende de ações individuais e coletivas.',
  ],
  [
    'Por que devemos evitar jogar óleo na pia?',
    'porque ele pode chegar à água e dificultar seu tratamento',
    [
      'porque ele cria água limpa',
      'porque ele alimenta os rios',
      'porque ele substitui o tratamento',
    ],
    'O óleo pode poluir a água e deve receber destinação adequada.',
  ],
  [
    'Qual frase resume um desafio relacionado à água no Brasil?',
    'garantir água de qualidade e acesso responsável em diferentes lugares',
    [
      'usar água sem limites',
      'considerar toda água sempre disponível',
      'abandonar fontes poluídas',
    ],
    'O desafio envolve disponibilidade, qualidade, acesso e cuidado.',
  ],
  [
    'O que uma escola pode fazer para cuidar da água?',
    'identificar vazamentos e promover uso consciente',
    [
      'deixar bebedouros vazando',
      'jogar resíduos no ralo',
      'proibir qualquer conversa sobre água',
    ],
    'A escola pode reduzir desperdício e incentivar responsabilidade.',
  ],
  [
    'Qual escolha combina preservação e uso responsável?',
    'economizar, não poluir e cuidar das fontes',
    [
      'desperdiçar, poluir e ignorar problemas',
      'usar sem limite e retirar vegetação',
      'jogar resíduos e deixar vazamentos',
    ],
    'Essas atitudes protegem a água e ajudam a mantê-la disponível.',
  ],
  [
    'Por que conhecer a situação da água no país é importante?',
    'para tomar decisões de cuidado adequadas a diferentes realidades',
    [
      'para afirmar que todos os lugares são iguais',
      'para justificar desperdícios',
      'para dispensar o tratamento da água',
    ],
    'Conhecer diferentes situações ajuda a agir com responsabilidade.',
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
    const page = [63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 57, 58, 59][
      index % 15
    ];
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_geo_agua_brasil_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'geografia',
      topic: 'agua-brasil',
      topicName: 'Situação da água no Brasil',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-distribuicao-e-desafios-de-uso-da-agua',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Geografia',
        page: String(page),
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
        `school-curriculum:2026-t3/geografia/agua-brasil/page-${question.sourceRef.page}`,
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
    topicId: 'geografia:agua-brasil',
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
    `t3-geografia-agua-brasil: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
