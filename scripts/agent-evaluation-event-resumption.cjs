const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const e = require('./agent-evaluation.cjs');
const { digest, readSource } = require('./document-catalog.cjs');
const { pinnedConfig } = require('./agent-context.cjs');
const { validateProfile } = require('./agent-auth.cjs');
const captures = require('./agent-event-capture.cjs');
const { analyzeEvents } = require('./agent-cli-events.cjs');
const PLAN = 'config/agent-evaluation-events-resumption.json';
function active(directory, first, campaign) {
  let current = first;
  for (const [file, kind] of [
    ['event-resumption.json', 'events'],
    ['event-parser-revision.json', 'parser'],
  ]) {
    const raw = e.readOptional(path.join(directory, file));
    if (!raw) continue;
    const record = e.verifySeal(raw);
    e.check(
      current &&
        record.previousResumptionSha256 === current.sha256 &&
        record.campaignSha256 === campaign.sha256 &&
        record.sourceCommit === campaign.sourceCommit &&
        record.maximumAttempts === 32 &&
        record.kind === kind &&
        record.amendmentPath === PLAN &&
        record.replacementSlot === 'schema-replacement-2' &&
        digest(record.retiredRepairSlots) === digest(['repair-1', 'repair-2']),
      'cadeia de retomada de eventos divergente',
    );
    e.check(
      kind !== 'parser' || current.kind === 'events',
      'revisao de parser sem retomada de eventos',
    );
    current = record;
  }
  return current;
}
function resumeEvents(home, expectedState, root = e.ROOT, kind = 'events') {
  home = validateProfile(home);
  const mutex = path.join(home, 'quiz-evaluation.lock');
  fs.mkdirSync(mutex, { mode: 0o700 });
  let runLock;
  try {
    const lock = path.join(home, 'quiz-run.lock');
    fs.mkdirSync(lock, { mode: 0o700 });
    runLock = lock;
    const current = e.openCampaign(home, root, true);
    e.check(
      !current.benchmarkRevision,
      'retomada legada desabilitada apos benchmark v2',
    );
    e.check(
      current.resumption && expectedState === e.stateFingerprint(current),
      'estado da retomada de eventos mudou',
    );
    e.check(
      kind === 'events'
        ? !current.resumption.kind && current.attempts.length === 2
        : kind === 'parser' && current.resumption.kind === 'events',
      'transicao de eventos nao autorizada ou ja registrada',
    );
    const configuration = e.loadPlan(root);
    execFileSync(
      'git',
      [
        'merge-base',
        '--is-ancestor',
        current.configuration.commit,
        configuration.commit,
      ],
      { cwd: root },
    );
    const plan = JSON.parse(pinnedConfig(root, PLAN, configuration.commit));
    e.check(
      plan.schemaVersion === 'agent-evaluation-events-plan-v1' &&
        plan.maximumAttempts === 32 &&
        plan.replacementSlot === 'schema-replacement-2' &&
        Object.keys(plan).sort().join(',') ===
          'failedReceiptSha256,failedResultSha256,failedSlot,failedTicketSha256,maximumAttempts,parentResumptionSha256,replacementSlot,schemaVersion,sourceCommit',
      'adendo de eventos invalido',
    );
    const firstPlan = JSON.parse(
      execFileSync(
        'git',
        [
          'show',
          `${current.firstResumption.targetCommit}:config/agent-evaluation-resumption.json`,
        ],
        { cwd: root },
      ),
    );
    const originalTicket = current.attempts.find(
      (item) => item.sha256 === firstPlan.failedTicketSha256,
    );
    const originalResult = e.verifySeal(
      e.read(
        path.join(current.directory, 'results', `${firstPlan.failedSlot}.json`),
      ),
    );
    const originalReceipt = e.verifySeal(
      e.read(
        path.join(
          current.directory,
          'runs',
          firstPlan.failedSlot,
          'result.json.receipt.json',
        ),
      ),
    );
    e.check(
      originalTicket &&
        originalResult.sha256 === firstPlan.failedResultSha256 &&
        originalReceipt.sha256 === firstPlan.failedReceiptSha256 &&
        originalResult.ticketSha256 === originalTicket.sha256 &&
        originalResult.receiptSha256 === originalReceipt.sha256,
      'primeira falha historica diverge',
    );
    if (kind === 'events') {
      e.check(
        plan.sourceCommit === current.configuration.commit &&
          plan.parentResumptionSha256 === current.resumption.sha256 &&
          plan.failedSlot === current.resumption.replacementSlot,
        'origem do adendo de eventos diverge',
      );
      const ticket = current.attempts.find(
        (item) => item.slot.id === plan.failedSlot,
      );
      const result = e.verifySeal(
        e.read(
          path.join(current.directory, 'results', `${plan.failedSlot}.json`),
        ),
      );
      const receipt = e.verifySeal(
        e.read(
          path.join(
            current.directory,
            'runs',
            plan.failedSlot,
            'result.json.receipt.json',
          ),
        ),
      );
      e.check(
        ticket?.sha256 === plan.failedTicketSha256 &&
          result.sha256 === plan.failedResultSha256 &&
          receipt.sha256 === plan.failedReceiptSha256 &&
          result.ticketSha256 === ticket.sha256 &&
          result.receiptSha256 === receipt.sha256 &&
          !result.hasOutput &&
          !result.passed &&
          result.modelInvocations === 1 &&
          receipt.failureReason ===
            'ferramenta acionada em revisao sem ferramentas',
        'segunda falha nao comprovada',
      );
    } else {
      let proven = false;
      for (const ticket of current.attempts) {
        const result = e.readOptional(
          path.join(current.directory, 'results', `${ticket.slot.id}.json`),
        );
        if (!result || result.passed) continue;
        e.verifySeal(result);
        const output = path.join(
          current.directory,
          'runs',
          ticket.slot.id,
          'result.json',
        );
        const receipt = e.verifySeal(e.read(`${output}.receipt.json`));
        if (!receipt.captureSha256) continue;
        const { directory, manifest } =
          require('./agent-evaluation-reanalysis.cjs').original(
            current,
            ticket,
          );
        const previous = manifest.diagnosis;
        if (
          manifest.exitCode !== 0 ||
          manifest.processError ||
          manifest.truncated ||
          !previous.completed ||
          !previous.issues.length ||
          !previous.issues.every((item) =>
            ['unknown_item', 'unknown_event', 'invalid_plan'].includes(
              item.code,
            ),
          )
        )
          continue;
        const allowed = ['code', 'documentation'].includes(ticket.slot.category)
          ? ['command_execution', 'file_change']
          : [];
        if (
          analyzeEvents(
            captures
              .readBytes(path.join(directory, 'stdout.jsonl'))
              .toString('utf8'),
            allowed,
          ).accepted
        )
          proven = true;
      }
      e.check(
        proven,
        'correcao de parser exige captura completa recuperavel, sem ferramenta proibida',
      );
    }
    const allowed = new Set(
      kind === 'events'
        ? [
            PLAN,
            'scripts/agent-evaluation.cjs',
            'scripts/agent-process.cjs',
            'scripts/agent-run-receipt.cjs',
            'scripts/run-editorial-agent.cjs',
            'scripts/run-writer-agent.cjs',
            'scripts/run-model-evaluation.cjs',
            'config/document-catalog.json',
          ]
        : ['scripts/agent-cli-events.cjs', 'config/document-catalog.json'],
    );
    for (const [name, hash] of Object.entries(current.configuration.snapshot))
      if (!allowed.has(name))
        e.check(
          configuration.snapshot[name] === hash,
          `fonte protegida mudou: ${name}`,
        );
    const added = [
      'scripts/agent-cli-events.cjs',
      'scripts/agent-event-capture.cjs',
      'scripts/agent-evaluation-event-resumption.cjs',
      'scripts/agent-evaluation-reanalysis.cjs',
      PLAN,
    ];
    for (const name of Object.keys(configuration.snapshot))
      if (!Object.hasOwn(current.configuration.snapshot, name))
        e.check(
          kind === 'events' && added.includes(name),
          `fonte nova nao autorizada: ${name}`,
        );
    const before = JSON.parse(
      execFileSync(
        'git',
        [
          'show',
          `${current.configuration.commit}:config/document-catalog.json`,
        ],
        { cwd: root },
      ),
    );
    const after = JSON.parse(readSource(root, 'config/document-catalog.json'));
    e.check(
      digest(before.documents.filter((row) => row.normative)) ===
        digest(after.documents.filter((row) => row.normative)),
      'contratos normativos mudaram',
    );
    e.check(
      digest(e.schedule(configuration)) === digest(current.campaign.schedule),
      'agenda ou modelos mudaram',
    );
    const { sha256: previousResumptionSha256, ...base } = current.resumption;
    const record = e.sealed({
      ...base,
      schemaVersion: 'agent-evaluation-events-resumption-v1',
      kind,
      previousResumptionSha256,
      parentCommit: current.configuration.commit,
      targetCommit: configuration.commit,
      targetPlanSha256: configuration.sha256,
      targetSnapshot: configuration.snapshot,
      amendmentPath: PLAN,
      amendmentSha256: digest(plan),
      stateSha256: expectedState,
      fingerprintVersion: 'sha256-bytes-v2',
      replacementSlot: plan.replacementSlot,
      replacementPredecessor: plan.failedSlot,
      retiredRepairSlots: ['repair-1', 'repair-2'],
      createdAt: new Date().toISOString(),
    });
    e.write(
      path.join(
        current.directory,
        kind === 'events'
          ? 'event-resumption.json'
          : 'event-parser-revision.json',
      ),
      record,
    );
    return record;
  } finally {
    if (runLock) fs.rmdirSync(runLock);
    fs.rmdirSync(mutex);
  }
}
module.exports = { PLAN, active, resumeEvents };
