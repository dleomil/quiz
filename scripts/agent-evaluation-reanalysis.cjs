const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const e = require('./agent-evaluation.cjs');
const captures = require('./agent-event-capture.cjs');
const events = require('./agent-cli-events.cjs');
const transport = require('./agent-output-transport.cjs');
const grading = require('./agent-evaluation-grading.cjs');
const copies = require('./agent-isolated-copy.cjs');
const { workFor } = require('./agent-evaluation-cases.cjs');
const { validateEditorialScenario } = require('./validate-codex-agents.cjs');
const { digest } = require('./document-catalog.cjs');
const { sha256 } = require('./governance-guidelines.cjs');
const PARSER = 'scripts/agent-cli-events.cjs';
function original(current, ticket) {
  const output = path.join(
    current.directory,
    'runs',
    ticket.slot.id,
    'result.json',
  );
  const result = e.verifySeal(
    e.read(path.join(current.directory, 'results', `${ticket.slot.id}.json`)),
  );
  const receipt = e.verifySeal(e.read(`${output}.receipt.json`));
  e.check(
    result.ticketSha256 === ticket.sha256 &&
      result.receiptSha256 === receipt.sha256 &&
      receipt.evaluation?.ticketSha256 === ticket.sha256 &&
      receipt.requestedModel === ticket.slot.model &&
      receipt.reasoningEffort === ticket.slot.effort &&
      receipt.testOnly === ticket.testOnly &&
      receipt.evaluationOnly === true &&
      receipt.modelInvocations === 1 &&
      result.modelInvocations === 1,
    'vinculo da captura com a tentativa diverge',
  );
  const captured = captures.verifyCapture(output, receipt.captureSha256);
  e.check(
    digest(captured.manifest.diagnosis) === digest(receipt.eventDiagnosis),
    'diagnostico do recibo diverge da captura',
  );
  return { output, result, receipt, ...captured };
}
function parserHash(root, commit) {
  return sha256(
    execFileSync('git', ['show', `${commit}:${PARSER}`], { cwd: root }),
  );
}
function analysisFile(output) {
  return `${output}.analysis.json`;
}
function readAnalysis(current, ticket, root = e.ROOT) {
  const output = path.join(
    current.directory,
    'runs',
    ticket.slot.id,
    'result.json',
  );
  const stored = e.readOptional(analysisFile(output));
  if (!stored) return null;
  const analysis = e.verifySeal(stored);
  const { result, receipt, manifest } = original(current, ticket);
  e.check(
    analysis.schemaVersion === 'agent-evaluation-reanalysis-v1' &&
      analysis.ticketSha256 === ticket.sha256 &&
      analysis.resultSha256 === result.sha256 &&
      analysis.receiptSha256 === receipt.sha256 &&
      analysis.captureSha256 === manifest.sha256 &&
      analysis.testOnly === current.campaign.testOnly &&
      analysis.sourceCommit === current.configuration.commit &&
      analysis.parserSha256 ===
        parserHash(root, current.configuration.commit) &&
      analysis.completed === true &&
      analysis.passed === analysis.grade?.passed &&
      analysis.outputSha256 === digest(analysis.output) &&
      analysis.modelInvocations === 0,
    'analise derivada divergente',
  );
  return analysis;
}
function gradeAuthor(current, ticket, work, proposal, receipt, root, bin) {
  copies.validateArtifact(
    proposal,
    proposal.sha256,
    work,
    receipt.contextSha256,
  );
  const target = current.configuration.plan.authorFiles[ticket.slot.category];
  e.check(
    digest(work.allowedPaths) === digest([target]),
    'escopo da proposta diverge',
  );
  const source = copies.sourceFiles(root, work.baseCommit);
  const owned = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-reanalysis-'));
  try {
    const workspace = path.join(owned, 'copy'),
      scratch = path.join(owned, 'scratch');
    fs.mkdirSync(workspace);
    fs.mkdirSync(scratch);
    for (const name of ['package.json', target]) {
      e.check(source.has(name), 'fonte historica incompleta');
      fs.mkdirSync(path.dirname(path.join(workspace, name)), {
        recursive: true,
      });
      fs.writeFileSync(path.join(workspace, name), source.get(name).bytes, {
        flag: 'wx',
      });
    }
    for (const change of proposal.changes) {
      const before = source.get(change.path);
      e.check(
        change.path === target &&
          digest(change.before) ===
            digest(
              before
                ? {
                    kind: before.kind,
                    mode: before.mode,
                    sha256: before.sha256,
                  }
                : null,
            ),
        'estado anterior da proposta diverge do Git',
      );
      if (change.after)
        fs.writeFileSync(
          path.join(workspace, target),
          Buffer.from(change.after.contentBase64, 'base64'),
        );
      else fs.unlinkSync(path.join(workspace, target));
    }
    const value = copies.state(workspace, target);
    return !value
      ? { passed: false, errors: ['Artefato solicitado foi excluido.'] }
      : ticket.slot.category === 'code'
        ? grading.gradeCode(bin, workspace, scratch, target)
        : grading.gradeDocumentation(value.bytes);
  } finally {
    fs.rmSync(owned, { recursive: true, force: true });
  }
}
function analyze(current, id, root = e.ROOT, bin = 'codex') {
  e.check(
    e.head(root) === current.configuration.commit,
    'analise exige fonte ativa fixada',
  );
  const ticket = current.attempts.find((item) => item.slot.id === id);
  e.check(ticket, 'tentativa inexistente');
  const { output, result, receipt, directory, manifest } = original(
    current,
    ticket,
  );
  e.check(
    !fs.existsSync(analysisFile(output)),
    'analise ja registrada; preservar original',
  );
  e.check(
    !result.passed &&
      manifest.exitCode === 0 &&
      !manifest.processError &&
      !manifest.truncated &&
      manifest.diagnosis.completed &&
      manifest.diagnosis.issues.length > 0 &&
      manifest.diagnosis.issues.every((item) =>
        ['unknown_item', 'unknown_event', 'invalid_plan'].includes(item.code),
      ),
    'falha nao recuperavel por correcao de parser',
  );
  const allowed = ['code', 'documentation'].includes(ticket.slot.category)
    ? ['command_execution', 'file_change']
    : [];
  const diagnosis = events.analyzeEvents(
    captures.readBytes(path.join(directory, 'stdout.jsonl')).toString('utf8'),
    allowed,
  );
  events.assertEvents(diagnosis);
  const work = e.read(path.join(path.dirname(output), 'work.json'));
  e.check(
    digest(work) === ticket.workSha256 &&
      receipt.workSha256 === ticket.workSha256 &&
      work.baseCommit === ticket.sourceCommit,
    'ficha original diverge',
  );
  const historical = e.loadPlan(
    root,
    ticket.sourceCommit,
    Object.keys(current.configuration.snapshot),
  );
  const expected = workFor(ticket.slot, historical, root);
  e.check(
    digest(expected.work) === ticket.workSha256,
    'ficha diverge do caso original',
  );
  let value, grade;
  if (['editorial', 'curation'].includes(ticket.slot.category)) {
    const document = e.read(path.join(path.dirname(output), 'input.json'));
    e.check(
      digest(document) === ticket.inputSha256 &&
        digest(expected.document) === ticket.inputSha256 &&
        receipt.inputSha256 === ticket.inputSha256,
      'entrada original diverge',
    );
    const contract = JSON.parse(
      execFileSync(
        'git',
        [
          'show',
          `${work.baseCommit}:config/editorial-agent-output.schema.json`,
        ],
        { cwd: root },
      ),
    );
    const agent = ticket.slot.role.replaceAll('-', '_');
    const schema = transport.editorialSchema(
      contract,
      agent,
      document.input.subjectId,
    );
    e.check(
      receipt.transportSchemaSha256 === digest(schema),
      'schema original diverge',
    );
    const decoded = transport.decodeEditorial(
      JSON.parse(captures.readBytes(path.join(directory, 'response.json'))),
      schema,
      agent,
    );
    value = {
      scenarioId: document.scenarioId,
      inputState: document.inputState,
      input: document.input,
      output: decoded,
    };
    const errors = validateEditorialScenario(value);
    e.check(
      errors.length === 0,
      `saida original invalida: ${errors.join('; ')}`,
    );
    grade =
      ticket.slot.category === 'editorial'
        ? grading.gradeEditorial(
            document,
            value,
            historical.cases.find((row) => row.id === ticket.slot.caseId),
          )
        : grading.gradeCuration(document, value, ticket.slot);
  } else if (ticket.slot.category === 'verification') {
    value = JSON.parse(
      captures.readBytes(path.join(directory, 'response.json')),
    );
    transport.validateValue(value, transport.verificationSchema());
    grade = grading.gradeVerification(value);
  } else {
    value = JSON.parse(
      captures.readBytes(path.join(directory, 'proposal.json')),
    );
    grade = gradeAuthor(current, ticket, work, value, receipt, root, bin);
  }
  const analysis = e.sealed({
    schemaVersion: 'agent-evaluation-reanalysis-v1',
    ticketSha256: ticket.sha256,
    resultSha256: result.sha256,
    receiptSha256: receipt.sha256,
    captureSha256: manifest.sha256,
    sourceCommit: current.configuration.commit,
    parserSha256: parserHash(root, current.configuration.commit),
    parserVersion: events.VERSION,
    testOnly: current.campaign.testOnly,
    completed: true,
    passed: grade.passed === true,
    grade,
    output: value,
    outputSha256: digest(value),
    modelInvocations: 0,
    createdAt: new Date().toISOString(),
  });
  e.write(analysisFile(output), analysis);
  return analysis;
}
module.exports = { analyze, readAnalysis, original };
