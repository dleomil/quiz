const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const draftPath = path.join(ROOT, 'docs/drafts/2026-t3-v1-cie-luz-visao.json');
const auditPath = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-cie-luz-visao-audit.json',
);

const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const questions = draft.questions;

assert.equal(draft.schemaVersion, 'content-draft-v1');
assert.equal(draft.contentSetId, '2026-t3-v1');
assert.equal(questions.length, 20);
assert.equal(new Set(questions.map((question) => question.id)).size, 20);

const answerDistribution = questions.reduce((counts, question) => {
  counts[question.correctIndex] = (counts[question.correctIndex] || 0) + 1;
  return counts;
}, {});
assert.deepEqual(answerDistribution, { 0: 5, 1: 5, 2: 5, 3: 5 });

for (const question of questions) {
  assert.equal(question.subject, 'ciencias');
  assert.equal(question.topic, 'luz-visao');
  assert.equal(question.reviewStatus, 'draft');
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options).size, 4);
  assert.match(question.explanation, /\S/);
  assert.equal(Object.keys(question.wrongExplanations).length, 3);
  assert.ok(question.sourceRef.page);
}

assert.equal(audit.schemaVersion, 'content-quality-audit-v1');
assert.equal(audit.reviewMode, 'single-agent-sequential');
assert.equal(audit.reportStatus, 'draft');
assert.equal(audit.reviews.length, 40);
assert.equal(new Set(audit.reviews.map((review) => review.actorId)).size, 1);
assert.ok(audit.reviews.every((review) => review.decision === 'clear'));
assert.ok(audit.reviews.every((review) => review.findings.length === 0));
assert.deepEqual(
  new Set(audit.reviews.map((review) => review.questionId)),
  new Set(questions.map((question) => question.id)),
);

console.log('t3-pilot: ok (20 perguntas, distribuição 5/5/5/5, 40 revisões)');
