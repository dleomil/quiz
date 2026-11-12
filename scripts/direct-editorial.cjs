const { validateEditorialScenario } = require('./validate-codex-agents.cjs');

const FIELDS = [
  'question',
  'options',
  'answer',
  'explanation',
  'wrongExplanations',
];
const SUBJECTS = ['geografia', 'historia', 'ingles', 'matematica', 'ciencias'];
function validateDirectReview(
  scenario,
  question,
  readJson,
  { digest, reviewProjection, policy, allowTestEvidence },
) {
  const errors = [];
  const { input, output, execution } = scenario;
  if (
    question?.contentSetId !== '2026-t3-v2' ||
    !SUBJECTS.includes(question?.subject) ||
    !policy?.directEditorial?.subjects?.includes(question?.subject) ||
    !policy?.directEditorial?.contentSetIds?.includes(question?.contentSetId)
  )
    throw new Error('revisao direta nao autorizada para o acervo ou materia');
  const proposals = input?.proposals;
  if (
    !Array.isArray(proposals) ||
    !proposals.length ||
    proposals.length > 20 ||
    new Set(proposals.map((p) => p.id)).size !== proposals.length
  )
    throw new Error('lote direto deve conter de 1 a 20 IDs unicos');
  const standardInput = { ...input };
  delete standardInput.checklist;
  errors.push(
    ...validateEditorialScenario(
      {
        scenarioId: scenario.scenarioId,
        inputState: scenario.inputState,
        input: standardInput,
        output,
      },
      { maxProposals: 20 },
    ),
  );
  if (!FIELDS.every((field) => input.checklist?.includes(field)))
    errors.push('checklist direto incompleto');
  if (
    !execution.agentInstanceId ||
    typeof execution.agentInstanceId !== 'string' ||
    !execution.agentInstanceId.trim()
  )
    errors.push('identidade da instancia ausente');
  if (!allowTestEvidence && execution.testOnly !== false)
    errors.push('evidencia direta ficticia');
  if (typeof execution.runId !== 'string' || !execution.runId.trim())
    errors.push('identificacao da execucao direta ausente');
  if (
    digest(Object.keys(execution.questionSha256s || {}).sort()) !==
    digest(proposals.map((p) => p.id).sort())
  )
    errors.push('IDs dos hashes individuais divergem do lote direto');
  const ref = execution.originalReportPath;
  if (
    !/^docs\/editorial\/[\w./-]+\.json$/.test(ref || '') ||
    ref.split('/').includes('..')
  )
    throw new Error('referencia do relatorio original invalida');
  const report = readJson(ref);
  if (
    report.schemaVersion !== 'direct-editorial-report-v1' ||
    typeof report.originalResponse !== 'string' ||
    !report.originalResponse.trim()
  )
    throw new Error('relatorio original ausente ou invalido');
  const { sha256, ...payload } = report;
  if (sha256 !== digest(payload) || sha256 !== execution.originalReportSha256)
    errors.push('hash do relatorio original diverge');
  if (
    digest(report.input) !== digest(input) ||
    report.agentInstanceId !== execution.agentInstanceId ||
    report.runId !== execution.runId ||
    report.pass !== execution.pass ||
    report.agent !== 'pedagogical_quality' ||
    report.completedAt !== execution.completedAt ||
    report.testOnly !== execution.testOnly
  )
    errors.push('relatorio original diverge da execucao');
  const response = JSON.parse(report.originalResponse);
  const rawOutput = response.output || {
    agent: response.agent,
    workItemId: response.workItemId,
    contentSetId: response.contentSetId,
    subjectId: response.subjectId,
    topicId: response.topicId,
    reviewPass: response.reviewPass,
    decision: response.decision,
    facts: response.facts,
    doubts: response.doubts,
    findings: response.findings,
    recommendations: response.recommendations,
    humanApprovalRequired: response.humanApprovalRequired,
  };
  const rawResults = (response.results || []).map((result) => ({
    ...result,
    questionId: result.questionId || result.id,
  }));
  const comparableOutput = rawOutput.results
    ? rawOutput
    : { ...rawOutput, results: rawResults };
  if (digest(comparableOutput) !== digest(output))
    errors.push('resposta original diverge do parecer');
  const results = (response.results || []).map((result) => ({
    ...result,
    questionId: result.questionId || result.id,
  }));
  if (
    !Array.isArray(results) ||
    results.length !== proposals.length ||
    new Set(results.map((r) => r.questionId)).size !== proposals.length ||
    results.some((r) => !proposals.some((p) => p.id === r.questionId))
  )
    throw new Error('cobertura individual direta incompleta');
  const aggregateFindingCounts = new Map();
  for (const finding of output.findings || []) {
    if (!proposals.some((proposal) => proposal.id === finding.questionId))
      errors.push('achado agregado sem ID revisado');
    aggregateFindingCounts.set(
      finding.questionId,
      (aggregateFindingCounts.get(finding.questionId) || 0) + 1,
    );
  }
  if (
    results.some(
      (result) =>
        (result.findings || []).length !==
        (aggregateFindingCounts.get(result.questionId) || 0),
    ) ||
    (output.doubts?.length && !results.some((r) => r.doubts?.length))
  )
    errors.push('achados individuais divergem do parecer geral');
  for (const proposal of proposals) {
    const result = results.find((r) => r.questionId === proposal.id);
    if (execution.questionSha256s?.[proposal.id] !== digest(proposal))
      errors.push(`hash individual direto diverge: ${proposal.id}`);
    if (
      !result ||
      !['approved', 'adjustments_required', 'blocked'].includes(
        result.decision,
      ) ||
      !Array.isArray(result.findings) ||
      !Array.isArray(result.doubts) ||
      !FIELDS.every(
        (field) =>
          typeof result.checks?.[field] === 'string' &&
          result.checks[field].trim(),
      )
    )
      errors.push(`resultado individual incompleto: ${proposal.id}`);
    if (
      proposal.id === question.id &&
      (!result ||
        result.decision !== 'approved' ||
        !Array.isArray(result.findings) ||
        result.findings.length ||
        !Array.isArray(result.doubts) ||
        result.doubts.length ||
        !FIELDS.every(
          (field) =>
            typeof result.checks?.[field] === 'string' &&
            result.checks[field].trim(),
        ))
    )
      errors.push(
        `resultado individual incompleto ou pendente: ${proposal.id}`,
      );
  }
  if (
    execution.questionSha256s?.[question.id] !==
    digest(reviewProjection(question))
  )
    errors.push('hash da questao atual diverge da revisao direta');
  return errors;
}
module.exports = { FIELDS, SUBJECTS, validateDirectReview };
