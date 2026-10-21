const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { fixtureRepository } = require('./context-test-support.cjs');
const { initializeProfile } = require('../../scripts/agent-auth.cjs');
const { digest } = require('../../scripts/document-catalog.cjs');
const { DISABLED_FEATURES } = require('../../scripts/agent-auth.cjs');

const original = path.resolve(__dirname, '../..');
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-evaluation-unit-'),
);
try {
  const root = fixtureRepository(original, directory);
  const evaluation = require(path.join(root, 'scripts/agent-evaluation.cjs'));
  const { workFor } = require(
    path.join(root, 'scripts/agent-evaluation-cases.cjs'),
  );
  const grading = require(
    path.join(root, 'scripts/agent-evaluation-grading.cjs'),
  );
  const editorialFixture = JSON.parse(
    fs.readFileSync(
      path.join(root, 'tests/fixtures/agents/editorial-scenarios.json'),
      'utf8',
    ),
  )[0];
  const falseIsolationBlock = {
    ...editorialFixture,
    output: {
      ...editorialFixture.output,
      decision: 'blocked',
      findings: [
        {
          questionId: editorialFixture.output.proposal.id,
          criterion: 'Isolamento da superfície de ferramentas',
          severity: 'blocking',
          evidence: 'A ferramenta foi mencionada no texto da sessão.',
          recommendation: 'Verificar a prova do runner.',
        },
      ],
    },
  };
  const isolationEvidence = {
    preflight: {
      auth: 'chatgpt-keyring',
      skills: 'disabled-and-context-checked',
      mcpServerCount: 0,
      features: Object.fromEntries(
        DISABLED_FEATURES.map((name) => [name, false]),
      ),
    },
    eventDiagnosis: { accepted: true, issues: [] },
  };
  assert.equal(
    grading.gradeEditorial(editorialFixture, falseIsolationBlock, {
      kind: 'valid',
    }).passed,
    false,
  );
  assert.equal(
    grading.gradeEditorial(
      editorialFixture,
      falseIsolationBlock,
      { kind: 'valid' },
      isolationEvidence,
    ).passed,
    true,
  );
  assert.equal(
    grading.gradeEditorial(
      editorialFixture,
      {
        ...falseIsolationBlock,
        output: {
          ...falseIsolationBlock.output,
          findings: [
            ...falseIsolationBlock.output.findings,
            {
              ...falseIsolationBlock.output.findings[0],
              criterion: 'erro factual',
            },
          ],
        },
      },
      { kind: 'valid' },
      isolationEvidence,
    ).passed,
    false,
  );
  const home = initializeProfile(path.join(directory, 'dummy-auth'));
  const initial = evaluation.initialize(home, root, true);
  assert.equal(initial.maximumAttempts, 32);
  assert.equal(initial.schedule.length, 30);
  assert.equal(
    initial.schedule.filter((item) => item.category === 'editorial').length,
    16,
  );
  assert.equal(
    initial.schedule.filter((item) =>
      ['code', 'documentation', 'curation'].includes(item.category),
    ).length,
    12,
  );
  assert.equal(
    initial.schedule.filter((item) => item.category === 'verification').length,
    2,
  );
  assert.throws(() => evaluation.initialize(home, root, true), /EEXIST/);
  const configuration = evaluation.loadPlan(root);
  const tickets = [];
  function consume(slot, syntheticOutput = false) {
    const { work, document } = workFor(slot, configuration, root);
    const inputHash = document ? digest(document) : null;
    const reserved = evaluation.reserve(
      home,
      slot.id,
      digest(work),
      inputHash,
      root,
    );
    const before = evaluation.openCampaign(home, root).attempts.length;
    assert.throws(
      () =>
        evaluation.claim(
          reserved.file,
          home,
          { ...work, role: 'spec' },
          inputHash,
          true,
          root,
        ),
      /diverge/,
    );
    assert.throws(
      () => evaluation.claim(reserved.file, home, work, inputHash, false, root),
      /diverge/,
    );
    evaluation.claim(reserved.file, home, work, inputHash, true, root);
    assert.throws(
      () => evaluation.claim(reserved.file, home, work, inputHash, true, root),
      /EEXIST/,
    );
    assert.equal(evaluation.openCampaign(home, root).attempts.length, before);
    const result = {
      passed: false,
      grade: { passed: false, errors: ['Falha sintetica de teste.'] },
      hasOutput: syntheticOutput,
      failureReason: null,
      durationMs: 0,
      modelInvocations: 0,
      receiptSha256: null,
      outputSha256: null,
      usage: null,
      runnerDurationMs: 0,
    };
    assert.throws(
      () =>
        evaluation.finish(
          home,
          reserved.ticket,
          { ...result, slot: { id: 'outro' } },
          root,
        ),
      /invalido/,
    );
    evaluation.finish(home, reserved.ticket, result, root);
    assert.throws(
      () => evaluation.reserve(home, slot.id, digest(work), inputHash, root),
      /consumida|32/,
    );
    tickets.push(reserved.ticket);
    return reserved;
  }
  for (const slot of initial.schedule)
    consume(
      slot,
      slot.variant === 'author-luna' &&
        ['code', 'documentation', 'curation'].includes(slot.category),
    );
  assert.equal(evaluation.openCampaign(home, root).attempts.length, 30);
  const firstRepair = evaluation.resolveSlot(
    evaluation.openCampaign(home, root),
    'repair-1',
  );
  assert.equal(firstRepair.repairOf, 'code-1-author-luna');
  consume(firstRepair);
  const secondRepair = evaluation.resolveSlot(
    evaluation.openCampaign(home, root),
    'repair-2',
  );
  assert.equal(secondRepair.repairOf, 'code-2-author-luna');
  consume(secondRepair);
  assert.equal(evaluation.openCampaign(home, root).attempts.length, 32);
  assert.throws(
    () =>
      evaluation.reserve(
        home,
        initial.schedule[0].id,
        'a'.repeat(64),
        null,
        root,
      ),
    /32/,
  );
  assert.throws(
    () =>
      evaluation.resolveSlot(evaluation.openCampaign(home, root), 'repair-3'),
    /inexistente/,
  );
  const opened = evaluation.openCampaign(home, root);
  const lock = path.join(opened.directory, 'reservation.lock');
  fs.mkdirSync(lock);
  assert.throws(
    () =>
      evaluation.reserve(
        home,
        initial.schedule[0].id,
        'a'.repeat(64),
        null,
        root,
      ),
    /EEXIST/,
  );
  fs.rmdirSync(lock);

  const first = path.join(
    opened.directory,
    'attempts',
    `${initial.schedule[0].id}.json`,
  );
  const saved = fs.readFileSync(first);
  fs.writeFileSync(
    first,
    saved.toString().replace('gpt-5.6-sol', 'modelo-indevido'),
  );
  assert.throws(() => evaluation.openCampaign(home, root), /hash/);
  fs.writeFileSync(first, saved);
  const planFile = path.join(root, 'config/agent-evaluation-plan.json');
  const oldPlan = fs.readFileSync(planFile);
  fs.writeFileSync(planFile, oldPlan.toString().replace('32', '99'));
  assert.throws(() => evaluation.loadPlan(root), /mudou|limites/);
  fs.writeFileSync(planFile, oldPlan);
  const marker = path.join(root, 'unrelated.txt');
  fs.writeFileSync(marker, 'edicao local que nao altera o snapshot');
  assert.equal(evaluation.loadPlan(root).commit, initial.sourceCommit);
  execFileSync('git', ['add', '--', 'unrelated.txt'], { cwd: root });
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
      'Muda somente a base ficticia',
    ],
    { cwd: root },
  );
  assert.throws(() => evaluation.openCampaign(home, root), /snapshot/);
  assert.equal(evaluation.openCampaign(home, root, true).attempts.length, 32);
  assert.equal(
    evaluation.openCampaign(home, root, true).campaign.sourceCommit,
    initial.sourceCommit,
  );
  process.stdout.write(
    'agent-evaluation: ok (32 reservas ficticias; nenhuma chamada real)\n',
  );
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
