const assert = require('node:assert/strict');
const { questions } = require('../helpers/subject-synthetic.cjs');
const {
  validateApproval,
  packageHash,
} = require('../../scripts/content-delivery.cjs');
const policy = require('../../config/content-delivery-policy.json');
const rows = questions();
const record = {
  approval: {
    kind: 'delegated',
    delegationId: policy.standingDelegation.id,
    sourceSha256: packageHash(rows),
    executionId: 'fixture',
    evidenceRef: 'fixture://comando',
  },
};
const check = (q = rows, r = record) =>
  validateApproval(q, r, policy, () => {
    throw new Error('nao deve consultar aceite posterior');
  });
assert.deepEqual(check(), []);
assert.ok(check(rows.map((q) => ({ ...q, subject: 'portugues' }))).length);
assert.ok(
  check(rows, { approval: { ...record.approval, sourceSha256: 'outro' } })
    .length,
);
assert.ok(
  check(rows, { approval: { ...record.approval, approvedBy: 'dleomil' } })
    .length,
);
assert.ok(check(rows, { ...record, recoveryReports: [{}] }).length);
console.log('delegated-approval: ok');

const legacy = require('../helpers/content-delivery-fixtures.cjs').evidenceFor(
  rows,
);
assert.deepEqual(
  validateApproval(rows, legacy.record, policy, () => legacy.comment),
  [],
);
