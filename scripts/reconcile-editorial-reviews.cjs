const fs = require('node:fs');
const path = require('node:path');
const {
  batchKey,
  packageHash,
  validateReviews,
} = require('./content-delivery.cjs');
const { validateQuestion } = require('./validate-content.cjs');
const defaultPolicy = require('../config/content-delivery-policy.json');

const PASSES = ['pedagogical', 'linguistic'];

function recoveryReports(record, reviews, readJson) {
  const paths = new Set(
    reviews.map(
      (entry) => readJson(entry.evidencePath).execution?.recoveryEvidencePath,
    ),
  );
  return (record.recoveryReports || []).filter((entry) =>
    paths.has(entry.path),
  );
}

function reconcileReviews(questions, previous, readJson, options = {}) {
  if (!Array.isArray(questions) || !questions.length)
    throw new Error('rascunho vazio');
  if (
    !previous ||
    typeof previous !== 'object' ||
    questions.some(
      (question) =>
        !question ||
        ['id', 'contentSetId', 'subject', 'topic'].some(
          (key) => typeof question[key] !== 'string' || !question[key].trim(),
        ),
    ) ||
    previous.schemaVersion !== 'content-delivery-v1' ||
    previous.batch !== batchKey(questions[0]) ||
    questions.some((question) => batchKey(question) !== previous.batch) ||
    new Set(questions.map((question) => question.id)).size !==
      questions.length ||
    !Array.isArray(previous.reviews)
  )
    throw new Error(
      'rascunho e manifesto devem pertencer a um unico lote valido',
    );
  const inputErrors = questions.flatMap((question) => [
    ...(question.schemaVersion === 'content-v1' ? [] : ['exige content-v1']),
    ...validateQuestion(question, question.subject),
  ]);
  if (inputErrors.length) throw new Error(inputErrors.join('; '));
  const settings = { policy: defaultPolicy, ...options };
  const sourceSha256 = packageHash(questions);
  const record = JSON.parse(JSON.stringify(previous));
  record.sourceSha256 = sourceSha256;
  record.reviews = [];
  const pending = [];
  for (const question of questions) {
    const reviews = previous.reviews.filter(
      (entry) => entry.questionId === question.id,
    );
    let valid;
    try {
      const candidate = {
        ...record,
        reviews,
        recoveryReports: recoveryReports(previous, reviews, readJson),
      };
      const errors = validateReviews(questions, candidate, readJson, settings);
      valid =
        PASSES.every(
          (pass) => reviews.filter((entry) => entry.pass === pass).length === 1,
        ) && errors.every((error) => error.startsWith('revisao ausente: '));
    } catch {
      valid = false;
    }
    if (valid) record.reviews.push(...JSON.parse(JSON.stringify(reviews)));
    else
      pending.push(
        ...PASSES.map((pass) => ({ questionId: question.id, pass })),
      );
  }
  record.recoveryReports = recoveryReports(previous, record.reviews, readJson);
  if (record.approval?.sourceSha256 !== sourceSha256) delete record.approval;
  const errors = validateReviews(questions, record, readJson, settings).filter(
    (error) => !error.startsWith('revisao ausente: '),
  );
  if (errors.length) throw new Error(errors.join('; '));
  return { record, pending };
}

function run(args = process.argv.slice(2)) {
  if (args.length !== 3)
    throw new Error(
      'uso: node scripts/reconcile-editorial-reviews.cjs <rascunho.json> <manifesto-anterior.json> <saida.json>',
    );
  const root = path.resolve(__dirname, '..');
  const read = (file) =>
    JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8'));
  const draft = read(args[0]);
  const result = reconcileReviews(
    Array.isArray(draft) ? draft : draft?.questions,
    read(args[1]),
    read,
  );
  fs.writeFileSync(args[2], JSON.stringify(result.record, null, 2) + '\n', {
    flag: 'wx',
  });
  process.stdout.write(
    JSON.stringify({
      sourceSha256: result.record.sourceSha256,
      pending: result.pending,
    }) + '\n',
  );
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    process.stderr.write(`reconcile-editorial-reviews: ${error.message}\n`);
    process.exitCode = 1;
  }
}
module.exports = { reconcileReviews, run };
