const assert = require('node:assert/strict');
const { checkScope } = require('../../scripts/subject-scope.cjs');
const descriptor = { subject: 'historia', contentSetId: '2026-t3-v2' };
const paths = [
  '.github/subject-delivery.json',
  'js/data/t3-historia-v2-published.js',
  'index.html',
  'js/data/content-catalog.js',
];
const base = {
  'index.html': '<html>\n</html>',
  'js/data/content-catalog.js': 'publishedSubjects: ["portugues", "geografia"]',
};
const head = {
  'index.html':
    '<html>\n    <script src="js/data/t3-historia-v2-published.js"></script>\n</html>',
  'js/data/content-catalog.js':
    'publishedSubjects: ["portugues", "geografia", "historia"]',
};
const check = (files = paths) =>
  checkScope(
    files,
    descriptor,
    (p) => base[p],
    (p) => head[p],
  );
assert.equal(check(), true);
assert.throws(
  () => check([...paths, 'js/data/subjects/geografia.js']),
  /fora da entrega/,
);
assert.throws(
  () => check(paths.filter((p) => p !== 'index.html')),
  /incompleta/,
);
head['js/data/content-catalog.js'] = 'publishedSubjects: ["historia"]';
assert.throws(check, /mistura/);
head['js/data/content-catalog.js'] = base['js/data/content-catalog.js'];
assert.throws(check, /unica materia/);
console.log('subject-scope: ok');
