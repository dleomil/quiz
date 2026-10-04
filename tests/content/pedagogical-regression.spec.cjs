const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  evaluateCase,
  evaluateCaseFindings,
  scanPublishedT2,
  validateCorpus,
} = require('../../scripts/validate-pedagogical-regressions.cjs');

const root = path.resolve(__dirname, '..', '..');
const corpus = JSON.parse(
  fs.readFileSync(
    path.join(root, 'config', 'pedagogical-regression-corpus.json'),
    'utf8',
  ),
);

assert.deepEqual(validateCorpus(corpus), []);
for (const regressionCase of corpus.cases) {
  assert.deepEqual(
    evaluateCase(regressionCase),
    regressionCase.expectedRules,
    regressionCase.id,
  );
}
assert.equal(new Set(corpus.cases.map((item) => item.category)).size, 6);

const casesById = new Map(corpus.cases.map((item) => [item.id, item]));
const errorsAfterCorrect = evaluateCaseFindings(
  casesById.get('synthetic-orthography-after-correct-001'),
).filter(
  ({ rule, field }) =>
    rule === 'linguistic.common-orthography' && field === 'question',
);
assert.deepEqual(
  errorsAfterCorrect.map(({ evidence }) => evidence),
  ['crianca', 'nao', 'tambem'],
);
assert.deepEqual(
  evaluateCase(casesById.get('synthetic-orthography-before-correct-001')),
  ['linguistic.common-orthography'],
);
assert.deepEqual(evaluateCase(casesById.get('synthetic-agreement-001')), [
  'linguistic.subject-agreement',
]);
assert.deepEqual(
  evaluateCase(casesById.get('synthetic-subject-verb-agreement-001')),
  ['linguistic.subject-agreement'],
);
assert.deepEqual(
  evaluateCaseFindings(casesById.get('synthetic-repeated-token-001')).find(
    ({ rule }) => rule === 'linguistic.repeated-token',
  ),
  {
    field: 'options[1]',
    rule: 'linguistic.repeated-token',
    evidence: 'lê lê',
  },
);
assert.deepEqual(
  evaluateCase(casesById.get('synthetic-cross-field-repetition-001')),
  [],
);

const publishedPaths = [
  path.join(root, 'js', 'data', 'questions.js'),
  ...fs
    .readdirSync(path.join(root, 'js', 'data', 'subjects'))
    .map((name) => path.join(root, 'js', 'data', 'subjects', name)),
];
const publishedBeforeScan = new Map(
  publishedPaths.map((filePath) => [filePath, fs.readFileSync(filePath)]),
);
const t2Report = scanPublishedT2(root);
assert.equal(t2Report.schemaVersion, 't2-diagnostic-v1');
assert.equal(t2Report.blocking, false);
assert.ok(Array.isArray(t2Report.candidates));
t2Report.candidates.forEach((candidate) => {
  assert.deepEqual(Object.keys(candidate), [
    'questionId',
    'field',
    'rule',
    'evidence',
  ]);
  Object.values(candidate).forEach((value) =>
    assert.equal(typeof value, 'string'),
  );
  assert.ok(candidate.questionId);
  assert.ok(candidate.field);
  assert.ok(candidate.rule);
  assert.ok(candidate.evidence);
});
publishedBeforeScan.forEach((contents, filePath) => {
  assert.deepEqual(fs.readFileSync(filePath), contents);
});
process.stdout.write('pedagogical-regression: ok\n');
