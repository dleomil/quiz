const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const draft = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'docs/drafts/2026-t3-v1-his-povo-brasileiro.json'),
    'utf8',
  ),
);
const audit = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'docs/audits/2026-t3-v1-his-povo-brasileiro-audit.json'),
    'utf8',
  ),
);
const questions = draft.questions;
assert.equal(draft.schemaVersion, 'content-draft-v1');
assert.equal(draft.contentSetId, '2026-t3-v1');
assert.equal(questions.length, 20);
assert.equal(new Set(questions.map((question) => question.id)).size, 20);
assert.deepEqual(
  questions.reduce((counts, question) => {
    counts[question.correctIndex] = (counts[question.correctIndex] || 0) + 1;
    return counts;
  }, {}),
  { 0: 5, 1: 5, 2: 5, 3: 5 },
);
for (const question of questions) {
  assert.match(question.id, /^2026t3v1_his_povo_brasileiro_\d{3}$/);
  assert.equal(question.subject, 'historia');
  assert.equal(question.topic, 'povo-brasileiro');
  assert.equal(question.reviewStatus, 'draft');
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options).size, 4);
  assert.match(question.explanation, /\S/);
  assert.equal(Object.keys(question.wrongExplanations).length, 3);
  assert.equal(
    question.sourceRef.referenceId,
    'roteiro-estudos-av-mensal-t3-2026',
  );
}
assert.equal(audit.schemaVersion, 'content-quality-audit-v1');
assert.equal(audit.topicId, 'historia:povo-brasileiro');
assert.equal(audit.reviews.length, 40);
assert.equal(new Set(audit.reviews.map((review) => review.actorId)).size, 1);
assert.ok(
  audit.reviews.every(
    (review) => review.decision === 'clear' && review.findings.length === 0,
  ),
);
assert.deepEqual(
  new Set(audit.reviews.map((review) => review.questionId)),
  new Set(questions.map((question) => question.id)),
);
console.log(
  't3-historia-povo-brasileiro: ok (20 perguntas, 5/5/5/5, 40 revisões)',
);
