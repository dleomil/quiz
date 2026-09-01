const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  AGENT_CONTRACTS,
  validateAgentDirectory,
  validateEditorialScenarios,
} = require('../../scripts/validate-codex-agents.cjs');

const editorialScenarios = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      '..',
      'fixtures',
      'agents',
      'editorial-scenarios.json',
    ),
    'utf8',
  ),
);

function cloneEditorialScenarios() {
  return JSON.parse(JSON.stringify(editorialScenarios));
}

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
      'content-curator.toml',
      'docs/specs/editorial-agent-output-contract.md',
      'docs/specs/contrato-ausente.md',
    );
    assert.ok(
      validateAgentDirectory(directory).some((error) =>
        error.includes(
          'instrucao deve referenciar docs/specs/editorial-agent-output-contract.md',
        ),
      ),
    );
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

  assert.deepStrictEqual(validateEditorialScenarios(editorialScenarios), []);
  assert.ok(
    editorialScenarios.some((scenario) => scenario.inputState === 'complete'),
  );
  assert.ok(
    editorialScenarios.some((scenario) => scenario.inputState === 'incomplete'),
  );
  assert.ok(
    editorialScenarios.some((scenario) => scenario.inputState === 'ambiguous'),
  );

  const ambiguousApproval = cloneEditorialScenarios();
  ambiguousApproval[2].output.decision = 'approved';
  assert.ok(
    validateEditorialScenarios(ambiguousApproval).some((error) =>
      error.includes('contexto incompleto ou ambiguo deve bloquear'),
    ),
  );

  const missingHumanApproval = cloneEditorialScenarios();
  missingHumanApproval[0].output.humanApprovalRequired = false;
  assert.ok(
    validateEditorialScenarios(missingHumanApproval).some((error) =>
      error.includes('aprovacao humana deve permanecer obrigatoria'),
    ),
  );

  const invalidPass = cloneEditorialScenarios();
  invalidPass[0].output.reviewPass = 'linguistic';
  assert.ok(
    validateEditorialScenarios(invalidPass).some((error) =>
      error.includes('reviewPass linguistic invalido para content_curator'),
    ),
  );

  const adjustmentWithoutFinding = cloneEditorialScenarios();
  adjustmentWithoutFinding[1].output.findings = [];
  assert.ok(
    validateEditorialScenarios(adjustmentWithoutFinding).some((error) =>
      error.includes('ajustes exigem achado nao bloqueante'),
    ),
  );

  const inconsistentInputState = cloneEditorialScenarios();
  inconsistentInputState[3].input.authorizedObjective = 'Objetivo preenchido.';
  assert.ok(
    validateEditorialScenarios(inconsistentInputState).some((error) =>
      error.includes('inputState invalido'),
    ),
  );

  const approvalWithDoubt = cloneEditorialScenarios();
  approvalWithDoubt[0].output.doubts = ['Duvida ainda aberta.'];
  assert.ok(
    validateEditorialScenarios(approvalWithDoubt).some((error) =>
      error.includes('aprovacao nao pode conter duvida ou achado'),
    ),
  );

  const approvalWithBlockingFinding = cloneEditorialScenarios();
  approvalWithBlockingFinding[0].output.findings = [
    {
      questionId: 'FIX-CIE-001',
      criterion: 'corretude',
      severity: 'blocking',
      evidence: 'Erro ficticio bloqueante.',
      recommendation: 'Corrigir antes de aprovar.',
    },
  ];
  assert.ok(
    validateEditorialScenarios(approvalWithBlockingFinding).some((error) =>
      error.includes('aprovacao nao pode conter duvida ou achado'),
    ),
  );

  const blockedWithMinorFinding = cloneEditorialScenarios();
  blockedWithMinorFinding[0].output.decision = 'blocked';
  blockedWithMinorFinding[0].output.findings = [
    {
      questionId: 'FIX-CIE-001',
      criterion: 'estilo',
      severity: 'minor',
      evidence: 'Preferencia ficticia de estilo.',
      recommendation: 'Avaliar ajuste opcional.',
    },
  ];
  assert.ok(
    validateEditorialScenarios(blockedWithMinorFinding).some((error) =>
      error.includes('bloqueio exige contexto invalido'),
    ),
  );

  const sourceExcerptLeak = cloneEditorialScenarios();
  sourceExcerptLeak[0].output.sourceExcerpt = 'Trecho escolar nao autorizado.';
  assert.ok(
    validateEditorialScenarios(sourceExcerptLeak).some((error) =>
      error.includes('campo nao autorizado: output.sourceExcerpt'),
    ),
  );

  const draftManifestApproval = cloneEditorialScenarios();
  draftManifestApproval[0].input.manifestState = 'draft';
  assert.ok(
    validateEditorialScenarios(draftManifestApproval).some((error) =>
      error.includes('contexto incompleto ou ambiguo deve bloquear'),
    ),
  );

  const missingProposal = cloneEditorialScenarios();
  delete missingProposal[1].input.proposal;
  assert.ok(
    validateEditorialScenarios(missingProposal).some((error) =>
      error.includes('proposta pedagogica incompleta'),
    ),
  );

  const mismatchedRequestedPass = cloneEditorialScenarios();
  mismatchedRequestedPass[1].input.requestedPass = 'pedagogical';
  assert.ok(
    validateEditorialScenarios(mismatchedRequestedPass).some((error) =>
      error.includes('reviewPass diverge da passagem solicitada'),
    ),
  );

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
