const assert = require('node:assert/strict');
const {
  validateAnswerDistribution,
} = require('../../scripts/validate-content.cjs');

function questions(distribution) {
  const values = [];
  let id = 0;
  distribution.forEach((count, correctIndex) => {
    for (let index = 0; index < count; index += 1) {
      values.push({
        id: `MAT-DIST-${String(id).padStart(3, '0')}`,
        contentSetId: 'test-t2-v2',
        subject: 'matematica',
        topic: 'medidas',
        correctIndex,
      });
      id += 1;
    }
  });
  return values;
}

const catalog = [
  {
    contentSetId: 'test-t2-v2',
    term: 't2',
    status: 'published',
    answerDistributionPolicy: 'balanced-five-v1',
  },
];

assert.deepEqual(
  validateAnswerDistribution(
    { matematica: { questions: questions([5, 5, 5, 5]) } },
    catalog,
  ),
  [],
);

assert.ok(
  validateAnswerDistribution(
    { matematica: { questions: questions([4, 6, 5, 5]) } },
    catalog,
  ).some((error) => error.includes('4/6/5/5')),
);

assert.ok(
  validateAnswerDistribution(
    { matematica: { questions: questions([5, 5, 5, 5]) } },
    [{ ...catalog[0], answerDistributionPolicy: 'unknown' }],
  ).some((error) => error.includes('answerDistributionPolicy')),
);

process.stdout.write('answer-distribution: ok\n');
