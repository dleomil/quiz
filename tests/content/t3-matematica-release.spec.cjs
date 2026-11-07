const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../..');
const context = vm.createContext({ window: {} });
vm.runInContext(
  fs.readFileSync(path.join(ROOT, 'js/data/subjects/matematica.js'), 'utf8'),
  context,
);
vm.runInContext(
  fs.readFileSync(
    path.join(ROOT, 'js/data/t3-matematica-published.js'),
    'utf8',
  ),
  context,
);

const questions =
  context.window.QuestionsDataSources.matematica.questions.filter(
    (question) => question.contentSetId === '2026-t3-v1',
  );
const expectedTopics = [
  'probabilidade',
  'multiplicacao',
  'divisao',
  'divisao-metodos',
  'expressoes',
  'decomposicao-multiplicacao',
  'problemas-expressoes',
  'area-malha',
  'perimetro',
  'retas-perpendiculares',
  'divisao-euclidiana',
];

assert.equal(questions.length, 220);
assert.equal(new Set(questions.map((question) => question.id)).size, 220);
assert.ok(questions.every((question) => question.reviewStatus === 'published'));
assert.deepEqual(
  [...new Set(questions.map((question) => question.topic))].sort(),
  [...expectedTopics].sort(),
);
for (const topic of expectedTopics) {
  const topicQuestions = questions.filter(
    (question) => question.topic === topic,
  );
  assert.equal(topicQuestions.length, 20, `${topic}: quantidade`);
  assert.deepEqual(
    topicQuestions.reduce((counts, question) => {
      counts[question.correctIndex] = (counts[question.correctIndex] || 0) + 1;
      return counts;
    }, {}),
    { 0: 5, 1: 5, 2: 5, 3: 5 },
    `${topic}: distribuição das respostas`,
  );
}

console.log('t3-matematica-release: ok (220 questões publicadas em 11 temas)');
