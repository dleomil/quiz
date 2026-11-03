const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function scenario(status, released) {
  const context = vm.createContext({
    window: {},
    escapeHTML: (s) => String(s),
  });
  const load = (file) =>
    vm.runInContext(
      fs.readFileSync(path.join(__dirname, '../..', file), 'utf8'),
      context,
    );
  load('js/data/content-catalog.js');
  vm.runInContext(
    `
    const next = ContentCatalog.getById('2026-t3-v2');
    next.status = ${JSON.stringify(status)};
    next.publishedSubjects = ${JSON.stringify(released)};
    window.QuestionsDataSources = {
      portugues: { subjectMeta: { name: 'Português', available: true },
        questions: [
          { id: 'mensal', subject: 'portugues', topic: 'antigo', contentSetId: '2026-t3-v1', reviewStatus: 'published' },
          { id: 'final', subject: 'portugues', topic: 'novo', contentSetId: '2026-t3-v2', reviewStatus: 'published' },
          { id: 'rascunho', subject: 'portugues', topic: 'novo', contentSetId: '2026-t3-v2', reviewStatus: 'draft' },
        ] },
      geografia: { subjectMeta: { name: 'Geografia', available: true },
        questions: [{ id: 'pendente', subject: 'geografia', topic: 'agua', contentSetId: '2026-t3-v2', reviewStatus: 'published' }] },
    };
  `,
    context,
  );
  load('js/data/questions.js');
  return { context, load, value: (code) => vm.runInContext(code, context) };
}

const root = path.resolve(__dirname, '../..');
const coverage = JSON.parse(
  fs.readFileSync(
    path.join(root, 'config/content-coverage-manifest.json'),
    'utf8',
  ),
).contentSets['2026-t3-v2'];
const intake = fs.readFileSync(
  path.join(root, 'docs/specs/final-exams-november-2026-intake.md'),
  'utf8',
);
const planned = [...intake.matchAll(/^\| ([a-z][a-z0-9-]*) +\|.*\| +20 +\|$/gm)]
  .map((m) => m[1])
  .sort();
const declared = Object.values(coverage.subjects)
  .flatMap((topics) => Object.keys(topics))
  .sort();
assert.equal(planned.length, 66);
assert.equal(new Set(declared).size, 66);
assert.deepEqual(declared, planned);
assert.ok(
  Object.values(coverage.subjects).every((topics) =>
    Object.values(topics).every((n) => n === 20),
  ),
);
assert.equal(coverage.intakeStatus, 'under-review');

const draft = scenario('draft', []);
assert.equal(
  draft.value(
    "QuestionsDB.getContentSets().some(s => s.contentSetId === '2026-t3-v2')",
  ),
  false,
);
assert.equal(
  draft.value("QuestionsDB.getAvailableCount(null, null, '2026-t3-v2')"),
  0,
);
assert.equal(
  draft.value('QuestionsDB.getDefaultContentSet().contentSetId'),
  '2026-t3-v1',
);

const partial = scenario('published', ['portugues']);
assert.equal(
  partial.value(
    "QuestionsDB.getAvailableCount(null, 'portugues', '2026-t3-v2')",
  ),
  1,
);
assert.equal(
  partial.value(
    "QuestionsDB.getAvailableCount(null, 'geografia', '2026-t3-v2')",
  ),
  0,
);
assert.equal(
  partial.value(
    "QuestionsDB.getAvailableCount(null, 'portugues', '2026-t3-v1')",
  ),
  1,
);
assert.equal(
  partial.value("QuestionsDB.getRandom(20, null, null, '2026-t3-v2')[0].id"),
  'final',
);
partial.value(
  "const Store = { get: () => ({ selectedContentSet: '2026-t3-v2' }) }; const App = {};",
);
partial.load('js/views/home.js');
const element = { innerHTML: '', querySelectorAll: () => [] };
partial.context.element = element;
partial.value('HomeView.render(element)');
assert.match(element.innerHTML, /Disponível agora: Português/);
assert.match(element.innerHTML, /demais matérias aguardam/);
assert.match(element.innerHTML, /data-subject="portugues"/);
assert.doesNotMatch(element.innerHTML, /data-subject="geografia"/);

console.log(
  'final-exams-catalog: ok (rascunho invisivel, materias e acervos isolados)',
);
