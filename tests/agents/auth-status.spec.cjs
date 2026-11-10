const assert = require('node:assert/strict');
const { classifyAuthStatus } = require('../../scripts/agent-auth.cjs');
assert.equal(classifyAuthStatus('Logged in using ChatGPT'), 'chatgpt');
assert.equal(
  classifyAuthStatus(
    'Aviso de versao\nLogged in using ChatGPT (conta ativa)\n',
  ),
  'chatgpt',
);
assert.equal(classifyAuthStatus('Not logged in'), 'login-required');
assert.equal(classifyAuthStatus('Keychain unavailable'), 'keyring-unavailable');
assert.equal(
  classifyAuthStatus('Logged in using an API key'),
  'different-method',
);
assert.equal(classifyAuthStatus(''), 'unrecognized');
console.log('auth-status: ok');
