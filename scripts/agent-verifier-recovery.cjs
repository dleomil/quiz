const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const auth = require('./agent-auth.cjs');
const captures = require('./agent-event-capture.cjs');
const comparison = require('./agent-verifier-comparison.cjs');
const evaluation = require('./agent-evaluation.cjs');
const transport = require('./agent-output-transport.cjs');
const { digest, ROOT } = require('./document-catalog.cjs');
const { sha256 } = require('./governance-guidelines.cjs');

const CAMPAIGN_PARENT = 'quiz-evaluations';
const MAX_FILE_SIZE = 16 * 1024 * 1024;

function check(value, message) {
  if (!value) throw new Error(message);
}

function safeRead(file, maximum = MAX_FILE_SIZE) {
  const descriptor = fs.openSync(
    file,
    fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
  );
  try {
    const stat = fs.fstatSync(descriptor);
    check(
      stat.isFile() &&
        stat.nlink === 1 &&
        !(stat.mode & 0o077) &&
        stat.size <= maximum,
      'arquivo privado irregular',
    );
    return fs.readFileSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

function safeJson(file) {
  return JSON.parse(safeRead(file).toString('utf8'));
}

function safeDirectory(directory) {
  const stat = fs.lstatSync(directory);
  check(
    stat.isDirectory() && !stat.isSymbolicLink() && !(stat.mode & 0o077),
    'diretorio privado irregular',
  );
}

function gitSource(commit, name, root) {
  check(
    /^[a-zA-Z0-9._/-]+$/.test(name) &&
      !name.startsWith('/') &&
      !name.split('/').includes('..'),
    'caminho de snapshot invalido',
  );
  return execFileSync('git', ['show', `${commit}:${name}`], {
    cwd: root,
    maxBuffer: MAX_FILE_SIZE,
  });
}

function verifyPackage(value, root = ROOT, readCommitted = gitSource) {
  check(
    value && typeof value === 'object' && !Array.isArray(value),
    'pacote invalido',
  );
  const { sha256: packageHash, ...payload } = value;
  check(packageHash === digest(payload), 'hash do pacote diverge');
  const loaded = comparison.loadConfiguration(root);
  check(
    value.schemaVersion === 'agent-verifier-comparison-package-v1' &&
      value.campaignId === loaded.configuration.id &&
      value.maximumInvocations === 12 &&
      value.timeoutMs === loaded.configuration.timeoutMs &&
      digest(value.variants) === digest(loaded.configuration.variants) &&
      digest(value.caseIds) ===
        digest(loaded.corpus.cases.map((item) => item.id)) &&
      /^[a-f0-9]{40}$/.test(value.sourceCommit),
    'identidade, limites ou matriz do pacote divergem',
  );
  const resolvedCommit = execFileSync(
    'git',
    ['rev-parse', '--verify', `${value.sourceCommit}^{commit}`],
    { cwd: root, encoding: 'utf8' },
  ).trim();
  check(resolvedCommit === value.sourceCommit, 'commit de origem invalido');
  const paths = comparison.SUPPORT_PATHS;
  check(
    value.snapshot &&
      Object.keys(value.snapshot).sort().join('\n') ===
        [...paths].sort().join('\n'),
    'lista de arquivos do snapshot diverge',
  );
  for (const name of paths) {
    const source = readCommitted(value.sourceCommit, name, root);
    check(
      sha256(source) === value.snapshot[name],
      `snapshot do pacote diverge: ${name}`,
    );
  }
  return value;
}

function expectedSlots(reviewPackage) {
  return reviewPackage.caseIds.flatMap((caseId) =>
    ['current', 'candidate'].map((variant) => `${caseId}-${variant}`),
  );
}

function readSealed(file) {
  return evaluation.verifySeal(safeJson(file));
}

function validateCampaign(home, reviewPackage) {
  const parent = path.join(home, CAMPAIGN_PARENT);
  safeDirectory(parent);
  const directory = path.join(parent, reviewPackage.campaignId);
  safeDirectory(directory);
  check(
    !fs.existsSync(path.join(directory, 'run.lock')),
    'campanha em execucao; aguarde antes da recuperacao',
  );
  for (const name of ['attempts', 'runs', 'results'])
    safeDirectory(path.join(directory, name));
  const campaign = safeJson(path.join(directory, 'campaign.json'));
  check(
    campaign.schemaVersion === 'agent-verifier-campaign-v1' &&
      campaign.campaignId === reviewPackage.campaignId &&
      campaign.packageSha256 === reviewPackage.sha256 &&
      campaign.sourceCommit === reviewPackage.sourceCommit &&
      campaign.maximumInvocations === 12 &&
      campaign.testOnly === false,
    'campanha diverge do pacote aprovado',
  );
  return directory;
}

function recover(home, packageFile, root = ROOT, readCommitted = gitSource) {
  home = auth.validateProfile(home);
  const packageValue = safeJson(packageFile);
  const reviewPackage = verifyPackage(packageValue, root, readCommitted);
  const directory = validateCampaign(home, reviewPackage);
  const expected = expectedSlots(reviewPackage);
  const attemptNames = fs.readdirSync(path.join(directory, 'attempts')).sort();
  const resultNames = fs.readdirSync(path.join(directory, 'results')).sort();
  check(
    attemptNames.join('\n') ===
      expected
        .map((slot) => `${slot}.json`)
        .sort()
        .join('\n') &&
      resultNames.join('\n') ===
        expected
          .map((slot) => `${slot}.json`)
          .sort()
          .join('\n'),
    'campanha nao possui exatamente os 12 slots unicos',
  );

  const results = [];
  const callsByVariant = { current: 0, candidate: 0 };
  for (const slot of expected) {
    const ticket = readSealed(path.join(directory, 'attempts', `${slot}.json`));
    const result = readSealed(path.join(directory, 'results', `${slot}.json`));
    const variant = slot.endsWith('-current') ? 'current' : 'candidate';
    const caseId = slot.slice(0, -(variant.length + 1));
    const model = reviewPackage.variants[variant];
    check(
      ticket.slot === slot &&
        ticket.caseId === caseId &&
        ticket.variant === variant &&
        ticket.packageSha256 === reviewPackage.sha256 &&
        ticket.model === model.model &&
        ticket.effort === model.effort &&
        result.slot === slot &&
        result.caseId === caseId &&
        result.variant === variant &&
        result.model === model.model &&
        result.effort === model.effort &&
        result.ticketSha256 === ticket.sha256 &&
        result.packageSha256 === reviewPackage.sha256 &&
        result.modelInvocations === 1,
      'reserva ou resultado diverge do pacote',
    );

    const runDirectory = path.join(directory, 'runs', slot);
    safeDirectory(runDirectory);
    const receipt = readSealed(path.join(runDirectory, 'receipt.json'));
    check(
      receipt.evaluation?.slotId === slot &&
        receipt.evaluation.ticketSha256 === ticket.sha256 &&
        receipt.requestedModel === model.model &&
        receipt.reasoningEffort === model.effort &&
        receipt.modelInvocations === 1 &&
        receipt.captureSha256 === result.captureSha256 &&
        receipt.result === result.result,
      'recibo diverge do resultado original',
    );
    const responsePath = path.join(runDirectory, 'response.json');
    const capture = captures.verifyCapture(responsePath, result.captureSha256);
    const responseState = capture.manifest.files['response.json'];
    check(responseState, 'captura original sem resposta final');
    const responseBytes = captures.readBytes(
      path.join(capture.directory, 'response.json'),
    );
    check(
      sha256(responseBytes) === responseState.sha256 &&
        responseBytes.length === responseState.bytes,
      'resposta capturada diverge do manifesto',
    );
    const output = JSON.parse(responseBytes.toString('utf8'));
    transport.validateValue(output, transport.verificationSchema());
    const grade = comparison.grade(
      comparison.caseDefinition(caseId, root),
      output,
    );
    const caseData = comparison.caseDefinition(caseId, root);
    const falsePositive =
      caseData.kind === 'control' &&
      (output.decision !== 'approved' || output.findings.length > 0);
    const falseNegative =
      caseData.kind !== 'control' &&
      (output.decision === 'approved' ||
        caseData.expectedFindings.some(
          (id) =>
            !output.findings.some((finding) => finding.requirementId === id),
        ));
    const decisionMismatch = output.decision !== caseData.decision;
    callsByVariant[variant] += receipt.modelInvocations;
    results.push({
      slot,
      caseId,
      variant,
      model: model.model,
      originalExecutionResult: result.result,
      originalFailureCode: receipt.eventDiagnosis?.reasonCode || null,
      responseSha256: sha256(responseBytes),
      decision: output.decision,
      findingIds: output.findings.map((finding) => finding.requirementId),
      gradePassed: grade.passed,
      gradeErrors: grade.errors,
      falsePositive,
      falseNegative,
      decisionMismatch,
      usage: receipt.usage || null,
      durationMs: receipt.durationMs,
    });
  }

  check(
    callsByVariant.current === 6 && callsByVariant.candidate === 6,
    'contagem de chamadas nao corresponde ao pacote',
  );
  const variants = Object.fromEntries(
    ['current', 'candidate'].map((variant) => {
      const rows = results.filter((item) => item.variant === variant);
      return [
        variant,
        {
          model: reviewPackage.variants[variant].model,
          invocations: callsByVariant[variant],
          recoveredResponses: rows.length,
          passed: rows.filter((item) => item.gradePassed).length,
          falsePositives: rows.filter((item) => item.falsePositive).length,
          falseNegatives: rows.filter((item) => item.falseNegative).length,
          decisionMismatches: rows.filter((item) => item.decisionMismatch)
            .length,
          inputTokens: rows.reduce(
            (total, item) => total + (item.usage?.input_tokens || 0),
            0,
          ),
          cachedInputTokens: rows.reduce(
            (total, item) => total + (item.usage?.cached_input_tokens || 0),
            0,
          ),
          outputTokens: rows.reduce(
            (total, item) => total + (item.usage?.output_tokens || 0),
            0,
          ),
          technicalFailures: rows.filter(
            (item) => item.originalExecutionResult !== 'completed',
          ).length,
        },
      ];
    }),
  );
  const report = {
    schemaVersion: 'agent-verifier-recovered-report-v2',
    campaignId: reviewPackage.campaignId,
    packageSha256: reviewPackage.sha256,
    sourceCommit: reviewPackage.sourceCommit,
    maximumInvocations: 12,
    callsConsumed: callsByVariant.current + callsByVariant.candidate,
    additionalModelInvocations: 0,
    originalReportCompleted: results.every(
      (item) => item.originalExecutionResult === 'completed',
    ),
    recoveredResponsesValidated: results.length,
    scoringComplete:
      results.length === expected.length &&
      results.every((item) => Array.isArray(item.gradeErrors)),
    activationEligible: false,
    variants,
    results,
    limitations: [
      'As respostas foram recuperadas das capturas existentes; as falhas originais da CLI permanecem nos recibos.',
      'Amostra sintetica pequena; nao comprova desempenho em todos os projetos ou conteudos educacionais.',
      'Nenhum resultado habilita modelo para uso regular.',
    ],
  };
  return report;
}

function writeReport(file, report, root = ROOT, home) {
  check(path.isAbsolute(file), 'saida deve usar caminho absoluto');
  const parent = fs.realpathSync(path.dirname(file));
  const target = path.join(parent, path.basename(file));
  const repository = fs.realpathSync(root);
  check(
    path.isAbsolute(file) &&
      path.resolve(file) === file &&
      target !== repository &&
      !target.startsWith(repository + path.sep) &&
      target !== home &&
      !target.startsWith(home + path.sep),
    'relatorio deve ficar fora do checkout e do perfil privado',
  );
  evaluation.write(target, report);
}

function parseArgs(argv) {
  const values = {};
  const allowed = new Set(['--auth-home', '--package', '--output']);
  for (let index = 0; index < argv.length; index++) {
    const key = argv[index];
    check(allowed.has(key) && argv[index + 1], 'argumentos invalidos');
    check(!Object.hasOwn(values, key), 'argumento duplicado');
    values[key] = argv[++index];
  }
  check(
    values['--auth-home'] && values['--package'] && values['--output'],
    'informe --auth-home, --package e --output',
  );
  return values;
}

function main(argv = process.argv.slice(2)) {
  const values = parseArgs(argv);
  const home = auth.validateProfile(values['--auth-home']);
  const report = recover(home, values['--package']);
  writeReport(values['--output'], report, ROOT, home);
  process.stdout.write(
    JSON.stringify({
      packageSha256: report.packageSha256,
      callsConsumed: report.callsConsumed,
      additionalModelInvocations: 0,
      recoveredResponsesValidated: report.recoveredResponsesValidated,
      output: values['--output'],
    }) + '\n',
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`verifier-recovery: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { main, recover, verifyPackage, writeReport };
