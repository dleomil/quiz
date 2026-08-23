const assert = require('node:assert/strict');
const {
  validateBranchPolicy,
} = require('../../scripts/validate-branch-policy.cjs');

function expectValid(headRef, baseRef) {
  assert.deepStrictEqual(validateBranchPolicy(headRef, baseRef), []);
}

function expectInvalid(headRef, baseRef, expectedText) {
  const errors = validateBranchPolicy(headRef, baseRef);
  assert.strictEqual(errors.length, 1);
  assert.ok(errors[0].includes(expectedText), errors[0]);
}

function run() {
  [
    'feature/nova-funcionalidade',
    'fix/corrigir-fluxo',
    'chore/ajustar-ferramenta',
    'docs/atualizar-guia',
    'refactor/separar-modulo',
    'hotfix/correcao-urgente',
  ].forEach((headRef) => expectValid(headRef, 'develop'));

  ['develop', 'hotfix/correcao-urgente', 'release/promocao-controlada'].forEach(
    (headRef) => expectValid(headRef, 'main'),
  );

  expectInvalid('feat/atalho-invalido', 'develop', 'feature/*');
  expectInvalid('feature/direto-producao', 'main', 'develop');
  expectInvalid('release/destino-incorreto', 'develop', 'feature/*');
  expectInvalid('feature/teste', 'staging', 'Destino invalido');
  expectInvalid('', 'develop', 'obrigatorios');

  process.stdout.write('branch-policy-validator: ok\n');
}

run();
