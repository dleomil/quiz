const assert = require('node:assert/strict');
const { contentSha256 } = require('../../scripts/validate-content-audit.cjs');
const { recordBatch } = require('../../scripts/record-content-audit-batch.cjs');

const questions = Array.from({ length: 20 }, (_, index) => ({
  id: `TEST-${String(index + 1).padStart(3, '0')}`,
  contentSetId: '2026-t2-v1',
  subject: 'matematica',
  topic: 'medidas',
}));
const sources = { matematica: { questions } };
const report = {
  schemaVersion: 'content-quality-audit-v1',
  reviewMode: 'single-agent-sequential',
  reportStatus: 'draft',
  contentSetId: '2026-t2-v1',
  sourceSha256: contentSha256(questions),
  reviews: [],
};

const curriculumBatch = recordBatch(
  report,
  sources,
  'matematica',
  'medidas',
  'curriculum-factual',
);
assert.equal(curriculumBatch.reviews.length, 20);
assert.ok(
  curriculumBatch.reviews.every(
    (review) =>
      review.actorId === 'codex-single-agent' &&
      review.actorRole === 'content_curator' &&
      review.decision === 'clear',
  ),
);

const fullDraft = recordBatch(
  curriculumBatch,
  sources,
  'matematica',
  'medidas',
  'pedagogical-linguistic',
);
assert.equal(fullDraft.reviews.length, 40);
assert.ok(
  fullDraft.reviews.every((review) => review.actorId === 'codex-single-agent'),
);
assert.throws(
  () =>
    recordBatch(
      fullDraft,
      sources,
      'matematica',
      'medidas',
      'pedagogical-linguistic',
    ),
  /passagem ja registrada/,
);
assert.throws(
  () =>
    recordBatch(
      report,
      sources,
      'matematica',
      'medidas',
      'curriculum-factual',
      { 'UNKNOWN-ID': [{ findingId: 'x' }] },
    ),
  /achado fora do lote/,
);

process.stdout.write('record-content-audit-batch: ok\n');
