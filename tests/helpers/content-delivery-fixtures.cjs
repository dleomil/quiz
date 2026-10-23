const crypto = require('node:crypto');
const {
  packageHash,
  digest,
  reviewProjection,
  batchKey,
  requirementsFor,
} = require('../../scripts/content-delivery.cjs');
const policy = require('../../config/content-delivery-policy.json');
const template = require('../fixtures/agents/editorial-scenarios.json')[1];

function evidenceFor(questions) {
  const hash = packageHash(questions);
  const documents = {};
  const reviews = questions.flatMap((question) =>
    ['pedagogical', 'linguistic'].map((pass) => {
      const scenario = JSON.parse(JSON.stringify(template));
      const proposal = reviewProjection(question);
      Object.assign(scenario.input, {
        workItemId: `fixture-${question.id}`,
        contentSetId: question.contentSetId,
        subjectId: question.subject,
        topicId: question.topic,
        authorizedSkill: question.skill,
        sourceRef: proposal.sourceRef,
        questionVersion: question.version,
        requestedPass: pass,
        proposal,
      });
      Object.assign(scenario.output, {
        workItemId: scenario.input.workItemId,
        contentSetId: question.contentSetId,
        subjectId: question.subject,
        topicId: question.topic,
        reviewPass: pass,
        decision: 'approved',
        findings: [],
        doubts: [],
        recommendations: [],
        facts: [
          'Exemplo ficticio para testar o contrato; nao e revisao editorial real.',
        ],
      });
      scenario.execution = {
        kind: 'isolated-editorial',
        runId: crypto.randomUUID(),
        packageSha256: hash,
        proposalSha256: digest(proposal),
        agent: 'pedagogical_quality',
        pass,
        completedAt: '2026-10-18T18:00:00Z',
        testOnly: true,
      };
      const evidencePath = `docs/editorial/fixture-${question.id}-${pass}.json`;
      documents[evidencePath] = scenario;
      return { questionId: question.id, pass, evidencePath };
    }),
  );
  const record = {
    schemaVersion: 'content-delivery-v1',
    batch: batchKey(questions[0]),
    sourceSha256: hash,
    testOnly: true,
    reviews,
    requirements: requirementsFor(questions[0].subject, policy).map((rule) => ({
      id: rule.id,
      verification: rule.verification,
      evidence: 'fixture://evidencia-ficticia',
    })),
    approval: {
      kind: 'editorial',
      sourceSha256: hash,
      approvedBy: 'dleomil',
      evidenceRef: 'https://github.com/dleomil/quiz/issues/395#issuecomment-1',
    },
    visual: {
      sourceSha256: hash,
      test: 'content-delivery-ui',
      evidenceRef: 'fixture://visual',
    },
  };
  const comment = {
    user: { login: 'dleomil', type: 'User' },
    html_url: record.approval.evidenceRef,
    created_at: '2026-10-18T18:01:00Z',
    body: `Aprovo editorialmente o lote ${record.batch} hash ${hash}`,
  };
  return { record, documents, comment };
}
module.exports = { evidenceFor };
