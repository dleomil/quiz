const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  AGENT_CONTRACTS,
  validateAgentDirectory,
} = require('../../scripts/validate-codex-agents.cjs');

function validAgentSource(contract) {
  return [
    `name = "${contract.name}"`,
    'description = "Agente de teste"',
    `model = "${contract.model}"`,
    `model_reasoning_effort = "${contract.model_reasoning_effort}"`,
    'sandbox_mode = "read-only"',
    'developer_instructions = """',
    ...contract.requiredReferences,
    'Nao altere arquivos nem publique resultados.',
    '"""',
    '',
  ].join('\n');
}

function createFixture() {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-codex-agents-'),
  );
  Object.entries(AGENT_CONTRACTS).forEach(([fileName, contract]) => {
    fs.writeFileSync(
      path.join(directory, fileName),
      validAgentSource(contract),
      'utf8',
    );
  });
  return directory;
}

function withFixture(assertion) {
  const directory = createFixture();
  try {
    assertion(directory);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

function replaceInFile(directory, fileName, currentValue, nextValue) {
  const filePath = path.join(directory, fileName);
  const source = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, source.replace(currentValue, nextValue), 'utf8');
}

function run() {
  withFixture((directory) => {
    assert.deepStrictEqual(validateAgentDirectory(directory), []);
  });

  withFixture((directory) => {
    replaceInFile(
      directory,
      'reviewer.toml',
      'description = "Agente de teste"\n',
      '',
    );
    assert.ok(
      validateAgentDirectory(directory).some((error) =>
        error.includes('campo ausente: description'),
      ),
    );
  });

  withFixture((directory) => {
    replaceInFile(
      directory,
      'verifier.toml',
      'gpt-5.6-terra',
      'modelo-invalido',
    );
    assert.ok(
      validateAgentDirectory(directory).some((error) =>
        error.includes('model deve ser gpt-5.6-terra'),
      ),
    );
  });

  withFixture((directory) => {
    replaceInFile(
      directory,
      'product-discovery.toml',
      'sandbox_mode = "read-only"',
      'sandbox_mode = "workspace-write"',
    );
    assert.ok(
      validateAgentDirectory(directory).some((error) =>
        error.includes('sandbox_mode deve ser read-only'),
      ),
    );
  });

  withFixture((directory) => {
    const fakeSecret = ['sk', '1234567890abcdefghijkl'].join('-');
    replaceInFile(
      directory,
      'reviewer.toml',
      'Nao altere arquivos',
      `Token ${fakeSecret} Nao altere arquivos`,
    );
    assert.ok(
      validateAgentDirectory(directory).some((error) =>
        error.includes('possivel segredo detectado'),
      ),
    );
  });

  withFixture((directory) => {
    fs.writeFileSync(
      path.join(directory, 'nao-declarado.toml'),
      'name = "nao_declarado"\n',
      'utf8',
    );
    assert.ok(
      validateAgentDirectory(directory).some((error) =>
        error.includes('agente nao declarado no contrato'),
      ),
    );
  });

  process.stdout.write('codex-agent-validator: ok\n');
}

run();
