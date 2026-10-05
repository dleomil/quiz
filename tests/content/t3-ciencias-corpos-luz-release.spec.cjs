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
vm.runInContext(
  fs.readFileSync(path.join(ROOT, 'js/data/t3-published.js'), 'utf8'),
  context,
);

const sources = context.window.QuestionsDataSources;
const questions = sources.ciencias.questions.filter(
  (question) => question.contentSetId === '2026-t3-v1',
);
const corposLuz = questions.filter(
  (question) => question.topic === 'corpos-luz',
);

assert.equal(corposLuz.length, 20);
assert.equal(new Set(corposLuz.map((question) => question.id)).size, 20);
assert.deepEqual(
  corposLuz.reduce((counts, question) => {
    counts[question.correctIndex] = (counts[question.correctIndex] || 0) + 1;
    return counts;
  }, {}),
  { 0: 5, 1: 5, 2: 5, 3: 5 },
);
assert.ok(corposLuz.every((question) => question.reviewStatus === 'published'));
assert.equal(questions.length, 140);
assert.equal(
  sources.portugues.questions.filter(
    (question) => question.contentSetId === '2026-t3-v1',
  ).length,
  0,
);
assert.equal(
  sources.matematica.questions.filter(
    (question) => question.contentSetId === '2026-t3-v1',
  ).length,
  0,
);

console.log(
  't3-ciencias-corpos-luz-release: ok (140 ciencias T3; Portugues e Matematica fora)',
);
