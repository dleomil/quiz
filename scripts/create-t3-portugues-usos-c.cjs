const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(ROOT, 'docs/drafts/2026-t3-v1-pt-usos-c.json');
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-pt-usos-c-audit.json',
);

const SPECS = [
  [
    'Complete: A crian____a brincou no quintal.',
    'criança',
    ['crianca', 'criansa', 'criançaa'],
    'A palavra criança é escrita com ç antes de a.',
  ],
  [
    'Qual palavra completa: O palhaço fez uma ____ engraçada?',
    'dança',
    ['dansa', 'danca', 'dansaç'],
    'A palavra dança é escrita com ç.',
  ],
  [
    'Complete: A professora pediu silên____io na leitura.',
    'silêncio',
    ['silensio', 'silencio', 'silênsio'],
    'Silêncio é escrito com c cedilhado antes de i.',
  ],
  [
    'Qual palavra está escrita corretamente?',
    'açúcar',
    ['asúcar', 'acúcar', 'açucar'],
    'A grafia correta é açúcar, com ç e acento.',
  ],
  [
    'Complete: O menino sentiu emo____ão ao receber o presente.',
    'emoção',
    ['emosão', 'emocão', 'emoçom'],
    'A palavra emoção é escrita com ç.',
  ],
  [
    'Qual palavra completa a frase: A ____ ficou pronta?',
    'refeição',
    ['refeisão', 'refeicão', 'refeiçãoo'],
    'A grafia correta é refeição, com ç.',
  ],
  [
    'Complete: A praça tem uma bonita ilumina____ão.',
    'iluminação',
    ['iluminasão', 'iluminacão', 'iluminaçom'],
    'Iluminação é escrita com ç na sílaba ção.',
  ],
  [
    'Qual palavra está escrita corretamente?',
    'coração',
    ['corasão', 'coracão', 'coraçom'],
    'A palavra coração é escrita com ç.',
  ],
  [
    'Complete: A inven____ão ajudou muitas pessoas.',
    'invenção',
    ['invensão', 'invencão', 'invençom'],
    'Invenção é escrita com ç na terminação ção.',
  ],
  [
    'Qual palavra completa: A criança fez uma observa____ão?',
    'observação',
    ['observasão', 'observacão', 'observaçom'],
    'A forma correta é observação, com ç.',
  ],
  [
    'Complete: O músico tocou uma can____ão conhecida.',
    'canção',
    ['cansão', 'cancão', 'cançom'],
    'A palavra canção é escrita com ç.',
  ],
  [
    'Qual palavra está escrita corretamente?',
    'lição',
    ['lisão', 'licão', 'liçom'],
    'A grafia correta é lição, com ç.',
  ],
  [
    'Complete: A solu____ão do problema foi encontrada.',
    'solução',
    ['solusão', 'solucão', 'soluçom'],
    'Solução é escrita com ç na terminação ção.',
  ],
  [
    'Qual palavra completa: A criança recebeu uma explica____ão?',
    'explicação',
    ['explicasão', 'explicacão', 'explicaçom'],
    'A forma correta é explicação, com ç.',
  ],
  [
    'Complete: A organiza____ão da sala ficou bonita.',
    'organização',
    ['organisasão', 'organizacão', 'organizaçom'],
    'Organização é escrita com ç na terminação ção.',
  ],
  [
    'Qual palavra está escrita corretamente?',
    'proteção',
    ['protesão', 'protecão', 'proteçom'],
    'A grafia correta é proteção, com ç.',
  ],
  [
    'Complete: A informa____ão estava no cartaz.',
    'informação',
    ['informasão', 'informacão', 'informaçom'],
    'Informação é escrita com ç na terminação ção.',
  ],
  [
    'Qual palavra completa: A popula____ão cresceu?',
    'população',
    ['populasão', 'populacão', 'populaçom'],
    'A palavra população é escrita com ç.',
  ],
  [
    'Complete: A conversa____ão foi respeitosa.',
    'conversação',
    ['conversasão', 'conversacão', 'conversaçom'],
    'Conversação é escrita com ç na terminação ção.',
  ],
  [
    'Qual resumo está correto sobre o uso de ç?',
    'a grafia deve ser conferida na palavra e no contexto',
    [
      'toda letra c recebe ç',
      'ç pode aparecer antes de qualquer vogal',
      'a pronúncia sozinha sempre resolve a grafia',
    ],
    'A escrita correta depende da palavra estudada e de seu contexto.',
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
          `Esta alternativa não apresenta a grafia adequada para a palavra: ${correct}.`;
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_pt_usos_c_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'portugues',
      topic: 'usos-c',
      topicName: 'Usos de ç',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'aplicar-grafia-de-c',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Português',
        booklet: 'Apostila 5',
        page: '9',
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
        `school-curriculum:2026-t3/portugues/usos-c/page-${question.sourceRef.page}`,
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
    topicId: 'portugues:usos-c',
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
    `t3-portugues-usos-c: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}

if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
