const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(
  path.join(root, 'js/data/content-catalog.js'),
  'utf8',
);
const context = vm.createContext({});
const fixtureSource = source.replace(
  '  ];\n\n  function getPublished()',
  `    {
      schemaVersion: 'content-v1', contentSetId: '2026-t3-v1',
      academicYear: 2026, term: 't3', version: 1, status: 'published',
      answerDistributionPolicy: 'balanced-five-v1', grade: '3-ano',
      displayName: '3º trimestre de 2026', isCurrent: false,
    },
    {
      schemaVersion: 'content-v1', contentSetId: '2025-t3-v1',
      academicYear: 2025, term: 't3', version: 1, status: 'published',
      answerDistributionPolicy: 'balanced-five-v1', grade: '3-ano',
      displayName: '3º trimestre de 2025', isCurrent: false,
    },
  ];

  function getPublished()`,
);
vm.runInContext(fixtureSource + '\nthis.__catalog = ContentCatalog;', context);

const catalog = context.__catalog;
const selectable = catalog.getQuizSelectable();
const allContentSets = catalog.getAll();

assert.equal(catalog.CURRENT_ACADEMIC_YEAR, 2026);
assert.deepEqual(
  Array.from(selectable, (contentSet) => contentSet.contentSetId).sort(),
  ['2026-t1-v1', '2026-t2-v2', '2026-t3-v1'],
);
assert.ok(
  selectable.every(
    (contentSet) =>
      contentSet.status === 'published' &&
      contentSet.academicYear === catalog.CURRENT_ACADEMIC_YEAR,
  ),
);
assert.equal(catalog.getDefault().contentSetId, '2026-t2-v2');
assert.equal(catalog.getById('2026-t2-v1').status, 'retired');
assert.equal(allContentSets.length, 6);
assert.ok(!selectable.some((contentSet) => contentSet.academicYear === 2025));
assert.ok(allContentSets.some((contentSet) => contentSet.term === 'legacy'));

process.stdout.write('content-catalog: ok\n');
