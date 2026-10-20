const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  fixtureRepository,
  workFor,
  commentFor,
} = require('./context-test-support.cjs');
const {
  initializeProfile,
  DISABLED_FEATURES,
} = require('../../scripts/agent-auth.cjs');
const { argumentsFrom } = require('../../scripts/run-writer-agent.cjs');

const original = path.resolve(__dirname, '../..');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-writer-test-'));
const json = (file, value) =>
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
try {
  const root = fixtureRepository(original, directory);
  const runner = path.join(root, 'scripts/run-writer-agent.cjs');
  const home = initializeProfile(path.join(directory, 'dedicated-auth'));
  const comment = path.join(directory, 'comment.json');
  const record = path.join(directory, 'record.json');
  json(comment, commentFor(root));
  function fake(mode) {
    const bin = path.join(directory, `codex-${mode}.cjs`);
    fs.writeFileSync(
      bin,
      `#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path');const args=process.argv.slice(2),mode=${JSON.stringify(mode)};
if(args[0]==='--version'){console.log('codex-cli 0.160.0');process.exit(0);}
if(args[0]==='sandbox'){
 if(mode==='sandbox-failed') process.exit(71);
 if(!args.includes('-P') || !args.some(a=>a.includes('network.enabled=false')) || !args.some(a=>a.includes('":root"="deny"')))process.exit(3);
 const cases=JSON.parse(args.at(-1)); const checks=Object.fromEntries(cases.map(([name,,,allowed])=>[name,allowed?'allowed':'denied']));checks.network='denied';console.log(JSON.stringify(checks));process.exit(0);
}
if(args[0]==='login'){console.log('Logged in using ChatGPT');process.exit(mode==='no-login'?1:0);}
if(args[0]==='features'){for(const name of ${JSON.stringify(DISABLED_FEATURES)})console.log(name+' stable false');console.log('skip_host_skill_discovery beta true');process.exit(0);}
if(args[0]==='mcp'){console.log('[]');process.exit(0);}
if(args[0]==='debug' && args[1]==='prompt-input'){console.log(JSON.stringify([{type:'message',role:'developer',content:[{text:'Contexto ficticio sem skills.'}]}]));process.exit(0);}
if(args[0]==='debug'){console.log(JSON.stringify({models:[{slug:'gpt-6-luna'},{slug:'gpt-6.1-sol'}]}));process.exit(0);}
if(args[0]!=='exec')process.exit(2);
const prompt=fs.readFileSync(0,'utf8');
fs.writeFileSync(${JSON.stringify(record)},JSON.stringify({args,env:process.env,cwd:process.cwd(),prompt}));
if(mode==='failed')process.exit(1);
if(mode==='outside')fs.writeFileSync('outside.txt','arquivo extra');
else if(mode==='symlink')fs.symlinkSync('/private/tmp','docs/writer-fixture.txt');
else fs.writeFileSync('docs/writer-fixture.txt','Proposta delimitada ficticia.');
console.log(JSON.stringify({type:'item.completed',item:{type:mode==='unexpected-tool'?'mcp_tool_call':'command_execution'}}));
console.log(JSON.stringify({type:'turn.completed',usage:{input_tokens:90,cached_input_tokens:10,output_tokens:20}}));
`,
      { mode: 0o755 },
    );
    return bin;
  }
  let sequence = 0;
  function invoke(mode, changeWork = () => {}, extra = []) {
    const work = workFor(
      root,
      {
        workItemId: 'fixture-writer',
        authorizedObjective: 'Produzir arquivo ficticio',
        subjectId: null,
        academicYear: 2026,
        term: 't3',
      },
      'implementer',
    );
    work.curriculumCycle = null;
    work.allowedPaths = ['docs/writer-fixture.txt'];
    work.commands = ['node --version'];
    changeWork(work);
    const workFile = path.join(directory, `work-${sequence}.json`);
    const output = path.join(directory, `output-${sequence++}.json`);
    json(workFile, work);
    if (fs.existsSync(record)) fs.unlinkSync(record);
    const execution = spawnSync(
      process.execPath,
      [
        runner,
        '--mode',
        'evaluation',
        '--work',
        workFile,
        '--output',
        output,
        '--auth-home',
        home,
        '--codex-bin',
        fake(mode),
        '--test-comment',
        comment,
        ...extra,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        timeout: 60000,
        env: {
          PATH: process.env.PATH,
          OPENAI_API_KEY: 'fixture-nao-herdar',
          CONNECTOR_TOKEN: 'fixture-nao-herdar',
        },
      },
    );
    return {
      ...execution,
      work,
      workFile,
      output,
      receipt: JSON.parse(fs.readFileSync(`${output}.receipt.json`)),
      executed: fs.existsSync(record),
    };
  }
  const success = invoke('ok');
  assert.equal(success.status, 0, success.stderr);
  assert.equal(success.receipt.result, 'proposed');
  assert.equal(success.receipt.testOnly, true);
  assert.equal(success.receipt.modelInvocations, 1);
  assert.equal(success.receipt.requestedModel, 'gpt-6-luna');
  assert.equal(success.receipt.usage.output_tokens, 20);
  assert.equal(success.receipt.subscriptionUsage, null);
  assert.equal(
    fs.existsSync(path.join(root, 'docs/writer-fixture.txt')),
    false,
  );
  const captured = JSON.parse(fs.readFileSync(record));
  assert.equal(captured.env.OPENAI_API_KEY, undefined);
  assert.equal(captured.env.CONNECTOR_TOKEN, undefined);
  assert.equal(captured.env.CODEX_HOME, home);
  assert.ok(captured.args.includes('--ignore-user-config'));
  assert.ok(captured.args.includes('features.shell_tool=true'));
  assert.ok(
    captured.args.some((value) => value.includes('network.enabled=false')),
  );
  assert.ok(!captured.args.includes('--sandbox'));
  assert.ok(captured.prompt.includes('Executor de agentes em copia isolada'));
  assert.ok(captured.prompt.includes('Cumprir o contrato editorial.'));
  assert.equal(fs.existsSync(captured.cwd), false);
  assert.equal(fs.existsSync(path.join(home, 'quiz-run.lock')), false);
  const specification = invoke('ok', (work) => {
    work.role = 'spec';
  });
  assert.equal(specification.status, 0, specification.stderr);
  assert.equal(specification.receipt.requestedModel, 'gpt-6.1-sol');
  assert.equal(specification.receipt.reasoningEffort, 'high');
  for (const mode of [
    'sandbox-failed',
    'no-login',
    'failed',
    'outside',
    'symlink',
    'unexpected-tool',
  ]) {
    const attempt = invoke(mode);
    assert.equal(attempt.status, 1, `${mode}: ${attempt.stderr}`);
    assert.equal(fs.existsSync(attempt.output), false, mode);
    assert.equal(
      fs.existsSync(path.join(root, 'docs/writer-fixture.txt')),
      false,
    );
    if (['sandbox-failed', 'no-login'].includes(mode)) {
      assert.equal(attempt.executed, false);
      assert.equal(attempt.receipt.modelInvocations, 0);
    } else assert.equal(attempt.receipt.modelInvocations, 1);
    assert.equal(fs.existsSync(path.join(home, 'quiz-run.lock')), false);
  }
  for (const changeWork of [
    (work) => {
      work.independentVerifier = 'implementer';
    },
    (work) => {
      work.allowedPaths = ['../escape'];
    },
    (work) => {
      work.documents.pop();
    },
  ]) {
    const attempt = invoke('ok', changeWork);
    assert.equal(attempt.status, 1, attempt.stderr);
    assert.equal(attempt.executed, false);
    assert.equal(attempt.receipt.modelInvocations, 0);
  }
  fs.mkdirSync(path.join(home, 'quiz-run.lock'));
  const locked = invoke('ok');
  assert.equal(locked.status, 1);
  assert.equal(fs.existsSync(path.join(home, 'quiz-run.lock')), true);
  fs.rmdirSync(path.join(home, 'quiz-run.lock'));

  const artifact = JSON.parse(fs.readFileSync(success.output));
  const retained = fs.readFileSync(success.output);
  const repeatedOutput = spawnSync(
    process.execPath,
    [
      runner,
      '--mode',
      'evaluation',
      '--work',
      success.workFile,
      '--output',
      success.output,
      '--auth-home',
      home,
      '--codex-bin',
      fake('ok'),
      '--test-comment',
      comment,
    ],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(repeatedOutput.status, 1);
  assert.deepEqual(fs.readFileSync(success.output), retained);
  const appliedOutput = path.join(directory, 'applied.json');
  const application = spawnSync(
    process.execPath,
    [
      runner,
      '--mode',
      'apply',
      '--work',
      success.workFile,
      '--artifact',
      success.output,
      '--expected-sha256',
      artifact.sha256,
      '--output',
      appliedOutput,
      '--codex-bin',
      fake('ok'),
      '--test-comment',
      comment,
    ],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(application.status, 0, application.stderr);
  assert.equal(
    fs.readFileSync(path.join(root, 'docs/writer-fixture.txt'), 'utf8'),
    'Proposta delimitada ficticia.',
  );
  const appliedReceipt = JSON.parse(
    fs.readFileSync(`${appliedOutput}.receipt.json`),
  );
  assert.equal(appliedReceipt.result, 'applied');
  assert.equal(appliedReceipt.modelInvocations, 0);
  assert.equal(appliedReceipt.testOnly, true);
  assert.throws(
    () => argumentsFrom(['--work', 'a', '--output', 'b', '--mode', 'active']),
    /candidatos/,
  );
  assert.throws(
    () =>
      argumentsFrom([
        '--work',
        'a',
        '--output',
        'b',
        '--mode',
        'evaluation',
        '--auth-home',
        'c',
        '--test-comment',
        'd',
      ]),
    /binario/,
  );
  process.stdout.write(
    'writer-agent-runner: ok (fixtures; nenhuma chamada real)\n',
  );
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
