const assert = require('node:assert/strict');
const { create, reserve, finish } = require('../../scripts/subject-run.cjs');
const initial = {
  subject: 'historia',
  contentSetId: '2026-t3-v2',
  topics: ['tema-a', 'tema-b'],
  baseSha: 'a'.repeat(40),
  authorizationRef: 'conversa-autorizada',
};
let state = create(initial, 1000);
const call = {
  topic: 'tema-a',
  pass: 'curation',
  actor: 'autor',
  inputSha256: 'b'.repeat(64),
};
assert.throws(
  () => create({ ...initial, subject: 'portugues' }),
  /fora da fila/,
);
assert.throws(() => reserve(state, call, state.deadline), /prazo/);
state = reserve(state, call, 2000);
assert.throws(() => reserve(state, call, 2000), /reservada|redundante/);
assert.throws(
  () => reserve(state, { ...call, pass: 'linguistic' }, 2000),
  /instancias/,
);
state = finish(state, { id: state.calls[0].id, status: 'completed' }, 3000);
assert.equal(state.calls[0].usage, null);
assert.equal(state.startedAt, 1000);
for (const pass of ['pedagogical', 'linguistic'])
  state = reserve(state, { ...call, pass, actor: pass }, 4000);
state = reserve(state, { ...call, topic: 'tema-b', actor: 'outro' }, 4000);
assert.throws(
  () =>
    reserve(
      state,
      { ...call, topic: 'tema-b', pass: 'linguistic', actor: 'quarto' },
      4000,
    ),
  /concorrencia/,
);
assert.throws(
  () =>
    finish(state, {
      id: state.calls[1].id,
      status: 'completed',
      usage: { inputTokens: -1, outputTokens: 0 },
    }),
  /consumo/,
);
console.log('subject-run: ok');
