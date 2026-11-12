const { validateEditorialScenario } = require('./validate-codex-agents.cjs');
const fs = require('node:fs');
const path = require('node:path');

function readCurationEvidence(report, root = path.resolve(__dirname, '..')) {
  const { digest } = require('./content-delivery.cjs');
  const { sha256, ...payload } = report || {};
  if (!report || sha256 !== digest(payload))
    throw new Error('hash de evidencia de curadoria invalido');
  if (report.schemaVersion === 'direct-curation-report-v1') {
    const response = JSON.parse(report.originalResponse);
    const output = response.output || response;
    const scenario = {
      scenarioId: report.runId,
      inputState: 'complete',
      input: report.input,
      output,
    };
    if (
      report.agent !== 'content_curator' ||
      report.testOnly !== false ||
      !report.agentInstanceId ||
      !report.runId ||
      !Number.isFinite(Date.parse(report.completedAt))
    )
      throw new Error('curadoria direta sem identidade de execucao');
    return {
      scenario,
      output,
      agentInstanceId: report.agentInstanceId,
      runId: report.runId,
      completedAt: report.completedAt,
    };
  }
  if (report.schemaVersion === 'isolated-curation-report-v1') {
    const execution = report.execution || {};
    const batchSize = report.input?.proposals?.length;
    if (
      execution.kind !== 'isolated-editorial' ||
      execution.agent !== 'content_curator' ||
      execution.pass !== 'curation' ||
      execution.testOnly !== false ||
      !execution.agentInstanceId ||
      !execution.runId ||
      report.scenarioId !== execution.runId ||
      report.inputState !== 'complete' ||
      !Number.isInteger(batchSize) ||
      batchSize < 1 ||
      batchSize > 20 ||
      !Number.isFinite(Date.parse(execution.completedAt))
    )
      throw new Error('curadoria isolada sem identidade ou contexto valido');
    const raw = JSON.parse(report.originalResponse);
    const transport = require('./agent-output-transport.cjs');
    const contract = JSON.parse(
      fs.readFileSync(
        path.join(root, 'config/editorial-agent-output.schema.json'),
        'utf8',
      ),
    );
    const output = transport.decodeEditorialBatch(
      raw,
      transport.editorialBatchSchema(
        contract,
        'content_curator',
        report.input.subjectId,
        batchSize,
      ),
      'content_curator',
    );
    if (
      execution.wireSha256 !== digest(raw) ||
      execution.batchProposalSha256 !== digest(output.proposals) ||
      JSON.stringify(execution.batchQuestionIds) !==
        JSON.stringify(output.proposals.map((proposal) => proposal.id)) ||
      output.proposals.some(
        (proposal) =>
          execution.questionSha256s?.[proposal.id] !== digest(proposal),
      )
    )
      throw new Error('hashes da curadoria isolada divergem da resposta');
    const scenario = {
      scenarioId: report.scenarioId,
      inputState: report.inputState,
      input: report.input,
      output,
    };
    return {
      scenario,
      output,
      agentInstanceId: execution.agentInstanceId,
      runId: execution.runId,
      completedAt: execution.completedAt,
      execution,
    };
  }
  throw new Error('tipo de evidencia de curadoria nao autorizado');
}

function validateDirectCuration(scenario, { expectedCount = 20 } = {}) {
  if (
    scenario?.input?.contentSetId !== '2026-t3-v2' ||
    !['historia', 'ingles', 'matematica', 'ciencias'].includes(
      scenario?.input?.subjectId,
    )
  )
    return ['curadoria direta fora do escopo autorizado'];
  const proposals = scenario?.output?.proposals;
  if (
    !Number.isInteger(expectedCount) ||
    expectedCount < 1 ||
    expectedCount > 20 ||
    !Array.isArray(proposals) ||
    proposals.length !== expectedCount
  )
    return ['curadoria direta exige 20 propostas completas'];
  return validateEditorialScenario(scenario);
}
module.exports = { readCurationEvidence, validateDirectCuration };
