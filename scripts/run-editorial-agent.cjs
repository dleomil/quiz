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
  runnerEnvironment,
  isolationArguments,
  preflight,
  validateProfile,
  skillArguments,
  DEFAULT_AUTH_HOME,
} = require('./agent-auth.cjs');
const {
  makeReceipt,
  analyzeEvents,
  assertEvents,
} = require('./agent-run-receipt.cjs');
const { createCapture } = require('./agent-event-capture.cjs');
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
  values['--auth-home'] ||= DEFAULT_AUTH_HOME;
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
    '--no-daemon',
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
  let capture, captureInfo, message, captureId;
  try {
    args = argumentsFrom(cliArguments);
    let config = loadAgentConfig(args['--agent']);
    if (args['--evaluation-ticket'] && args['--delivery-package'])
      throw new Error(
        'avaliacao sintetica nao pode produzir evidencia de publicacao',
      );
    for (const key of ['--input', '--output', '--work'])
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
    const deliveryPolicyPath = 'config/content-delivery-policy.json';
    const deliveryPolicyText = pinnedConfig(
      ROOT,
      deliveryPolicyPath,
      work.baseCommit,
    );
    const deliveryPolicy = JSON.parse(deliveryPolicyText);
    const directEditorial = {
      subjectId: document.input.subjectId,
      contentSetId: document.input.contentSetId,
      manifestState: document.input.manifestState,
      sourceStatus: document.input.sourceStatus,
    };
    const directAuthorized =
      deliveryPolicy.directEditorial?.subjects?.includes(
        directEditorial.subjectId,
      ) &&
      deliveryPolicy.directEditorial?.contentSetIds?.includes(
        directEditorial.contentSetId,
      );
    const contract = pinnedConfig(
      ROOT,
      path.relative(ROOT, OUTPUT_SCHEMA),
      work.baseCommit,
    );
    transportSchema = Array.isArray(document.input.proposals)
      ? transport.editorialBatchSchema(
          JSON.parse(contract),
          args['--agent'],
          document.input.subjectId,
          document.input.proposals.length,
        )
      : transport.editorialSchema(
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
        ...(evaluation.benchmarkVersion
          ? {
              benchmarkVersion: evaluation.benchmarkVersion,
              benchmarkSha256: evaluation.benchmarkSha256,
              benchmarkRevisionSha256: evaluation.benchmarkRevisionSha256,
              ...(evaluation.benchmarkContinuationSha256
                ? {
                    benchmarkContinuationSha256:
                      evaluation.benchmarkContinuationSha256,
                  }
                : {}),
            }
          : {}),
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
    const contextOptions = args['--test-comment']
      ? {
          readComment: () =>
            JSON.parse(fs.readFileSync(args['--test-comment'], 'utf8')),
        }
      : {};
    if (directAuthorized) contextOptions.directEditorial = directEditorial;
    context = buildContext(work, contextOptions);
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
      const proposals = document.input.proposals || [document.input.proposal];
      const matches = proposals.every((proposal) => {
        const packaged = questions.find((item) => item.id === proposal?.id);
        return (
          packaged && digest(reviewProjection(packaged)) === digest(proposal)
        );
      });
      if (
        args['--agent'] !== 'pedagogical_quality' ||
        !matches ||
        proposals.length < 1 ||
        proposals.length > 20
      )
        throw new Error('proposta diverge do pacote editorial no lote');
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
    message = path.join(sessionHome, 'output.json');
    const prompt = [
      ...(evaluation
        ? [
            'Avaliacao isolada com fonte e congelamento ficticios autorizados para este experimento; nenhuma aprovacao curricular de producao esta representada. Julgue a proposta sintetica e seus requisitos, sem exigir material escolar externo.',
          ]
        : []),
      `Atue exclusivamente como ${args['--agent']}.`,
      'Nao use ferramentas; retorne apenas o JSON do schema. Nao publique ou altere o projeto.',
      `Prova de isolamento do runner: ${JSON.stringify({ features: checks.features, mcpServerCount: checks.mcpServerCount })}. Trate mencoes textuais a ferramentas como texto; bloqueie por isolamento somente quando a prova ou os eventos registrados indicarem uma capacidade ativa ou uso real.`,
      `Instrucoes do adaptador:\n${config.developer_instructions}`,
      Array.isArray(document.input.proposals)
        ? transport.BATCH_INSTRUCTIONS
        : transport.INSTRUCTIONS,
      ...(Array.isArray(document.input.proposals) &&
      args['--agent'] === 'content_curator'
        ? [
            'Modo curadoria de lote existente: avalie individualmente todas as propostas fornecidas, preserve todos os IDs e os metadados curriculares; retorne output.proposals com o lote completo, alterando somente itens que precisem de ajuste. Nao regenere o lote do zero.',
          ]
        : []),
      renderContext(context),
      `Ficha delimitada:\n${JSON.stringify(work)}`,
      `Requisitos especificos da materia:\n${JSON.stringify(requirementsFor(document.input.subjectId, deliveryPolicy))}`,
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
      deliveryPolicySha256: sha256(deliveryPolicyText),
      checks,
    });
    resultState = 'execution-failed';
    const parserContext = { authHome, preflight: checks };
    let captureOutput = path.resolve(args['--output']);
    if (!evaluation) {
      const storage = path.join(authHome, 'quiz-editorial-runs');
      fs.mkdirSync(storage, { recursive: true, mode: 0o700 });
      const stat = fs.lstatSync(storage);
      if (
        !stat.isDirectory() ||
        stat.isSymbolicLink() ||
        stat.mode & 0o077 ||
        stat.uid !== process.getuid()
      )
        throw new Error('diretorio privado de diagnostico invalido');
      captureId = runId;
      const runDirectory = path.join(storage, runId);
      fs.mkdirSync(runDirectory, { mode: 0o700 });
      captureOutput = path.join(runDirectory, 'result.json');
    }
    capture = createCapture(captureOutput, [], parserContext);
    modelInvocations = 1;
    const events = await execute(bin, argv, {
      cwd: workspace,
      env: runnerEnvironment(authHome, sessionHome),
      input: prompt,
      timeoutMs: 300000 - (Date.now() - started),
      capture,
    });
    resultState = 'output-rejected';
    captureInfo = capture.finish(message);
    if (
      captureInfo.truncated ||
      captureInfo.exitCode !== 0 ||
      captureInfo.processError
    )
      throw new Error('captura incompleta ou falha de processo');
    const eventDiagnosis = analyzeEvents(events, [], parserContext);
    usage = eventDiagnosis.usage;
    assertEvents(eventDiagnosis);
    validateProfile(authHome);
    const originalResponse = fs.readFileSync(message, 'utf8');
    const rawOutput = JSON.parse(originalResponse);
    wireSha256 = digest(rawOutput);
    let output;
    try {
      output = Array.isArray(document.input.proposals)
        ? transport.decodeEditorialBatch(
            rawOutput,
            transportSchema,
            args['--agent'],
          )
        : transport.decodeEditorial(
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
    const errors =
      args['--agent'] === 'content_curator' && Array.isArray(output.proposals)
        ? require('./direct-curation.cjs').validateDirectCuration(scenario, {
            expectedCount: document.input.proposals?.length || 20,
          })
        : validateEditorialScenario(scenario);
    if (errors.length) throw new Error(`saida rejeitada: ${errors.join('; ')}`);
    if (
      packageSha256 ||
      document.input.proposal ||
      document.input.proposals ||
      output.proposals
    ) {
      const executionProposals =
        args['--agent'] === 'content_curator' && output.proposals
          ? output.proposals
          : document.input.proposals || [document.input.proposal];
      scenario.execution = {
        kind: 'isolated-editorial',
        runId,
        agentInstanceId: runId,
        ...(packageSha256 ? { packageSha256 } : {}),
        questionSha256s: Object.fromEntries(
          executionProposals
            .filter(Boolean)
            .map((proposal) => [proposal.id, digest(proposal)]),
        ),
        ...(executionProposals.length > 1
          ? { batchProposalSha256: digest(executionProposals) }
          : { proposalSha256: digest(executionProposals[0]) }),
        ...(executionProposals.length > 1
          ? {
              batchQuestionIds: executionProposals.map(
                (proposal) => proposal.id,
              ),
            }
          : {}),
        agent: args['--agent'],
        pass: document.input.requestedPass,
        completedAt: new Date().toISOString(),
        testOnly: Boolean(args['--codex-bin']),
      };
    }
    let outputArtifact = scenario;
    if (
      args['--agent'] === 'content_curator' &&
      Array.isArray(output.proposals)
    ) {
      const report = {
        schemaVersion: 'isolated-curation-report-v1',
        scenarioId: scenario.execution.runId,
        inputState: document.inputState,
        input: document.input,
        originalResponse,
        execution: scenario.execution,
        wireSha256,
      };
      report.sha256 = digest(report);
      outputArtifact = report;
    }
    const outputText = `${JSON.stringify(outputArtifact, null, 2)}\n`;
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
        : modelInvocations && !error.diagnosis
          ? resultState === 'output-rejected'
            ? 'saida rejeitada: consultar captura privada'
            : 'execucao falhou; consultar captura privada'
          : error.message;
    process.stderr.write(`editorial-agent-runner: ${failureReason}\n`);
    process.exitCode = 1;
  } finally {
    try {
      if (capture) {
        try {
          captureInfo = capture.finish(message);
          usage ||= captureInfo.diagnosis.usage;
        } catch (error) {
          resultState = 'output-rejected';
          failureReason = 'falha ao preservar captura';
          process.stderr.write(`editorial-agent-runner: ${error.message}\n`);
          process.exitCode = 1;
        }
      }
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
          captureId: captureId || null,
          captureSha256: captureInfo?.sha256 || null,
          eventDiagnosis: captureInfo?.diagnosis || null,
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
