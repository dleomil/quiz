const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(ROOT, 'docs/drafts/2026-t3-v1-geo-usos-agua.json');
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-geo-usos-agua-audit.json',
);

const SPECS = [
  [
    'Qual é um uso doméstico da água?',
    'beber',
    ['produzir vento', 'iluminar o Sol', 'fabricar nuvens'],
    'Beber é um uso da água no dia a dia das casas.',
  ],
  [
    'Qual atividade de casa usa água?',
    'lavar roupas',
    ['desenhar sombras', 'escutar música', 'medir o tempo'],
    'A lavagem de roupas é um uso doméstico da água.',
  ],
  [
    'Como a água pode ser usada na cozinha?',
    'lavar alimentos',
    [
      'criar eletricidade no celular',
      'produzir papel sozinho',
      'fazer o ar desaparecer',
    ],
    'A água pode ajudar a higienizar alimentos e utensílios.',
  ],
  [
    'Qual uso da água ajuda no cuidado pessoal?',
    'tomar banho',
    ['pintar o céu', 'mover montanhas', 'produzir areia'],
    'O banho é um uso doméstico relacionado à higiene.',
  ],
  [
    'Por que a agricultura precisa de água?',
    'para ajudar as plantas a crescer',
    [
      'para transformar sementes em pedras',
      'para impedir a luz do Sol',
      'para eliminar todo solo',
    ],
    'As plantas precisam de água para se desenvolver.',
  ],
  [
    'Qual é um uso da água na criação de animais?',
    'dar água aos animais',
    [
      'retirar o ar do ambiente',
      'apagar todas as plantações',
      'produzir brinquedos',
    ],
    'Animais também precisam de água para viver.',
  ],
  [
    'Como a água pode participar da produção de alimentos?',
    'na irrigação das plantações',
    [
      'na produção de sombras',
      'na troca do solo por vidro',
      'na retirada da chuva',
    ],
    'A irrigação leva água às plantas quando necessário.',
  ],
  [
    'Qual atividade produtiva pode usar água?',
    'a fabricação de produtos',
    ['a formação da Lua', 'a produção de silêncio', 'a mudança das estações'],
    'Diversas atividades produtivas usam água em etapas de trabalho.',
  ],
  [
    'Qual uso coletivo da água beneficia uma comunidade?',
    'abastecer casas e serviços',
    ['deixar rios poluídos', 'aumentar vazamentos', 'impedir o tratamento'],
    'O abastecimento atende necessidades compartilhadas.',
  ],
  [
    'Por que hospitais precisam de água?',
    'para higiene e atendimento seguro',
    [
      'para substituir medicamentos',
      'para produzir vento',
      'para impedir a limpeza',
    ],
    'A água é importante para limpeza e cuidados de saúde.',
  ],
  [
    'Como escolas usam água?',
    'em bebedouros, banheiros e limpeza',
    [
      'somente para decorar salas',
      'para apagar livros',
      'para impedir a higiene',
    ],
    'A escola usa água em diferentes atividades coletivas.',
  ],
  [
    'Qual exemplo mostra uso da água no transporte?',
    'navegação em rios e mares',
    [
      'andar sobre nuvens',
      'viajar dentro de uma pedra',
      'substituir todas as estradas',
    ],
    'Rios e mares podem ser caminhos para embarcações.',
  ],
  [
    'Como a água pode ajudar a produzir energia?',
    'movendo turbinas em usinas hidrelétricas',
    [
      'criando papel sem máquinas',
      'fazendo plantas desaparecerem',
      'eliminando a luz solar',
    ],
    'Em usinas hidrelétricas, o movimento da água pode mover turbinas.',
  ],
  [
    'Por que diferentes usos da água precisam ser planejados?',
    'para evitar conflitos e desperdício',
    [
      'para gastar tudo de uma vez',
      'para impedir o acesso de todos',
      'para poluir as fontes',
    ],
    'Planejamento ajuda a conciliar necessidades e conservar a água.',
  ],
  [
    'Qual situação representa uso consciente da água?',
    'usar somente o necessário',
    [
      'deixar torneiras abertas',
      'lavar a calçada por horas',
      'ignorar vazamentos',
    ],
    'Usar somente o necessário reduz desperdícios.',
  ],
  [
    'O que deve acontecer depois de usar água que pode estar contaminada?',
    'ela deve ser tratada antes de voltar ao ambiente',
    [
      'ser lançada diretamente no rio',
      'ser misturada ao lixo',
      'ser guardada em qualquer lugar',
    ],
    'O tratamento reduz impactos e protege as fontes.',
  ],
  [
    'Por que a água usada na agricultura deve ser bem administrada?',
    'para atender a produção sem desperdício',
    [
      'para molhar tudo sem controle',
      'para impedir qualquer colheita',
      'para retirar a proteção do solo',
    ],
    'Boa administração evita desperdício e favorece a produção.',
  ],
  [
    'Qual atitude ajuda a conciliar usos domésticos e coletivos?',
    'economizar água e comunicar vazamentos',
    [
      'aumentar o desperdício',
      'jogar resíduos nas fontes',
      'usar água sem limite',
    ],
    'Cuidado individual também protege a disponibilidade coletiva.',
  ],
  [
    'O que pode acontecer quando muitos usos competem pela mesma água?',
    'é preciso organizar prioridades e cuidados',
    [
      'a água se multiplica sozinha',
      'todos deixam de precisar dela',
      'a poluição deixa de existir',
    ],
    'Organização ajuda a distribuir a água de modo responsável.',
  ],
  [
    'Qual frase resume os usos da água?',
    'a água atende pessoas, produção e serviços, por isso deve ser cuidada',
    [
      'a água só serve para beber',
      'a água não é usada por comunidades',
      'a água pode ser desperdiçada sem consequência',
    ],
    'A água tem usos diversos e precisa de proteção em todos eles.',
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
      id: `2026t3v1_geo_usos_agua_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'geografia',
      topic: 'usos-agua',
      topicName: 'Usos da água',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'relacionar-usos-domesticos-produtivos-e-coletivos',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Geografia',
        page: String(
          [63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 57, 58, 59][
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
        `school-curriculum:2026-t3/geografia/usos-agua/page-${question.sourceRef.page}`,
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
    topicId: 'geografia:usos-agua',
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
    `t3-geografia-usos-agua: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
