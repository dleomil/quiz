const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  AUDIT_SCHEMA,
  BUNDLE_SCHEMA,
  LEDGER_SCHEMA,
  MAX_INPUT_BYTES,
  appendRecordSet,
  auditLedger,
  createBundle,
  exportBundle,
  initializeLedger,
  loadLedger,
  serialize,
  syncBundle,
  validateBundle,
  validateLedger,
} = require('../../scripts/agent-record-ledger.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const SERVER = path.join(ROOT, 'scripts', 'agent-record-ledger.cjs');
const fixture = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'tests', 'fixtures', 'agents', 'execution-record-set.json'),
    'utf8',
  ),
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function record(capabilityId) {
  return clone(
    fixture.records.find(
      (candidate) => candidate.capabilityId === capabilityId,
    ),
  );
}

function recordSet(records) {
  return { schemaVersion: 'agent-execution-record-set-v1', records };
}

function workspace() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-ledger-'));
  const ledger = path.join(root, 'ledger');
  fs.mkdirSync(ledger);
  return { root, ledger };
}

function remove(root) {
  fs.rmSync(root, { recursive: true, force: true });
}

function snapshot(directory) {
  return fs
    .readdirSync(directory)
    .sort()
    .map((entry) => [
      entry,
      fs.readFileSync(path.join(directory, entry), 'utf8'),
    ]);
}

function runCli(args) {
  return spawnSync(process.execPath, [SERVER, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

assert.equal(LEDGER_SCHEMA, 'agent-execution-ledger-v1');
assert.equal(BUNDLE_SCHEMA, 'agent-execution-sync-bundle-v1');
assert.equal(AUDIT_SCHEMA, 'agent-execution-audit-report-v1');
[
  'agent-execution-ledger.schema.json',
  'agent-execution-sync-bundle.schema.json',
  'agent-execution-audit-report.schema.json',
].forEach((name) => {
  assert.doesNotThrow(() =>
    JSON.parse(fs.readFileSync(path.join(ROOT, 'config', name), 'utf8')),
  );
});

{
  const { root, ledger } = workspace();
  try {
    const producer = record('implementation-author');
    const verifier = record('verification');
    const reviewer = record('pull-request-review');
    const initialized = initializeLedger(ledger, recordSet([producer]));
    assert.equal(initialized.revision, 1);
    assert.equal(initialized.recordCount, 1);
    assert.deepEqual(fs.readdirSync(ledger), ['ledger.json']);

    const initialAudit = auditLedger(ledger);
    assert.equal(initialAudit.schemaVersion, AUDIT_SCHEMA);
    assert.equal(initialAudit.status, 'clean');
    assert.equal(initialAudit.recordCount, 1);

    const beforeDryRun = snapshot(ledger);
    const dryRun = appendRecordSet(ledger, recordSet([verifier]), {
      dryRun: true,
    });
    assert.equal(dryRun.changed, true);
    assert.equal(dryRun.addedCount, 1);
    assert.deepEqual(snapshot(ledger), beforeDryRun);

    const appended = appendRecordSet(ledger, recordSet([verifier]));
    assert.equal(appended.revision, 2);
    assert.equal(appended.addedCount, 1);
    const loaded = loadLedger(ledger);
    assert.equal(loaded.recordSet.records.length, 2);
    assert.deepEqual(validateLedger(loaded.ledger).errors, []);

    const duplicate = appendRecordSet(ledger, recordSet([verifier]));
    assert.equal(duplicate.changed, false);
    assert.equal(loadLedger(ledger).ledger.revisions.length, 2);

    const conflict = clone(verifier);
    conflict.outcome.summary = 'Conflicting immutable record.';
    const beforeConflict = snapshot(ledger);
    assert.throws(
      () => appendRecordSet(ledger, recordSet([conflict])),
      /conflito/,
    );
    assert.deepEqual(snapshot(ledger), beforeConflict);

    const unknownTopLevel = recordSet([reviewer]);
    unknownTopLevel.extra = true;
    assert.throws(
      () => appendRecordSet(ledger, unknownTopLevel),
      /schema invalido/,
    );
    assert.throws(
      () => appendRecordSet(ledger, recordSet([reviewer, clone(reviewer)])),
      /duplicado/,
    );

    const executionConflict = clone(reviewer);
    executionConflict.executionId = verifier.executionId;
    assert.throws(
      () => appendRecordSet(ledger, recordSet([executionConflict])),
      /conflito/,
    );

    const beforeFailure = snapshot(ledger);
    const rename = fs.renameSync;
    fs.renameSync = () => {
      throw new Error('simulated atomic replacement failure');
    };
    try {
      assert.throws(() => appendRecordSet(ledger, recordSet([reviewer])));
    } finally {
      fs.renameSync = rename;
    }
    assert.deepEqual(snapshot(ledger), beforeFailure);

    fs.writeFileSync(path.join(ledger, 'ledger.lock'), 'busy');
    assert.throws(() => appendRecordSet(ledger, recordSet([reviewer])));
    assert.equal(
      fs.readFileSync(path.join(ledger, 'ledger.lock'), 'utf8'),
      'busy',
    );
    fs.unlinkSync(path.join(ledger, 'ledger.lock'));

    const tampered = clone(loadLedger(ledger).ledger);
    tampered.revisions[0].addedRecords[0].outcome.summary = 'tampered';
    assert.ok(
      validateLedger(tampered).errors.some((error) => error.includes('sha256')),
    );

    const brokenPredecessor = clone(loadLedger(ledger).ledger);
    brokenPredecessor.revisions[1].previousSha256 = '0'.repeat(64);
    assert.ok(
      validateLedger(brokenPredecessor).errors.some((error) =>
        error.includes('previousSha256'),
      ),
    );

    const brokenOrder = clone(loadLedger(ledger).ledger);
    brokenOrder.revisions[1].revision = 8;
    assert.ok(
      validateLedger(brokenOrder).errors.some((error) =>
        error.includes('fora de ordem'),
      ),
    );
  } finally {
    remove(root);
  }
}

{
  const first = workspace();
  const second = workspace();
  try {
    const producer = record('implementation-author');
    const verifier = record('verification');
    initializeLedger(first.ledger, recordSet([producer]));
    appendRecordSet(first.ledger, recordSet([verifier]));
    initializeLedger(second.ledger, recordSet([producer]));

    const bundleOne = path.join(first.root, 'bundle-one.json');
    const bundleTwo = path.join(first.root, 'bundle-two.json');
    const firstExport = exportBundle(first.ledger, bundleOne);
    exportBundle(first.ledger, bundleTwo);
    assert.equal(
      serialize(createBundle(recordSet([verifier, producer]))),
      serialize(firstExport.bundle),
    );
    assert.equal(
      fs.readFileSync(bundleOne, 'utf8'),
      fs.readFileSync(bundleTwo, 'utf8'),
    );
    assert.deepEqual(validateBundle(firstExport.bundle), []);
    assert.equal(fs.statSync(bundleOne).mode & 0o777, 0o600);
    const unsortedBundle = clone(firstExport.bundle);
    unsortedBundle.recordSet.records.reverse();
    assert.ok(
      validateBundle(unsortedBundle).some((error) =>
        error.includes('ordem canonica'),
      ),
    );

    const beforeDryRun = snapshot(second.ledger);
    const dryRun = syncBundle(second.ledger, firstExport.bundle, {
      dryRun: true,
    });
    assert.equal(dryRun.addedCount, 1);
    assert.deepEqual(snapshot(second.ledger), beforeDryRun);
    syncBundle(second.ledger, firstExport.bundle);

    const secondBundle = path.join(second.root, 'bundle.json');
    exportBundle(second.ledger, secondBundle);
    assert.equal(
      fs.readFileSync(bundleOne, 'utf8'),
      fs.readFileSync(secondBundle, 'utf8'),
    );

    const divergentBundle = clone(firstExport.bundle);
    divergentBundle.recordSet.records[0].outcome.summary = 'changed';
    assert.ok(
      validateBundle(divergentBundle).some((error) => error.includes('sha256')),
    );
    assert.throws(() => syncBundle(second.ledger, divergentBundle));

    assert.throws(() => exportBundle(first.ledger, bundleOne), /ja existe/);
    assert.throws(
      () => exportBundle(first.ledger, path.join(first.ledger, 'bundle.json')),
      /ledger-dir/,
    );
    const failedOutput = path.join(first.root, 'failed-output.json');
    const write = fs.writeFileSync;
    fs.writeFileSync = () => {
      throw new Error('simulated output failure');
    };
    try {
      assert.throws(() => exportBundle(first.ledger, failedOutput));
    } finally {
      fs.writeFileSync = write;
    }
    assert.equal(fs.existsSync(failedOutput), false);
  } finally {
    remove(first.root);
    remove(second.root);
  }
}

{
  const { root, ledger } = workspace();
  try {
    const producer = record('implementation-author');
    const reviewer = record('pull-request-review');
    reviewer.outcome.status = 'adjustments-required';
    reviewer.findings = [
      {
        id: 'fixture-open-finding',
        severity: 'major',
        criterion: 'Fixture criterion',
        summary: 'Fixture finding.',
        evidenceIds: [reviewer.evidence[0].id],
        recommendation: 'Adjust fixture.',
        status: 'open',
      },
    ];
    initializeLedger(ledger, recordSet([producer, reviewer]));
    const reportOne = path.join(root, 'audit-one.json');
    const reportTwo = path.join(root, 'audit-two.json');
    const report = auditLedger(ledger, reportOne);
    auditLedger(ledger, reportTwo);
    assert.equal(report.status, 'attention-required');
    assert.equal(report.openFindings.length, 1);
    assert.equal(
      fs.readFileSync(reportOne, 'utf8'),
      fs.readFileSync(reportTwo, 'utf8'),
    );
  } finally {
    remove(root);
  }
}

{
  const { root, ledger } = workspace();
  try {
    const input = path.join(root, 'records.json');
    fs.writeFileSync(
      input,
      serialize(recordSet([record('implementation-author')])),
    );
    fs.writeFileSync(path.join(ledger, 'keep.txt'), 'keep');
    const nonEmpty = runCli(['init', '--ledger-dir', ledger, '--input', input]);
    assert.equal(nonEmpty.status, 1);
    assert.equal(nonEmpty.stderr, 'agent-record-ledger: operation failed\n');
    fs.unlinkSync(path.join(ledger, 'keep.txt'));
    const initialized = runCli([
      'init',
      '--ledger-dir',
      ledger,
      '--input',
      input,
    ]);
    assert.equal(initialized.status, 0, initialized.stderr);
    const audit = runCli(['audit', '--ledger-dir', ledger]);
    assert.equal(audit.status, 0, audit.stderr);
    assert.match(audit.stdout, /clean/);

    const before = snapshot(ledger);
    const dryRun = runCli([
      'append',
      '--ledger-dir',
      ledger,
      '--input',
      input,
      '--dry-run',
    ]);
    assert.equal(dryRun.status, 0, dryRun.stderr);
    assert.deepEqual(snapshot(ledger), before);

    const linkedInput = path.join(root, 'linked-input.json');
    fs.symlinkSync(input, linkedInput);
    assert.equal(
      runCli(['append', '--ledger-dir', ledger, '--input', linkedInput]).status,
      1,
    );

    fs.writeFileSync(path.join(ledger, 'extra.json'), '{}');
    assert.equal(runCli(['audit', '--ledger-dir', ledger]).status, 1);
    fs.unlinkSync(path.join(ledger, 'extra.json'));

    const linked = path.join(root, 'linked-ledger');
    fs.symlinkSync(ledger, linked);
    assert.equal(runCli(['audit', '--ledger-dir', linked]).status, 1);

    const oversized = path.join(root, 'oversized.json');
    fs.writeFileSync(oversized, Buffer.alloc(MAX_INPUT_BYTES + 1));
    assert.equal(
      runCli(['append', '--ledger-dir', ledger, '--input', oversized]).status,
      1,
    );
  } finally {
    remove(root);
  }
}

{
  const root = fs.mkdtempSync(path.join(ROOT, '.agent-ledger-test-'));
  try {
    assert.throws(
      () =>
        initializeLedger(root, recordSet([record('implementation-author')])),
      /fora do repositorio/,
    );
  } finally {
    remove(root);
  }
}

const source = fs.readFileSync(SERVER, 'utf8');
['node:http', 'node:https', 'node:net', 'node:dns'].forEach((moduleName) => {
  assert.doesNotMatch(source, new RegExp(`require\\(['"]${moduleName}`));
});

process.stdout.write('agent-record-ledger: ok\n');
