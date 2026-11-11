const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  inspect,
  MESSAGE,
  validateReport,
  reviewScenario,
} = require('../../scripts/editorial-recovery.cjs');
const {
  createCapture,
  verifyCapture,
} = require('../../scripts/agent-event-capture.cjs');
const { digest } = require('../../scripts/document-catalog.cjs');
const { DISABLED_FEATURES } = require('../../scripts/agent-auth.cjs');
const { editorialSchema } = require('../../scripts/agent-output-transport.cjs');
const scenario = require('../fixtures/agents/editorial-scenarios.json')[0];
const schema = editorialSchema(
  require('../../config/editorial-agent-output.schema.json'),
  'content_curator',
  'ciencias',
);
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-recovery-test-'));
function build(changes = {}) {
  const dest = path.join(directory, String(sequence++));
  fs.mkdirSync(dest);
  const input = {
    scenarioId: scenario.scenarioId,
    inputState: scenario.inputState,
    input: scenario.input,
  };
  const work = {
    id: input.input.workItemId,
    role: 'content-curator',
    subjectId: input.input.subjectId,
    curriculumCycle: input.input.academicYear + '-' + input.input.term,
    documents: [{ sourceCommit: 'fixture' }],
  };
  const preflight = {
    cliVersion: '0.167.1',
    modelCatalogued: 'fixture-model',
    mcpServerCount: 0,
    auth: 'chatgpt-existing-profile',
    skills: 'disabled-and-context-checked',
    features: Object.fromEntries([
      ...DISABLED_FEATURES.map((n) => [n, false]),
      ['skip_host_skill_discovery', true],
    ]),
  };
  const events = [
    { type: 'thread.started' },
    {
      type: 'item.completed',
      item: { id: 'error_1', type: 'error', message: MESSAGE },
    },
    { type: 'turn.started' },
    {
      type: 'item.completed',
      item: { id: 'answer', type: 'agent_message', text: 'Resposta' },
    },
    { type: 'turn.completed' },
  ];
  if (changes.message) events[1].item.message = changes.message;
  if (changes.late) events.splice(3, 0, events.splice(1, 1)[0]);
  if (changes.tool)
    events.splice(3, 0, {
      type: 'item.completed',
      item: { id: 'tool', type: 'command_execution' },
    });
  if (changes.extra)
    events.splice(3, 0, { type: 'error', message: 'outro erro' });
  if (changes.incomplete) events.pop();
  const raw = JSON.parse(JSON.stringify(scenario.output));
  raw.proposal.questionPt = null;
  raw.proposal.wrongExplanations[String(raw.proposal.correctIndex)] = null;
  const response = path.join(dest, 'wire.json');
  fs.writeFileSync(response, JSON.stringify(changes.invalid ? {} : raw));
  const output = path.join(dest, 'out.json');
  const capture = createCapture(output, [], {
    authHome: '/private/profile',
    preflight,
  });
  capture.append(
    'stdout',
    Buffer.from(events.map((e) => JSON.stringify(e)).join('\n') + '\n'),
  );
  capture.complete(changes.exit ?? 0, false);
  const manifest = capture.finish(changes.missing ? undefined : response);
  const body = {
    testOnly: changes.testOnly ?? false,
    modelInvocations: 1,
    result: 'output-rejected',
    inputSha256: digest(input),
    workSha256: digest(work),
    actor: 'content_curator',
    requestedModel: 'fixture-model',
    preflight,
    captureSha256: manifest.sha256,
    approvals: [{ sourceCommit: 'fixture' }],
  };
  return {
    receipt: { ...body, sha256: digest(body) },
    capture: verifyCapture(output, manifest.sha256),
    input,
    work,
    authHome: '/private/profile',
    schema,
  };
}
let sequence = 0;
try {
  const accepted = build();
  assert.equal(
    (
      inspect(accepted).scenario.output.proposal ||
      (inspect(accepted).scenario.output.proposals || [])[0]
    ).id,
    scenario.output.proposal.id,
  );
  const payload = {
    ...accepted.receipt,
    runId: 'fixture-run',
    eventDiagnosis: accepted.capture.manifest.diagnosis,
  };
  delete payload.sha256;
  const originalReceipt = { ...payload, sha256: digest(payload) };
  const result = inspect({ ...accepted, receipt: originalReceipt });
  const data = {
    schemaVersion: 'editorial-recovery-v1',
    status: 'response-recovered',
    originalResult: 'output-rejected',
    additionalModelInvocations: 0,
    publicationEligible: false,
    humanApprovalRequired: true,
    originalRunId: 'fixture-run',
    sourceReceipt: originalReceipt,
    sourceReceiptSha256: originalReceipt.sha256,
    sourceCaptureSha256: originalReceipt.captureSha256,
    sourceCaptureManifest: accepted.capture.manifest,
    sourceWork: accepted.work,
    scenario: result.scenario,
    responseSha256: result.responseSha256,
  };
  const report = { ...data, sha256: digest(data) };
  assert.equal(validateReport(report), true);
  const changed = JSON.parse(JSON.stringify(report));
  changed.originalRunId = 'outro';
  assert.throws(() => validateReport(changed));
  assert.throws(
    () =>
      reviewScenario(
        report,
        [scenario.output.proposal],
        'docs/editorial/fixture.json',
      ),
    /curadoria/,
  );
  const originalBytes = JSON.stringify(originalReceipt);
  validateReport(report);
  assert.equal(JSON.stringify(originalReceipt), originalBytes);
  for (const changes of [
    { message: MESSAGE + '!' },
    { late: true },
    { tool: true },
    { extra: true },
    { incomplete: true },
    { exit: 1 },
    { invalid: true },
    { missing: true },
    { testOnly: true },
  ])
    assert.throws(() => inspect(build(changes)));
  const tampered = build();
  tampered.work.id = 'outro';
  assert.throws(() => inspect(tampered));
  const unsafe = build();
  unsafe.receipt.preflight.features.shell_tool = true;
  const { sha256: _old, ...body } = unsafe.receipt;
  unsafe.receipt.sha256 = digest(body);
  assert.throws(() => inspect(unsafe));
  const delivery = require('../../scripts/content-delivery.cjs');
  const questions = [scenario.output.proposal];
  const refs = [
    { path: 'docs/editorial/fixture-report.json', sha256: 'a'.repeat(64) },
  ];
  const bundle = delivery.digest(refs);
  const hash = delivery.packageHash(questions);
  const record = {
    recoveryReports: refs,
    approval: {
      kind: 'editorial',
      sourceSha256: hash,
      approvedBy: 'dleomil',
      evidenceRef: 'https://github.com/dleomil/quiz/issues/1#issuecomment-1',
      recoveryBundleSha256: bundle,
    },
  };
  const policy = { humanApprovers: ['dleomil'], repository: 'dleomil/quiz' };
  const statement =
    'Aprovo editorialmente o lote ' +
    delivery.batchKey(questions[0]) +
    ' hash ' +
    hash;
  const comment = (body) => () => ({
    html_url: record.approval.evidenceRef,
    created_at: '2026-11-03T00:00:00Z',
    user: { login: 'dleomil', type: 'User' },
    body,
  });
  assert.ok(
    delivery.validateApproval(questions, record, policy, comment(statement))
      .length,
  );
  assert.deepEqual(
    delivery.validateApproval(
      questions,
      record,
      policy,
      comment(statement + '\nReconheco recuperacao editorial hash ' + bundle),
    ),
    [],
  );
  assert.ok(
    delivery.validateApproval(
      questions,
      record,
      policy,
      comment(
        statement + '\nReconheco recuperacao editorial hash ' + 'b'.repeat(64),
      ),
    ).length,
  );
  const fixtureQuestion = {
    ...scenario.output.proposal,
    contentSetId: '2026-t3-v2',
  };
  const fixture =
    require('../helpers/content-delivery-fixtures.cjs').evidenceFor([
      fixtureQuestion,
    ]);
  const first = fixture.documents[fixture.record.reviews[0].evidencePath];
  first.execution.kind = 'isolated-editorial-recovered';
  const read = (name) => {
    if (!fixture.documents[name]) throw new Error('evidencia ausente');
    return fixture.documents[name];
  };
  const deliveryPolicy = require('../../config/content-delivery-policy.json');
  assert.ok(
    delivery
      .validateReviews([fixtureQuestion], fixture.record, read, {
        policy: deliveryPolicy,
        allowTestEvidence: true,
      })
      .some((e) => e.includes('referencia de recuperacao')),
  );
  console.log('editorial-recovery: ok (somente fixtures, sem rede ou modelos)');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
