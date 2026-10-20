const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { ROOT, digest } = require('./document-catalog.cjs');
const {
  buildContext,
  renderContext,
  pinnedConfig,
} = require('./agent-context.cjs');
const auth = require('./agent-auth.cjs');
const copies = require('./agent-isolated-copy.cjs');
const sandbox = require('./agent-writer-sandbox.cjs');
const { validateCapabilityModel } = require('./agent-capabilities.cjs');
const { makeReceipt, usageFromEvents } = require('./agent-run-receipt.cjs');

function check(value, message) {
  if (!value) throw new Error(message);
}
function writeExclusive(file, bytes) {
  const descriptor = fs.openSync(
    file,
    fs.constants.O_CREAT |
      fs.constants.O_EXCL |
      fs.constants.O_WRONLY |
      fs.constants.O_NOFOLLOW,
    0o600,
  );
  try {
    fs.writeFileSync(descriptor, bytes);
  } finally {
    fs.closeSync(descriptor);
  }
}
function argumentsFrom(argv) {
  const args = {};
  const flags = [
    '--work',
    '--output',
    '--auth-home',
    '--mode',
    '--codex-bin',
    '--test-comment',
    '--artifact',
    '--expected-sha256',
  ];
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    check(
      flags.includes(key) &&
        !args[key] &&
        argv[index + 1] &&
        !argv[index + 1].startsWith('--'),
      'argumento desconhecido, duplicado ou sem valor',
    );
    args[key] = argv[index + 1];
  }
  check(args['--work'] && args['--output'], 'use --work e --output');
  check(
    !args['--test-comment'] || args['--codex-bin'],
    'aceite ficticio exige binario de teste',
  );
  check(
    ['evaluation', 'apply'].includes(args['--mode']),
    'use modo evaluation ou apply; candidatos nao ativos',
  );
  if (args['--mode'] === 'evaluation')
    check(
      args['--auth-home'] && !args['--artifact'] && !args['--expected-sha256'],
      'avaliacao exige perfil dedicado',
    );
  else
    check(
      args['--artifact'] && args['--expected-sha256'] && !args['--auth-home'],
      'aplicacao exige artefato revisado e hash',
    );
  return args;
}
function adapterFor(work) {
  const model = JSON.parse(
    pinnedConfig(ROOT, 'config/agent-capabilities.json', work.baseCommit),
  );
  check(
    !validateCapabilityModel(model, { rootDirectory: ROOT }).length,
    'modelo de capacidades invalido',
  );
  const role = model.roles.find((item) => item.id === work.role);
  check(
    role?.status === 'candidate' &&
      role.adapter?.runner === 'isolated-writer' &&
      role.adapter.activation === 'evaluation-only',
    'papel nao autorizado para autoria isolada',
  );
  check(
    ![role.id, role.adapter.agentName].includes(work.independentVerifier),
    'autoria e verificacao exigem atores distintos',
  );
  const source = pinnedConfig(ROOT, role.adapter.configPath, work.baseCommit);
  return {
    ...role.adapter,
    instructions: JSON.parse(source).instructions,
    sha256: digest(source.toString()),
  };
}
function executionArguments(adapter, workspace, scratch, authHome, scope) {
  return [
    'exec',
    '--strict-config',
    '--ignore-user-config',
    '--ignore-rules',
    '--ephemeral',
    '--json',
    '--model',
    adapter.model,
    '--config',
    `model_reasoning_effort=${JSON.stringify(adapter.reasoningEffort)}`,
    ...auth.isolationArguments(scratch),
    ...auth.skillArguments(authHome),
    ...sandbox.permissionArguments(workspace, scope, scratch),
    '--config',
    'features.shell_tool=true',
    '--skip-git-repo-check',
    '--cd',
    workspace,
    '-',
  ];
}
function execute(bin, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      ...options,
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let bytes = 0;
    let failure;
    const kill = () => {
      if (child.pid) {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {
          // O grupo ja encerrado nao exige outra acao.
        }
      }
    };
    const timer = setTimeout(() => {
      failure = new Error('limite de cinco minutos; sem repeticao');
      kill();
    }, 300000);
    child.stdout.on('data', (value) => {
      bytes += value.length;
      if (bytes > 16 * 1024 * 1024) {
        failure = new Error('eventos excedem limite');
        kill();
      } else stdout += value.toString();
    });
    child.stderr.on('data', (value) => {
      bytes += value.length;
      if (bytes > 16 * 1024 * 1024) {
        failure = new Error('eventos excedem limite');
        kill();
      }
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      kill();
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      kill();
      if (failure || code !== 0)
        reject(
          failure || new Error('execucao falhou; sem repeticao ou fallback'),
        );
      else resolve(stdout);
    });
    child.stdin.on('error', () => {});
    child.stdin.end(options.input);
  });
}
async function run() {
  let args,
    receiptPath,
    receipt,
    owned,
    lock,
    context,
    work,
    adapter,
    checks,
    configuration,
    usage,
    artifact;
  let failureReason = null;
  let result = 'preflight-blocked';
  let invocations = 0;
  const started = Date.now();
  const runId = crypto.randomUUID();
  try {
    args = argumentsFrom(process.argv.slice(2));
    const output = path.resolve(args['--output']);
    const outputParent = fs.realpathSync(path.dirname(output));
    const repository = fs.realpathSync(ROOT);
    check(
      outputParent !== repository &&
        !outputParent.startsWith(`${repository}${path.sep}`),
      'grave artefatos fora do checkout original',
    );
    receiptPath = `${output}.receipt.json`;
    check(
      !fs.existsSync(output) && !fs.existsSync(receiptPath),
      'saida ou recibo existente; preservar execucao anterior',
    );
    work = JSON.parse(fs.readFileSync(args['--work'], 'utf8'));
    receipt = {
      runId,
      actor: work.role || 'unknown',
      requestedModel: null,
      reasoningEffort: null,
      startedAt: new Date(started).toISOString(),
      testOnly: Boolean(args['--codex-bin']),
      mode: args['--mode'],
      independentVerifier: work.independentVerifier || null,
    };
    context = buildContext(
      work,
      args['--test-comment']
        ? {
            readComment: () =>
              JSON.parse(fs.readFileSync(args['--test-comment'], 'utf8')),
          }
        : {},
    );
    adapter = adapterFor(work);
    const scope = copies.allowedPaths(work.allowedPaths);
    receipt = {
      runId,
      actor: work.role,
      requestedModel: adapter.model,
      reasoningEffort: adapter.reasoningEffort,
      startedAt: new Date(started).toISOString(),
      testOnly: Boolean(args['--codex-bin']),
      adapterSha256: adapter.sha256,
      mode: args['--mode'],
      independentVerifier: work.independentVerifier,
    };
    if (args['--mode'] === 'apply') {
      artifact = JSON.parse(fs.readFileSync(args['--artifact'], 'utf8'));
      const applied = copies.apply(
        ROOT,
        artifact,
        args['--expected-sha256'],
        work,
        context.sha256,
      );
      fs.mkdirSync(path.dirname(output), { recursive: true });
      writeExclusive(output, `${JSON.stringify(applied, null, 2)}\n`);
      result = 'applied';
    } else {
      const home = auth.validateProfile(args['--auth-home']);
      lock = path.join(home, 'quiz-run.lock');
      try {
        fs.mkdirSync(lock, { mode: 0o700 });
      } catch {
        lock = undefined;
        throw new Error('perfil em uso; execucao concorrente bloqueada');
      }
      owned = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-writer-'));
      const scratch = path.join(owned, 'scratch');
      fs.mkdirSync(scratch, { mode: 0o700 });
      const workspace = path.join(owned, 'copy');
      const prepared = copies.prepare(ROOT, work.baseCommit, scope, workspace);
      const bin = args['--codex-bin'] || 'codex';
      checks = {
        sandbox: sandbox.probe(
          bin,
          prepared.directory,
          scope,
          scratch,
          home,
          ROOT,
        ),
      };
      checks.authentication = auth.preflight(
        bin,
        home,
        scratch,
        prepared.directory,
        adapter.model,
      );
      const argv = executionArguments(
        adapter,
        prepared.directory,
        scratch,
        home,
        scope,
      );
      configuration = digest({
        argv: argv.map((value) =>
          value.replaceAll(owned, '<run>').replaceAll(home, '<auth>'),
        ),
        checks,
      });
      check(
        args['--codex-bin'],
        'candidatos bloqueados para chamadas reais ate reserva contabilizada da entrega #404',
      );
      const prompt = [
        adapter.instructions,
        renderContext(context),
        `Ficha integral:\n${JSON.stringify(work)}`,
        'Trabalhe somente nos arquivos permitidos da copia. Comandos sem rede. Nao ha Git, credenciais ou plugins.',
        'Execute somente os comandos previstos na ficha. A sandbox limita arquivos e rede, sem interpretar uma lista textual de comandos.',
        'Nao declare revisao independente, aceite humano, merge ou publicacao. Ao concluir, relate requisitos atendidos e limitacoes.',
      ].join('\n\n');
      result = 'execution-failed';
      invocations = 1;
      const events = await execute(bin, argv, {
        cwd: prepared.directory,
        env: auth.environment(home, scratch),
        input: prompt,
      });
      result = 'output-rejected';
      usage = usageFromEvents(events, ['command_execution', 'file_change']);
      auth.validateProfile(home);
      artifact = copies.collect(prepared, work, context.sha256, runId);
      fs.mkdirSync(path.dirname(output), { recursive: true });
      writeExclusive(output, `${JSON.stringify(artifact, null, 2)}\n`);
      result = 'proposed';
    }
    process.stdout.write(`writer-agent: ${result}; ${output}\n`);
  } catch (error) {
    failureReason = error.message;
    process.stderr.write(`writer-agent: ${failureReason}\n`);
    process.exitCode = 1;
  } finally {
    try {
      if (receipt) {
        const value = makeReceipt({
          ...receipt,
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - started,
          result,
          failureReason,
          modelInvocations: invocations,
          workSha256: digest(work),
          contextSha256: context?.sha256 || null,
          approvals: context?.approvals || [],
          configurationSha256: configuration || null,
          preflight: checks || null,
          artifactSha256: artifact?.sha256 || null,
          usage: usage || null,
        });
        fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
        writeExclusive(receiptPath, `${JSON.stringify(value, null, 2)}\n`);
      }
    } catch {
      process.stderr.write(
        'writer-agent: recibo indisponivel; resultado nao pode ser aceito\n',
      );
      process.exitCode = 1;
    } finally {
      if (owned) fs.rmSync(owned, { recursive: true, force: true });
      if (lock) fs.rmdirSync(lock);
    }
  }
}
if (require.main === module) run();
module.exports = { argumentsFrom, executionArguments, adapterFor, run };
