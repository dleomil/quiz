'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { digest, baseline, ROOT } = require('./document-catalog.cjs');
const { sha256 } = require('./governance-guidelines.cjs');
const {
  verifyCapture,
  readBytes,
  writeBytes,
} = require('./agent-event-capture.cjs');
const { analyzeEvents } = require('./agent-cli-events.cjs');
const { validateProfile, DISABLED_FEATURES } = require('./agent-auth.cjs');
const {
  validateEditorialInputDocument,
  validateEditorialScenario,
} = require('./validate-codex-agents.cjs');
const transport = require('./agent-output-transport.cjs');
const MESSAGE =
  'Code Mode is unavailable because code-mode host is disabled. Code mode will fail closed; enable `features.code_mode_host` and install `codex-code-mode-host`.';
function check(value, message) {
  if (!value) throw new Error(message);
}
function sealed(value) {
  const { sha256: hash, ...payload } = value;
  check(hash === digest(payload), 'selo divergente');
  return payload;
}
function recognizedStartupWarnings(warnings) {
  return (
    (warnings.length === 1 && warnings[0].code === 'startup_config_2') ||
    (warnings.length === 2 &&
      warnings[0].code === 'startup_config_1' &&
      warnings[1].code === 'startup_config_2')
  );
}
function diagnosisMatchesStartupWarnings(previous, current) {
  if (
    !current?.accepted ||
    !current.completed ||
    current.issues.length !== 0 ||
    !recognizedStartupWarnings(current.warnings)
  )
    return false;
  if (JSON.stringify(previous) === JSON.stringify(current)) return true;
  if (
    previous?.completed !== true ||
    previous.reasonCode !== 'process_failure' ||
    previous.usage?.input_tokens !== current.usage?.input_tokens ||
    previous.usage?.output_tokens !== current.usage?.output_tokens
  )
    return false;
  const events = [
    ...(previous.warnings || []).map((warning) => ({
      line: warning.line,
      valid: /^startup_config_[12]$/.test(warning.code),
    })),
    ...(previous.issues || []).map((issue) => ({
      line: issue.line,
      valid:
        issue.code === 'process_failure' &&
        issue.eventType === 'item.completed' &&
        issue.itemType === 'error',
    })),
  ].sort((a, b) => a.line - b.line);
  return (
    events.length === current.warnings.length &&
    events.every(
      (event, index) =>
        event.valid && event.line === current.warnings[index].line,
    )
  );
}
function inspect({
  receipt,
  capture,
  input,
  work,
  authHome,
  schema,
  reviewOnly = false,
}) {
  sealed(receipt);
  check(
    receipt.testOnly === false &&
      receipt.modelInvocations === 1 &&
      receipt.result === 'output-rejected',
    'tentativa inelegivel',
  );
  check(
    receipt.inputSha256 === digest(input) &&
      receipt.workSha256 === digest(work),
    'entrada ou ficha divergente',
  );
  check(
    work.id === input.input.workItemId &&
      work.role === receipt.actor.replaceAll('_', '-'),
    'identidade divergente',
  );
  check(
    /^\d+\.\d+\.\d+$/.test(receipt.preflight.cliVersion) &&
      receipt.preflight.mcpServerCount === 0,
    'preflight divergente',
  );
  check(
    receipt.preflight.auth === 'chatgpt-existing-profile' &&
      receipt.preflight.skills === 'disabled-and-context-checked' &&
      receipt.preflight.features?.skip_host_skill_discovery === true &&
      DISABLED_FEATURES.every(
        (name) => receipt.preflight.features[name] === false,
      ),
    'isolamento divergente',
  );
  check(
    work.subjectId === input.input.subjectId &&
      work.curriculumCycle ===
        input.input.academicYear + '-' + input.input.term,
    'escopo divergente',
  );
  check(
    receipt.preflight.modelCatalogued === receipt.requestedModel,
    'modelo do preflight divergente',
  );
  const manifest = capture.manifest;
  sealed(manifest);
  check(
    manifest.sha256 === receipt.captureSha256 &&
      manifest.exitCode === 0 &&
      !manifest.processError &&
      !manifest.truncated,
    'captura incompleta',
  );
  const stdoutBytes = readBytes(path.join(capture.directory, 'stdout.jsonl'));
  check(
    manifest.files['stdout.jsonl'].sha256 === sha256(stdoutBytes) &&
      manifest.files['stdout.jsonl'].bytes === stdoutBytes.length,
    'eventos alterados',
  );
  const stdout = stdoutBytes.toString('utf8');
  const diagnosis = analyzeEvents(stdout, [], {
    authHome,
    preflight: receipt.preflight,
  });
  check(
    diagnosis.completed &&
      ((diagnosis.issues.length === 1 &&
        diagnosis.issues[0].code === 'process_failure') ||
        (diagnosis.issues.length === 0 &&
          recognizedStartupWarnings(diagnosis.warnings))),
    'eventos inelegiveis',
  );
  const events = stdout
    .split('\n')
    .filter((s) => s.trim())
    .map((s) => JSON.parse(s));
  const start = events.findIndex((e) => e.type === 'turn.started');
  const bad = events.filter(
    (e) =>
      e.type === 'item.completed' &&
      e.item?.type === 'error' &&
      e.item.message === MESSAGE,
  );
  check(
    bad.length === 1 &&
      events.indexOf(bad[0]) > 0 &&
      events.indexOf(bad[0]) < start,
    'erro fora da inicializacao',
  );
  check(
    Object.keys(bad[0]).sort().join(',') === 'item,type' &&
      Object.keys(bad[0].item).sort().join(',') === 'id,message,type',
    'evento divergente',
  );
  for (const kind of [
    'thread.started',
    'turn.started',
    'turn.completed',
    'item.completed:agent_message',
  ])
    check(diagnosis.types[kind] === 1, 'ciclo divergente');
  const primaryLine =
    diagnosis.issues[0]?.line ||
    diagnosis.warnings.find((warning) => warning.itemId === bad[0].item.id)
      ?.line;
  check(primaryLine === events.indexOf(bad[0]) + 1, 'outra falha');
  check(
    diagnosisMatchesStartupWarnings(manifest.diagnosis, diagnosis),
    'diagnostico divergente',
  );
  check(
    validateEditorialInputDocument(input, receipt.actor).length === 0,
    'entrada invalida',
  );
  const raw = readBytes(path.join(capture.directory, 'response.json'));
  check(
    manifest.files['response.json']?.sha256 === sha256(raw) &&
      manifest.files['response.json'].bytes === raw.length,
    'resposta divergente',
  );
  const wire = JSON.parse(raw);
  const batchSize = input.input.proposals?.length;
  const output =
    receipt.actor === 'content_curator' && Number.isInteger(batchSize)
      ? transport.decodeEditorialBatch(wire, schema, receipt.actor)
      : transport.decodeEditorial(wire, schema, receipt.actor);
  const scenario = { ...input, output };
  check(
    (output.agent === 'content_curator' && output.proposals
      ? require('./direct-curation.cjs').validateDirectCuration(scenario, {
          expectedCount: output.proposals.length,
        })
      : validateEditorialScenario(scenario)
    ).length === 0,
    'resposta editorial invalida',
  );
  const approvalsValid =
    receipt.approvals?.length &&
    work.documents.every((d) =>
      receipt.approvals.some((a) => a.sourceCommit === d.sourceCommit),
    );
  check(approvalsValid || reviewOnly, 'aceite documental ausente');
  return { scenario, diagnosis, responseSha256: sha256(raw) };
}
function recover({ receiptFile, inputFile, workFile, authHome, outputFile }) {
  validateProfile(authHome);
  const receipt = JSON.parse(readBytes(receiptFile));
  const input = JSON.parse(readBytes(inputFile));
  const work = JSON.parse(readBytes(workFile));
  const authorityPolicy = JSON.parse(
    execFileSync('git', ['show', 'HEAD:config/agent-context-policy.json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
  );
  const currentContract = sha256(
    fs.readFileSync(path.join(ROOT, 'docs/specs/content-delivery-contract.md')),
  );
  const approvedBaseline = authorityPolicy.approvals.some((ref) => {
    const snapshot = baseline(ROOT, ref.sourceCommit);
    return (
      snapshot.sha256 === ref.sha256 &&
      snapshot.documents.some(
        (doc) =>
          doc.path === 'docs/specs/content-delivery-contract.md' &&
          doc.sha256 === currentContract &&
          doc.version === '2.1.0',
      )
    );
  });
  const frozenReviewOnly =
    receipt.actor === 'content_curator' &&
    input.input?.manifestState === 'frozen' &&
    Boolean(input.input?.humanFreezeApproval?.approvedBy);
  check(
    approvedBaseline || frozenReviewOnly,
    'baseline da recuperacao editorial ainda nao aprovado e registrado',
  );
  check(
    /^[a-f0-9-]{36}$/.test(receipt.captureId || ''),
    'captura sem identificador',
  );
  require('./agent-context.cjs').validateWork(work);
  check(
    work.allowedPaths.length === 0 && work.commands.length === 0,
    'ficha permite ferramentas',
  );
  const base = work.baseCommit;
  check(/^[a-f0-9]{40}$/.test(base), 'commit invalido');
  const source = (name) =>
    execFileSync('git', ['show', `${base}:${name}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  const pinnedSchema = JSON.parse(
    source('config/editorial-agent-output.schema.json'),
  );
  const batchSize = input.input.proposals?.length;
  const schema =
    receipt.actor === 'content_curator' && Number.isInteger(batchSize)
      ? transport.editorialBatchSchema(
          pinnedSchema,
          receipt.actor,
          input.input.subjectId,
          batchSize,
        )
      : transport.editorialSchema(
          pinnedSchema,
          receipt.actor,
          input.input.subjectId,
        );
  for (const approval of receipt.approvals || [])
    check(
      baseline(ROOT, approval.sourceCommit).sha256 === approval.baselineSha256,
      'baseline divergente',
    );
  for (const doc of work.documents) {
    const catalog = JSON.parse(
      source('config/document-catalog.json'),
    ).documents.find((d) => d.id === doc.id);
    check(
      catalog &&
        catalog.normative &&
        catalog.sha256 === doc.sha256 &&
        catalog.version === doc.version,
      'documento divergente',
    );
    check(
      sha256(source(catalog.path)) === doc.sha256,
      'texto documental divergente',
    );
  }
  const adapter =
    receipt.actor === 'content_curator'
      ? 'content-curator.toml'
      : 'pedagogical-quality.toml';
  const adapterText = source('.codex/agents/' + adapter);
  const configuration = require('./validate-codex-agents.cjs').parseAgentToml(
    adapterText,
  );
  check(
    sha256(adapterText) === receipt.adapterSha256 &&
      configuration.model === receipt.requestedModel &&
      configuration.model_reasoning_effort === receipt.reasoningEffort,
    'adaptador ou modelo divergente',
  );
  check(
    sha256(source('config/editorial-agent-output.schema.json')) ===
      receipt.contractSchemaSha256,
    'schema divergente',
  );
  const capture = verifyCapture(
    path.join(
      authHome,
      'quiz-editorial-runs',
      receipt.captureId,
      'result.json',
    ),
    receipt.captureSha256,
  );
  const result = inspect({
    receipt,
    capture,
    input,
    work,
    authHome,
    schema,
    reviewOnly: frozenReviewOnly && !approvedBaseline,
  });
  const payload = {
    schemaVersion: 'editorial-recovery-v1',
    status: 'response-recovered',
    recoveryBasis: approvedBaseline
      ? 'approved-contract-baseline'
      : 'frozen-matrix-review-only',
    originalRunId: receipt.runId,
    originalResult: receipt.result,
    sourceReceiptSha256: receipt.sha256,
    sourceReceipt: receipt,
    sourceCaptureManifest: capture.manifest,
    sourceWork: work,
    sourceCaptureSha256: receipt.captureSha256,
    inputSha256: receipt.inputSha256,
    workSha256: receipt.workSha256,
    responseSha256: result.responseSha256,
    correctedDiagnosis: result.diagnosis,
    scenario: result.scenario,
    additionalModelInvocations: 0,
    humanApprovalRequired: true,
    publicationEligible: false,
  };
  writeBytes(
    outputFile,
    Buffer.from(
      JSON.stringify({ ...payload, sha256: digest(payload) }, null, 2) + '\n',
    ),
  );
  return payload;
}
if (require.main === module) {
  try {
    const a = process.argv.slice(2),
      v = {};
    for (let i = 0; i < a.length; i += 2) {
      check(
        ['--receipt', '--input', '--work', '--auth-home', '--output'].includes(
          a[i],
        ) &&
          a[i + 1] &&
          !v[a[i]],
        'argumentos invalidos',
      );
      v[a[i]] = a[i + 1];
    }
    check(Object.keys(v).length === 5, 'argumentos incompletos');
    recover({
      receiptFile: v['--receipt'],
      inputFile: v['--input'],
      workFile: v['--work'],
      authHome: v['--auth-home'],
      outputFile: v['--output'],
    });
    console.log('Recuperacao suplementar gravada; aprovacao humana pendente.');
  } catch (e) {
    console.error('editorial-recovery: ' + e.message);
    process.exitCode = 1;
  }
}
function validateReport(report) {
  sealed(report);
  const r = report.sourceReceipt;
  sealed(r);
  const input = { ...report.scenario };
  delete input.output;
  check(
    report.schemaVersion === 'editorial-recovery-v1' &&
      report.status === 'response-recovered' &&
      report.additionalModelInvocations === 0 &&
      report.publicationEligible === false &&
      report.humanApprovalRequired === true &&
      ['approved-contract-baseline', 'frozen-matrix-review-only'].includes(
        report.recoveryBasis,
      ),
    'relatorio inelegivel',
  );
  check(
    r.testOnly === false &&
      r.modelInvocations === 1 &&
      r.result === 'output-rejected' &&
      report.originalResult === r.result &&
      r.runId === report.originalRunId &&
      r.sha256 === report.sourceReceiptSha256 &&
      r.captureSha256 === report.sourceCaptureSha256 &&
      r.inputSha256 === digest(input) &&
      r.workSha256 === digest(report.sourceWork),
    'vinculos da recuperacao divergentes',
  );
  check(
    (report.scenario.output.agent === 'content_curator' &&
    report.scenario.output.proposals
      ? require('./direct-curation.cjs').validateDirectCuration(
          report.scenario,
          { expectedCount: report.scenario.output.proposals.length },
        )
      : validateEditorialScenario(report.scenario)
    ).length === 0,
    'cenario recuperado invalido',
  );
  check(
    r.actor === report.scenario.output.agent &&
      report.sourceWork.role === r.actor.replaceAll('_', '-'),
    'ator recuperado divergente',
  );
  if (report.recoveryBasis === 'frozen-matrix-review-only')
    check(
      r.actor === 'content_curator' &&
        report.scenario.input.manifestState === 'frozen' &&
        Boolean(report.scenario.input.humanFreezeApproval?.approvedBy),
      'recuperacao review-only fora do escopo autorizado',
    );
  check(
    /^\d+\.\d+\.\d+$/.test(r.preflight.cliVersion) &&
      r.preflight.mcpServerCount === 0 &&
      r.preflight.auth === 'chatgpt-existing-profile' &&
      r.preflight.skills === 'disabled-and-context-checked' &&
      DISABLED_FEATURES.every((n) => r.preflight.features[n] === false),
    'isolamento recuperado divergente',
  );
  const m = report.sourceCaptureManifest;
  sealed(m);
  check(
    m.sha256 === r.captureSha256 &&
      m.exitCode === 0 &&
      !m.processError &&
      !m.truncated &&
      m.files['response.json']?.sha256 === report.responseSha256,
    'manifesto recuperado divergente',
  );
  check(
    diagnosisMatchesStartupWarnings(
      m.diagnosis,
      report.correctedDiagnosis || r.eventDiagnosis,
    ),
    'diagnostico recuperado divergente',
  );
  check(
    digest(m.diagnosis) === digest(r.eventDiagnosis),
    'recibo diverge do diagnostico',
  );
  return true;
}
function reviewScenario(report, questions, reportPath) {
  validateReport(report);
  const delivery = require('./content-delivery.cjs');
  const input = report.scenario.input;
  check(
    report.sourceReceipt.actor === 'pedagogical_quality' &&
      ['pedagogical', 'linguistic'].includes(input.requestedPass),
    'curadoria nao constitui revisao',
  );
  const question = questions.find((q) => q.id === input.proposal?.id);
  check(
    question &&
      digest(delivery.reviewProjection(question)) === digest(input.proposal),
    'pacote diverge da proposta',
  );
  check(
    /^docs\/editorial\/[\w./-]+\.json$/.test(reportPath) &&
      !reportPath.split('/').includes('..'),
    'caminho de recuperacao invalido',
  );
  return {
    ...report.scenario,
    execution: {
      kind: 'isolated-editorial-recovered',
      runId: report.originalRunId,
      packageSha256: delivery.packageHash(questions),
      proposalSha256: digest(input.proposal),
      agent: 'pedagogical_quality',
      pass: input.requestedPass,
      completedAt: report.sourceReceipt.completedAt,
      testOnly: false,
      recoveryEvidencePath: reportPath,
      recoverySha256: report.sha256,
    },
  };
}
module.exports = { MESSAGE, inspect, recover, validateReport, reviewScenario };
