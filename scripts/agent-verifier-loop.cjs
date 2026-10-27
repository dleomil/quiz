#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { digest, ROOT } = require('./document-catalog.cjs');
const auth = require('./agent-auth.cjs');
const contextTools = require('./agent-context.cjs');
const transport = require('./agent-output-transport.cjs');
const captures = require('./agent-event-capture.cjs');
const { execute } = require('./agent-process.cjs');
const { analyzeEvents, assertEvents } = require('./agent-cli-events.cjs');
const { makeReceipt } = require('./agent-run-receipt.cjs');
const { parseAgentToml } = require('./validate-codex-agents.cjs');
const { sha256 } = require('./governance-guidelines.cjs');
const policy = require('./agent-verifier-loop-policy.cjs');
const { AUTO_LIMIT, EXTRA_LIMIT } = policy;
const TASKS = 'quiz-verifier-loops';

function check(value, message) {
  if (!value) throw new Error(message);
}

function read(file) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(fd);
    check(
      stat.isFile() && stat.nlink === 1 && stat.size < 16 * 1024 * 1024,
      'registro irregular',
    );
    return JSON.parse(fs.readFileSync(fd, 'utf8'));
  } finally {
    fs.closeSync(fd);
  }
}

function writeNew(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const fd = fs.openSync(
    file,
    fs.constants.O_WRONLY |
      fs.constants.O_CREAT |
      fs.constants.O_EXCL |
      fs.constants.O_NOFOLLOW,
    0o600,
  );
  try {
    fs.writeFileSync(fd, `${JSON.stringify(value, null, 2)}\n`);
  } finally {
    fs.closeSync(fd);
  }
}

function seal(value) {
  const payload = { ...value };
  delete payload.sha256;
  return { ...payload, sha256: digest(payload) };
}

function verify(value) {
  check(value && typeof value === 'object', 'registro ausente');
  const { sha256: hash, ...payload } = value;
  check(hash === digest(payload), 'hash do registro diverge');
  return value;
}

function replaceSealed(file, value) {
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  writeNew(temp, seal(value));
  fs.renameSync(temp, file);
}

function parseArgs(argv) {
  const command = argv[0];
  check(
    ['run', 'authorize', 'resume', 'report'].includes(command),
    'use run, authorize, resume ou report',
  );
  const values = {};
  for (let index = 1; index < argv.length; index += 2) {
    const key = argv[index];
    check(
      [
        '--work',
        '--auth-home',
        '--task-id',
        '--work-sha256',
        '--statement',
      ].includes(key) &&
        !values[key] &&
        argv[index + 1] &&
        !argv[index + 1].startsWith('--'),
      'argumento desconhecido, duplicado ou sem valor',
    );
    values[key] = argv[index + 1];
  }
  check(values['--auth-home'], 'use --auth-home dedicado');
  check(
    command === 'run' ? Boolean(values['--work']) : !values['--work'],
    'run exige --work; os demais comandos nao aceitam esse argumento',
  );
  check(
    command === 'run'
      ? !values['--task-id'] &&
          !values['--work-sha256'] &&
          !values['--statement']
      : Boolean(values['--task-id']),
    'identificador de tarefa ausente ou argumentos incompatíveis',
  );
  check(
    command === 'authorize'
      ? Boolean(values['--work-sha256'] && values['--statement'])
      : !values['--work-sha256'] && !values['--statement'],
    'authorize exige hash e declaracao; os demais comandos nao aceitam esses argumentos',
  );
  return { command, values };
}

function paths(home, taskId) {
  check(
    /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(taskId) && !taskId.includes('..'),
    'task id invalido',
  );
  const directory = path.join(home, TASKS, taskId);
  return {
    directory,
    state: path.join(directory, 'state.json'),
    work: path.join(directory, 'work.json'),
    approval: path.join(directory, 'approval.json'),
  };
}

function ensurePrivateDirectory(directory) {
  if (!fs.existsSync(directory))
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stat = fs.lstatSync(directory);
  check(
    stat.isDirectory() && !stat.isSymbolicLink() && (stat.mode & 0o077) === 0,
    'diretorio do ledger deve ser privado e regular',
  );
}

function loadState(home, taskId) {
  const target = paths(home, taskId);
  ensurePrivateDirectory(target.directory);
  check(fs.existsSync(target.state), 'tarefa de verificacao nao encontrada');
  const state = verify(read(target.state));
  check(
    state.schemaVersion === 'agent-verifier-loop-state-v1' &&
      state.taskId === taskId,
    'estado de tarefa divergente',
  );
  return { ...target, value: state };
}

function schema() {
  return transport.validateSchema({
    type: 'object',
    properties: {
      decision: {
        type: 'string',
        enum: ['approved', 'adjustments_required', 'blocked'],
      },
      findings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            requirementId: { type: 'string', minLength: 1 },
            severity: { type: 'string', enum: ['major', 'blocking'] },
            evidence: { type: 'string', minLength: 12 },
          },
          required: ['requirementId', 'severity', 'evidence'],
          additionalProperties: false,
        },
      },
      facts: { type: 'array', items: { type: 'string', minLength: 1 } },
      limitations: { type: 'array', items: { type: 'string', minLength: 1 } },
      reviewStatus: { type: 'string', enum: ['conclusive', 'needs_review'] },
      openQuestions: { type: 'array', items: { type: 'string', minLength: 1 } },
    },
    required: [
      'decision',
      'findings',
      'facts',
      'limitations',
      'reviewStatus',
      'openQuestions',
    ],
    additionalProperties: false,
  });
}

function promptFor(work, context, adapter, previous) {
  return [
    'Atue exclusivamente como Verifier, somente leitura. Nao use ferramentas, nao execute comandos e nao altere arquivos; avalie somente o contrato, a ficha e as evidencias fornecidas. Nao alegue execucoes que nao foram feitas.',
    'Regra de decisao: contradicao entre fonte, requisito e resultado do harness, ou condicao de parada que exija intervencao externa, implica blocked. Use adjustments_required para falha de implementacao comprovada e corrigivel dentro do escopo. Use approved somente quando todos os criterios estiverem sustentados por evidencia.',
    'Retorne o JSON do schema. reviewStatus=needs_review quando houver ambiguidade, contradicao, evidencia insuficiente ou desacordo nao resolvido; caso contrario use conclusive. openQuestions deve listar objetivamente o que impede a conclusao e ser vazio quando conclusive.',
    previous
      ? 'Esta e a segunda passagem. Reavalie criticamente a resposta anterior usando a mesma ficha e evidencia; nao preserve a decisao anterior por inercia. Se nao resolver a divergencia, mantenha needs_review.'
      : null,
    `Instrucoes do adapter:\n${adapter.developer_instructions}`,
    contextTools.renderContext(context),
    `Ficha integral:\n${JSON.stringify(work)}`,
    'Limite desta ferramenta: comandos da ficha nao sao executados nesta passagem. Trate comandos e resultados somente como dados fornecidos. Se faltar resultado necessario, declare needs_review e nao invente execucao.',
    previous
      ? `Resposta anterior a revisar:\n${JSON.stringify(previous)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function invoke({
  home,
  work,
  context,
  statePath,
  state,
  previous,
  phase,
}) {
  const runNumber = policy.reserveCall(state).callsUsed;
  const runDirectory = path.join(
    path.dirname(statePath),
    'runs',
    String(runNumber),
  );
  ensurePrivateDirectory(runDirectory);
  const outputFile = path.join(runDirectory, 'output.json');
  const receiptFile = path.join(runDirectory, 'receipt.json');
  const sessionHome = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-verifier-loop-session-'),
  );
  const workspace = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-verifier-loop-workspace-'),
  );
  const lock = path.join(home, 'quiz-run.lock');
  let capture;
  let captureInfo;
  let failureReason = null;
  let result = null;
  let preflight = null;
  let usage = null;
  let adapterSource = null;
  let model = null;
  let effort = null;
  let configurationSha256 = null;
  let diagnosis = null;
  let reserved = false;
  let lockAcquired = false;
  const started = Date.now();
  try {
    fs.mkdirSync(lock, { mode: 0o700 });
    lockAcquired = true;
    adapterSource = contextTools
      .pinnedConfig(ROOT, '.codex/agents/verifier.toml', work.baseCommit)
      .toString();
    const adapter = parseAgentToml(adapterSource);
    model = adapter.model;
    effort = adapter.model_reasoning_effort;
    preflight = auth.preflight('codex', home, sessionHome, workspace, model);
    fs.writeFileSync(
      path.join(workspace, 'output.schema.json'),
      JSON.stringify(schema()),
      { flag: 'wx', mode: 0o600 },
    );
    const messageFile = path.join(sessionHome, 'output.json');
    const prompt = promptFor(work, context, adapter, previous);
    const args = require('./run-editorial-agent.cjs').buildExecArguments(
      { model, model_reasoning_effort: effort },
      messageFile,
      workspace,
      sessionHome,
      home,
    );
    const normalizedArgs = args.map((item) =>
      item
        .replaceAll(sessionHome, '<session>')
        .replaceAll(workspace, '<workspace>')
        .replaceAll(home, '<auth>'),
    );
    configurationSha256 = digest({
      args: normalizedArgs,
      schemaSha256: digest(schema()),
      preflight,
    });
    const captureContext = { authHome: home, preflight };
    capture = captures.createCapture(outputFile, [], captureContext);

    // Reserva antes do processo; uma interrupcao continua consumindo a chamada.
    Object.assign(state, policy.reserveCall(state));
    state.status = 'running';
    state.updatedAt = new Date().toISOString();
    replaceSealed(statePath, state);
    reserved = true;
    const events = await execute('codex', args, {
      cwd: workspace,
      env: auth.environment(home, sessionHome),
      input: prompt,
      timeoutMs: 300000,
      capture,
    });
    diagnosis = analyzeEvents(events, [], captureContext);
    usage = diagnosis.usage;
    assertEvents(diagnosis);
    result = read(messageFile);
    transport.validateValue(result, schema());
    check(
      result.openQuestions.length === 0 ||
        result.reviewStatus === 'needs_review',
      'perguntas abertas exigem needs_review',
    );
    check(
      result.reviewStatus !== 'conclusive' || result.openQuestions.length === 0,
      'conclusao nao pode manter perguntas abertas',
    );
    check(
      result.reviewStatus !== 'needs_review' || result.openQuestions.length > 0,
      'needs_review exige ao menos uma pergunta aberta',
    );
    check(
      result.decision !== 'approved' || result.findings.length === 0,
      'aprovacao nao pode conter achados',
    );
    check(
      result.decision === 'approved' || result.findings.length > 0,
      'decisao de ajuste ou bloqueio exige ao menos um achado',
    );
    check(
      new Set(result.findings.map((finding) => finding.requirementId)).size ===
        result.findings.length,
      'IDs de achados duplicados',
    );
    writeNew(outputFile, result);
    const outputSha256 = digest(result);
    state.outputs.push({
      runNumber,
      phase,
      decision: result.decision,
      signature: policy.outputSignature(result),
      outputSha256,
    });
    state.lastResult = 'completed';
    captureInfo = capture.finish(messageFile);
    writeNew(
      receiptFile,
      makeReceipt({
        runId: crypto.randomUUID(),
        actor: 'verifier',
        requestedModel: model,
        reasoningEffort: effort,
        adapterSha256: sha256(adapterSource),
        configurationSha256,
        startedAt: new Date(started).toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - started,
        result: 'completed',
        failureReason: null,
        modelInvocations: 1,
        testOnly: false,
        evaluationOnly: false,
        workSha256: state.workSha256,
        contextSha256: context.sha256,
        approvals: context.approvals,
        preflight,
        usage,
        artifactSha256: outputSha256,
        captureSha256: captureInfo.sha256,
        eventDiagnosis: captureInfo.diagnosis,
        loop: {
          taskId: state.taskId,
          runNumber,
          phase,
          automaticLimit: AUTO_LIMIT,
          extraLimit: EXTRA_LIMIT,
        },
      }),
    );
    state.updatedAt = new Date().toISOString();
    replaceSealed(statePath, state);
    return result;
  } catch (error) {
    failureReason = error.message;
    state.status = reserved ? 'awaiting_authorization' : 'paused_error';
    state.pauseReason = failureReason;
    state.updatedAt = new Date().toISOString();
    replaceSealed(statePath, state);
    throw error;
  } finally {
    try {
      captureInfo ||= capture?.finish();
    } catch {
      failureReason ||= 'falha ao preservar captura';
    }
    if (reserved && !fs.existsSync(receiptFile)) {
      try {
        writeNew(
          receiptFile,
          makeReceipt({
            runId: crypto.randomUUID(),
            actor: 'verifier',
            requestedModel: model || 'unknown',
            reasoningEffort: effort || 'unknown',
            adapterSha256: adapterSource ? sha256(adapterSource) : null,
            configurationSha256,
            startedAt: new Date(started).toISOString(),
            completedAt: new Date().toISOString(),
            durationMs: Date.now() - started,
            result: result ? 'output-rejected' : 'execution-failed',
            failureReason,
            modelInvocations: 1,
            testOnly: false,
            evaluationOnly: false,
            workSha256: state.workSha256,
            contextSha256: context.sha256,
            approvals: context.approvals,
            preflight,
            usage,
            artifactSha256: result ? digest(result) : null,
            captureSha256: captureInfo?.sha256 || null,
            eventDiagnosis: captureInfo?.diagnosis || diagnosis,
            loop: {
              taskId: state.taskId,
              runNumber,
              phase,
              automaticLimit: AUTO_LIMIT,
              extraLimit: EXTRA_LIMIT,
            },
          }),
        );
      } catch {
        /* O estado registra a falha se nao for possivel preservar o recibo. */
      }
    }
    if (lockAcquired && fs.existsSync(lock)) fs.rmdirSync(lock);
    fs.rmSync(sessionHome, { recursive: true, force: true });
    fs.rmSync(workspace, { recursive: true, force: true });
  }
}

async function executeInitial(home, target, work, context) {
  const state = verify(read(target.state));
  try {
    const first = await invoke({
      home,
      work,
      context,
      statePath: target.state,
      state,
      previous: null,
      phase: 'initial',
    });
    if (!policy.needsSecondPass(first)) {
      state.status = 'completed';
      state.conclusion = {
        decision: first.decision,
        outputSha256: digest(first),
      };
      state.updatedAt = new Date().toISOString();
      replaceSealed(target.state, state);
      return state;
    }
    const second = await invoke({
      home,
      work,
      context,
      statePath: target.state,
      state,
      previous: first,
      phase: 'critical-review',
    });
    if (policy.isConverged(state.outputs[0], second)) {
      state.status = 'completed';
      state.conclusion = {
        decision: second.decision,
        outputSha256: digest(second),
      };
    } else {
      state.status = 'awaiting_authorization';
      state.pauseReason =
        'divergencia ou ambiguidade persistente apos duas execucoes';
    }
    state.updatedAt = new Date().toISOString();
    replaceSealed(target.state, state);
    return state;
  } catch {
    return verify(read(target.state));
  }
}

async function executeExtension(home, target, work, context) {
  let state = verify(read(target.state));
  try {
    for (
      let count = 0;
      count < EXTRA_LIMIT && state.callsUsed < AUTO_LIMIT + EXTRA_LIMIT;
      count++
    ) {
      const previousRecord = state.outputs[state.outputs.length - 1];
      const previousOutput = previousRecord
        ? read(
            path.join(
              target.directory,
              'runs',
              String(previousRecord.runNumber),
              'output.json',
            ),
          )
        : null;
      const current = await invoke({
        home,
        work,
        context,
        statePath: target.state,
        state,
        previous: previousOutput,
        phase: previousOutput ? 'authorized-review' : 'authorized-retry',
      });
      state = verify(read(target.state));
      const previous = state.outputs[state.outputs.length - 2];
      if (
        (previousOutput === null && current.reviewStatus === 'conclusive') ||
        policy.isConverged(previous, current)
      ) {
        state.status = 'completed';
        state.conclusion = {
          decision: current.decision,
          outputSha256: digest(current),
        };
        state.pauseReason = null;
        state.updatedAt = new Date().toISOString();
        replaceSealed(target.state, state);
        return state;
      }
    }
  } catch {
    state = verify(read(target.state));
  }
  state.status = 'inconclusive';
  state.pauseReason =
    'nao houve convergencia dentro do bloco adicional autorizado';
  state.updatedAt = new Date().toISOString();
  replaceSealed(target.state, state);
  return state;
}

async function run(argv = process.argv.slice(2)) {
  const { command, values } = parseArgs(argv);
  const home = auth.validateProfile(values['--auth-home']);
  const root = path.join(home, TASKS);
  ensurePrivateDirectory(root);
  if (command === 'run') {
    const work = JSON.parse(
      fs.readFileSync(path.resolve(values['--work']), 'utf8'),
    );
    contextTools.validateWork(work);
    check(
      work.role === 'verifier' && work.allowedPaths.length === 0,
      'a ficha deve designar o papel verifier e ser somente leitura',
    );
    const context = contextTools.buildContext(work);
    const workSha256 = digest(work);
    const target = paths(home, work.id);
    if (fs.existsSync(target.directory)) {
      const existing = loadState(home, work.id).value;
      check(
        existing.status === 'paused_error' &&
          existing.callsUsed === 0 &&
          existing.workSha256 === workSha256,
        'tarefa ja registrada; preserve o ledger existente',
      );
    } else {
      fs.mkdirSync(target.directory, { recursive: false, mode: 0o700 });
      writeNew(target.work, work);
      const state = seal({
        schemaVersion: 'agent-verifier-loop-state-v1',
        taskId: work.id,
        workSha256,
        baseCommit: work.baseCommit,
        status: 'running',
        callsUsed: 0,
        outputs: [],
        extraAuthorizationUsed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pauseReason: null,
        conclusion: null,
      });
      writeNew(target.state, state);
    }
    const finalState = await executeInitial(home, target, work, context);
    process.stdout.write(`${JSON.stringify(finalState, null, 2)}\n`);
    return;
  }
  const target = paths(home, values['--task-id']);
  const loaded = loadState(home, values['--task-id']);
  if (command === 'report') {
    process.stdout.write(`${JSON.stringify(loaded.value, null, 2)}\n`);
    return;
  }
  if (command === 'authorize') {
    const state = loaded.value;
    check(
      !fs.existsSync(path.join(home, 'quiz-run.lock')),
      'ha uma execucao ativa no perfil',
    );
    policy.validateAuthorization(
      state,
      values['--work-sha256'],
      values['--statement'],
    );
    check(!fs.existsSync(target.approval), 'autorizacao ja registrada');
    writeNew(
      target.approval,
      seal({
        schemaVersion: 'agent-verifier-loop-approval-v1',
        taskId: state.taskId,
        workSha256: state.workSha256,
        maximumAdditionalCalls: policy.EXTRA_LIMIT,
        statement: values['--statement'],
        approvedAt: new Date().toISOString(),
      }),
    );
    const next = {
      ...state,
      extraAuthorizationUsed: true,
      updatedAt: new Date().toISOString(),
    };
    replaceSealed(target.state, next);
    process.stdout.write(
      `${JSON.stringify({ authorized: true, taskId: state.taskId, maximumAdditionalCalls: policy.EXTRA_LIMIT, totalCeiling: policy.TOTAL_LIMIT, workSha256: state.workSha256 }, null, 2)}\n`,
    );
    return;
  }
  check(
    loaded.value.status === 'awaiting_authorization' &&
      loaded.value.extraAuthorizationUsed,
    'tarefa nao possui autorizacao valida para retomar',
  );
  check(
    !fs.existsSync(path.join(home, 'quiz-run.lock')),
    'ha uma execucao ativa no perfil',
  );
  const approval = verify(read(target.approval));
  check(
    approval.taskId === loaded.value.taskId &&
      approval.workSha256 === loaded.value.workSha256 &&
      approval.maximumAdditionalCalls === policy.EXTRA_LIMIT,
    'autorizacao nao corresponde a tarefa',
  );
  const work = read(target.work);
  check(
    digest(work) === loaded.value.workSha256,
    'ficha armazenada diverge do hash aprovado',
  );
  const context = contextTools.buildContext(work);
  const finalState = await executeExtension(home, target, work, context);
  process.stdout.write(`${JSON.stringify(finalState, null, 2)}\n`);
}

if (require.main === module) {
  run().catch((error) => {
    process.stderr.write(`verifier-loop: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { AUTO_LIMIT, EXTRA_LIMIT, parseArgs, run };
