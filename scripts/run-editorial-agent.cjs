const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execute } = require('./agent-process.cjs');
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
const transport = require('./agent-output-transport.cjs');
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
  '--evaluation-ticket',
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

async function run(cliArguments = process.argv.slice(2)) {
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
  let evaluation;
  let modelInvocations = 0;
  let transportSchema, wireSha256;
  try {
    args = argumentsFrom(cliArguments);
    let config = loadAgentConfig(args['--agent']);
    if (args['--evaluation-ticket'] && args['--delivery-package'])
      throw new Error(
        'avaliacao sintetica nao pode produzir evidencia de publicacao',
      );
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
    const contract = pinnedConfig(
      ROOT,
      path.relative(ROOT, OUTPUT_SCHEMA),
      work.baseCommit,
    );
    transportSchema = transport.editorialSchema(
      JSON.parse(contract),
      args['--agent'],
      document.input.subjectId,
    );
    receipt.transportVersion = transport.VERSION;
    receipt.contractSchemaSha256 = sha256(contract);
    receipt.transportSchemaSha256 = digest(transportSchema);
    if (args['--evaluation-ticket']) {
      evaluation = require('./agent-evaluation.cjs').claim(
        args['--evaluation-ticket'],
        args['--auth-home'],
        work,
        receipt.inputSha256,
        Boolean(args['--codex-bin']),
      );
      if (!['editorial', 'curation'].includes(evaluation.slot.category))
        throw new Error('categoria nao pertence ao runner editorial');
      config = {
        ...config,
        model: evaluation.slot.model,
        model_reasoning_effort: evaluation.slot.effort,
      };
      receipt.requestedModel = config.model;
      receipt.reasoningEffort = config.model_reasoning_effort;
      receipt.evaluationOnly = true;
      receipt.evaluation = {
        slotId: evaluation.slot.id,
        ticketSha256: evaluation.sha256,
        repairOf: evaluation.slot.repairOf || null,
        replacementOf: evaluation.slot.replacementOf || null,
      };
    }
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
    fs.writeFileSync(
      path.join(workspace, 'output.schema.json'),
      JSON.stringify(transportSchema),
    );
    const message = path.join(sessionHome, 'output.json');
    const deliveryPolicyPath = 'config/content-delivery-policy.json';
    const deliveryPolicy = pinnedConfig(
      ROOT,
      deliveryPolicyPath,
      work.baseCommit,
    );
    const prompt = [
      ...(evaluation
        ? [
            'Avaliacao isolada com fonte e congelamento ficticios autorizados para este experimento; nenhuma aprovacao curricular de producao esta representada. Julgue a proposta sintetica e seus requisitos, sem exigir material escolar externo.',
          ]
        : []),
      `Atue exclusivamente como ${args['--agent']}.`,
      'Nao use ferramentas; retorne apenas o JSON do schema. Nao publique ou altere o projeto.',
      `Instrucoes do adaptador:\n${config.developer_instructions}`,
      transport.INSTRUCTIONS,
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
      transportSchemaSha256: digest(transportSchema),
      transportVersion: transport.VERSION,
      deliveryPolicySha256: sha256(deliveryPolicy),
      checks,
    });
    resultState = 'execution-failed';
    modelInvocations = 1;
    const events = await execute(bin, argv, {
      cwd: workspace,
      env: environment(authHome, sessionHome),
      input: prompt,
      timeoutMs: 300000 - (Date.now() - started),
    });
    resultState = 'output-rejected';
    usage = usageFromEvents(events);
    validateProfile(authHome);
    const rawOutput = JSON.parse(fs.readFileSync(message, 'utf8'));
    wireSha256 = digest(rawOutput);
    let output;
    try {
      output = transport.decodeEditorial(
        rawOutput,
        transportSchema,
        args['--agent'],
      );
    } catch (error) {
      throw new Error(`saida rejeitada: ${error.message}`, { cause: error });
    }
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
          modelInvocations,
          wireSha256: wireSha256 || null,
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
