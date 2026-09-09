const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  ROOT,
  validateRecordSet,
} = require('../../scripts/agent-execution-records.cjs');

const fixturePath = path.join(
  ROOT,
  'tests',
  'fixtures',
  'agents',
  'execution-record-set.json',
);
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

function clone(value = fixture) {
  return JSON.parse(JSON.stringify(value));
}

function expectError(candidate, text) {
  const errors = validateRecordSet(candidate);
  assert.ok(
    errors.some((error) => error.includes(text)),
    errors.join('\n'),
  );
}

assert.deepEqual(validateRecordSet(fixture), []);
assert.equal(fixture.records.length, 8);

const unknownField = clone();
unknownField.records[0].sourceText = 'conteudo proibido';
expectError(unknownField, 'campo desconhecido: sourceText');

const duplicateRecord = clone();
duplicateRecord.records[1].recordId = duplicateRecord.records[0].recordId;
expectError(duplicateRecord, 'recordId duplicado');

const duplicateExecution = clone();
duplicateExecution.records[1].executionId =
  duplicateExecution.records[0].executionId;
expectError(duplicateExecution, 'executionId duplicado');

const invalidDate = clone();
invalidDate.records[0].recordedAt = '09/09/2026';
expectError(invalidDate, 'recordedAt invalido');

const invalidArtifactType = clone();
invalidArtifactType.records[0].artifact.type = 'change';
expectError(invalidArtifactType, 'artifact.type diverge');

const invalidOutcome = clone();
invalidOutcome.records[0].outcome.status = 'approved';
expectError(invalidOutcome, 'outcome.status invalido para author');

const invalidRole = clone();
invalidRole.records[0].actor.roleId = 'root';
expectError(invalidRole, 'actor.roleId inexistente');

const invalidCapability = clone();
invalidCapability.records[0].capabilityId = 'unbounded-write';
expectError(invalidCapability, 'capabilityId inexistente');

const incompatibleRole = clone();
incompatibleRole.records[0].actor.roleId = 'reviewer';
expectError(incompatibleRole, 'nao possui capability');

const missingSubject = clone();
delete missingSubject.records[1].subjectExecutionId;
expectError(missingSubject, 'subjectExecutionId obrigatorio');

const unknownSubject = clone();
unknownSubject.records[1].subjectExecutionId = 'execution-missing';
expectError(unknownSubject, 'subjectExecutionId inexistente');

const sameActor = clone();
sameActor.records[1].actor.id = sameActor.records[0].actor.id;
expectError(sameActor, 'ator distinto');

const artifactMismatch = clone();
artifactMismatch.records[1].artifact.version = '2.0.0';
expectError(artifactMismatch, 'diverge do artefato ou versao');

const wrongProducer = clone();
wrongProducer.records[1].subjectExecutionId = 'execution-implementation';
expectError(wrongProducer, 'capability produtora incorreta');

const workItemMismatch = clone();
workItemMismatch.records[1].workItemId = 'fixture://work-item/other';
expectError(workItemMismatch, 'diverge do workItemId');

const missingEvidence = clone();
missingEvidence.records[0].evidence = [];
expectError(missingEvidence, 'evidence deve ser lista nao vazia');

const invalidEvidenceType = clone();
invalidEvidenceType.records[0].evidence[0].type = 'secret-dump';
expectError(invalidEvidenceType, 'evidence[0].type invalido');

const invalidEvidenceHash = clone();
invalidEvidenceHash.records[0].evidence[0].sha256 = 'abc123';
expectError(invalidEvidenceHash, 'evidence[0].sha256 invalido');

const duplicateEvidence = clone();
duplicateEvidence.records[0].evidence.push(clone().records[0].evidence[0]);
expectError(duplicateEvidence, 'evidence[1].id duplicado');

const danglingFindingEvidence = clone();
danglingFindingEvidence.records[1].findings.push({
  id: 'finding-1',
  severity: 'major',
  criterion: 'fixture',
  summary: 'Achado ficticio.',
  evidenceIds: ['evidence-missing'],
  recommendation: 'Corrigir o cenario ficticio.',
  status: 'open',
});
expectError(danglingFindingEvidence, 'referencia evidencia inexistente');

const approvedWithOpenFinding = clone();
approvedWithOpenFinding.records[1].findings.push({
  id: 'finding-1',
  severity: 'minor',
  criterion: 'fixture',
  summary: 'Achado ficticio.',
  evidenceIds: ['evidence-architecture'],
  recommendation: 'Corrigir o cenario ficticio.',
  status: 'open',
});
expectError(approvedWithOpenFinding, 'aprovado nao pode conter finding aberto');

const falseHumanDecision = clone();
falseHumanDecision.records[0].humanDecisionRequired = false;
expectError(falseHumanDecision, 'humanDecisionRequired deve ser true');

const externalOperation = clone();
externalOperation.records[0].actor.roleId = 'release-board';
externalOperation.records[0].capabilityId = 'repository-operation';
externalOperation.records[0].artifact.type = 'repository';
externalOperation.records[0].outcome.status = 'produced';
expectError(externalOperation, 'operacao nao autorizada');

const researchIndex = fixture.records.findIndex(
  (record) => record.capabilityId === 'product-research',
);
const missingResearch = clone();
delete missingResearch.records[researchIndex].research;
expectError(missingResearch, 'research obrigatorio');

for (const field of ['question', 'audience', 'decisionOwner']) {
  const missingResearchContext = clone();
  missingResearchContext.records[researchIndex].research[field] = '';
  expectError(missingResearchContext, `research.${field}`);
}

const missingSources = clone();
missingSources.records[researchIndex].research.sources = [];
expectError(missingSources, 'sources deve ser lista nao vazia');

const invalidClaim = clone();
invalidClaim.records[researchIndex].research.claims[0].classification =
  'opinion';
expectError(invalidClaim, 'classification invalida');

const missingFactSource = clone();
missingFactSource.records[researchIndex].research.claims[0].sourceIds = [];
expectError(missingFactSource, 'sourceIds deve ser lista nao vazia');

const danglingSource = clone();
danglingSource.records[researchIndex].research.claims[0].sourceIds = [
  'missing',
];
expectError(danglingSource, 'referencia fonte inexistente');

const invalidConsultedAt = clone();
invalidConsultedAt.records[researchIndex].research.sources[0].consultedAt =
  '2026-02-30';
expectError(invalidConsultedAt, 'consultedAt invalido');

const tempDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'agent-execution-records-'),
);
try {
  const invalidJson = path.join(tempDirectory, 'invalid.json');
  fs.writeFileSync(invalidJson, '{ invalid json');
  const before = fs.readdirSync(tempDirectory);
  const invalidResult = spawnSync(
    process.execPath,
    [
      path.join(ROOT, 'scripts', 'agent-execution-records.cjs'),
      '--input',
      invalidJson,
    ],
    { encoding: 'utf8' },
  );
  assert.notEqual(invalidResult.status, 0);
  assert.match(invalidResult.stderr, /entrada invalida/);
  assert.deepEqual(fs.readdirSync(tempDirectory), before);

  const missingArgument = spawnSync(
    process.execPath,
    [path.join(ROOT, 'scripts', 'agent-execution-records.cjs')],
    { encoding: 'utf8' },
  );
  assert.notEqual(missingArgument.status, 0);
  assert.match(missingArgument.stderr, /use --input/);

  const validResult = spawnSync(
    process.execPath,
    [
      path.join(ROOT, 'scripts', 'agent-execution-records.cjs'),
      '--input',
      fixturePath,
    ],
    { encoding: 'utf8' },
  );
  assert.equal(validResult.status, 0, validResult.stderr);
  assert.equal(validResult.stderr, '');
  assert.match(validResult.stdout, /8 registros validos/);
  assert.doesNotMatch(validResult.stdout, /fixture-actor/);
} finally {
  fs.rmSync(tempDirectory, { recursive: true, force: true });
}

process.stdout.write('agent-execution-records: ok\n');
