const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { fixtureRepository, commentFor } = require('./context-test-support.cjs');
const { fakeCli } = require('./evaluation-test-support.cjs');
const { initializeProfile } = require('../../scripts/agent-auth.cjs');
const { makeReceipt } = require('../../scripts/agent-run-receipt.cjs');
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-events-resumption-'),
);
try {
  const root = fixtureRepository(path.resolve(__dirname, '../..'), directory);
  const e = require(path.join(root, 'scripts/agent-evaluation.cjs'));
  const { workFor } = require(
    path.join(root, 'scripts/agent-evaluation-cases.cjs'),
  );
  const { digest } = require(path.join(root, 'scripts/document-catalog.cjs'));
  const home = initializeProfile(path.join(directory, 'dummy-auth'));
  const campaign = e.initialize(home, root, true);
  const initial = e.openCampaign(home, root);
  const first = campaign.schedule[0];
  const { work, document } = workFor(first, initial.configuration, root);
  const reserved = e.reserve(
    home,
    first.id,
    digest(work),
    digest(document),
    root,
  );
  e.claim(reserved.file, home, work, digest(document), true, root);
  const runDirectory = path.join(initial.directory, 'runs', first.id);
  fs.mkdirSync(runDirectory);
  e.write(path.join(runDirectory, 'work.json'), work);
  e.write(path.join(runDirectory, 'input.json'), document);
  const failureReason = 'HTTP 400 invalid_json_schema: allOf';
  const receipt = makeReceipt({
    testOnly: true,
    evaluation: { ticketSha256: reserved.ticket.sha256 },
    result: 'execution-failed',
    modelInvocations: 1,
    failureReason,
  });
  e.write(path.join(runDirectory, 'result.json.receipt.json'), receipt);
  const failed = e.finish(
    home,
    reserved.ticket,
    {
      passed: false,
      grade: { passed: false, errors: [failureReason] },
      hasOutput: false,
      failureReason,
      durationMs: 1,
      modelInvocations: 1,
      receiptSha256: receipt.sha256,
      outputSha256: null,
      usage: null,
      runnerDurationMs: 1,
    },
    root,
  );
  assert.throws(
    () => e.reserve(home, campaign.schedule[1].id, 'x', null, root),
    /incompatibilidade/,
  );
  const originals = new Map(
    [
      reserved.file,
      path.join(initial.directory, 'campaign.json'),
      path.join(initial.directory, 'claims', first.id + '.json'),
      path.join(initial.directory, 'results', first.id + '.json'),
      path.join(runDirectory, 'result.json.receipt.json'),
    ].map((file) => [file, fs.readFileSync(file)]),
  );
  const amendment = JSON.parse(
    fs.readFileSync(path.join(root, 'config/agent-evaluation-resumption.json')),
  );
  Object.assign(amendment, {
    sourceCommit: campaign.sourceCommit,
    failedTicketSha256: reserved.ticket.sha256,
    failedResultSha256: failed.sha256,
    failedReceiptSha256: receipt.sha256,
  });
  fs.writeFileSync(
    path.join(root, 'config/agent-evaluation-resumption.json'),
    JSON.stringify(amendment),
  );
  execFileSync(
    'git',
    ['add', '--', 'config/agent-evaluation-resumption.json'],
    { cwd: root },
  );
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '--quiet',
      '-m',
      'Prepara retomada ficticia',
    ],
    { cwd: root },
  );
  assert.throws(() => e.openCampaign(home, root), /snapshot/);
  const old = e.openCampaign(home, root, true);
  const state = e.stateFingerprint(old);
  assert.throws(() => e.resume(home, '0'.repeat(64), root), /estado/);
  const profileLock = path.join(home, 'quiz-run.lock');
  fs.mkdirSync(profileLock);
  assert.throws(() => e.resume(home, state, root), /EEXIST/);
  assert.ok(fs.existsSync(profileLock));
  fs.rmdirSync(profileLock);
  const corpus = path.join(
    root,
    'tests/fixtures/agent-evaluation/editorial-cases.json',
  );
  const preservedCorpus = fs.readFileSync(corpus);
  const modifiedCorpus = JSON.parse(preservedCorpus);
  modifiedCorpus.cases[0].proposal.question += ' Alteracao nao autorizada.';
  function commitCorpus() {
    execFileSync(
      'git',
      ['add', '--', 'tests/fixtures/agent-evaluation/editorial-cases.json'],
      { cwd: root },
    );
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Fixture',
        '-c',
        'user.email=fixture@example.invalid',
        'commit',
        '--quiet',
        '-m',
        'Confere protecao do corpus ficticio',
      ],
      { cwd: root },
    );
  }
  fs.writeFileSync(corpus, JSON.stringify(modifiedCorpus));
  commitCorpus();
  assert.throws(() => e.resume(home, state, root), /fonte protegida/);
  assert.equal(e.openCampaign(home, root, true).attempts.length, 1);
  fs.writeFileSync(corpus, preservedCorpus);
  commitCorpus();
  const sidecar = e.resume(home, state, root);
  assert.notEqual(sidecar.sourceCommit, sidecar.targetCommit);
  assert.throws(() => e.resume(home, state, root), /retomada/);
  const current = e.openCampaign(home, root);
  assert.equal(current.attempts.length, 1);
  assert.throws(
    () => e.reserve(home, campaign.schedule[1].id, 'x', null, root),
    /primeira tentativa/,
  );
  assert.throws(() => e.resolveSlot(current, 'repair-2'), /reserva/);
  const replacement = e.resolveSlot(current, 'schema-replacement-1');
  assert.equal(replacement.replacementOf, first.id);
  assert.equal(replacement.model, first.model);
  assert.equal(replacement.caseId, first.caseId);
  const secondWork = workFor(replacement, current.configuration, root);
  const second = e.reserve(
    home,
    replacement.id,
    digest(secondWork.work),
    digest(secondWork.document),
    root,
  );
  e.claim(
    second.file,
    home,
    secondWork.work,
    digest(secondWork.document),
    true,
    root,
  );
  const secondDirectory = path.join(current.directory, 'runs', replacement.id);
  fs.mkdirSync(secondDirectory);
  e.write(path.join(secondDirectory, 'work.json'), secondWork.work);
  e.write(path.join(secondDirectory, 'input.json'), secondWork.document);
  const secondReason = 'ferramenta acionada em revisao sem ferramentas';
  const secondReceipt = makeReceipt({
    testOnly: true,
    evaluation: { ticketSha256: second.ticket.sha256 },
    result: 'output-rejected',
    modelInvocations: 1,
    failureReason: secondReason,
  });
  e.write(
    path.join(secondDirectory, 'result.json.receipt.json'),
    secondReceipt,
  );
  const secondResult = e.finish(
    home,
    second.ticket,
    {
      passed: false,
      grade: { passed: false, errors: [secondReason] },
      hasOutput: false,
      failureReason: secondReason,
      durationMs: 1,
      modelInvocations: 1,
      receiptSha256: secondReceipt.sha256,
      outputSha256: null,
      usage: null,
      runnerDurationMs: 1,
    },
    root,
  );
  for (const name of [
    second.file,
    path.join(secondDirectory, 'result.json.receipt.json'),
    path.join(current.directory, 'results', replacement.id + '.json'),
    path.join(current.directory, 'resumption.json'),
  ])
    originals.set(name, fs.readFileSync(name));
  const eventsPlanPath = path.join(
    root,
    'config/agent-evaluation-events-resumption.json',
  );
  const eventsPlan = JSON.parse(fs.readFileSync(eventsPlanPath));
  Object.assign(eventsPlan, {
    sourceCommit: current.configuration.commit,
    parentResumptionSha256: sidecar.sha256,
    failedTicketSha256: second.ticket.sha256,
    failedResultSha256: secondResult.sha256,
    failedReceiptSha256: secondReceipt.sha256,
  });
  fs.writeFileSync(eventsPlanPath, JSON.stringify(eventsPlan));
  function commit(paths) {
    execFileSync('git', ['add', '--', ...paths], { cwd: root });
    execFileSync(
      'git',
      [
        '-c',
        'user.name=Fixture',
        '-c',
        'user.email=fixture@example.invalid',
        'commit',
        '--quiet',
        '-m',
        'Confere retomada sintetica de eventos',
      ],
      { cwd: root },
    );
  }
  commit(['config/agent-evaluation-events-resumption.json']);
  const eventResumption = require(
    path.join(root, 'scripts/agent-evaluation-event-resumption.cjs'),
  );
  const secondState = e.stateFingerprint(e.openCampaign(home, root, true));
  assert.throws(
    () => eventResumption.resumeEvents(home, '0'.repeat(64), root),
    /estado/,
  );
  const resumed = eventResumption.resumeEvents(home, secondState, root);
  assert.deepEqual(resumed.retiredRepairSlots, ['repair-1', 'repair-2']);
  const ready = e.openCampaign(home, root);
  assert.throws(() => e.resolveSlot(ready, 'repair-1'), /reserva/);
  assert.throws(() => e.resolveSlot(ready, 'repair-2'), /reserva/);
  const replacement2 = e.resolveSlot(ready, 'schema-replacement-2');
  assert.equal(replacement2.replacementOf, first.id);
  assert.equal(replacement2.replacesAttempt, replacement.id);
  assert.equal(replacement2.model, first.model);
  assert.throws(
    () => e.reserve(home, campaign.schedule[1].id, 'x', null, root),
    /primeira tentativa/,
  );
  const comment = path.join(directory, 'comment.json');
  fs.writeFileSync(comment, JSON.stringify(commentFor(root)));
  const invoke = (
    command,
    slot,
    mode = 'ok',
    extra = [],
    campaignHome = home,
  ) =>
    spawnSync(
      process.execPath,
      [
        path.join(root, 'scripts/run-model-evaluation.cjs'),
        command,
        '--auth-home',
        campaignHome,
        ...(slot ? ['--slot', slot] : []),
        '--codex-bin',
        fakeCli(directory, root, mode).bin,
        '--test-comment',
        comment,
        ...extra,
      ],
      { cwd: root, encoding: 'utf8', timeout: 60000 },
    );
  const unknown = invoke('run', replacement2.id, 'unknown-event');
  assert.equal(unknown.status, 1, unknown.stderr + unknown.stdout);
  const blocked = e.openCampaign(home, root);
  assert.equal(blocked.attempts.length, 3);
  assert.throws(
    () => e.reserve(home, campaign.schedule[1].id, 'x', null, root),
    /falha tecnica pendente/,
  );
  const captureOutput = path.join(
    blocked.directory,
    'runs',
    replacement2.id,
    'result.json',
  );
  const captureReceipt = e.read(captureOutput + '.receipt.json');
  assert.ok(captureReceipt.captureSha256);
  assert.equal(captureReceipt.usage.input_tokens, 120);
  const manifest = JSON.parse(
    fs.readFileSync(captureOutput + '.capture/manifest.json'),
  );
  assert.equal(manifest.exitCode, 0);
  assert.equal(manifest.diagnosis.reasonCode, 'unknown_item');
  assert.ok(fs.existsSync(captureOutput + '.capture/response.json'));
  const failedBytes = fs.readFileSync(
    path.join(blocked.directory, 'results', replacement2.id + '.json'),
  );
  originals.set(
    path.join(blocked.directory, 'results', replacement2.id + '.json'),
    failedBytes,
  );
  const beforeCalls = fs.readFileSync(
    path.join(directory, 'fake-calls.jsonl'),
    'utf8',
  );
  assert.equal(invoke('analyze', replacement2.id).status, 1);
  assert.equal(
    fs.readFileSync(path.join(directory, 'fake-calls.jsonl'), 'utf8'),
    beforeCalls,
  );
  const parserPath = path.join(root, 'scripts/agent-cli-events.cjs');
  fs.writeFileSync(
    parserPath,
    fs
      .readFileSync(parserPath, 'utf8')
      .replace(
        "['agent_message', 'reasoning', 'plan']",
        "['agent_message', 'reasoning', 'plan', 'future_metadata']",
      ),
  );
  commit(['scripts/agent-cli-events.cjs']);
  const parserState = e.stateFingerprint(e.openCampaign(home, root, true));
  const parserResumption = invoke('resume-parser', null, 'ok', [
    '--expected-state',
    parserState,
  ]);
  assert.equal(
    parserResumption.status,
    0,
    parserResumption.stderr + parserResumption.stdout,
  );
  const analyzed = invoke('analyze', replacement2.id);
  assert.equal(analyzed.status, 0, analyzed.stderr + analyzed.stdout);
  const analysis = JSON.parse(analyzed.stdout);
  assert.equal(analysis.passed, true);
  assert.equal(analysis.modelInvocations, 0);
  assert.equal(
    fs.readFileSync(path.join(directory, 'fake-calls.jsonl'), 'utf8'),
    beforeCalls,
  );
  assert.equal(invoke('analyze', replacement2.id).status, 1);
  const analysisPath = captureOutput + '.analysis.json',
    analysisBytes = fs.readFileSync(analysisPath);
  fs.writeFileSync(analysisPath, '{}');
  assert.equal(invoke('report').status, 1);
  fs.writeFileSync(analysisPath, analysisBytes);
  const rawPath = captureOutput + '.capture/stdout.jsonl',
    rawBytes = fs.readFileSync(rawPath);
  const fingerprint = e.stateFingerprint(e.openCampaign(home, root));
  fs.appendFileSync(rawPath, ' ');
  assert.notEqual(e.stateFingerprint(e.openCampaign(home, root)), fingerprint);
  assert.equal(invoke('report').status, 1);
  fs.writeFileSync(rawPath, rawBytes);
  assert.equal(
    invoke('resume-parser', null, 'ok', [
      '--expected-state',
      e.stateFingerprint(e.openCampaign(home, root)),
    ]).status,
    1,
  );
  for (const slot of campaign.schedule.slice(1)) {
    const result = invoke('run', slot.id);
    assert.equal(
      result.status,
      0,
      slot.id + ': ' + result.stderr + result.stdout,
    );
  }
  const report = invoke('report');
  assert.equal(report.status, 0, report.stderr);
  const summary = JSON.parse(report.stdout);
  assert.equal(summary.completed, true);
  assert.equal(summary.attemptsUsed, 32);
  assert.equal(summary.modelInvocationsKnown, 32);
  assert.equal(
    summary.results.find((item) => item.slot.id === replacement2.id).analysis
      .passed,
    true,
  );
  assert.ok(
    Object.values(summary.categoryEligibility).every((value) => !value),
  );
  for (const category of ['code', 'documentation', 'verification']) {
    const isolatedHome = initializeProfile(
      path.join(directory, `${category}-forbidden-auth`),
    );
    e.initialize(isolatedHome, root, true);
    const isolated = e.openCampaign(isolatedHome, root);
    const slot = isolated.campaign.schedule.find(
      (item) => item.category === category,
    );
    const forbidden = invoke(
      'run',
      slot.id,
      'forbidden-tool',
      [],
      isolatedHome,
    );
    assert.equal(forbidden.status, 1, forbidden.stderr + forbidden.stdout);
    const capturedOutput = path.join(
      isolated.directory,
      'runs',
      slot.id,
      'result.json',
    );
    const capturedReceipt = e.read(capturedOutput + '.receipt.json');
    assert.equal(capturedReceipt.eventDiagnosis.reasonCode, 'forbidden_tool');
    assert.equal(capturedReceipt.usage.input_tokens, 120);
    const forbiddenReport = invoke('report', null, 'ok', [], isolatedHome);
    assert.equal(forbiddenReport.status, 0, forbiddenReport.stderr);
    assert.equal(
      JSON.parse(forbiddenReport.stdout).results[0].failureClass,
      'forbidden_tool',
    );
    assert.ok(
      fs.existsSync(
        capturedOutput +
          '.capture/' +
          (category === 'verification' ? 'response.json' : 'proposal.json'),
      ),
    );
    const callsBefore = fs.readFileSync(
      path.join(directory, 'fake-calls.jsonl'),
      'utf8',
    );
    assert.equal(invoke('analyze', slot.id, 'ok', [], isolatedHome).status, 1);
    assert.equal(
      fs.readFileSync(path.join(directory, 'fake-calls.jsonl'), 'utf8'),
      callsBefore,
    );
  }
  assert.throws(() => e.reserve(home, 'repair-1', 'x', null, root), /32/);
  for (const [file, bytes] of originals)
    assert.deepEqual(fs.readFileSync(file), bytes);
  console.log(
    'agent-events-resumption: ok (duas falhas preservadas, analise sem chamada, parser unico, 30 casos e teto de 32)',
  );
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
