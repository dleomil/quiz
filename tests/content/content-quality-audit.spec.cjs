const assert = require('node:assert/strict');
const {
  contentSha256,
  validateAuditReport,
} = require('../../scripts/validate-content-audit.cjs');
const {
  buildApprovedReport,
} = require('../../scripts/approve-content-audit.cjs');

const question = {
  id: 'MAT-AUDIT-001',
  contentSetId: 'test-t2-v1',
  subject: 'matematica',
  topic: 'medidas',
  question: 'Qual unidade mede o comprimento?',
  options: ['Metro', 'Litro', 'Hora', 'Quilo'],
  correctIndex: 0,
};
const remediationQuestion = {
  ...question,
  id: `2026t2v2_${question.id}`,
  contentSetId: '2026-t2-v2',
};
const sources = {
  matematica: { questions: [question, remediationQuestion] },
};

function review(pass, actorId, actorRole, findings = []) {
  return {
    questionId: question.id,
    pass,
    actorId,
    actorRole,
    evidenceRefs: ['school-curriculum:test/subject/topic'],
    decision: findings.length ? 'findings' : 'clear',
    findings,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validReport() {
  return {
    schemaVersion: 'content-quality-audit-v1',
    reviewMode: 'single-agent-sequential',
    reportStatus: 'final',
    contentSetId: 'test-t2-v1',
    sourceSha256: contentSha256([question]),
    remediationContentSetId: '2026-t2-v2',
    remediationSha256: contentSha256([remediationQuestion]),
    reviews: [
      review('curriculum-factual', 'codex-single-agent', 'content_curator'),
      review(
        'pedagogical-linguistic',
        'codex-single-agent',
        'pedagogical_quality',
      ),
    ],
    humanApproval: {
      actorId: 'product-owner',
      decision: 'approved',
      approvedAt: '2026-09-14',
      evidenceRef: 'https://github.com/dleomil/quiz/issues/322',
    },
  };
}

const valid = validReport();
assert.deepEqual(validateAuditReport(valid, sources, 'test-t2-v1'), []);

const preparedDraft = validReport();
preparedDraft.reportStatus = 'draft';
const approvedDraft = buildApprovedReport(preparedDraft, sources, {
  actorId: 'product-owner',
  approvedAt: '2026-09-14',
  evidenceRef: 'https://github.com/dleomil/quiz/issues/322',
});
assert.equal(approvedDraft.reportStatus, 'final');
assert.deepEqual(validateAuditReport(approvedDraft, sources, 'test-t2-v1'), []);
assert.throws(
  () =>
    buildApprovedReport(preparedDraft, sources, {
      actorId: 'codex-single-agent',
      approvedAt: '2026-09-14',
      evidenceRef: 'https://github.com/dleomil/quiz/issues/322',
    }),
  /ator distinto dos revisores/,
);

const draftReport = validReport();
draftReport.reportStatus = 'draft';
delete draftReport.remediationContentSetId;
delete draftReport.remediationSha256;
delete draftReport.humanApproval;
draftReport.reviews = [
  review('curriculum-factual', 'codex-single-agent', 'content_curator'),
];
assert.deepEqual(validateAuditReport(draftReport, sources, 'test-t2-v1'), []);

const unknownField = validReport();
unknownField.unreviewedText = 'private source text';
assert.ok(
  validateAuditReport(unknownField, sources, 'test-t2-v1').some((error) =>
    error.includes('campo desconhecido'),
  ),
);

const duplicatedPass = validReport();
duplicatedPass.reviews.push({ ...duplicatedPass.reviews[0] });
assert.ok(
  validateAuditReport(duplicatedPass, sources, 'test-t2-v1').some((error) =>
    error.includes('passagem duplicada'),
  ),
);

const sameActor = validReport();
assert.ok(validateAuditReport(sameActor, sources, 'test-t2-v1').length === 0);

const mixedActors = validReport();
mixedActors.reviews[1].actorId = 'another-reviewer';
assert.ok(
  validateAuditReport(mixedActors, sources, 'test-t2-v1').some((error) =>
    error.includes('unico actorId'),
  ),
);

const reviewerApproval = validReport();
reviewerApproval.humanApproval.actorId = 'codex-single-agent';
assert.ok(
  validateAuditReport(reviewerApproval, sources, 'test-t2-v1').some((error) =>
    error.includes('ator distinto dos revisores'),
  ),
);

const invalidApprovalDate = validReport();
invalidApprovalDate.humanApproval.approvedAt = '2026-02-30';
assert.ok(
  validateAuditReport(invalidApprovalDate, sources, 'test-t2-v1').some(
    (error) => error.includes('approvedAt invalida'),
  ),
);

const staleHash = validReport();
staleHash.sourceSha256 = '0'.repeat(64);
assert.ok(
  validateAuditReport(staleHash, sources, 'test-t2-v1').some((error) =>
    error.includes('sourceSha256 diverge'),
  ),
);

const missingQuestion = validReport();
missingQuestion.reviews.pop();
assert.ok(
  validateAuditReport(missingQuestion, sources, 'test-t2-v1').some((error) =>
    error.includes('exige as duas passagens'),
  ),
);

const unresolvedFinding = validReport();
unresolvedFinding.reportStatus = 'draft';
delete unresolvedFinding.remediationContentSetId;
delete unresolvedFinding.remediationSha256;
delete unresolvedFinding.humanApproval;
unresolvedFinding.reviews[0] = review(
  'curriculum-factual',
  'codex-single-agent',
  'content_curator',
  [
    {
      findingId: 'finding-1',
      category: 'factual-correctness',
      severity: 'major',
      field: 'question',
      evidenceRef: 'school-curriculum:2026-t2/matematica/medidas',
      resolution: 'pending',
    },
  ],
);
assert.deepEqual(
  validateAuditReport(unresolvedFinding, sources, 'test-t2-v1'),
  [],
);

const finalUnresolvedFinding = clone(unresolvedFinding);
finalUnresolvedFinding.reportStatus = 'final';
finalUnresolvedFinding.remediationContentSetId = '2026-t2-v2';
finalUnresolvedFinding.remediationSha256 = contentSha256([remediationQuestion]);
finalUnresolvedFinding.humanApproval = validReport().humanApproval;
finalUnresolvedFinding.reviews.push(
  review('pedagogical-linguistic', 'codex-single-agent', 'pedagogical_quality'),
);
assert.ok(
  validateAuditReport(finalUnresolvedFinding, sources, 'test-t2-v1').some(
    (error) => error.includes('continua sem resolucao'),
  ),
);

const invalidCategory = validReport();
invalidCategory.reviews[0] = review(
  'curriculum-factual',
  'codex-single-agent',
  'content_curator',
  [
    {
      findingId: 'finding-1',
      category: 'grammar-ish',
      severity: 'minor',
      field: 'question',
      evidenceRef: 'https://example.org/source',
      resolution: 'dismissed',
      resolutionRef: 'https://github.com/dleomil/quiz/issues/322',
    },
  ],
);
assert.ok(
  validateAuditReport(invalidCategory, sources, 'test-t2-v1').some((error) =>
    error.includes('category invalida'),
  ),
);

const duplicateFinding = validReport();
const finding = {
  findingId: 'finding-1',
  category: 'language',
  severity: 'minor',
  field: 'question',
  evidenceRef: 'https://example.org/source',
  resolution: 'corrected',
  resolutionQuestionId: `2026t2v2_${question.id}`,
  resolutionRef: 'https://github.com/dleomil/quiz/issues/322',
};
duplicateFinding.reviews[0] = review(
  'curriculum-factual',
  'codex-single-agent',
  'content_curator',
  [finding],
);
duplicateFinding.reviews[1] = review(
  'pedagogical-linguistic',
  'codex-single-agent',
  'pedagogical_quality',
  [{ ...finding }],
);
assert.ok(
  validateAuditReport(duplicateFinding, sources, 'test-t2-v1').some((error) =>
    error.includes('findingId ausente ou duplicado'),
  ),
);

const correctedFinding = validReport();
correctedFinding.reviews[0] = review(
  'curriculum-factual',
  'codex-single-agent',
  'content_curator',
  [
    {
      findingId: 'finding-1',
      category: 'factual-correctness',
      severity: 'major',
      field: 'question',
      evidenceRef: 'https://example.org/source',
      resolution: 'corrected',
      resolutionQuestionId: `2026t2v2_${question.id}`,
      resolutionRef: 'https://github.com/dleomil/quiz/issues/322',
    },
  ],
);
assert.deepEqual(
  validateAuditReport(correctedFinding, sources, 'test-t2-v1'),
  [],
);

const mismatchedResolutionId = clone(correctedFinding);
mismatchedResolutionId.reviews[0].findings[0].resolutionQuestionId = 'wrong';
assert.ok(
  validateAuditReport(mismatchedResolutionId, sources, 'test-t2-v1').some(
    (error) => error.includes('resolutionQuestionId deve ser'),
  ),
);

assert.ok(validateAuditReport(validReport(), {}, 'test-t2-v1').length > 0);
process.stdout.write('content-quality-audit: ok\n');
