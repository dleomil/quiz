const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { sha256 } = require('../../scripts/governance-guidelines.cjs');
const {
  MAX_MESSAGE_BYTES,
  SUPPORTED_PROTOCOL_VERSIONS,
  TOOLS,
  createProtocolHandler,
  createService,
} = require('../../scripts/governance-mcp-server.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const SERVER = path.join(ROOT, 'scripts', 'governance-mcp-server.cjs');

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-governance-mcp-'));
  const policyPath = path.join(root, 'docs', 'specs', 'policy.md');
  const producerContract = path.join(root, 'docs', 'agents', 'spec.md');
  const checkerContract = path.join(root, 'docs', 'agents', 'architect.md');
  const policyContent = '# Test policy\n\nNormative fixture.\n';
  writeText(policyPath, policyContent);
  writeText(producerContract, '# Spec role\n');
  writeText(checkerContract, '# Architect role\n');
  writeJson(path.join(root, 'config', 'governance-guidelines.json'), {
    schemaVersion: 'governance-guidelines-v1',
    guidelines: [
      {
        id: 'test-policy',
        version: '1.0.0',
        status: 'active',
        type: 'policy',
        owner: 'architecture',
        sourcePath: 'docs/specs/policy.md',
        sha256: sha256(policyContent),
        appliesTo: ['agent-workflows'],
        enforcement: 'automated-blocking',
        evidence: ['protocol test'],
      },
    ],
  });
  writeJson(path.join(root, 'config', 'agent-capabilities.json'), {
    schemaVersion: 'agent-capabilities-v1',
    capabilities: [
      {
        id: 'specification-author',
        artifactType: 'specification',
        operation: 'author',
        repositoryEffect: 'workspace-write',
      },
      {
        id: 'architecture-review',
        artifactType: 'specification',
        operation: 'review',
        repositoryEffect: 'read-only',
      },
    ],
    roles: [
      {
        id: 'spec',
        status: 'documented',
        capabilities: ['specification-author'],
        contractPaths: ['docs/agents/spec.md'],
      },
      {
        id: 'architect',
        status: 'documented',
        capabilities: ['architecture-review'],
        contractPaths: ['docs/agents/architect.md'],
      },
    ],
    separationRules: [
      {
        id: 'specification-architecture-reviewer',
        artifactType: 'specification',
        producerCapability: 'specification-author',
        checkerCapability: 'architecture-review',
        enforcement: 'manual-blocking',
        requiresDistinctActor: true,
      },
    ],
  });
  execFileSync('git', ['init', '--quiet'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  return { policyContent, policyPath, root };
}

function withFixture(assertion) {
  const fixture = createFixture();
  try {
    assertion(fixture);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
}

function initialize(handler, version = '2025-11-25') {
  return handler({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: version,
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' },
    },
  });
}

function runProtocol(input) {
  return spawnSync(process.execPath, [SERVER], {
    cwd: ROOT,
    input,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
}

function repositoryFingerprint() {
  const files = execFileSync(
    'git',
    ['ls-files', '-co', '--exclude-standard', '-z'],
    { cwd: ROOT, encoding: 'utf8' },
  )
    .split('\0')
    .filter(Boolean)
    .sort();
  return files.map((file) => [
    file,
    sha256(fs.readFileSync(path.join(ROOT, file))),
  ]);
}

assert.deepEqual(
  [...SUPPORTED_PROTOCOL_VERSIONS],
  ['2025-11-25', '2025-06-18'],
);
assert.deepEqual(
  TOOLS.map((tool) => tool.name),
  ['list_guidelines', 'read_guideline', 'read_agent_capabilities'],
);
TOOLS.forEach((tool) => {
  assert.deepEqual(tool.annotations, {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  });
  assert.equal(tool.inputSchema.additionalProperties, false);
  assert.equal(tool.outputSchema.additionalProperties, false);
});

withFixture(({ policyContent, root }) => {
  const service = createService({ rootDirectory: root });
  assert.deepEqual(service.validate(), {
    guidelineCount: 1,
    capabilityCount: 2,
  });
  const list = service.callTool('list_guidelines', {});
  assert.equal(list.schemaVersion, 'governance-guidelines-v1');
  assert.equal(list.guidelines[0].id, 'test-policy');
  assert.equal(
    JSON.stringify(service.callTool('list_guidelines', {})),
    JSON.stringify(list),
  );
  const guideline = service.callTool('read_guideline', { id: 'test-policy' });
  assert.equal(guideline.content, policyContent);
  assert.equal(guideline.guideline.sha256, sha256(policyContent));
  const capabilities = service.callTool('read_agent_capabilities', {});
  assert.equal(capabilities.schemaVersion, 'agent-capabilities-v1');
  assert.equal(capabilities.roles.length, 2);
  assert.throws(
    () => service.callTool('read_guideline', { id: '../policy' }),
    /invalid tool arguments/,
  );
  assert.throws(
    () => service.callTool('read_guideline', { id: 'missing-policy' }),
    /guideline id not found/,
  );
  assert.throws(
    () => service.callTool('list_guidelines', { path: '/etc/passwd' }),
    /invalid tool arguments/,
  );
  assert.throws(() => service.callTool('unknown_tool', {}), /tool not found/);

  const handler = createProtocolHandler(service);
  assert.equal(
    handler({ jsonrpc: '2.0', id: 0, method: 'tools/list', params: {} }).error
      .code,
    -32002,
  );
  const unsupported = initialize(handler, '2099-01-01');
  assert.equal(unsupported.result.protocolVersion, '2025-11-25');
  const initialized = initialize(handler);
  assert.equal(initialized.result.serverInfo.name, 'quiz-governance');
  assert.equal(initialized.result.protocolVersion, '2025-11-25');
  assert.match(initialized.result.instructions, /Read-only governance server/);
  assert.equal(
    handler({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {},
    }),
    undefined,
  );
  assert.deepEqual(
    handler({ jsonrpc: '2.0', id: 2, method: 'ping', params: {} }).result,
    {},
  );
  assert.equal(
    handler({ jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} }).result
      .tools.length,
    3,
  );
  assert.equal(
    handler({
      jsonrpc: '2.0',
      id: 31,
      method: 'tools/list',
      params: { cursor: null, _meta: { progressToken: 0 } },
    }).result.tools.length,
    3,
  );
  assert.equal(
    handler({
      jsonrpc: '2.0',
      id: 32,
      method: 'tools/list',
      params: { cursor: 'unexpected-page' },
    }).error.code,
    -32602,
  );
  const call = handler({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'read_guideline',
      arguments: { id: 'test-policy' },
      _meta: { progressToken: 1 },
    },
  });
  assert.equal(call.result.isError, false);
  assert.equal(call.result.structuredContent.content, policyContent);
  assert.equal(
    handler({
      jsonrpc: '2.0',
      id: 41,
      method: 'tools/call',
      params: { name: 'list_guidelines' },
    }).result.structuredContent.guidelines.length,
    1,
  );
  assert.equal(
    handler({
      jsonrpc: '2.0',
      id: 42,
      method: 'tools/call',
      params: { name: 'list_guidelines', arguments: null },
    }).error.code,
    -32602,
  );
  assert.equal(
    handler({
      jsonrpc: '2.0',
      id: 43,
      method: 'tools/call',
      params: { name: 'unknown_tool', arguments: {} },
    }).error.code,
    -32602,
  );
  assert.equal(
    handler({ jsonrpc: '2.0', id: 5, method: 'prompts/list', params: {} }).error
      .code,
    -32601,
  );
  const badCall = handler({
    jsonrpc: '2.0',
    id: 6,
    method: 'tools/call',
    params: {
      name: 'read_guideline',
      arguments: { id: 'test-policy', path: '/etc/passwd' },
    },
  });
  assert.equal(badCall.result.isError, true);
  assert.equal(badCall.result.content[0].text, 'invalid tool arguments');
});

withFixture(({ root }) => {
  const handler = createProtocolHandler(createService({ rootDirectory: root }));
  assert.equal(
    handler({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'notification', version: '1.0.0' },
      },
    }),
    undefined,
  );
  assert.equal(
    handler({ jsonrpc: '2.0', id: 9, method: 'tools/list', params: {} }).error
      .code,
    -32002,
  );
  assert.equal(
    handler({
      jsonrpc: '2.0',
      id: { invalid: true },
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'invalid-id', version: '1.0.0' },
      },
    }).error.code,
    -32600,
  );
  assert.equal(
    handler({
      jsonrpc: '1.0',
      id: { invalid: true },
      method: 'initialize',
      params: {},
    }).id,
    null,
  );
  assert.equal(
    handler({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-11-25' },
    }).error.code,
    -32602,
  );
});

withFixture(({ policyPath, root }) => {
  writeText(policyPath, '# Tampered policy\n');
  assert.throws(
    () => createService({ rootDirectory: root }).validate(),
    /hash SHA-256 diverge/,
  );
});

withFixture(({ policyPath, root }) => {
  fs.rmSync(policyPath);
  assert.throws(() => createService({ rootDirectory: root }).validate());
});

withFixture(({ policyPath, root }) => {
  const target = path.join(root, 'docs', 'specs', 'target.md');
  writeText(target, '# Symlink target\n');
  fs.rmSync(policyPath);
  fs.symlinkSync(target, policyPath);
  assert.throws(
    () => createService({ rootDirectory: root }).validate(),
    /symlink/,
  );
});

withFixture(({ root }) => {
  execFileSync('git', ['rm', '--cached', '--quiet', 'docs/specs/policy.md'], {
    cwd: root,
  });
  assert.throws(() => createService({ rootDirectory: root }).validate());
});

withFixture(({ root }) => {
  const wildcardPath = path.join(root, 'docs', 'specs', '*.md');
  const wildcardContent = '# Untracked literal wildcard\n';
  writeText(wildcardPath, wildcardContent);
  const catalogPath = path.join(root, 'config', 'governance-guidelines.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  catalog.guidelines[0].sourcePath = 'docs/specs/*.md';
  catalog.guidelines[0].sha256 = sha256(wildcardContent);
  writeJson(catalogPath, catalog);
  assert.throws(
    () => createService({ rootDirectory: root }).validate(),
    /sourcePath nao esta versionado no Git/,
  );
});

withFixture(({ root }) => {
  const modelPath = path.join(root, 'config', 'agent-capabilities.json');
  const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  model.roles[0].capabilities = ['missing-capability'];
  writeJson(modelPath, model);
  assert.throws(
    () => createService({ rootDirectory: root }).validate(),
    /agent capability model is invalid/,
  );
});

withFixture(({ root }) => {
  const wildcardPath = path.join(root, 'docs', 'agents', '*.md');
  writeText(wildcardPath, '# Untracked literal wildcard\n');
  const modelPath = path.join(root, 'config', 'agent-capabilities.json');
  const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  model.roles[0].contractPaths = ['docs/agents/*.md'];
  writeJson(modelPath, model);
  assert.throws(
    () => createService({ rootDirectory: root }).validate(),
    /agent capability model is invalid/,
  );
});

const fingerprintBefore = repositoryFingerprint();
const protocol = runProtocol(
  [
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'integration-test', version: '1.0.0' },
      },
    },
    { jsonrpc: '2.0', method: 'notifications/initialized', params: {} },
    { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'read_guideline',
        arguments: { id: 'agent-capability-model' },
      },
    },
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: { name: 'read_agent_capabilities', arguments: {} },
    },
    { jsonrpc: '2.0', id: 5, method: 'ping', params: {} },
  ]
    .map((message) => JSON.stringify(message))
    .join('\n') + '\n',
);
assert.equal(protocol.status, 0, protocol.stderr);
assert.equal(protocol.stderr, '');
const responses = protocol.stdout
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line));
assert.deepEqual(
  responses.map((response) => response.id),
  [1, 2, 3, 4, 5],
);
assert.equal(responses[1].result.tools.length, 3);
assert.equal(responses[2].result.isError, false);
assert.equal(
  responses[3].result.structuredContent.schemaVersion,
  'agent-capabilities-v1',
);
assert.deepEqual(repositoryFingerprint(), fingerprintBefore);

const malformed = runProtocol('{not-json}\n');
assert.equal(malformed.status, 0, malformed.stderr);
assert.equal(JSON.parse(malformed.stdout).error.code, -32700);

const oversized = runProtocol(`${'x'.repeat(MAX_MESSAGE_BYTES + 1)}\n`);
assert.equal(oversized.status, 1);
assert.equal(JSON.parse(oversized.stdout).error.message, 'Message too large');

const serverSource = fs.readFileSync(SERVER, 'utf8');
['node:http', 'node:https', 'node:net', 'node:dns'].forEach((moduleName) => {
  assert.doesNotMatch(serverSource, new RegExp(`require\\(['"]${moduleName}`));
});
assert.doesNotMatch(
  serverSource,
  /fs\.(?:appendFile|mkdir|rm|unlink|writeFile|createWriteStream)/,
);

process.stdout.write('governance-mcp-server: ok\n');
