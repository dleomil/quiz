const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const {
  packageHash,
  digest,
  reviewProjection,
  requirementsFor,
} = require('./content-delivery.cjs');
const { sha256 } = require('./governance-guidelines.cjs');
const {
  buildContext,
  renderContext,
  pinnedConfig,
} = require('./agent-context.cjs');
const {
  environment,
  isolationArguments,
  preflight,
  validateProfile,
  skillArguments,
} = require('./agent-auth.cjs');
const { makeReceipt, usageFromEvents } = require('./agent-run-receipt.cjs');
const {
  AGENT_CONTRACTS,
  parseAgentToml,
  validateEditorialInputDocument,
  validateEditorialScenario,
} = require('./validate-codex-agents.cjs');

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
const FLAGS = [
  '--agent',
  '--input',
  '--output',
  '--work',
  '--auth-home',
  '--codex-bin',
  '--test-comment',
  '--delivery-package',
];

function argumentsFrom(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    if (
      !FLAGS.includes(name) ||
      values[name] ||
      !argv[index + 1] ||
      argv[index + 1].startsWith('--')
    )
      throw new Error('argumento desconhecido, duplicado ou sem valor');
    values[name] = argv[index + 1];
  }
  if (values['--test-comment'] && !values['--codex-bin'])
    throw new Error('fixture de aceite exige binario de teste');
  return values;
}
function loadAgentConfig(agent) {
  const name = AGENT_FILES[agent];
  if (!name) throw new Error('agente editorial nao autorizado');
  const expected = AGENT_CONTRACTS[name];
  const source = fs.readFileSync(
    path.join(ROOT, '.codex', 'agents', name),
    'utf8',
  );
  const config = parseAgentToml(source);
  if (
    ['name', 'model', 'model_reasoning_effort'].some(
      (key) => config[key] !== expected[key],
    ) ||
    config.sandbox_mode !== 'read-only' ||
    !config.developer_instructions
  )
    throw new Error('adaptador editorial invalido');
  return { ...config, sha256: sha256(source) };
}
function buildMcpArguments() {
  return ['mcp', 'list', '--json'];
}
function buildExecArguments(config, message, workspace, sessionHome, authHome) {
  return [
    'exec',
    '--strict-config',
    '--ignore-user-config',
    '--ignore-rules',
    '--ephemeral',
    '--json',
    '--model',
    config.model,
    '--config',
    `model_reasoning_effort=${JSON.stringify(config.model_reasoning_effort)}`,
    ...isolationArguments(sessionHome),
    ...skillArguments(authHome),
    '--sandbox',
    'read-only',
    '--skip-git-repo-check',
    '--output-schema',
    path.join(workspace, 'output.schema.json'),
    '--output-last-message',
    message,
    '--cd',
    workspace,
    '-',
  ];
}

function run() {
  let args;
  let sessionHome;
  let workspace;
  let lock;
  let receiptPath;
  let receipt;
  const started = Date.now();
  const runId = crypto.randomUUID();
  let resultState = 'preflight-blocked';
  let context;
  let workSha256 = null;
  let configuration;
  let checks;
  let usage = null;
  let artifactSha256 = null;
  let failureReason = null;
  try {
    args = argumentsFrom(process.argv.slice(2));
    const config = loadAgentConfig(args['--agent']);
    for (const key of ['--input', '--output', '--work', '--auth-home'])
      if (!args[key]) throw new Error(`use ${key}`);
    receiptPath = `${path.resolve(args['--output'])}.receipt.json`;
    if (
      fs.existsSync(path.resolve(args['--output'])) ||
      fs.existsSync(receiptPath)
    )
      throw new Error(
        'saida ou recibo ja existe; preserve a execucao anterior',
      );
    receipt = {
      runId,
      actor: args['--agent'],
      requestedModel: config.model,
      reasoningEffort: config.model_reasoning_effort,
      startedAt: new Date(started).toISOString(),
      testOnly: Boolean(args['--codex-bin']),
      adapterSha256: config.sha256,
      inputSha256: null,
    };
    const document = JSON.parse(
      fs.readFileSync(path.resolve(args['--input']), 'utf8'),
    );
    receipt.inputSha256 = digest(document);
    const inputErrors = validateEditorialInputDocument(
      document,
      args['--agent'],
    );
    if (inputErrors.length) throw new Error(inputErrors.join('; '));
    const work = JSON.parse(
      fs.readFileSync(path.resolve(args['--work']), 'utf8'),
    );
    workSha256 = digest(work);
    if (
      work.id !== document.input.workItemId ||
      work.role !== args['--agent'].replaceAll('_', '-') ||
      work.subjectId !== document.input.subjectId ||
      work.curriculumCycle !==
        `${document.input.academicYear}-${document.input.term}`
    )
      throw new Error('ficha diverge da entrada editorial');
    context = buildContext(
      work,
      args['--test-comment']
        ? {
            readComment: () =>
              JSON.parse(fs.readFileSync(args['--test-comment'], 'utf8')),
          }
        : {},
    );
    if (work.allowedPaths.length || work.commands.length)
      throw new Error('ficha editorial nao pode autorizar escrita ou comandos');
    const pinnedAdapter = pinnedConfig(
      ROOT,
      `.codex/agents/${AGENT_FILES[args['--agent']]}`,
      work.baseCommit,
    );
    if (sha256(pinnedAdapter) !== config.sha256)
      throw new Error('adaptador mudou durante o preflight');
    let packageSha256;
    if (args['--delivery-package']) {
      const { questions } = JSON.parse(
        fs.readFileSync(path.resolve(args['--delivery-package']), 'utf8'),
      );
      const proposal = questions.find(
        (item) => item.id === document.input.proposal?.id,
      );
      if (
        args['--agent'] !== 'pedagogical_quality' ||
        !proposal ||
        digest(reviewProjection(proposal)) !== digest(document.input.proposal)
      )
        throw new Error('proposta diverge do pacote editorial');
      packageSha256 = packageHash(questions);
    }
    const authHome = validateProfile(args['--auth-home']);
    lock = path.join(authHome, 'quiz-run.lock');
    try {
      fs.mkdirSync(lock, { mode: 0o700 });
    } catch {
      lock = undefined;
      throw new Error('perfil em uso; execucao concorrente bloqueada');
    }
    sessionHome = fs.mkdtempSync(
      path.join(os.tmpdir(), 'quiz-editorial-home-'),
    );
    workspace = fs.mkdtempSync(
      path.join(os.tmpdir(), 'quiz-editorial-workspace-'),
    );
    const bin = args['--codex-bin'] || 'codex';
    checks = preflight(bin, authHome, sessionHome, workspace, config.model);
    const schema = pinnedConfig(
      ROOT,
      path.relative(ROOT, OUTPUT_SCHEMA),
      work.baseCommit,
    );
    fs.writeFileSync(path.join(workspace, 'output.schema.json'), schema);
    const message = path.join(sessionHome, 'output.json');
    const deliveryPolicyPath = 'config/content-delivery-policy.json';
    const deliveryPolicy = pinnedConfig(
      ROOT,
      deliveryPolicyPath,
      work.baseCommit,
    );
    const prompt = [
      `Atue exclusivamente como ${args['--agent']}.`,
      'Nao use ferramentas; retorne apenas o JSON do schema. Nao publique ou altere o projeto.',
      `Instrucoes do adaptador:\n${config.developer_instructions}`,
      renderContext(context),
      `Ficha delimitada:\n${JSON.stringify(work)}`,
      `Requisitos especificos da materia:\n${JSON.stringify(requirementsFor(document.input.subjectId, JSON.parse(deliveryPolicy)))}`,
      'Confira idioma, instrucao em portugues, lacunas e resposta revelada. Registre fatos e achados especificos.',
      `Entrada autorizada:\n${JSON.stringify(document)}`,
    ].join('\n\n');
    const argv = buildExecArguments(
      config,
      message,
      workspace,
      sessionHome,
      authHome,
    );
    configuration = digest({
      argv: argv.map((value) =>
        value
          .replaceAll(workspace, '<workspace>')
          .replaceAll(sessionHome, '<session-home>'),
      ),
      adapterSha256: config.sha256,
      schemaSha256: sha256(schema),
      deliveryPolicySha256: sha256(deliveryPolicy),
      checks,
    });
    resultState = 'execution-failed';
    const result = spawnSync(bin, argv, {
      cwd: workspace,
      env: environment(authHome, sessionHome),
      input: prompt,
      encoding: 'utf8',
      timeout: 300000,
      maxBuffer: 16 * 1024 * 1024,
    });
    if (result.status !== 0 || result.error)
      throw new Error(
        'execucao falhou ou excedeu cinco minutos; sem nova tentativa automatica',
      );
    resultState = 'output-rejected';
    usage = usageFromEvents(result.stdout || '');
    validateProfile(authHome);
    const output = JSON.parse(fs.readFileSync(message, 'utf8'));
    const scenario = {
      scenarioId: document.scenarioId,
      inputState: document.inputState,
      input: document.input,
      output,
    };
    const errors = validateEditorialScenario(scenario);
    if (errors.length) throw new Error(`saida rejeitada: ${errors.join('; ')}`);
    if (packageSha256)
      scenario.execution = {
        kind: 'isolated-editorial',
        runId,
        packageSha256,
        proposalSha256: digest(document.input.proposal),
        agent: args['--agent'],
        pass: document.input.requestedPass,
        completedAt: new Date().toISOString(),
        testOnly: Boolean(args['--codex-bin']),
      };
    const outputText = `${JSON.stringify(scenario, null, 2)}\n`;
    fs.mkdirSync(path.dirname(path.resolve(args['--output'])), {
      recursive: true,
    });
    fs.writeFileSync(path.resolve(args['--output']), outputText, {
      flag: 'wx',
    });
    artifactSha256 = sha256(outputText);
    resultState = 'completed';
    process.stdout.write(
      `editorial-agent-runner: output gravado em ${args['--output']}\n`,
    );
  } catch (error) {
    failureReason =
      error instanceof SyntaxError
        ? 'JSON invalido na entrada ou saida'
        : error.message;
    process.stderr.write(`editorial-agent-runner: ${error.message}\n`);
    process.exitCode = 1;
  } finally {
    try {
      if (receipt && receiptPath) {
        const value = makeReceipt({
          ...receipt,
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - started,
          result: resultState,
          failureReason,
          contextSha256: context?.sha256 || null,
          workSha256,
          configurationSha256: configuration || null,
          approvals: context?.approvals || [],
          preflight: checks || null,
          artifactSha256,
          usage,
        });
        fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
        fs.writeFileSync(receiptPath, `${JSON.stringify(value, null, 2)}\n`, {
          flag: 'wx',
        });
      }
    } catch {
      process.stderr.write(
        'editorial-agent-runner: recibo nao gravado; resultado nao pode ser aceito\n',
      );
      process.exitCode = 1;
    } finally {
      for (const directory of [sessionHome, workspace, lock])
        if (directory) fs.rmSync(directory, { recursive: true, force: true });
    }
  }
}
if (require.main === module) run();
module.exports = { argumentsFrom, buildExecArguments, buildMcpArguments, run };
