const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { gradeCode } = require('../../scripts/agent-evaluation-grading.cjs');
const { GOOD_CODE } = require('./evaluation-test-support.cjs');

const owned = fs.realpathSync(
  fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-evaluation-native-')),
);
try {
  const workspace = path.join(owned, 'copy');
  const scratch = path.join(owned, 'scratch');
  fs.mkdirSync(workspace);
  fs.mkdirSync(scratch);
  fs.writeFileSync(path.join(workspace, 'package.json'), '{"type":"commonjs"}');
  const target = path.join(workspace, 'score.cjs');
  fs.writeFileSync(target, GOOD_CODE);
  const correct = gradeCode('codex', workspace, scratch, 'score.cjs');
  assert.equal(correct.passed, true, JSON.stringify(correct));
  fs.writeFileSync(target, 'process.exit(0);');
  const incomplete = gradeCode('codex', workspace, scratch, 'score.cjs');
  assert.equal(incomplete.passed, false);
  process.stdout.write(
    `${JSON.stringify({
      method: 'native-independent-check-no-model',
      modelInvocations: 0,
      correctImplementationAccepted: correct.passed,
      earlyExitRejected: !incomplete.passed,
      commandSha256: correct.commandSha256,
    })}\n`,
  );
} finally {
  fs.rmSync(owned, { recursive: true, force: true });
}
