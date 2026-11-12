const assert = require('node:assert/strict');
const vm = require('node:vm');
const t = require('../../scripts/agent-output-transport.cjs');
const contract = require('../../config/editorial-agent-output.schema.json');
const scenarios = require('../fixtures/agents/editorial-scenarios.json');
const {
  validateEditorialScenario,
} = require('../../scripts/validate-codex-agents.cjs');
const { SCHEMA_GUARD } = require('./transport-test-support.cjs');
assert.throws(() => t.validateSchema(contract), /nao suportada/);
assert.throws(
  () =>
    vm.runInNewContext(
      `${SCHEMA_GUARD};strictSchema(${JSON.stringify(contract)});`,
    ),
  /incompativel/,
);
for (const bad of [
  {
    type: 'object',
    properties: { x: { type: 'array' } },
    required: ['x'],
    additionalProperties: false,
  },
  {
    type: 'object',
    properties: { x: { type: 'string' } },
    required: [],
    additionalProperties: false,
  },
  { type: 'object', properties: {}, required: [], additionalProperties: true },
])
  assert.throws(() => t.validateSchema(bad));
for (const scenario of scenarios) {
  const schema = t.editorialSchema(
    contract,
    scenario.output.agent,
    scenario.input.subjectId,
  );
  vm.runInNewContext(
    `${SCHEMA_GUARD};strictSchema(${JSON.stringify(schema)});`,
  );
  const wire = vm.runInNewContext(
    `${SCHEMA_GUARD};transportOutput(${JSON.stringify(scenario.output)});`,
  );
  const decoded = t.decodeEditorial(wire, schema, scenario.output.agent);
  assert.deepEqual(decoded, scenario.output);
  assert.deepEqual(
    validateEditorialScenario({ ...scenario, output: decoded }),
    [],
  );
  assert.throws(() =>
    t.decodeEditorial({ ...wire, extra: true }, schema, scenario.output.agent),
  );
}
function curationWireProposal(question) {
  const wire = JSON.parse(JSON.stringify(question));
  wire.questionPt ??= null;
  wire.wrongExplanations = Object.fromEntries(
    ['0', '1', '2', '3'].map((key) => [
      key,
      key === String(wire.correctIndex) ? null : wire.wrongExplanations[key],
    ]),
  );
  return wire;
}
const scienceCurator = scenarios[0].output;
const curatorProposals = [
  curationWireProposal(scienceCurator.proposal),
  curationWireProposal({
    ...scienceCurator.proposal,
    id: `${scienceCurator.proposal.id}-2`,
  }),
];
const curatorBatchSchema = t.editorialBatchSchema(
  contract,
  'content_curator',
  'ciencias',
  curatorProposals.length,
);
vm.runInNewContext(
  `${SCHEMA_GUARD};strictSchema(${JSON.stringify(curatorBatchSchema)});`,
);
const curatorBatchWire = {
  ...Object.fromEntries(
    Object.entries(scienceCurator).filter(([key]) => key !== 'proposal'),
  ),
  proposals: curatorProposals,
};
const decodedCuratorBatch = t.decodeEditorialBatch(
  curatorBatchWire,
  curatorBatchSchema,
  'content_curator',
);
assert.equal(decodedCuratorBatch.proposals.length, 2);
assert.equal(
  Object.hasOwn(
    decodedCuratorBatch.proposals[0].wrongExplanations,
    String(decodedCuratorBatch.proposals[0].correctIndex),
  ),
  false,
);
assert.equal(
  Object.hasOwn(decodedCuratorBatch.proposals[0], 'questionPt'),
  false,
);
assert.throws(() =>
  t.decodeEditorialBatch(
    { ...curatorBatchWire, proposals: curatorProposals.slice(0, 1) },
    curatorBatchSchema,
    'content_curator',
  ),
);
const badBatchProposal = JSON.parse(JSON.stringify(curatorBatchWire));
badBatchProposal.proposals[0].correctIndex = 4;
assert.throws(() =>
  t.decodeEditorialBatch(
    badBatchProposal,
    curatorBatchSchema,
    'content_curator',
  ),
);
const duplicateCuratorProposal = JSON.parse(JSON.stringify(curatorBatchWire));
duplicateCuratorProposal.proposals[1].id =
  duplicateCuratorProposal.proposals[0].id;
assert.throws(() =>
  t.decodeEditorialBatch(
    duplicateCuratorProposal,
    curatorBatchSchema,
    'content_curator',
  ),
);

const reviewBatchSchema = t.editorialBatchSchema(
  contract,
  'pedagogical_quality',
  'ciencias',
  2,
);
vm.runInNewContext(
  `${SCHEMA_GUARD};strictSchema(${JSON.stringify(reviewBatchSchema)});`,
);
const reviewBatchWire = {
  ...scenarios[1].output,
  results: ['QUESTION-1', 'QUESTION-2'].map((questionId) => ({
    questionId,
    decision: 'approved',
    findings: [],
    doubts: [],
    checks: {
      question: 'Enunciado claro.',
      options: 'Alternativas distintas.',
      answer: 'Resposta unica defensavel.',
      explanation: 'Explicacao correta.',
      wrongExplanations: 'Feedbacks corretos.',
    },
  })),
};
const decodedReviewBatch = t.decodeEditorialBatch(
  reviewBatchWire,
  reviewBatchSchema,
  'pedagogical_quality',
);
assert.equal(decodedReviewBatch.results.length, 2);
assert.throws(() =>
  t.decodeEditorialBatch(
    { ...reviewBatchWire, results: reviewBatchWire.results.slice(0, 1) },
    reviewBatchSchema,
    'pedagogical_quality',
  ),
);
const missingReviewCheck = JSON.parse(JSON.stringify(reviewBatchWire));
delete missingReviewCheck.results[0].checks.answer;
assert.throws(() =>
  t.decodeEditorialBatch(
    missingReviewCheck,
    reviewBatchSchema,
    'pedagogical_quality',
  ),
);
assert.throws(() =>
  t.editorialBatchSchema(contract, 'pedagogical_quality', 'ciencias', 21),
);
const curator = scenarios[0];
const english = t.editorialSchema(contract, 'content_curator', 'ingles');
const wire = JSON.parse(JSON.stringify(curator.output));
wire.proposal.questionPt = 'Complete a pergunta especifica.';
wire.proposal.wrongExplanations[String(wire.proposal.correctIndex)] = null;
t.decodeEditorial(wire, english, 'content_curator');
for (const mutate of [
  (value) => {
    delete value.proposal.questionPt;
  },
  (value) => {
    value.proposal.questionPt = null;
  },
  (value) => {
    value.proposal.wrongExplanations[String(value.proposal.correctIndex)] =
      'Resposta inventada';
  },
  (value) => {
    const wrong = Object.keys(value.proposal.wrongExplanations).find(
      (key) => key !== String(value.proposal.correctIndex),
    );
    value.proposal.wrongExplanations[wrong] = null;
  },
  (value) => {
    value.decision = 'blocked';
  },
  (value) => {
    value.proposal = null;
  },
]) {
  const bad = JSON.parse(JSON.stringify(wire));
  mutate(bad);
  assert.throws(() => t.decodeEditorial(bad, english, 'content_curator'));
}
const invalidReview = JSON.parse(JSON.stringify(scenarios[1]));
invalidReview.output.findings = [];
assert.ok(validateEditorialScenario(invalidReview).length);
t.validateSchema(t.verificationSchema());
console.log(
  'agent-output-transport: ok (schema antigo rejeitado, campos obrigatorios e contrato editorial preservado)',
);
