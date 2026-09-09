const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const MODEL_PATH = path.join(ROOT, 'config', 'agent-capabilities.json');
const SCHEMA_VERSION = 'agent-capabilities-v1';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const AGENT_NAME = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const OPERATIONS = new Set([
  'author',
  'review',
  'verify',
  'operate',
  'research',
]);
const EFFECTS = new Set(['read-only', 'workspace-write', 'external-write']);
const ROLE_STATUSES = new Set(['documented', 'executable']);
const REASONING_EFFORTS = new Set(['low', 'medium', 'high', 'xhigh']);

const TOP_KEYS = new Set([
  'schemaVersion',
  'capabilities',
  'roles',
  'separationRules',
]);
const CAPABILITY_KEYS = new Set([
  'id',
  'artifactType',
  'operation',
  'repositoryEffect',
]);
const ROLE_KEYS = new Set([
  'id',
  'status',
  'capabilities',
  'contractPaths',
  'adapter',
]);
const ADAPTER_KEYS = new Set([
  'configPath',
  'agentName',
  'model',
  'reasoningEffort',
  'sandboxMode',
  'mcpPolicy',
]);
const SEPARATION_KEYS = new Set([
  'id',
  'artifactType',
  'producerCapability',
  'checkerCapability',
  'enforcement',
  'requiresDistinctActor',
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function unknownKeys(value, allowed, label) {
  if (!isPlainObject(value)) return [`${label} deve ser objeto`];
  return Object.keys(value)
    .filter((key) => !allowed.has(key))
    .map((key) => `${label} possui campo desconhecido: ${key}`);
}

function validateSlug(value, label, errors) {
  if (!isText(value) || !SLUG.test(value))
    errors.push(`${label} deve ser slug`);
}

function validateUniqueTextList(value, label, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} deve ser lista nao vazia`);
    return;
  }
  value.forEach((item, index) => {
    if (!isText(item))
      errors.push(`${label}[${index}] deve ser texto nao vazio`);
  });
  if (new Set(value).size !== value.length)
    errors.push(`${label} possui duplicatas`);
}

function isSafeContractPath(contractPath) {
  if (!isText(contractPath) || contractPath.includes('\\')) return false;
  if (
    path.posix.isAbsolute(contractPath) ||
    path.win32.isAbsolute(contractPath)
  )
    return false;
  if (path.posix.normalize(contractPath) !== contractPath) return false;
  return (
    contractPath.endsWith('.md') &&
    ['docs/agents/', 'docs/harness/', 'docs/specs/'].some((root) =>
      contractPath.startsWith(root),
    )
  );
}

function isSafeAdapterPath(configPath) {
  return (
    isText(configPath) &&
    !configPath.includes('\\') &&
    path.posix.normalize(configPath) === configPath &&
    /^\.codex\/agents\/[a-z0-9]+(?:-[a-z0-9]+)*\.toml$/.test(configPath)
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

function validateContractFile(contractPath, options, label, errors) {
  if (!isSafeContractPath(contractPath)) {
    errors.push(`${label} deve ser caminho Markdown autorizado`);
    return;
  }
  const rootDirectory = path.resolve(options.rootDirectory || ROOT);
  const absolutePath = path.resolve(rootDirectory, ...contractPath.split('/'));
  try {
    if (hasSymlinkComponent(rootDirectory, contractPath)) {
      errors.push(`${label} nao pode conter symlink`);
      return;
    }
    if (!fs.lstatSync(absolutePath).isFile()) {
      errors.push(`${label} deve apontar para arquivo regular`);
      return;
    }
    if (options.requireTracked !== false) {
      try {
        execFileSync(
          'git',
          ['ls-files', '--error-unmatch', '--', contractPath],
          {
            cwd: rootDirectory,
            stdio: 'ignore',
          },
        );
      } catch {
        errors.push(`${label} nao esta versionado no Git`);
      }
    }
  } catch (error) {
    if (error && error.code === 'ENOENT') errors.push(`${label} esta ausente`);
    else errors.push(`${label} nao pode ser validado: ${error.message}`);
  }
}

function validateAdapter(adapter, label, errors) {
  errors.push(...unknownKeys(adapter, ADAPTER_KEYS, label));
  if (!isPlainObject(adapter)) return;
  if (!isSafeAdapterPath(adapter.configPath)) {
    errors.push(`${label}.configPath deve ficar em .codex/agents`);
  }
  if (!isText(adapter.agentName) || !AGENT_NAME.test(adapter.agentName)) {
    errors.push(`${label}.agentName invalido`);
  }
  if (!isText(adapter.model))
    errors.push(`${label}.model deve ser texto nao vazio`);
  if (!REASONING_EFFORTS.has(adapter.reasoningEffort)) {
    errors.push(`${label}.reasoningEffort invalido`);
  }
  if (adapter.sandboxMode !== 'read-only') {
    errors.push(`${label}.sandboxMode deve ser read-only`);
  }
  if (adapter.mcpPolicy !== 'none') {
    errors.push(`${label}.mcpPolicy deve ser none`);
  }
}

function validateCapabilityModel(model, options = {}) {
  const errors = unknownKeys(model, TOP_KEYS, 'modelo');
  if (!isPlainObject(model)) return errors;
  if (model.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion deve ser ${SCHEMA_VERSION}`);
  }
  if (!Array.isArray(model.capabilities) || model.capabilities.length === 0) {
    errors.push('capabilities deve ser lista nao vazia');
  }
  if (!Array.isArray(model.roles) || model.roles.length === 0) {
    errors.push('roles deve ser lista nao vazia');
  }
  if (
    !Array.isArray(model.separationRules) ||
    model.separationRules.length === 0
  ) {
    errors.push('separationRules deve ser lista nao vazia');
  }
  if (errors.length) return errors;

  const capabilityIds = new Set();
  const capabilityById = new Map();
  const capabilityTuples = new Set();
  model.capabilities.forEach((capability, index) => {
    const label = `capabilities[${index}]`;
    errors.push(...unknownKeys(capability, CAPABILITY_KEYS, label));
    if (!isPlainObject(capability)) return;
    validateSlug(capability.id, `${label}.id`, errors);
    validateSlug(capability.artifactType, `${label}.artifactType`, errors);
    if (!OPERATIONS.has(capability.operation))
      errors.push(`${label}.operation invalida`);
    if (!EFFECTS.has(capability.repositoryEffect)) {
      errors.push(`${label}.repositoryEffect invalido`);
    }
    if (capabilityIds.has(capability.id))
      errors.push(`${label}.id duplicado: ${capability.id}`);
    capabilityIds.add(capability.id);
    capabilityById.set(capability.id, capability);
    const tuple = `${capability.artifactType}:${capability.operation}`;
    if (capabilityTuples.has(tuple))
      errors.push(`${label} duplica operacao e artefato: ${tuple}`);
    capabilityTuples.add(tuple);
  });

  const roleIds = new Set();
  const configPaths = new Set();
  const agentNames = new Set();
  model.roles.forEach((role, index) => {
    const label = `roles[${index}]`;
    errors.push(...unknownKeys(role, ROLE_KEYS, label));
    if (!isPlainObject(role)) return;
    validateSlug(role.id, `${label}.id`, errors);
    if (roleIds.has(role.id)) errors.push(`${label}.id duplicado: ${role.id}`);
    roleIds.add(role.id);
    if (!ROLE_STATUSES.has(role.status))
      errors.push(`${label}.status invalido`);
    validateUniqueTextList(role.capabilities, `${label}.capabilities`, errors);
    if (Array.isArray(role.capabilities)) {
      role.capabilities.forEach((capabilityId) => {
        if (!capabilityIds.has(capabilityId)) {
          errors.push(
            `${label} referencia capability inexistente: ${capabilityId}`,
          );
        } else if (
          role.status === 'executable' &&
          capabilityById.get(capabilityId).repositoryEffect !== 'read-only'
        ) {
          errors.push(
            `${label} executavel exige capability read-only: ${capabilityId}`,
          );
        }
      });
    }
    validateUniqueTextList(
      role.contractPaths,
      `${label}.contractPaths`,
      errors,
    );
    if (Array.isArray(role.contractPaths)) {
      role.contractPaths.forEach((contractPath, contractIndex) => {
        validateContractFile(
          contractPath,
          options,
          `${label}.contractPaths[${contractIndex}]`,
          errors,
        );
      });
    }
    if (role.status === 'executable') {
      if (!role.adapter)
        errors.push(`${label}.adapter obrigatorio para papel executavel`);
      else {
        validateAdapter(role.adapter, `${label}.adapter`, errors);
        if (isPlainObject(role.adapter)) {
          if (configPaths.has(role.adapter.configPath)) {
            errors.push(
              `${label}.adapter.configPath duplicado: ${role.adapter.configPath}`,
            );
          }
          if (agentNames.has(role.adapter.agentName)) {
            errors.push(
              `${label}.adapter.agentName duplicado: ${role.adapter.agentName}`,
            );
          }
          configPaths.add(role.adapter.configPath);
          agentNames.add(role.adapter.agentName);
        }
      }
    } else if (role.adapter !== undefined) {
      errors.push(`${label}.adapter proibido para papel documentado`);
    }
  });

  const ruleIds = new Set();
  model.separationRules.forEach((rule, index) => {
    const label = `separationRules[${index}]`;
    errors.push(...unknownKeys(rule, SEPARATION_KEYS, label));
    if (!isPlainObject(rule)) return;
    validateSlug(rule.id, `${label}.id`, errors);
    validateSlug(rule.artifactType, `${label}.artifactType`, errors);
    if (ruleIds.has(rule.id)) errors.push(`${label}.id duplicado: ${rule.id}`);
    ruleIds.add(rule.id);
    const producer = capabilityById.get(rule.producerCapability);
    const checker = capabilityById.get(rule.checkerCapability);
    if (!producer) errors.push(`${label}.producerCapability inexistente`);
    if (!checker) errors.push(`${label}.checkerCapability inexistente`);
    if (producer && producer.operation !== 'author') {
      errors.push(`${label}.producerCapability deve possuir operacao author`);
    }
    if (checker && !['review', 'verify'].includes(checker.operation)) {
      errors.push(
        `${label}.checkerCapability deve possuir operacao review ou verify`,
      );
    }
    if (producer && producer.artifactType !== rule.artifactType) {
      errors.push(`${label}.artifactType diverge da capability produtora`);
    }
    if (checker && checker.artifactType !== rule.artifactType) {
      errors.push(`${label}.artifactType diverge da capability verificadora`);
    }
    if (rule.enforcement !== 'manual-blocking') {
      errors.push(`${label}.enforcement deve ser manual-blocking`);
    }
    if (rule.requiresDistinctActor !== true) {
      errors.push(`${label}.requiresDistinctActor deve ser true`);
    }
    if (rule.producerCapability === rule.checkerCapability) {
      errors.push(`${label} deve separar capabilities distintas`);
    }
    if (producer && checker) {
      model.roles.forEach((role) => {
        if (
          Array.isArray(role.capabilities) &&
          role.capabilities.includes(rule.producerCapability) &&
          role.capabilities.includes(rule.checkerCapability)
        ) {
          errors.push(
            `[${role.id}] acumula producao e verificacao proibidas por ${rule.id}`,
          );
        }
      });
    }
  });
  return errors;
}

function readModel(modelPath = MODEL_PATH) {
  let descriptor;
  try {
    descriptor = fs.openSync(
      modelPath,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
    );
    if (!fs.fstatSync(descriptor).isFile())
      throw new Error('modelo deve ser arquivo regular');
    return JSON.parse(fs.readFileSync(descriptor, 'utf8'));
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function loadCapabilityModel(rootDirectory = ROOT) {
  return readModel(
    path.join(rootDirectory, 'config', 'agent-capabilities.json'),
  );
}

function deriveAgentContracts(model) {
  return Object.fromEntries(
    model.roles
      .filter((role) => role.status === 'executable')
      .map((role) => [
        path.posix.basename(role.adapter.configPath),
        {
          name: role.adapter.agentName,
          model: role.adapter.model,
          model_reasoning_effort: role.adapter.reasoningEffort,
          requiredReferences: role.contractPaths,
          mcpPolicy: role.adapter.mcpPolicy,
        },
      ]),
  );
}

module.exports = {
  MODEL_PATH,
  ROOT,
  SCHEMA_VERSION,
  deriveAgentContracts,
  loadCapabilityModel,
  readModel,
  validateCapabilityModel,
};
