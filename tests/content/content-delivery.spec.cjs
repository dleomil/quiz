const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync, spawnSync } = require('node:child_process');
const {
  validateBatch,
  validateReviews,
  validateApproval,
  validateDelivery,
  packageHash,
  applies,
  batchKey,
} = require('../../scripts/content-delivery.cjs');
const { evidenceFor } = require('../helpers/content-delivery-fixtures.cjs');
const policy = require('../../config/content-delivery-policy.json');
const coverage = require('../../config/content-coverage-manifest.json');
const root = path.resolve(__dirname, '../..');
const questions =
  require('../../scripts/create-t3-ingles-present-continuous.cjs').buildQuestions();
const clone = (value) => JSON.parse(JSON.stringify(value));
const check = (value) => validateBatch(value, { policy, coverage }).errors;
assert.deepEqual(check(questions), []);
assert.equal(applies('2026-t2-v1', policy), false);
assert.equal(applies('2027-t1-v1', policy), true);
assert.equal(applies('2026-t3-v2', policy), true);
assert.equal(packageHash([...questions].reverse()), packageHash(questions));
assert.equal(
  packageHash(
    questions.map((question) => ({ ...question, reviewStatus: 'published' })),
  ),
  packageHash(questions),
);
for (const support of [
  undefined,
  '',
  '   ',
  'Escolha a alternativa correta para a frase ou palavra apresentada em inglês.',
  questions[0].question,
  questions[0].options[questions[0].correctIndex],
]) {
  const changed = clone(questions);
  changed[0].questionPt = support;
  assert.ok(check(changed).length, String(support));
}
const missingBlank = clone(questions);
missingBlank[1].questionPt = 'Complete a frase.';
assert.ok(check(missingBlank).some((error) => error.includes('lacuna')));
assert.ok(
  check(questions.slice(1)).some((error) => error.includes('cobertura')),
);
const duplicate = clone(questions);
duplicate[1].id = duplicate[0].id;
assert.ok(check(duplicate).some((error) => error.includes('duplicado')));
const { record, documents, comment } = evidenceFor(questions);
const read = (file) => documents[file];
assert.deepEqual(
  validateReviews(questions, record, read, { policy, allowTestEvidence: true }),
  [],
);
assert.ok(
  validateReviews(questions, record, read, { policy }).some((error) =>
    error.includes('fictici'),
  ),
);
const incomplete = clone(record);
incomplete.reviews.pop();
assert.ok(
  validateReviews(questions, incomplete, read, {
    policy,
    allowTestEvidence: true,
  }).some((error) => error.includes('ausente')),
);
const repeated = clone(record);
repeated.reviews.push(repeated.reviews[0]);
assert.ok(
  validateReviews(questions, repeated, read, {
    policy,
    allowTestEvidence: true,
  }).some((error) => error.includes('duplicada')),
);
const requirementMissing = clone(record);
requirementMissing.requirements.pop();
assert.ok(
  validateReviews(questions, requirementMissing, read, {
    policy,
    allowTestEvidence: true,
  }).some((error) => error.includes('requisito')),
);
for (const mutate of [
  (q) => {
    q[0].questionPt += ' Outra instrucao.';
  },
  (q) => {
    q[0].options[0] += ' changed';
  },
  (q) => {
    q[0].correctIndex = (q[0].correctIndex + 1) % 4;
  },
  (q) => {
    q[0].wrongExplanations[1] = 'Outro feedback.';
  },
]) {
  const changed = clone(questions);
  mutate(changed);
  assert.ok(
    validateReviews(changed, record, read, {
      policy,
      allowTestEvidence: true,
    }).some((error) => error.includes('hash')),
  );
}
const blockedDocuments = clone(documents);
blockedDocuments[record.reviews[0].evidencePath].output.decision = 'blocked';
assert.ok(
  validateReviews(questions, record, (file) => blockedDocuments[file], {
    policy,
    allowTestEvidence: true,
  }).some((error) => error.includes('pendencias')),
);
assert.deepEqual(
  validateApproval(questions, record, policy, () => comment),
  [],
);
for (const body of [
  'Pode implementar.',
  'Aprovo o lote.',
  comment.body.replace(record.sourceSha256, 'outro-hash'),
]) {
  assert.ok(
    validateApproval(questions, record, policy, () => ({ ...comment, body }))
      .length,
  );
}
assert.ok(
  validateApproval(questions, record, policy, () => ({
    ...comment,
    user: { login: 'dleomil', type: 'Bot' },
  })).length,
);

// Repositorio temporario: testa o CLI real, sem tocar no acervo do projeto.
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-delivery-pilot-'),
);
try {
  const write = (file, value) => {
    fs.mkdirSync(path.dirname(path.join(temporary, file)), { recursive: true });
    fs.writeFileSync(
      path.join(temporary, file),
      typeof value === 'string' ? value : JSON.stringify(value),
    );
  };
  const git = (...args) =>
    execFileSync('git', args, { cwd: temporary, encoding: 'utf8' }).trim();
  git('init', '--quiet');
  const fixturePolicy = {
    ...policy,
    runtimeFiles: ['js/data/pilot-published.js'],
  };
  write('config/content-delivery-policy.json', fixturePolicy);
  write('config/content-coverage-manifest.json', coverage);
  write('docs/drafts/pilot.json', { questions });
  write(
    'js/data/subjects/ingles.js',
    'window.QuestionsDataSources = {ingles:{questions:[],topicMeta:{}}};',
  );
  const bundle = (value, reviewStatus = 'published') =>
    `window.QuestionsDataSources.ingles.questions.push(...${JSON.stringify(value.map((question) => ({ ...question, reviewStatus })))});`;
  write(
    'js/data/pilot-published.js',
    bundle(questions.map((q) => ({ ...q, reviewStatus: 'published' }))),
  );
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
  assert.deepEqual(
    validateDelivery({ root: temporary, baseRef: 'HEAD' }).batches,
    [],
  );
  write('docs/drafts/pilot.json', { questions: [...questions].reverse() });
  assert.deepEqual(
    validateDelivery({ root: temporary, baseRef: 'HEAD' }).errors,
    [],
  );
  const changed = clone(questions);
  changed[0].questionPt += ' Leia com atencao.';
  write('docs/drafts/pilot.json', { questions: changed });
  const draftResult = validateDelivery({ root: temporary, baseRef: 'HEAD' });
  assert.equal(draftResult.batches[0].stage, 'draft');
  assert.deepEqual(draftResult.errors, []);
  write('js/data/pilot-published.js', bundle(changed));
  assert.ok(
    validateDelivery({ root: temporary, baseRef: 'HEAD' }).errors.some(
      (error) => error.includes('revisao ausente'),
    ),
  );
  const revised = evidenceFor(changed);
  const file = `docs/editorial/${batchKey(changed[0]).replaceAll('/', '--')}.json`;
  write(file, revised.record);
  for (const [name, data] of Object.entries(revised.documents))
    write(name, data);
  assert.deepEqual(
    validateDelivery({
      root: temporary,
      baseRef: 'HEAD',
      allowTestEvidence: true,
      readComment: () => revised.comment,
    }).errors,
    [],
  );
  assert.ok(
    validateDelivery({
      root: temporary,
      baseRef: 'HEAD',
      readComment: () => revised.comment,
    }).errors.some((error) => error.includes('fictici')),
  );
  for (const status of ['draft', 'retired']) {
    write('docs/drafts/pilot.json', { questions });
    write('js/data/pilot-published.js', bundle(questions, status));
    assert.ok(
      validateDelivery({ root: temporary, baseRef: 'HEAD' }).errors.some(
        (error) => error.includes('runtime exige status published'),
      ),
      'Mudar apenas o status do runtime tambem exige verificacao.',
    );
  }
  write('docs/drafts/pilot.json', { questions: changed });
  write(
    'js/data/pilot-published.js',
    bundle(
      changed.map((q, i) =>
        i ? q : { ...q, explanation: 'Outra explicacao.' },
      ),
    ),
  );
  assert.ok(
    validateDelivery({
      root: temporary,
      baseRef: 'HEAD',
      allowTestEvidence: true,
      readComment: () => revised.comment,
    }).errors.some((error) => error.includes('runtime diverge')),
  );
  fs.unlinkSync(path.join(temporary, 'docs/drafts/pilot.json'));
  assert.ok(
    validateDelivery({ root: temporary, baseRef: 'HEAD' }).errors.some(
      (error) => error.includes('remocao'),
    ),
  );
  const cli = spawnSync(
    process.execPath,
    [path.join(root, 'scripts/content-delivery.cjs'), '--allow-test-evidence'],
    { encoding: 'utf8' },
  );
  assert.notEqual(cli.status, 0);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
console.log(
  'content-delivery: ok (piloto tecnico de 20 IDs, controles positivos e negativos, sem revisao editorial real)',
);
