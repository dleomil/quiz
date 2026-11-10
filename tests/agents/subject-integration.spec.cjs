const assert = require('node:assert/strict');
const { scenario } = require('../helpers/subject-synthetic.cjs');
const {
  digest,
  packageHash,
  requirementsFor,
} = require('../../scripts/content-delivery.cjs');
const { FIELDS } = require('../../scripts/direct-editorial.cjs');
const { verifySubject } = require('../../scripts/subject-verification.cjs');
const policy = require('../../config/content-delivery-policy.json');
const curation = scenario();
const questions = curation.output.proposals;
const topic = questions[0].topic;
const directory = 'docs/editorial/subject-runs/historia/';
const docs = {};
const calls = [];
const timestamp = new Date().toISOString();
const authorReport = {
  schemaVersion: 'direct-curation-report-v1',
  input: curation.input,
  originalResponse: JSON.stringify({ output: curation.output }),
  agent: 'content_curator',
  agentInstanceId: 'autor-sintetico',
  runId: 'autor:turno',
  completedAt: timestamp,
  testOnly: false,
};
authorReport.sha256 = digest(authorReport);
docs[directory + 'autor.json'] = authorReport;
calls.push({
  topic,
  pass: 'curation',
  actor: authorReport.agentInstanceId,
  status: 'completed',
  evidencePath: directory + 'autor.json',
});
const record = {
  schemaVersion: 'content-delivery-v1',
  batch: `2026-t3-v2/historia/${topic}`,
  sourceSha256: packageHash(questions),
  testOnly: false,
  reviews: [],
  requirements: requirementsFor('historia', policy).map((r) => ({
    ...r,
    evidence: 'fixture://sintetica',
  })),
  curationEvidencePaths: [directory + 'autor.json'],
  visual: {
    sourceSha256: packageHash(questions),
    test: 'content-delivery-ui',
    evidenceRef: 'fixture://visual',
  },
  approval: {
    kind: 'delegated',
    delegationId: policy.standingDelegation.id,
    sourceSha256: packageHash(questions),
    executionId: 'execucao-sintetica',
    evidenceRef: 'fixture://comando-sintetico',
  },
};
for (const pass of ['pedagogical', 'linguistic']) {
  const input = {
    ...curation.input,
    requestedPass: pass,
    proposals: questions,
    checklist: FIELDS,
  };
  const output = {
    ...curation.output,
    agent: 'pedagogical_quality',
    reviewPass: pass,
  };
  delete output.proposals;
  const originalResponse = JSON.stringify({
    output,
    results: questions.map((q) => ({
      questionId: q.id,
      decision: 'approved',
      findings: [],
      doubts: [],
      checks: Object.fromEntries(
        FIELDS.map((f) => [f, 'Criterio conferido no exemplo sintetico.']),
      ),
    })),
  });
  const report = {
    schemaVersion: 'direct-editorial-report-v1',
    input,
    originalResponse,
    agent: 'pedagogical_quality',
    agentInstanceId: pass,
    runId: pass + ':turno',
    pass,
    completedAt: timestamp,
    testOnly: false,
  };
  report.sha256 = digest(report);
  docs[directory + pass + '-original.json'] = report;
  docs[directory + pass + '.json'] = {
    scenarioId: report.runId,
    inputState: 'complete',
    input,
    output,
    execution: {
      kind: 'direct-editorial',
      agent: 'pedagogical_quality',
      agentInstanceId: pass,
      runId: report.runId,
      pass,
      completedAt: timestamp,
      testOnly: false,
      questionSha256s: Object.fromEntries(
        questions.map((q) => [q.id, digest(q)]),
      ),
      originalReportPath: directory + pass + '-original.json',
      originalReportSha256: report.sha256,
    },
  };
  calls.push({
    topic,
    pass,
    actor: pass,
    status: 'completed',
    evidencePath: directory + pass + '.json',
  });
  record.reviews.push(
    ...questions.map((q) => ({
      questionId: q.id,
      pass,
      evidencePath: directory + pass + '.json',
    })),
  );
}
const start = Date.now();
docs[directory + 'run.json'] = {
  schemaVersion: 'subject-run-v1',
  id: 'execucao-sintetica',
  subject: 'historia',
  contentSetId: '2026-t3-v2',
  topics: [topic],
  baseSha: 'a'.repeat(40),
  authorizationRef: record.approval.evidenceRef,
  startedAt: start,
  deadline: start + 180 * 60000,
  calls,
};
const prefix = `2026-t3-v2--historia--${topic}`;
docs[`docs/drafts/${prefix}.json`] = { questions };
docs[`docs/editorial/${prefix}.json`] = record;
const descriptor = {
  schemaVersion: 'subject-delivery-v1',
  subject: 'historia',
  contentSetId: '2026-t3-v2',
  runtimePath: 'js/data/t3-historia-v2-published.js',
  runPath: directory + 'run.json',
  batches: [
    {
      topic,
      draftPath: `docs/drafts/${prefix}.json`,
      recordPath: `docs/editorial/${prefix}.json`,
    },
  ],
};
const options = {
  descriptor,
  policy,
  coverage: {
    contentSets: {
      '2026-t3-v2': {
        intakeStatus: 'frozen',
        subjects: { historia: { [topic]: 20 } },
      },
    },
  },
  readJson: (name) => docs[name],
  readText: () =>
    `window.QuestionsDataSources.historia.questions = ${JSON.stringify(questions.map((q) => ({ ...q, reviewStatus: 'published' })))}`,
};
assert.deepEqual(
  verifySubject(options).errors,
  [],
  'Cenario inteiramente sintetico: nao constitui parecer real.',
);
docs[directory + 'run.json'].deadline = start;
assert.ok(verifySubject(options).errors.length);
docs[directory + 'run.json'].deadline = start + 180 * 60000;
authorReport.originalResponse += ' ';
assert.ok(verifySubject(options).errors.length);
console.log('subject-integration: ok (dados e identidades sinteticos)');
