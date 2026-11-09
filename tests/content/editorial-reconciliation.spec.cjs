const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  reconcileReviews,
} = require('../../scripts/reconcile-editorial-reviews.cjs');
const {
  digest,
  reviewProjection,
  packageHash,
  validateReviews,
  validateApproval,
} = require('../../scripts/content-delivery.cjs');
const { evidenceFor } = require('../helpers/content-delivery-fixtures.cjs');
const policy = require('../../config/content-delivery-policy.json');
const questions =
  require('../../scripts/create-t3-ingles-present-continuous.cjs')
    .buildQuestions()
    .slice(0, 2);
const options = { policy, allowTestEvidence: true };
const clone = (value) => JSON.parse(JSON.stringify(value));
function fixture() {
  const result = evidenceFor(questions);
  for (const scenario of Object.values(result.documents)) {
    scenario.execution.questionSha256s = {
      [scenario.input.proposal.id]: digest(scenario.input.proposal),
    };
  }
  return result;
}
function reconcile(current, { record, documents }) {
  return reconcileReviews(current, record, (file) => documents[file], options);
}
const changed = clone(questions);
changed[1].explanation += ' Outra explicacao.';
const original = fixture();
const snapshot = clone(original);
const result = reconcile(changed, original);
assert.deepEqual(original, snapshot);
assert.deepEqual(result.record.reviews, original.record.reviews.slice(0, 2));
assert.deepEqual(
  result.pending,
  ['pedagogical', 'linguistic'].map((pass) => ({
    questionId: questions[1].id,
    pass,
  })),
);
assert.equal(result.record.sourceSha256, packageHash(changed));
assert.equal(result.record.approval, undefined);
assert.ok(
  validateApproval(changed, original.record, policy, () => original.comment)
    .length,
);
assert.deepEqual(
  reconcile(questions, original).record.approval,
  original.record.approval,
);
assert.deepEqual(
  reconcile(changed, { ...original, record: result.record }),
  result,
);
for (const mutate of [
  (s) => {
    s.output.findings = [{ description: 'pendencia' }];
  },
  (s) => {
    s.output.doubts = ['duvida'];
  },
  (s) => {
    s.output.decision = 'changes_requested';
  },
  (s) => {
    s.execution.questionSha256s[questions[0].id] = '0'.repeat(64);
  },
  (s) => {
    s.input.proposal.explanation += ' divergente';
  },
  (s) => {
    s.execution.testOnly = false;
    s.execution.agent = 'outro';
  },
]) {
  const input = fixture();
  mutate(input.documents[input.record.reviews[0].evidencePath]);
  assert.equal(reconcile(questions, input).pending.length, 2);
}
const missing = fixture();
delete missing.documents[missing.record.reviews[0].evidencePath];
assert.equal(reconcile(questions, missing).pending.length, 2);
const metadata = clone(questions);
metadata[0].topicName = 'Nome de exibicao atualizado';
const metadataResult = reconcile(metadata, fixture());
assert.deepEqual(metadataResult.pending, []);
assert.equal(metadataResult.record.sourceSha256, packageHash(metadata));
assert.equal(metadataResult.record.approval, undefined);
const singleHash = fixture();
for (const scenario of Object.values(singleHash.documents)) {
  scenario.execution.questionSha256 = digest(scenario.input.proposal);
  delete scenario.execution.questionSha256s;
}
assert.equal(reconcile(changed, singleHash).record.reviews.length, 2);
const incomplete = fixture();
incomplete.record.reviews.shift();
assert.equal(reconcile(questions, incomplete).pending.length, 2);
const duplicate = fixture();
duplicate.record.reviews.push(clone(duplicate.record.reviews[0]));
assert.equal(reconcile(questions, duplicate).pending.length, 2);
const removed = reconcile(questions.slice(0, 1), fixture());
assert.equal(removed.record.reviews.length, 2);
assert.deepEqual(removed.pending, []);
const updated = evidenceFor(changed);
for (const entry of result.pending) {
  result.record.reviews.push(
    updated.record.reviews.find(
      (review) =>
        review.questionId === entry.questionId && review.pass === entry.pass,
    ),
  );
}
assert.deepEqual(
  validateReviews(
    changed,
    result.record,
    (file) =>
      file.includes(questions[1].id)
        ? updated.documents[file]
        : original.documents[file],
    options,
  ),
  [],
);
const legacy = evidenceFor(questions);
assert.equal(reconcile(changed, legacy).pending.length, 4);
const block = fixture();
for (const pass of ['pedagogical', 'linguistic']) {
  const entries = block.record.reviews.filter((entry) => entry.pass === pass);
  const scenario = block.documents[entries[0].evidencePath];
  delete scenario.input.proposal;
  scenario.input.proposals = questions.map(reviewProjection);
  scenario.execution.questionSha256s = Object.fromEntries(
    questions.map((q) => [q.id, digest(reviewProjection(q))]),
  );
  for (const entry of entries) entry.evidencePath = entries[0].evidencePath;
}
assert.deepEqual(
  validateReviews(
    questions,
    block.record,
    (file) => block.documents[file],
    options,
  ),
  [],
);
assert.equal(reconcile(changed, block).record.reviews.length, 2);
block.documents[block.record.reviews[0].evidencePath].output.doubts = [
  'pendencia do bloco',
];
assert.equal(reconcile(questions, block).pending.length, 4);
assert.throws(() => reconcile([], original), /vazio/);
assert.throws(
  () => reconcile([questions[0], questions[0]], original),
  /lote valido/,
);

for (const invalid of [null, {}, [null], [{ id: '' }]]) {
  assert.throws(() => reconcile(invalid, fixture()));
}
assert.throws(
  () => reconcileReviews(questions, null, () => null),
  /lote valido/,
);

const raw = clone(questions);
for (const question of raw) delete question.topicName;
const rawEvidence = evidenceFor(raw);
for (const scenario of Object.values(rawEvidence.documents)) {
  scenario.execution.questionSha256 = digest(scenario.input.proposal);
}
assert.deepEqual(reconcile(raw, rawEvidence).pending, []);
const enriched = clone(raw);
for (const question of enriched) {
  question.topicName = 'Nome para apresentacao';
  question.sourceRef.title = 'Fonte para apresentacao';
}
assert.notEqual(packageHash(enriched), packageHash(raw));
assert.deepEqual(reconcile(enriched, rawEvidence).pending, []);
assert.equal(reconcile(enriched, rawEvidence).record.approval, undefined);
const published = raw.map((question) => ({
  ...question,
  reviewStatus: 'published',
}));
assert.notEqual(
  digest([...published].sort((a, b) => a.id.localeCompare(b.id))),
  packageHash(raw),
);
assert.equal(packageHash(published), packageHash(raw));
const runtimeRecord = clone(rawEvidence);
runtimeRecord.record.sourceSha256 = digest(
  [...published].sort((a, b) => a.id.localeCompare(b.id)),
);
const editorialResult = reconcile(raw, runtimeRecord);
assert.equal(editorialResult.record.sourceSha256, packageHash(raw));
assert.deepEqual(editorialResult.pending, []);

const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-reconciliation-cli-'),
);
try {
  const draftPath = path.join(directory, 'draft.json');
  const manifestPath = path.join(directory, 'previous.json');
  const outputPath = path.join(directory, 'next.json');
  const script = path.resolve(
    __dirname,
    '../../scripts/reconcile-editorial-reviews.cjs',
  );
  const cli = (args) =>
    spawnSync(process.execPath, [script, ...args], {
      cwd: directory,
      encoding: 'utf8',
    });
  const manifest = clone(rawEvidence.record);
  manifest.testOnly = false;
  for (const entry of manifest.reviews)
    entry.evidencePath = 'docs/editorial/arquivo-ausente.json';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  const originalManifest = fs.readFileSync(manifestPath, 'utf8');
  for (const draft of [
    raw,
    { schemaVersion: 'content-draft-v1', questions: raw },
  ]) {
    fs.writeFileSync(draftPath, JSON.stringify(draft));
    const originalDraft = fs.readFileSync(draftPath, 'utf8');
    const run = cli([draftPath, manifestPath, outputPath]);
    assert.equal(run.status, 0, run.stderr);
    const summary = JSON.parse(run.stdout);
    assert.equal(summary.pending.length, raw.length * 2);
    assert.equal(summary.sourceSha256, packageHash(raw));
    const output = fs.readFileSync(outputPath, 'utf8');
    assert.deepEqual(JSON.parse(output).reviews, []);
    assert.equal(cli([draftPath, manifestPath, outputPath]).status, 1);
    assert.equal(fs.readFileSync(outputPath, 'utf8'), output);
    assert.equal(cli([draftPath, manifestPath, draftPath]).status, 1);
    assert.equal(cli([draftPath, manifestPath, manifestPath]).status, 1);
    assert.equal(fs.readFileSync(draftPath, 'utf8'), originalDraft);
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), originalManifest);
    fs.unlinkSync(outputPath);
  }
  const root = path.resolve(__dirname, '../..');
  const draftReal = path.join(
    root,
    'docs/drafts/2026-t3-v2-pt-dicionario.json',
  );
  const manifestReal = path.join(
    root,
    'docs/editorial/2026-t3-v2--portugues--dicionario.json',
  );
  const snapshotReal = [draftReal, manifestReal].map((file) =>
    fs.readFileSync(file, 'utf8'),
  );
  const realRun = cli([draftReal, manifestReal, outputPath]);
  assert.equal(realRun.status, 0, realRun.stderr);
  assert.deepEqual(JSON.parse(realRun.stdout).pending, []);
  assert.equal(
    JSON.parse(fs.readFileSync(outputPath, 'utf8')).reviews.length,
    40,
  );
  assert.deepEqual(
    [draftReal, manifestReal].map((file) => fs.readFileSync(file, 'utf8')),
    snapshotReal,
  );
  fs.unlinkSync(outputPath);
  for (const invalid of ['{', 'null', '{}', '[]', '[null]']) {
    fs.writeFileSync(draftPath, invalid);
    assert.equal(cli([draftPath, manifestPath, outputPath]).status, 1);
    assert.equal(fs.existsSync(outputPath), false);
  }
  fs.writeFileSync(draftPath, JSON.stringify(raw));
  fs.writeFileSync(manifestPath, '{}');
  assert.equal(cli([draftPath, manifestPath, outputPath]).status, 1);
  assert.equal(cli([]).status, 1);
  assert.equal(fs.existsSync(outputPath), false);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
console.log('editorial-reconciliation: ok');
