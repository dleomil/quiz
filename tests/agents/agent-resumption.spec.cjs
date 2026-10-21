const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { fixtureRepository, commentFor } = require('./context-test-support.cjs');
const { fakeCli } = require('./evaluation-test-support.cjs');
const { initializeProfile } = require('../../scripts/agent-auth.cjs');
const { makeReceipt } = require('../../scripts/agent-run-receipt.cjs');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-resumption-'));
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
  const comment = path.join(directory, 'comment.json');
  fs.writeFileSync(comment, JSON.stringify(commentFor(root)));
  const invoke = (slot, mode = 'ok') =>
    spawnSync(
      process.execPath,
      [
        path.join(root, 'scripts/run-model-evaluation.cjs'),
        'run',
        '--auth-home',
        home,
        '--slot',
        slot,
        '--codex-bin',
        fakeCli(directory, root, mode).bin,
        '--test-comment',
        comment,
      ],
      { cwd: root, encoding: 'utf8', timeout: 60000 },
    );
  const replaced = invoke(replacement.id);
  assert.equal(replaced.status, 0, replaced.stderr + replaced.stdout);
  assert.equal(invoke(replacement.id).status, 1);
  for (const slot of campaign.schedule.slice(1)) {
    const result = invoke(
      slot.id,
      slot.id === 'code-1-author-luna' ? 'bad-code' : 'ok',
    );
    assert.equal(
      result.status,
      slot.id === 'code-1-author-luna' ? 1 : 0,
      slot.id + ': ' + result.stderr + result.stdout,
    );
  }
  const repaired = invoke('repair-1');
  assert.equal(repaired.status, 0, repaired.stderr + repaired.stdout);
  const exhausted = e.openCampaign(home, root);
  assert.equal(exhausted.attempts.length, 32);
  assert.throws(() => e.reserve(home, 'repair-2', 'x', null, root), /32/);
  const { report } = require(
    path.join(root, 'scripts/run-model-evaluation.cjs'),
  );
  const summary = report(exhausted);
  assert.equal(summary.completed, true);
  assert.equal(summary.attemptsUsed, 32);
  assert.equal(
    summary.profileMetrics['editorial/editorial-current'].technicalFailures,
    1,
  );
  assert.equal(
    summary.profileMetrics['editorial/editorial-current'].replacements,
    1,
  );
  assert.equal(
    summary.profileMetrics['editorial/editorial-current'].passedAttempts,
    8,
  );
  assert.ok(
    Object.values(summary.categoryEligibility).every((value) => !value),
  );
  for (const [file, bytes] of originals)
    assert.deepEqual(fs.readFileSync(file), bytes);
  const altered = fs.readFileSync(
    path.join(root, 'scripts/agent-output-transport.cjs'),
  );
  fs.writeFileSync(
    path.join(root, 'scripts/agent-output-transport.cjs'),
    altered + '\n',
  );
  assert.throws(() => e.openCampaign(home, root), /fonte mudou/);
  assert.equal(report(e.openCampaign(home, root, true)).attemptsUsed, 32);
  console.log(
    'agent-resumption: ok (historico preservado, reposicao unica, uma correcao e teto de 32)',
  );
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
