const BRANCH_POLICIES = {
  develop: [
    'feature/*',
    'fix/*',
    'chore/*',
    'docs/*',
    'refactor/*',
    'hotfix/*',
  ],
  main: ['develop', 'hotfix/*', 'release/*'],
};

function matchesPattern(branchName, pattern) {
  if (!pattern.endsWith('/*')) return branchName === pattern;
  const prefix = pattern.slice(0, -1);
  return branchName.startsWith(prefix) && branchName.length > prefix.length;
}

function validateBranchPolicy(headRef, baseRef) {
  if (!headRef || !baseRef) {
    return ['head e base sao obrigatorios'];
  }

  const allowedSources = BRANCH_POLICIES[baseRef];
  if (!allowedSources) {
    return [
      `Destino invalido: ${baseRef}. Use uma das bases: ${Object.keys(
        BRANCH_POLICIES,
      ).join(', ')}`,
    ];
  }

  const isAllowed = allowedSources.some((pattern) =>
    matchesPattern(headRef, pattern),
  );
  if (isAllowed) return [];

  return [
    `Branch ${headRef} nao pode abrir PR para ${baseRef}. Origens permitidas: ${allowedSources.join(
      ', ',
    )}`,
  ];
}

if (require.main === module) {
  const headRef = process.argv[2] || process.env.HEAD_REF;
  const baseRef = process.argv[3] || process.env.BASE_REF;
  const errors = validateBranchPolicy(headRef, baseRef);

  if (errors.length) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`branch-policy: ok (${headRef} -> ${baseRef})\n`);
  }
}

module.exports = {
  BRANCH_POLICIES,
  matchesPattern,
  validateBranchPolicy,
};
