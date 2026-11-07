const assert = require('node:assert/strict');
const policy = require('../../scripts/agent-verifier-loop-policy.cjs');

const finding = {
  requirementId: 'VER-EVIDENCE',
  severity: 'blocking',
  evidence: 'O resultado contradiz o contrato informado.',
};
const needsReview = {
  decision: 'adjustments_required',
  findings: [finding],
  reviewStatus: 'needs_review',
};
const conclusive = {
  decision: 'adjustments_required',
  findings: [finding],
  reviewStatus: 'conclusive',
};

assert.equal(policy.needsSecondPass(needsReview), true);
assert.equal(policy.needsSecondPass(conclusive), false);
assert.equal(
  policy.isConverged(
    { signature: policy.outputSignature(needsReview) },
    conclusive,
  ),
  true,
);
assert.equal(
  policy.isConverged(
    { signature: policy.outputSignature(needsReview) },
    { ...conclusive, decision: 'blocked' },
  ),
  false,
);
assert.equal(
  policy.isConverged(
    { signature: policy.outputSignature(needsReview) },
    { ...conclusive, findings: [{ ...finding, severity: 'major' }] },
  ),
  false,
);
assert.equal(
  policy.isConverged(
    { signature: policy.outputSignature(needsReview) },
    needsReview,
  ),
  false,
);

const workSha256 = 'a'.repeat(64);
const paused = {
  status: 'awaiting_authorization',
  callsUsed: 2,
  workSha256,
  extraAuthorizationUsed: false,
};
assert.equal(policy.canAuthorize(paused), true);
assert.deepEqual(
  policy.validateAuthorization(
    paused,
    workSha256,
    `Autorizo ate 2 execucoes adicionais para a ficha SHA-256 ${workSha256}.`,
  ),
  { maximumAdditionalCalls: 2, totalCeiling: 4 },
);
assert.throws(
  () =>
    policy.validateAuthorization(
      paused,
      'b'.repeat(64),
      `Autorizo ate 2 execucoes adicionais para a ficha SHA-256 ${workSha256}.`,
    ),
  /hash da ficha diverge/,
);
assert.equal(
  policy.canAuthorize({ ...paused, extraAuthorizationUsed: true }),
  false,
);
assert.equal(policy.canAuthorize({ ...paused, callsUsed: 0 }), false);

let state = { callsUsed: 0 };
for (let call = 1; call <= policy.TOTAL_LIMIT; call++) {
  state = policy.reserveCall(state);
  assert.equal(state.callsUsed, call);
}
assert.throws(() => policy.reserveCall(state), /teto absoluto/);

process.stdout.write(
  'verifier-loop-policy: ok (convergencia, autorizacao vinculada e teto de quatro chamadas)\n',
);
