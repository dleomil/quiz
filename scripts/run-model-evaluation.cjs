const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const evaluation = require('./agent-evaluation.cjs');
const { workFor, verificationSource } = require('./agent-evaluation-cases.cjs');
const grading = require('./agent-evaluation-grading.cjs');
const auth = require('./agent-auth.cjs');
const copies = require('./agent-isolated-copy.cjs');
const { probe } = require('./agent-writer-sandbox.cjs');
const {
  buildContext,
  renderContext,
  pinnedConfig,
  readApprovalComment,
} = require('./agent-context.cjs');
const { sha256 } = require('./governance-guidelines.cjs');
const {
  parseAgentToml,
  validateEditorialInputDocument,
} = require('./validate-codex-agents.cjs');
const { digest, ROOT } = require('./document-catalog.cjs');
const {
  makeReceipt,
  analyzeEvents,
  assertEvents,
} = require('./agent-run-receipt.cjs');
const captures = require('./agent-event-capture.cjs');
const { execute } = require('./agent-process.cjs');
const { buildExecArguments } = require('./run-editorial-agent.cjs');
const transport = require('./agent-output-transport.cjs');

function parse(argv) {
  const command = argv[0];
  evaluation.check(
    [
      'init',
      'list',
      'ready',
      'run',
      'report',
      'resume',
      'resume-events',
      'resume-parser',
      'analyze',
      'inspect-capture',
      'benchmark-check',
      'revise-benchmark',
      'continuation-check',
      'continue-benchmark',
    ].includes(command),
    'use init, list, ready, run, report, resume, resume-events, resume-parser, analyze, inspect-capture, benchmark-check, revise-benchmark, continuation-check ou continue-benchmark',
  );
  const args = {};
  for (let index = 1; index < argv.length; index += 2) {
    const name = argv[index];
    evaluation.check(
      [
        '--auth-home',
        '--slot',
        '--codex-bin',
        '--test-comment',
        '--output',
        '--expected-state',
        '--approval-file',
      ].includes(name) &&
        !args[name] &&
        argv[index + 1] &&
        !argv[index + 1].startsWith('--'),
      'argumento desconhecido, duplicado ou sem valor',
    );
    args[name] = argv[index + 1];
  }
  evaluation.check(args['--auth-home'], 'use --auth-home dedicado');
  evaluation.check(
    !args['--test-comment'] || args['--codex-bin'],
    'aceite ficticio exige binario de teste',
  );
  evaluation.check(
    ['run', 'analyze', 'inspect-capture'].includes(command) ===
      Boolean(args['--slot']),
    'informe --slot somente ao executar uma tentativa',
  );
  evaluation.check(
    !args['--output'] ||
      [
        'report',
        'benchmark-check',
        'inspect-capture',
        'continuation-check',
      ].includes(command),
    'saida explicita permitida somente para relatorio, diagnostico ou pacote',
  );
  evaluation.check(
    [
      'resume',
      'resume-events',
      'resume-parser',
      'revise-benchmark',
      'continue-benchmark',
    ].includes(command) === Boolean(args['--expected-state']),
    'retomada exige --expected-state; proibido nos outros comandos',
  );
  evaluation.check(
    ['revise-benchmark', 'continue-benchmark'].includes(command) ===
      Boolean(args['--approval-file']),
    'revisao exige --approval-file; proibido nos outros comandos',
  );
  return { command, args };
}
function schemaFor(slot, configuration, document) {
  if (slot.category === 'verification') return transport.verificationSchema();
  if (!document) return null;
  const contract = JSON.parse(
    pinnedConfig(
      ROOT,
      'config/editorial-agent-output.schema.json',
      configuration.commit,
    ),
  );
  return transport.editorialSchema(
    contract,
    slot.role.replaceAll('-', '_'),
    document.input.subjectId,
  );
}
function contextFor(work, args, readComment) {
  return buildContext(
    work,
    args['--test-comment']
      ? { readComment: () => evaluation.read(args['--test-comment']) }
      : readComment
        ? { readComment }
        : {},
  );
}
async function verification(ticketFile, work, output, args, configuration) {
  const started = Date.now();
  const home = auth.validateProfile(args['--auth-home']);
  const ticket = evaluation.claim(
    ticketFile,
    home,
    work,
    null,
    Boolean(args['--codex-bin']),
  );
  const context = contextFor(work, args);
  const owned = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-verifier-evaluation-'),
  );
  const workspace = path.join(owned, 'workspace');
  const scratch = path.join(owned, 'scratch');
  fs.mkdirSync(workspace);
  fs.mkdirSync(scratch);
  let lock, checks, usage, artifactSha256, adapterSource, configurationSha256;
  let modelInvocations = 0;
  let state = 'preflight-blocked';
  let failureReason = null;
  const runId = crypto.randomUUID();
  const schema = transport.verificationSchema();
  let capture, captureInfo, message;
  try {
    lock = path.join(home, 'quiz-run.lock');
    try {
      fs.mkdirSync(lock, { mode: 0o700 });
    } catch {
      lock = undefined;
      throw new Error('perfil em uso; verificacao nao iniciada');
    }
    const bin = args['--codex-bin'] || 'codex';
    checks = auth.preflight(bin, home, scratch, workspace, ticket.slot.model);
    const source = verificationSource(ROOT, configuration);
    const sourceDirectory = path.join(owned, 'observed-tests');
    const sourceScratch = path.join(owned, 'observed-scratch');
    fs.mkdirSync(sourceScratch);
    const prepared = copies.prepare(
      ROOT,
      work.baseCommit,
      [configuration.plan.verificationFile],
      sourceDirectory,
      ['package.json', configuration.plan.verificationFile],
    );
    const testProgram = `const data=JSON.parse(process.argv[1]);const fn=require(require('node:path').resolve(data.payload.target));const results=[[{correct:true}],[{correct:false}]].map(items=>fn(items));console.log(JSON.stringify({nonce:data.nonce,results}));`;
    const observed = grading.runIndependent(
      bin,
      prepared.directory,
      sourceScratch,
      testProgram,
      { target: configuration.plan.verificationFile },
    );
    evaluation.check(
      observed.observed?.[0] === 5 && observed.observed?.[1] === 0,
      'testes declarados como aprovados nao foram comprovados',
    );
    fs.writeFileSync(
      path.join(workspace, 'output.schema.json'),
      JSON.stringify(schema),
    );
    message = path.join(scratch, 'message.json');
    const config = {
      model: ticket.slot.model,
      model_reasoning_effort: ticket.slot.effort,
    };
    adapterSource = pinnedConfig(
      ROOT,
      '.codex/agents/verifier.toml',
      work.baseCommit,
    );
    const prompt = [
      'Atue como verificador analitico independente em um exercicio sintetico. Nao use ferramentas nem altere arquivos.',
      parseAgentToml(adapterSource.toString()).developer_instructions,
      renderContext(context),
      `Ficha integral:\n${JSON.stringify(work)}`,
      `Codigo sintetico observado:\n${source}`,
      `Evidencia real coletada por script separado: casos [correct:true] e [correct:false] produziram 5 e 0. Detalhes: ${JSON.stringify(observed)}.`,
      'Os testes informados passaram. Confira tambem os requisitos nao cobertos. Nao afirme ter executado pessoalmente os comandos. Retorne o JSON solicitado.',
    ].join('\n\n');
    const argv = buildExecArguments(config, message, workspace, scratch, home);
    configurationSha256 = digest({
      argv: argv.map((value) =>
        value.replaceAll(owned, '<run>').replaceAll(home, '<auth>'),
      ),
      schemaSha256: digest(schema),
      checks,
    });
    const parserContext = { authHome: home, preflight: checks };
    capture = captures.createCapture(output, [], parserContext);
    modelInvocations = 1;
    state = 'execution-failed';
    const events = await execute(bin, argv, {
      cwd: workspace,
      env: auth.environment(home, scratch),
      input: prompt,
      timeoutMs: 300000 - (Date.now() - started),
      capture,
    });
    const eventDiagnosis = analyzeEvents(events, [], parserContext);
    usage = eventDiagnosis.usage;
    assertEvents(eventDiagnosis);
    state = 'output-rejected';
    const result = evaluation.read(message);
    transport.validateValue(result, schema);
    evaluation.write(output, result);
    artifactSha256 = digest(result);
    state = 'completed';
  } catch (error) {
    failureReason = error.message;
  } finally {
    try {
      if (capture) {
        try {
          captureInfo = capture.finish(message);
          usage ||= captureInfo.diagnosis.usage;
        } catch {
          state = 'output-rejected';
          failureReason = 'falha ao preservar captura';
        }
      }
      evaluation.write(
        `${output}.receipt.json`,
        makeReceipt({
          runId,
          actor: 'verifier',
          requestedModel: ticket.slot.model,
          reasoningEffort: ticket.slot.effort,
          adapterSha256: adapterSource ? sha256(adapterSource) : null,
          configurationSha256: configurationSha256 || null,
          startedAt: new Date(started).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - started,
          result: state,
          failureReason,
          modelInvocations,
          testOnly: Boolean(args['--codex-bin']),
          evaluationOnly: true,
          evaluation: { slotId: ticket.slot.id, ticketSha256: ticket.sha256 },
          workSha256: digest(work),
          contextSha256: context.sha256,
          approvals: context.approvals,
          preflight: checks || null,
          usage: usage || null,
          artifactSha256: artifactSha256 || null,
          captureSha256: captureInfo?.sha256 || null,
          eventDiagnosis: captureInfo?.diagnosis || null,
        }),
      );
    } finally {
      fs.rmSync(owned, { recursive: true, force: true });
      if (lock) fs.rmdirSync(lock);
    }
  }
}
function authoredGrade(slot, work, output, receipt, configuration, args) {
  const owned = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-author-validation-'),
  );
  try {
    const target = configuration.plan.authorFiles[slot.category];
    copies.validateArtifact(output, output.sha256, work, receipt.contextSha256);
    const workspace = path.join(owned, 'copy');
    const scratch = path.join(owned, 'scratch');
    fs.mkdirSync(scratch);
    copies.prepare(ROOT, work.baseCommit, [target], workspace, [
      'package.json',
      target,
    ]);
    for (const change of output.changes) {
      evaluation.check(
        change.path === target,
        'proposta alterou arquivo fora da tarefa',
      );
      if (!change.after) fs.unlinkSync(path.join(workspace, target));
      else
        fs.writeFileSync(
          path.join(workspace, target),
          Buffer.from(change.after.contentBase64, 'base64'),
        );
    }
    const fileState = copies.state(workspace, target);
    if (!fileState)
      return { passed: false, errors: ['Artefato solicitado foi excluido.'] };
    return slot.category === 'code'
      ? grading.gradeCode(
          args['--codex-bin'] || 'codex',
          workspace,
          scratch,
          target,
        )
      : grading.gradeDocumentation(fileState.bytes);
  } finally {
    fs.rmSync(owned, { recursive: true, force: true });
  }
}
async function runSlot(args) {
  const started = Date.now();
  const home = auth.validateProfile(args['--auth-home']);
  const current = evaluation.openCampaign(home);
  evaluation.check(
    current.campaign.testOnly === Boolean(args['--codex-bin']),
    'campanha real e fixture nao podem ser misturadas',
  );
  const mutex = path.join(home, 'quiz-evaluation.lock');
  fs.mkdirSync(mutex, { mode: 0o700 });
  let ticket, output, receipt, grade;
  let failureReason = null;
  let hasOutput = false;
  try {
    const slot = evaluation.resolveSlot(current, args['--slot']);
    let repair;
    if (slot.repairOf)
      repair = {
        grade: evaluation.read(
          path.join(current.directory, 'results', `${slot.repairOf}.json`),
        ).grade,
        output: evaluation.read(
          path.join(current.directory, 'runs', slot.repairOf, 'result.json'),
        ),
      };
    const { work, document } = workFor(
      slot,
      current.configuration,
      ROOT,
      repair,
    );
    schemaFor(slot, current.configuration, document);
    const reserved = evaluation.reserve(
      home,
      slot.id,
      digest(work),
      document ? digest(document) : null,
    );
    ticket = reserved.ticket;
    const runDirectory = path.join(current.directory, 'runs', slot.id);
    fs.mkdirSync(runDirectory, { mode: 0o700 });
    const workFile = path.join(runDirectory, 'work.json');
    evaluation.write(workFile, work);
    output = path.join(runDirectory, 'result.json');
    const common = [
      '--work',
      workFile,
      '--auth-home',
      home,
      '--output',
      output,
      '--evaluation-ticket',
      reserved.file,
      ...(args['--codex-bin'] ? ['--codex-bin', args['--codex-bin']] : []),
      ...(args['--test-comment']
        ? ['--test-comment', args['--test-comment']]
        : []),
    ];
    process.stdout.write(
      `avaliacao: iniciando ${slot.id}; tentativa reservada, sem repeticao automatica\n`,
    );
    if (['editorial', 'curation'].includes(slot.category)) {
      const inputFile = path.join(runDirectory, 'input.json');
      evaluation.write(inputFile, document);
      await require('./run-editorial-agent.cjs').run([
        '--agent',
        slot.role.replaceAll('-', '_'),
        '--input',
        inputFile,
        ...common,
      ]);
    } else if (slot.category === 'verification')
      await verification(
        reserved.file,
        work,
        output,
        args,
        current.configuration,
      );
    else
      await require('./run-writer-agent.cjs').run([
        '--mode',
        'evaluation',
        ...common,
      ]);
    receipt = evaluation.readOptional(`${output}.receipt.json`);
    const result = evaluation.readOptional(output);
    hasOutput = result !== null;
    evaluation.check(
      receipt &&
        receipt.testOnly === current.campaign.testOnly &&
        receipt.evaluation?.ticketSha256 === ticket.sha256 &&
        receipt.requestedModel === slot.model &&
        receipt.reasoningEffort === slot.effort &&
        receipt.evaluationOnly === true,
      'recibo ausente ou divergente da reserva',
    );
    evaluation.verifySeal(receipt);
    if (receipt.modelInvocations === 1) {
      const { manifest } = captures.verifyCapture(
        output,
        receipt.captureSha256,
      );
      evaluation.check(
        manifest.exitCode === 0 &&
          !manifest.processError &&
          !manifest.truncated &&
          manifest.diagnosis.accepted,
        receipt.failureReason || 'captura nao comprova conclusao sem falhas',
      );
    }
    evaluation.check(
      hasOutput && ['completed', 'proposed'].includes(receipt.result),
      receipt.failureReason || 'execucao sem proposta aceita pelo runner',
    );
    grade =
      slot.category === 'editorial'
        ? grading.gradeEditorial(
            document,
            result,
            current.configuration.cases.find((item) => item.id === slot.caseId),
          )
        : slot.category === 'curation'
          ? grading.gradeCuration(document, result, slot)
          : slot.category === 'verification'
            ? grading.gradeVerification(result)
            : authoredGrade(
                slot,
                work,
                result,
                receipt,
                current.configuration,
                args,
              );
  } catch (error) {
    failureReason = error.message;
    grade = { passed: false, errors: [failureReason] };
    if (!ticket) throw error;
  } finally {
    try {
      if (ticket) {
        const result = evaluation.finish(home, ticket, {
          passed: grade?.passed === true,
          grade: grade || null,
          hasOutput,
          failureReason,
          durationMs: Date.now() - started,
          modelInvocations: receipt?.modelInvocations ?? null,
          receiptSha256: receipt?.sha256 || null,
          outputSha256: hasOutput ? digest(evaluation.read(output)) : null,
          usage: receipt?.usage || null,
          runnerDurationMs: receipt?.durationMs || null,
        });
        process.stdout.write(`${JSON.stringify(result)}\n`);
        process.exitCode = result.passed ? 0 : 1;
      }
    } finally {
      fs.rmdirSync(mutex);
    }
  }
}
function report(current) {
  const results = current.attempts.map((attempt) => {
    const file = path.join(
      current.directory,
      'results',
      `${attempt.slot.id}.json`,
    );
    const stored = evaluation.readOptional(file);
    if (!stored)
      return {
        slot: attempt.slot,
        ...(attempt.benchmarkVersion
          ? {
              benchmarkVersion: attempt.benchmarkVersion,
              benchmarkSha256: attempt.benchmarkSha256,
              benchmarkRevisionSha256: attempt.benchmarkRevisionSha256,
            }
          : {}),
        passed: false,
        pending: true,
        modelInvocations: null,
        testOnly: current.campaign.testOnly,
      };
    const result = evaluation.verifySeal(stored);
    evaluation.check(
      result.ticketSha256 === attempt.sha256 &&
        digest(result.slot) === digest(attempt.slot) &&
        result.testOnly === current.campaign.testOnly &&
        result.passed === result.grade?.passed,
      'resultado diverge da tentativa',
    );
    if (attempt.benchmarkVersion)
      evaluation.check(
        result.benchmarkVersion === attempt.benchmarkVersion &&
          result.benchmarkSha256 === attempt.benchmarkSha256 &&
          result.benchmarkRevisionSha256 === attempt.benchmarkRevisionSha256,
        'resultado de outra revisao do benchmark',
      );
    if (result.receiptSha256) {
      const receipt = evaluation.verifySeal(
        evaluation.read(
          path.join(
            current.directory,
            'runs',
            attempt.slot.id,
            'result.json.receipt.json',
          ),
        ),
      );
      evaluation.check(
        receipt.sha256 === result.receiptSha256 &&
          receipt.evaluation?.ticketSha256 === attempt.sha256,
        'recibo da tentativa foi alterado',
      );
    }
    if (result.hasOutput)
      evaluation.check(
        digest(
          evaluation.read(
            path.join(
              current.directory,
              'runs',
              attempt.slot.id,
              'result.json',
            ),
          ),
        ) === result.outputSha256,
        'artefato da tentativa foi alterado',
      );
    const output = path.join(
      current.directory,
      'runs',
      attempt.slot.id,
      'result.json',
    );
    const receipt = result.receiptSha256
      ? evaluation.read(`${output}.receipt.json`)
      : null;
    if (attempt.benchmarkVersion)
      evaluation.check(
        receipt &&
          receipt.requestedModel === attempt.slot.model &&
          receipt.reasoningEffort === attempt.slot.effort &&
          receipt.evaluation?.benchmarkVersion === attempt.benchmarkVersion &&
          receipt.evaluation?.benchmarkSha256 === attempt.benchmarkSha256 &&
          receipt.evaluation?.benchmarkRevisionSha256 ===
            attempt.benchmarkRevisionSha256,
        'recibo de outra revisao do benchmark',
      );
    const captureState = receipt?.captureSha256
      ? captures.verifyCapture(output, receipt.captureSha256).manifest
      : null;
    const analysis = require('./agent-evaluation-reanalysis.cjs').readAnalysis(
      current,
      attempt,
    );
    const failureClass = result.passed
      ? null
      : captureState?.processError
        ? captureState.processError
        : captureState?.truncated
          ? 'capture_limit'
          : /invalid_json_schema/.test(result.failureReason || '')
            ? 'transport_schema'
            : receipt?.failureReason ===
                'ferramenta acionada em revisao sem ferramentas'
              ? 'unclassified_protocol'
              : receipt?.eventDiagnosis?.reasonCode ||
                (receipt?.result === 'execution-failed'
                  ? 'process_failure'
                  : receipt?.result === 'preflight-blocked'
                    ? 'preflight_failure'
                    : receipt?.result === 'output-rejected'
                      ? 'output_validation'
                      : 'quality');
    const technicalFailure = [
      'capture_failure',
      'capture_limit',
      'transport_schema',
      'unclassified_protocol',
      'unknown_item',
      'unknown_event',
      'invalid_plan',
      'invalid_jsonl',
      'invalid_usage',
      'incomplete_turn',
      'process_failure',
      'preflight_failure',
    ].includes(failureClass);
    return analysis
      ? {
          ...result,
          failureClass,
          technicalFailure,
          analysis,
          logicalPassed: analysis.passed,
        }
      : { ...result, failureClass, technicalFailure };
  });
  const allResults = [...results];
  const legacyDiagnostics = current.benchmarkRevision
    ? results.filter((row) => row.benchmarkVersion !== 'v2')
    : [];
  if (current.benchmarkRevision) {
    for (let index = results.length - 1; index >= 0; index--)
      if (results[index].benchmarkVersion !== 'v2') results.splice(index, 1);
  }
  const activeSchedule = current.benchmarkRevision
    ? evaluation.schedule(current.configuration)
    : current.campaign.schedule;
  const effective = (slot) =>
    results.find(
      (item) =>
        item.slot.id === current.resumption?.replacementSlot &&
        item.slot.replacementOf === slot.id,
    ) ||
    results.find((item) => item.slot.replacementOf === slot.id) ||
    results.find((item) => item.slot.id === slot.id);
  const completed = activeSchedule.every((slot) => {
    const item = effective(slot);
    return (
      item &&
      !item.pending &&
      !(slot.id === current.resumption?.failedSlot && item.slot.id === slot.id)
    );
  });
  const eligible = (variant, category) => {
    const expected = activeSchedule.filter(
      (slot) => slot.variant === variant && slot.category === category,
    );
    return (
      !current.campaign.testOnly &&
      expected.length > 0 &&
      expected.every(
        (slot) =>
          ((effective(slot)?.analysis
            ? effective(slot).logicalPassed
            : effective(slot)?.passed) &&
            !effective(slot)?.testOnly) ||
          results.some(
            (item) =>
              item.slot.repairOf === slot.id && item.passed && !item.testOnly,
          ),
      )
    );
  };
  const selection = {
    code: eligible('author-luna', 'code'),
    documentation: eligible('author-luna', 'documentation'),
    curation: eligible('author-luna', 'curation'),
    editorial: eligible('editorial-candidate', 'editorial'),
    verification: eligible('verifier-candidate', 'verification'),
  };
  const usageRecords = allResults.filter((item) => item.usage);
  const profileMetrics = {};
  for (const item of results) {
    const key = `${item.slot.category}/${item.slot.variant}`;
    const metric = (profileMetrics[key] ||= {
      category: item.slot.category,
      variant: item.slot.variant,
      requestedModel: item.slot.model,
      reasoningEffort: item.slot.effort,
      attemptsConsumed: 0,
      initialAttempts: 0,
      corrections: 0,
      passedAttempts: 0,
      failedAttempts: 0,
      pendingAttempts: 0,
      technicalFailures: 0,
      recoveredAttempts: 0,
      recoveredPassedCases: 0,
      replacements: 0,
      reportedUsageRecords: 0,
      knownTokens: {
        input_tokens: 0,
        cached_input_tokens: 0,
        output_tokens: 0,
      },
      runnerDurationsMs: [],
    });
    metric.attemptsConsumed++;
    if (item.slot.repairOf) metric.corrections++;
    else if (item.slot.replacementOf) metric.replacements++;
    else metric.initialAttempts++;
    if (item.pending) metric.pendingAttempts++;
    else if (item.passed) metric.passedAttempts++;
    else if (item.technicalFailure) metric.technicalFailures++;
    else metric.failedAttempts++;
    if (item.analysis) {
      metric.recoveredAttempts++;
      if (item.analysis.passed) metric.recoveredPassedCases++;
    }
    if (item.usage) {
      metric.reportedUsageRecords++;
      for (const key of Object.keys(metric.knownTokens))
        metric.knownTokens[key] += item.usage[key];
    }
    if (item.modelInvocations === 1 && Number.isFinite(item.runnerDurationMs))
      metric.runnerDurationsMs.push(item.runnerDurationMs);
  }
  for (const metric of Object.values(profileMetrics)) {
    const values = metric.runnerDurationsMs.slice().sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    metric.runnerDurationMedianMs = !values.length
      ? null
      : values.length % 2
        ? values[middle]
        : (values[middle - 1] + values[middle]) / 2;
  }
  return evaluation.sealed({
    schemaVersion: current.benchmarkRevision
      ? 'agent-model-evaluation-report-v2'
      : 'agent-model-evaluation-report-v1',
    ...(current.benchmarkRevision
      ? {
          benchmarkRevision: current.benchmarkRevision,
          ...(current.benchmarkContinuation
            ? {
                benchmarkContinuation: {
                  packageSha256: current.benchmarkContinuation.packageSha256,
                  sourceCommit:
                    current.benchmarkContinuation.package.targetCommit,
                  stateSha256:
                    current.benchmarkContinuation.package.stateSha256,
                  slots: current.benchmarkContinuation.package.slots.map(
                    (slot) => slot.id,
                  ),
                  attemptsUsedBeforeContinuation:
                    current.benchmarkContinuation.package.attemptsUsed,
                },
              }
            : {}),
          legacyDiagnostics,
          verificationDeferred: true,
          approvedNewAttempts: 28,
          reserveAuthorized: false,
        }
      : {}),
    id: current.campaign.id,
    sourceCommit: current.campaign.sourceCommit,
    activeSourceCommit: current.configuration.commit,
    resumption: current.resumption,
    stateSha256: evaluation.stateFingerprint(current),
    fingerprintVersion: 'sha256-bytes-v2',
    planSha256: current.campaign.planSha256,
    testOnly: current.campaign.testOnly,
    completed,
    attemptsUsed: current.attempts.length,
    maximumAttempts: 32,
    modelInvocationsKnown: allResults.reduce(
      (sum, item) => sum + (item.modelInvocations || 0),
      0,
    ),
    invocationsUnreported: allResults.filter(
      (item) => item.modelInvocations === null,
    ).length,
    usageRecords: usageRecords.length,
    knownTokens: Object.fromEntries(
      ['input_tokens', 'cached_input_tokens', 'output_tokens'].map((key) => [
        key,
        usageRecords.reduce((sum, item) => sum + item.usage[key], 0),
      ]),
    ),
    categoryEligibility: Object.fromEntries(
      Object.entries(selection).map(([key, value]) => [
        key,
        completed && value,
      ]),
    ),
    profileMetrics,
    results,
    limitations: [
      'Amostra pequena e delimitada; nao comprova capacidade geral.',
      'Catalogo e modelo solicitado nao atestam identidade remota nem acesso da conta.',
      'Consumo da assinatura e cobranca nao informados; tokens conhecidos sao medidas parciais, sem preco de API.',
      'Elegibilidade nao altera perfis nem autoriza merge, publicacao ou aceite curricular.',
      'Tentativas reservadas, inclusive falhas de preflight e interrupcoes, permanecem consumidas.',
    ],
  });
}
async function run(argv = process.argv.slice(2)) {
  const { command, args } = parse(argv);
  const home = auth.validateProfile(args['--auth-home']);
  if (command === 'benchmark-check' || command === 'revise-benchmark') {
    const benchmark = require('./agent-evaluation-benchmark.cjs');
    const value =
      command === 'benchmark-check'
        ? benchmark.checkBenchmark(home)
        : benchmark.revise(
            home,
            args['--expected-state'],
            args['--approval-file'],
          );
    if (args['--output'])
      evaluation.write(path.resolve(args['--output']), value);
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
    return;
  }
  if (command === 'continuation-check' || command === 'continue-benchmark') {
    const benchmark = require('./agent-evaluation-benchmark.cjs');
    const value =
      command === 'continuation-check'
        ? benchmark.checkContinuation(home, ROOT)
        : benchmark.continueBenchmark(
            home,
            args['--expected-state'],
            args['--approval-file'],
            ROOT,
          );
    if (args['--output'])
      evaluation.write(path.resolve(args['--output']), value);
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
    return;
  }
  if (command === 'init') {
    process.stdout.write(
      `${JSON.stringify(evaluation.initialize(home, ROOT, Boolean(args['--codex-bin'])), null, 2)}\n`,
    );
    return;
  }
  if (command === 'resume') {
    process.stdout.write(
      `${JSON.stringify(evaluation.resume(home, args['--expected-state']), null, 2)}\n`,
    );
    return;
  }
  if (['resume-events', 'resume-parser'].includes(command)) {
    process.stdout.write(
      `${JSON.stringify(require('./agent-evaluation-event-resumption.cjs').resumeEvents(home, args['--expected-state'], ROOT, command === 'resume-parser' ? 'parser' : 'events'), null, 2)}\n`,
    );
    return;
  }
  const current = evaluation.openCampaign(
    home,
    ROOT,
    ['list', 'report', 'inspect-capture'].includes(command),
  );
  if (command === 'inspect-capture') {
    const value = require('./agent-evaluation-inspection.cjs').inspect(
      current,
      args['--slot'],
      home,
    );
    if (args['--output'])
      evaluation.write(path.resolve(args['--output']), value);
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  } else if (command === 'analyze') {
    evaluation.check(
      !current.benchmarkRevision,
      'analise legada nao concede elegibilidade ao benchmark v2',
    );
    evaluation.check(
      current.campaign.testOnly === Boolean(args['--codex-bin']),
      'campanha real e fixture nao podem ser misturadas',
    );
    const lock = path.join(home, 'quiz-evaluation.lock');
    fs.mkdirSync(lock, { mode: 0o700 });
    try {
      process.stdout.write(
        `${JSON.stringify(require('./agent-evaluation-reanalysis.cjs').analyze(current, args['--slot'], ROOT, args['--codex-bin'] || 'codex'), null, 2)}\n`,
      );
    } finally {
      fs.rmdirSync(lock);
    }
  } else if (command === 'list') {
    process.stdout.write(
      `${JSON.stringify({ campaign: current.campaign, attemptsUsed: current.attempts.length }, null, 2)}\n`,
    );
  } else if (command === 'report') {
    const value = report(current);
    if (args['--output'])
      evaluation.write(path.resolve(args['--output']), value);
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  } else if (command === 'ready') {
    const owned = fs.mkdtempSync(
      path.join(os.tmpdir(), 'quiz-evaluation-ready-'),
    );
    try {
      evaluation.check(
        current.campaign.testOnly === Boolean(args['--codex-bin']),
        'perfil de teste diverge',
      );
      const workspace = path.join(owned, 'copy');
      const scratch = path.join(owned, 'scratch');
      fs.mkdirSync(scratch);
      const target = current.configuration.plan.authorFiles.code;
      const prepared = copies.prepare(
        ROOT,
        current.configuration.commit,
        [target],
        workspace,
        ['package.json', target],
      );
      const bin = args['--codex-bin'] || 'codex';
      const approvals = new Map();
      const readComment = (id) => {
        if (!approvals.has(id)) approvals.set(id, readApprovalComment(id));
        return approvals.get(id);
      };
      const checkedContexts = new Set();
      for (const slot of current.benchmarkRevision
        ? evaluation.schedule(current.configuration)
        : current.campaign.schedule) {
        const input = workFor(slot, current.configuration, ROOT);
        schemaFor(slot, current.configuration, input.document);
        if (input.document) {
          const errors = validateEditorialInputDocument(
            input.document,
            slot.role.replaceAll('-', '_'),
          );
          evaluation.check(errors.length === 0, errors.join('; '));
        }
        const key = `${slot.role}:${input.work.subjectId}`;
        if (!checkedContexts.has(key)) {
          contextFor(input.work, args, readComment);
          checkedContexts.add(key);
        }
      }
      const proofs = Object.fromEntries(
        [
          ...new Set(
            (current.benchmarkRevision
              ? evaluation.schedule(current.configuration)
              : Object.values(current.configuration.plan.variants)
            ).map((item) => item.model),
          ),
        ].map((model) => [
          model,
          auth.preflight(bin, home, scratch, prepared.directory, model),
        ]),
      );
      const sandbox = probe(
        bin,
        prepared.directory,
        [target],
        scratch,
        home,
        ROOT,
      );
      process.stdout.write(
        `${JSON.stringify({ ready: true, contextsChecked: checkedContexts.size, modelInvocations: 0, attemptsUsed: current.attempts.length, proofs, sandbox }, null, 2)}\n`,
      );
    } finally {
      fs.rmSync(owned, { recursive: true, force: true });
    }
  } else await runSlot(args);
}
if (require.main === module)
  run().catch((error) => {
    process.stderr.write(`model-evaluation: ${error.message}\n`);
    process.exitCode = 1;
  });
module.exports = { parse, run, runSlot, report };
