const crypto = require('node:crypto');
const fs = require('node:fs');

const PASSES = ['curation', 'pedagogical', 'linguistic'];
function assert(value, message) {
  if (!value) throw new Error(message);
}
function create(
  { subject, contentSetId, topics, baseSha, authorizationRef },
  now = Date.now(),
) {
  assert(
    ['historia', 'ingles', 'matematica', 'ciencias'].includes(subject),
    'materia fora da fila autorizada',
  );
  assert(contentSetId === '2026-t3-v2', 'acervo fora do procedimento');
  assert(
    Array.isArray(topics) &&
      topics.length &&
      new Set(topics).size === topics.length &&
      topics.every((t) => typeof t === 'string' && t.trim()),
    'temas invalidos',
  );
  assert(/^[a-f0-9]{40}$/.test(baseSha), 'base obrigatoria');
  assert(
    typeof authorizationRef === 'string' && authorizationRef.trim(),
    'delegacao sem evidencia',
  );
  return {
    schemaVersion: 'subject-run-v1',
    id: crypto.randomUUID(),
    subject,
    contentSetId,
    topics,
    baseSha,
    authorizationRef,
    startedAt: now,
    deadline: now + 180 * 60000,
    calls: [],
  };
}
function reserve(
  state,
  { topic, pass, actor, inputSha256, round = 0 },
  now = Date.now(),
) {
  assert(now < state.deadline, 'prazo esgotado');
  assert(
    state.topics.includes(topic) && PASSES.includes(pass),
    'chamada fora do escopo',
  );
  assert(
    typeof actor === 'string' &&
      actor.trim() &&
      /^[a-f0-9]{64}$/.test(inputSha256),
    'identidade ou hash ausente',
  );
  assert(round === 0 || round === 1, 'limite de correcoes excedido');
  assert(
    !state.calls.some(
      (c) => c.topic === topic && c.pass === pass && c.round === round,
    ),
    'passagem ja reservada nesta rodada',
  );

  assert(
    state.calls.filter((c) => c.topic === topic).length < 6,
    'orcamento de chamadas esgotado',
  );
  assert(
    state.calls.filter((c) => c.status === 'running').length < 3,
    'limite de concorrencia',
  );
  assert(
    !state.calls.some(
      (c) =>
        c.topic === topic && c.pass === pass && c.inputSha256 === inputSha256,
    ),
    'chamada redundante',
  );
  assert(
    !state.calls.some(
      (c) => c.topic === topic && c.pass !== pass && c.actor === actor,
    ),
    'autoria e passagens exigem instancias distintas',
  );
  const call = {
    id: crypto.randomUUID(),
    topic,
    pass,
    actor,
    inputSha256,
    round,
    startedAt: now,
    status: 'running',
    usage: null,
  };
  return { ...state, calls: [...state.calls, call] };
}
function finish(
  state,
  { id, status, usage = null, actor, evidencePath = null },
  now = Date.now(),
) {
  assert(['completed', 'failed'].includes(status), 'estado invalido');
  const original = state.calls.find((c) => c.id === id);
  if (actor !== undefined) {
    assert(
      typeof actor === 'string' && actor.trim(),
      'identidade real ausente',
    );
    assert(
      !state.calls.some(
        (c) =>
          c.id !== id &&
          c.topic === original?.topic &&
          c.pass !== original?.pass &&
          c.actor === actor,
      ),
      'instancia repetida entre autoria e revisao',
    );
  }
  assert(
    evidencePath === null ||
      (typeof evidencePath === 'string' &&
        evidencePath.startsWith(
          `docs/editorial/subject-runs/${state.subject}/`,
        ) &&
        !evidencePath.split('/').includes('..')),
    'evidencia fora do escopo',
  );

  assert(
    state.calls.some((c) => c.id === id && c.status === 'running'),
    'chamada nao esta em execucao',
  );
  assert(
    usage === null ||
      ['inputTokens', 'outputTokens'].every(
        (k) => Number.isSafeInteger(usage[k]) && usage[k] >= 0,
      ),
    'consumo invalido',
  );
  return {
    ...state,
    calls: state.calls.map((c) =>
      c.id === id
        ? {
            ...c,
            actor: actor || c.actor,
            evidencePath,
            status,
            usage,
            completedAt: now,
          }
        : c,
    ),
  };
}
function run(args) {
  const [operation, statePath, inputPath] = args;
  assert(
    args.length === 3 && ['create', 'reserve', 'finish'].includes(operation),
    'use create|reserve|finish <registro.json> <entrada.json>',
  );
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (operation === 'create')
    fs.writeFileSync(statePath, JSON.stringify(create(input), null, 2) + '\n', {
      flag: 'wx',
      mode: 0o600,
    });
  else {
    const lock = statePath + '.lock';
    const fd = fs.openSync(lock, 'wx', 0o600);
    try {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      assert(state.schemaVersion === 'subject-run-v1', 'registro invalido');
      const updated =
        operation === 'reserve' ? reserve(state, input) : finish(state, input);
      const temporary = statePath + '.' + crypto.randomUUID();
      fs.writeFileSync(temporary, JSON.stringify(updated, null, 2) + '\n', {
        flag: 'wx',
        mode: 0o600,
      });
      fs.renameSync(temporary, statePath);
    } finally {
      fs.closeSync(fd);
      fs.unlinkSync(lock);
    }
  }
}
if (require.main === module) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`subject-run: ${error.message}\n`);
    process.exitCode = 1;
  }
}
module.exports = { create, reserve, finish };
