const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const {
  buildQuestions,
  sha256,
} = require('../../scripts/create-t3-historia-imigrantes-ibericos.cjs');
const {
  loadContentSources,
  validateQuestion,
} = require('../../scripts/validate-content.cjs');
const ROOT = path.resolve(__dirname, '../..');
const draft = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'docs/drafts/2026-t3-v1-his-imigrantes-ibericos.json'),
    'utf8',
  ),
);
const audit = JSON.parse(
  fs.readFileSync(
    path.join(
      ROOT,
      'docs/audits/2026-t3-v1-his-imigrantes-ibericos-audit.json',
    ),
    'utf8',
  ),
);
const questions = draft.questions;
assert.deepEqual(questions, buildQuestions());
const published = loadContentSources(ROOT).historia.questions.filter(
  (question) => question.topic === 'imigrantes-portugueses-espanhois',
);
assert.deepEqual(
  JSON.parse(JSON.stringify(published)),
  questions.map((question) => ({ ...question, reviewStatus: 'published' })),
);
assert.equal(draft.schemaVersion, 'content-draft-v1');
assert.equal(draft.contentSetId, '2026-t3-v1');
assert.equal(questions.length, 20);
assert.equal(new Set(questions.map((question) => question.id)).size, 20);
assert.deepEqual(
  questions.reduce((counts, question) => {
    counts[question.correctIndex] = (counts[question.correctIndex] || 0) + 1;
    return counts;
  }, {}),
  { 0: 5, 1: 5, 2: 5, 3: 5 },
);
for (const question of questions) {
  assert.match(question.id, /^2026t3v1_his_imigrantes_ibericos_\d{3}$/);
  assert.equal(question.subject, 'historia');
  assert.equal(question.topic, 'imigrantes-portugueses-espanhois');
  assert.equal(question.reviewStatus, 'draft');
  assert.equal(question.version, 2);
  assert.deepEqual(validateQuestion(question, 'historia'), []);
  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options).size, 4);
  assert.match(question.explanation, /\S/);
  assert.equal(Object.keys(question.wrongExplanations).length, 3);
  assert.equal(new Set(Object.values(question.wrongExplanations)).size, 3);
  assert.equal(
    question.sourceRef.referenceId,
    'roteiro-estudos-av-mensal-t3-2026',
  );
}
assert.equal(audit.schemaVersion, 'content-quality-audit-v1');
assert.equal(audit.topicId, 'historia:imigrantes-portugueses-espanhois');
// A auditoria anterior é histórica e não aprova a versão corrigida.
assert.notEqual(audit.sourceSha256, sha256(questions));
assert.equal(audit.reviews.length, 40);
assert.deepEqual(
  new Set(audit.reviews.map((review) => review.questionId)),
  new Set(questions.map((question) => question.id)),
);
const tempRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-historia-gerador-'),
);
try {
  fs.mkdirSync(path.join(tempRoot, 'scripts'));
  const generatorPath = path.join(
    tempRoot,
    'scripts/create-t3-historia-imigrantes-ibericos.cjs',
  );
  fs.copyFileSync(
    path.join(ROOT, 'scripts/create-t3-historia-imigrantes-ibericos.cjs'),
    generatorPath,
  );
  execFileSync(process.execPath, [generatorPath]);
  const generated = JSON.parse(
    fs.readFileSync(
      path.join(
        tempRoot,
        'docs/drafts/2026-t3-v1-his-imigrantes-ibericos.json',
      ),
      'utf8',
    ),
  );
  assert.deepEqual(generated, draft);
  assert.equal(fs.existsSync(path.join(tempRoot, 'docs/audits')), false);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
console.log(
  't3-historia-imigrantes-ibericos: ok (20 questões v2, sem aprovação automática)',
);
