const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { ROOT, digest, readSource } = require('./document-catalog.cjs');
const { pinnedConfig } = require('./agent-context.cjs');
const { validateProfile } = require('./agent-auth.cjs');
const { sha256 } = require('./governance-guidelines.cjs');
const captures = require('./agent-event-capture.cjs');

const PLAN_PATH = 'config/agent-evaluation-plan.json';
const CAMPAIGN_ID = 'agent-evolution-2026-10';
const RESUMPTION_PLAN = 'config/agent-evaluation-resumption.json';
const PLAN_CACHE = new Map();
const VARIANTS = {
  'editorial-current': ['gpt-5.6-sol', 'high'],
  'editorial-candidate': ['gpt-6.1-sol', 'high'],
  'author-luna': ['gpt-6-luna', 'medium'],
  'author-sol': ['gpt-6.1-sol', 'medium'],
  'verifier-current': ['gpt-5.6-terra', 'medium'],
  'verifier-candidate': ['gpt-6.1-sol', 'high'],
};
const CRITICAL_PATHS = [
  PLAN_PATH,
  'config/agent-evaluation-benchmark-v2.json',
  'scripts/agent-evaluation-benchmark.cjs',
  'scripts/agent-evaluation-inspection.cjs',
  'scripts/agent-evaluation.cjs',
  'scripts/agent-evaluation-cases.cjs',
  'scripts/agent-evaluation-grading.cjs',
  'scripts/run-model-evaluation.cjs',
  'scripts/agent-process.cjs',
  'scripts/agent-cli-events.cjs',
  'scripts/agent-event-capture.cjs',
  'scripts/agent-evaluation-event-resumption.cjs',
  'scripts/agent-evaluation-reanalysis.cjs',
  'config/agent-evaluation-events-resumption.json',
  'scripts/agent-output-transport.cjs',
  RESUMPTION_PLAN,
  'scripts/run-editorial-agent.cjs',
  'scripts/run-writer-agent.cjs',
  'scripts/agent-auth.cjs',
  'scripts/agent-context.cjs',
  'scripts/agent-run-receipt.cjs',
  'scripts/agent-capabilities.cjs',
  'scripts/agent-isolated-copy.cjs',
  'scripts/agent-writer-sandbox.cjs',
  'scripts/validate-codex-agents.cjs',
  'config/agent-capabilities.json',
  'config/agent-context-policy.json',
  'config/document-catalog.json',
  'docs/agents/model-evaluation-runbook.md',
  'config/editorial-agent-output.schema.json',
  'scripts/document-catalog.cjs',
  'scripts/governance-guidelines.cjs',
  'scripts/validate-content.cjs',
  'scripts/content-delivery.cjs',
  'config/content-delivery-policy.json',
  '.codex/agents/pedagogical-quality.toml',
  '.codex/agents/content-curator.toml',
  '.codex/agents/verifier.toml',
];
function check(value, message) {
  if (!value) throw new Error(message);
}
function head(root) {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
}
function write(file, value) {
  const descriptor = fs.openSync(
    file,
    fs.constants.O_WRONLY |
      fs.constants.O_CREAT |
      fs.constants.O_EXCL |
      fs.constants.O_NOFOLLOW,
    0o600,
  );
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`);
  } finally {
    fs.closeSync(descriptor);
  }
}
function read(file) {
  const descriptor = fs.openSync(
    file,
    fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
  );
  try {
    const stat = fs.fstatSync(descriptor);
    check(
      stat.isFile() && stat.nlink === 1 && stat.size < 16 * 1024 * 1024,
      'registro irregular',
    );
    return JSON.parse(fs.readFileSync(descriptor, 'utf8'));
  } finally {
    fs.closeSync(descriptor);
  }
}
function readOptional(file) {
  try {
    return read(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}
function sealed(value) {
  return { ...value, sha256: digest(value) };
}
function verifySeal(value) {
  const { sha256, ...payload } = value;
  check(sha256 === digest(payload), 'hash do registro de avaliacao diverge');
  return value;
}
function loadPlan(root = ROOT, sourceCommit, snapshotKeys) {
  const commit = sourceCommit || head(root);
  check(/^[a-f0-9]{40}$/.test(commit), 'commit da campanha invalido');
  const cacheKey = `${root}:${commit}:${sourceCommit ? digest(snapshotKeys || []) : 'current'}`;
  const cached = PLAN_CACHE.get(cacheKey);
  if (cached) {
    if (!sourceCommit)
      for (const [name, hash] of Object.entries(cached.snapshot))
        check(
          digest(readSource(root, name).toString()) === hash,
          `fonte mudou fora do commit: ${name}`,
        );
    return cached;
  }
  const source = (name) =>
    sourceCommit
      ? execFileSync('git', ['show', `${commit}:${name}`], {
          cwd: root,
          maxBuffer: 16 * 1024 * 1024,
        })
      : pinnedConfig(root, name, commit);
  const plan = JSON.parse(source(PLAN_PATH));
  check(
    plan.schemaVersion === 'agent-evaluation-plan-v1' &&
      plan.id === CAMPAIGN_ID &&
      plan.maximumAttempts === 32 &&
      plan.timeoutMs === 300000,
    'limites do plano aprovado divergentes',
  );
  check(
    Object.keys(plan).sort().join(',') ===
      'authorFiles,editorialCasesPath,id,maximumAttempts,schemaVersion,sourceSpec,timeoutMs,variants,verificationFile',
    'campos do plano divergentes',
  );
  check(
    digest(Object.keys(plan.variants).sort()) ===
      digest(Object.keys(VARIANTS).sort()),
    'variantes divergentes',
  );
  for (const [id, [model, effort]] of Object.entries(VARIANTS))
    check(
      digest(plan.variants[id]) === digest({ model, effort }),
      'modelo ou esforco fora da matriz aprovada',
    );
  const capabilities = JSON.parse(source('config/agent-capabilities.json'));
  for (const [roleId, variant] of [
    ['pedagogical-quality', 'editorial-current'],
    ['verifier', 'verifier-current'],
  ]) {
    const adapter = capabilities.roles.find(
      (role) => role.id === roleId,
    )?.adapter;
    check(
      adapter?.model === plan.variants[variant].model &&
        adapter.reasoningEffort === plan.variants[variant].effort,
      'baseline atual mudou; revisar comparacao antes de medir',
    );
  }
  const prefix = 'tests/fixtures/agent-evaluation/';
  for (const name of [
    plan.editorialCasesPath,
    ...Object.values(plan.authorFiles),
    plan.verificationFile,
  ])
    check(
      typeof name === 'string' &&
        name.startsWith(prefix) &&
        /^[\w./-]+$/.test(name) &&
        !name.split('/').includes('..'),
      'fonte nao sintetica ou caminho invalido',
    );
  check(
    Object.keys(plan.authorFiles).sort().join(',') === 'code,documentation',
    'categorias divergentes',
  );
  check(
    plan.sourceSpec.commit === '504c9e276d23c4ab0bdcee6537684ffe1ab7781b' &&
      plan.sourceSpec.path === 'docs/specs/agent-workflow-evolution.md',
    'origem do plano aprovado diverge',
  );
  const spec = execFileSync(
    'git',
    ['show', `${plan.sourceSpec.commit}:${plan.sourceSpec.path}`],
    { cwd: root },
  );
  check(
    Buffer.compare(spec, source(plan.sourceSpec.path)) === 0,
    'plano mestre mudou; voltar ao planejamento',
  );
  const files = snapshotKeys || [
    ...CRITICAL_PATHS,
    plan.sourceSpec.path,
    plan.editorialCasesPath,
    ...Object.values(plan.authorFiles),
    plan.verificationFile,
  ];
  check(
    files.every(
      (name) =>
        /^[\w./-]+$/.test(name) &&
        !name.startsWith('/') &&
        !name.split('/').includes('..'),
    ),
    'caminho de snapshot invalido',
  );
  const snapshot = Object.fromEntries(
    files.map((name) => [name, digest(source(name).toString())]),
  );
  const cases = JSON.parse(source(plan.editorialCasesPath));
  check(
    cases.schemaVersion === 'agent-editorial-evaluation-v1' &&
      cases.synthetic === true &&
      cases.cases?.length === 8 &&
      new Set(cases.cases.map((item) => item.id)).size === 8 &&
      cases.cases.filter((item) => item.kind === 'valid').length === 2 &&
      digest(
        cases.cases
          .filter((item) => item.kind === 'invalid')
          .map((item) => item.expectedCriterion)
          .sort(),
      ) ===
        digest(
          [
            'idioma',
            'apoio-generico',
            'resposta-revelada',
            'ambiguidade',
            'resposta-incorreta',
            'feedback-contraditorio',
          ].sort(),
        ),
    'corpus editorial fora do plano',
  );
  const configuration = {
    plan,
    cases: cases.cases,
    commit,
    snapshot,
    sha256: digest({ plan, snapshot }),
  };
  const freeze = (value) => {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
  };
  freeze(configuration);
  PLAN_CACHE.set(cacheKey, configuration);
  return configuration;
}
function schedule(configuration) {
  const { plan, cases } = configuration;
  if (configuration.benchmark) {
    const legacy = schedule({ plan, cases });
    const slots = legacy
      .filter((slot) => slot.category !== 'verification')
      .map((slot) => ({
        ...slot,
        id: `v2-${slot.id}`,
        benchmarkVersion: 'v2',
      }));
    check(slots.length === 28, 'agenda v2 invalida');
    return slots;
  }
  const slots = [];
  for (const [index, item] of cases.entries()) {
    const variants =
      index % 2
        ? ['editorial-candidate', 'editorial-current']
        : ['editorial-current', 'editorial-candidate'];
    for (const variant of variants)
      slots.push({
        id: `${item.id}-${variant}`,
        category: 'editorial',
        role: 'pedagogical-quality',
        caseId: item.id,
        variant,
        ...plan.variants[variant],
      });
  }
  for (const category of ['code', 'documentation', 'curation'])
    for (const repetition of [1, 2])
      for (const variant of repetition === 1
        ? ['author-luna', 'author-sol']
        : ['author-sol', 'author-luna'])
        slots.push({
          id: `${category}-${repetition}-${variant}`,
          category,
          role: category === 'curation' ? 'content-curator' : 'implementer',
          caseId: `${category}-${repetition}`,
          repetition,
          variant,
          ...plan.variants[variant],
        });
  for (const variant of ['verifier-current', 'verifier-candidate'])
    slots.push({
      id: `verification-${variant}`,
      category: 'verification',
      role: 'verifier',
      caseId: 'passing-tests-missing-requirement',
      variant,
      ...plan.variants[variant],
    });
  check(
    slots.length === 30 && new Set(slots.map((item) => item.id)).size === 30,
    'agenda de avaliacao invalida',
  );
  return slots;
}
function campaignDirectory(home) {
  home = validateProfile(home);
  const parent = path.join(home, 'quiz-evaluations');
  try {
    fs.mkdirSync(parent, { mode: 0o700 });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  const stat = fs.lstatSync(parent);
  check(
    stat.isDirectory() && !stat.isSymbolicLink() && !(stat.mode & 0o077),
    'diretorio de campanha inseguro',
  );
  return path.join(parent, CAMPAIGN_ID);
}
function initialize(home, root = ROOT, testOnly = false) {
  const configuration = loadPlan(root);
  const directory = campaignDirectory(home);
  fs.mkdirSync(directory, { mode: 0o700 });
  for (const name of ['attempts', 'claims', 'results', 'runs'])
    fs.mkdirSync(path.join(directory, name), { mode: 0o700 });
  const campaign = sealed({
    schemaVersion: 'agent-evaluation-campaign-v1',
    id: CAMPAIGN_ID,
    sourceCommit: configuration.commit,
    planSha256: configuration.sha256,
    maximumAttempts: 32,
    testOnly,
    snapshot: configuration.snapshot,
    createdAt: new Date().toISOString(),
    schedule: schedule(configuration),
  });
  write(path.join(directory, 'campaign.json'), campaign);
  return campaign;
}
function openCampaign(home, root = ROOT, readOnly = false) {
  const directory = campaignDirectory(home);
  check(
    fs.lstatSync(directory).isDirectory() &&
      !fs.lstatSync(directory).isSymbolicLink(),
    'campanha irregular',
  );
  const campaign = verifySeal(read(path.join(directory, 'campaign.json')));
  const initialConfiguration = loadPlan(
    root,
    campaign.sourceCommit,
    Object.keys(campaign.snapshot),
  );
  check(
    campaign.schemaVersion === 'agent-evaluation-campaign-v1' &&
      campaign.id === CAMPAIGN_ID &&
      campaign.sourceCommit === initialConfiguration.commit &&
      campaign.planSha256 === initialConfiguration.sha256 &&
      campaign.maximumAttempts === 32 &&
      typeof campaign.testOnly === 'boolean' &&
      digest(campaign.schedule) === digest(schedule(initialConfiguration)) &&
      digest(campaign.snapshot) === digest(initialConfiguration.snapshot),
    'snapshot da campanha diverge; preservar contador e voltar ao planejamento',
  );
  const storedResumption = readOptional(
    path.join(directory, 'resumption.json'),
  );
  const firstResumption = storedResumption
    ? verifySeal(storedResumption)
    : null;
  const resumption = require('./agent-evaluation-event-resumption.cjs').active(
    directory,
    firstResumption,
    campaign,
  );
  if (resumption)
    check(
      resumption.campaignSha256 === campaign.sha256 &&
        resumption.sourceCommit === campaign.sourceCommit,
      'retomada fora da campanha',
    );
  const benchmarkRecord = readOptional(
    path.join(directory, 'benchmark-v2-revision.json'),
  );
  const configuration =
    readOnly || benchmarkRecord
      ? resumption
        ? loadPlan(
            root,
            resumption.targetCommit,
            Object.keys(resumption.targetSnapshot),
          )
        : initialConfiguration
      : loadPlan(root);
  check(
    configuration.commit ===
      (resumption?.targetCommit || campaign.sourceCommit) &&
      configuration.sha256 ===
        (resumption?.targetPlanSha256 || campaign.planSha256),
    'snapshot da campanha diverge; preservar contador e voltar ao planejamento',
  );
  if (resumption)
    check(
      digest(configuration.snapshot) === digest(resumption.targetSnapshot) &&
        digest(
          JSON.parse(
            readOnly
              ? execFileSync(
                  'git',
                  [
                    'show',
                    `${resumption.targetCommit}:${resumption.amendmentPath || RESUMPTION_PLAN}`,
                  ],
                  { cwd: root },
                )
              : readSource(root, resumption.amendmentPath || RESUMPTION_PLAN),
          ),
        ) === resumption.amendmentSha256,
      'adendo de retomada diverge',
    );
  for (const name of ['attempts', 'claims', 'results', 'runs']) {
    const stat = fs.lstatSync(path.join(directory, name));
    check(
      stat.isDirectory() && !stat.isSymbolicLink(),
      'subdiretorio da campanha irregular',
    );
  }
  const attempts = fs
    .readdirSync(path.join(directory, 'attempts'))
    .map((name) => {
      check(/^[a-z0-9-]+\.json$/.test(name), 'registro estranho no contador');
      const attempt = verifySeal(read(path.join(directory, 'attempts', name)));
      check(
        name === `${attempt.slot.id}.json` &&
          attempt.campaignSha256 === campaign.sha256,
        'reserva fora da campanha',
      );
      return attempt;
    });
  check(attempts.length <= 32, 'limite de 32 tentativas excedido');
  for (const name of fs.readdirSync(path.join(directory, 'claims'))) {
    const attempt = attempts.find((item) => `${item.slot.id}.json` === name);
    check(attempt, 'contador perdeu tentativa ja reivindicada');
    const claimed = verifySeal(read(path.join(directory, 'claims', name)));
    check(
      claimed.ticketSha256 === attempt.sha256,
      'reivindicacao diverge da tentativa',
    );
  }
  for (const name of fs.readdirSync(path.join(directory, 'results')))
    check(
      attempts.some((item) => `${item.slot.id}.json` === name),
      'resultado sem reserva; contador inconsistente',
    );
  const continuationRecord = benchmarkRecord
    ? readOptional(path.join(directory, 'benchmark-v2-continuation.json'))
    : null;
  const current = {
    directory,
    campaign,
    configuration,
    initialConfiguration,
    resumption,
    firstResumption,
    attempts,
    continuationRecord,
  };
  if (benchmarkRecord) {
    const benchmark = require('./agent-evaluation-benchmark.cjs');
    const active = benchmark.activate(current, benchmarkRecord, root, readOnly);
    return continuationRecord
      ? benchmark.activateContinuation(
          active,
          continuationRecord,
          root,
          readOnly,
        )
      : active;
  }
  return current;
}
function stateSnapshot(current) {
  const entries = {};
  function walk(relative) {
    const target = path.join(current.directory, relative);
    const stat = fs.lstatSync(target);
    check(!stat.isSymbolicLink(), 'symlink nos registros da campanha');
    if (stat.isDirectory())
      for (const name of fs.readdirSync(target).sort())
        walk(`${relative}/${name}`);
    else entries[relative] = sha256(captures.readBytes(target));
  }
  for (const name of ['attempts', 'claims', 'results', 'runs']) walk(name);
  return {
    campaignSha256: current.campaign.sha256,
    entries,
    sha256: digest({ campaignSha256: current.campaign.sha256, entries }),
  };
}
function stateFingerprint(current) {
  return stateSnapshot(current).sha256;
}
function resume(home, expectedState, root = ROOT) {
  home = validateProfile(home);
  const mutex = path.join(home, 'quiz-evaluation.lock');
  fs.mkdirSync(mutex, { mode: 0o700 });
  let runLock;
  try {
    const lock = path.join(home, 'quiz-run.lock');
    fs.mkdirSync(lock, { mode: 0o700 });
    runLock = lock;
    const current = openCampaign(home, root, true);
    check(
      !current.resumption &&
        current.attempts.length === 1 &&
        expectedState === stateFingerprint(current),
      'estado mudou ou retomada ja registrada',
    );
    const configuration = loadPlan(root);
    execFileSync(
      'git',
      [
        'merge-base',
        '--is-ancestor',
        current.campaign.sourceCommit,
        configuration.commit,
      ],
      { cwd: root },
    );
    const amendment = JSON.parse(
      pinnedConfig(root, RESUMPTION_PLAN, configuration.commit),
    );
    check(
      amendment.schemaVersion === 'agent-evaluation-resumption-plan-v1' &&
        Object.keys(amendment).sort().join(',') ===
          'failedReceiptSha256,failedResultSha256,failedSlot,failedTicketSha256,maximumAttempts,reason,replacementSlot,retiredRepairSlot,schemaVersion,sourceCommit' &&
        amendment.sourceCommit === current.campaign.sourceCommit &&
        amendment.reason === 'invalid_json_schema' &&
        amendment.replacementSlot === 'schema-replacement-1' &&
        amendment.retiredRepairSlot === 'repair-2' &&
        amendment.maximumAttempts === 32,
      'adendo fora da retomada aprovada',
    );
    const ticket = current.attempts[0];
    const result = verifySeal(
      read(path.join(current.directory, 'results', `${ticket.slot.id}.json`)),
    );
    const receipt = verifySeal(
      read(
        path.join(
          current.directory,
          'runs',
          ticket.slot.id,
          'result.json.receipt.json',
        ),
      ),
    );
    check(
      ticket.slot.id === amendment.failedSlot &&
        ticket.sha256 === amendment.failedTicketSha256 &&
        result.sha256 === amendment.failedResultSha256 &&
        receipt.sha256 === amendment.failedReceiptSha256 &&
        result.ticketSha256 === ticket.sha256 &&
        result.receiptSha256 === receipt.sha256 &&
        result.modelInvocations === 1 &&
        !result.hasOutput &&
        !result.passed &&
        /invalid_json_schema/.test(result.failureReason),
      'falha tecnica nao comprovada',
    );
    check(
      read(path.join(current.directory, 'runs', ticket.slot.id, 'work.json')) &&
        ticket.workSha256 ===
          digest(
            read(
              path.join(current.directory, 'runs', ticket.slot.id, 'work.json'),
            ),
          ) &&
        ticket.inputSha256 ===
          digest(
            read(
              path.join(
                current.directory,
                'runs',
                ticket.slot.id,
                'input.json',
              ),
            ),
          ),
      'entrada original alterada',
    );
    check(
      current.campaign.testOnly === ticket.testOnly &&
        receipt.testOnly === ticket.testOnly &&
        fs.existsSync(
          path.join(current.directory, 'claims', `${ticket.slot.id}.json`),
        ),
      'perfil ou reivindicacao diverge',
    );
    const allowed = new Set([
      RESUMPTION_PLAN,
      'scripts/agent-evaluation.cjs',
      'scripts/run-editorial-agent.cjs',
      'scripts/run-model-evaluation.cjs',
      'config/document-catalog.json',
    ]);
    for (const [name, hash] of Object.entries(current.campaign.snapshot))
      if (!allowed.has(name))
        check(
          configuration.snapshot[name] === hash,
          `fonte protegida mudou: ${name}`,
        );
    for (const name of Object.keys(configuration.snapshot))
      if (!Object.hasOwn(current.campaign.snapshot, name))
        check(
          ['scripts/agent-output-transport.cjs', RESUMPTION_PLAN].includes(
            name,
          ),
          `fonte nova nao autorizada: ${name}`,
        );
    const originalCatalog = JSON.parse(
      execFileSync(
        'git',
        [
          'show',
          `${current.campaign.sourceCommit}:config/document-catalog.json`,
        ],
        { cwd: root },
      ),
    );
    const nextCatalog = JSON.parse(
      readSource(root, 'config/document-catalog.json'),
    );
    check(
      digest(originalCatalog.documents.filter((item) => item.normative)) ===
        digest(nextCatalog.documents.filter((item) => item.normative)),
      'contratos normativos mudaram',
    );
    check(
      digest(schedule(configuration)) === digest(current.campaign.schedule),
      'agenda ou modelos mudaram',
    );
    const value = sealed({
      schemaVersion: 'agent-evaluation-resumption-v1',
      campaignSha256: current.campaign.sha256,
      sourceCommit: current.campaign.sourceCommit,
      targetCommit: configuration.commit,
      targetPlanSha256: configuration.sha256,
      targetSnapshot: configuration.snapshot,
      amendmentSha256: digest(amendment),
      stateSha256: expectedState,
      fingerprintVersion: 'sha256-bytes-v2',
      failedTicketSha256: ticket.sha256,
      failedSlot: ticket.slot.id,
      replacementSlot: amendment.replacementSlot,
      retiredRepairSlot: amendment.retiredRepairSlot,
      maximumAttempts: 32,
      createdAt: new Date().toISOString(),
    });
    write(path.join(current.directory, 'resumption.json'), value);
    return value;
  } finally {
    if (runLock) fs.rmdirSync(runLock);
    fs.rmdirSync(mutex);
  }
}
function reserve(home, id, workSha256, inputSha256, root = ROOT) {
  check(/^[a-z0-9-]+$/.test(id), 'slot invalido');
  const opened = openCampaign(home, root);
  const lock = path.join(opened.directory, 'reservation.lock');
  fs.mkdirSync(lock, { mode: 0o700 });
  try {
    const current = openCampaign(home, root);
    if (current.benchmarkRevision)
      require('./agent-evaluation-benchmark.cjs').beforeReserve(current, id);
    check(
      current.benchmarkRevision ||
        !current.resumption ||
        current.attempts.some(
          (item) => item.slot.id === current.resumption.replacementSlot,
        ) ||
        id === current.resumption.replacementSlot,
      'a reposicao tecnica deve ser a primeira tentativa da retomada',
    );
    for (const attempt of current.attempts) {
      if (
        current.benchmarkRevision &&
        current.benchmarkRevision.legacyBindings.some(
          (row) => row.id === attempt.slot.id,
        )
      )
        continue;
      const result = readOptional(
        path.join(current.directory, 'results', `${attempt.slot.id}.json`),
      );
      if (
        current.resumption?.kind &&
        ![
          current.resumption.failedSlot,
          current.resumption.replacementPredecessor,
        ].includes(attempt.slot.id)
      ) {
        check(
          result,
          'tentativa anterior sem resultado; investigar antes de continuar',
        );
        const output = path.join(
          current.directory,
          'runs',
          attempt.slot.id,
          'result.json',
        );
        const receipt = verifySeal(read(`${output}.receipt.json`));
        check(
          receipt.sha256 === result.receiptSha256 &&
            receipt.evaluation?.ticketSha256 === attempt.sha256,
          'recibo anterior divergente',
        );
        check(
          receipt.captureSha256,
          'tentativa sem captura; investigar antes de continuar',
        );
        const { manifest } = captures.verifyCapture(
          output,
          receipt.captureSha256,
        );
        const recovered =
          require('./agent-evaluation-reanalysis.cjs').readAnalysis(
            current,
            attempt,
            root,
          );
        check(
          recovered ||
            (manifest.exitCode === 0 &&
              !manifest.processError &&
              !manifest.truncated &&
              manifest.diagnosis.accepted),
          'falha tecnica pendente; analisar captura antes de consumir outra tentativa',
        );
      }
      if (
        /invalid_json_schema/.test(result?.failureReason || '') &&
        attempt.sha256 !== current.resumption?.failedTicketSha256
      )
        throw new Error(
          'incompatibilidade tecnica pendente; voltar ao planejamento antes de consumir outra tentativa',
        );
    }
    check(current.attempts.length < 32, 'limite de 32 tentativas atingido');
    const slot = resolveSlot(current, id);
    check(
      !current.attempts.some((item) => item.slot.id === id),
      'tentativa ja consumida; sem repeticao',
    );
    const ticket = sealed({
      schemaVersion: 'agent-evaluation-ticket-v1',
      campaignSha256: current.campaign.sha256,
      slot,
      token: crypto.randomUUID(),
      workSha256,
      inputSha256,
      ...(current.benchmarkRevision
        ? {
            benchmarkVersion: 'v2',
            benchmarkSha256: current.benchmarkRevision.benchmarkSha256,
            benchmarkRevisionSha256: current.benchmarkRevision.sha256,
          }
        : {}),
      ...(current.benchmarkContinuation
        ? {
            benchmarkContinuationSha256: current.benchmarkContinuation.sha256,
          }
        : {}),
      ...(current.resumption
        ? { resumptionSha256: current.resumption.sha256 }
        : {}),
      reservedAt: new Date().toISOString(),
      sourceCommit: current.configuration.commit,
      testOnly: current.campaign.testOnly,
    });
    const file = path.join(current.directory, 'attempts', `${id}.json`);
    write(file, ticket);
    return { file, ticket };
  } finally {
    fs.rmdirSync(lock);
  }
}
function claim(file, home, work, inputSha256, testOnly, root = ROOT) {
  const current = openCampaign(home, root);
  const ticket = verifySeal(read(file));
  check(
    path.resolve(file) ===
      path.join(current.directory, 'attempts', `${ticket.slot.id}.json`) &&
      current.attempts.some((item) => item.sha256 === ticket.sha256) &&
      ticket.schemaVersion === 'agent-evaluation-ticket-v1' &&
      ticket.testOnly === testOnly &&
      (ticket.resumptionSha256 || null) ===
        (current.resumption?.sha256 || null) &&
      ticket.sourceCommit === work.baseCommit &&
      ticket.workSha256 === digest(work) &&
      ticket.inputSha256 === inputSha256 &&
      ticket.slot.role === work.role,
    'ticket diverge da entrada, perfil ou fonte',
  );
  check(
    (ticket.benchmarkRevisionSha256 || null) ===
      (current.benchmarkRevision?.sha256 || null) &&
      (ticket.benchmarkSha256 || null) ===
        (current.benchmarkRevision?.benchmarkSha256 || null),
    'ticket de outra revisao do benchmark',
  );
  check(
    (ticket.benchmarkContinuationSha256 || null) ===
      (current.benchmarkContinuation?.sha256 || null),
    'ticket de outra continuacao do benchmark',
  );
  const expected = current.benchmarkRevision
    ? schedule(current.configuration).find((slot) => slot.id === ticket.slot.id)
    : ticket.slot.replacementOf
      ? replacementSlot(current)
      : ticket.slot.repairOf
        ? repairSlot(current, ticket.slot.id, ticket.slot.repairOf)
        : current.campaign.schedule.find((item) => item.id === ticket.slot.id);
  check(
    expected && digest(expected) === digest(ticket.slot),
    'perfil fora da agenda aprovada',
  );
  write(
    path.join(current.directory, 'claims', `${ticket.slot.id}.json`),
    sealed({
      ticketSha256: ticket.sha256,
      claimedAt: new Date().toISOString(),
      pid: process.pid,
    }),
  );
  return { ...ticket, plan: current.configuration.plan };
}
function finish(home, ticket, result, root = ROOT) {
  const current = openCampaign(home, root);
  check(
    current.attempts.some((item) => item.sha256 === ticket.sha256),
    'resultado sem tentativa reservada',
  );
  const keys = [
    'passed',
    'grade',
    'hasOutput',
    'failureReason',
    'durationMs',
    'modelInvocations',
    'receiptSha256',
    'outputSha256',
    'usage',
    'runnerDurationMs',
  ];
  check(
    result &&
      Object.keys(result).every((key) => keys.includes(key)) &&
      typeof result.passed === 'boolean' &&
      result.grade?.passed === result.passed &&
      typeof result.hasOutput === 'boolean' &&
      (result.modelInvocations === null ||
        [0, 1].includes(result.modelInvocations)),
    'resultado de avaliacao invalido',
  );
  const value = sealed({
    schemaVersion: 'agent-evaluation-result-v1',
    ...(ticket.benchmarkVersion
      ? {
          benchmarkVersion: ticket.benchmarkVersion,
          benchmarkSha256: ticket.benchmarkSha256,
          benchmarkRevisionSha256: ticket.benchmarkRevisionSha256,
        }
      : {}),
    ticketSha256: ticket.sha256,
    slot: ticket.slot,
    testOnly: ticket.testOnly,
    completedAt: new Date().toISOString(),
    ...result,
  });
  write(
    path.join(current.directory, 'results', `${ticket.slot.id}.json`),
    value,
  );
  return value;
}
function repairSlot(current, id, parentId) {
  check(['repair-1', 'repair-2'].includes(id), 'reserva de correcao invalida');
  check(
    id !== current.resumption?.retiredRepairSlot &&
      !current.resumption?.retiredRepairSlots?.includes(id),
    'reserva usada pela reposicao tecnica',
  );
  const parent = current.attempts.find((item) => item.slot.id === parentId);
  check(
    parent &&
      parent.slot.variant === 'author-luna' &&
      !parent.slot.repairOf &&
      ['code', 'documentation', 'curation'].includes(parent.slot.category),
    'correcao exige tentativa inicial de Luna',
  );
  const result = verifySeal(
    read(path.join(current.directory, 'results', `${parentId}.json`)),
  );
  check(
    result.passed === false && result.hasOutput === true,
    'correcao exige proposta reprovada com diagnostico',
  );
  check(
    !current.attempts.some(
      (item) => item.slot.id !== id && item.slot.repairOf === parentId,
    ),
    'tentativa ja recebeu sua unica correcao',
  );
  return { ...parent.slot, id, repairOf: parentId };
}
function resolveSlot(current, id) {
  if (current.benchmarkRevision) {
    const slot = schedule(current.configuration).find((row) => row.id === id);
    check(slot, 'slot fora das 28 tentativas aprovadas do benchmark v2');
    return slot;
  }
  if (id === current.resumption?.replacementSlot)
    return replacementSlot(current);
  check(
    id !== current.resumption?.retiredRepairSlot &&
      !current.resumption?.retiredRepairSlots?.includes(id),
    'reserva usada pela reposicao tecnica',
  );
  const normal = current.campaign.schedule.find((item) => item.id === id);
  if (normal) return normal;
  check(['repair-1', 'repair-2'].includes(id), 'slot inexistente');
  const priorities = ['code', 'documentation', 'curation'];
  const candidates = current.attempts
    .filter(
      (item) => item.slot.variant === 'author-luna' && !item.slot.repairOf,
    )
    .sort(
      (a, b) =>
        priorities.indexOf(a.slot.category) -
          priorities.indexOf(b.slot.category) ||
        a.slot.id.localeCompare(b.slot.id),
    );
  for (const parent of candidates) {
    const stored = readOptional(
      path.join(current.directory, 'results', `${parent.slot.id}.json`),
    );
    if (!stored) continue;
    const result = verifySeal(stored);
    if (
      result.passed === false &&
      result.hasOutput === true &&
      !current.attempts.some((item) => item.slot.repairOf === parent.slot.id)
    )
      return repairSlot(current, id, parent.slot.id);
  }
  throw new Error(
    'nenhuma proposta de Luna elegivel a correcao; reserva preservada',
  );
}
function replacementSlot(current) {
  check(current.resumption, 'reposicao sem retomada aprovada');
  const parent = current.attempts.find(
    (item) => item.sha256 === current.resumption.failedTicketSha256,
  );
  check(
    parent && parent.slot.id === current.resumption.failedSlot,
    'origem da reposicao diverge',
  );
  return {
    ...parent.slot,
    id: current.resumption.replacementSlot,
    replacementOf: parent.slot.id,
    ...(current.resumption.replacementPredecessor
      ? { replacesAttempt: current.resumption.replacementPredecessor }
      : {}),
  };
}
module.exports = {
  ROOT,
  head,
  PLAN_PATH,
  CAMPAIGN_ID,
  loadPlan,
  schedule,
  initialize,
  openCampaign,
  reserve,
  claim,
  finish,
  resolveSlot,
  read,
  readOptional,
  write,
  sealed,
  verifySeal,
  check,
  resume,
  stateFingerprint,
  stateSnapshot,
};
