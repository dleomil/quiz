const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const runner = path.join(root, 'scripts', 'run-editorial-agent.cjs');
const scenarios = require('../fixtures/agents/editorial-scenarios.json');

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function run() {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-editorial-runner-'),
  );
  const fakeCodex = path.join(directory, 'fake-codex.js');
  const inputPath = path.join(directory, 'input.json');
  const outputPath = path.join(directory, 'output.json');
  fs.writeFileSync(
    fakeCodex,
    `#!/usr/bin/env node
const fs = require('node:fs');
if (process.argv.includes('mcp')) {
  process.stdout.write(process.env.FAKE_MCP || '[]');
  process.exit(0);
}
const output = process.argv[process.argv.indexOf('--output-last-message') + 1];
fs.writeFileSync(output, process.env.FAKE_OUTPUT);
`,
    { mode: 0o755 },
  );
  const source = scenarios[0];
  writeJson(inputPath, {
    scenarioId: source.scenarioId,
    inputState: source.inputState,
    input: source.input,
  });

  try {
    const success = spawnSync(
      process.execPath,
      [
        runner,
        '--agent',
        'content_curator',
        '--input',
        inputPath,
        '--output',
        outputPath,
        '--codex-bin',
        fakeCodex,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, FAKE_OUTPUT: JSON.stringify(source.output) },
      },
    );
    assert.equal(success.status, 0, success.stderr);
    assert.deepEqual(
      JSON.parse(fs.readFileSync(outputPath, 'utf8')).output,
      source.output,
    );

    const blocked = spawnSync(
      process.execPath,
      [
        runner,
        '--agent',
        'content_curator',
        '--input',
        inputPath,
        '--output',
        outputPath,
        '--codex-bin',
        fakeCodex,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        env: {
          ...process.env,
          FAKE_MCP: '[{"name":"github"}]',
          FAKE_OUTPUT: JSON.stringify(source.output),
        },
      },
    );
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /MCP ou connector configurado/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  process.stdout.write('editorial-agent-runner: ok\n');
}

run();
