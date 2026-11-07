const fs = require('node:fs');
const path = require('node:path');
const {
  TOPICS,
  buildQuestions,
  sha256,
} = require('./create-t3-matematica-drafts.cjs');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIRECTORY = path.join(ROOT, 'docs', 'audits');
const PASSES = ['pedagogical', 'linguistic'];
const DECISIONS = ['approved', 'adjustments_required', 'blocked'];
const SEVERITIES = ['minor', 'major', 'blocking'];

function reportPath(topic, questions) {
  return path.join(
    REPORT_DIRECTORY,
    `2026-t3-v1-mat-${topic.id}-${sha256(questions)}-editorial-review.json`,
  );
}

function validateTopicReport(report, topic, questions) {
  const errors = [];
  const expectedQuestionIds = new Set(questions.map((question) => question.id));
  const expectedPairs = new Set(
    questions.flatMap((question) =>
      PASSES.map((pass) => `${question.id}:${pass}`),
    ),
  );
  const seenPairs = new Set();

  if (report.schemaVersion !== 'editorial-review-v1')
    errors.push('schemaVersion');
  if (report.reviewMode !== 'in-conversation-direct') errors.push('reviewMode');
  if (report.reviewer !== 'Codex (conversa atual)') errors.push('reviewer');
  if (report.contentSetId !== '2026-t3-v1') errors.push('contentSetId');
  if (report.subjectId !== 'matematica') errors.push('subjectId');
  if (report.topicId !== topic.id) errors.push('topicId');
  if (report.sourceSha256 !== sha256(questions)) errors.push('sourceSha256');
  if (report.humanApprovalRequired !== true)
    errors.push('humanApprovalRequired');
  if (JSON.stringify(report.requestedPasses) !== JSON.stringify(PASSES)) {
    errors.push('requestedPasses');
  }
  if (report.expectedEvaluations !== questions.length * PASSES.length) {
    errors.push('expectedEvaluations');
  }
  if (!Array.isArray(report.reviews)) {
    errors.push('reviews');
    return errors;
  }

  for (const review of report.reviews) {
    const pair = `${review.questionId}:${review.pass}`;
    if (!expectedQuestionIds.has(review.questionId))
      errors.push(`questionId:${pair}`);
    if (!PASSES.includes(review.pass)) errors.push(`pass:${pair}`);
    if (seenPairs.has(pair)) errors.push(`duplicate:${pair}`);
    seenPairs.add(pair);
    if (!DECISIONS.includes(review.decision)) errors.push(`decision:${pair}`);
    for (const field of ['facts', 'doubts', 'findings', 'recommendations']) {
      if (!Array.isArray(review[field])) errors.push(`${field}:${pair}`);
    }
    if (review.humanApprovalRequired !== true)
      errors.push(`humanApprovalRequired:${pair}`);
    for (const finding of review.findings || []) {
      if (finding.questionId !== review.questionId)
        errors.push(`findingQuestionId:${pair}`);
      if (finding.pass !== review.pass) errors.push(`findingPass:${pair}`);
      if (!SEVERITIES.includes(finding.severity))
        errors.push(`severity:${pair}`);
      if (!finding.criterion || !finding.evidence || !finding.recommendation) {
        errors.push(`findingEvidence:${pair}`);
      }
    }
    const hasOpenIssues =
      (review.doubts || []).length > 0 || (review.findings || []).length > 0;
    if (review.decision === 'approved' && hasOpenIssues)
      errors.push(`approvedWithIssues:${pair}`);
    if (review.decision === 'adjustments_required' && !hasOpenIssues) {
      errors.push(`adjustmentsWithoutEvidence:${pair}`);
    }
    if (
      review.decision === 'blocked' &&
      !(review.doubts || []).length &&
      !(review.findings || []).some(
        (finding) => finding.severity === 'blocking',
      )
    ) {
      errors.push(`blockedWithoutEvidence:${pair}`);
    }
  }

  for (const pair of expectedPairs) {
    if (!seenPairs.has(pair)) errors.push(`missing:${pair}`);
  }
  if (report.completedEvaluations !== seenPairs.size)
    errors.push('completedEvaluations');
  const clear =
    seenPairs.size === expectedPairs.size &&
    report.reviews.every((review) => review.decision === 'approved');
  if (report.reportStatus !== (clear ? 'clear' : 'blocked'))
    errors.push('reportStatus');
  return errors;
}

function validateCurrentReports() {
  const errors = [];
  for (const topic of TOPICS) {
    const questions = buildQuestions(topic);
    const file = reportPath(topic, questions);
    if (!fs.existsSync(file)) {
      errors.push(`${topic.id}: relatorio editorial ausente`);
      continue;
    }
    let report;
    try {
      report = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      errors.push(`${topic.id}: relatorio editorial invalido`);
      continue;
    }
    validateTopicReport(report, topic, questions).forEach((error) => {
      errors.push(`${topic.id}: ${error}`);
    });
  }
  return errors;
}

module.exports = {
  PASSES,
  reportPath,
  validateCurrentReports,
  validateTopicReport,
};
