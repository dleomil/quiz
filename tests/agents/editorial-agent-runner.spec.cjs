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
  DISABLED_FEATURES,
  initializeProfile,
  validateProfile,
  environment,
  skillArguments,
  assertNoEnabledSkills,
} = require('../../scripts/agent-auth.cjs');
const { usageFromEvents } = require('../../scripts/agent-run-receipt.cjs');
const { argumentsFrom } = require('../../scripts/run-editorial-agent.cjs');
const { SCHEMA_GUARD } = require('./transport-test-support.cjs');

const original = path.resolve(__dirname, '../..');
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-editorial-runner-'),
);
function json(name, value) {
  fs.writeFileSync(name, `${JSON.stringify(value, null, 2)}\n`);
}
try {
  const root = fixtureRepository(original, directory);
  const runner = path.join(root, 'scripts/run-editorial-agent.cjs');
  const authHome = initializeProfile(path.join(directory, 'dedicated-auth'));
  const builtInSkill = path.join(
    authHome,
    'skills',
    '.system',
    'skill-creator',
  );
  fs.mkdirSync(builtInSkill, { recursive: true });
  fs.writeFileSync(
    path.join(builtInSkill, 'SKILL.md'),
    'Skill de sistema ficticia que deve ficar desabilitada.',
  );
  const commentPath = path.join(directory, 'comment.json');
  const recordPath = path.join(directory, 'record.json');
  json(commentPath, commentFor(root));
  const scenarios = require('../fixtures/agents/editorial-scenarios.json');
  function fake(mode) {
    const bin = path.join(directory, `codex-${mode}.cjs`);
    fs.writeFileSync(
      bin,
      `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
const mode = ${JSON.stringify(mode)};
${SCHEMA_GUARD}
if (args[0] === '--version') { console.log('codex-cli 0.160.0'); process.exit(0); }
if (args[0] === 'login') { console.log(mode === 'api' ? 'Logged in using an API key' : 'Logged in using ChatGPT'); process.exit(mode === 'no-login' ? 1 : 0); }
if (args[0] === 'features') {
 for (const name of ${JSON.stringify(DISABLED_FEATURES)}) console.log(name + ' stable ' + (mode === 'shell' && name === 'shell_tool' ? 'true' : 'false'));
 console.log('skip_host_skill_discovery under development ' + (mode === 'host-skills' ? 'false' : 'true'));
 process.exit(0);
}
if (args[0] === 'mcp') { console.log(mode === 'mcp' ? '[{"name":"github"}]' : '[]'); process.exit(0); }
if (args[0] === 'debug' && args[1] === 'prompt-input') { console.log(JSON.stringify([{type:'message',role:'developer',content:[{text:mode === 'skill-context' ? '### Available skills\\n- externa: instrucao indevida\\n### How to use skills' : '### Available skills\\n\\n### How to use skills'}]}])); process.exit(0); }
if (args[0] === 'debug') { console.log(JSON.stringify({models: mode === 'no-model' ? [] : [{slug:'gpt-5.6-sol'}]})); process.exit(0); }
if (args[0] !== 'exec') process.exit(2);
strictSchema(JSON.parse(fs.readFileSync(args[args.indexOf('--output-schema')+1], 'utf8')));
const prompt = fs.readFileSync(0, 'utf8');
fs.writeFileSync(${JSON.stringify(recordPath)}, JSON.stringify({argv: args, env: process.env, cwd:process.cwd(), prompt}));
if (mode === 'failed') process.exit(1);
const response = prompt.includes('Atue exclusivamente como pedagogical_quality.')
 ? ${JSON.stringify(scenarios[1].output)} : ${JSON.stringify(scenarios[0].output)};
fs.writeFileSync(args[args.indexOf('--output-last-message')+1], mode === 'bad-output' ? '{}' : JSON.stringify(transportOutput(response)));
if(mode === 'tool') console.log(JSON.stringify({type:'item.completed',item:{type:'command_execution'}}));
console.log(JSON.stringify({type:'turn.completed',usage:{input_tokens:150,cached_input_tokens:20,output_tokens:45}}));
`,
      { mode: 0o755 },
    );
    return bin;
  }
  let sequence = 0;
  function invoke(mode, scenario = scenarios[0], extra = []) {
    const tag = `${sequence++}-${mode}`;
    const input = path.join(directory, `${tag}-input.json`);
    const output = path.join(directory, `${tag}-output.json`);
    const work = path.join(directory, `${tag}-work.json`);
    const agent = scenario.output.agent;
    json(input, {
      scenarioId: scenario.scenarioId,
      inputState: scenario.inputState,
      input: scenario.input,
    });
    json(work, workFor(root, scenario.input, agent.replaceAll('_', '-')));
    const args = [
      runner,
      '--agent',
      agent,
      '--input',
      input,
      '--output',
      output,
      '--work',
      work,
      '--auth-home',
      authHome,
      '--codex-bin',
      fake(mode),
      '--test-comment',
      commentPath,
      ...extra,
    ];
    const result = spawnSync(process.execPath, args, {
      cwd: root,
      encoding: 'utf8',
      env: {
        PATH: process.env.PATH,
        OPENAI_API_KEY: 'must-not-reach-child',
        INHERITED_CONNECTOR_TOKEN: 'must-not-reach-child',
        CODEX_HOME: '/unused-personal-home',
      },
    });
    return {
      ...result,
      output,
      receipt: JSON.parse(fs.readFileSync(`${output}.receipt.json`)),
    };
  }
  const success = invoke('ok');
  assert.equal(success.status, 0, success.stderr);
  assert.deepEqual(
    JSON.parse(fs.readFileSync(success.output)).output,
    scenarios[0].output,
  );
  assert.equal(success.receipt.testOnly, true);
  assert.equal(success.receipt.result, 'completed');
  assert.deepEqual(success.receipt.usage, {
    input_tokens: 150,
    cached_input_tokens: 20,
    output_tokens: 45,
  });
  assert.equal(success.receipt.subscriptionUsage, null);
  assert.equal(success.receipt.attempts, 1);
  assert.ok(success.receipt.artifactSha256);
  const record = JSON.parse(fs.readFileSync(recordPath));
  assert.equal(record.env.CODEX_HOME, authHome);
  assert.notEqual(record.env.HOME, record.env.CODEX_HOME);
  assert.equal(record.env.HOME, os.homedir());
  assert.equal(record.env.XDG_CONFIG_HOME, record.env.TMPDIR);
  assert.equal(record.env.OPENAI_API_KEY, undefined);
  assert.ok(record.argv.includes(skillArguments(authHome)[1]));
  assert.equal(
    success.receipt.preflight.skills,
    'disabled-and-context-checked',
  );
  assert.equal(record.env.INHERITED_CONNECTOR_TOKEN, undefined);
  assert.ok(
    record.argv.includes('--ignore-user-config') &&
      record.argv.includes('--ignore-rules') &&
      record.argv.includes('--strict-config'),
  );
  assert.ok(record.argv.includes('cli_auth_credentials_store="keyring"'));
  for (const flag of DISABLED_FEATURES)
    assert.ok(record.argv.includes(`features.${flag}=false`));
  assert.equal(record.argv.at(-1), '-');
  assert.ok(record.prompt.includes('Contratos autorizados completos'));
  assert.ok(record.prompt.includes('# Instrucoes do projeto Quiz'));
  assert.ok(
    record.prompt.includes(
      '# Contrato de entrega editorial: T3 e proximos acervos',
    ),
    'o runner deve entregar ao agente o contrato normativo fixado na ficha',
  );
  assert.ok(record.argv.includes('shell_environment_policy.inherit="none"'));
  assert.ok(
    record.argv.includes(
      `shell_environment_policy.set={ HOME=${JSON.stringify(record.env.TMPDIR)}, TMPDIR=${JSON.stringify(record.env.TMPDIR)} }`,
    ),
  );
  assert.equal(fs.existsSync(record.env.TMPDIR), false);
  assert.equal(fs.existsSync(record.cwd), false);
  assert.equal(fs.existsSync(authHome), true);
  for (const [mode, pattern] of [
    ['no-login', /preflight login/],
    ['api', /API nao autorizada/],
    ['shell', /isolamento nao confirmado/],
    ['host-skills', /skills pessoais/],
    ['mcp', /MCP ou connector/],
    ['no-model', /modelo ausente/],
    ['skill-context', /skill ativa no contexto/],
    ['failed', /execucao falhou/],
    ['tool', /ferramenta proibida/],
    ['bad-output', /saida rejeitada/],
  ]) {
    const blocked = invoke(mode);
    assert.notEqual(blocked.status, 0, mode);
    assert.match(blocked.stderr, pattern);
    assert.equal(fs.existsSync(blocked.output), false, mode);
    assert.equal(blocked.receipt.artifactSha256, null);
    assert.notEqual(blocked.receipt.result, 'completed');
  }
  const delivery = path.join(directory, 'delivery.json');
  json(delivery, { questions: [scenarios[1].input.proposal] });
  const review = invoke('ok', scenarios[1], ['--delivery-package', delivery]);
  assert.equal(review.status, 0, review.stderr);
  const execution = JSON.parse(fs.readFileSync(review.output)).execution;
  assert.equal(execution.testOnly, true);
  assert.equal(execution.runId, review.receipt.runId);
  assert.equal(execution.pass, 'linguistic');
  json(delivery, {
    questions: [
      { ...scenarios[1].input.proposal, question: 'Outra pergunta.' },
    ],
  });
  assert.match(
    invoke('ok', scenarios[1], ['--delivery-package', delivery]).stderr,
    /proposta diverge/,
  );

  const contractPath = path.join(
    root,
    'docs/specs/content-delivery-contract.md',
  );
  const contractSource = fs.readFileSync(contractPath);
  fs.unlinkSync(recordPath);
  fs.appendFileSync(contractPath, '\nAlteracao normativa sem novo aceite.\n');
  const staleContext = invoke('ok');
  assert.notEqual(staleContext.status, 0);
  assert.match(staleContext.stderr, /hash documental divergente/);
  assert.equal(fs.existsSync(recordPath), false);
  assert.equal(staleContext.receipt.contextSha256, null);
  assert.equal(staleContext.receipt.modelInvocations, 0);
  fs.writeFileSync(contractPath, contractSource);

  fs.mkdirSync(path.join(authHome, 'quiz-run.lock'));
  assert.match(invoke('ok').stderr, /concorrente bloqueada/);
  fs.rmdirSync(path.join(authHome, 'quiz-run.lock'));
  fs.writeFileSync(path.join(authHome, 'auth.json'), 'nao ler nem copiar');
  assert.throws(() => validateProfile(authHome), /cache de token proibido/);
  fs.unlinkSync(path.join(authHome, 'auth.json'));
  fs.writeFileSync(path.join(authHome, 'hooks.json'), '{}');
  assert.throws(() => validateProfile(authHome), /arquivo externo/);
  fs.unlinkSync(path.join(authHome, 'hooks.json'));
  const externalSkill = path.join(authHome, 'skills', 'externa');
  fs.mkdirSync(externalSkill);
  assert.throws(() => validateProfile(authHome), /skills externas/);
  fs.rmdirSync(externalSkill);
  const unknownSystemSkill = path.join(
    authHome,
    'skills',
    '.system',
    'desconhecida',
  );
  fs.mkdirSync(unknownSystemSkill);
  assert.throws(
    () => validateProfile(authHome),
    /skill de sistema desconhecida/,
  );
  fs.rmdirSync(unknownSystemSkill);
  const badLink = path.join(builtInSkill, 'escape');
  fs.symlinkSync(directory, badLink);
  assert.throws(() => validateProfile(authHome), /symlink nas skills/);
  fs.unlinkSync(badLink);
  assert.throws(
    () => assertNoEnabledSkills('[]'),
    /contexto de preflight invalido/,
  );
  fs.chmodSync(authHome, 0o755);
  assert.throws(() => validateProfile(authHome), /permissoes inseguras/);
  fs.chmodSync(authHome, 0o700);
  assert.throws(
    () => initializeProfile(authHome),
    /existente nao sera alterado/,
  );
  assert.throws(
    () => initializeProfile(path.join(original, 'forbidden-auth')),
    /fora do repositorio/,
  );
  assert.throws(
    () => argumentsFrom(['--test-comment', 'fixture']),
    /exige binario/,
  );
  assert.throws(() => argumentsFrom(['--unknown', 'x']), /desconhecido/);
  assert.equal(environment(authHome, directory).OPENAI_API_KEY, undefined);
  assert.equal(usageFromEvents('{"type":"turn.completed"}'), null);
  assert.throws(() => usageFromEvents('invalid'), /eventos/);
  process.stdout.write(
    'editorial-agent-runner: ok (fixtures sem chamadas reais; isolamento e recibos)\n',
  );
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
