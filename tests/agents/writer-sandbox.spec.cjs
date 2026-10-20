const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { sha256 } = require('../../scripts/governance-guidelines.cjs');
const { probe } = require('../../scripts/agent-writer-sandbox.cjs');

const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'quiz-native-sandbox-'),
);
try {
  const workspace = path.join(directory, 'copy');
  const scratch = path.join(directory, 'scratch');
  const home = path.join(directory, 'dummy-auth');
  const original = path.join(directory, 'dummy-original');
  for (const target of [workspace, scratch, home, original])
    fs.mkdirSync(target);
  fs.writeFileSync(path.join(workspace, 'package.json'), '{}');
  fs.writeFileSync(path.join(workspace, 'allowed.txt'), 'preservar');
  fs.writeFileSync(path.join(home, 'config.toml'), 'fixture sem credenciais');
  fs.writeFileSync(path.join(original, 'package.json'), '{}');
  const result = probe(
    'codex',
    workspace,
    ['allowed.txt'],
    scratch,
    home,
    original,
  );
  if (
    fs.readFileSync(path.join(workspace, 'allowed.txt'), 'utf8') !== 'preservar'
  )
    throw new Error('probe nao restaurou arquivo');
  const proof = {
    schemaVersion: 'agent-sandbox-proof-v1',
    testOnly: false,
    method: 'native-offline-command-no-model',
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: path.resolve(__dirname, '../..'),
      encoding: 'utf8',
    }).trim(),
    componentSha256: sha256(
      fs.readFileSync(
        path.resolve(__dirname, '../../scripts/agent-writer-sandbox.cjs'),
      ),
    ),
    completedAt: new Date().toISOString(),
    ...result,
  };
  process.stdout.write(`${JSON.stringify(proof, null, 2)}\n`);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
