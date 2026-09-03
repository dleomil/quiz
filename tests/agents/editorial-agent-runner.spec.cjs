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
  const fakeMcpCodex = path.join(directory, 'fake-mcp-codex.js');
  const inputPath = path.join(directory, 'input.json');
  const outputPath = path.join(directory, 'output.json');
  const recordPath = path.join(directory, 'record.json');
  const source = scenarios[0];
  const pedagogicalSource = scenarios[1];
  fs.writeFileSync(
    fakeCodex,
    `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
if (args[0] === 'mcp') {
  if (args.join(' ') !== 'mcp list --json') process.exit(2);
  process.stdout.write('[]');
  process.exit(0);
}
if (args[0] !== 'exec') process.exit(2);
fs.writeFileSync(${JSON.stringify(recordPath)}, JSON.stringify({
    argv: args,
    cwd: process.cwd(),
    env: process.env,
  }));
const output = process.argv[process.argv.indexOf('--output-last-message') + 1];
const response = process.argv.some((argument) => argument.includes('pedagogical_quality'))
  ? ${JSON.stringify(JSON.stringify(pedagogicalSource.output))}
  : ${JSON.stringify(JSON.stringify(source.output))};
fs.writeFileSync(output, response);
`,
    { mode: 0o755 },
  );
  fs.writeFileSync(
    fakeMcpCodex,
    fs
      .readFileSync(fakeCodex, 'utf8')
      .replace(
        "process.stdout.write('[]');",
        'process.stdout.write(\'[{\\"name\\":\\"github\\"}]\');',
      ),
    { mode: 0o755 },
  );
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
        env: {
          PATH: process.env.PATH,
          OPENAI_API_KEY: 'test-only-not-a-secret',
          INHERITED_CONNECTOR_TOKEN: 'must-not-reach-child',
        },
      },
    );
    assert.equal(
      success.status,
      0,
      success.stderr || success.error?.message || JSON.stringify(success),
    );
    assert.deepEqual(
      JSON.parse(fs.readFileSync(outputPath, 'utf8')).output,
      source.output,
    );
    const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
    assert.ok(record.argv.includes('--model'));
    assert.ok(record.argv.includes('gpt-5.6-sol'));
    assert.ok(record.argv.includes('--sandbox'));
    assert.ok(record.argv.includes('read-only'));
    assert.ok(record.argv.includes('--skip-git-repo-check'));
    assert.ok(record.argv.includes('--ignore-user-config'));
    assert.equal(record.argv[0], 'exec');
    assert.notEqual(record.cwd, root);
    assert.equal(record.env.INHERITED_CONNECTOR_TOKEN, undefined);
    assert.equal(record.env.HOME, record.env.CODEX_HOME);

    const pedagogicalInputPath = path.join(directory, 'pedagogical-input.json');
    const pedagogicalOutputPath = path.join(
      directory,
      'pedagogical-output.json',
    );
    writeJson(pedagogicalInputPath, {
      scenarioId: scenarios[1].scenarioId,
      inputState: scenarios[1].inputState,
      input: scenarios[1].input,
    });
    const pedagogical = spawnSync(
      process.execPath,
      [
        runner,
        '--agent',
        'pedagogical_quality',
        '--input',
        pedagogicalInputPath,
        '--output',
        pedagogicalOutputPath,
        '--codex-bin',
        fakeCodex,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        env: {
          PATH: process.env.PATH,
          OPENAI_API_KEY: 'test-only-not-a-secret',
        },
      },
    );
    assert.equal(pedagogical.status, 0, pedagogical.stderr);

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
        fakeMcpCodex,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        env: {
          PATH: process.env.PATH,
          OPENAI_API_KEY: 'test-only-not-a-secret',
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
