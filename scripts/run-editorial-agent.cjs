const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  AGENT_CONTRACTS,
  parseAgentToml,
  validateEditorialInputDocument,
  validateEditorialScenario,
} = require('./validate-codex-agents.cjs');

const ALLOWED_AGENTS = new Set(['content_curator', 'pedagogical_quality']);
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_SCHEMA = path.join(
  ROOT,
  'config',
  'editorial-agent-output.schema.json',
);
const AGENT_FILES = {
  content_curator: 'content-curator.toml',
  pedagogical_quality: 'pedagogical-quality.toml',
};
const ALLOWED_ENVIRONMENT = [
  'PATH',
  'TMPDIR',
  'LANG',
  'LC_ALL',
  'TERM',
  'NO_COLOR',
  'OPENAI_API_KEY',
];

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function fail(message) {
  process.stderr.write(`editorial-agent-runner: ${message}\n`);
  process.exitCode = 1;
}

function loadAgentConfig(agent) {
  const fileName = AGENT_FILES[agent];
  const contract = AGENT_CONTRACTS[`${fileName}`];
  const filePath = path.join(ROOT, '.codex', 'agents', fileName);
  if (!contract || !fs.existsSync(filePath)) {
    throw new Error('adaptador editorial ausente');
  }
  const values = parseAgentToml(fs.readFileSync(filePath, 'utf8'));
  for (const field of ['name', 'model', 'model_reasoning_effort']) {
    if (values[field] !== contract[field]) {
      throw new Error(`adaptador editorial invalido: ${field}`);
    }
  }
  if (values.sandbox_mode !== 'read-only' || !values.developer_instructions) {
    throw new Error('adaptador editorial invalido: sandbox ou instrucoes');
  }
  return values;
}

function isolatedEnvironment(tempHome) {
  const environment = { CODEX_HOME: tempHome, HOME: tempHome };
  ALLOWED_ENVIRONMENT.forEach((name) => {
    if (process.env[name]) environment[name] = process.env[name];
  });
  return environment;
}

function run() {
  const agent = argument('--agent');
  const inputPath = argument('--input');
  const outputPath = argument('--output');
  const codexBin = argument('--codex-bin') || 'codex';
  if (!ALLOWED_AGENTS.has(agent))
    return fail('agente editorial nao autorizado');
  if (!inputPath || !outputPath) return fail('use --input e --output');

  let agentConfig;
  try {
    agentConfig = loadAgentConfig(agent);
  } catch (error) {
    return fail(error.message);
  }

  let document;
  try {
    document = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  } catch (error) {
    return fail(`entrada invalida: ${error.message}`);
  }
  const inputErrors = validateEditorialInputDocument(document, agent);
  if (inputErrors.length) return fail(inputErrors.join('; '));
  if (!['complete', 'ambiguous', 'incomplete'].includes(document.inputState)) {
    return fail('inputState invalido');
  }

  const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-codex-home-'));
  const tempWorkspace = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-editorial-workspace-'),
  );
  const tempMessage = path.join(tempHome, 'agent-output.json');
  const env = isolatedEnvironment(tempHome);
  const cleanup = () => {
    fs.rmSync(tempHome, { recursive: true, force: true });
    fs.rmSync(tempWorkspace, { recursive: true, force: true });
  };
  try {
    if (!env.OPENAI_API_KEY) return fail('OPENAI_API_KEY nao configurada');
    const mcpCheck = spawnSync(
      codexBin,
      ['--ignore-user-config', 'mcp', 'list', '--json'],
      {
        cwd: tempWorkspace,
        env,
        encoding: 'utf8',
      },
    );
    if (mcpCheck.status !== 0) return fail('preflight MCP falhou');
    let configuredServers;
    try {
      configuredServers = JSON.parse(mcpCheck.stdout || '[]');
    } catch {
      return fail('preflight MCP retornou JSON invalido');
    }
    if (!Array.isArray(configuredServers) || configuredServers.length > 0) {
      return fail('execucao bloqueada: MCP ou connector configurado');
    }

    const prompt = [
      `Atue exclusivamente como ${agent}.`,
      'Nao use ferramentas externas, MCP, connector, navegador, Git ou GitHub.',
      'Retorne somente um objeto JSON conforme o schema de saida fornecido.',
      'Nao publique, edite ou execute qualquer alteracao no projeto.',
      'A sessao deve permanecer somente leitura e sem acesso a fontes locais.',
      `Instrucoes versionadas do agente:\n${agentConfig.developer_instructions}`,
      `Entrada autorizada:\n${JSON.stringify(document)}`,
    ].join('\n\n');
    const result = spawnSync(
      codexBin,
      [
        '--ignore-user-config',
        '--ephemeral',
        '--model',
        agentConfig.model,
        '--config',
        `model_reasoning_effort=${JSON.stringify(agentConfig.model_reasoning_effort)}`,
        'exec',
        '--sandbox',
        'read-only',
        '--skip-git-repo-check',
        '--output-schema',
        OUTPUT_SCHEMA,
        '--output-last-message',
        tempMessage,
        '--cd',
        tempWorkspace,
        prompt,
      ],
      { cwd: tempWorkspace, env, encoding: 'utf8' },
    );
    if (result.status !== 0) return fail('execucao do agente falhou');
    let output;
    try {
      output = JSON.parse(fs.readFileSync(tempMessage, 'utf8'));
    } catch (error) {
      return fail(`saida invalida: ${error.message}`);
    }
    const scenario = {
      scenarioId: document.scenarioId,
      inputState: document.inputState,
      input: document.input,
      output,
    };
    const errors = validateEditorialScenario(scenario);
    if (errors.length) return fail(`saida rejeitada: ${errors.join('; ')}`);
    fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
    fs.writeFileSync(
      path.resolve(outputPath),
      `${JSON.stringify(scenario, null, 2)}\n`,
    );
    process.stdout.write(
      `editorial-agent-runner: output gravado em ${outputPath}\n`,
    );
  } finally {
    cleanup();
  }
}

if (require.main === module) run();

module.exports = { run };
