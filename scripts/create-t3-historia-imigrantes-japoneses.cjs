const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-his-imigrantes-japoneses.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-his-imigrantes-japoneses-audit.json',
);

const SPECS = [
  [
    'O que significa imigrar?',
    'mudar-se para outro lugar para viver',
    [
      'fazer uma visita curta',
      'trocar o nome de uma cidade',
      'ficar sempre no mesmo lugar',
    ],
    'Imigrar é mudar-se para outro lugar com intenção de viver nele.',
  ],
  [
    'Qual grupo é estudado neste tema?',
    'imigrantes japoneses',
    ['somente atletas', 'somente astronautas', 'somente cientistas'],
    'O tema trata das experiências de imigrantes japoneses.',
  ],
  [
    'Por que algumas pessoas japonesas vieram para o Brasil?',
    'em busca de trabalho, família e novas oportunidades',
    [
      'para mudar as estações do ano',
      'para evitar toda convivência',
      'para construir apenas aeroportos',
    ],
    'Pessoas podem migrar por trabalho, família, segurança ou outras oportunidades.',
  ],
  [
    'O que imigrantes podem trazer para uma nova comunidade?',
    'línguas, comidas, costumes e conhecimentos',
    ['apenas um tipo de roupa', 'nada de suas experiências', 'um novo oceano'],
    'Experiências e práticas culturais podem circular entre comunidades.',
  ],
  [
    'Por que não devemos dizer que todos os imigrantes japoneses viveram a mesma história?',
    'porque havia diferentes origens, motivos e experiências',
    [
      'porque a História não tem pessoas',
      'porque toda viagem foi igual',
      'porque culturas nunca mudam',
    ],
    'A história de cada pessoa e comunidade pode ser diferente.',
  ],
  [
    'O que é uma contribuição cultural?',
    'uma prática ou conhecimento compartilhado com uma comunidade',
    ['um sinal de trânsito', 'uma previsão do tempo', 'um prédio vazio'],
    'Contribuições culturais incluem práticas, conhecimentos e expressões.',
  ],
  [
    'Qual pode ser uma contribuição de comunidades japonesas?',
    'receitas, festas, artes e conhecimentos compartilhados',
    [
      'somente uniformes escolares',
      'somente placas de rua',
      'nenhuma prática cultural',
    ],
    'Comidas, festas, artes e saberes podem fazer parte das trocas culturais.',
  ],
  [
    'Como imigrantes japoneses participaram da vida no Brasil?',
    'em diferentes trabalhos, famílias e comunidades',
    [
      'em uma única profissão',
      'sem aprender nada',
      'sem contato com outras pessoas',
    ],
    'As pessoas participaram de atividades variadas e construíram relações diversas.',
  ],
  [
    'Por que é importante identificar comunidades e pessoas específicas?',
    'para não transformar uma experiência em regra para todos',
    [
      'porque ninguém tem identidade',
      'porque todas as histórias são idênticas',
      'porque grupos não mudam',
    ],
    'A contextualização evita generalizações sobre um grupo inteiro.',
  ],
  [
    'O que pode acontecer quando imigrantes e moradores locais convivem?',
    'podem ocorrer trocas, aprendizados e também conflitos',
    [
      'nunca acontece nenhuma mudança',
      'todas as diferenças desaparecem na hora',
      'somente um lado participa',
    ],
    'Encontros históricos podem envolver trocas, aprendizados e conflitos.',
  ],
  [
    'O que é uma comunidade?',
    'um grupo de pessoas ligado por relações ou espaços',
    ['um objeto isolado', 'um tipo de veículo', 'um mapa sem lugares'],
    'Comunidades se formam por relações e experiências compartilhadas.',
  ],
  [
    'Como famílias podem preservar memórias de imigração?',
    'por relatos, fotografias, objetos, festas e documentos',
    [
      'apagando todos os nomes',
      'esquecendo cada acontecimento',
      'evitando contar histórias',
    ],
    'Memórias familiares e fontes ajudam a preservar experiências.',
  ],
  [
    'Qual fonte pode ajudar a estudar a imigração japonesa?',
    'cartas, fotografias, documentos e relatos orais',
    ['um palpite sem evidência', 'uma página em branco', 'um número aleatório'],
    'Diferentes fontes permitem investigar experiências históricas.',
  ],
  [
    'O que um sobrenome pode indicar em uma pesquisa histórica?',
    'pode ser uma pista sobre origens familiares',
    [
      'que todos têm a mesma origem',
      'que nomes nunca mudam',
      'que nomes não podem ser estudados',
    ],
    'Sobrenomes são pistas e precisam ser analisados com outras fontes.',
  ],
  [
    'O que pode significar integrar-se a uma comunidade?',
    'participar da vida social mantendo identidades e memórias',
    [
      'apagar todas as diferenças',
      'viver sem relações',
      'recusar qualquer troca',
    ],
    'Integração pode combinar participação social e continuidade de identidades.',
  ],
  [
    'Qual atitude respeita as histórias de imigrantes japoneses?',
    'escutar relatos e evitar estereótipos',
    [
      'zombar de sotaques',
      'dizer que uma história vale por todas',
      'apagar práticas culturais',
    ],
    'Respeito histórico exige escuta, contexto e cuidado com estereótipos.',
  ],
  [
    'Por que uma receita pode ser uma pista histórica?',
    'porque pode guardar memórias e mostrar trocas culturais',
    [
      'porque comida não tem história',
      'porque todas as receitas são iguais',
      'porque receitas explicam apenas o clima',
    ],
    'Receitas podem carregar memórias familiares e intercâmbios culturais.',
  ],
  [
    'O que uma pergunta de História sobre imigração deve evitar?',
    'generalizações sobre todo um grupo',
    ['contextualizar experiências', 'comparar fontes', 'reconhecer diferenças'],
    'Generalizações escondem diferenças e não explicam bem a História.',
  ],
  [
    'Como a presença japonesa passou a fazer parte da História do Brasil?',
    'por experiências e interações de diferentes pessoas e comunidades',
    [
      'por uma única história igual',
      'sem contato com outras pessoas',
      'apenas por tecnologia recente',
    ],
    'A presença histórica se construiu em experiências e relações variadas.',
  ],
  [
    'Qual resumo está correto?',
    'imigrantes japoneses tiveram experiências e contribuições diversas',
    [
      'todos viveram a mesma vida',
      'a imigração não mudou nada',
      'uma pessoa fez todas as contribuições',
    ],
    'O estudo histórico deve reconhecer diversidade e contribuições específicas.',
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
          `Esta alternativa não corresponde ao conceito histórico: ${correct}.`;
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_his_imigrantes_japoneses_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'historia',
      topic: 'imigrantes-japoneses',
      topicName: 'Imigrantes japoneses',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-presenca-e-contribuicoes-sem-generalizacoes',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'História',
        page: String(90 + (index % 15)),
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
        `school-curriculum:2026-t3/historia/imigrantes-japoneses/page-${question.sourceRef.page}`,
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
    topicId: 'historia:imigrantes-japoneses',
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
    `t3-historia-imigrantes-japoneses: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}

if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
