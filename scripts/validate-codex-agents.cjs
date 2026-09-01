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
  const commonInputFields = [
    'workItemId',
    'contentSetId',
    'subjectId',
    'topicId',
    'grade',
    'authorizedObjective',
    'manifestState',
    'humanFreezeApproval',
    'requestedPass',
    'sourceStatus',
  ];
  const outputFields = [
    'agent',
    'workItemId',
    'contentSetId',
    'subjectId',
    'topicId',
    'reviewPass',
    'decision',
    'facts',
    'doubts',
    'findings',
    'recommendations',
    'humanApprovalRequired',
  ];
  const findingFields = [
    'questionId',
    'criterion',
    'severity',
    'evidence',
    'recommendation',
  ];
  const proposalFields = [
    'questionId',
    'prompt',
    'options',
    'correctIndex',
    'explanation',
    'incorrectFeedback',
  ];
  const approvalFields = ['approvedBy', 'approvedAt', 'evidenceRef'];

  function unexpectedKeys(value, allowedFields, pathName) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    Object.keys(value)
      .filter((field) => !allowedFields.includes(field))
      .forEach((field) => {
        errors.push(
          `[${scenarioId}] campo nao autorizado: ${pathName}.${field}`,
        );
      });
  }

  function isFilledText(value) {
    return typeof value === 'string' && Boolean(value.trim());
  }

  function isFilledTextList(value, expectedLength) {
    return (
      Array.isArray(value) &&
      (expectedLength === undefined || value.length === expectedLength) &&
      value.every(isFilledText)
    );
  }

  function validateProposal(proposal, pathName, required) {
    if (!proposal && !required) return true;
    unexpectedKeys(proposal, proposalFields, pathName);
    const valid =
      proposal &&
      isFilledText(proposal.questionId) &&
      isFilledText(proposal.prompt) &&
      isFilledTextList(proposal.options, 4) &&
      Number.isInteger(proposal.correctIndex) &&
      proposal.correctIndex >= 0 &&
      proposal.correctIndex < 4 &&
      isFilledText(proposal.explanation) &&
      isFilledTextList(proposal.incorrectFeedback, 3);
    if (!valid) errors.push(`[${scenarioId}] ${pathName} incompleta`);
    return valid;
  }

  if (!scenario?.scenarioId) errors.push('[cenario-sem-id] scenarioId ausente');
  unexpectedKeys(
    scenario,
    ['scenarioId', 'inputState', 'input', 'output'],
    'scenario',
  );
  const allowedInputFields =
    output.agent === 'pedagogical_quality'
      ? [...commonInputFields, 'proposal']
      : commonInputFields;
  const allowedOutputFields =
    output.agent === 'content_curator'
      ? [...outputFields, 'proposal']
      : outputFields;
  unexpectedKeys(input, allowedInputFields, 'input');
  unexpectedKeys(output, allowedOutputFields, 'output');
  unexpectedKeys(
    input.humanFreezeApproval,
    approvalFields,
    'input.humanFreezeApproval',
  );

  const requiredInputStrings = commonInputFields.filter(
    (field) => field !== 'humanFreezeApproval',
  );
  const missingInputFields = requiredInputStrings.filter(
    (field) => !isFilledText(input[field]),
  );
  const inputProposalValid = validateProposal(
    input.proposal,
    'input.proposal',
    output.agent === 'pedagogical_quality',
  );
  const outputProposalRequired =
    output.agent === 'content_curator' && output.decision !== 'blocked';
  validateProposal(output.proposal, 'output.proposal', outputProposalRequired);
  const approval = input.humanFreezeApproval;
  const approvalValid =
    approval &&
    isFilledText(approval.approvedBy) &&
    /^\d{4}-\d{2}-\d{2}$/.test(approval.approvedAt) &&
    isFilledText(approval.evidenceRef);
  if (!approvalValid) {
    errors.push(`[${scenarioId}] aprovacao do congelamento incompleta`);
  }

  const preflightComplete =
    missingInputFields.length === 0 &&
    input.manifestState === 'frozen' &&
    approvalValid &&
    inputProposalValid;
  const derivedInputState = !preflightComplete
    ? 'incomplete'
    : input.sourceStatus === 'ambiguous'
      ? 'ambiguous'
      : 'complete';

  if (!['authorized', 'ambiguous'].includes(input.sourceStatus)) {
    errors.push(`[${scenarioId}] input.sourceStatus invalido`);
  }
  if (scenario?.inputState !== derivedInputState) {
    errors.push(`[${scenarioId}] inputState invalido`);
  }

  outputFields.slice(0, 7).forEach((field) => {
    if (!isFilledText(output[field])) {
      errors.push(`[${scenarioId}] output.${field} deve ser texto preenchido`);
    }
  });

  ['workItemId', 'contentSetId', 'subjectId', 'topicId'].forEach((field) => {
    if (input[field] && output[field] !== input[field]) {
      errors.push(`[${scenarioId}] output.${field} diverge da entrada`);
    }
  });

  ['facts', 'doubts', 'recommendations'].forEach((field) => {
    if (!isFilledTextList(output[field])) {
      errors.push(`[${scenarioId}] output.${field} deve ser lista de textos`);
    }
  });
  ['findings'].forEach((field) => {
    if (!Array.isArray(output[field])) {
      errors.push(`[${scenarioId}] output.${field} deve ser lista`);
    }
  });

  const allowedPasses = EDITORIAL_PASSES[output.agent];
  if (!allowedPasses) {
    errors.push(`[${scenarioId}] agente editorial invalido: ${output.agent}`);
  } else {
    if (!allowedPasses.includes(output.reviewPass)) {
      errors.push(
        `[${scenarioId}] reviewPass ${output.reviewPass} invalido para ${output.agent}`,
      );
    }
    if (!allowedPasses.includes(input.requestedPass)) {
      errors.push(
        `[${scenarioId}] requestedPass ${input.requestedPass} invalido para ${output.agent}`,
      );
    }
    if (input.requestedPass !== output.reviewPass) {
      errors.push(`[${scenarioId}] reviewPass diverge da passagem solicitada`);
    }
  }

  if (!EDITORIAL_DECISIONS.includes(output.decision)) {
    errors.push(`[${scenarioId}] decisao invalida: ${output.decision}`);
  }
  if (output.humanApprovalRequired !== true) {
    errors.push(`[${scenarioId}] aprovacao humana deve permanecer obrigatoria`);
  }
  const findings = Array.isArray(output.findings) ? output.findings : [];
  const doubts = Array.isArray(output.doubts) ? output.doubts : [];
  const blockingFindings = findings.filter(
    (finding) => finding?.severity === 'blocking',
  );

  if (derivedInputState !== 'complete' && output.decision !== 'blocked') {
    errors.push(`[${scenarioId}] contexto incompleto ou ambiguo deve bloquear`);
  }
  if (
    output.decision === 'approved' &&
    (doubts.length > 0 || findings.length > 0)
  ) {
    errors.push(`[${scenarioId}] aprovacao nao pode conter duvida ou achado`);
  }
  if (
    output.decision === 'adjustments_required' &&
    (findings.length === 0 || blockingFindings.length > 0)
  ) {
    errors.push(
      `[${scenarioId}] ajustes exigem achado nao bloqueante e contexto completo`,
    );
  }
  if (
    output.decision === 'blocked' &&
    blockingFindings.length === 0 &&
    !(derivedInputState !== 'complete' && doubts.length > 0)
  ) {
    errors.push(
      `[${scenarioId}] bloqueio exige contexto invalido com duvida ou achado blocking`,
    );
  }

  if (findings.length) {
    const reviewedProposal =
      output.agent === 'pedagogical_quality' ? input.proposal : output.proposal;
    findings.forEach((finding, index) => {
      unexpectedKeys(finding, findingFields, `output.findings[${index}]`);
      findingFields.forEach((field) => {
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
      if (
        !reviewedProposal?.questionId ||
        finding?.questionId !== reviewedProposal.questionId
      ) {
        errors.push(
          `[${scenarioId}] findings[${index}].questionId diverge da proposta`,
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
