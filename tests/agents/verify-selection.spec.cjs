const assert = require('node:assert/strict');
const { profileFor } = require('../../scripts/verify-local.cjs');
assert.equal(
  profileFor(['scripts/agent-auth.cjs', 'tests/agents/auth-status.spec.cjs']),
  'infrastructure',
);
assert.equal(
  profileFor([
    'scripts/agent-auth.cjs',
    'scripts/run-editorial-agent.cjs',
    'tests/agents/editorial-agent-runner.spec.cjs',
    'tests/agents/agent-event-capture.spec.cjs',
    'config/agent-capabilities.json',
    'docs/specs/agent-context-and-auth.md',
  ]),
  'infrastructure',
);
assert.equal(
  profileFor([
    '.github/subject-delivery.json',
    'js/data/t3-historia-v2-published.js',
  ]),
  'subject',
);
assert.equal(profileFor(['js/app.js']), 'legacy');
assert.equal(profileFor(['scripts/nao-cadastrado.cjs']), 'legacy');
console.log('verify-selection: ok');
