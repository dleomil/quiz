const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { capture } = require('../../scripts/capture-direct-editorial.cjs');
const { scenario } = require('../helpers/subject-synthetic.cjs');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'curation-synthetic-'));
try {
  const sample = scenario();
  const response = JSON.stringify({ output: sample.output });
  const rows = [
    {
      type: 'session_meta',
      payload: { id: 'instancia-sintetica', agent_role: 'content_curator' },
    },
    {
      type: 'response_item',
      timestamp: new Date().toISOString(),
      payload: {
        type: 'message',
        role: 'assistant',
        content: [{ type: 'output_text', text: response }],
      },
    },
    {
      type: 'event_msg',
      payload: {
        type: 'task_complete',
        turn_id: 'turno-sintetico',
        last_agent_message: response,
      },
    },
  ];
  const inputPath = path.join(temp, 'input.json'),
    transcriptPath = path.join(temp, 'transcript.jsonl');
  fs.writeFileSync(inputPath, JSON.stringify(sample.input));
  fs.writeFileSync(
    transcriptPath,
    rows.map((row) => JSON.stringify(row)).join('\n'),
  );
  const options = {
    inputPath,
    transcriptPath,
    outputPrefix: path.join(temp, 'capture'),
    testOnly: true,
  };
  const result = capture(options);
  const report = JSON.parse(fs.readFileSync(result.evidencePath));
  assert.equal(report.originalResponse, response);
  assert.equal(report.testOnly, true);
  assert.equal(report.agent, 'content_curator');
  assert.throws(() => capture(options), /EEXIST/);
  rows.pop();
  fs.writeFileSync(
    transcriptPath,
    rows.map((row) => JSON.stringify(row)).join('\n'),
  );
  assert.throws(
    () => capture({ ...options, outputPrefix: path.join(temp, 'incomplete') }),
    /conclusao/,
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
console.log('direct-curation-capture: ok (transcricao sintetica)');
