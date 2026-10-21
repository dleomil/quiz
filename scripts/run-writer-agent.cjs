const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execute } = require('./agent-process.cjs');
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
const {
  makeReceipt,
  analyzeEvents,
  assertEvents,
} = require('./agent-run-receipt.cjs');
const { createCapture } = require('./agent-event-capture.cjs');

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
    '--evaluation-ticket',
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
  check(
    !args['--evaluation-ticket'] || args['--mode'] === 'evaluation',
    'ticket permitido somente em avaliacao',
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
    '--output-last-message',
    path.join(scratch, 'message.txt'),
    '--model',
    adapter.model,
    '--config',
    `model_reasoning_effort=${JSON.stringify(adapter.reasoningEffort)}`,
    ...auth.isolationArguments(scratch),
    ...auth.skillArguments(authHome),
    ...sandbox.permissionArguments(workspace, scope, scratch),
    '--config',
    'features.shell_tool=true',
    '--config',
    'features.code_mode_host=true',
    '--skip-git-repo-check',
    '--cd',
    workspace,
    '-',
  ];
}
async function run(cliArguments = process.argv.slice(2)) {
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
  let evaluation;
  let capture, captureInfo, saveCandidate, message;
  let failureReason = null;
  let result = 'preflight-blocked';
  let invocations = 0;
  const started = Date.now();
  const runId = crypto.randomUUID();
  try {
    args = argumentsFrom(cliArguments);
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
    if (args['--evaluation-ticket']) {
      evaluation = require('./agent-evaluation.cjs').claim(
        args['--evaluation-ticket'],
        args['--auth-home'],
        work,
        null,
        Boolean(args['--codex-bin']),
      );
      check(
        ['code', 'documentation'].includes(evaluation.slot.category),
        'categoria nao pertence ao escritor',
      );
      const target = evaluation.plan.authorFiles[evaluation.slot.category];
      check(
        digest(work.allowedPaths) === digest([target]),
        'escopo diverge da tarefa sintetica',
      );
      adapter = {
        ...adapter,
        model: evaluation.slot.model,
        reasoningEffort: evaluation.slot.effort,
      };
    }
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
      evaluationOnly: Boolean(evaluation),
      evaluation: evaluation
        ? {
            slotId: evaluation.slot.id,
            ticketSha256: evaluation.sha256,
            ...(evaluation.benchmarkVersion
              ? {
                  benchmarkVersion: evaluation.benchmarkVersion,
                  benchmarkSha256: evaluation.benchmarkSha256,
                  benchmarkRevisionSha256: evaluation.benchmarkRevisionSha256,
                  ...(evaluation.benchmarkContinuationSha256
                    ? {
                        benchmarkContinuationSha256:
                          evaluation.benchmarkContinuationSha256,
                      }
                    : {}),
                }
              : {}),
            repairOf: evaluation.slot.repairOf || null,
          }
        : null,
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
      const prepared = copies.prepare(
        ROOT,
        work.baseCommit,
        scope,
        workspace,
        evaluation
          ? [
              'package.json',
              evaluation.plan.authorFiles[evaluation.slot.category],
            ]
          : undefined,
      );
      const bin = args['--codex-bin'] || 'codex';
      saveCandidate = () => {
        const candidate = copies.collect(prepared, work, context.sha256, runId);
        capture.save('proposal.json', candidate);
        return candidate;
      };
      checks = {
        writerTooling: sandbox.codeModeHostProof(bin),
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
      message = path.join(scratch, 'message.txt');
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
        args['--codex-bin'] || evaluation,
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
      if (evaluation)
        capture = createCapture(output, ['command_execution', 'file_change'], {
          authHome: home,
          preflight: checks.authentication,
        });
      invocations = 1;
      const events = await execute(bin, argv, {
        cwd: prepared.directory,
        env: auth.environment(home, scratch),
        input: prompt,
        timeoutMs: 300000 - (Date.now() - started),
        capture,
      });
      result = 'output-rejected';
      if (capture) {
        artifact = saveCandidate();
        saveCandidate = null;
      }
      const eventDiagnosis = analyzeEvents(
        events,
        ['command_execution', 'file_change'],
        { authHome: home, preflight: checks.authentication },
      );
      usage = eventDiagnosis.usage;
      assertEvents(eventDiagnosis);
      auth.validateProfile(home);
      artifact ||= copies.collect(prepared, work, context.sha256, runId);
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
      if (capture) {
        if (saveCandidate) {
          try {
            saveCandidate();
          } catch {
            /* Propostas fora do escopo nao podem ser recuperadas. */
          }
        }
        try {
          captureInfo = capture.finish(message);
          usage ||= captureInfo.diagnosis.usage;
        } catch (error) {
          result = 'output-rejected';
          failureReason = 'falha ao preservar captura';
          process.stderr.write(`writer-agent: ${error.message}\n`);
          process.exitCode = 1;
        }
      }
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
          artifactSha256:
            result === 'proposed' ? artifact?.sha256 || null : null,
          usage: usage || null,
          captureSha256: captureInfo?.sha256 || null,
          eventDiagnosis: captureInfo?.diagnosis || null,
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
module.exports = {
  argumentsFrom,
  executionArguments,
  adapterFor,
  execute,
  run,
};
