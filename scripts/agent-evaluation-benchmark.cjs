const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const e = require('./agent-evaluation.cjs');
const { digest } = require('./document-catalog.cjs');
const { pinnedConfig } = require('./agent-context.cjs');
const { sha256 } = require('./governance-guidelines.cjs');
const captures = require('./agent-event-capture.cjs');
const { workFor } = require('./agent-evaluation-cases.cjs');
const {
  validateEditorialInputDocument,
} = require('./validate-codex-agents.cjs');
const PLAN = 'config/agent-evaluation-benchmark-v2.json';
const RECORD = 'benchmark-v2-revision.json';
const OBJECTIVES = {
  historia: [
    'povo-brasileiro',
    'Reconhecer a diversidade de origens na formação histórica do povo brasileiro.',
    'reconhecer-diversidade-origens-povo-brasileiro',
    'reconhecer diversidade histórica',
  ],
  ingles: [
    'present-continuous',
    'Reconhecer ações em andamento e completar frases com a forma adequada de to be no present continuous.',
    'reconhecer-acoes-em-andamento-present-continuous',
    'reconhecer ações em andamento',
  ],
  matematica: [
    'multiplicacao',
    'Resolver multiplicações do 3º ano e comparar os produtos de pequenos números naturais.',
    'calcular-comparar-produtos-naturais',
    'resolver multiplicações do 3o ano',
  ],
};
function source(root, commit, name) {
  return execFileSync('git', ['show', `${commit}:${name}`], { cwd: root });
}
function load(root = e.ROOT, commit, keys) {
  const configuration = e.loadPlan(root, commit, keys);
  const benchmark = JSON.parse(
    commit
      ? source(root, commit, PLAN)
      : pinnedConfig(root, PLAN, configuration.commit),
  );
  e.check(
    benchmark.schemaVersion === 'agent-evaluation-benchmark-v2' &&
      benchmark.manifestPath ===
        'docs/specs/third-trimester-curriculum-manifest-2026.md' &&
      benchmark.synthetic === true &&
      benchmark.maximumAttempts === 32 &&
      benchmark.newAttempts === 28 &&
      benchmark.projectedTotal === 31 &&
      benchmark.reserveAuthorized === false &&
      benchmark.verificationDeferred === true &&
      benchmark.legacy?.length === 3 &&
      digest(benchmark.legacy.map((row) => row.id)) ===
        digest([
          'historia-valida-editorial-current',
          'schema-replacement-1',
          'schema-replacement-2',
        ]),
    'limites ou historico do benchmark v2 divergentes',
  );
  for (const [
    subject,
    [topic, objective, skill, manifestSkill],
  ] of Object.entries(OBJECTIVES)) {
    const row = benchmark.curriculum?.[subject];
    e.check(
      row &&
        row.topic === topic &&
        row.objective === objective &&
        row.skill === skill &&
        row.manifestSkill === manifestSkill &&
        row.sourceRef?.section === subject &&
        row.sourceRef.topic === topic &&
        row.sourceRef.referenceId === `synthetic-benchmark-v2-${subject}` &&
        Array.isArray(row.facts) &&
        row.facts.length >= 3 &&
        row.facts.every(
          (fact) => typeof fact === 'string' && fact.length >= 20,
        ),
      'objetivo curricular, habilidade ou fonte v2 ausente ou inconsistente',
    );
    const manifest = source(
      root,
      configuration.commit,
      benchmark.manifestPath,
    ).toString();
    e.check(
      manifest
        .split('\n')
        .some(
          (line) =>
            line.includes(`| ${topic} `) && line.includes(manifestSkill),
        ),
      'objetivo fora do manifesto curricular fixado',
    );
  }
  const oldCases = configuration.cases;
  e.check(
    benchmark.cases?.length === 8 &&
      digest(
        benchmark.cases.map((row) => [
          row.id,
          row.kind,
          row.pass,
          row.expectedCriterion,
        ]),
      ) ===
        digest(
          oldCases.map((row) => [
            row.id,
            row.kind,
            row.pass,
            row.expectedCriterion,
          ]),
        ),
    'cobertura ou criterios do corpus v2 divergentes',
  );
  for (const item of benchmark.cases) {
    const curriculum = benchmark.curriculum[item.proposal?.subject];
    e.check(
      curriculum &&
        item.proposal.topic === curriculum.topic &&
        item.proposal.skill === curriculum.skill &&
        digest(item.proposal.sourceRef) === digest(curriculum.sourceRef),
      'proposta fora do contexto curricular v2',
    );
  }
  const result = { ...configuration, benchmark, cases: benchmark.cases };
  return result;
}
function legacyFingerprint(current, ids) {
  const entries = {};
  function walk(relative) {
    const target = path.join(current.directory, relative);
    const stat = fs.lstatSync(target);
    e.check(!stat.isSymbolicLink(), 'symlink no historico');
    if (stat.isDirectory())
      for (const name of fs.readdirSync(target).sort())
        walk(`${relative}/${name}`);
    else entries[relative] = sha256(captures.readBytes(target));
  }
  for (const directory of ['attempts', 'claims', 'results', 'runs'])
    for (const id of ids)
      walk(`${directory}/${id}${directory === 'runs' ? '' : '.json'}`);
  return digest({ campaignSha256: current.campaign.sha256, entries });
}
function bindings(current, benchmark) {
  const rows = benchmark.legacy.map((expected) => {
    const ticket = current.attempts.find((row) => row.slot.id === expected.id);
    e.check(ticket, 'tentativa historica ausente');
    const result = e.verifySeal(
      e.read(path.join(current.directory, 'results', `${expected.id}.json`)),
    );
    const output = path.join(
      current.directory,
      'runs',
      expected.id,
      'result.json',
    );
    const receipt = e.verifySeal(e.read(`${output}.receipt.json`));
    e.check(
      result.ticketSha256 === ticket.sha256 &&
        result.receiptSha256 === receipt.sha256 &&
        receipt.evaluation?.ticketSha256 === ticket.sha256 &&
        !result.passed &&
        result.modelInvocations === 1 &&
        receipt.modelInvocations === 1 &&
        receipt.testOnly === current.campaign.testOnly,
      'vinculo historico divergente',
    );
    if (receipt.captureSha256)
      captures.verifyCapture(output, receipt.captureSha256);
    const row = {
      id: expected.id,
      ticketSha256: ticket.sha256,
      resultSha256: result.sha256,
      receiptSha256: receipt.sha256,
      captureSha256: receipt.captureSha256 || null,
    };
    e.check(
      digest(row) === digest(expected),
      'hash historico fora do pacote aprovado',
    );
    return row;
  });
  e.check(
    legacyFingerprint(
      current,
      rows.map((row) => row.id),
    ) === benchmark.expectedStateSha256,
    'bytes historicos ou estado esperado divergentes',
  );
  return rows;
}
function protectedSources(current, configuration, root) {
  const benchmark = configuration.benchmark;
  e.check(
    current.resumption?.kind === 'events' &&
      current.resumption.sha256 === benchmark.parentResumptionSha256 &&
      current.resumption.targetCommit === benchmark.legacySourceCommit,
    'revisao v2 exige a cadeia historica aprovada',
  );
  execFileSync(
    'git',
    [
      'merge-base',
      '--is-ancestor',
      benchmark.legacySourceCommit,
      configuration.commit,
    ],
    { cwd: root },
  );
  const allowed = new Set([
    'scripts/agent-evaluation.cjs',
    'scripts/agent-evaluation-cases.cjs',
    'scripts/run-model-evaluation.cjs',
    'scripts/agent-cli-events.cjs',
    'scripts/agent-event-capture.cjs',
    'scripts/agent-evaluation-event-resumption.cjs',
    'scripts/run-editorial-agent.cjs',
    'scripts/run-writer-agent.cjs',
    'config/document-catalog.json',
    PLAN,
    'scripts/agent-evaluation-benchmark.cjs',
    'scripts/agent-evaluation-inspection.cjs',
  ]);
  for (const [name, hash] of Object.entries(current.resumption.targetSnapshot))
    if (!allowed.has(name))
      e.check(
        configuration.snapshot[name] === hash,
        `fonte protegida mudou: ${name}`,
      );
  for (const name of Object.keys(configuration.snapshot))
    e.check(
      Object.hasOwn(current.resumption.targetSnapshot, name) ||
        allowed.has(name),
      `fonte nova nao autorizada: ${name}`,
    );
  const before = JSON.parse(
    source(root, benchmark.legacySourceCommit, 'config/document-catalog.json'),
  );
  const after = JSON.parse(
    source(root, configuration.commit, 'config/document-catalog.json'),
  );
  e.check(
    digest(before.documents.filter((row) => row.normative)) ===
      digest(after.documents.filter((row) => row.normative)),
    'contratos normativos mudaram',
  );
}
function packet(current, configuration, root = e.ROOT) {
  protectedSources(current, configuration, root);
  const legacyBindings = bindings(current, configuration.benchmark);
  const slots = e.schedule(configuration);
  for (const slot of slots) {
    const { work, document } = workFor(slot, configuration, root);
    if (document) {
      e.check(
        work.objective !== document.input.authorizedObjective,
        'tarefa do agente confundida com objetivo de aprendizagem',
      );
      const errors = validateEditorialInputDocument(
        document,
        slot.role.replaceAll('-', '_'),
      );
      e.check(errors.length === 0, `entrada v2 invalida: ${errors.join('; ')}`);
    }
  }
  return e.sealed({
    schemaVersion: 'agent-benchmark-review-package-v2',
    sourceCommit: configuration.commit,
    configurationSha256: configuration.sha256,
    benchmarkSha256: digest(configuration.benchmark),
    campaignSha256: current.campaign.sha256,
    parentResumptionSha256: current.resumption.sha256,
    stateSha256: configuration.benchmark.expectedStateSha256,
    legacyBindings,
    historicalAttempts: 3,
    newAttempts: 28,
    projectedTotal: 31,
    maximumAttempts: 32,
    reserveAuthorized: false,
    verificationDeferred: true,
    modelInvocations: 0,
    curriculum: configuration.benchmark.curriculum,
    agenda: slots.map((slot) => ({
      slot,
      ...workFor(slot, configuration, root),
      expected:
        slot.category === 'editorial'
          ? configuration.cases.find((row) => row.id === slot.caseId)
          : {
              gradingSource: 'scripts/agent-evaluation-grading.cjs',
              category: slot.category,
              repetition: slot.repetition,
            },
    })),
  });
}
function checkBenchmark(home, root = e.ROOT) {
  const current = e.openCampaign(home, root, true);
  e.check(
    !current.benchmarkRevision && current.attempts.length === 3,
    'revisao ja ativa ou historico alterado',
  );
  return packet(current, load(root), root);
}
function approvalValid(approval, pack, testOnly) {
  e.verifySeal(approval);
  e.check(
    approval.schemaVersion === 'agent-benchmark-human-approval-v2' &&
      approval.origin === 'user-session' &&
      approval.actor === 'dleomil' &&
      approval.decision === 'approved' &&
      approval.testOnly === testOnly &&
      approval.sourceCommit === pack.sourceCommit &&
      approval.packageSha256 === pack.sha256 &&
      approval.stateSha256 === pack.stateSha256 &&
      typeof approval.statement === 'string' &&
      approval.statement.trim().length >= 10 &&
      typeof approval.approvedAt === 'string' &&
      Number.isFinite(Date.parse(approval.approvedAt)),
    'aprovacao humana ausente, desatualizada ou de outro pacote',
  );
}
function revise(home, expectedState, approvalFile, root = e.ROOT) {
  const mutex = path.join(home, 'quiz-evaluation.lock');
  fs.mkdirSync(mutex, { mode: 0o700 });
  let runLock;
  try {
    const lock = path.join(home, 'quiz-run.lock');
    fs.mkdirSync(lock, { mode: 0o700 });
    runLock = lock;
    const current = e.openCampaign(home, root, true);
    e.check(
      !current.benchmarkRevision &&
        current.attempts.length === 3 &&
        expectedState === e.stateFingerprint(current),
      'estado mudou ou revisao ja registrada',
    );
    const configuration = load(root),
      pack = packet(current, configuration, root);
    const approval = e.read(approvalFile);
    approvalValid(approval, pack, current.campaign.testOnly);
    const record = e.sealed({
      schemaVersion: 'agent-evaluation-benchmark-revision-v2',
      campaignSha256: current.campaign.sha256,
      parentResumptionSha256: current.resumption.sha256,
      targetCommit: configuration.commit,
      targetPlanSha256: configuration.sha256,
      targetSnapshot: configuration.snapshot,
      benchmarkSha256: pack.benchmarkSha256,
      packageSha256: pack.sha256,
      reviewPackage: pack,
      legacyStateSha256: expectedState,
      legacyBindings: pack.legacyBindings,
      agenda: e.schedule(configuration),
      approval,
      maximumAttempts: 32,
      newAttempts: 28,
      projectedTotal: 31,
      reserveAuthorized: false,
      verificationDeferred: true,
      createdAt: new Date().toISOString(),
    });
    e.write(path.join(current.directory, RECORD), record);
    return record;
  } finally {
    if (runLock && fs.existsSync(runLock)) fs.rmdirSync(runLock);
    fs.rmdirSync(mutex);
  }
}
function activate(current, raw, root, readOnly) {
  const record = e.verifySeal(raw);
  const configuration = readOnly
    ? load(root, record.targetCommit, Object.keys(record.targetSnapshot))
    : load(root);
  e.check(
    record.schemaVersion === 'agent-evaluation-benchmark-revision-v2' &&
      record.campaignSha256 === current.campaign.sha256 &&
      record.parentResumptionSha256 === current.resumption?.sha256 &&
      record.targetCommit === configuration.commit &&
      record.targetPlanSha256 === configuration.sha256 &&
      digest(record.targetSnapshot) === digest(configuration.snapshot) &&
      record.maximumAttempts === 32 &&
      record.newAttempts === 28 &&
      record.projectedTotal === 31 &&
      record.reserveAuthorized === false &&
      record.verificationDeferred === true &&
      digest(record.agenda) === digest(e.schedule(configuration)),
    'revisao ou snapshot do benchmark divergente',
  );
  const pack = readOnly
    ? e.verifySeal(record.reviewPackage)
    : packet(current, configuration, root);
  if (readOnly) {
    protectedSources(current, configuration, root);
    e.check(
      digest(bindings(current, configuration.benchmark)) ===
        digest(pack.legacyBindings) &&
        pack.sourceCommit === configuration.commit &&
        pack.configurationSha256 === configuration.sha256 &&
        pack.benchmarkSha256 === digest(configuration.benchmark) &&
        digest(pack.agenda.map((row) => row.slot)) ===
          digest(e.schedule(configuration)),
      'pacote historico divergente',
    );
  }
  e.check(
    record.packageSha256 === pack.sha256 &&
      record.benchmarkSha256 === pack.benchmarkSha256 &&
      record.legacyStateSha256 === pack.stateSha256 &&
      digest(record.legacyBindings) === digest(pack.legacyBindings),
    'pacote ou historico da revisao divergente',
  );
  approvalValid(record.approval, pack, current.campaign.testOnly);
  const legacy = new Set(record.legacyBindings.map((row) => row.id));
  for (const ticket of current.attempts.filter(
    (row) => !legacy.has(row.slot.id),
  )) {
    e.check(
      ticket.benchmarkVersion === 'v2' &&
        ticket.benchmarkRevisionSha256 === record.sha256 &&
        ticket.benchmarkSha256 === record.benchmarkSha256 &&
        ticket.sourceCommit === record.targetCommit &&
        ticket.testOnly === current.campaign.testOnly &&
        ticket.resumptionSha256 === record.parentResumptionSha256 &&
        record.agenda.some((slot) => digest(slot) === digest(ticket.slot)),
      'tentativa fora da revisao aprovada',
    );
  }
  return { ...current, configuration, benchmarkRevision: record };
}
function beforeReserve(current, id) {
  const record = current.benchmarkRevision;
  const next = record.agenda.find(
    (slot) => !current.attempts.some((row) => row.slot.id === slot.id),
  );
  e.check(
    next?.id === id,
    'agenda v2 encerrada ou fora de ordem; nenhuma tentativa extra autorizada',
  );
  for (const ticket of current.attempts.filter(
    (row) => row.benchmarkVersion === 'v2',
  )) {
    const result = e.verifySeal(
      e.read(path.join(current.directory, 'results', `${ticket.slot.id}.json`)),
    );
    const output = path.join(
      current.directory,
      'runs',
      ticket.slot.id,
      'result.json',
    );
    const receipt = e.verifySeal(e.read(`${output}.receipt.json`));
    const { manifest } = captures.verifyCapture(output, receipt.captureSha256);
    e.check(
      result.receiptSha256 === receipt.sha256 &&
        result.ticketSha256 === ticket.sha256 &&
        receipt.evaluation?.benchmarkRevisionSha256 === record.sha256 &&
        receipt.evaluation?.benchmarkSha256 === record.benchmarkSha256 &&
        receipt.evaluation?.ticketSha256 === ticket.sha256 &&
        receipt.modelInvocations === 1 &&
        result.modelInvocations === 1 &&
        ['completed', 'proposed'].includes(receipt.result) &&
        manifest.exitCode === 0 &&
        !manifest.processError &&
        !manifest.truncated &&
        manifest.diagnosis.accepted,
      'falha tecnica v2 pendente; interromper sem repetir',
    );
  }
}
module.exports = {
  PLAN,
  load,
  packet,
  checkBenchmark,
  revise,
  activate,
  beforeReserve,
  legacyFingerprint,
};
