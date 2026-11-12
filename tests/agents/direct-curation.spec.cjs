const assert = require('node:assert/strict');
const { scenario } = require('../helpers/subject-synthetic.cjs');
const { validateDirectCuration } = require('../../scripts/direct-curation.cjs');
const valid = scenario();
assert.deepEqual(validateDirectCuration(valid), []);
const clone = () => JSON.parse(JSON.stringify(valid));
let bad = clone();
bad.output.proposals.pop();
assert.ok(validateDirectCuration(bad).length);
bad = clone();
bad.output.proposals[1].id = bad.output.proposals[0].id;
assert.ok(validateDirectCuration(bad).length);
bad = clone();
bad.output.proposals[0].subject = 'ingles';
assert.ok(validateDirectCuration(bad).length);
bad = clone();
bad.input.manifestState = 'under-review';
assert.ok(validateDirectCuration(bad).length);
bad = clone();
bad.output.proposals[0].wrongExplanations = {};
assert.ok(validateDirectCuration(bad).length);
bad = clone();
bad.output.decision = 'adjustments_required';
bad.output.findings = [
  {
    questionId: bad.output.proposals[0].id,
    criterion: 'Precisao do enunciado',
    severity: 'major',
    evidence: 'O enunciado admite duas leituras.',
    recommendation: 'Delimitar a situacao descrita.',
  },
  {
    questionId: bad.output.proposals[1].id,
    criterion: 'Clareza da alternativa',
    severity: 'minor',
    evidence: 'Uma alternativa esta ambigua.',
    recommendation: 'Reescrever a alternativa.',
  },
];
assert.deepEqual(validateDirectCuration(bad), []);
console.log('direct-curation: ok');
