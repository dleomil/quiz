const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  ROOT,
  deriveAgentContracts,
  loadCapabilityModel,
  validateCapabilityModel,
} = require('../../scripts/agent-capabilities.cjs');

const model = loadCapabilityModel();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function errorsFor(candidate) {
  return validateCapabilityModel(candidate, {
    rootDirectory: ROOT,
    requireTracked: false,
  });
}

function expectError(candidate, text) {
  const errors = errorsFor(candidate);
  assert.ok(
    errors.some((error) => error.includes(text)),
    errors.join('\n'),
  );
}

assert.deepEqual(validateCapabilityModel(model, { rootDirectory: ROOT }), []);
assert.equal(model.roles.length, 9);
assert.equal(
  model.roles.filter((role) => role.status === 'executable').length,
  5,
);
assert.equal(model.separationRules.length, 4);
assert.deepEqual(Object.keys(deriveAgentContracts(model)).sort(), [
  'content-curator.toml',
  'pedagogical-quality.toml',
  'product-discovery.toml',
  'reviewer.toml',
  'verifier.toml',
]);
assert.ok(
  Object.values(deriveAgentContracts(model)).every(
    (contract) => contract.mcpPolicy === 'none',
  ),
);
assert.deepEqual(
  model.roles.find((role) => role.id === 'reviewer').contractPaths,
  [
    'docs/agents/reviewer-agent.md',
    'docs/agents/reviewer-agent-workflow.md',
    'docs/agents/reviewer-agent-decision-matrix.md',
    'docs/agents/reviewer-agent-comment-template.md',
  ],
);

const unknownField = clone(model);
unknownField.roles[0].authority = 'unbounded';
expectError(unknownField, 'campo desconhecido');

const duplicateCapability = clone(model);
duplicateCapability.capabilities.push(
  clone(duplicateCapability.capabilities[0]),
);
expectError(duplicateCapability, 'id duplicado');

const duplicateRole = clone(model);
duplicateRole.roles.push(clone(duplicateRole.roles[0]));
expectError(duplicateRole, 'id duplicado');

const duplicateRule = clone(model);
duplicateRule.separationRules.push(clone(duplicateRule.separationRules[0]));
expectError(duplicateRule, 'id duplicado');

const invalidEnum = clone(model);
invalidEnum.capabilities[0].repositoryEffect = 'root-access';
expectError(invalidEnum, 'repositoryEffect invalido');

const missingCapability = clone(model);
missingCapability.roles[0].capabilities = ['not-declared'];
expectError(missingCapability, 'capability inexistente');

const duplicateAdapterPath = clone(model);
const executableRoles = duplicateAdapterPath.roles.filter(
  (role) => role.status === 'executable',
);
executableRoles[1].adapter.configPath = executableRoles[0].adapter.configPath;
expectError(duplicateAdapterPath, 'configPath duplicado');

const unsafeContractPath = clone(model);
unsafeContractPath.roles[0].contractPaths = ['../outside.md'];
expectError(unsafeContractPath, 'caminho Markdown autorizado');

const missingContract = clone(model);
missingContract.roles[0].contractPaths = ['docs/agents/missing-contract.md'];
expectError(missingContract, 'esta ausente');

const executableWithoutAdapter = clone(model);
delete executableWithoutAdapter.roles.find(
  (role) => role.status === 'executable',
).adapter;
expectError(executableWithoutAdapter, 'adapter obrigatorio');

const executableWithWriteCapability = clone(model);
executableWithWriteCapability.roles.find(
  (role) => role.status === 'executable',
).capabilities = ['implementation-author'];
expectError(executableWithWriteCapability, 'capability read-only');

const documentedWithAdapter = clone(model);
documentedWithAdapter.roles.find(
  (role) => role.status === 'documented',
).adapter = clone(
  model.roles.find((role) => role.status === 'executable').adapter,
);
expectError(documentedWithAdapter, 'adapter proibido');

const unsafeAdapter = clone(model);
unsafeAdapter.roles.find(
  (role) => role.status === 'executable',
).adapter.configPath = '../agent.toml';
expectError(unsafeAdapter, 'configPath deve ficar em .codex/agents');

const missingMcpPolicy = clone(model);
delete missingMcpPolicy.roles.find((role) => role.status === 'executable')
  .adapter.mcpPolicy;
expectError(missingMcpPolicy, 'mcpPolicy deve ser none');

const invalidRuleReference = clone(model);
invalidRuleReference.separationRules[0].checkerCapability = 'not-declared';
expectError(invalidRuleReference, 'checkerCapability inexistente');

const invalidDistinctActor = clone(model);
invalidDistinctActor.separationRules[0].requiresDistinctActor = false;
expectError(invalidDistinctActor, 'requiresDistinctActor deve ser true');

const combinedRole = clone(model);
combinedRole.roles
  .find((role) => role.id === 'implementer')
  .capabilities.push('pull-request-review');
expectError(combinedRole, 'acumula producao e verificacao');

const untrackedRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'agent-capability-model-'),
);
try {
  const untrackedPath = path.join(untrackedRoot, 'docs', 'agents', 'test.md');
  fs.mkdirSync(path.dirname(untrackedPath), { recursive: true });
  fs.writeFileSync(untrackedPath, '# Untracked test fixture\n');
  execFileSync('git', ['init', '--quiet'], { cwd: untrackedRoot });
  const untrackedContract = clone(model);
  untrackedContract.roles[0].contractPaths = ['docs/agents/test.md'];
  const errors = validateCapabilityModel(untrackedContract, {
    rootDirectory: untrackedRoot,
  });
  assert.ok(
    errors.some((error) => error.includes('nao esta versionado no Git')),
    errors.join('\n'),
  );
} finally {
  fs.rmSync(untrackedRoot, { recursive: true, force: true });
}

process.stdout.write('agent-capability-model: ok\n');
