const fs = require('node:fs');
const path = require('node:path');
const {
  digest,
  reviewProjection,
  packageHash,
  batchKey,
  validateBatch,
  validateReviews,
  requirementsFor,
} = require('./content-delivery.cjs');
const policy = require('../config/content-delivery-policy.json');
const coverage = require('../config/content-coverage-manifest.json');
const ROOT = path.resolve(__dirname, '..');
const DIRECTORY = 'docs/editorial/2026-t3-v2-geografia-direct';
function build({ final = false } = {}) {
  const readJson = (name) =>
    JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
  const evidence = fs
    .readdirSync(path.join(ROOT, DIRECTORY))
    .filter((f) => f.endsWith('-reviewed.json'))
    .map((f) => ({
      evidencePath: `${DIRECTORY}/${f}`,
      scenario: readJson(`${DIRECTORY}/${f}`),
    }));
  const summary = {
    schemaVersion: 'geografia-direct-package-v1',
    contentSetId: '2026-t3-v2',
    subject: 'geografia',
    status: 'draft_pending_reviews',
    runtimePublished: false,
    approval: 'pending',
    questions: 0,
    approvedLinks: 0,
    batches: [],
    errors: [],
  };
  const ids = new Set();
  for (const topic of Object.keys(
    coverage.contentSets['2026-t3-v2'].subjects.geografia,
  )) {
    const draftPath = `docs/drafts/2026-t3-v2-geo-${topic}.json`;
    const { questions } = readJson(draftPath);
    summary.errors.push(
      ...validateBatch(questions, { policy, coverage }).errors,
    );
    for (const q of questions) {
      if (ids.has(q.id)) summary.errors.push(`ID duplicado: ${q.id}`);
      ids.add(q.id);
    }
    const record = {
      schemaVersion: 'content-delivery-v1',
      batch: batchKey(questions[0]),
      sourceSha256: packageHash(questions),
      testOnly: false,
      reviews: [],
      requirements: requirementsFor('geografia', policy).map((rule) => ({
        id: rule.id,
        verification: rule.verification,
        evidence:
          rule.verification === 'automatic'
            ? 'Validacao content-v1 e cobertura em scripts/geografia-direct-package.cjs'
            : `Resultados individuais da passagem ${rule.verification} nas evidencias referenciadas por ID.`,
      })),
    };
    for (const q of questions)
      for (const pass of ['pedagogical', 'linguistic']) {
        const match = evidence
          .filter(
            ({ scenario }) =>
              scenario.input.topicId === topic &&
              scenario.execution.pass === pass &&
              scenario.input.proposals.some(
                (p) =>
                  p.id === q.id && digest(p) === digest(reviewProjection(q)),
              ),
          )
          .findLast(({ scenario }) => {
            const r = readJson(scenario.execution.originalReportPath);
            return JSON.parse(r.originalResponse).results.some(
              (r) =>
                (r.questionId || r.id) === q.id &&
                r.decision === 'approved' &&
                !r.findings.length &&
                !r.doubts.length,
            );
          });
        if (match)
          record.reviews.push({
            questionId: q.id,
            pass,
            evidencePath: match.evidencePath,
          });
      }
    const errors = validateReviews(questions, record, readJson, { policy });
    const recordPath = `docs/editorial/2026-t3-v2--geografia--${topic}.json`;
    fs.writeFileSync(
      path.join(ROOT, recordPath),
      JSON.stringify(record, null, 2) + '\n',
    );
    summary.batches.push({
      key: record.batch,
      sourceSha256: record.sourceSha256,
      ids: questions.map((q) => q.id),
      draftPath,
      recordPath,
      approvedLinks: record.reviews.length,
      errors,
    });
    summary.questions += questions.length;
    summary.approvedLinks += record.reviews.length;
  }
  const complete =
    summary.questions === 180 &&
    summary.approvedLinks === 360 &&
    !summary.errors.length &&
    summary.batches.every((b) => !b.errors.length);
  if (complete) summary.status = 'reviewed_pending_human_acceptance';
  summary.packageSha256 = digest(
    summary.batches.map(({ key, sourceSha256 }) => ({ key, sourceSha256 })),
  );
  fs.writeFileSync(
    path.join(ROOT, DIRECTORY, 'package-summary.json'),
    JSON.stringify(summary, null, 2) + '\n',
  );
  fs.writeFileSync(
    path.join(ROOT, DIRECTORY, 'ui-preview-selection.json'),
    JSON.stringify(
      {
        purpose: 'editorial-preview',
        published: false,
        batches: summary.batches.map((batch) => ({
          key: batch.key,
          sourceSha256: batch.sourceSha256,
          ids: batch.ids,
          stage: 'publish',
        })),
      },
      null,
      2,
    ) + '\n',
  );
  if (final && !complete)
    throw new Error('pacote incompleto ou revisoes invalidas');
  return summary;
}
if (require.main === module) {
  try {
    const s = build({ final: process.argv.includes('--final') });
    console.log(
      JSON.stringify({
        status: s.status,
        questions: s.questions,
        approvedLinks: s.approvedLinks,
        errors: s.errors,
        batches: s.batches.map((b) => ({
          key: b.key,
          approvedLinks: b.approvedLinks,
          errors: b.errors,
        })),
      }),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { build };
