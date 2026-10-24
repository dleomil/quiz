const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const auth = require('../../scripts/agent-auth.cjs');
const captures = require('../../scripts/agent-event-capture.cjs');
const comparison = require('../../scripts/agent-verifier-comparison.cjs');
const evaluation = require('../../scripts/agent-evaluation.cjs');
const { digest, readSource } = require('../../scripts/document-catalog.cjs');
const { sha256 } = require('../../scripts/governance-guidelines.cjs');
const recovery = require('../../scripts/agent-verifier-recovery.cjs');

const evidence = {
  'VER-EMPTY': 'reduce sem valor inicial falha para lista vazia',
  'VER-INPUT': 'A entrada aceita valores invalidos e deveria lancar TypeError',
  'VER-EVIDENCE': 'O teste esperava 4 e observou 5, contradizendo o relato',
};

function sourceReader(root) {
  const values = Object.fromEntries(
    comparison.SUPPORT_PATHS.map((name) => [name, readSource(root, name)]),
  );
  return (_commit, name) => values[name];
}

function packageFor(root) {
  const payload = comparison.packagePayload(root);
  return { ...payload, sha256: digest(payload) };
}

function expectedOutput(item, forceControlFinding = false) {
  const findingIds = forceControlFinding
    ? ['VER-EVIDENCE']
    : item.expectedFindings;
  return {
    decision: forceControlFinding ? 'adjustments_required' : item.decision,
    findings: findingIds.map((requirementId) => ({
      requirementId,
      severity: 'major',
      evidence: evidence[requirementId],
    })),
    facts: ['Codigo e testes sinteticos inspecionados.'],
    limitations: ['Amostra pequena.'],
  };
}

function listFiles(directory) {
  return fs
    .readdirSync(directory)
    .sort()
    .flatMap((name) => {
      const file = path.join(directory, name);
      const stat = fs.lstatSync(file);
      return stat.isDirectory()
        ? listFiles(file).map((entry) => `${name}/${entry}`)
        : [name];
    });
}

function makeFixture(root, options = {}) {
  const temp = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-verifier-recovery-test-'),
  );
  fs.chmodSync(temp, 0o700);
  const home = auth.initializeProfile(path.join(temp, 'dedicated-auth'));
  const packageValue = packageFor(root);
  const packageFile = path.join(temp, 'package.json');
  evaluation.write(packageFile, packageValue);
  const campaignDir = path.join(
    home,
    'quiz-evaluations',
    packageValue.campaignId,
  );
  for (const name of ['attempts', 'runs', 'results'])
    fs.mkdirSync(path.join(campaignDir, name), {
      mode: 0o700,
      recursive: true,
    });
  evaluation.write(path.join(campaignDir, 'campaign.json'), {
    schemaVersion: 'agent-verifier-campaign-v1',
    campaignId: packageValue.campaignId,
    packageSha256: packageValue.sha256,
    sourceCommit: packageValue.sourceCommit,
    maximumInvocations: 12,
    testOnly: false,
    createdAt: new Date().toISOString(),
  });

  const cases = comparison.loadConfiguration(root).corpus.cases;
  for (const item of cases)
    for (const variant of ['current', 'candidate']) {
      const slot = `${item.id}-${variant}`;
      const model = packageValue.variants[variant];
      const ticket = evaluation.sealed({
        schemaVersion: 'agent-verifier-ticket-v1',
        campaignId: packageValue.campaignId,
        packageSha256: packageValue.sha256,
        slot,
        caseId: item.id,
        variant,
        model: model.model,
        effort: model.effort,
        sequence: fs.readdirSync(path.join(campaignDir, 'attempts')).length + 1,
        reservedAt: new Date().toISOString(),
      });
      evaluation.write(
        path.join(campaignDir, 'attempts', `${slot}.json`),
        ticket,
      );
      const runDirectory = path.join(campaignDir, 'runs', slot);
      fs.mkdirSync(runDirectory, { mode: 0o700 });
      const responsePath = path.join(runDirectory, 'response.json');
      const capture = captures.createCapture(responsePath, [], {
        authHome: home,
        preflight: {
          cliVersion: auth.CLI_VERSION,
          auth: 'chatgpt-keyring',
          skills: 'disabled-and-context-checked',
          features: Object.fromEntries(
            auth.DISABLED_FEATURES.map((feature) => [feature, false]),
          ),
        },
      });
      const event = (value) => Buffer.from(`${JSON.stringify(value)}\n`);
      capture.append(
        'stdout',
        event({ type: 'thread.started', thread_id: `thread-${slot}` }),
      );
      capture.append(
        'stdout',
        event({
          type: 'item.completed',
          item: {
            id: 'code-mode-disabled',
            type: 'error',
            message:
              'Code Mode is unavailable because code-mode host is disabled. Code mode will fail closed; enable `features.code_mode_host` and install `codex-code-mode-host`.',
          },
        }),
      );
      capture.append('stdout', event({ type: 'turn.started' }));
      capture.append(
        'stdout',
        event({
          type: 'item.completed',
          item: {
            id: 'answer',
            type: 'agent_message',
            text: 'Resposta sintetica capturada.',
          },
        }),
      );
      capture.append(
        'stdout',
        event({
          type: 'turn.completed',
          usage: { input_tokens: 10, cached_input_tokens: 0, output_tokens: 5 },
        }),
      );
      capture.complete(1);
      const output =
        options.invalidResponse === slot
          ? { invalid: true }
          : expectedOutput(
              item,
              variant === 'current' && item.id === 'valid-reducer',
            );
      if (!(options.missingResponse && slot === options.missingResponse))
        capture.save('response.json', output);
      const manifest = capture.finish();
      const result = evaluation.sealed({
        schemaVersion: 'agent-verifier-result-v1',
        campaignId: packageValue.campaignId,
        packageSha256: packageValue.sha256,
        ticketSha256: ticket.sha256,
        slot,
        caseId: item.id,
        variant,
        model: model.model,
        effort: model.effort,
        result: 'execution-failed',
        gradePassed: false,
        failureReason: 'erro de execucao informado pela CLI: error',
        modelInvocations: 1,
        outputSha256: null,
        captureSha256: manifest.sha256,
        completedAt: new Date().toISOString(),
      });
      evaluation.write(
        path.join(campaignDir, 'results', `${slot}.json`),
        result,
      );
      evaluation.write(
        path.join(runDirectory, 'receipt.json'),
        evaluation.sealed({
          runId: `run-${slot}`,
          actor: 'verifier',
          requestedModel: model.model,
          reasoningEffort: model.effort,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: 1,
          result: 'execution-failed',
          failureReason: result.failureReason,
          modelInvocations: 1,
          testOnly: false,
          evaluationOnly: true,
          evaluation: {
            slotId: slot,
            ticketSha256: ticket.sha256,
            approvalSha256: 'a'.repeat(64),
          },
          workSha256: 'b'.repeat(64),
          contextSha256: 'c'.repeat(64),
          approvals: ['a'.repeat(64)],
          preflight: null,
          usage: { input_tokens: 10, cached_input_tokens: 0, output_tokens: 5 },
          artifactSha256: null,
          captureSha256: manifest.sha256,
          eventDiagnosis: manifest.diagnosis,
        }),
      );
    }

  return {
    temp,
    home,
    packageFile,
    campaignDir,
    readCommitted: sourceReader(root),
  };
}

function main() {
  const root = path.resolve(__dirname, '../..');
  const cases = comparison.loadConfiguration(root).corpus.cases;
  const temp = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-verifier-recovery-suite-'),
  );
  fs.chmodSync(temp, 0o700);
  try {
    const fixture = makeFixture(root);
    try {
      const before = listFiles(fixture.campaignDir).map((name) => [
        name,
        sha256(fs.readFileSync(path.join(fixture.campaignDir, name))),
      ]);
      const report = recovery.recover(
        fixture.home,
        fixture.packageFile,
        root,
        fixture.readCommitted,
      );
      assert.equal(report.callsConsumed, 12);
      assert.equal(report.additionalModelInvocations, 0);
      assert.equal(report.recoveredResponsesValidated, 12);
      assert.equal(report.originalReportCompleted, false);
      assert.equal(report.activationEligible, false);
      assert.equal(report.variants.current.technicalFailures, 6);
      assert.equal(report.variants.candidate.technicalFailures, 6);
      assert.equal(report.variants.current.passed, 5);
      assert.equal(report.variants.current.falsePositives, 1);
      assert.equal(report.variants.candidate.passed, 6);
      assert.equal(report.variants.current.inputTokens, 60);
      assert.equal(report.variants.candidate.outputTokens, 30);
      const reportPath = path.join(fixture.temp, 'recovered-report.json');
      recovery.writeReport(reportPath, report, root, fixture.home);
      assert.equal(fs.statSync(reportPath).mode & 0o777, 0o600);
      assert.throws(
        () => recovery.writeReport(reportPath, report, root, fixture.home),
        /EEXIST/,
      );
      const after = listFiles(fixture.campaignDir).map((name) => [
        name,
        sha256(fs.readFileSync(path.join(fixture.campaignDir, name))),
      ]);
      assert.deepEqual(after, before);

      const missing = makeFixture(root, {
        missingResponse: 'valid-reducer-current',
      });
      try {
        assert.throws(
          () =>
            recovery.recover(
              missing.home,
              missing.packageFile,
              root,
              missing.readCommitted,
            ),
          /captura original sem resposta final/,
        );
      } finally {
        fs.rmSync(missing.temp, { recursive: true, force: true });
      }

      const invalidSchema = makeFixture(root, {
        invalidResponse: 'valid-reducer-current',
      });
      try {
        assert.throws(
          () =>
            recovery.recover(
              invalidSchema.home,
              invalidSchema.packageFile,
              root,
              invalidSchema.readCommitted,
            ),
          /campos ausentes ou extras/,
        );
      } finally {
        fs.rmSync(invalidSchema.temp, { recursive: true, force: true });
      }

      const invalid = makeFixture(root);
      try {
        const outputFile = path.join(
          invalid.campaignDir,
          'runs',
          'valid-reducer-current',
          'response.json.capture',
          'response.json',
        );
        fs.writeFileSync(outputFile, '{"invalid":true}\n', { mode: 0o600 });
        assert.throws(
          () =>
            recovery.recover(
              invalid.home,
              invalid.packageFile,
              root,
              invalid.readCommitted,
            ),
          /captura alterada/,
        );
      } finally {
        fs.rmSync(invalid.temp, { recursive: true, force: true });
      }

      const corruptPackage = path.join(fixture.temp, 'corrupt-package.json');
      evaluation.write(corruptPackage, {
        ...JSON.parse(fs.readFileSync(fixture.packageFile, 'utf8')),
        sha256: '0'.repeat(64),
      });
      assert.throws(
        () =>
          recovery.recover(
            fixture.home,
            corruptPackage,
            root,
            fixture.readCommitted,
          ),
        /hash do pacote diverge/,
      );
    } finally {
      fs.rmSync(fixture.temp, { recursive: true, force: true });
    }
    assert.equal(cases.length, 6);
    process.stdout.write(
      'verifier-recovery: 12 respostas offline, sem novas chamadas e ledger imutavel\n',
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

main();
