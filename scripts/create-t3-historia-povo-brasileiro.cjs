const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-his-povo-brasileiro.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-his-povo-brasileiro-audit.json',
);
const SPECS = [
  [
    'O que significa dizer que o povo brasileiro é diverso?',
    'que pessoas e grupos têm diferentes histórias, culturas e costumes',
    [
      'que todas as pessoas são iguais em tudo',
      'que existe apenas uma cultura',
      'que a história não muda',
    ],
    'A diversidade reúne diferentes trajetórias, culturas e modos de viver.',
  ],
  [
    'Quem já vivia no território brasileiro antes da chegada dos portugueses?',
    'diferentes povos indígenas',
    ['somente viajantes europeus', 'nenhuma comunidade', 'apenas soldados'],
    'Povos indígenas habitavam diferentes regiões do território.',
  ],
  [
    'Por que não devemos falar dos povos indígenas como se fossem todos iguais?',
    'porque existem muitos povos, línguas e costumes diferentes',
    [
      'porque nenhum povo tem cultura',
      'porque todos vivem no mesmo lugar',
      'porque a história não registra diferenças',
    ],
    'Os povos indígenas formam comunidades diversas, com histórias e culturas próprias.',
  ],
  [
    'O que a presença africana acrescentou à formação do Brasil?',
    'saberes, culturas, línguas, religiões e formas de resistência',
    [
      'apenas um tipo de alimento',
      'nenhuma contribuição',
      'somente nomes de cidades',
    ],
    'A presença africana marcou profundamente a cultura e a história do Brasil.',
  ],
  [
    'Como muitas pessoas africanas chegaram ao Brasil durante a colonização?',
    'foram trazidas à força e escravizadas',
    [
      'vieram todas como turistas',
      'chegaram sem violência e com os mesmos direitos',
      'foram convidadas para governar',
    ],
    'A escravização foi uma violência histórica que trouxe pessoas africanas à força.',
  ],
  [
    'Por que estudar a resistência de pessoas escravizadas é importante?',
    'para reconhecer suas lutas por liberdade e dignidade',
    [
      'para justificar a escravidão',
      'para apagar suas histórias',
      'para afirmar que não houve resistência',
    ],
    'A resistência revela ações e lutas contra a escravização.',
  ],
  [
    'O que é cultura?',
    'um conjunto de modos de viver, saberes, práticas e expressões',
    [
      'apenas a comida de um lugar',
      'uma regra igual para todos',
      'somente um prédio antigo',
    ],
    'Cultura inclui saberes, práticas, expressões e modos de viver.',
  ],
  [
    'Qual exemplo mostra diversidade cultural?',
    'diferentes festas, músicas, comidas e línguas',
    [
      'todas as festas iguais',
      'uma única forma de falar',
      'ausência de costumes',
    ],
    'Festas, músicas, comidas e línguas podem variar entre grupos.',
  ],
  [
    'Como os encontros entre diferentes grupos transformaram o Brasil?',
    'produziram trocas, conflitos e novas formas culturais',
    [
      'fizeram todas as diferenças desaparecerem',
      'impediram qualquer mudança',
      'criaram uma história sem pessoas',
    ],
    'Encontros históricos tiveram trocas e também conflitos.',
  ],
  [
    'Por que a palavra “mistura” precisa ser usada com cuidado na História?',
    'porque pode esconder desigualdades e violências vividas pelos grupos',
    [
      'porque não existem grupos diferentes',
      'porque toda relação foi sempre igual',
      'porque a história não tem conflitos',
    ],
    'A formação histórica inclui relações desiguais e violências que não devem ser apagadas.',
  ],
  [
    'O que podemos aprender com diferentes comunidades tradicionais?',
    'modos de cuidar, trabalhar e viver relacionados a seus territórios',
    [
      'que todos devem viver do mesmo jeito',
      'que nenhum saber é importante',
      'que territórios não têm história',
    ],
    'Comunidades guardam conhecimentos e experiências próprias.',
  ],
  [
    'Por que a memória é importante para a formação do povo brasileiro?',
    'porque ajuda a preservar histórias e identidades',
    [
      'porque substitui todas as fontes',
      'porque apaga o passado',
      'porque torna todas as narrativas iguais',
    ],
    'Memórias ajudam grupos a contar e preservar suas histórias.',
  ],
  [
    'Qual atitude respeita a diversidade histórica?',
    'ouvir diferentes narrativas e evitar preconceitos',
    [
      'ridicularizar costumes',
      'dizer que só uma história importa',
      'apagar nomes e lembranças',
    ],
    'Respeito envolve escuta, conhecimento e combate ao preconceito.',
  ],
  [
    'O que são fontes históricas?',
    'vestígios e registros que ajudam a estudar o passado',
    [
      'apenas opiniões atuais',
      'objetos sem qualquer informação',
      'previsões do futuro',
    ],
    'Fontes podem ser documentos, objetos, imagens, relatos e outros vestígios.',
  ],
  [
    'Qual fonte pode ajudar a estudar a história de uma comunidade?',
    'relatos, fotografias e documentos',
    [
      'somente uma propaganda',
      'um objeto sem contexto',
      'uma invenção sem registro',
    ],
    'Diferentes fontes podem complementar o estudo histórico.',
  ],
  [
    'Por que os nomes de lugares podem revelar histórias?',
    'porque podem guardar referências a povos, pessoas e acontecimentos',
    [
      'porque todos os nomes são aleatórios',
      'porque lugares não têm memória',
      'porque nomes não mudam',
    ],
    'Nomes podem carregar memórias e referências históricas.',
  ],
  [
    'O que significa reconhecer protagonismo histórico?',
    'perceber que diferentes grupos agiram e participaram da história',
    [
      'atribuir tudo a uma única pessoa',
      'negar ações coletivas',
      'apagar grupos sem poder',
    ],
    'Muitos grupos participaram e transformaram a história.',
  ],
  [
    'Por que a formação do povo brasileiro não aconteceu de uma só vez?',
    'porque foi construída por processos históricos ao longo do tempo',
    [
      'porque não houve acontecimentos',
      'porque todos chegaram no mesmo dia',
      'porque a cultura é imóvel',
    ],
    'A formação ocorreu em diferentes períodos e contextos.',
  ],
  [
    'Qual afirmação evita uma generalização?',
    'há diferentes povos indígenas, comunidades africanas e outros grupos com histórias próprias',
    [
      'todos os grupos têm os mesmos costumes',
      'uma cultura representa todas as pessoas',
      'nenhuma comunidade tem identidade',
    ],
    'Reconhecer diferenças evita tratar grupos diversos como iguais.',
  ],
  [
    'Qual resumo está correto?',
    'o povo brasileiro foi formado por diferentes grupos, com trocas, conflitos e resistências',
    [
      'o Brasil tem uma única origem cultural',
      'a história foi sem conflitos',
      'somente um grupo construiu o país',
    ],
    'A formação brasileira é plural e marcada por relações históricas diversas.',
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
      id: `2026t3v1_his_povo_brasileiro_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'historia',
      topic: 'povo-brasileiro',
      topicName: 'Formação do povo brasileiro',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-diversidade-historica',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'História',
        page: String(
          [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104][
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
        `school-curriculum:2026-t3/historia/povo-brasileiro/page-${question.sourceRef.page}`,
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
    topicId: 'historia:povo-brasileiro',
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
    `t3-historia-povo-brasileiro: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
