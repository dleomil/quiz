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
const V1_ID = '2026-t2-v1';
const V2_ID = '2026-t2-v2';
const EXPECTED_FINDING_COUNT = 50;
const RESOLUTION_REF =
  'https://github.com/dleomil/quiz/blob/feature/t2-content-quality-audit/js/data/content-set-t2-v2.js';

function writeAtomically(filePath, value) {
  const directory = path.dirname(filePath);
  const directoryStat = fs.lstatSync(directory);
  const targetStat = fs.lstatSync(filePath);
  if (
    directoryStat.isSymbolicLink() ||
    !directoryStat.isDirectory() ||
    targetStat.isSymbolicLink() ||
    !targetStat.isFile()
  ) {
    throw new Error('caminho do relatorio invalido');
  }
  const tempPath = path.join(directory, `.audit-resolution-${process.pid}.tmp`);
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

function recordRemediation(report, sources) {
  if (report.reportStatus !== 'draft') {
    throw new Error('somente relatorio draft pode registrar remediacoes');
  }
  const v1Questions = getQuestions(sources, V1_ID);
  const v2Questions = getQuestions(sources, V2_ID);
  if (v1Questions.length !== 620 || v2Questions.length !== 620) {
    throw new Error('V1 e V2 devem conter exatamente 620 questoes');
  }
  if (report.sourceSha256 !== contentSha256(v1Questions)) {
    throw new Error('sourceSha256 diverge do conteudo atual');
  }
  const v2Ids = new Set(v2Questions.map((question) => question.id));
  const findings = report.reviews.flatMap((review) =>
    review.findings.map((finding) => ({ review, finding })),
  );
  if (findings.length !== EXPECTED_FINDING_COUNT) {
    throw new Error(
      `esperados ${EXPECTED_FINDING_COUNT} achados; encontrados ${findings.length}`,
    );
  }
  const findingIds = new Set();
  findings.forEach(({ review, finding }) => {
    const expectedId = `2026t2v2_${review.questionId}`;
    if (
      !finding.findingId ||
      findingIds.has(finding.findingId) ||
      !v2Ids.has(expectedId)
    ) {
      throw new Error(
        `achado sem remediacao verificavel: ${finding.findingId}`,
      );
    }
    findingIds.add(finding.findingId);
  });

  const updated = {
    ...report,
    remediationContentSetId: V2_ID,
    remediationSha256: contentSha256(v2Questions),
    reviews: report.reviews.map((review) => ({
      ...review,
      findings: review.findings.map((finding) => ({
        ...finding,
        resolution: 'corrected',
        resolutionQuestionId: `2026t2v2_${review.questionId}`,
        resolutionRef: RESOLUTION_REF,
      })),
    })),
  };
  const errors = validateAuditReport(updated, sources, V1_ID);
  if (errors.length) throw new Error(errors.join('; '));
  return updated;
}

function main() {
  try {
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const sources = loadContentSources(ROOT);
    writeAtomically(REPORT_PATH, recordRemediation(report, sources));
    process.stdout.write(
      'audit-remediation: ok (50 achados, V2 SHA verificado)\n',
    );
  } catch (error) {
    process.stderr.write(`audit-remediation: ${error.message}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { recordRemediation };
