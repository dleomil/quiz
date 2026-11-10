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
  'index.html':
    '<html>\n    <script defer src="js/data/subjects/historia.js?v=2"></script>\n    <script defer src="js/data/content-catalog.js?v=2"></script>\n    <script defer src="js/data/questions.js?v=8"></script>\n</html>',
  'js/data/content-catalog.js': 'publishedSubjects: ["portugues", "geografia"]',
};
const head = {
  'index.html': base['index.html'].replace(
    '    <script defer src="js/data/content-catalog',
    '    <script defer src="js/data/t3-historia-v2-published.js"></script>\n    <script defer src="js/data/content-catalog',
  ),
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
const validIndex = head['index.html'];
const tag =
  '    <script defer src="js/data/t3-historia-v2-published.js"></script>';
for (const invalid of [
  validIndex.replace(tag, tag.replace('defer ', '')),
  validIndex.replace(tag, tag.replace('defer', 'async')),
  validIndex.replace(tag, tag + '\n' + tag),
  validIndex.replace(tag, tag.replace('historia-v2', 'ingles-v2')),
  tag + '\n' + validIndex.replace(tag + '\n', ''),
  validIndex.replace(tag + '\n', '').replace('</html>', tag + '\n</html>'),
]) {
  head['index.html'] = invalid;
  assert.throws(check);
}
head['index.html'] = validIndex;
const vm = require('node:vm');
function loadSyntheticPage(html) {
  const context = vm.createContext({ window: {} });
  const scripts = {
    'js/data/subjects/historia.js': 'window.rows = []',
    'js/data/t3-historia-v2-published.js':
      '(window.rows ||= []).push("candidato-sintetico")',
    'js/data/content-catalog.js': 'window.catalogReady = true',
    'js/data/questions.js': 'window.result = window.rows.slice()',
  };
  const deferred = [];
  for (const line of html.split('\n')) {
    if (!line.trim().startsWith('<script ')) continue;
    const source = line.split('src="')[1]?.split('"')[0];
    const code = scripts[source?.split('?')[0]];
    assert.ok(code, 'Fixture exige script conhecido');
    if (line.trim().split(/\s+/).includes('defer')) deferred.push(code);
    else vm.runInContext(code, context);
  }
  for (const code of deferred) vm.runInContext(code, context);
  return Array.from(context.window.result);
}
assert.deepEqual(
  loadSyntheticPage(validIndex.replace(tag, tag.replace('defer ', ''))),
  [],
);
assert.deepEqual(loadSyntheticPage(validIndex), ['candidato-sintetico']);
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

assert.deepEqual(
  loadSyntheticPage(validIndex.replaceAll('</script>', '</script >')),
  ['candidato-sintetico'],
);
