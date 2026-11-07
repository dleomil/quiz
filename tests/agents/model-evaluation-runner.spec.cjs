const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { fixtureRepository, commentFor } = require('./context-test-support.cjs');
const {
  fakeCli,
  GOOD_DOCUMENTATION,
} = require('./evaluation-test-support.cjs');
const { initializeProfile } = require('../../scripts/agent-auth.cjs');
const {
  gradeDocumentation,
  gradeVerification,
} = require('../../scripts/agent-evaluation-grading.cjs');
const { execute } = require('../../scripts/agent-process.cjs');

async function main() {
  const original = path.resolve(__dirname, '../..');
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-evaluation-runner-'),
  );
  try {
    const root = fixtureRepository(original, directory);
    const home = initializeProfile(path.join(directory, 'dummy-auth'));
    const comment = path.join(directory, 'comment.json');
    fs.writeFileSync(comment, JSON.stringify(commentFor(root)));
    const driver = path.join(root, 'scripts/run-model-evaluation.cjs');
    const invoke = (command, mode = 'ok', extra = [], campaignHome = home) => {
      const fake = fakeCli(directory, root, mode);
      return spawnSync(
        process.execPath,
        [
          driver,
          command,
          '--auth-home',
          campaignHome,
          '--codex-bin',
          fake.bin,
          '--test-comment',
          comment,
          ...extra,
        ],
        {
          cwd: root,
          encoding: 'utf8',
          timeout: 60000,
          env: { PATH: process.env.PATH, OPENAI_API_KEY: 'fixture-nao-herdar' },
        },
      );
    };
    const init = invoke('init');
    assert.equal(init.status, 0, init.stderr);
    assert.equal(invoke('init').status, 1);
    const evaluation = require(path.join(root, 'scripts/agent-evaluation.cjs'));
    assert.equal(evaluation.openCampaign(home, root).attempts.length, 0);
    const notReady = invoke('ready', 'no-model');
    assert.equal(notReady.status, 1);
    assert.equal(evaluation.openCampaign(home, root).attempts.length, 0);
    assert.equal(invoke('ready').status, 0);
    const run = (slot, mode = 'ok') => invoke('run', mode, ['--slot', slot]);
    for (const slot of [
      'historia-valida-editorial-current',
      'historia-em-ingles-editorial-candidate',
      'documentation-1-author-luna',
      'curation-1-author-luna',
      'verification-verifier-candidate',
    ]) {
      const result = run(slot);
      assert.equal(
        result.status,
        0,
        `${slot}: ${result.stderr}\n${result.stdout}`,
      );
    }
    const missed = run('apoio-generico-editorial-candidate', 'missed');
    assert.equal(missed.status, 1);
    const bad = run('code-1-author-luna', 'bad-code');
    assert.equal(bad.status, 1);
    const used = evaluation.openCampaign(home, root).attempts.length;
    assert.equal(run('code-1-author-luna').status, 1);
    assert.equal(evaluation.openCampaign(home, root).attempts.length, used);
    const repaired = run('repair-1');
    assert.equal(repaired.status, 0, repaired.stderr + repaired.stdout);
    const repairedState = evaluation.openCampaign(home, root);
    const repairedResult = evaluation.read(
      path.join(repairedState.directory, 'results', 'repair-1.json'),
    );
    assert.equal(repairedResult.slot.repairOf, 'code-1-author-luna');
    const repairedReceipt = evaluation.read(
      path.join(
        repairedState.directory,
        'runs',
        'repair-1',
        'result.json.receipt.json',
      ),
    );
    assert.equal(repairedReceipt.corrections, 1);
    const failed = run('code-2-author-luna', 'failed-remote');
    assert.equal(failed.status, 1);
    const noLogin = run('curation-2-author-luna', 'no-login');
    assert.equal(noLogin.status, 1);
    const current = evaluation.openCampaign(home, root);
    assert.equal(current.attempts.length, used + 3);
    const preflightFailure = evaluation.read(
      path.join(current.directory, 'results', 'curation-2-author-luna.json'),
    );
    assert.equal(preflightFailure.modelInvocations, 0);
    const remoteFailure = evaluation.read(
      path.join(current.directory, 'results', 'code-2-author-luna.json'),
    );
    assert.equal(remoteFailure.modelInvocations, 1);
    assert.match(remoteFailure.failureReason, /modelo indisponivel/);
    const summary = invoke('report');
    assert.equal(summary.status, 0, summary.stderr);
    const report = JSON.parse(summary.stdout);
    assert.equal(report.testOnly, true);
    assert.equal(report.completed, false);
    assert.ok(
      Object.values(report.categoryEligibility).every(
        (value) => value === false,
      ),
    );
    const log = fs
      .readFileSync(path.join(directory, 'fake-calls.jsonl'), 'utf8')
      .trim()
      .split('\n')
      .map(JSON.parse);
    assert.ok(log.every((item) => item.apiKey === null));
    assert.ok(log.some((item) => item.model === 'gpt-6-luna'));
    assert.ok(log.some((item) => item.model === 'gpt-6.1-sol'));
    assert.ok(log.every((item) => !fs.existsSync(item.cwd)));
    assert.ok(log.every((item) => item.hasOracle === false));
    const output = path.join(
      current.directory,
      'runs',
      'historia-valida-editorial-current',
      'result.json',
    );
    const bytes = fs.readFileSync(output);
    fs.writeFileSync(output, '{}');
    assert.equal(invoke('report').status, 1);
    fs.writeFileSync(output, bytes);

    const completeHome = initializeProfile(
      path.join(directory, 'complete-dummy-auth'),
    );
    assert.equal(invoke('init', 'ok', [], completeHome).status, 0);
    const completeCampaign = evaluation.openCampaign(completeHome, root);
    for (const slot of completeCampaign.campaign.schedule) {
      const completed = invoke('run', 'ok', ['--slot', slot.id], completeHome);
      assert.equal(
        completed.status,
        0,
        `${slot.id}: ${completed.stderr}\n${completed.stdout}`,
      );
    }
    const fullReport = invoke('report', 'ok', [], completeHome);
    assert.equal(fullReport.status, 0, fullReport.stderr);
    const simulated = JSON.parse(fullReport.stdout);
    assert.equal(simulated.completed, true);
    assert.equal(simulated.attemptsUsed, 30);
    assert.equal(simulated.modelInvocationsKnown, 30);
    assert.equal(simulated.usageRecords, 30);
    assert.equal(simulated.testOnly, true);
    assert.equal(
      simulated.profileMetrics['editorial/editorial-current'].initialAttempts,
      8,
    );
    assert.equal(
      simulated.profileMetrics['editorial/editorial-current'].passedAttempts,
      8,
    );
    assert.equal(
      simulated.profileMetrics['editorial/editorial-current'].knownTokens
        .input_tokens,
      960,
    );
    assert.ok(
      Object.values(simulated.categoryEligibility).every(
        (value) => value === false,
      ),
    );

    assert.equal(
      gradeDocumentation(Buffer.from(GOOD_DOCUMENTATION)).passed,
      true,
    );
    assert.equal(
      gradeDocumentation(
        Buffer.from(
          GOOD_DOCUMENTATION.replace('Não requer rede.', 'Requer rede.'),
        ),
      ).passed,
      false,
    );
    assert.equal(
      gradeVerification({
        decision: 'approved',
        findings: [],
        facts: [],
        limitations: [],
      }).passed,
      false,
    );
    await assert.rejects(
      execute(process.execPath, ['-e', 'setTimeout(()=>{},10000)'], {
        timeoutMs: 50,
        input: '',
      }),
      /cinco minutos/,
    );
    await assert.rejects(
      execute(process.execPath, ['-e', 'process.exit(0)'], {
        timeoutMs: 300001,
        input: '',
      }),
      /invalido/,
    );
    process.stdout.write(
      'model-evaluation-runner: ok (fixtures, falhas consumidas, correcao unica e relatorio sem ativacao)\n',
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}
main().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
});
