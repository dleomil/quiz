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
  const lines = [
    `name = "${contract.name}"`,
    'description = "Agente de teste"',
    `model = "${contract.model}"`,
    `model_reasoning_effort = "${contract.model_reasoning_effort}"`,
    'sandbox_mode = "read-only"',
    'developer_instructions = """',
    ...contract.requiredReferences,
    'Nao altere arquivos nem publique resultados.',
    '"""',
  ];
  if (contract.mcpPolicy === 'none') lines.push('', '[mcp_servers]');
  return lines.join('\n') + '\n';
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
    replaceInFile(directory, 'content-curator.toml', '\n[mcp_servers]', '');
    assert.ok(
      validateAgentDirectory(directory).some((error) =>
        error.includes('politica MCP explicita ausente'),
      ),
    );
  });

  withFixture((directory) => {
    replaceInFile(
      directory,
      'pedagogical-quality.toml',
      '[mcp_servers]',
      '[mcp_servers]\ngithub = {}',
    );
    assert.ok(
      validateAgentDirectory(directory).some((error) =>
        error.includes('nenhum servidor MCP e permitido'),
      ),
    );
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

  const missingFreezeApprovalEvidence = cloneEditorialScenarios();
  delete missingFreezeApprovalEvidence[0].input.humanFreezeApproval.evidenceRef;
  assert.ok(
    validateEditorialScenarios(missingFreezeApprovalEvidence).some((error) =>
      error.includes('aprovacao do congelamento incompleta'),
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

  const inputSourceExcerptLeak = cloneEditorialScenarios();
  inputSourceExcerptLeak[0].input.sourceExcerpt =
    'Trecho escolar nao autorizado.';
  assert.ok(
    validateEditorialScenarios(inputSourceExcerptLeak).some((error) =>
      error.includes('campo nao autorizado: input.sourceExcerpt'),
    ),
  );

  const proposalSourceExcerptLeak = cloneEditorialScenarios();
  proposalSourceExcerptLeak[1].input.proposal.sourceExcerpt =
    'Trecho escolar nao autorizado.';
  assert.ok(
    validateEditorialScenarios(proposalSourceExcerptLeak).some((error) =>
      error.includes('campo nao autorizado: input.proposal.sourceExcerpt'),
    ),
  );

  const findingSourceExcerptLeak = cloneEditorialScenarios();
  findingSourceExcerptLeak[1].output.findings[0].sourceExcerpt =
    'Trecho escolar nao autorizado.';
  assert.ok(
    validateEditorialScenarios(findingSourceExcerptLeak).some((error) =>
      error.includes('campo nao autorizado: output.findings[0].sourceExcerpt'),
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
      error.includes('input.proposal incompleta'),
    ),
  );

  const mismatchedRequestedPass = cloneEditorialScenarios();
  mismatchedRequestedPass[1].input.requestedPass = 'pedagogical';
  assert.ok(
    validateEditorialScenarios(mismatchedRequestedPass).some((error) =>
      error.includes('reviewPass diverge da passagem solicitada'),
    ),
  );

  const blockingAdjustment = cloneEditorialScenarios();
  blockingAdjustment[1].output.findings[0].severity = 'blocking';
  assert.ok(
    validateEditorialScenarios(blockingAdjustment).some((error) =>
      error.includes('ajustes exigem achado nao bloqueante'),
    ),
  );

  const feedbackAsList = cloneEditorialScenarios();
  feedbackAsList[0].output.proposal.wrongExplanations = [
    'Feedback 1.',
    'Feedback 2.',
    'Feedback 3.',
  ];
  assert.ok(
    validateEditorialScenarios(feedbackAsList).some((error) =>
      error.includes('output.proposal incompleta'),
    ),
  );

  const feedbackWithWrongIndex = cloneEditorialScenarios();
  delete feedbackWithWrongIndex[1].input.proposal.wrongExplanations['0'];
  feedbackWithWrongIndex[1].input.proposal.wrongExplanations['1'] =
    'Feedback indevido para a alternativa correta.';
  assert.ok(
    validateEditorialScenarios(feedbackWithWrongIndex).some((error) =>
      error.includes('input.proposal incompleta'),
    ),
  );

  const proposalPageLeak = cloneEditorialScenarios();
  proposalPageLeak[0].output.proposal.sourceRef.page = '10';
  assert.ok(
    validateEditorialScenarios(proposalPageLeak).some((error) =>
      error.includes('campo nao autorizado: output.proposal.sourceRef.page'),
    ),
  );

  const missingProposalSkill = cloneEditorialScenarios();
  delete missingProposalSkill[0].output.proposal.skill;
  assert.ok(
    validateEditorialScenarios(missingProposalSkill).some((error) =>
      error.includes('output.proposal incompleta'),
    ),
  );

  const missingProposalSource = cloneEditorialScenarios();
  delete missingProposalSource[0].output.proposal.sourceRef;
  assert.ok(
    validateEditorialScenarios(missingProposalSource).some((error) =>
      error.includes('output.proposal incompleta'),
    ),
  );

  const divergentProposalMetadata = cloneEditorialScenarios();
  divergentProposalMetadata[0].output.proposal.skill =
    'habilidade-nao-autorizada';
  assert.ok(
    validateEditorialScenarios(divergentProposalMetadata).some((error) =>
      error.includes('output.proposal.skill diverge da entrada'),
    ),
  );

  const nonContentV1Proposal = cloneEditorialScenarios();
  delete nonContentV1Proposal[0].output.proposal.schemaVersion;
  assert.ok(
    validateEditorialScenarios(nonContentV1Proposal).some((error) =>
      error.includes('output.proposal incompleta'),
    ),
  );

  const mismatchedQuestionId = cloneEditorialScenarios();
  mismatchedQuestionId[1].output.findings[0].questionId = 'OUTRA-QUESTAO';
  assert.ok(
    validateEditorialScenarios(mismatchedQuestionId).some((error) =>
      error.includes('questionId diverge da proposta'),
    ),
  );

  const curatorWithoutProposal = cloneEditorialScenarios();
  delete curatorWithoutProposal[0].output.proposal;
  assert.ok(
    validateEditorialScenarios(curatorWithoutProposal).some((error) =>
      error.includes('output.proposal incompleta'),
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
