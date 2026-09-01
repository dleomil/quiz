const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
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

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function fail(message) {
  process.stderr.write(`editorial-agent-runner: ${message}\n`);
  process.exitCode = 1;
}

function run() {
  const agent = argument('--agent');
  const inputPath = argument('--input');
  const outputPath = argument('--output');
  const codexBin = argument('--codex-bin') || 'codex';
  if (!ALLOWED_AGENTS.has(agent))
    return fail('agente editorial nao autorizado');
  if (!inputPath || !outputPath) return fail('use --input e --output');

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
  const tempMessage = path.join(tempHome, 'agent-output.json');
  const env = { ...process.env, CODEX_HOME: tempHome };
  const cleanup = () => fs.rmSync(tempHome, { recursive: true, force: true });
  try {
    const mcpCheck = spawnSync(codexBin, ['mcp', 'list', '--json'], {
      cwd: ROOT,
      env,
      encoding: 'utf8',
    });
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
      `Entrada autorizada:\n${JSON.stringify(document)}`,
    ].join('\n\n');
    const result = spawnSync(
      codexBin,
      [
        'exec',
        '--ephemeral',
        '--ignore-user-config',
        '--sandbox',
        'read-only',
        '--ask-for-approval',
        'never',
        '--output-schema',
        OUTPUT_SCHEMA,
        '--output-last-message',
        tempMessage,
        '-C',
        ROOT,
        prompt,
      ],
      { cwd: ROOT, env, encoding: 'utf8' },
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
