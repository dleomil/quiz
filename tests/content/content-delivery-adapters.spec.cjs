const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync, spawnSync } = require('node:child_process');
const {
  digest,
  validateBatch,
  validateDelivery,
  validateGeneratedQuestions,
  assertPublication,
  validateReviews,
} = require('../../scripts/content-delivery.cjs');
const { evidenceFor } = require('../helpers/content-delivery-fixtures.cjs');
const policy = require('../../config/content-delivery-policy.json');
const coverage = require('../../config/content-coverage-manifest.json');
assert.equal(policy.schemaVersion, 'content-delivery-policy-v1');
assert.deepEqual([...policy.enabledSubjects].sort(), [
  'ciencias',
  'geografia',
  'historia',
  'ingles',
  'matematica',
  'portugues',
]);
assert.deepEqual(
  policy.requirements.map((rule) => [rule.id, rule.verification]).sort(),
  [
    ['curriculum', 'pedagogical'],
    ['english-support', 'linguistic'],
    ['feedback', 'pedagogical'],
    ['language', 'linguistic'],
    ['structure', 'automatic'],
  ],
);
const ROOT = path.resolve(__dirname, '../..');
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-content-adapters-'),
);
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));
function inventory(directory) {
  const files = {};
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(files, inventory(file));
    else files[file] = digest(fs.readFileSync(file, 'utf8'));
  }
  return files;
}
try {
  for (const name of [
    'scripts',
    'config',
    'docs/drafts',
    'docs/audits',
    'js/data',
  ])
    fs.cpSync(path.join(ROOT, name), path.join(temporary, name), {
      recursive: true,
    });
  const git = (...args) =>
    execFileSync('git', args, { cwd: temporary, encoding: 'utf8' }).trim();
  git('init', '--quiet');
  git('add', '.');
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'Base ficticia',
  );
  const baseline = git('rev-parse', 'HEAD');
  assert.throws(
    () =>
      assertPublication(
        require('../../scripts/create-t3-ingles-present-continuous.cjs').buildQuestions(),
        { root: temporary },
      ),
    /runtime exige status published/,
  );
  const auditsBefore = inventory(path.join(temporary, 'docs/audits'));
  let generated = 0;
  for (const file of policy.generatorFiles) {
    const generator = require(path.join(ROOT, file));
    assert.equal(generator.buildAudit, undefined, file);
    const batches = generator.TOPICS
      ? generator.TOPICS.map((topic) => generator.buildQuestions(topic))
      : [generator.buildQuestions()];
    const knownDrafts = fs
      .readdirSync(path.join(ROOT, 'docs/drafts'))
      .filter((name) => name.endsWith('.json'))
      .map((name) => read(path.join(ROOT, 'docs/drafts', name)));
    for (const questions of batches) {
      const draft = knownDrafts.find(
        (value) => value.questions?.[0]?.id === questions[0].id,
      );
      assert.ok(draft, `${file}: rascunho correspondente`);
      assert.deepEqual(
        questions,
        draft.questions,
        `${file}: gerador deve corresponder ao rascunho`,
      );
      generated += questions.length;
    }
    const target = path.join(temporary, file);
    const success = spawnSync(
      process.execPath,
      [target, '--replace-generated'],
      { cwd: temporary, encoding: 'utf8' },
    );
    assert.equal(success.status, 0, `${file}: ${success.stderr}`);
    assert.deepEqual(
      inventory(path.join(temporary, 'docs/audits')),
      auditsBefore,
    );
    const draftsBeforeFailure = inventory(path.join(temporary, 'docs/drafts'));
    const source = fs.readFileSync(target, 'utf8');
    const corrupted = source.replace(
      'buildQuestionsUnchecked(...args)',
      "buildQuestionsUnchecked(...args).map((q, i) => i ? q : { ...q, options: ['duplicada', 'duplicada', 'x', 'y'] })",
    );
    assert.notEqual(
      source,
      corrupted,
      `${file}: injecao de defeito deve atingir o caminho real`,
    );
    fs.writeFileSync(target, corrupted);
    const failure = spawnSync(
      process.execPath,
      [target, '--replace-generated'],
      { cwd: temporary, encoding: 'utf8' },
    );
    assert.notEqual(failure.status, 0, file);
    assert.match(failure.stderr, /duplicadas/);
    assert.deepEqual(
      inventory(path.join(temporary, 'docs/drafts')),
      draftsBeforeFailure,
      `${file}: erro deve impedir gravacao`,
    );
    assert.deepEqual(
      inventory(path.join(temporary, 'docs/audits')),
      auditsBefore,
    );
    fs.writeFileSync(target, source);
  }
  assert.equal(generated, 680);
  const diagnostic = JSON.parse(
    execFileSync(
      process.execPath,
      [
        path.join(
          temporary,
          'scripts/write-t3-matematica-editorial-reports.cjs',
        ),
      ],
      { cwd: temporary, encoding: 'utf8' },
    ),
  );
  assert.equal(diagnostic.schemaVersion, 'technical-diagnostic-v1');
  assert.equal(diagnostic.editorialApproval, false);
  assert.deepEqual(
    inventory(path.join(temporary, 'docs/audits')),
    auditsBefore,
  );
  // Cada materia usa o mesmo contrato de revisao, sem emitir parecer real.
  for (const subject of policy.enabledSubjects) {
    const draftFile = fs
      .readdirSync(path.join(ROOT, 'docs/drafts'))
      .filter((name) => name.endsWith('.json'))
      .find(
        (name) =>
          read(path.join(ROOT, 'docs/drafts', name)).questions?.[0]?.subject ===
          subject,
      );
    const draft = read(path.join(ROOT, 'docs/drafts', draftFile));
    const questions = draft.questions;
    assert.deepEqual(
      validateBatch(questions, { policy, coverage }).errors,
      [],
      subject,
    );
    const evidence = evidenceFor(questions);
    assert.equal(evidence.record.testOnly, true);
    assert.deepEqual(
      validateReviews(
        questions,
        evidence.record,
        (file) => evidence.documents[file],
        { policy, allowTestEvidence: true },
      ),
      [],
      subject,
    );
    const future = clone(questions).map((q, i) => ({
      ...q,
      id: `2027t1_${subject}_${i}`,
      contentSetId: '2027-t1-v1',
    }));
    const futureCoverage = clone(coverage);
    futureCoverage.contentSets['2027-t1-v1'] = {
      subjects: { [subject]: { [future[0].topic]: 20 } },
    };
    assert.deepEqual(
      validateBatch(future, { policy, coverage: futureCoverage }).errors,
      [],
      `${subject}: proximo ciclo sem filtro fixo de T3`,
    );
    const changedDraft = clone(draft);
    changedDraft.questions[0].question += ' Teste tecnico.';
    const draftPath = path.join(temporary, 'docs/drafts', draftFile);
    fs.writeFileSync(draftPath, JSON.stringify(changedDraft));
    const candidatePath = 'js/data/delivery-candidate-published.js';
    const candidatePolicy = {
      ...policy,
      runtimeFiles: [...policy.runtimeFiles, candidatePath],
    };
    fs.writeFileSync(
      path.join(temporary, candidatePath),
      `window.QuestionsDataSources.${subject}.questions = window.QuestionsDataSources.${subject}.questions.map(q => q.id === ${JSON.stringify(questions[0].id)} ? {...q, question: ${JSON.stringify(changedDraft.questions[0].question)}} : q);`,
    );
    const result = validateDelivery({
      root: temporary,
      baseRef: baseline,
      policy: candidatePolicy,
    });
    assert.ok(
      result.batches.some(
        (batch) =>
          batch.stage === 'publish' && batch.key.includes(`/${subject}/`),
      ),
      subject,
    );
    assert.ok(
      result.errors.some((error) => error.includes('revisao ausente')),
      subject,
    );
    fs.writeFileSync(draftPath, JSON.stringify(draft));
    fs.unlinkSync(path.join(temporary, candidatePath));
  }
  const history = clone(
    read(path.join(ROOT, 'docs/drafts/2026-t3-v1-his-imigrantes-ibericos.json'))
      .questions,
  );
  history[0].explanation = 'The immigrants are moving to a new community.';
  assert.ok(
    validateBatch(history, { policy, coverage }).errors.some((error) =>
      error.includes('ingles'),
    ),
  );
  const support = clone(
    read(path.join(ROOT, 'docs/drafts/2026-t3-v1-ing-present-continuous.json'))
      .questions,
  );
  support[0].questionPt = support[0].options[support[0].correctIndex];
  assert.throws(
    () => validateGeneratedQuestions(support),
    /resposta em ingles/,
  );
  for (const [script, draftFile] of [
    [
      'scripts/build-t3-matematica-release.cjs',
      '2026-t3-v1-mat-probabilidade.json',
    ],
    [
      'scripts/build-t3-portugues-expansion.cjs',
      '2026-t3-v1-pt-adjetivos.json',
    ],
  ]) {
    const output = path.join(
      temporary,
      script.includes('matematica')
        ? 'js/data/t3-matematica-published.js'
        : 'js/data/t3-portugues-expansion-published.js',
    );
    const before = fs.readFileSync(output, 'utf8');
    const file = path.join(temporary, 'docs/drafts', draftFile),
      draft = read(file);
    const changed = clone(draft);
    changed.questions[0].question += ' Mudanca nao revisada.';
    fs.writeFileSync(file, JSON.stringify(changed));
    const failed = spawnSync(process.execPath, [path.join(temporary, script)], {
      cwd: temporary,
      encoding: 'utf8',
    });
    assert.notEqual(failed.status, 0);
    assert.match(failed.stderr, /revisao ausente/);
    assert.equal(
      fs.readFileSync(output, 'utf8'),
      before,
      `${script}: bloqueio antes da escrita`,
    );
    fs.writeFileSync(file, JSON.stringify(draft));
  }
  fs.writeFileSync(
    path.join(temporary, 'js/data/sem-sufixo.js'),
    'window.QuestionsDataSources.ingles.questions.push({});',
  );
  assert.ok(
    validateDelivery({ root: temporary, baseRef: baseline }).errors.some(
      (error) => error.includes('conteudo nao cadastrado'),
    ),
  );
  fs.unlinkSync(path.join(temporary, 'js/data/sem-sufixo.js'));
  fs.writeFileSync(
    path.join(temporary, 'scripts/create-t1-nao-cadastrado.cjs'),
    'module.exports = {};',
  );
  assert.ok(
    validateDelivery({ root: temporary, baseRef: baseline }).errors.some(
      (error) => error.includes('geracao nao cadastrado'),
    ),
  );
  assert.deepEqual(
    inventory(path.join(temporary, 'docs/audits')),
    auditsBefore,
  );
  console.log(
    'content-delivery-adapters: ok (24 geradores, 680 questoes preservadas, seis materias, proximos ciclos e publicadores bloqueados antes da escrita)',
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
