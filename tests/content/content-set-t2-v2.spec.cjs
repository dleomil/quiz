const assert = require('node:assert/strict');
const {
  loadContentSources,
  validateContentSources,
} = require('../../scripts/validate-content.cjs');
const { getQuestions } = require('../../scripts/validate-content-audit.cjs');

const sources = loadContentSources(process.cwd());
const originalQuestions = getQuestions(sources, '2026-t2-v1');
const remediationQuestions = getQuestions(sources, '2026-t2-v2');

assert.equal(originalQuestions.length, 620);
assert.equal(remediationQuestions.length, 620);
assert.deepEqual(validateContentSources(sources), []);

const originalById = new Map(
  originalQuestions.map((question) => [question.id, question]),
);
remediationQuestions.forEach((question) => {
  const originalId = question.id.replace(/^2026t2v2_/, '');
  assert.ok(question.id.startsWith('2026t2v2_'));
  assert.ok(originalById.has(originalId));
  assert.equal(question.contentSetId, '2026-t2-v2');
  assert.equal(question.version, 2);
});

const distributionByTopic = new Map();
remediationQuestions.forEach((question) => {
  const key = `${question.subject}:${question.topic}`;
  if (!distributionByTopic.has(key)) {
    distributionByTopic.set(key, [0, 0, 0, 0]);
  }
  distributionByTopic.get(key)[question.correctIndex] += 1;
});
assert.equal(distributionByTopic.size, 31);
distributionByTopic.forEach((counts, topic) => {
  assert.deepEqual(counts, [5, 5, 5, 5], topic);
});

const remediationByOriginalId = new Map(
  remediationQuestions.map((question) => [
    question.id.replace(/^2026t2v2_/, ''),
    question,
  ]),
);
const originalFinding = (id) => remediationByOriginalId.get(id);

assert.match(
  originalFinding('CIE-T2-CRU-020').wrongExplanations[0],
  /machucar a pessoa/,
);
assert.match(
  originalFinding('CIE-T2-EQU-002').wrongExplanations[2],
  /água doce, não marinhos/,
);
assert.match(originalFinding('mat_t2_de_017').question, /noite 4/);
assert.match(originalFinding('pt_t2_vi_002').question, /no quintal/);
assert.ok(originalFinding('pt_t2_vi_002').options.includes('quintal'));
assert.match(originalFinding('pt_t2_vi_003').question, /uma bola/);
assert.match(originalFinding('pt_t2_vi_005').question, /na escola/);
assert.match(originalFinding('pt_t2_vii_002').question, /com alegria/);
assert.match(originalFinding('mat_t2_gr_001').question, /gráfico/);
assert.match(originalFinding('mat_t2_de_001').question, /maçãs/);

assert.equal(originalQuestions[0].contentSetId, '2026-t2-v1');
assert.equal(originalQuestions[0].version, 1);

process.stdout.write('content-set-t2-v2: ok\n');
