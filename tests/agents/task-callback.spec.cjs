'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { run: execute, parse } = require('../../scripts/task-callback.cjs');

assert.deepEqual(parse(['--id', 'valid-1', '--', process.execPath, '-e', '']), {
  id: 'valid-1',
  command: [process.execPath, '-e', ''],
});
assert.throws(() => parse(['--id', '../bad', '--', 'echo']), /Uso/);
assert.match(parse(['--', 'echo']).id, /^[a-f0-9-]{36}$/);
assert.deepEqual(parse(['--', 'echo', '--id', 'argument']).command, [
  'echo',
  '--id',
  'argument',
]);
assert.throws(() => parse(['--unknown', '--', 'echo']), /Uso/);
assert.throws(() => parse([]), /Uso/);
const run = (options, root) => execute(options, root, async () => false);
(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'task-callback-'));
  try {
    assert.equal(
      await run(
        { id: 'ok', command: [process.execPath, '-e', 'process.exit(0)'] },
        root,
      ),
      0,
    );
    const receipt = JSON.parse(
      fs.readFileSync(path.join(root, '.codex/task-callbacks/ok.json'), 'utf8'),
    );
    assert.equal(receipt.status, 'succeeded');
    assert.equal(receipt.exitCode, 0);
    await assert.rejects(
      run({ id: 'ok', command: [process.execPath, '-e', ''] }, root),
      /EEXIST/,
    );
    assert.equal(
      await run(
        { id: 'bad', command: [process.execPath, '-e', 'process.exit(7)'] },
        root,
      ),
      7,
    );
    assert.equal(
      JSON.parse(
        fs.readFileSync(
          path.join(root, '.codex/task-callbacks/bad.json'),
          'utf8',
        ),
      ).status,
      'failed',
    );
    assert.equal(
      await run({ id: 'missing', command: ['/.missing-task-command'] }, root),
      127,
    );
    if (process.platform !== 'win32') {
      assert.equal(
        await run(
          {
            id: 'signal',
            command: [
              process.execPath,
              '-e',
              "process.kill(process.pid, 'SIGTERM')",
            ],
          },
          root,
        ),
        1,
      );
      assert.equal(
        JSON.parse(
          fs.readFileSync(path.join(root, '.codex/task-callbacks/signal.json')),
        ).signal,
        'SIGTERM',
      );
    }
    for (const [id, notifier] of [
      ['notified', async () => true],
      [
        'rejected',
        async () => {
          throw new Error('indisponivel');
        },
      ],
      ['timeout', () => new Promise(() => {})],
    ]) {
      assert.equal(
        await execute(
          { id, command: [process.execPath, '-e', ''] },
          root,
          notifier,
          20,
        ),
        0,
      );
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  process.stdout.write('task-callback: ok\n');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
