const fs = require('node:fs');
const path = require('node:path');
const { loadContentSources } = require('./validate-content.cjs');
const {
  contentSha256,
  getQuestions,
  validateAuditReport,
} = require('./validate-content-audit.cjs');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(
  ROOT,
  'docs',
  'audits',
  '2026-t2-v1-quality-audit.json',
);
const ACTOR_ID = 'codex-single-agent';
const PASS_ROLES = new Map([
  ['curriculum-factual', 'content_curator'],
  ['pedagogical-linguistic', 'pedagogical_quality'],
]);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

function buildBatchReviews(questions, pass, findingsByQuestion = {}) {
  const actorRole = PASS_ROLES.get(pass);
  if (!actorRole) throw new Error('pass invalido');
  const questionIds = new Set(questions.map((question) => question.id));
  Object.keys(findingsByQuestion).forEach((questionId) => {
    if (!questionIds.has(questionId)) {
      throw new Error(`achado fora do lote: ${questionId}`);
    }
    if (
      !Array.isArray(findingsByQuestion[questionId]) ||
      findingsByQuestion[questionId].length === 0
    ) {
      throw new Error(`achados devem ser lista nao vazia: ${questionId}`);
    }
  });
  return questions.map((question) => {
    const findings = findingsByQuestion[question.id] || [];
    const sourceRef = question.sourceRef || {};
    const curriculumRef = [
      'school-curriculum:2026-t2',
      question.subject,
      question.topic,
      sourceRef.page ? `page-${sourceRef.page}` : null,
    ]
      .filter(Boolean)
      .join('/');
    return {
      questionId: question.id,
      pass,
      actorId: ACTOR_ID,
      actorRole,
      evidenceRefs: [curriculumRef],
      decision: findings.length ? 'findings' : 'clear',
      findings,
    };
  });
}

function writeAtomically(filePath, value) {
  const directory = path.dirname(filePath);
  const directoryStat = fs.lstatSync(directory);
  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) {
    throw new Error('diretorio do relatorio invalido');
  }
  const targetStat = fs.lstatSync(filePath);
  if (targetStat.isSymbolicLink() || !targetStat.isFile()) {
    throw new Error('relatorio alvo invalido');
  }
  const tempPath = path.join(directory, `.audit-${process.pid}.tmp`);
  try {
    fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, {
      flag: 'wx',
      mode: 0o600,
    });
    fs.renameSync(tempPath, filePath);
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

function recordBatch(
  report,
  sources,
  subject,
  topic,
  pass,
  findingsByQuestion,
) {
  if (report.reportStatus !== 'draft') {
    throw new Error('somente relatorio draft pode receber lotes');
  }
  const currentQuestions = getQuestions(sources, '2026-t2-v1');
  if (report.sourceSha256 !== contentSha256(currentQuestions)) {
    throw new Error('sourceSha256 diverge do conteudo atual');
  }
  const questions = currentQuestions.filter(
    (question) => question.subject === subject && question.topic === topic,
  );
  if (questions.length !== 20) {
    throw new Error(
      `lote deve conter exatamente 20 questoes: ${questions.length}`,
    );
  }
  const existing = new Set(
    report.reviews.map((review) => `${review.questionId}:${review.pass}`),
  );
  const batch = buildBatchReviews(questions, pass, findingsByQuestion);
  batch.forEach((review) => {
    if (existing.has(`${review.questionId}:${review.pass}`)) {
      throw new Error(`passagem ja registrada: ${review.questionId}:${pass}`);
    }
  });
  const updatedReport = {
    ...report,
    reviews: [
      ...report.reviews.map((review) => {
        if (review.evidenceRefs) return review;
        const question = currentQuestions.find(
          (candidate) => candidate.id === review.questionId,
        );
        if (!question) return review;
        return {
          ...review,
          evidenceRefs: buildBatchReviews([question], review.pass)[0]
            .evidenceRefs,
        };
      }),
      ...batch,
    ].sort(
      (left, right) =>
        left.questionId.localeCompare(right.questionId) ||
        left.pass.localeCompare(right.pass),
    ),
  };
  const errors = validateAuditReport(updatedReport, sources, '2026-t2-v1');
  if (errors.length) throw new Error(errors.join('; '));
  return updatedReport;
}

function main() {
  const topic = argument('--topic');
  const pass = argument('--pass');
  const findingsPath = argument('--findings');
  const findingsJson = argument('--findings-json');
  if (!topic || !pass || !topic.includes(':')) {
    process.stderr.write(
      'use: node scripts/record-content-audit-batch.cjs --topic <subject:topic> --pass <pass> [--findings <json>]\n',
    );
    process.exitCode = 1;
    return;
  }
  const [subject, ...topicParts] = topic.split(':');
  let findingsByQuestion = {};
  try {
    if (findingsPath) {
      findingsByQuestion = JSON.parse(
        fs.readFileSync(path.resolve(findingsPath), 'utf8'),
      );
    }
    if (findingsJson) {
      findingsByQuestion = JSON.parse(findingsJson);
    }
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const sources = loadContentSources(ROOT);
    const updatedReport = recordBatch(
      report,
      sources,
      subject,
      topicParts.join(':'),
      pass,
      findingsByQuestion,
    );
    writeAtomically(REPORT_PATH, updatedReport);
    process.stdout.write(`audit-batch: ok (${topic}, ${pass}, 20 questoes)\n`);
  } catch (error) {
    process.stderr.write(`audit-batch: ${error.message}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { buildBatchReviews, recordBatch };
