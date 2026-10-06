const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const runner = path.join(root, 'scripts', 'run-editorial-agent.cjs');
const {
  safeExecutionFailure,
} = require('../../scripts/run-editorial-agent.cjs');
const scenarios = require('../fixtures/agents/editorial-scenarios.json');

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function run() {
  assert.equal(
    safeExecutionFailure({ status: 1, stderr: '401 Unauthorized token-value' }),
    'resposta 401 do servico',
  );
  assert.equal(
    safeExecutionFailure({ status: 1, stderr: 'connect timeout' }),
    'falha de rede',
  );

  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-editorial-runner-'),
  );
  const fakeCodex = path.join(directory, 'fake-codex.js');
  const fakeMcpCodex = path.join(directory, 'fake-mcp-codex.js');
  const fakeApiCodex = path.join(directory, 'fake-api-codex.js');
  const fakeFailureCodex = path.join(directory, 'fake-failure-codex.js');
  const inputPath = path.join(directory, 'input.json');
  const outputPath = path.join(directory, 'output.json');
  const recordPath = path.join(directory, 'record.json');
  const statusRecordPath = path.join(directory, 'status-record.json');
  const mcpHomePath = path.join(directory, 'mcp-home.json');
  const authHome = path.join(directory, 'auth-home');
  fs.mkdirSync(authHome);
  fs.writeFileSync(path.join(authHome, 'auth.json'), '{"session":"test"}\n');
  const source = scenarios[0];
  const pedagogicalSource = scenarios[1];
  fs.writeFileSync(
    fakeCodex,
    `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
if (args.join(' ') === 'login status') {
  fs.writeFileSync(${JSON.stringify(statusRecordPath)}, JSON.stringify({ env: process.env }));
  process.stdout.write('Logged in using ChatGPT');
  process.exit(0);
}
if (args[0] === 'mcp') {
  if (args.join(' ') !== 'mcp list --json') process.exit(2);
  fs.writeFileSync(${JSON.stringify(mcpHomePath)}, JSON.stringify({ home: process.env.CODEX_HOME }));
  if (!fs.existsSync(process.env.CODEX_HOME + '/auth.json')) process.exit(3);
  process.stdout.write('[]');
  process.exit(0);
}
if (args[0] !== 'exec') process.exit(2);
fs.writeFileSync(${JSON.stringify(recordPath)}, JSON.stringify({
    argv: args,
    cwd: process.cwd(),
    env: process.env,
    authMode: fs.existsSync(process.env.CODEX_HOME + '/auth.json'),
    authModeBits: fs.statSync(process.env.CODEX_HOME + '/auth.json').mode & 0o777,
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
    fakeApiCodex,
    fs
      .readFileSync(fakeCodex, 'utf8')
      .replace('Logged in using ChatGPT', 'Logged in using an API key'),
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
  fs.writeFileSync(
    fakeFailureCodex,
    fs
      .readFileSync(fakeCodex, 'utf8')
      .replace(
        "if (args[0] !== 'exec') process.exit(2);",
        "if (args[0] === 'exec') process.exit(7);\nif (args[0] !== 'exec') process.exit(2);",
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
          CODEX_HOME: authHome,
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
    assert.equal(record.env.OPENAI_API_KEY, undefined);
    assert.equal(record.authMode, true);
    assert.equal(record.authModeBits, 0o600);
    assert.equal(fs.existsSync(record.env.CODEX_HOME), false);
    assert.equal(
      JSON.parse(fs.readFileSync(statusRecordPath, 'utf8')).env.OPENAI_API_KEY,
      undefined,
    );
    assert.equal(
      fs.existsSync(JSON.parse(fs.readFileSync(mcpHomePath, 'utf8')).home),
      false,
    );

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
          CODEX_HOME: authHome,
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
          CODEX_HOME: authHome,
          OPENAI_API_KEY: 'test-only-not-a-secret',
        },
      },
    );
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /MCP ou connector configurado/);

    const unauthenticated = spawnSync(
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
        fakeApiCodex,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        env: { PATH: process.env.PATH, CODEX_HOME: authHome },
      },
    );
    assert.notEqual(unauthenticated.status, 0);
    assert.match(
      unauthenticated.stderr,
      /sessao ChatGPT do Codex indisponivel/,
    );

    const missingCache = spawnSync(
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
        env: { PATH: process.env.PATH, CODEX_HOME: directory },
      },
    );
    assert.notEqual(missingCache.status, 0);
    assert.match(
      missingCache.stderr,
      /cache local da sessao ChatGPT indisponivel/,
    );

    const failedExecution = spawnSync(
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
        fakeFailureCodex,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        env: { PATH: process.env.PATH, CODEX_HOME: authHome },
      },
    );
    assert.notEqual(failedExecution.status, 0);
    assert.match(
      failedExecution.stderr,
      /execucao do agente falhou \(codigo 7\)/,
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  process.stdout.write('editorial-agent-runner: ok\n');
}

run();
