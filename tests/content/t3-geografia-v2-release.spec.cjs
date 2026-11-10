const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const context = vm.createContext({ window: {} });
for (const file of [
  'js/data/subjects/geografia.js',
  'js/data/t3-published.js',
  'js/data/t3-geografia-v2-published.js',
  'js/data/t3-portugues-published.js',
  'js/data/t3-matematica-published.js',
  'js/data/t3-portugues-expansion-published.js',
  'js/data/content-catalog.js',
  'js/data/questions.js',
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {
    filename: file,
  });
}
const catalog = vm.runInContext(
  "ContentCatalog.getById('2026-t3-v2')",
  context,
);
assert.ok(catalog.publishedSubjects.includes('geografia'));
const questions = Array.from(
  vm.runInContext(
    "QuestionsDB.getAll().filter((q) => q.subject === 'geografia' && q.contentSetId === '2026-t3-v2')",
    context,
  ),
);
assert.equal(questions.length, 180);
assert.equal(new Set(questions.map((q) => q.id)).size, 180);
assert.deepEqual(
  Object.keys(
    questions.reduce((counts, q) => {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
      return counts;
    }, {}),
  ).sort(),
  [
    'agua-no-campo',
    'agua-nos-centros-urbanos',
    'agua-potavel-reuso-e-reaproveitamento',
    'desigualdades-urbanas-e-rurais',
    'integracao-e-infraestrutura-urbana-e-rural',
    'municipio',
    'percurso-da-agua',
    'tecnologia-no-campo',
    'usos-da-agua',
  ].sort(),
);
for (const question of questions) {
  assert.equal(question.reviewStatus, 'published');
  assert.equal(question.contentSetId, '2026-t3-v2');
  assert.equal(question.options.length, 4);
  assert.equal(Object.keys(question.wrongExplanations).length, 3);
  assert.ok(question.topicName);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(html, /js\/data\/t3-geografia-v2-published\.js/);
console.log(
  't3-geografia-v2-release: ok (180 questoes, 9 temas, runtime/catalogo carregados)',
);
