const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, validateCapabilityModel } = require('./agent-capabilities.cjs');
const {
  buildBundle,
  validateCatalogStructure,
} = require('./governance-guidelines.cjs');

const SERVER_NAME = 'quiz-governance';
const SERVER_VERSION = '1.0.0';
const MAX_MESSAGE_BYTES = 1024 * 1024;
const SUPPORTED_PROTOCOL_VERSIONS = new Set(['2025-11-25', '2025-06-18']);
const CATALOG_PATH = 'config/governance-guidelines.json';
const CAPABILITY_MODEL_PATH = 'config/agent-capabilities.json';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMPTY_INPUT_SCHEMA = Object.freeze({
  type: 'object',
  properties: {},
  additionalProperties: false,
});

const GUIDELINE_SCHEMA = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'version',
    'status',
    'type',
    'owner',
    'sourcePath',
    'sha256',
    'appliesTo',
    'enforcement',
    'evidence',
  ],
  properties: {
    id: { type: 'string' },
    version: { type: 'string' },
    status: { type: 'string' },
    type: { type: 'string' },
    owner: { type: 'string' },
    sourcePath: { type: 'string' },
    sha256: { type: 'string' },
    appliesTo: { type: 'array', items: { type: 'string' } },
    enforcement: { type: 'string' },
    evidence: { type: 'array', items: { type: 'string' } },
    metrics: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'definition', 'target', 'source'],
        properties: {
          id: { type: 'string' },
          definition: { type: 'string' },
          target: { type: 'string' },
          source: { type: 'string' },
        },
      },
    },
    replaces: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'version'],
        properties: {
          id: { type: 'string' },
          version: { type: 'string' },
        },
      },
    },
  },
});

const AGENT_CAPABILITY_MODEL_SCHEMA = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'capabilities', 'roles', 'separationRules'],
  properties: {
    schemaVersion: { type: 'string' },
    capabilities: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'artifactType', 'operation', 'repositoryEffect'],
        properties: {
          id: { type: 'string' },
          artifactType: { type: 'string' },
          operation: { type: 'string' },
          repositoryEffect: { type: 'string' },
        },
      },
    },
    roles: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'status', 'capabilities', 'contractPaths'],
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          capabilities: { type: 'array', items: { type: 'string' } },
          contractPaths: { type: 'array', items: { type: 'string' } },
          adapter: {
            type: 'object',
            additionalProperties: false,
            required: [
              'configPath',
              'agentName',
              'model',
              'reasoningEffort',
              'sandboxMode',
              'mcpPolicy',
            ],
            properties: {
              configPath: { type: 'string' },
              agentName: { type: 'string' },
              model: { type: 'string' },
              reasoningEffort: { type: 'string' },
              sandboxMode: { type: 'string' },
              mcpPolicy: { type: 'string' },
            },
          },
        },
      },
    },
    separationRules: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'artifactType',
          'producerCapability',
          'checkerCapability',
          'enforcement',
          'requiresDistinctActor',
        ],
        properties: {
          id: { type: 'string' },
          artifactType: { type: 'string' },
          producerCapability: { type: 'string' },
          checkerCapability: { type: 'string' },
          enforcement: { type: 'string' },
          requiresDistinctActor: { type: 'boolean' },
        },
      },
    },
  },
});

const READ_ONLY_ANNOTATIONS = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});

const TOOLS = Object.freeze([
  {
    name: 'list_guidelines',
    title: 'List governance guidelines',
    description:
      'List validated governance metadata without reproducing normative text.',
    inputSchema: EMPTY_INPUT_SCHEMA,
    outputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['schemaVersion', 'guidelines'],
      properties: {
        schemaVersion: { type: 'string' },
        guidelines: { type: 'array', items: GUIDELINE_SCHEMA },
      },
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'read_guideline',
    title: 'Read a governance guideline',
    description:
      'Read one catalogued normative document by ID after verifying its SHA-256 hash.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['id'],
      properties: {
        id: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
      },
    },
    outputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['guideline', 'content'],
      properties: {
        guideline: GUIDELINE_SCHEMA,
        content: { type: 'string' },
      },
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'read_agent_capabilities',
    title: 'Read agent capabilities',
    description:
      'Read the validated central model of agent roles, capabilities, and separation rules.',
    inputSchema: EMPTY_INPUT_SCHEMA,
    outputSchema: AGENT_CAPABILITY_MODEL_SCHEMA,
    annotations: READ_ONLY_ANNOTATIONS,
  },
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value, allowed) {
  return (
    isPlainObject(value) &&
    Object.keys(value).every((key) => allowed.includes(key))
  );
}

function hasValidListParams(value) {
  return (
    value === undefined ||
    (hasOnlyKeys(value, ['cursor', '_meta']) &&
      (value.cursor === undefined || value.cursor === null) &&
      (value._meta === undefined || isPlainObject(value._meta)))
  );
}

function hasValidEmptyParams(value) {
  return (
    value === undefined ||
    (hasOnlyKeys(value, ['_meta']) &&
      (value._meta === undefined || isPlainObject(value._meta)))
  );
}

function hasSymlinkComponent(rootDirectory, relativePath) {
  let current = rootDirectory;
  for (const segment of relativePath.split('/')) {
    current = path.join(current, segment);
    if (fs.lstatSync(current).isSymbolicLink()) return true;
  }
  return false;
}

function readTrustedFile(rootDirectory, relativePath, requireTracked) {
  const absolutePath = path.resolve(rootDirectory, ...relativePath.split('/'));
  const relative = path.relative(rootDirectory, absolutePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('trusted source path escaped repository');
  }
  if (hasSymlinkComponent(rootDirectory, relativePath)) {
    throw new Error('trusted source contains symlink');
  }
  let descriptor;
  try {
    descriptor = fs.openSync(
      absolutePath,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
    );
    if (!fs.fstatSync(descriptor).isFile()) {
      throw new Error('trusted source is not a regular file');
    }
    if (requireTracked) {
      execFileSync('git', ['ls-files', '--error-unmatch', '--', relativePath], {
        cwd: rootDirectory,
        stdio: 'ignore',
      });
    }
    return fs.readFileSync(descriptor, 'utf8');
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function readTrustedJson(rootDirectory, relativePath, requireTracked) {
  return JSON.parse(
    readTrustedFile(rootDirectory, relativePath, requireTracked),
  );
}

function loadValidatedSources(options = {}) {
  const rootDirectory = path.resolve(options.rootDirectory || ROOT);
  const requireTracked = options.requireTracked !== false;
  const catalog = readTrustedJson(rootDirectory, CATALOG_PATH, requireTracked);
  const structureErrors = validateCatalogStructure(catalog);
  if (structureErrors.length) throw new Error('governance catalog is invalid');
  const bundle = buildBundle(catalog, { rootDirectory, requireTracked });

  const capabilityModel = readTrustedJson(
    rootDirectory,
    CAPABILITY_MODEL_PATH,
    requireTracked,
  );
  const capabilityErrors = validateCapabilityModel(capabilityModel, {
    rootDirectory,
    requireTracked,
  });
  if (capabilityErrors.length) {
    throw new Error('agent capability model is invalid');
  }
  return { bundle, capabilityModel };
}

function createService(options = {}) {
  return {
    validate() {
      const sources = loadValidatedSources(options);
      return {
        guidelineCount: sources.bundle.catalog.guidelines.length,
        capabilityCount: sources.capabilityModel.capabilities.length,
      };
    },
    callTool(name, args) {
      if (!isPlainObject(args)) throw new Error('invalid tool arguments');
      if (!TOOLS.some((tool) => tool.name === name)) {
        throw new Error('tool not found');
      }
      if (name === 'list_guidelines') {
        if (!hasOnlyKeys(args, [])) throw new Error('invalid tool arguments');
        const sources = loadValidatedSources(options);
        return sources.bundle.catalog;
      }
      if (name === 'read_guideline') {
        if (
          !hasOnlyKeys(args, ['id']) ||
          typeof args.id !== 'string' ||
          !SLUG.test(args.id)
        ) {
          throw new Error('invalid tool arguments');
        }
        const sources = loadValidatedSources(options);
        const guideline = sources.bundle.catalog.guidelines.find(
          (candidate) => candidate.id === args.id,
        );
        if (!guideline) throw new Error('guideline id not found');
        const document = sources.bundle.documents.find(
          (candidate) => candidate.sourcePath === guideline.sourcePath,
        );
        if (!document) throw new Error('guideline document not found');
        return { guideline, content: document.content };
      }
      if (name === 'read_agent_capabilities') {
        if (!hasOnlyKeys(args, [])) throw new Error('invalid tool arguments');
        const sources = loadValidatedSources(options);
        return sources.capabilityModel;
      }
    },
  };
}

function success(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function failure(id, code, message) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

function toolResult(value) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value) }],
    structuredContent: value,
    isError: false,
  };
}

function toolFailure(message) {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

function createProtocolHandler(service = createService()) {
  let initialized = false;
  return function handle(message) {
    if (!isPlainObject(message) || message.jsonrpc !== '2.0') {
      return failure(message?.id, -32600, 'Invalid Request');
    }
    const isNotification = message.id === undefined;
    if (typeof message.method !== 'string') {
      return isNotification
        ? undefined
        : failure(message.id, -32600, 'Invalid Request');
    }
    if (message.method === 'notifications/initialized') {
      return undefined;
    }
    if (message.method === 'initialize') {
      if (isNotification || !isPlainObject(message.params)) {
        return failure(message.id, -32602, 'Invalid params');
      }
      const protocolVersion = message.params.protocolVersion;
      if (!SUPPORTED_PROTOCOL_VERSIONS.has(protocolVersion)) {
        return failure(message.id, -32602, 'Unsupported protocol version');
      }
      try {
        service.validate();
      } catch {
        return failure(message.id, -32603, 'Governance sources are invalid');
      }
      initialized = true;
      return success(message.id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        instructions:
          'Read-only governance server. Use list_guidelines before read_guideline. Returned documents remain the normative sources and are verified against the versioned catalog. No tool may write files, use the network, operate Git/GitHub, or replace human approval.',
      });
    }
    if (isNotification) return undefined;
    if (!initialized) {
      return failure(message.id, -32002, 'Server not initialized');
    }
    if (message.method === 'ping') {
      if (!hasValidEmptyParams(message.params)) {
        return failure(message.id, -32602, 'Invalid params');
      }
      return success(message.id, {});
    }
    if (message.method === 'tools/list') {
      if (!hasValidListParams(message.params)) {
        return failure(message.id, -32602, 'Invalid params');
      }
      return success(message.id, { tools: TOOLS });
    }
    if (message.method === 'tools/call') {
      const toolArguments = message.params?.arguments ?? {};
      if (
        !hasOnlyKeys(message.params, ['name', 'arguments', '_meta']) ||
        typeof message.params.name !== 'string' ||
        !isPlainObject(toolArguments) ||
        (message.params._meta !== undefined &&
          !isPlainObject(message.params._meta))
      ) {
        return failure(message.id, -32602, 'Invalid params');
      }
      try {
        return success(
          message.id,
          toolResult(service.callTool(message.params.name, toolArguments)),
        );
      } catch (error) {
        const safeMessage = [
          'invalid tool arguments',
          'guideline id not found',
          'tool not found',
        ].includes(error.message)
          ? error.message
          : 'governance source validation failed';
        return success(message.id, toolFailure(safeMessage));
      }
    }
    return failure(message.id, -32601, 'Method not found');
  };
}

function runStdio(service = createService()) {
  const handle = createProtocolHandler(service);
  let buffer = '';
  let stopped = false;
  const send = (message) => {
    process.stdout.write(`${JSON.stringify(message)}\n`);
  };
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    if (stopped) return;
    buffer += chunk;
    let newline = buffer.indexOf('\n');
    while (newline >= 0) {
      const line = buffer.slice(0, newline).replace(/\r$/, '');
      buffer = buffer.slice(newline + 1);
      if (line.trim()) {
        if (Buffer.byteLength(line, 'utf8') > MAX_MESSAGE_BYTES) {
          stopped = true;
          send(failure(null, -32600, 'Message too large'));
          process.stdin.destroy();
          process.exitCode = 1;
          return;
        }
        let message;
        try {
          message = JSON.parse(line);
        } catch {
          send(failure(null, -32700, 'Parse error'));
          newline = buffer.indexOf('\n');
          continue;
        }
        const response = handle(message);
        if (response) send(response);
      }
      newline = buffer.indexOf('\n');
    }
    if (Buffer.byteLength(buffer, 'utf8') > MAX_MESSAGE_BYTES) {
      stopped = true;
      send(failure(null, -32600, 'Message too large'));
      process.stdin.destroy();
      process.exitCode = 1;
    }
  });
  process.stdin.on('end', () => {
    if (!stopped && buffer.trim()) send(failure(null, -32700, 'Parse error'));
  });
}

function main(args = process.argv.slice(2)) {
  if (args.length === 1 && args[0] === '--validate') {
    const result = createService().validate();
    process.stdout.write(
      `governance-mcp: ok (${result.guidelineCount} guidelines, ${result.capabilityCount} capabilities)\n`,
    );
    return;
  }
  if (args.length) throw new Error('use --validate or no arguments');
  runStdio();
}

if (require.main === module) {
  try {
    main();
  } catch {
    process.stderr.write('governance-mcp: validation failed\n');
    process.exitCode = 1;
  }
}

module.exports = {
  MAX_MESSAGE_BYTES,
  SERVER_NAME,
  SERVER_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS,
  TOOLS,
  createProtocolHandler,
  createService,
  loadValidatedSources,
  main,
  runStdio,
};
