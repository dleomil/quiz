const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  TOPICS,
  buildQuestions,
  buildAudit,
} = require('../../scripts/create-t3-matematica-drafts.cjs');
const {
  validateContentSources,
} = require('../../scripts/validate-content.cjs');

const ROOT = path.resolve(__dirname, '../..');
const ids = new Set();

for (const topic of TOPICS) {
  const draftPath = path.join(
    ROOT,
    'docs/drafts',
    `2026-t3-v1-mat-${topic.id}.json`,
  );
  const auditPath = path.join(
    ROOT,
    'docs/audits',
    `2026-t3-v1-mat-${topic.id.replace(/-/g, '_')}-audit.json`,
  );
  const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  const generated = buildQuestions(topic);
  const questions = draft.questions;

  assert.equal(draft.schemaVersion, 'content-draft-v1');
  assert.equal(draft.contentSetId, '2026-t3-v1');
  assert.equal(questions.length, 20);
  assert.deepEqual(questions, generated);
  assert.deepEqual(validateContentSources({ matematica: { questions } }), []);
  assert.deepEqual(
    questions.reduce((counts, question) => {
      counts[question.correctIndex] = (counts[question.correctIndex] || 0) + 1;
      return counts;
    }, {}),
    { 0: 5, 1: 5, 2: 5, 3: 5 },
  );

  for (const question of questions) {
    assert.ok(!ids.has(question.id), `ID repetido: ${question.id}`);
    ids.add(question.id);
    assert.equal(question.subject, 'matematica');
    assert.equal(question.topic, topic.id);
    assert.equal(question.reviewStatus, 'draft');
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.equal(
      question.sourceRef.referenceId,
      'roteiro-estudos-av-mensal-t3-2026',
    );
    assert.equal(question.sourceRef.section, 'Matemática');
    assert.equal(question.sourceRef.topic, topic.id);
    assert.deepEqual(Object.keys(question.sourceRef).sort(), [
      'referenceId',
      'section',
      'topic',
    ]);
    assert.equal(
      Object.keys(question.wrongExplanations).length,
      3,
      `${question.id}: feedback incorreto incompleto`,
    );
  }

  assert.equal(audit.schemaVersion, 'content-quality-audit-v1');
  assert.equal(audit.reviewMode, 'single-agent-sequential');
  assert.equal(audit.reportStatus, 'draft');
  assert.equal(audit.topicId, `matematica:${topic.id}`);
  assert.equal(audit.reviews.length, 40);
  assert.deepEqual(audit, buildAudit(topic, questions));
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
}

assert.equal(ids.size, 220);
console.log('t3-matematica: ok (220 questões em 11 temas, todas em rascunho)');
