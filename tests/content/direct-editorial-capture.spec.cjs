const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { capture } = require('../../scripts/capture-direct-editorial.cjs');
const { digest } = require('../../scripts/content-delivery.cjs');
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-direct-capture-'),
);
try {
  const input = {
    requestedPass: 'pedagogical',
    topicId: 'fixture',
    proposals: [{ id: 'fixture-1' }],
  };
  const originalResponse =
    '\n' +
    JSON.stringify(
      {
        output: {
          reviewPass: 'pedagogical',
          topicId: 'fixture',
          decision: 'adjustments_required',
        },
        results: [
          { questionId: 'fixture-1', decision: 'adjustments_required' },
        ],
      },
      null,
      2,
    ) +
    '\n';
  const rows = [
    {
      type: 'session_meta',
      payload: { id: 'fixture-instancia', agent_role: 'pedagogical_quality' },
    },
    {
      type: 'response_item',
      timestamp: '2026-11-09T20:00:00Z',
      payload: {
        type: 'message',
        role: 'assistant',
        content: [{ type: 'output_text', text: originalResponse }],
      },
    },
    {
      type: 'event_msg',
      payload: {
        type: 'task_complete',
        turn_id: 'fixture-execucao',
        last_agent_message: originalResponse,
      },
    },
  ];
  const inputPath = path.join(directory, 'input.json'),
    transcriptPath = path.join(directory, 'transcript.jsonl'),
    outputPrefix = path.join(directory, 'review');
  fs.writeFileSync(inputPath, JSON.stringify(input));
  fs.writeFileSync(
    transcriptPath,
    rows.map((r) => JSON.stringify(r)).join('\n'),
  );
  capture({ inputPath, transcriptPath, outputPrefix, testOnly: true });
  const report = JSON.parse(fs.readFileSync(`${outputPrefix}-original.json`));
  const { sha256, ...payload } = report;
  assert.equal(
    report.originalResponse,
    originalResponse,
    'resposta original integral, incluindo espacos e quebras',
  );
  assert.equal(sha256, digest(payload));
  assert.equal(report.testOnly, true);
  assert.equal(report.runId, 'fixture-instancia:fixture-execucao');
  const topLevelResponse = JSON.stringify({
    agent: 'pedagogical_quality',
    workItemId: 'fixture-work',
    contentSetId: '2026-t3-v2',
    subjectId: 'geografia',
    topicId: 'fixture',
    reviewPass: 'pedagogical',
    decision: 'approved',
    facts: ['parecer preservado'],
    doubts: [],
    findings: [],
    recommendations: [],
    humanApprovalRequired: true,
    results: [
      {
        id: 'fixture-1',
        decision: 'approved',
        findings: [],
        doubts: [],
        checks: {
          question: 'avaliado',
          options: 'avaliado',
          answer: 'avaliado',
          explanation: 'avaliado',
          wrongExplanations: 'avaliado',
        },
      },
    ],
  });
  const topLevelRows = [
    ...rows.slice(0, 2),
    {
      type: 'event_msg',
      payload: {
        type: 'task_complete',
        turn_id: 'fixture-execucao-top-level',
        last_agent_message: topLevelResponse,
      },
    },
  ];
  topLevelRows[1].payload.content[0].text = topLevelResponse;
  topLevelRows[1].timestamp = '2026-11-09T20:01:00Z';
  const topLevelTranscript = path.join(directory, 'top-level.jsonl');
  fs.writeFileSync(
    topLevelTranscript,
    topLevelRows.map((r) => JSON.stringify(r)).join('\n'),
  );
  const topLevelPrefix = path.join(directory, 'top-level-review');
  capture({
    inputPath,
    transcriptPath: topLevelTranscript,
    outputPrefix: topLevelPrefix,
    testOnly: true,
  });
  const topLevelReport = JSON.parse(
    fs.readFileSync(`${topLevelPrefix}-original.json`),
  );
  const topLevelScenario = JSON.parse(
    fs.readFileSync(`${topLevelPrefix}-reviewed.json`),
  );
  assert.equal(topLevelReport.originalResponse, topLevelResponse);
  assert.equal(topLevelScenario.output.reviewPass, 'pedagogical');
  assert.equal(topLevelScenario.output.topicId, 'fixture');
  assert.equal(topLevelScenario.execution.testOnly, true);
  assert.throws(
    () => capture({ inputPath, transcriptPath, outputPrefix, testOnly: true }),
    /nao sobrescrever/,
  );
  rows.pop();
  fs.writeFileSync(
    transcriptPath,
    rows.map((r) => JSON.stringify(r)).join('\n'),
  );
  assert.throws(
    () =>
      capture({
        inputPath,
        transcriptPath,
        outputPrefix: path.join(directory, 'incompleto'),
        testOnly: true,
      }),
    /sem conclusao/,
  );
  assert(!fs.existsSync(path.join(directory, 'incompleto-original.json')));
  rows[0].payload.agent_role = 'content_curator';
  fs.writeFileSync(
    transcriptPath,
    rows.map((r) => JSON.stringify(r)).join('\n'),
  );
  assert.throws(
    () =>
      capture({
        inputPath,
        transcriptPath,
        outputPrefix: path.join(directory, 'outro-papel'),
        testOnly: true,
      }),
    /sem identidade/,
  );
  console.log(
    'direct-editorial-capture: resposta integral, identidade, conclusao, hash e preservacao OK (fixtures)',
  );
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
