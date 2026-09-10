const fs = require('node:fs');
const path = require('node:path');
const { ROOT, loadCapabilityModel } = require('./agent-capabilities.cjs');

const SCHEMA_VERSION = 'agent-execution-record-set-v1';
const ALLOWED_OPERATIONS = new Set(['author', 'review', 'verify', 'research']);
const OUTCOME_BY_OPERATION = {
  author: new Set(['produced', 'blocked', 'failed']),
  review: new Set(['approved', 'adjustments-required', 'blocked', 'failed']),
  verify: new Set(['approved', 'adjustments-required', 'blocked', 'failed']),
  research: new Set(['produced', 'blocked', 'failed']),
};
const EVIDENCE_TYPES = new Set([
  'agent-output',
  'command-output',
  'document',
  'link',
  'test-result',
]);
const FINDING_SEVERITIES = new Set(['blocking', 'major', 'minor', 'info']);
const FINDING_STATUSES = new Set(['open', 'resolved']);
const CLAIM_CLASSES = new Set([
  'fact',
  'inference',
  'hypothesis',
  'recommendation',
]);
const RECOMMENDATIONS = new Set([
  'discard',
  'observe',
  'research',
  'propose-backlog',
]);
const CONFIDENCE = new Set(['low', 'medium', 'high']);
const SHA256 = /^[a-f0-9]{64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/;
const IDENTIFIER = /^[A-Za-z0-9/][A-Za-z0-9._:/@-]*$/;

const TOP_KEYS = new Set(['schemaVersion', 'records']);
const RECORD_KEYS = new Set([
  'recordId',
  'executionId',
  'workItemId',
  'recordedAt',
  'actor',
  'capabilityId',
  'artifact',
  'subjectExecutionId',
  'outcome',
  'evidence',
  'findings',
  'research',
  'humanDecisionRequired',
]);
const ACTOR_KEYS = new Set(['id', 'roleId']);
const ARTIFACT_KEYS = new Set(['type', 'id', 'version', 'reference']);
const OUTCOME_KEYS = new Set(['status', 'summary']);
const EVIDENCE_KEYS = new Set([
  'id',
  'type',
  'reference',
  'observedAt',
  'sha256',
]);
const FINDING_KEYS = new Set([
  'id',
  'severity',
  'criterion',
  'summary',
  'evidenceIds',
  'recommendation',
  'status',
]);
const RESEARCH_KEYS = new Set([
  'question',
  'audience',
  'decisionOwner',
  'sources',
  'claims',
  'recommendation',
  'confidence',
]);
const SOURCE_KEYS = new Set([
  'id',
  'title',
  'origin',
  'url',
  'publishedAt',
  'consultedAt',
]);
const CLAIM_KEYS = new Set(['id', 'classification', 'statement', 'sourceIds']);

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function unknownKeys(value, allowed, label) {
  if (!isObject(value)) return [`${label} deve ser objeto`];
  return Object.keys(value)
    .filter((key) => !allowed.has(key))
    .map((key) => `${label} possui campo desconhecido: ${key}`);
}

function requireText(value, label, errors) {
  if (!isText(value)) errors.push(`${label} deve ser texto nao vazio`);
}

function requireIdentifier(value, label, errors) {
  if (!isText(value) || !IDENTIFIER.test(value)) {
    errors.push(`${label} deve ser identificador canonico`);
  }
}

function isDateTime(value) {
  if (!isText(value)) return false;
  const match = DATE_TIME.exec(value);
  if (!match || !isDate(match[1])) return false;
  const [, , hour, minute, second, zone, offsetHour, offsetMinute] = match;
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) {
    return false;
  }
  if (zone !== 'Z' && (Number(offsetHour) > 23 || Number(offsetMinute) > 59)) {
    return false;
  }
  return true;
}

function isDate(value) {
  if (!isText(value) || !DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function validateUniqueIds(items, label, errors) {
  const ids = new Set();
  items.forEach((item, index) => {
    if (!isObject(item)) return;
    requireIdentifier(item.id, `${label}[${index}].id`, errors);
    if (ids.has(item.id))
      errors.push(`${label}[${index}].id duplicado: ${item.id}`);
    ids.add(item.id);
  });
  return ids;
}

function validateTextList(value, label, errors, { required = false } = {}) {
  if (!Array.isArray(value) || (required && value.length === 0)) {
    errors.push(`${label} deve ser lista${required ? ' nao vazia' : ''}`);
    return;
  }
  value.forEach((item, index) =>
    requireText(item, `${label}[${index}]`, errors),
  );
  if (new Set(value).size !== value.length)
    errors.push(`${label} possui duplicatas`);
}

function validateEvidence(value, label, errors) {
  errors.push(...unknownKeys(value, EVIDENCE_KEYS, label));
  if (!isObject(value)) return;
  requireText(value.id, `${label}.id`, errors);
  if (!EVIDENCE_TYPES.has(value.type)) errors.push(`${label}.type invalido`);
  requireText(value.reference, `${label}.reference`, errors);
  if (!isDateTime(value.observedAt))
    errors.push(`${label}.observedAt invalido`);
  if (value.sha256 !== undefined && !SHA256.test(value.sha256)) {
    errors.push(`${label}.sha256 invalido`);
  }
}

function validateFinding(value, label, evidenceIds, errors) {
  errors.push(...unknownKeys(value, FINDING_KEYS, label));
  if (!isObject(value)) return;
  requireText(value.id, `${label}.id`, errors);
  if (!FINDING_SEVERITIES.has(value.severity))
    errors.push(`${label}.severity invalido`);
  requireText(value.criterion, `${label}.criterion`, errors);
  requireText(value.summary, `${label}.summary`, errors);
  requireText(value.recommendation, `${label}.recommendation`, errors);
  if (!FINDING_STATUSES.has(value.status))
    errors.push(`${label}.status invalido`);
  validateTextList(value.evidenceIds, `${label}.evidenceIds`, errors, {
    required: true,
  });
  if (Array.isArray(value.evidenceIds)) {
    value.evidenceIds.forEach((id) => {
      if (!evidenceIds.has(id))
        errors.push(`${label} referencia evidencia inexistente: ${id}`);
    });
  }
}

function validateResearch(value, label, errors) {
  errors.push(...unknownKeys(value, RESEARCH_KEYS, label));
  if (!isObject(value)) return;
  requireText(value.question, `${label}.question`, errors);
  requireText(value.audience, `${label}.audience`, errors);
  requireText(value.decisionOwner, `${label}.decisionOwner`, errors);
  if (!RECOMMENDATIONS.has(value.recommendation)) {
    errors.push(`${label}.recommendation invalida`);
  }
  if (!CONFIDENCE.has(value.confidence))
    errors.push(`${label}.confidence invalida`);

  if (!Array.isArray(value.sources) || value.sources.length === 0) {
    errors.push(`${label}.sources deve ser lista nao vazia`);
  }
  const sources = Array.isArray(value.sources) ? value.sources : [];
  const sourceIds = validateUniqueIds(sources, `${label}.sources`, errors);
  sources.forEach((source, index) => {
    const sourceLabel = `${label}.sources[${index}]`;
    errors.push(...unknownKeys(source, SOURCE_KEYS, sourceLabel));
    if (!isObject(source)) return;
    requireText(source.title, `${sourceLabel}.title`, errors);
    requireText(source.origin, `${sourceLabel}.origin`, errors);
    let sourceUrl;
    try {
      sourceUrl = new URL(source.url);
    } catch {
      sourceUrl = undefined;
    }
    if (
      !sourceUrl ||
      sourceUrl.protocol !== 'https:' ||
      !sourceUrl.hostname ||
      sourceUrl.username ||
      sourceUrl.password
    ) {
      errors.push(`${sourceLabel}.url deve usar https`);
    }
    if (!isDate(source.consultedAt))
      errors.push(`${sourceLabel}.consultedAt invalido`);
    if (source.publishedAt !== undefined && !isDate(source.publishedAt)) {
      errors.push(`${sourceLabel}.publishedAt invalido`);
    }
  });

  if (!Array.isArray(value.claims) || value.claims.length === 0) {
    errors.push(`${label}.claims deve ser lista nao vazia`);
  }
  const claims = Array.isArray(value.claims) ? value.claims : [];
  validateUniqueIds(claims, `${label}.claims`, errors);
  claims.forEach((claim, index) => {
    const claimLabel = `${label}.claims[${index}]`;
    errors.push(...unknownKeys(claim, CLAIM_KEYS, claimLabel));
    if (!isObject(claim)) return;
    if (!CLAIM_CLASSES.has(claim.classification)) {
      errors.push(`${claimLabel}.classification invalida`);
    }
    requireText(claim.statement, `${claimLabel}.statement`, errors);
    validateTextList(claim.sourceIds, `${claimLabel}.sourceIds`, errors, {
      required: claim.classification === 'fact',
    });
    if (Array.isArray(claim.sourceIds)) {
      claim.sourceIds.forEach((id) => {
        if (!sourceIds.has(id))
          errors.push(`${claimLabel} referencia fonte inexistente: ${id}`);
      });
    }
  });
}

function validateRecordShape(record, index, context, errors) {
  const label = `records[${index}]`;
  errors.push(...unknownKeys(record, RECORD_KEYS, label));
  if (!isObject(record)) return;
  ['recordId', 'executionId', 'workItemId', 'capabilityId'].forEach((field) =>
    requireIdentifier(record[field], `${label}.${field}`, errors),
  );
  if (!isDateTime(record.recordedAt))
    errors.push(`${label}.recordedAt invalido`);
  if (record.humanDecisionRequired !== true) {
    errors.push(`${label}.humanDecisionRequired deve ser true`);
  }

  errors.push(...unknownKeys(record.actor, ACTOR_KEYS, `${label}.actor`));
  if (isObject(record.actor)) {
    requireIdentifier(record.actor.id, `${label}.actor.id`, errors);
    requireIdentifier(record.actor.roleId, `${label}.actor.roleId`, errors);
  }
  errors.push(
    ...unknownKeys(record.artifact, ARTIFACT_KEYS, `${label}.artifact`),
  );
  if (isObject(record.artifact)) {
    ['type', 'id', 'version'].forEach((field) =>
      requireIdentifier(
        record.artifact[field],
        `${label}.artifact.${field}`,
        errors,
      ),
    );
    requireText(
      record.artifact.reference,
      `${label}.artifact.reference`,
      errors,
    );
  }
  errors.push(...unknownKeys(record.outcome, OUTCOME_KEYS, `${label}.outcome`));
  if (isObject(record.outcome)) {
    requireText(record.outcome.summary, `${label}.outcome.summary`, errors);
  }

  if (!Array.isArray(record.evidence) || record.evidence.length === 0) {
    errors.push(`${label}.evidence deve ser lista nao vazia`);
  }
  const evidence = Array.isArray(record.evidence) ? record.evidence : [];
  const evidenceIds = validateUniqueIds(evidence, `${label}.evidence`, errors);
  evidence.forEach((item, evidenceIndex) =>
    validateEvidence(item, `${label}.evidence[${evidenceIndex}]`, errors),
  );

  if (!Array.isArray(record.findings))
    errors.push(`${label}.findings deve ser lista`);
  const findings = Array.isArray(record.findings) ? record.findings : [];
  validateUniqueIds(findings, `${label}.findings`, errors);
  findings.forEach((finding, findingIndex) =>
    validateFinding(
      finding,
      `${label}.findings[${findingIndex}]`,
      evidenceIds,
      errors,
    ),
  );

  const capability = context.capabilityById.get(record.capabilityId);
  const role = isObject(record.actor)
    ? context.roleById.get(record.actor.roleId)
    : undefined;
  if (!capability) {
    errors.push(`${label}.capabilityId inexistente: ${record.capabilityId}`);
    return;
  }
  if (!ALLOWED_OPERATIONS.has(capability.operation)) {
    errors.push(
      `${label} usa operacao nao autorizada para registro: ${capability.operation}`,
    );
  }
  if (!role)
    errors.push(`${label}.actor.roleId inexistente: ${record.actor?.roleId}`);
  else if (!role.capabilities.includes(record.capabilityId)) {
    errors.push(
      `${label}.actor.roleId nao possui capability ${record.capabilityId}`,
    );
  }
  if (
    isObject(record.artifact) &&
    record.artifact.type !== capability.artifactType
  ) {
    errors.push(`${label}.artifact.type diverge da capability`);
  }
  if (
    !OUTCOME_BY_OPERATION[capability.operation]?.has(record.outcome?.status)
  ) {
    errors.push(
      `${label}.outcome.status invalido para ${capability.operation}`,
    );
  }

  const isChecker = ['review', 'verify'].includes(capability.operation);
  if (isChecker && !isText(record.subjectExecutionId)) {
    errors.push(`${label}.subjectExecutionId obrigatorio para checker`);
  } else if (isChecker) {
    requireIdentifier(
      record.subjectExecutionId,
      `${label}.subjectExecutionId`,
      errors,
    );
  }
  if (!isChecker && record.subjectExecutionId !== undefined) {
    errors.push(
      `${label}.subjectExecutionId proibido para ${capability.operation}`,
    );
  }
  if (capability.operation === 'research') {
    if (!record.research) errors.push(`${label}.research obrigatorio`);
    else validateResearch(record.research, `${label}.research`, errors);
  } else if (record.research !== undefined) {
    errors.push(`${label}.research permitido somente para pesquisa`);
  }
  if (
    record.outcome?.status === 'approved' &&
    findings.some((finding) => finding.status === 'open')
  ) {
    errors.push(`${label} aprovado nao pode conter finding aberto`);
  }
}

function sameArtifact(left, right) {
  return (
    isObject(left) &&
    isObject(right) &&
    left.type === right.type &&
    left.id === right.id &&
    left.version === right.version &&
    left.reference === right.reference
  );
}

function validateRecordSet(document, options = {}) {
  const model = options.model || loadCapabilityModel();
  const errors = unknownKeys(document, TOP_KEYS, 'documento');
  if (!isObject(document)) return errors;
  if (document.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`schemaVersion deve ser ${SCHEMA_VERSION}`);
  }
  if (!Array.isArray(document.records) || document.records.length === 0) {
    errors.push('records deve ser lista nao vazia');
    return errors;
  }

  const capabilityById = new Map(
    model.capabilities.map((capability) => [capability.id, capability]),
  );
  const roleById = new Map(model.roles.map((role) => [role.id, role]));
  const context = { capabilityById, roleById };
  const recordIds = new Set();
  const executionIds = new Set();
  const recordByExecution = new Map();
  document.records.forEach((record, index) => {
    validateRecordShape(record, index, context, errors);
    if (!isObject(record)) return;
    if (recordIds.has(record.recordId)) {
      errors.push(`records[${index}].recordId duplicado: ${record.recordId}`);
    }
    if (executionIds.has(record.executionId)) {
      errors.push(
        `records[${index}].executionId duplicado: ${record.executionId}`,
      );
    }
    recordIds.add(record.recordId);
    executionIds.add(record.executionId);
    recordByExecution.set(record.executionId, record);
  });

  document.records.forEach((record, index) => {
    if (!isObject(record) || !isText(record.subjectExecutionId)) return;
    const label = `records[${index}]`;
    const subject = recordByExecution.get(record.subjectExecutionId);
    if (!subject) {
      errors.push(
        `${label}.subjectExecutionId inexistente: ${record.subjectExecutionId}`,
      );
      return;
    }
    const rule = model.separationRules.find(
      (candidate) => candidate.checkerCapability === record.capabilityId,
    );
    if (!rule) {
      errors.push(`${label} nao possui regra de separacao para checker`);
      return;
    }
    if (subject.capabilityId !== rule.producerCapability) {
      errors.push(`${label} referencia capability produtora incorreta`);
    }
    if (!sameArtifact(record.artifact, subject.artifact)) {
      errors.push(
        `${label} diverge do artefato ou versao da execucao produtora`,
      );
    }
    if (
      isText(record.actor?.id) &&
      isText(subject.actor?.id) &&
      record.actor.id.trim().toLowerCase() ===
        subject.actor.id.trim().toLowerCase()
    ) {
      errors.push(`${label} deve usar ator distinto da execucao produtora`);
    }
    if (record.workItemId !== subject.workItemId) {
      errors.push(`${label} diverge do workItemId da execucao produtora`);
    }
  });
  return errors;
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function run() {
  const input = argument('--input');
  if (!input) {
    process.stderr.write('agent-execution-records: use --input <arquivo>\n');
    process.exitCode = 1;
    return;
  }
  let document;
  try {
    document = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
  } catch {
    process.stderr.write(
      'agent-execution-records: nao foi possivel ler ou interpretar a entrada\n',
    );
    process.exitCode = 1;
    return;
  }
  const errors = validateRecordSet(document);
  if (errors.length) {
    process.stderr.write(
      `agent-execution-records: entrada rejeitada (${errors.length} erros)\n`,
    );
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `agent-execution-records: ${document.records.length} registros validos\n`,
  );
}

if (require.main === module) run();

module.exports = { ROOT, SCHEMA_VERSION, validateRecordSet };
