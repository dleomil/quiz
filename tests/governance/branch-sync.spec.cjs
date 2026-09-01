const assert = require('node:assert/strict');
const {
  resolveSyncRequirement,
  validateBranchSync,
} = require('../../scripts/validate-branch-sync.cjs');

function run() {
  assert.deepStrictEqual(resolveSyncRequirement('develop', 'main'), {
    ancestor: 'origin/main',
    descendant: 'origin/develop',
    operation: 'promocao develop -> main',
  });

  assert.deepStrictEqual(
    resolveSyncRequirement('chore/reconcile-main-develop', 'develop'),
    {
      ancestor: 'origin/main',
      descendant: 'origin/chore/reconcile-main-develop',
      operation: 'reconciliacao main -> develop',
    },
  );

  assert.deepStrictEqual(
    validateBranchSync('develop', 'main', () => true),
    [],
  );
  assert.ok(
    validateBranchSync('develop', 'main', () => false)[0].includes(
      'promocao develop -> main bloqueada',
    ),
  );

  assert.deepStrictEqual(
    validateBranchSync(
      'chore/reconcile-main-develop-2026-09',
      'develop',
      () => true,
    ),
    [],
  );
  assert.ok(
    validateBranchSync(
      'chore/reconcile-main-develop',
      'develop',
      () => false,
    )[0].includes('reconciliacao main -> develop bloqueada'),
  );

  assert.deepStrictEqual(
    validateBranchSync('feature/quiz', 'develop', () => false),
    [],
  );
  assert.deepStrictEqual(
    validateBranchSync('chore/maintenance', 'develop', () => false),
    [],
  );
  assert.ok(validateBranchSync('', 'develop', () => true)[0].includes('head'));

  process.stdout.write('branch-sync-validator: ok\n');
}

run();
