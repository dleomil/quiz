const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { fixtureRepository, commentFor } = require('./context-test-support.cjs');
const { fakeCli } = require('./evaluation-test-support.cjs');
const { initializeProfile } = require('../../scripts/agent-auth.cjs');
const { readBytes } = require('../../scripts/agent-event-capture.cjs');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-benchmark-v2-'));
try {
  const root = fixtureRepository(path.resolve(__dirname, '../..'), directory);
  const e = require(path.join(root, 'scripts/agent-evaluation.cjs'));
  const b = require(path.join(root, 'scripts/agent-evaluation-benchmark.cjs'));
  const { workFor } = require(
    path.join(root, 'scripts/agent-evaluation-cases.cjs'),
  );
  const { digest } = require(path.join(root, 'scripts/document-catalog.cjs'));
  const { makeReceipt } = require(
    path.join(root, 'scripts/agent-run-receipt.cjs'),
  );
  const home = initializeProfile(path.join(directory, 'dummy-auth'));
  const comment = path.join(directory, 'comment.json');
  fs.writeFileSync(comment, JSON.stringify(commentFor(root)));
  const campaign = e.initialize(home, root, true);
  let current = e.openCampaign(home, root);
  const driver = path.join(root, 'scripts/run-model-evaluation.cjs');
  const invoke = (
    command,
    extra = [],
    mode = 'startup-warnings',
    env = process.env,
  ) => {
    const fake = fakeCli(directory, root, mode);
    return spawnSync(
      process.execPath,
      [
        driver,
        command,
        '--auth-home',
        home,
        '--codex-bin',
        fake.bin,
        '--test-comment',
        comment,
        ...extra,
      ],
      { cwd: root, encoding: 'utf8', timeout: 60000, env },
    );
  };
  function failed(id, reason) {
    current = e.openCampaign(home, root);
    const slot = e.resolveSlot(current, id),
      input = workFor(slot, current.configuration, root);
    const reserved = e.reserve(
      home,
      id,
      digest(input.work),
      digest(input.document),
      root,
    );
    e.claim(
      reserved.file,
      home,
      input.work,
      digest(input.document),
      true,
      root,
    );
    const run = path.join(current.directory, 'runs', id);
    fs.mkdirSync(run);
    e.write(path.join(run, 'work.json'), input.work);
    e.write(path.join(run, 'input.json'), input.document);
    const receipt = makeReceipt({
      testOnly: true,
      evaluationOnly: true,
      evaluation: { ticketSha256: reserved.ticket.sha256 },
      modelInvocations: 1,
      result: 'output-rejected',
      failureReason: reason,
    });
    e.write(path.join(run, 'result.json.receipt.json'), receipt);
    const result = e.finish(
      home,
      reserved.ticket,
      {
        passed: false,
        grade: { passed: false, errors: [reason] },
        hasOutput: false,
        failureReason: reason,
        durationMs: 1,
        modelInvocations: 1,
        receiptSha256: receipt.sha256,
        outputSha256: null,
        usage: null,
        runnerDurationMs: 1,
      },
      root,
    );
    return { ticket: reserved.ticket, receipt, result };
  }
  const first = failed(
    campaign.schedule[0].id,
    'HTTP 400 invalid_json_schema: allOf',
  );
  const firstRecord = e.sealed({
    campaignSha256: campaign.sha256,
    sourceCommit: campaign.sourceCommit,
    targetCommit: current.configuration.commit,
    targetPlanSha256: current.configuration.sha256,
    targetSnapshot: current.configuration.snapshot,
    amendmentSha256: digest(
      e.read(path.join(root, 'config/agent-evaluation-resumption.json')),
    ),
    failedSlot: first.ticket.slot.id,
    failedTicketSha256: first.ticket.sha256,
    replacementSlot: 'schema-replacement-1',
    retiredRepairSlot: 'repair-2',
  });
  e.write(path.join(current.directory, 'resumption.json'), firstRecord);
  const second = failed(
    'schema-replacement-1',
    'ferramenta acionada em revisao sem ferramentas',
  );
  const { sha256: firstHash, ...firstPayload } = firstRecord;
  const eventRecord = e.sealed({
    ...firstPayload,
    kind: 'events',
    previousResumptionSha256: firstHash,
    amendmentPath: 'config/agent-evaluation-events-resumption.json',
    amendmentSha256: digest(
      e.read(path.join(root, 'config/agent-evaluation-events-resumption.json')),
    ),
    maximumAttempts: 32,
    replacementSlot: 'schema-replacement-2',
    replacementPredecessor: second.ticket.slot.id,
    retiredRepairSlots: ['repair-1', 'repair-2'],
  });
  e.write(path.join(current.directory, 'event-resumption.json'), eventRecord);
  const third = invoke(
    'run',
    ['--slot', 'schema-replacement-2'],
    'unknown-event',
  );
  assert.equal(third.status, 1, third.stderr + third.stdout);
  current = e.openCampaign(home, root, true);
  assert.equal(current.attempts.length, 3);
  const originalState = e.stateFingerprint(current);
  const originals = new Map();
  function preserve(relative) {
    const file = path.join(current.directory, relative);
    if (fs.lstatSync(file).isDirectory())
      for (const name of fs.readdirSync(file)) preserve(`${relative}/${name}`);
    else originals.set(file, readBytes(file));
  }
  for (const name of [
    'campaign.json',
    'resumption.json',
    'event-resumption.json',
    'attempts',
    'claims',
    'results',
    'runs',
  ])
    preserve(name);
  const configFile = path.join(root, b.PLAN);
  const config = e.read(configFile);
  config.legacySourceCommit = current.configuration.commit;
  config.parentResumptionSha256 = eventRecord.sha256;
  config.expectedStateSha256 = originalState;
  config.legacy = current.attempts
    .sort(
      (a, c) =>
        [
          'historia-valida-editorial-current',
          'schema-replacement-1',
          'schema-replacement-2',
        ].indexOf(a.slot.id) -
        [
          'historia-valida-editorial-current',
          'schema-replacement-1',
          'schema-replacement-2',
        ].indexOf(c.slot.id),
    )
    .map((ticket) => {
      const result = e.read(
        path.join(current.directory, 'results', `${ticket.slot.id}.json`),
      );
      const receipt = e.read(
        path.join(
          current.directory,
          'runs',
          ticket.slot.id,
          'result.json.receipt.json',
        ),
      );
      return {
        id: ticket.slot.id,
        ticketSha256: ticket.sha256,
        resultSha256: result.sha256,
        receiptSha256: receipt.sha256,
        captureSha256: receipt.captureSha256 || null,
      };
    });
  function commitConfig(value) {
    fs.writeFileSync(configFile, JSON.stringify(value));
    execFileSync('git', ['add', '--', b.PLAN], { cwd: root });
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
        'Confere pacote sintetico v2',
      ],
      { cwd: root },
    );
  }
  const invalid = JSON.parse(JSON.stringify(config));
  invalid.curriculum.historia.objective =
    'Avaliar somente a passagem solicitada da proposta.';
  commitConfig(invalid);
  assert.throws(() => b.checkBenchmark(home, root), /objetivo curricular/);
  invalid.curriculum.historia.objective = config.curriculum.historia.objective;
  invalid.cases[0].proposal.skill = 'outra-habilidade';
  commitConfig(invalid);
  assert.throws(() => b.checkBenchmark(home, root), /contexto curricular/);
  commitConfig(config);
  assert.throws(() => e.openCampaign(home, root), /snapshot/);
  const pack = b.checkBenchmark(home, root);
  assert.equal(pack.agenda.length, 28);
  assert.equal(pack.projectedTotal, 31);
  assert.equal(pack.modelInvocations, 0);
  assert.equal(new Set(pack.agenda.map((row) => row.slot.model)).size, 3);
  assert.ok(
    pack.agenda.every(
      (row) =>
        row.slot.id.startsWith('v2-') && row.slot.category !== 'verification',
    ),
  );
  assert.ok(
    pack.agenda
      .filter((row) => row.document)
      .every(
        (row) => row.work.objective !== row.document.input.authorizedObjective,
      ),
  );
  assert.ok(
    pack.agenda[0].document.input.proposal.question.includes('diversidade'),
  );
  assert.equal(
    e.stateFingerprint(e.openCampaign(home, root, true)),
    originalState,
  );
  const approvalFile = path.join(directory, 'approval.json');
  assert.throws(
    () => b.revise(home, originalState, approvalFile, root),
    /ENOENT/,
  );
  const approval = {
    schemaVersion: 'agent-benchmark-human-approval-v2',
    origin: 'user-session',
    actor: 'dleomil',
    decision: 'approved',
    testOnly: true,
    sourceCommit: pack.sourceCommit,
    packageSha256: pack.sha256,
    stateSha256: pack.stateSha256,
    statement: 'Aceite exclusivamente ficticio para este teste.',
    approvedAt: new Date().toISOString(),
  };
  function saveApproval(changes = {}) {
    fs.writeFileSync(
      approvalFile,
      JSON.stringify(e.sealed({ ...approval, ...changes })),
    );
  }
  for (const changes of [
    { packageSha256: '0'.repeat(64) },
    { sourceCommit: '0'.repeat(40) },
    { origin: 'automation' },
    { testOnly: false },
  ]) {
    saveApproval(changes);
    assert.throws(
      () => b.revise(home, originalState, approvalFile, root),
      /aprovacao humana/,
    );
  }
  saveApproval();
  assert.throws(
    () => b.revise(home, '0'.repeat(64), approvalFile, root),
    /estado mudou/,
  );
  const record = b.revise(home, originalState, approvalFile, root);
  assert.equal(record.packageSha256, pack.sha256);
  assert.throws(
    () => b.revise(home, originalState, approvalFile, root),
    /estado mudou/,
  );
  current = e.openCampaign(home, root);
  for (const id of [
    'repair-1',
    'repair-2',
    'schema-replacement-2',
    'verification-verifier-candidate',
    'historia-valida-editorial-current',
  ])
    assert.throws(
      () => e.reserve(home, id, 'x', null, root),
      /agenda v2|fora de ordem/,
    );
  assert.throws(
    () => e.reserve(home, pack.agenda[1].slot.id, 'x', null, root),
    /fora de ordem/,
  );
  const noHostPath = path.join(directory, 'path-without-code-mode-host');
  fs.mkdirSync(noHostPath);
  fs.symlinkSync(process.execPath, path.join(noHostPath, 'node'));
  const gitExecutable = process.env.PATH.split(path.delimiter)
    .map((entry) => path.join(entry, 'git'))
    .find((candidate) => fs.existsSync(candidate));
  assert.ok(gitExecutable);
  fs.symlinkSync(gitExecutable, path.join(noHostPath, 'git'));
  const notReady = invoke('ready', [], 'no-host', {
    ...process.env,
    PATH: noHostPath,
  });
  assert.notEqual(notReady.status, 0);
  assert.match(notReady.stderr, /host de Code Mode indisponivel/);
  const ready = invoke('ready');
  assert.equal(ready.status, 0, ready.stderr);
  const proof = JSON.parse(ready.stdout);
  assert.equal(proof.contextsChecked, 5);
  assert.equal(Object.keys(proof.proofs).length, 3);
  assert.equal(proof.modelInvocations, 0);
  for (const [index, item] of pack.agenda.slice(0, 26).entries()) {
    // Uma falha de qualidade continua contando; nao permite correcao ou repeticao.
    const outputRejected = index === 25;
    const expectedFailure = index === 4 || outputRejected;
    const completed = invoke(
      'run',
      ['--slot', item.slot.id],
      index === 4
        ? 'missed'
        : outputRejected
          ? 'rejected-curation'
          : 'startup-warnings',
    );
    assert.equal(
      completed.status,
      expectedFailure ? 1 : 0,
      `${item.slot.id}: ${completed.stderr}\n${completed.stdout}`,
    );
    if (index === 0) {
      const active = e.openCampaign(home, root);
      const file = path.join(
        active.directory,
        'runs',
        item.slot.id,
        'result.json.receipt.json',
      );
      const original = fs.readFileSync(file),
        changed = e.read(file);
      changed.result = 'output-rejected';
      const { sha256: _ignored, ...payload } = changed;
      fs.writeFileSync(file, JSON.stringify(e.sealed(payload)));
      assert.throws(
        () => e.reserve(home, pack.agenda[1].slot.id, 'x', null, root),
        /falha tecnica|divergente/,
      );
      fs.writeFileSync(file, original);
    }
  }
  current = e.openCampaign(home, root);
  assert.equal(current.attempts.length, 29);
  const partialReport = JSON.parse(invoke('report').stdout);
  const rejectedResult = partialReport.results.find(
    (item) => item.slot.id === 'v2-curation-1-author-sol',
  );
  assert.equal(rejectedResult.failureClass, 'output_validation');
  assert.equal(rejectedResult.technicalFailure, false);
  assert.equal(partialReport.completed, false);
  fs.appendFileSync(
    path.join(root, 'docs/agents/model-evaluation-runbook.md'),
    '\nAtualizacao nao normativa do fixture de continuacao.\n',
  );
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'add',
      'docs/agents/model-evaluation-runbook.md',
    ],
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
      'Prepara adendo sintetico',
    ],
    { cwd: root },
  );
  const continuationCheck = invoke('continuation-check');
  assert.equal(
    continuationCheck.status,
    0,
    continuationCheck.stderr + continuationCheck.stdout,
  );
  const continuationPackage = JSON.parse(continuationCheck.stdout);
  assert.equal(continuationPackage.attemptsUsed, 29);
  assert.deepEqual(
    continuationPackage.slots.map((slot) => slot.id),
    ['v2-curation-2-author-sol', 'v2-curation-2-author-luna'],
  );
  const continuationApprovalFile = path.join(
    directory,
    'continuation-approval.json',
  );
  const continuationApproval = {
    schemaVersion: 'agent-benchmark-v2-continuation-approval-v1',
    origin: 'user-session',
    actor: 'dleomil',
    decision: 'approved',
    testOnly: true,
    sourceCommit: continuationPackage.targetCommit,
    packageSha256: continuationPackage.sha256,
    stateSha256: continuationPackage.stateSha256,
    statement: 'Aceite exclusivamente ficticio para este teste.',
    approvedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    continuationApprovalFile,
    JSON.stringify(e.sealed(continuationApproval)),
  );
  const continuation = invoke('continue-benchmark', [
    '--expected-state',
    continuationPackage.stateSha256,
    '--approval-file',
    continuationApprovalFile,
  ]);
  assert.equal(
    continuation.status,
    0,
    continuation.stderr + continuation.stdout,
  );
  for (const slot of continuationPackage.slots) {
    const completed = invoke('run', ['--slot', slot.id]);
    assert.equal(completed.status, 0, completed.stderr + completed.stdout);
  }
  current = e.openCampaign(home, root);
  assert.equal(current.attempts.length, 31);
  assert.throws(
    () => e.reserve(home, 'repair-1', 'x', null, root),
    /agenda v2 encerrada/,
  );
  assert.throws(
    () => e.reserve(home, pack.agenda[0].slot.id, 'x', null, root),
    /agenda v2 encerrada/,
  );
  const reportRun = invoke('report');
  assert.equal(reportRun.status, 0, reportRun.stderr);
  const report = JSON.parse(reportRun.stdout);
  assert.equal(report.schemaVersion, 'agent-model-evaluation-report-v2');
  assert.equal(report.attemptsUsed, 31);
  assert.equal(report.benchmarkContinuation.attemptsUsedBeforeContinuation, 29);
  assert.deepEqual(report.benchmarkContinuation.slots, [
    'v2-curation-2-author-sol',
    'v2-curation-2-author-luna',
  ]);
  assert.equal(report.results.length, 28);
  assert.equal(report.legacyDiagnostics.length, 3);
  assert.equal(report.completed, true);
  assert.equal(report.verificationDeferred, true);
  assert.equal(
    report.profileMetrics['editorial/editorial-current'].attemptsConsumed,
    8,
  );
  assert.ok(
    Object.values(report.categoryEligibility).every((value) => value === false),
  );
  assert.equal(
    b.legacyFingerprint(
      current,
      config.legacy.map((row) => row.id),
    ),
    originalState,
  );
  for (const [file, bytes] of originals)
    assert.deepEqual(fs.readFileSync(file), bytes);
  const legacyFile = [...originals.keys()].find((file) =>
    file.endsWith('input.json'),
  );
  const legacyBytes = fs.readFileSync(legacyFile);
  fs.appendFileSync(legacyFile, ' ');
  assert.throws(
    () => e.openCampaign(home, root),
    /historico anterior alterado|bytes historicos/,
  );
  fs.writeFileSync(legacyFile, legacyBytes);
  assert.equal(
    invoke('resume-parser', ['--expected-state', e.stateFingerprint(current)])
      .status,
    1,
  );
  const calls = fs
    .readFileSync(path.join(directory, 'fake-calls.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .map(JSON.parse);
  assert.equal(calls.length, 29);
  assert.ok(calls.every((row) => row.hasOracle === false));
  console.log(
    'agent-benchmark-v2: ok (continuação selada, rejeição de saída, histórico preservado e 3+28=31; somente fixtures)',
  );
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
