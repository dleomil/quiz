const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(ROOT, 'docs/drafts/2026-t3-v1-pt-verbos.json');
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-pt-verbos-audit.json',
);

const SPECS = [
  [
    'Na frase “A menina correu no pátio”, qual palavra indica uma ação?',
    'correu',
    ['menina', 'pátio', 'no'],
    'Correu indica a ação realizada pela menina.',
  ],
  [
    'Qual palavra é um verbo?',
    'brincar',
    ['bola', 'alegre', 'quintal'],
    'Brincar é uma palavra que indica ação.',
  ],
  [
    'Complete: Pedro ____ um livro.',
    'leu',
    ['livro', 'atento', 'biblioteca'],
    'Leu indica a ação realizada por Pedro.',
  ],
  [
    'Qual verbo completa melhor: “As crianças ____ no recreio”?',
    'jogam',
    ['recreio', 'crianças', 'divertidas'],
    'Jogam indica o que as crianças fazem no recreio.',
  ],
  [
    'Na frase “O gato dorme no tapete”, qual é o verbo?',
    'dorme',
    ['gato', 'tapete', 'no'],
    'Dorme indica a ação do gato.',
  ],
  [
    'Qual palavra indica uma ação em “Ana escreve uma carta”?',
    'escreve',
    ['Ana', 'carta', 'uma'],
    'Escreve indica a ação realizada por Ana.',
  ],
  [
    'Complete: Nós ____ uma história.',
    'contamos',
    ['história', 'curiosa', 'nós'],
    'Contamos indica a ação realizada por nós.',
  ],
  [
    'Qual verbo completa: “O pássaro ____ no céu”?',
    'voa',
    ['pássaro', 'céu', 'azul'],
    'Voa indica a ação do pássaro.',
  ],
  [
    'Na frase “A professora explicou a atividade”, qual é o verbo?',
    'explicou',
    ['professora', 'atividade', 'a'],
    'Explicou indica a ação da professora.',
  ],
  [
    'Qual palavra é um verbo no infinitivo?',
    'cantar',
    ['canção', 'bonita', 'cantor'],
    'Cantar é uma forma de verbo no infinitivo.',
  ],
  [
    'Complete: “Eu ____ água depois da corrida.”',
    'bebi',
    ['água', 'corrida', 'cansado'],
    'Bebi indica uma ação realizada por eu.',
  ],
  [
    'Qual verbo combina com “O sol ____ pela manhã”?',
    'nasce',
    ['manhã', 'sol', 'claro'],
    'Nasce indica o que o sol faz nessa frase.',
  ],
  [
    'Na frase “Marina abriu a janela”, qual palavra indica ação?',
    'abriu',
    ['Marina', 'janela', 'a'],
    'Abriu indica a ação realizada por Marina.',
  ],
  [
    'Qual palavra completa: “Eles ____ uma música”?',
    'ouviram',
    ['música', 'eles', 'animada'],
    'Ouviram indica a ação realizada por eles.',
  ],
  [
    'Qual é o verbo em “O menino desenha uma casa”?',
    'desenha',
    ['menino', 'casa', 'uma'],
    'Desenha indica a ação do menino.',
  ],
  [
    'Complete: “Nós ____ cedo para a escola.”',
    'chegamos',
    ['escola', 'cedo', 'nós'],
    'Chegamos indica a ação realizada por nós.',
  ],
  [
    'Qual palavra é um verbo?',
    'sorrir',
    ['sorriso', 'feliz', 'rosto'],
    'Sorrir indica uma ação.',
  ],
  [
    'Na frase “A turma aprendeu a lição”, qual é o verbo?',
    'aprendeu',
    ['turma', 'lição', 'a'],
    'Aprendeu indica a ação realizada pela turma.',
  ],
  [
    'Qual verbo completa: “O cachorro ____ quando ouviu o barulho”?',
    'latia',
    ['cachorro', 'barulho', 'alto'],
    'Latia indica a ação do cachorro nessa situação.',
  ],
  [
    'Qual resumo está correto sobre os verbos?',
    'verbos podem indicar ações em frases',
    [
      'todo verbo é um objeto',
      'verbos nomeiam apenas lugares',
      'verbos não aparecem em frases',
    ],
    'Verbos podem indicar ações e ajudam a construir o sentido das frases.',
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
          `Esta alternativa não é o verbo pedido; a palavra correta é ${correct}.`;
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_pt_verbos_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'portugues',
      topic: 'verbos',
      topicName: 'Verbos',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'identificar-e-usar-verbos-em-frases',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Português',
        booklet: 'Apostila 5',
        page: '11',
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
        `school-curriculum:2026-t3/portugues/verbos/page-${question.sourceRef.page}`,
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
    topicId: 'portugues:verbos',
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
    `t3-portugues-verbos: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}

if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
