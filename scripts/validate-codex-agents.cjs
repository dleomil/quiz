const fs = require('node:fs');
const path = require('node:path');

const AGENT_CONTRACTS = {
  'product-discovery.toml': {
    name: 'product_discovery',
    model: 'gpt-5.6-sol',
    model_reasoning_effort: 'high',
    requiredReferences: [
      'docs/agents/product-discovery-agent.md',
      'docs/specs/product-discovery-agent.md',
    ],
  },
  'reviewer.toml': {
    name: 'reviewer',
    model: 'gpt-5.6-sol',
    model_reasoning_effort: 'high',
    requiredReferences: [
      'docs/agents/reviewer-agent.md',
      'docs/agents/reviewer-agent-workflow.md',
    ],
  },
  'verifier.toml': {
    name: 'verifier',
    model: 'gpt-5.6-terra',
    model_reasoning_effort: 'medium',
    requiredReferences: [
      'docs/agents/agent-operating-model.md',
      'docs/harness/',
    ],
  },
};

const REQUIRED_FIELDS = [
  'name',
  'description',
  'model',
  'model_reasoning_effort',
  'sandbox_mode',
  'developer_instructions',
];

const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{16,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{16,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:api[_-]?key|access[_-]?token|client[_-]?secret)\s*=\s*["'][^"']+["']/i,
];

function parseAgentToml(source) {
  const values = {};
  const multilinePattern = /^([A-Za-z0-9_]+)\s*=\s*"""([\s\S]*?)"""/gm;

  for (const match of source.matchAll(multilinePattern)) {
    values[match[1]] = match[2].trim();
  }

  const scalarPattern = /^([A-Za-z0-9_]+)\s*=\s*"([^"]*)"\s*$/gm;
  for (const match of source.matchAll(scalarPattern)) {
    values[match[1]] = match[2].trim();
  }

  return values;
}

function validateAgentSource(fileName, source, contract) {
  const errors = [];
  const values = parseAgentToml(source);

  REQUIRED_FIELDS.forEach((field) => {
    if (!values[field]) errors.push(`[${fileName}] campo ausente: ${field}`);
  });

  ['name', 'model', 'model_reasoning_effort'].forEach((field) => {
    if (values[field] && values[field] !== contract[field]) {
      errors.push(
        `[${fileName}] ${field} deve ser ${contract[field]}, recebido ${values[field]}`,
      );
    }
  });

  if (values.sandbox_mode && values.sandbox_mode !== 'read-only') {
    errors.push(`[${fileName}] sandbox_mode deve ser read-only`);
  }

  contract.requiredReferences.forEach((reference) => {
    if (!values.developer_instructions?.includes(reference)) {
      errors.push(`[${fileName}] instrucao deve referenciar ${reference}`);
    }
  });

  SECRET_PATTERNS.forEach((pattern) => {
    if (pattern.test(source)) {
      errors.push(`[${fileName}] possivel segredo detectado`);
    }
  });

  return errors;
}

function validateAgentDirectory(agentDirectory) {
  const errors = [];
  const expectedFiles = Object.keys(AGENT_CONTRACTS).sort();
  const actualFiles = fs
    .readdirSync(agentDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.toml'))
    .map((entry) => entry.name)
    .sort();

  actualFiles
    .filter((fileName) => !AGENT_CONTRACTS[fileName])
    .forEach((fileName) => {
      errors.push(`[${fileName}] agente nao declarado no contrato`);
    });

  expectedFiles.forEach((fileName) => {
    const filePath = path.join(agentDirectory, fileName);
    if (!fs.existsSync(filePath)) {
      errors.push(`[${fileName}] arquivo obrigatorio ausente`);
      return;
    }
    errors.push(
      ...validateAgentSource(
        fileName,
        fs.readFileSync(filePath, 'utf8'),
        AGENT_CONTRACTS[fileName],
      ),
    );
  });

  return errors;
}

function validateRepositoryAgents(rootDirectory) {
  return validateAgentDirectory(path.join(rootDirectory, '.codex', 'agents'));
}

if (require.main === module) {
  const errors = validateRepositoryAgents(path.join(__dirname, '..'));
  if (errors.length) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write('codex-agent-validation: ok\n');
  }
}

module.exports = {
  AGENT_CONTRACTS,
  parseAgentToml,
  validateAgentDirectory,
  validateAgentSource,
  validateRepositoryAgents,
};
