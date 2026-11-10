const assert = require('node:assert/strict');
const { questions } = require('../helpers/subject-synthetic.cjs');
const { evidenceFor } = require('../helpers/content-delivery-fixtures.cjs');
const { verifySubject } = require('../../scripts/subject-verification.cjs');
const { packageHash } = require('../../scripts/content-delivery.cjs');
const policy = require('../../config/content-delivery-policy.json');
const rows = questions();
const { record, documents } = evidenceFor(rows);
record.approval = {
  kind: 'delegated',
  delegationId: policy.standingDelegation.id,
  sourceSha256: packageHash(rows),
  executionId: 'fixture',
  evidenceRef: 'fixture://comando',
};
const prefix = '2026-t3-v2--historia--tema-sintetico';
const descriptor = {
  schemaVersion: 'subject-delivery-v1',
  contentSetId: '2026-t3-v2',
  subject: 'historia',
  runtimePath: 'js/data/t3-historia-v2-published.js',
  batches: [
    {
      topic: 'tema-sintetico',
      draftPath: `docs/drafts/${prefix}.json`,
      recordPath: `docs/editorial/${prefix}.json`,
    },
  ],
};
documents[descriptor.batches[0].draftPath] = { questions: rows };
documents[descriptor.batches[0].recordPath] = record;
let runtime = rows.map((q) => ({ ...q, reviewStatus: 'published' }));
const options = {
  descriptor,
  coverage: {
    contentSets: {
      '2026-t3-v2': {
        intakeStatus: 'frozen',
        subjects: { historia: { 'tema-sintetico': 20 } },
      },
    },
  },
  policy,
  readJson: (name) => {
    assert.ok(
      name.includes('historia') || name.startsWith('docs/editorial/fixture-'),
    );
    return documents[name];
  },
  readText: (name) => {
    assert.equal(name, descriptor.runtimePath);
    return `window.QuestionsDataSources.historia.questions = ${JSON.stringify(runtime)}`;
  },
  allowTestEvidence: true,
};
assert.deepEqual(verifySubject(options).errors, []);
assert.ok(
  verifySubject({ ...options, allowTestEvidence: false }).errors.length,
);
runtime.pop();
assert.ok(verifySubject(options).errors.length);
runtime = rows.map((q) => ({
  ...q,
  reviewStatus: 'published',
  subject: 'ingles',
}));
assert.ok(verifySubject(options).errors.length);
assert.ok(
  verifySubject({ ...options, descriptor: { ...descriptor, batches: [] } })
    .errors.length,
);
console.log('subject-verification: ok');
