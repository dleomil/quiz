const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  evaluateCase,
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
assert.equal(typeof scanPublishedT2(root), 'object');
process.stdout.write('pedagogical-regression: ok\n');
