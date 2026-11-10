const fs = require('node:fs');
const path = require('node:path');
const { digest } = require('./content-delivery.cjs');
function capture({
  inputPath,
  transcriptPath,
  outputPrefix,
  testOnly = false,
}) {
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const lines = fs
    .readFileSync(transcriptPath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  const session = lines.find((row) => row.type === 'session_meta')?.payload;
  const finals = lines.filter(
    (row) =>
      row.type === 'response_item' &&
      row.payload?.type === 'message' &&
      row.payload.role === 'assistant' &&
      row.payload.content?.some((c) => c.type === 'output_text'),
  );
  const final = finals.at(-1);
  if (
    !session?.id ||
    !['pedagogical_quality', 'content_curator'].includes(session.agent_role) ||
    !final
  )
    throw new Error('transcricao sem identidade ou resposta final');
  const originalResponse = final.payload.content
    .filter((c) => c.type === 'output_text')
    .map((c) => c.text)
    .join('');
  const completion = lines.findLast(
    (row) =>
      row.type === 'event_msg' &&
      row.payload?.type === 'task_complete' &&
      row.payload.last_agent_message === originalResponse,
  );
  if (!completion?.payload.turn_id)
    throw new Error('resposta sem conclusao de execucao na transcricao');
  const response = JSON.parse(originalResponse);
  if (session.agent_role === 'content_curator') {
    const scenario = {
      scenarioId: `${session.id}:${completion.payload.turn_id}`,
      inputState: 'complete',
      input,
      output: response.output,
    };
    const errors = require('./direct-curation.cjs').validateDirectCuration(
      scenario,
      { expectedCount: response.output?.proposals?.length },
    );
    if (errors.length) throw new Error(errors.join('\n'));
    const report = {
      schemaVersion: 'direct-curation-report-v1',
      input,
      originalResponse,
      agent: 'content_curator',
      agentInstanceId: session.id,
      runId: scenario.scenarioId,
      completedAt: final.timestamp,
      testOnly: Boolean(testOnly),
    };
    report.sha256 = digest(report);
    const target = `${outputPrefix}-curation.json`;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', {
      flag: 'wx',
    });
    return { evidencePath: target, decision: response.output.decision };
  }

  const normalizedOutput = response.output || {
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
  const normalizedResults = (response.results || []).map((result) => ({
    ...result,
    questionId: result.questionId || result.id,
  }));
  if (
    normalizedOutput.reviewPass !== input.requestedPass ||
    normalizedOutput.topicId !== input.topicId
  )
    throw new Error('resposta nao corresponde a entrada');
  if (
    !Array.isArray(response.results) ||
    normalizedResults.length !== input.proposals.length
  )
    throw new Error('resposta sem cobertura individual completa');
  const execution = {
    kind: 'direct-editorial',
    agent: 'pedagogical_quality',
    agentInstanceId: session.id,
    runId: `${session.id}:${completion.payload.turn_id}`,
    pass: input.requestedPass,
    completedAt: final.timestamp,
    testOnly: Boolean(testOnly),
    questionSha256s: Object.fromEntries(
      input.proposals.map((q) => [q.id, digest(q)]),
    ),
    originalReportPath: `${outputPrefix}-original.json`,
  };
  const report = {
    schemaVersion: 'direct-editorial-report-v1',
    input,
    originalResponse,
    agent: execution.agent,
    agentInstanceId: execution.agentInstanceId,
    runId: execution.runId,
    pass: execution.pass,
    completedAt: execution.completedAt,
    testOnly: execution.testOnly,
  };
  report.sha256 = digest(report);
  execution.originalReportSha256 = report.sha256;
  const evidence = {
    scenarioId: execution.runId,
    inputState: 'complete',
    input,
    output: normalizedOutput,
    execution,
  };
  const outputs = [
    [execution.originalReportPath, report],
    [`${outputPrefix}-reviewed.json`, evidence],
  ];
  for (const [file] of outputs) {
    if (fs.existsSync(file))
      throw new Error(`nao sobrescrever evidencia: ${file}`);
  }
  for (const [file, value] of outputs) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
  }
  return {
    evidencePath: `${outputPrefix}-reviewed.json`,
    decision: normalizedOutput.decision,
    approved: normalizedResults.filter((r) => r.decision === 'approved').length,
  };
}
if (require.main === module) {
  const [inputPath, transcriptPath, outputPrefix] = process.argv.slice(2);
  try {
    console.log(
      JSON.stringify(capture({ inputPath, transcriptPath, outputPrefix })),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { capture };
