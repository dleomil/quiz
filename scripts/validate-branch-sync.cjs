const { spawnSync } = require('node:child_process');

function resolveSyncRequirement(headRef, baseRef) {
  if (headRef === 'develop' && baseRef === 'main') {
    return {
      ancestor: 'origin/main',
      descendant: 'origin/develop',
      operation: 'promocao develop -> main',
    };
  }

  if (
    baseRef === 'develop' &&
    /^chore\/reconcile-main-develop(?:$|[-/])/.test(headRef)
  ) {
    return {
      ancestor: 'origin/main',
      descendant: `origin/${headRef}`,
      operation: 'reconciliacao main -> develop',
    };
  }

  return null;
}

function validateBranchSync(headRef, baseRef, isAncestor) {
  if (!headRef || !baseRef) return ['head e base sao obrigatorios'];

  const requirement = resolveSyncRequirement(headRef, baseRef);
  if (!requirement) return [];
  if (isAncestor(requirement.ancestor, requirement.descendant)) return [];

  return [
    `${requirement.operation} bloqueada: ${requirement.ancestor} deve ser ancestral de ${requirement.descendant}`,
  ];
}

function gitIsAncestor(ancestor, descendant) {
  const result = spawnSync(
    'git',
    ['merge-base', '--is-ancestor', ancestor, descendant],
    { stdio: 'ignore' },
  );

  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new Error(
    `nao foi possivel comparar ancestralidade entre ${ancestor} e ${descendant}`,
  );
}

if (require.main === module) {
  const headRef = process.argv[2] || process.env.HEAD_REF;
  const baseRef = process.argv[3] || process.env.BASE_REF;
  const errors = validateBranchSync(headRef, baseRef, gitIsAncestor);

  if (errors.length) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
  } else {
    const requirement = resolveSyncRequirement(headRef, baseRef);
    const result = requirement ? 'ok' : 'nao aplicavel';
    process.stdout.write(`branch-sync: ${result} (${headRef} -> ${baseRef})\n`);
  }
}

module.exports = {
  gitIsAncestor,
  resolveSyncRequirement,
  validateBranchSync,
};
