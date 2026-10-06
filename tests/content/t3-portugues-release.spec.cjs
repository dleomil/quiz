const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../..');
const context = vm.createContext({ window: {} });
['ciencias', 'portugues', 'matematica'].forEach((subject) => {
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, `js/data/subjects/${subject}.js`), 'utf8'),
    context,
  );
});
[
  't3-published.js',
  't3-portugues-published.js',
  't3-matematica-published.js',
].forEach((file) => {
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js/data', file), 'utf8'),
    context,
  );
});

const sources = context.window.QuestionsDataSources;
const portugues = sources.portugues.questions.filter(
  (question) => question.contentSetId === '2026-t3-v1',
);
assert.equal(portugues.length, 40);
assert.equal(new Set(portugues.map((question) => question.id)).size, 40);
['usos-c', 'verbos'].forEach((topic) => {
  const questions = portugues.filter((question) => question.topic === topic);
  assert.equal(questions.length, 20);
  assert.deepEqual(
    questions.reduce((counts, question) => {
      counts[question.correctIndex] = (counts[question.correctIndex] || 0) + 1;
      return counts;
    }, {}),
    { 0: 5, 1: 5, 2: 5, 3: 5 },
  );
  assert.ok(
    questions.every((question) => question.reviewStatus === 'published'),
  );
});
assert.ok(
  sources.ciencias.questions.filter(
    (question) => question.contentSetId === '2026-t3-v1',
  ).length === 140,
);
assert.equal(
  sources.matematica.questions.filter(
    (question) => question.contentSetId === '2026-t3-v1',
  ).length,
  220,
);

console.log(
  't3-portugues-release: ok (40 portugues T3; ciencias e matematica preservadas)',
);
