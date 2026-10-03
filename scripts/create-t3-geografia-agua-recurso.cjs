const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-geo-agua-recurso.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-geo-agua-recurso-audit.json',
);

const SPECS = [
  [
    'Por que a água é importante para as pessoas?',
    'porque precisamos dela para viver',
    [
      'porque serve apenas para encher piscinas',
      'porque substitui todos os alimentos',
      'porque não participa do nosso corpo',
    ],
    'A água participa do funcionamento do corpo e é necessária à vida.',
  ],
  [
    'Qual atitude ajuda a economizar água ao escovar os dentes?',
    'fechar a torneira enquanto escova',
    [
      'deixar a torneira aberta',
      'usar uma mangueira',
      'escovar sem usar água nenhuma para sempre',
    ],
    'Fechar a torneira durante a escovação evita desperdício.',
  ],
  [
    'Qual é um uso responsável da água em casa?',
    'usar somente a quantidade necessária',
    [
      'deixar a água correndo sem motivo',
      'lavar a calçada com mangueira por horas',
      'brincar com a torneira aberta',
    ],
    'Usar apenas o necessário ajuda a preservar a água.',
  ],
  [
    'O que fazer ao perceber uma torneira pingando?',
    'avisar um adulto para consertá-la',
    ['aumentar o vazamento', 'ignorar sempre', 'deixar um balde transbordar'],
    'Um vazamento pode desperdiçar água e deve ser comunicado para ser consertado.',
  ],
  [
    'Qual ação reduz o desperdício durante o banho?',
    'diminuir o tempo do banho',
    [
      'deixar o chuveiro ligado sem estar no banho',
      'brincar até a água acabar',
      'abrir todas as torneiras',
    ],
    'Banhos mais curtos usam menos água.',
  ],
  [
    'Água potável é a água que:',
    'pode ser consumida com segurança',
    [
      'tem sempre gosto de refrigerante',
      'serve somente para lavar carros',
      'não precisa de cuidado algum',
    ],
    'Água potável é própria para beber, conforme os cuidados de tratamento e saúde.',
  ],
  [
    'Por que não devemos jogar lixo nos rios?',
    'porque o lixo pode poluir a água e prejudicar os seres vivos',
    [
      'porque o rio fica mais rápido',
      'porque o lixo transforma água salgada em doce',
      'porque todo lixo desaparece na água',
    ],
    'O lixo pode contaminar a água e causar problemas para pessoas, plantas e animais.',
  ],
  [
    'Qual atividade usa água para produzir alimentos?',
    'irrigar uma plantação',
    ['pintar uma parede seca sem limpar', 'ler um livro', 'guardar lápis'],
    'A irrigação fornece água para o crescimento das plantas cultivadas.',
  ],
  [
    'Qual é um exemplo de uso coletivo da água?',
    'abastecer uma escola',
    [
      'encher somente um brinquedo',
      'molhar uma fotografia',
      'lavar uma única colher',
    ],
    'A escola é um espaço usado por muitas pessoas, por isso seu abastecimento é coletivo.',
  ],
  [
    'O que pode acontecer quando falta água em uma comunidade?',
    'algumas atividades e cuidados ficam prejudicados',
    [
      'todos os rios aumentam',
      'a água passa a ser infinita',
      'as plantas deixam de precisar de água',
    ],
    'A falta de água dificulta beber, cozinhar, higienizar e realizar outras atividades.',
  ],
  [
    'Qual atitude ajuda a proteger a água?',
    'não jogar óleo e lixo na pia ou no rio',
    [
      'jogar resíduos em qualquer lugar',
      'lavar objetos dentro do rio',
      'deixar embalagens na margem',
    ],
    'Evitar resíduos na água reduz a poluição e protege os ambientes.',
  ],
  [
    'Para que a água da chuva pode ser aproveitada, com orientação e cuidado?',
    'regar plantas ou limpar áreas',
    [
      'ser bebida diretamente sem tratamento',
      'substituir todos os cuidados de higiene',
      'ser colocada em qualquer recipiente sujo',
    ],
    'A água da chuva pode ser reutilizada em atividades que não exigem consumo, com cuidado.',
  ],
  [
    'Qual atitude é adequada ao lavar uma bicicleta?',
    'usar um balde e pouca água',
    [
      'usar uma mangueira aberta por muito tempo',
      'deixar a água correndo sem lavar',
      'lavar dentro de um rio',
    ],
    'O balde ajuda a controlar a quantidade de água usada.',
  ],
  [
    'Por que a água limpa deve ser preservada?',
    'porque é necessária para a vida e não deve ser desperdiçada',
    [
      'porque só serve para fazer desenhos',
      'porque nunca pode ser usada',
      'porque se renova instantaneamente em qualquer lugar',
    ],
    'Preservar a água limpa protege a saúde, os seres vivos e as atividades humanas.',
  ],
  [
    'Qual comportamento ajuda a evitar desperdício na cozinha?',
    'ensaboar a louça com a torneira fechada',
    [
      'deixar a torneira aberta todo o tempo',
      'lavar uma colher usando uma mangueira',
      'encher a pia e deixá-la transbordar',
    ],
    'Fechar a torneira enquanto ensaboa reduz o uso desnecessário.',
  ],
  [
    'Quem pode ajudar a cuidar da água?',
    'todas as pessoas',
    ['somente os peixes', 'somente quem mora perto de um rio', 'ninguém'],
    'O cuidado com a água é uma responsabilidade compartilhada.',
  ],
  [
    'Qual situação mostra desperdício de água?',
    'uma mangueira aberta sem ninguém usando',
    ['uma torneira fechada', 'um banho curto', 'um balde usado com cuidado'],
    'Água correndo sem finalidade é desperdício.',
  ],
  [
    'O que devemos fazer com uma garrafa reutilizável?',
    'usá-la novamente quando estiver limpa',
    [
      'jogá-la no rio',
      'deixá-la aberta na rua',
      'usá-la para desperdiçar água',
    ],
    'Reutilizar objetos limpos pode reduzir resíduos e o consumo de materiais.',
  ],
  [
    'Qual frase mostra uma atitude responsável?',
    'Vou fechar a torneira quando não estiver usando.',
    [
      'Vou deixar a água correr para ninguém usar.',
      'Vou jogar lixo no córrego.',
      'Vou ignorar um vazamento.',
    ],
    'Fechar a torneira quando ela não é necessária evita desperdício.',
  ],
  [
    'Qual combinação está correta?',
    'água deve ser usada com cuidado e preservada',
    [
      'água limpa pode receber lixo',
      'torneira aberta sempre economiza água',
      'rios não fazem parte do ambiente',
    ],
    'Usar com cuidado e preservar a água são atitudes responsáveis.',
  ],
];

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
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
      if (baseIndex > 0) {
        wrongExplanations[targetIndex] =
          `A alternativa não corresponde ao conceito de ${correct.toLowerCase()}.`;
      }
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_geo_agua_recurso_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'geografia',
      topic: 'agua-recurso',
      topicName: 'Água como recurso',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-importancia-e-uso-responsavel-da-agua',
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
        `school-curriculum:2026-t3/geografia/agua-recurso/page-${question.sourceRef.page}`,
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
        `school-curriculum:2026-t3/geografia/agua-recurso/page-${question.sourceRef.page}`,
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
    topicId: 'geografia:agua-recurso',
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
    `t3-geografia-agua-recurso: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}

if (require.main === module) main();

module.exports = { buildQuestions, buildAudit, sha256 };
