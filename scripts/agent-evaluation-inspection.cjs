const path = require('node:path');
const { execFileSync } = require('node:child_process');
const e = require('./agent-evaluation.cjs');
const events = require('./agent-cli-events.cjs');
const captures = require('./agent-event-capture.cjs');
const { original } = require('./agent-evaluation-reanalysis.cjs');
const transport = require('./agent-output-transport.cjs');
const { digest } = require('./document-catalog.cjs');
const { validateEditorialScenario } = require('./validate-codex-agents.cjs');
const grading = require('./agent-evaluation-grading.cjs');
function inspect(current, id, home, root = e.ROOT) {
  const ticket = current.attempts.find((row) => row.slot.id === id);
  e.check(ticket, 'tentativa inexistente');
  const { output, result, receipt, directory, manifest } = original(
    current,
    ticket,
  );
  const allowed = ['code', 'documentation'].includes(ticket.slot.category)
    ? ['command_execution', 'file_change']
    : [];
  const diagnosis = events.analyzeEvents(
    captures.readBytes(path.join(directory, 'stdout.jsonl')).toString('utf8'),
    allowed,
    {
      authHome: home,
      preflight: receipt.preflight?.authentication || receipt.preflight,
    },
  );
  let validation = null;
  if (
    manifest.files['response.json'] &&
    ['editorial', 'curation'].includes(ticket.slot.category)
  ) {
    const document = e.read(path.join(path.dirname(output), 'input.json'));
    const work = e.read(path.join(path.dirname(output), 'work.json'));
    e.check(
      digest(document) === ticket.inputSha256 &&
        digest(work) === ticket.workSha256 &&
        receipt.workSha256 === ticket.workSha256,
      'entrada historica alterada',
    );
    const contract = JSON.parse(
      execFileSync(
        'git',
        [
          'show',
          `${ticket.sourceCommit}:config/editorial-agent-output.schema.json`,
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
      'schema historico divergente',
    );
    const decoded = transport.decodeEditorial(
      JSON.parse(captures.readBytes(path.join(directory, 'response.json'))),
      schema,
      agent,
    );
    const value = { ...document, output: decoded };
    const errors = validateEditorialScenario(value);
    const historical = e.loadPlan(
      root,
      ticket.sourceCommit,
      Object.keys(current.configuration.snapshot),
    );
    const expected = historical.cases.find(
      (row) => row.id === ticket.slot.caseId,
    );
    validation = {
      contractPassed: errors.length === 0,
      contractErrors: errors,
      decision: decoded.decision,
      originalGrade: expected
        ? grading.gradeEditorial(document, value, expected)
        : null,
      curriculumFindings: decoded.findings.filter(
        (row) => row.criterion === 'curriculum',
      ).length,
    };
  }
  return e.sealed({
    schemaVersion: 'agent-capture-diagnostic-v2',
    diagnosticOnly: true,
    eligibilityGranted: false,
    modelInvocations: 0,
    originalUnchanged: true,
    ticketSha256: ticket.sha256,
    resultSha256: result.sha256,
    receiptSha256: receipt.sha256,
    captureSha256: manifest.sha256,
    parserVersion: events.VERSION,
    processComplete:
      manifest.exitCode === 0 && !manifest.processError && !manifest.truncated,
    diagnosis,
    validation,
  });
}
module.exports = { inspect };
