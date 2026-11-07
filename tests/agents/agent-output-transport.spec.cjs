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
