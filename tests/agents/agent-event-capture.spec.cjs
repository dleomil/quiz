const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const {
  analyzeEvents,
  assertEvents,
} = require('../../scripts/agent-cli-events.cjs');
const {
  createCapture,
  verifyCapture,
  LIMIT,
} = require('../../scripts/agent-event-capture.cjs');
const { execute } = require('../../scripts/agent-process.cjs');
const usage = { input_tokens: 12, cached_input_tokens: 2, output_tokens: 4 };
const lifecycle = [
  { type: 'thread.started', thread_id: 'thread-1' },
  { type: 'turn.started' },
  {
    type: 'item.started',
    item: { id: 'item_0', type: 'reasoning', text: 'Análise de ação.' },
  },
  {
    type: 'item.updated',
    item: {
      id: 'item_1',
      type: 'todo_list',
      items: [{ text: 'Conferir fonte.', completed: false }],
    },
  },
  {
    type: 'item.completed',
    item: {
      id: 'item_1',
      type: 'todo_list',
      items: [{ text: 'Conferir fonte.', completed: true }],
    },
  },
  {
    type: 'item.completed',
    item: { id: 'item_2', type: 'agent_message', text: '{}' },
  },
  { type: 'turn.completed', usage },
];
const jsonl = (items) =>
  items.map((item) => JSON.stringify(item)).join('\n') + '\n';
assert.deepEqual(assertEvents(analyzeEvents(jsonl(lifecycle))), usage);
for (const kind of [
  'command_execution',
  'file_change',
  'mcp_tool_call',
  'web_search',
  'collab_tool_call',
  'image_generation',
  'image_view',
]) {
  const summary = analyzeEvents(
    jsonl([
      { type: 'item.completed', item: { id: 'tool_1', type: kind } },
      ...lifecycle,
    ]),
  );
  assert.equal(summary.reasonCode, 'forbidden_tool');
  assert.deepEqual(summary.usage, usage);
  assert.throws(() => assertEvents(summary), /ferramenta/);
}
assert.equal(
  analyzeEvents(
    jsonl([
      { type: 'item.completed', item: { type: 'file_change' } },
      ...lifecycle,
    ]),
    ['file_change'],
  ).accepted,
  true,
);
for (const [event, code] of [
  [{}, 'unknown_event'],
  [{ type: 'future.event' }, 'unknown_event'],
  [{ type: 'item.completed', item: { type: 'future_item' } }, 'unknown_item'],
  [{ type: 'item.completed' }, 'invalid_jsonl'],
  [
    {
      type: 'item.completed',
      item: {
        type: 'todo_list',
        items: [{ text: 'x', completed: true, command: 'unsafe' }],
      },
    },
    'invalid_plan',
  ],
  [{ type: 'error', message: 'private raw' }, 'process_failure'],
  [{ type: 'turn.failed' }, 'process_failure'],
]) {
  const summary = analyzeEvents(jsonl([event, ...lifecycle]));
  assert.equal(summary.reasonCode, code);
  assert.ok(!JSON.stringify(summary).includes('private raw'));
}
assert.equal(analyzeEvents('bad\n').reasonCode, 'invalid_jsonl');
assert.equal(analyzeEvents('').reasonCode, 'incomplete_turn');
assert.equal(
  analyzeEvents(
    jsonl([{ type: 'turn.completed', usage: { input_tokens: -1 } }]),
  ).reasonCode,
  'invalid_usage',
);
async function main() {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-capture-test-'),
  );
  try {
    const output = path.join(directory, 'result.json'),
      capture = createCapture(output);
    const response = path.join(directory, 'response.json');
    fs.writeFileSync(response, '{"text":"ação"}');
    const raw = jsonl(lifecycle);
    const bytes = Buffer.from(raw);
    const split = bytes.indexOf(Buffer.from('á')) + 1;
    assert.ok(split > 1);
    const result = await execute(
      process.execPath,
      [
        '-e',
        `const b=Buffer.from(${JSON.stringify(bytes.toString('base64'))},'base64');process.stdout.write(b.subarray(0,${split}));setTimeout(()=>process.stdout.write(b.subarray(${split})),30);process.stderr.write('diagnostico');`,
      ],
      { input: '', capture },
    );
    assert.equal(result, raw);
    const manifest = capture.finish(response);
    assert.equal(manifest.exitCode, 0);
    assert.deepEqual(manifest.diagnosis.usage, usage);
    const stored = verifyCapture(output, manifest.sha256);
    assert.equal(fs.statSync(stored.directory).mode & 0o777, 0o700);
    for (const name of fs.readdirSync(stored.directory))
      assert.equal(
        fs.statSync(path.join(stored.directory, name)).mode & 0o777,
        0o600,
      );
    assert.equal(
      fs.readFileSync(path.join(stored.directory, 'response.json'), 'utf8'),
      '{"text":"ação"}',
    );
    assert.throws(() => createCapture(output), /EEXIST/);
    fs.appendFileSync(path.join(stored.directory, 'stdout.jsonl'), 'x');
    assert.throws(() => verifyCapture(output, manifest.sha256), /alterada/);
    const timeoutOutput = path.join(directory, 'timeout.json'),
      partial = createCapture(timeoutOutput);
    await assert.rejects(
      execute(
        process.execPath,
        ['-e', "process.stdout.write('{partial');setTimeout(()=>{},10000)"],
        { input: '', capture: partial, timeoutMs: 150 },
      ),
      /cinco minutos/,
    );
    const timeoutManifest = partial.finish();
    assert.equal(timeoutManifest.processError, 'process_failure');
    assert.equal(timeoutManifest.diagnosis.accepted, false);
    assert.ok(verifyCapture(timeoutOutput, timeoutManifest.sha256));
    const writeFailure = createCapture(
      path.join(directory, 'write-failed.json'),
    );
    writeFailure.save('proposal.json', {});
    assert.throws(() => writeFailure.save('proposal.json', {}), /EEXIST/);
    writeFailure.complete(0);
    assert.equal(writeFailure.finish().processError, 'capture_failure');
    const overflow = createCapture(path.join(directory, 'overflow.json'));
    overflow.append('stdout', Buffer.alloc(LIMIT + 1, 32));
    overflow.complete(0);
    assert.equal(overflow.finish().truncated, true);
    const symlinkOutput = path.join(directory, 'symlink.json'),
      symlinkCapture = createCapture(symlinkOutput);
    symlinkCapture.complete(0);
    const sealed = symlinkCapture.finish();
    const stdout = path.join(symlinkOutput + '.capture', 'stdout.jsonl');
    fs.unlinkSync(stdout);
    fs.symlinkSync(response, stdout);
    assert.throws(
      () => verifyCapture(symlinkOutput, sealed.sha256),
      /ELOOP|irregular/,
    );
    await assert.rejects(
      execute(
        process.execPath,
        ['-e', 'process.stdout.write("x");setTimeout(()=>{},10000)'],
        {
          input: '',
          capture: {
            append() {
              throw new Error('disk');
            },
            complete() {},
          },
        },
      ),
      /preservar/,
    );
    const child = spawn(
      process.execPath,
      [
        '-e',
        `const {execute}=require(${JSON.stringify(path.resolve(__dirname, '../../scripts/agent-process.cjs'))});const {createCapture}=require(${JSON.stringify(path.resolve(__dirname, '../../scripts/agent-event-capture.cjs'))});const c=createCapture(${JSON.stringify(path.join(directory, 'interrupted.json'))});execute(process.execPath,['-e','console.log("partial");setTimeout(()=>{},10000)'],{input:'',capture:c}).catch(()=>{c.finish();process.exitCode=1;});setTimeout(()=>process.kill(process.pid,'SIGTERM'),200);`,
      ],
      { stdio: 'ignore' },
    );
    await new Promise((resolve) => child.once('close', resolve));
    const interrupted = JSON.parse(
      fs.readFileSync(
        path.join(directory, 'interrupted.json.capture/manifest.json'),
      ),
    );
    assert.equal(interrupted.processError, 'process_failure');
    console.log(
      'agent-event-capture: ok (protocolo, diagnosticos, preservacao, limite, interrupcao e adulteracao; sem modelos)',
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
module.exports = { lifecycle, jsonl };
