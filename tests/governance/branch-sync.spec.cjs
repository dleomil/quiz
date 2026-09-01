const assert = require('node:assert/strict');
const {
  resolveSyncRequirement,
  validateBranchSync,
} = require('../../scripts/validate-branch-sync.cjs');

function run() {
  assert.deepStrictEqual(resolveSyncRequirement('develop', 'main', 'abc123'), {
    ancestor: 'origin/main',
    descendant: 'abc123',
    operation: 'integracao develop -> main',
  });

  assert.deepStrictEqual(
    resolveSyncRequirement('chore/reconcile-main-develop', 'develop', 'def456'),
    {
      ancestor: 'origin/main',
      descendant: 'def456',
      operation: 'reconciliacao main -> develop',
    },
  );

  assert.deepStrictEqual(
    validateBranchSync('develop', 'main', 'abc123', () => true),
    [],
  );
  assert.ok(
    validateBranchSync('develop', 'main', 'abc123', () => false)[0].includes(
      'integracao develop -> main bloqueada',
    ),
  );

  assert.deepStrictEqual(
    validateBranchSync(
      'chore/reconcile-main-develop-2026-09',
      'develop',
      'def456',
      () => true,
    ),
    [],
  );
  assert.ok(
    validateBranchSync(
      'chore/reconcile-main-develop',
      'develop',
      'def456',
      () => false,
    )[0].includes('reconciliacao main -> develop bloqueada'),
  );

  assert.deepStrictEqual(
    validateBranchSync('release/t3', 'main', 'release-sha', () => true),
    [],
  );
  assert.ok(
    validateBranchSync(
      'hotfix/quiz',
      'main',
      'hotfix-sha',
      () => false,
    )[0].includes('integracao hotfix/quiz -> main bloqueada'),
  );
  assert.deepStrictEqual(
    validateBranchSync('feature/quiz', 'develop', 'feature-sha', () => false),
    [],
  );
  assert.deepStrictEqual(
    validateBranchSync(
      'chore/maintenance',
      'develop',
      'chore-sha',
      () => false,
    ),
    [],
  );
  assert.ok(
    validateBranchSync('', 'develop', 'abc123', () => true)[0].includes('head'),
  );

  process.stdout.write('branch-sync-validator: ok\n');
}

run();
