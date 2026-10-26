const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const evaluation = require('./agent-evaluation.cjs');
const auth = require('./agent-auth.cjs');
const captures = require('./agent-event-capture.cjs');
const { execute } = require('./agent-process.cjs');
const { runIndependent } = require('./agent-evaluation-grading.cjs');
const {
  makeReceipt,
  analyzeEvents,
  assertEvents,
} = require('./agent-run-receipt.cjs');
const { parseAgentToml } = require('./validate-codex-agents.cjs');
const transport = require('./agent-output-transport.cjs');
const { buildExecArguments } = require('./run-editorial-agent.cjs');
const { digest, readSource, ROOT } = require('./document-catalog.cjs');
const { sha256 } = require('./governance-guidelines.cjs');

const CONFIG_PATH = 'config/agent-verifier-comparison.json';
const CASES_PATH = 'tests/fixtures/agent-verifier-comparison/cases.json';
const SUPPORT_PATHS = [
  CONFIG_PATH,
  'docs/agents/verifier-comparison-runbook.md',
  CASES_PATH,
  '.codex/agents/verifier.toml',
  'scripts/agent-verifier-comparison.cjs',
  'scripts/agent-auth.cjs',
  'scripts/agent-cli-events.cjs',
  'scripts/agent-evaluation.cjs',
  'scripts/agent-evaluation-grading.cjs',
  'scripts/agent-event-capture.cjs',
  'scripts/agent-output-transport.cjs',
  'scripts/agent-process.cjs',
  'scripts/agent-run-receipt.cjs',
  'scripts/agent-writer-sandbox.cjs',
  'scripts/document-catalog.cjs',
  'scripts/governance-guidelines.cjs',
  'scripts/run-editorial-agent.cjs',
  'scripts/validate-codex-agents.cjs',
];
const CAMPAIGN_PARENT = 'quiz-evaluations';
const SCHEMA = transport.verificationSchema();
const CODE_MODE_DISABLED_MESSAGE =
  'Code Mode is unavailable because code-mode host is disabled. Code mode will fail closed; enable `features.code_mode_host` and install `codex-code-mode-host`.';

function check(value, message) {
  if (!value) throw new Error(message);
}

function git(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function readJson(file, maximum) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(fd);
    check(
      stat.isFile() &&
        stat.nlink === 1 &&
        !(stat.mode & 0o077) &&
        stat.size <= (maximum || 8 * 1024 * 1024),
      'arquivo irregular ou excessivo',
    );
    return JSON.parse(fs.readFileSync(fd, 'utf8'));
  } finally {
    fs.closeSync(fd);
  }
}

function loadConfiguration(root) {
  root = root || ROOT;
  const configuration = JSON.parse(readSource(root, CONFIG_PATH));
  check(
    configuration.schemaVersion === 'agent-verifier-comparison-v1' &&
      configuration.id === 'agent-verifier-comparison-2026-10-oracle-v2' &&
      configuration.maximumInvocations === 12 &&
      configuration.timeoutMs === 300000 &&
      configuration.casesPath === CASES_PATH &&
      configuration.adapterPath === '.codex/agents/verifier.toml' &&
      digest(configuration.variants) ===
        digest({
          current: { model: 'gpt-5.6-terra', effort: 'medium' },
          candidate: { model: 'gpt-6.1-sol', effort: 'high' },
        }),
    'configuracao da comparacao de verificadores diverge',
  );
  const corpus = JSON.parse(readSource(root, CASES_PATH));
  check(
    corpus.schemaVersion === 'agent-verifier-cases-v1' &&
      corpus.synthetic === true &&
      Array.isArray(corpus.cases) &&
      corpus.cases.length === 6 &&
      new Set(corpus.cases.map((item) => item.id)).size === 6,
    'corpus sintetico invalido',
  );
  const controls = corpus.cases.filter((item) => item.kind === 'control');
  const defects = corpus.cases.filter((item) => item.kind !== 'control');
  check(
    controls.length === 3 && defects.length === 3,
    'distribuicao de casos invalida',
  );
  for (const item of corpus.cases) {
    check(
      /^[a-z0-9-]+$/.test(item.id) &&
        ['approved', 'adjustments_required', 'blocked'].includes(
          item.decision,
        ) &&
        Array.isArray(item.requirements) &&
        item.requirements.length >= 3 &&
        Array.isArray(item.tests) &&
        item.tests.length > 0 &&
        typeof item.source === 'string' &&
        Array.isArray(item.expectedFindings) &&
        item.tests.every(
          (test) =>
            Object.hasOwn(test, 'expected') ||
            typeof test.expectedError === 'string',
        ),
      'contrato do caso invalido',
    );
  }
  check(
    controls.every(
      (item) =>
        item.decision === 'approved' && item.expectedFindings.length === 0,
    ) &&
      defects.every(
        (item) =>
          item.decision !== 'approved' && item.expectedFindings.length > 0,
      ),
    'gabarito de controles e defeitos invalido',
  );
  check(
    configuration.sourceSpec.campaignId === 'agent-evolution-2026-10' &&
      configuration.sourceSpec.path ===
        'docs/agents/verifier-comparison-runbook.md',
    'referencia da campanha anterior divergente',
  );
  return { configuration, corpus };
}

function packagePayload(root) {
  root = root || ROOT;
  const loaded = loadConfiguration(root);
  const snapshot = {};
  for (const name of SUPPORT_PATHS)
    snapshot[name] = sha256(readSource(root, name));
  return {
    schemaVersion: 'agent-verifier-comparison-package-v1',
    campaignId: loaded.configuration.id,
    sourceCommit: git(root, ['rev-parse', 'HEAD']),
    maximumInvocations: loaded.configuration.maximumInvocations,
    timeoutMs: loaded.configuration.timeoutMs,
    variants: loaded.configuration.variants,
    caseIds: loaded.corpus.cases.map((item) => item.id),
    controls: 3,
    defects: 3,
    snapshot,
  };
}

function buildPackage(root) {
  root = root || ROOT;
  check(
    git(root, ['status', '--porcelain']) === '',
    'working tree deve estar limpo para fixar o pacote',
  );
  const payload = packagePayload(root);
  return { ...payload, sha256: digest(payload) };
}

function verifyPackage(file, root) {
  root = root || ROOT;
  const value = readJson(file);
  const { sha256: expected, ...payload } = value;
  check(expected === digest(payload), 'hash do pacote diverge');
  const current = packagePayload(root);
  check(
    value.schemaVersion === current.schemaVersion &&
      value.campaignId === current.campaignId &&
      value.sourceCommit === current.sourceCommit &&
      value.maximumInvocations === current.maximumInvocations &&
      value.timeoutMs === current.timeoutMs &&
      digest(value.variants) === digest(current.variants) &&
      digest(value.caseIds) === digest(current.caseIds) &&
      digest(value.snapshot) === digest(current.snapshot),
    'fonte alterada depois da preparacao do pacote',
  );
  return value;
}

function campaignDirectory(home, campaignId) {
  home = auth.validateProfile(home);
  check(
    typeof campaignId === 'string' &&
      /^[a-z0-9][a-z0-9-]{0,79}$/.test(campaignId),
    'ID de campanha invalido',
  );
  const parent = path.join(home, CAMPAIGN_PARENT);
  try {
    fs.mkdirSync(parent, { mode: 0o700 });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  const stat = fs.lstatSync(parent);
  check(
    stat.isDirectory() && !stat.isSymbolicLink() && !(stat.mode & 0o077),
    'diretorio privado irregular',
  );
  return path.join(parent, campaignId);
}

function ensureCampaign(home, reviewPackage, testOnly) {
  const directory = campaignDirectory(home, reviewPackage.campaignId);
  try {
    fs.mkdirSync(directory, { mode: 0o700 });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  const campaignStat = fs.lstatSync(directory);
  check(
    campaignStat.isDirectory() &&
      !campaignStat.isSymbolicLink() &&
      !(campaignStat.mode & 0o077),
    'diretorio da campanha irregular',
  );
  for (const name of ['attempts', 'runs', 'results']) {
    try {
      fs.mkdirSync(path.join(directory, name), { mode: 0o700 });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  for (const name of ['attempts', 'runs', 'results']) {
    const stat = fs.lstatSync(path.join(directory, name));
    check(
      stat.isDirectory() && !stat.isSymbolicLink() && !(stat.mode & 0o077),
      'diretorio da campanha irregular',
    );
  }
  const file = path.join(directory, 'campaign.json');
  if (!fs.existsSync(file)) {
    evaluation.write(file, {
      schemaVersion: 'agent-verifier-campaign-v1',
      campaignId: reviewPackage.campaignId,
      packageSha256: reviewPackage.sha256,
      sourceCommit: reviewPackage.sourceCommit,
      maximumInvocations: 12,
      testOnly,
      createdAt: new Date().toISOString(),
    });
  }
  const campaign = readJson(file);
  check(
    campaign.schemaVersion === 'agent-verifier-campaign-v1' &&
      campaign.packageSha256 === reviewPackage.sha256 &&
      campaign.sourceCommit === reviewPackage.sourceCommit &&
      campaign.maximumInvocations === 12 &&
      campaign.testOnly === testOnly,
    'campanha, pacote ou modo de teste diverge; preservar registros',
  );
  return { directory, campaign };
}

function approve(home, packageFile, statement, testOnly, root) {
  const reviewPackage = verifyPackage(packageFile, root);
  check(
    typeof statement === 'string' &&
      statement.trim().length >= 20 &&
      statement.includes(reviewPackage.sha256) &&
      /\b12\b/.test(statement) &&
      /\b(aprovo|autorizo)\b/i.test(statement),
    'aceite deve citar o hash exato do pacote e o limite de 12 chamadas',
  );
  const { directory } = ensureCampaign(home, reviewPackage, Boolean(testOnly));
  const value = evaluation.sealed({
    schemaVersion: 'agent-verifier-approval-v1',
    campaignId: reviewPackage.campaignId,
    packageSha256: reviewPackage.sha256,
    maximumInvocations: 12,
    origin: 'user-session',
    actor: process.env.USER || os.userInfo().username,
    statement: statement.trim(),
    testOnly: Boolean(testOnly),
    approvedAt: new Date().toISOString(),
  });
  evaluation.write(path.join(directory, 'approval.json'), value);
  return value;
}

function readApproval(directory, reviewPackage, testOnly) {
  const value = evaluation.verifySeal(
    readJson(path.join(directory, 'approval.json')),
  );
  check(
    value.schemaVersion === 'agent-verifier-approval-v1' &&
      value.campaignId === reviewPackage.campaignId &&
      value.packageSha256 === reviewPackage.sha256 &&
      value.maximumInvocations === 12 &&
      value.testOnly === testOnly &&
      value.origin === 'user-session' &&
      typeof value.statement === 'string',
    'aceite ausente ou vinculado a outro pacote/orcamento',
  );
  return value;
}

function slotId(caseId, variant) {
  return caseId + '-' + variant;
}

function caseDefinition(caseId, root) {
  const loaded = loadConfiguration(root || ROOT);
  const item = loaded.corpus.cases.find((candidate) => candidate.id === caseId);
  check(item, 'caso fora do pacote');
  return item;
}

function reserve(directory, reviewPackage, caseId, variant) {
  const attemptsDirectory = path.join(directory, 'attempts');
  const names = fs.readdirSync(attemptsDirectory);
  check(
    names.every((name) => /^[a-z0-9-]+\.json$/.test(name)),
    'arquivo estranho no contador privado',
  );
  const attempts = names.filter((name) => name.endsWith('.json'));
  check(
    attempts.length < 12,
    'teto de 12 invocacoes atingido; sem reset ou reserva adicional',
  );
  const slot = slotId(caseId, variant);
  const value = evaluation.sealed({
    schemaVersion: 'agent-verifier-ticket-v1',
    campaignId: reviewPackage.campaignId,
    packageSha256: reviewPackage.sha256,
    slot,
    caseId,
    variant,
    model: reviewPackage.variants[variant].model,
    effort: reviewPackage.variants[variant].effort,
    sequence: attempts.length + 1,
    reservedAt: new Date().toISOString(),
  });
  evaluation.write(path.join(attemptsDirectory, slot + '.json'), value);
  return value;
}

function scriptForTests() {
  return [
    'const path=require("node:path");',
    'const envelope=JSON.parse(process.argv[1]);const data=envelope.payload;',
    'const fn=require(path.resolve(data.target));',
    'const results=data.tests.map(test=>{',
    'const input=Object.hasOwn(test,"sparseLength")?new Array(test.sparseLength):JSON.parse(JSON.stringify(test.input));',
    'const before=JSON.stringify(input);',
    'try{return {id:test.id,actual:fn(input),inputUnchanged:JSON.stringify(input)===before};}',
    'catch(error){return {id:test.id,error:error&&error.name||"Error",inputUnchanged:JSON.stringify(input)===before};}',
    '});',
    'console.log(JSON.stringify({nonce:envelope.nonce,results}));',
  ].join('');
}

function collectEvidence(caseData, bin, workspace, scratch) {
  fs.writeFileSync(
    path.join(workspace, 'implementation.cjs'),
    caseData.source,
    { flag: 'wx', mode: 0o600 },
  );
  const program = scriptForTests();
  const payload = {
    target: path.join(workspace, 'implementation.cjs'),
    tests: caseData.tests.map((item) => ({
      id: item.id,
      input: item.input,
      ...(Object.hasOwn(item, 'sparseLength')
        ? { sparseLength: item.sparseLength }
        : {}),
    })),
  };
  const observed = runIndependent(bin, workspace, scratch, program, payload);
  check(
    observed.observed && observed.observed.length === caseData.tests.length,
    'evidencia real de testes nao foi coletada: ' + JSON.stringify(observed),
  );
  const results = observed.observed.map((entry, index) => {
    const test = caseData.tests[index];
    const matches = Object.hasOwn(test, 'expectedError')
      ? entry.error === test.expectedError
      : !Object.hasOwn(entry, 'error') &&
        digest(entry.actual) === digest(test.expected);
    return {
      id: test.id,
      input: Object.hasOwn(test, 'sparseLength')
        ? { sparseLength: test.sparseLength }
        : test.input,
      expected: Object.hasOwn(test, 'expectedError')
        ? { error: test.expectedError }
        : test.expected,
      actual: Object.hasOwn(entry, 'error')
        ? { error: entry.error }
        : entry.actual,
      inputUnchanged: entry.inputUnchanged,
      passed: matches && entry.inputUnchanged,
    };
  });
  return {
    commandSha256: observed.commandSha256,
    reproduction: {
      runtime: 'node',
      program,
      payload: {
        target: 'implementation.cjs',
        tests: payload.tests.map(({ id, input, sparseLength }) => ({
          id,
          ...(sparseLength === undefined ? { input } : { sparseLength }),
        })),
      },
    },
    durationMs: observed.durationMs,
    suitePassed: results.every((item) => item.passed),
    results,
    limitations: [
      'Execucao local do corpus sintetico; nao representa cobertura de todos os projetos ou conteudos publicados.',
    ],
  };
}

function workFor(caseData, reviewPackage, evidence) {
  const requirements = caseData.requirements.map(
    (item) => item.id + ': ' + item.text,
  );
  return {
    schemaVersion: 'agent-work-v1',
    id: 'verify-' + caseData.id,
    objective:
      'Verificar de forma independente a implementacao sintetica e a evidencia de testes fornecida; nao alterar arquivos.',
    baseCommit: reviewPackage.sourceCommit,
    role: 'verifier',
    subjectId: null,
    curriculumCycle: null,
    dependencies: [],
    documents: [],
    requirements,
    validExamples: [
      'Identifique somente divergencias comprovadas pelo codigo ou pelas evidencias reais.',
      'Use o procedimento e os resultados do harness incluidos no caso. Nao exija nova execucao nem trate a ausencia de ferramentas externas como defeito.',
      'Distinga resultados observados pelo harness de qualquer execucao propria; nao afirme ter executado comandos.',
    ],
    invalidExamples: [
      'Aprovar apenas porque os testes informados passaram; inventar execucao ou evidencia.',
      'Afirmar que os resultados do harness nao podem ser avaliados quando o procedimento, entradas e saidas estao incluidos.',
    ],
    allowedPaths: [],
    commands: [
      JSON.stringify({
        runtime: evidence.reproduction.runtime,
        program: evidence.reproduction.program,
        payload: evidence.reproduction.payload,
        commandSha256: evidence.commandSha256,
      }),
    ],
    evidence: evidence.results.map((item) => JSON.stringify(item)),
    acceptanceCriteria: requirements,
    independentVerifier: 'independent-script-' + caseData.id,
    stopConditions: [
      'Fonte, contrato ou resultado do harness contraditorio; ferramenta externa necessaria fora do procedimento fornecido.',
    ],
    rollback:
      'Descartar o resultado sintetico; nenhuma alteracao e aplicada ao projeto.',
  };
}

function grade(caseData, output) {
  const errors = [];
  if (!output || output.decision !== caseData.decision)
    errors.push('decisao esperada: ' + caseData.decision);
  const findings = Array.isArray(output && output.findings)
    ? output.findings
    : [];
  const expected = [...caseData.expectedFindings].sort();
  const actual = findings.map((item) => item && item.requirementId).sort();
  if (digest(actual) !== digest(expected))
    errors.push('IDs de achados divergentes ou achados extras.');
  for (const requirementId of expected) {
    const finding = findings.find(
      (item) => item && item.requirementId === requirementId,
    );
    if (
      !finding ||
      !['major', 'blocking'].includes(finding.severity) ||
      typeof finding.evidence !== 'string' ||
      finding.evidence.trim().length < 12
    ) {
      errors.push(
        'achado sem severidade ou evidencia especifica: ' + requirementId,
      );
      continue;
    }
    const groups =
      (caseData.evidenceGroups && caseData.evidenceGroups[requirementId]) || [];
    const evidence = finding.evidence
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    if (
      groups.length &&
      groups.some(
        (group) =>
          !group.some((token) =>
            evidence.includes(
              String(token)
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase(),
            ),
          ),
      )
    )
      errors.push('evidencia insuficiente: ' + requirementId);
  }
  if (
    !Array.isArray(output && output.facts) ||
    !output.facts.every((item) => typeof item === 'string')
  )
    errors.push('facts invalido.');
  if (
    !Array.isArray(output && output.limitations) ||
    !output.limitations.every((item) => typeof item === 'string')
  )
    errors.push('limitations invalido.');
  if (caseData.kind === 'control' && findings.length)
    errors.push('controle valido recebeu achados.');
  return {
    passed: errors.length === 0,
    errors,
    expectedDecision: caseData.decision,
    expectedFindings: expected,
  };
}

function recoverableCodeModeResponse(stdout, context, capture) {
  try {
    const diagnosis = analyzeEvents(stdout, [], context);
    if (
      diagnosis.completed !== true ||
      diagnosis.reasonCode !== 'process_failure' ||
      diagnosis.issues.length !== 1 ||
      diagnosis.issues[0].itemType !== 'error' ||
      diagnosis.issues[0].eventType !== 'item.completed' ||
      diagnosis.types['thread.started'] !== 1 ||
      diagnosis.types['turn.started'] !== 1 ||
      diagnosis.types['turn.completed'] !== 1 ||
      diagnosis.types['item.completed:agent_message'] !== 1
    )
      return null;
    const events = stdout
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));
    const codeModeErrors = events.filter(
      (event) =>
        event.type === 'item.completed' &&
        event.item?.type === 'error' &&
        event.item.message === CODE_MODE_DISABLED_MESSAGE,
    );
    if (codeModeErrors.length !== 1 || !capture) return null;
    const responseState = capture.manifest.files['response.json'];
    if (!responseState) return null;
    const responseBytes = captures.readBytes(
      path.join(capture.directory, 'response.json'),
    );
    if (
      sha256(responseBytes) !== responseState.sha256 ||
      responseBytes.length !== responseState.bytes
    )
      return null;
    const output = JSON.parse(responseBytes.toString('utf8'));
    transport.validateValue(output, SCHEMA);
    return { diagnosis, output };
  } catch {
    return null;
  }
}

function verifyReady(home, reviewPackage, bin) {
  const checked = [];
  const workspace = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-verifier-ready-'),
  );
  const scratch = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-verifier-ready-scratch-'),
  );
  try {
    for (const variant of ['current', 'candidate']) {
      const model = reviewPackage.variants[variant].model;
      checked.push({
        variant,
        model,
        preflight: auth.preflight(
          bin || 'codex',
          home,
          scratch,
          workspace,
          model,
        ),
      });
    }
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
    fs.rmSync(scratch, { recursive: true, force: true });
  }
  return {
    schemaVersion: 'agent-verifier-readiness-v1',
    packageSha256: reviewPackage.sha256,
    callsConsumed: 0,
    accountModelAccess: 'not-yet-observed',
    models: checked,
  };
}

async function runOne(home, packageFile, caseId, variant, bin, testOnly, root) {
  root = root || ROOT;
  bin = bin || 'codex';
  const reviewPackage = verifyPackage(packageFile, root);
  const campaign = ensureCampaign(home, reviewPackage, Boolean(testOnly));
  const approval = readApproval(
    campaign.directory,
    reviewPackage,
    Boolean(testOnly),
  );
  check(['current', 'candidate'].includes(variant), 'variante invalida');
  const caseData = caseDefinition(caseId, root);
  const slot = slotId(caseId, variant);
  const attemptFile = path.join(campaign.directory, 'attempts', slot + '.json');
  check(!fs.existsSync(attemptFile), 'slot ja reservado; sem repeticao');
  const lock = path.join(campaign.directory, 'run.lock');
  fs.mkdirSync(lock, { mode: 0o700 });
  let workspace;
  let scratch;
  const runDirectory = path.join(campaign.directory, 'runs', slot);
  const started = Date.now();
  const runId = crypto.randomUUID();
  let reservation;
  let capture;
  let captureInfo;
  let messageFile;
  let responsePath;
  let captureContext;
  let evidence;
  let checks;
  let output;
  let gradeResult;
  let usage = null;
  let workSha256 = null;
  let contextSha256 = null;
  let state = 'preflight-blocked';
  let failureReason = null;
  let modelInvocations = 0;
  try {
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-verifier-run-'));
    scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-verifier-scratch-'));
    evidence = collectEvidence(caseData, bin, workspace, scratch);
    checks = auth.preflight(
      bin,
      home,
      scratch,
      workspace,
      reviewPackage.variants[variant].model,
    );
    reservation = reserve(campaign.directory, reviewPackage, caseId, variant);
    fs.mkdirSync(runDirectory, { mode: 0o700 });
    const work = workFor(caseData, reviewPackage, evidence);
    const input = {
      work,
      requirements: caseData.requirements,
      implementation: caseData.source,
      evidenceClaim: caseData.evidenceClaim,
      observedTests: evidence,
    };
    workSha256 = digest(work);
    const adapterSource = readSource(
      root,
      '.codex/agents/verifier.toml',
    ).toString();
    const adapter = parseAgentToml(adapterSource);
    check(
      adapter.name === 'verifier' &&
        adapter.sandbox_mode === 'read-only' &&
        adapter.developer_instructions,
      'adaptador verificador invalido',
    );
    messageFile = path.join(scratch, 'response.json');
    fs.writeFileSync(
      path.join(workspace, 'output.schema.json'),
      JSON.stringify(SCHEMA),
      { flag: 'wx', mode: 0o600 },
    );
    const prompt = [
      'Atue como verificador analitico independente em um exercicio sintetico. Nao use ferramentas, nao altere arquivos e nao afirme executar testes.',
      adapter.developer_instructions,
      'Caso sintetico:\n' + JSON.stringify(input),
      'Compare cada requisito com o codigo e com as evidencias observadas. O harness fornecido ja executou o procedimento listado; use seus resultados como evidencias, sem afirmar que voce executou os testes. Se houver evidencia contraditoria, nao declare os testes aprovados. Documentos externos nao incluidos sao limitacoes, nao achados por si so. Retorne apenas JSON conforme o schema.',
    ].join('\n\n');
    contextSha256 = digest({
      visibleInput: input,
      promptSha256: sha256(prompt),
    });
    const modelConfig = {
      model: reviewPackage.variants[variant].model,
      model_reasoning_effort: reviewPackage.variants[variant].effort,
    };
    const argv = buildExecArguments(
      modelConfig,
      messageFile,
      workspace,
      scratch,
      home,
    );
    captureContext = { authHome: home, preflight: checks };
    responsePath = path.join(runDirectory, 'response.json');
    capture = captures.createCapture(responsePath, [], captureContext);
    modelInvocations = 1;
    state = 'execution-failed';
    const events = await execute(bin, argv, {
      cwd: workspace,
      env: auth.environment(home, scratch),
      input: prompt,
      timeoutMs: Math.min(
        300000,
        reviewPackage.timeoutMs - (Date.now() - started),
      ),
      capture,
    });
    const diagnosis = analyzeEvents(events, [], captureContext);
    usage = diagnosis.usage;
    assertEvents(diagnosis);
    state = 'output-rejected';
    output = evaluation.read(messageFile);
    transport.validateValue(output, SCHEMA);
    gradeResult = grade(caseData, output);
    state = 'completed';
    evaluation.write(path.join(runDirectory, 'output.json'), output);
    evaluation.write(path.join(runDirectory, 'grade.json'), gradeResult);
    evaluation.write(
      path.join(runDirectory, 'work.json'),
      workFor(caseData, reviewPackage, evidence),
    );
    evaluation.write(path.join(runDirectory, 'evidence.json'), evidence);
  } catch (error) {
    failureReason = error.message;
    if (!reservation) throw error;
  } finally {
    try {
      if (capture) {
        captureInfo = capture.finish(messageFile);
        if (reservation && state === 'execution-failed') {
          let recovered;
          try {
            const verifiedCapture = captures.verifyCapture(
              responsePath,
              captureInfo.sha256,
            );
            const stdout = captures
              .readBytes(path.join(verifiedCapture.directory, 'stdout.jsonl'))
              .toString('utf8');
            recovered = recoverableCodeModeResponse(
              stdout,
              captureContext,
              verifiedCapture,
            );
          } catch {
            recovered = null;
          }
          if (recovered) {
            output = recovered.output;
            usage = recovered.diagnosis.usage;
            gradeResult = grade(caseData, output);
            state = 'response-recovered';
            evaluation.write(path.join(runDirectory, 'output.json'), output);
            evaluation.write(
              path.join(runDirectory, 'grade.json'),
              gradeResult,
            );
            evaluation.write(
              path.join(runDirectory, 'work.json'),
              workFor(caseData, reviewPackage, evidence),
            );
            evaluation.write(
              path.join(runDirectory, 'evidence.json'),
              evidence,
            );
          }
        }
      }
      if (reservation) {
        const result = evaluation.sealed({
          schemaVersion: 'agent-verifier-result-v1',
          campaignId: reviewPackage.campaignId,
          packageSha256: reviewPackage.sha256,
          ticketSha256: reservation.sha256,
          slot,
          caseId,
          variant,
          model: reviewPackage.variants[variant].model,
          effort: reviewPackage.variants[variant].effort,
          result: state,
          gradePassed: gradeResult ? gradeResult.passed : false,
          failureReason,
          modelInvocations,
          outputSha256: output ? digest(output) : null,
          captureSha256: captureInfo ? captureInfo.sha256 : null,
          completedAt: new Date().toISOString(),
        });
        evaluation.write(
          path.join(campaign.directory, 'results', slot + '.json'),
          result,
        );
        const receipt = makeReceipt({
          runId,
          actor: 'verifier',
          requestedModel: reviewPackage.variants[variant].model,
          reasoningEffort: reviewPackage.variants[variant].effort,
          adapterSha256: sha256(
            readSource(root, '.codex/agents/verifier.toml'),
          ),
          startedAt: new Date(started).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - started,
          result: state,
          failureReason,
          modelInvocations,
          testOnly: Boolean(testOnly),
          evaluationOnly: true,
          evaluation: {
            slotId: slot,
            ticketSha256: reservation.sha256,
            approvalSha256: approval.sha256,
          },
          workSha256,
          contextSha256,
          approvals: [approval.sha256],
          preflight: checks || null,
          usage,
          artifactSha256: output ? digest(output) : null,
          captureSha256: captureInfo ? captureInfo.sha256 : null,
          eventDiagnosis: captureInfo ? captureInfo.diagnosis : null,
        });
        evaluation.write(path.join(runDirectory, 'receipt.json'), receipt);
      }
    } finally {
      try {
        if (workspace) fs.rmSync(workspace, { recursive: true, force: true });
        if (scratch) fs.rmSync(scratch, { recursive: true, force: true });
      } finally {
        fs.rmdirSync(lock);
      }
    }
  }
  return readJson(path.join(campaign.directory, 'results', slot + '.json'));
}

function report(home, packageFile, testOnly, root) {
  root = root || ROOT;
  const reviewPackage = verifyPackage(packageFile, root);
  const directory = campaignDirectory(home, reviewPackage.campaignId);
  check(
    !fs.existsSync(path.join(directory, 'run.lock')),
    'campanha em execucao; aguarde antes de gerar relatorio',
  );
  const campaign = readJson(path.join(directory, 'campaign.json'));
  check(
    campaign.packageSha256 === reviewPackage.sha256 &&
      campaign.testOnly === Boolean(testOnly),
    'relatorio de outra campanha ou modo de teste',
  );
  const attemptNames = fs.readdirSync(path.join(directory, 'attempts'));
  const resultNames = fs.readdirSync(path.join(directory, 'results'));
  check(
    attemptNames.every((name) => /^[a-z0-9-]+\.json$/.test(name)) &&
      resultNames.every((name) => /^[a-z0-9-]+\.json$/.test(name)),
    'arquivo estranho no ledger privado',
  );
  const attempts = attemptNames.filter((name) => name.endsWith('.json'));
  check(attempts.length <= 12, 'contador persistente excede o teto');
  const results = resultNames
    .filter((name) => name.endsWith('.json'))
    .map((name) =>
      evaluation.verifySeal(readJson(path.join(directory, 'results', name))),
    );
  const tickets = attempts.map((name) =>
    evaluation.verifySeal(readJson(path.join(directory, 'attempts', name))),
  );
  const expectedSlots = reviewPackage.caseIds.flatMap((caseId) =>
    ['current', 'candidate'].map((variant) => slotId(caseId, variant)),
  );
  check(
    attempts.every((name) => expectedSlots.includes(name.slice(0, -5))) &&
      tickets.every(
        (ticket) =>
          expectedSlots.includes(ticket.slot) &&
          ticket.packageSha256 === reviewPackage.sha256 &&
          ticket.model === reviewPackage.variants[ticket.variant]?.model &&
          ticket.effort === reviewPackage.variants[ticket.variant]?.effort,
      ),
    'reserva fora do pacote ou da matriz de modelos',
  );
  check(
    results.every((result) =>
      tickets.some(
        (ticket) =>
          ticket.sha256 === result.ticketSha256 &&
          ticket.slot === result.slot &&
          ticket.caseId === result.caseId &&
          ticket.variant === result.variant,
      ),
    ),
    'resultado sem reserva correspondente',
  );
  for (const result of results) {
    const runDirectory = path.join(directory, 'runs', result.slot);
    const receipt = evaluation.verifySeal(
      readJson(path.join(runDirectory, 'receipt.json')),
    );
    check(
      receipt.evaluation &&
        receipt.evaluation.ticketSha256 === result.ticketSha256 &&
        receipt.requestedModel === result.model &&
        receipt.reasoningEffort === result.effort &&
        receipt.modelInvocations === result.modelInvocations &&
        receipt.captureSha256 === result.captureSha256 &&
        receipt.artifactSha256 === result.outputSha256,
      'recibo divergente do resultado',
    );
    if (receipt.modelInvocations === 1) {
      const captureOutput = path.join(runDirectory, 'response.json');
      const capture = captures.verifyCapture(
        captureOutput,
        receipt.captureSha256,
      );
      if (result.result === 'response-recovered') {
        const stdout = captures
          .readBytes(path.join(capture.directory, 'stdout.jsonl'))
          .toString('utf8');
        const recovered = recoverableCodeModeResponse(
          stdout,
          { authHome: home, preflight: receipt.preflight },
          capture,
        );
        check(recovered, 'recuperacao nao corresponde ao evento permitido');
      }
    }
    if (['completed', 'response-recovered'].includes(result.result)) {
      const output = readJson(path.join(runDirectory, 'output.json'));
      const gradeResult = readJson(path.join(runDirectory, 'grade.json'));
      const expectedGrade = grade(caseDefinition(result.caseId, root), output);
      check(
        digest(output) === result.outputSha256 &&
          digest(gradeResult) === digest(expectedGrade) &&
          gradeResult.passed === result.gradePassed,
        'saida ou nota diverge do resultado',
      );
    }
  }
  const completed = new Set(
    results
      .filter((item) => item.result === 'completed')
      .map((item) => item.slot),
  );
  const scored = new Set(
    results
      .filter((item) =>
        ['completed', 'response-recovered'].includes(item.result),
      )
      .map((item) => item.slot),
  );
  const summaries = Object.fromEntries(
    ['current', 'candidate'].map((variant) => {
      const modelResults = results.filter(
        (result) => result.variant === variant,
      );
      let falsePositives = 0;
      let falseNegatives = 0;
      let decisionMismatches = 0;
      for (const result of modelResults) {
        if (!['completed', 'response-recovered'].includes(result.result))
          continue;
        const output = readJson(
          path.join(directory, 'runs', result.slot, 'output.json'),
        );
        const caseData = caseDefinition(result.caseId, root);
        if (output.decision !== caseData.decision) decisionMismatches++;
        if (
          caseData.kind === 'control' &&
          (output.decision !== 'approved' || output.findings.length > 0)
        )
          falsePositives++;
        if (
          caseData.kind !== 'control' &&
          (output.decision === 'approved' ||
            caseData.expectedFindings.some(
              (id) =>
                !output.findings.some(
                  (finding) => finding.requirementId === id,
                ),
            ))
        )
          falseNegatives++;
      }
      return [
        variant,
        {
          model: reviewPackage.variants[variant].model,
          invocations: tickets.filter((ticket) => ticket.variant === variant)
            .length,
          scored: modelResults.filter((result) =>
            ['completed', 'response-recovered'].includes(result.result),
          ).length,
          responseRecoveries: modelResults.filter(
            (result) => result.result === 'response-recovered',
          ).length,
          passed: modelResults.filter((result) => result.gradePassed).length,
          falsePositives,
          falseNegatives,
          decisionMismatches,
          technicalFailures: modelResults.filter(
            (result) => result.result !== 'completed',
          ).length,
        },
      ];
    }),
  );
  return {
    schemaVersion: 'agent-verifier-comparison-report-v2',
    campaignId: reviewPackage.campaignId,
    packageSha256: reviewPackage.sha256,
    sourceCommit: reviewPackage.sourceCommit,
    maximumInvocations: 12,
    callsConsumed: tickets.length,
    remainingInvocations: 12 - tickets.length,
    completed: expectedSlots.every((slot) => completed.has(slot)),
    scoringComplete: expectedSlots.every((slot) => scored.has(slot)),
    responseRecoveries: results.filter(
      (result) => result.result === 'response-recovered',
    ).length,
    activationEligible: false,
    testOnly: Boolean(testOnly),
    variants: summaries,
    results,
    limitations: [
      'Amostra sintetica pequena; nao comprova desempenho em todos os projetos ou conteudos educacionais.',
      'Identidade remota do modelo e consumo da assinatura nao sao atestados pela CLI.',
      'Nenhum resultado habilita modelo para uso regular.',
    ],
  };
}

function parseArgs(argv) {
  const command = argv[0];
  check(
    ['benchmark-check', 'ready', 'approve', 'run', 'report'].includes(command),
    'use benchmark-check, ready, approve, run ou report',
  );
  const values = {};
  const allowed = new Set([
    '--auth-home',
    '--package',
    '--output',
    '--case',
    '--variant',
    '--statement',
    '--codex-bin',
    '--test-only',
  ]);
  for (let index = 1; index < argv.length; index++) {
    const key = argv[index];
    check(
      allowed.has(key) && !Object.hasOwn(values, key),
      'argumento desconhecido ou duplicado',
    );
    if (key === '--test-only') values[key] = true;
    else {
      check(
        argv[index + 1] && !argv[index + 1].startsWith('--'),
        'argumento sem valor',
      );
      values[key] = argv[++index];
    }
  }
  check(
    Boolean(values['--test-only']) === Boolean(values['--codex-bin']),
    'test-only exige binario falso explicito',
  );
  if (command === 'benchmark-check')
    check(values['--output'], 'benchmark-check exige --output');
  else
    check(
      values['--auth-home'] && values['--package'],
      'informe --auth-home e --package',
    );
  if (command === 'approve')
    check(values['--statement'], 'approve exige --statement');
  if (command === 'run')
    check(
      values['--case'] && values['--variant'],
      'run exige --case e --variant',
    );
  if (command !== 'run')
    check(
      !values['--case'] && !values['--variant'],
      '--case e --variant somente em run',
    );
  if (command !== 'benchmark-check' && command !== 'report')
    check(!values['--output'], '--output somente em benchmark-check/report');
  return { command, values };
}

async function main(argv) {
  const parsed = parseArgs(argv || process.argv.slice(2));
  const command = parsed.command;
  const values = parsed.values;
  const testOnly = Boolean(values['--test-only']);
  const bin = values['--codex-bin'] || 'codex';
  if (command === 'benchmark-check') {
    const value = buildPackage(ROOT);
    fs.writeFileSync(
      values['--output'],
      JSON.stringify(value, null, 2) + '\n',
      { flag: 'wx', mode: 0o600 },
    );
    process.stdout.write(
      JSON.stringify({
        packageSha256: value.sha256,
        sourceCommit: value.sourceCommit,
        maximumInvocations: 12,
        output: values['--output'],
      }) + '\n',
    );
    return;
  }
  const home = auth.validateProfile(values['--auth-home']);
  const reviewPackage = verifyPackage(values['--package'], ROOT);
  if (command === 'ready') {
    process.stdout.write(
      JSON.stringify(verifyReady(home, reviewPackage, bin)) + '\n',
    );
    return;
  }
  if (command === 'approve') {
    const value = approve(
      home,
      values['--package'],
      values['--statement'],
      testOnly,
      ROOT,
    );
    process.stdout.write(
      JSON.stringify({
        approvedPackageSha256: value.packageSha256,
        maximumInvocations: 12,
        approvalSha256: value.sha256,
      }) + '\n',
    );
    return;
  }
  if (command === 'run') {
    const value = await runOne(
      home,
      values['--package'],
      values['--case'],
      values['--variant'],
      bin,
      testOnly,
      ROOT,
    );
    process.stdout.write(JSON.stringify(value) + '\n');
    if (value.result !== 'completed') process.exitCode = 1;
    return;
  }
  const value = report(home, values['--package'], testOnly, ROOT);
  if (values['--output'])
    fs.writeFileSync(
      values['--output'],
      JSON.stringify(value, null, 2) + '\n',
      { flag: 'wx', mode: 0o600 },
    );
  process.stdout.write(JSON.stringify(value) + '\n');
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write('verifier-comparison: ' + error.message + '\n');
    process.exitCode = 1;
  });
}

module.exports = {
  CODE_MODE_DISABLED_MESSAGE,
  SUPPORT_PATHS,
  approve,
  buildPackage,
  caseDefinition,
  campaignDirectory,
  collectEvidence,
  grade,
  loadConfiguration,
  main,
  packagePayload,
  parseArgs,
  report,
  runOne,
  verifyPackage,
  verifyReady,
};
