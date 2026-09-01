const fs = require('node:fs');
const path = require('node:path');

const AGENT_CONTRACTS = {
  'content-curator.toml': {
    name: 'content_curator',
    model: 'gpt-5.6-sol',
    model_reasoning_effort: 'high',
    requiredReferences: [
      'docs/agents/content-curator-agent.md',
      'docs/harness/content-update-quality-gates.md',
      'docs/specs/editorial-agent-output-contract.md',
    ],
  },
  'pedagogical-quality.toml': {
    name: 'pedagogical_quality',
    model: 'gpt-5.6-sol',
    model_reasoning_effort: 'high',
    requiredReferences: [
      'docs/agents/pedagogical-quality-agent.md',
      'docs/harness/content-update-quality-gates.md',
      'docs/specs/editorial-agent-output-contract.md',
    ],
  },
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

const EDITORIAL_DECISIONS = ['approved', 'adjustments_required', 'blocked'];
const EDITORIAL_PASSES = {
  content_curator: ['curation'],
  pedagogical_quality: ['pedagogical', 'linguistic'],
};
const FINDING_SEVERITIES = ['blocking', 'major', 'minor'];

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

function validateEditorialScenario(scenario) {
  const errors = [];
  const scenarioId = scenario?.scenarioId || 'cenario-sem-id';
  const input = scenario?.input || {};
  const output = scenario?.output || {};
  const requiredInputStrings = [
    'workItemId',
    'contentSetId',
    'subjectId',
    'topicId',
    'grade',
    'authorizedObjective',
    'sourceState',
  ];
  const requiredStrings = [
    'agent',
    'workItemId',
    'contentSetId',
    'subjectId',
    'topicId',
    'reviewPass',
    'decision',
  ];

  if (!scenario?.scenarioId) errors.push('[cenario-sem-id] scenarioId ausente');
  const missingInputFields = requiredInputStrings.filter(
    (field) => typeof input[field] !== 'string' || !input[field].trim(),
  );
  const derivedInputState = missingInputFields.length
    ? 'incomplete'
    : input.sourceState === 'ambiguous'
      ? 'ambiguous'
      : 'complete';

  if (!['authorized', 'ambiguous'].includes(input.sourceState)) {
    errors.push(`[${scenarioId}] input.sourceState invalido`);
  }
  if (scenario?.inputState !== derivedInputState) {
    errors.push(`[${scenarioId}] inputState invalido`);
  }

  requiredStrings.forEach((field) => {
    if (typeof output[field] !== 'string' || !output[field].trim()) {
      errors.push(`[${scenarioId}] output.${field} deve ser texto preenchido`);
    }
  });

  ['workItemId', 'contentSetId', 'subjectId', 'topicId'].forEach((field) => {
    if (input[field] && output[field] !== input[field]) {
      errors.push(`[${scenarioId}] output.${field} diverge da entrada`);
    }
  });

  ['facts', 'doubts', 'findings', 'recommendations'].forEach((field) => {
    if (!Array.isArray(output[field])) {
      errors.push(`[${scenarioId}] output.${field} deve ser lista`);
    }
  });

  const allowedPasses = EDITORIAL_PASSES[output.agent];
  if (!allowedPasses) {
    errors.push(`[${scenarioId}] agente editorial invalido: ${output.agent}`);
  } else if (!allowedPasses.includes(output.reviewPass)) {
    errors.push(
      `[${scenarioId}] reviewPass ${output.reviewPass} invalido para ${output.agent}`,
    );
  }

  if (!EDITORIAL_DECISIONS.includes(output.decision)) {
    errors.push(`[${scenarioId}] decisao invalida: ${output.decision}`);
  }
  if (output.humanApprovalRequired !== true) {
    errors.push(`[${scenarioId}] aprovacao humana deve permanecer obrigatoria`);
  }
  if (scenario?.inputState !== 'complete' && output.decision === 'approved') {
    errors.push(
      `[${scenarioId}] contexto incompleto ou ambiguo nao pode aprovar`,
    );
  }
  if (
    output.decision === 'adjustments_required' &&
    (!Array.isArray(output.findings) || output.findings.length === 0)
  ) {
    errors.push(`[${scenarioId}] ajustes exigem ao menos um achado`);
  }
  if (
    output.decision === 'blocked' &&
    (!Array.isArray(output.doubts) || output.doubts.length === 0) &&
    (!Array.isArray(output.findings) || output.findings.length === 0)
  ) {
    errors.push(`[${scenarioId}] bloqueio exige duvida ou achado`);
  }

  if (Array.isArray(output.findings)) {
    output.findings.forEach((finding, index) => {
      [
        'questionId',
        'criterion',
        'severity',
        'evidence',
        'recommendation',
      ].forEach((field) => {
        if (typeof finding?.[field] !== 'string' || !finding[field].trim()) {
          errors.push(
            `[${scenarioId}] findings[${index}].${field} deve ser texto preenchido`,
          );
        }
      });
      if (!FINDING_SEVERITIES.includes(finding?.severity)) {
        errors.push(
          `[${scenarioId}] findings[${index}].severity invalida: ${finding?.severity}`,
        );
      }
    });
  }

  SECRET_PATTERNS.forEach((pattern) => {
    if (pattern.test(JSON.stringify(scenario))) {
      errors.push(`[${scenarioId}] possivel segredo detectado`);
    }
  });

  return errors;
}

function validateEditorialScenarios(scenarios) {
  if (!Array.isArray(scenarios)) return ['cenarios editoriais devem ser lista'];

  const errors = scenarios.flatMap(validateEditorialScenario);
  const ids = scenarios.map((scenario) => scenario?.scenarioId).filter(Boolean);
  if (new Set(ids).size !== ids.length) {
    errors.push('scenarioId editorial duplicado');
  }

  EDITORIAL_DECISIONS.forEach((decision) => {
    if (
      !scenarios.some((scenario) => scenario?.output?.decision === decision)
    ) {
      errors.push(`cenario editorial ausente para decisao ${decision}`);
    }
  });

  return errors;
}

function validateRepositoryAgents(rootDirectory) {
  const errors = validateAgentDirectory(
    path.join(rootDirectory, '.codex', 'agents'),
  );
  const scenariosPath = path.join(
    rootDirectory,
    'tests',
    'fixtures',
    'agents',
    'editorial-scenarios.json',
  );

  try {
    errors.push(
      ...validateEditorialScenarios(
        JSON.parse(fs.readFileSync(scenariosPath, 'utf8')),
      ),
    );
  } catch (error) {
    errors.push(`falha ao ler cenarios editoriais: ${error.message}`);
  }

  return errors;
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
  validateEditorialScenario,
  validateEditorialScenarios,
  validateRepositoryAgents,
};
