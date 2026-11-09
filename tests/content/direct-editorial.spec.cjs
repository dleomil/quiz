const assert = require('node:assert/strict');
const clone = (value) => JSON.parse(JSON.stringify(value));
const {
  digest,
  reviewProjection,
  validateReviews,
  packageHash,
  batchKey,
  requirementsFor,
} = require('../../scripts/content-delivery.cjs');
const { evidenceFor } = require('../helpers/content-delivery-fixtures.cjs');
const policy = require('../../config/content-delivery-policy.json');
const template = require('../fixtures/agents/editorial-scenarios.json')[1];
const source =
  require('../../docs/drafts/2026-t3-v2-geo-usos-da-agua.json').questions;
function fixture(size = 2) {
  const questions = clone(source.slice(0, size)).map((q) => ({
    ...q,
    version: 1,
  }));
  const docs = {};
  const record = {
    schemaVersion: 'content-delivery-v1',
    batch: batchKey(questions[0]),
    sourceSha256: packageHash(questions),
    testOnly: true,
    reviews: [],
    requirements: requirementsFor('geografia', policy).map((r) => ({
      ...r,
      evidence: 'fixture://teste',
    })),
  };
  for (const pass of ['pedagogical', 'linguistic']) {
    const input = {
      ...clone(template.input),
      workItemId: 'fixture',
      contentSetId: '2026-t3-v2',
      subjectId: 'geografia',
      topicId: questions[0].topic,
      authorizedSkill: questions[0].skill,
      sourceRef: questions[0].sourceRef,
      questionVersion: 1,
      requestedPass: pass,
      proposals: questions.map(reviewProjection),
      checklist: [
        'question',
        'options',
        'answer',
        'explanation',
        'wrongExplanations',
      ],
    };
    delete input.proposal;
    const output = {
      ...clone(template.output),
      workItemId: input.workItemId,
      contentSetId: input.contentSetId,
      subjectId: input.subjectId,
      topicId: input.topicId,
      reviewPass: pass,
      decision: 'approved',
      findings: [],
      doubts: [],
      facts: ['Evidencia ficticia exclusiva dos testes.'],
    };
    const execution = {
      kind: 'direct-editorial',
      agent: 'pedagogical_quality',
      agentInstanceId: `fixture-${pass}`,
      runId: `fixture-run-${pass}`,
      pass,
      completedAt: '2026-11-09T12:00:00Z',
      testOnly: true,
      questionSha256s: Object.fromEntries(
        input.proposals.map((q) => [q.id, digest(q)]),
      ),
      originalReportPath: `docs/editorial/fixture-original-${pass}.json`,
    };
    const results = questions.map((q) => ({
      questionId: q.id,
      decision: 'approved',
      findings: [],
      doubts: [],
      checks: Object.fromEntries(
        input.checklist.map((f) => [f, `Teste ficticio de ${f} para ${q.id}`]),
      ),
    }));
    const report = {
      schemaVersion: 'direct-editorial-report-v1',
      input,
      originalResponse: JSON.stringify({ output, results }),
      agent: execution.agent,
      agentInstanceId: execution.agentInstanceId,
      runId: execution.runId,
      pass,
      completedAt: execution.completedAt,
      testOnly: true,
    };
    report.sha256 = digest(report);
    execution.originalReportSha256 = report.sha256;
    docs[execution.originalReportPath] = report;
    const ref = `docs/editorial/fixture-direct-${pass}.json`;
    docs[ref] = {
      scenarioId: `fixture-${pass}`,
      inputState: 'complete',
      input,
      output,
      execution,
    };
    for (const q of questions)
      record.reviews.push({ questionId: q.id, pass, evidencePath: ref });
  }
  return { questions, record, docs };
}
function check(f, allowTestEvidence = true) {
  return validateReviews(
    f.questions,
    f.record,
    (p) => {
      if (!f.docs[p]) throw new Error('relatorio ausente');
      return f.docs[p];
    },
    { policy, allowTestEvidence },
  );
}
function scenario(f, pass = 'pedagogical') {
  return f.docs[`docs/editorial/fixture-direct-${pass}.json`];
}
function rewrite(f, mutate, pass = 'pedagogical') {
  const s = scenario(f, pass),
    r = f.docs[s.execution.originalReportPath];
  const response = JSON.parse(r.originalResponse);
  mutate(response, r, s);
  r.originalResponse = JSON.stringify(response);
  delete r.sha256;
  r.sha256 = digest(r);
  s.execution.originalReportSha256 = r.sha256;
}
assert.deepEqual(check(fixture()), []);
assert.deepEqual(check(fixture(20)), []);

assert(check(fixture(), false).some((e) => /fictic/.test(e)));
for (const [name, mutate, pattern] of [
  ['passagem ausente', (f) => f.record.reviews.pop(), /revisao ausente/],
  [
    'instancia repetida',
    (f) =>
      rewrite(
        f,
        (_, r, s) => {
          r.agentInstanceId = 'fixture-pedagogical';
          s.execution.agentInstanceId = r.agentInstanceId;
        },
        'linguistic',
      ),
    /instancia direta repetida/,
  ],
  [
    'proposta divergente',
    (f) => {
      f.questions[0].question += ' alterada';
    },
    /proposta revisada diverge/,
  ],
  [
    'hash antigo',
    (f) => {
      scenario(f).execution.questionSha256s[f.questions[0].id] = '0'.repeat(64);
    },
    /hash/,
  ],
  [
    'relatorio ausente',
    (f) => {
      delete f.docs[scenario(f).execution.originalReportPath];
    },
    /relatorio ausente/,
  ],
  [
    'achado aberto',
    (f) =>
      rewrite(f, (r) => {
        r.results[0].findings.push({ criterion: 'teste' });
      }),
    /resultado individual/,
  ],
  [
    'cobertura incompleta',
    (f) => rewrite(f, (r) => r.results.pop()),
    /cobertura individual/,
  ],
  [
    'checks incompletos',
    (f) =>
      rewrite(f, (r) => {
        delete r.results[0].checks.options;
      }),
    /resultado individual/,
  ],
  [
    'resposta adulterada',
    (f) => {
      scenario(f).output.facts = ['Outro parecer'];
    },
    /resposta original diverge/,
  ],
  [
    'relatorio adulterado',
    (f) => {
      f.docs[scenario(f).execution.originalReportPath].originalResponse += ' ';
    },
    /hash do relatorio/,
  ],
  [
    'sem identidade',
    (f) => {
      delete scenario(f).execution.agentInstanceId;
    },
    /instancia ausente/,
  ],
  [
    'outro acervo',
    (f) => {
      f.questions[0].contentSetId = '2026-t3-v1';
    },
    /nao autorizada/,
  ],
  [
    'materia fora do escopo',
    (f) => {
      f.questions[0].subject = 'portugues';
    },
    /nao autorizada/,
  ],
  [
    'caminho inseguro',
    (f) => {
      scenario(f).execution.originalReportPath =
        'docs/editorial/../outside.json';
    },
    /referencia/,
  ],
]) {
  const f = fixture();
  mutate(f);
  assert(
    check(f).some((e) => pattern.test(e)),
    name,
  );
}
const f = fixture();
f.questions[1].question += ' Alterada.';
f.record.sourceSha256 = packageHash(f.questions);
assert(
  !check(f).some((e) => e.includes(f.questions[0].id)),
  'revisoes de IDs inalterados preservadas',
);
const old = evidenceFor(source.slice(0, 1));
assert.deepEqual(
  validateReviews(source.slice(0, 1), old.record, (p) => old.documents[p], {
    policy,
    allowTestEvidence: true,
  }),
  [],
);
console.log(
  'direct-editorial: contrato, rejeicoes, revisoes preservadas e compatibilidade OK',
);

const partial = fixture();
rewrite(partial, (response, report, scenario) => {
  const finding = {
    questionId: partial.questions[1].id,
    criterion: 'clareza',
    severity: 'minor',
    evidence: 'Trecho ficticio do teste.',
    recommendation: 'Ajustar trecho.',
  };
  response.results[1].decision = 'adjustments_required';
  response.results[1].findings = [finding];
  response.output.decision = 'adjustments_required';
  response.output.findings = [finding];
  scenario.output = response.output;
});
partial.record.reviews = partial.record.reviews.filter(
  (r) => r.questionId !== partial.questions[1].id || r.pass !== 'pedagogical',
);
assert(
  check(partial).every(
    (e) =>
      e.startsWith('revisao ausente:') && e.includes(partial.questions[1].id),
  ),
  'parecer individual aprovado preservado em relatorio com outros IDs pendentes',
);
