const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  SCHEMA_VERSION: RECORD_SET_SCHEMA,
  validateRecordSet,
} = require('./agent-execution-records.cjs');

const ROOT = path.resolve(__dirname, '..');
const LEDGER_SCHEMA = 'agent-execution-ledger-v1';
const BUNDLE_SCHEMA = 'agent-execution-sync-bundle-v1';
const AUDIT_SCHEMA = 'agent-execution-audit-report-v1';
const MAX_INPUT_BYTES = 16 * 1024 * 1024;
const LEDGER_FILE = 'ledger.json';
const LOCK_FILE = 'ledger.lock';
const TEMP_FILE = 'ledger.next.json';
const SHA256 = /^[a-f0-9]{64}$/;
const LEDGER_KEYS = new Set(['schemaVersion', 'revisions']);
const REVISION_KEYS = new Set([
  'revision',
  'previousSha256',
  'addedRecords',
  'sha256',
]);
const BUNDLE_KEYS = new Set(['schemaVersion', 'recordSet', 'sha256']);
const RECORD_SET_KEYS = new Set(['schemaVersion', 'records']);
const ATTENTION_OUTCOMES = new Set([
  'adjustments-required',
  'blocked',
  'failed',
]);

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

function serialize(value) {
  return `${JSON.stringify(stableValue(value), null, 2)}\n`;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function unknownKeys(value, allowed, label) {
  if (!isObject(value)) return [`${label} deve ser objeto`];
  return Object.keys(value)
    .filter((key) => !allowed.has(key))
    .map((key) => `${label} possui campo desconhecido: ${key}`);
}

function compareRecords(left, right) {
  return `${left?.recordId || ''}\0${left?.executionId || ''}`.localeCompare(
    `${right?.recordId || ''}\0${right?.executionId || ''}`,
  );
}

function canonicalRecords(records) {
  return [...records].sort(compareRecords).map(stableValue);
}

function canonicalRecordSet(records) {
  return {
    schemaVersion: RECORD_SET_SCHEMA,
    records: canonicalRecords(records),
  };
}

function revisionPayload(revision) {
  return {
    revision: revision.revision,
    previousSha256: revision.previousSha256,
    addedRecords: canonicalRecords(revision.addedRecords),
  };
}

function buildRevision(number, previousSha256, records) {
  const payload = {
    revision: number,
    previousSha256,
    addedRecords: canonicalRecords(records),
  };
  return { ...payload, sha256: sha256(serialize(payload)) };
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  );
}

function assertExternalDirectory(
  directory,
  { empty = false, lock = false } = {},
) {
  if (typeof directory !== 'string' || !directory.trim()) {
    throw new Error('ledger-dir obrigatorio');
  }
  const absolute = path.resolve(directory);
  const stat = fs.lstatSync(absolute);
  if (stat.isSymbolicLink()) throw new Error('ledger-dir nao pode ser symlink');
  if (!stat.isDirectory()) throw new Error('ledger-dir deve ser diretorio');
  const realDirectory = fs.realpathSync(absolute);
  const realRepository = fs.realpathSync(ROOT);
  if (isInside(realRepository, realDirectory)) {
    throw new Error('ledger-dir deve ficar fora do repositorio');
  }
  const entries = fs.readdirSync(realDirectory).sort();
  const expected = empty ? [] : lock ? [LEDGER_FILE, LOCK_FILE] : [LEDGER_FILE];
  if (
    entries.length !== expected.length ||
    entries.some((entry, index) => entry !== expected[index])
  ) {
    throw new Error(
      empty
        ? 'ledger-dir deve estar vazio'
        : 'ledger-dir possui arquivo ausente ou extra',
    );
  }
  return realDirectory;
}

function readRegularFile(filePath, label) {
  let descriptor;
  try {
    descriptor = fs.openSync(
      filePath,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
    );
    const opened = fs.fstatSync(descriptor);
    if (!opened.isFile()) throw new Error(`${label} deve ser arquivo regular`);
    if (opened.size > MAX_INPUT_BYTES)
      throw new Error(`${label} excede limite`);
    const content = fs.readFileSync(descriptor);
    if (content.length > MAX_INPUT_BYTES)
      throw new Error(`${label} excede limite`);
    return content.toString('utf8');
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function readJson(filePath, label) {
  try {
    return JSON.parse(readRegularFile(path.resolve(filePath), label));
  } catch (error) {
    throw new Error(`${label} invalido: ${error.message}`, { cause: error });
  }
}

function validateLedger(ledger) {
  const errors = unknownKeys(ledger, LEDGER_KEYS, 'ledger');
  if (!isObject(ledger)) return { errors, recordSet: undefined };
  if (ledger.schemaVersion !== LEDGER_SCHEMA) {
    errors.push(`ledger.schemaVersion deve ser ${LEDGER_SCHEMA}`);
  }
  if (!Array.isArray(ledger.revisions) || ledger.revisions.length === 0) {
    errors.push('ledger.revisions deve ser lista nao vazia');
    return { errors, recordSet: undefined };
  }

  let previousSha256 = null;
  let records = [];
  ledger.revisions.forEach((revision, index) => {
    const label = `ledger.revisions[${index}]`;
    errors.push(...unknownKeys(revision, REVISION_KEYS, label));
    if (!isObject(revision)) return;
    if (revision.revision !== index + 1) {
      errors.push(`${label}.revision fora de ordem`);
    }
    if (revision.previousSha256 !== previousSha256) {
      errors.push(`${label}.previousSha256 diverge da revisao anterior`);
    }
    if (
      !Array.isArray(revision.addedRecords) ||
      revision.addedRecords.length === 0
    ) {
      errors.push(`${label}.addedRecords deve ser lista nao vazia`);
    } else {
      const canonical = canonicalRecords(revision.addedRecords);
      if (
        revision.addedRecords.some((record) => !isObject(record)) ||
        canonical.map((record) => record.recordId).join('\0') !==
          revision.addedRecords.map((record) => record.recordId).join('\0')
      ) {
        errors.push(`${label}.addedRecords deve usar ordem canonica`);
      }
      records = [...records, ...revision.addedRecords];
      validateRecordSet(canonicalRecordSet(records)).forEach((error) =>
        errors.push(`${label}: ${error}`),
      );
    }
    const expectedHash = Array.isArray(revision.addedRecords)
      ? sha256(serialize(revisionPayload(revision)))
      : undefined;
    if (
      !SHA256.test(revision.sha256 || '') ||
      revision.sha256 !== expectedHash
    ) {
      errors.push(`${label}.sha256 diverge do conteudo`);
    }
    previousSha256 = revision.sha256;
  });

  return {
    errors,
    recordSet: canonicalRecordSet(records),
    ledgerSha256: previousSha256,
  };
}

function validateBundle(bundle) {
  const errors = unknownKeys(bundle, BUNDLE_KEYS, 'bundle');
  if (!isObject(bundle)) return errors;
  if (bundle.schemaVersion !== BUNDLE_SCHEMA) {
    errors.push(`bundle.schemaVersion deve ser ${BUNDLE_SCHEMA}`);
  }
  const recordErrors = validateRecordSet(bundle.recordSet);
  errors.push(...recordErrors.map((error) => `bundle.recordSet: ${error}`));
  if (isObject(bundle.recordSet) && Array.isArray(bundle.recordSet.records)) {
    const receivedOrder = bundle.recordSet.records.map(
      (record) => `${record?.recordId || ''}\0${record?.executionId || ''}`,
    );
    const canonicalOrder = canonicalRecords(bundle.recordSet.records).map(
      (record) => `${record?.recordId || ''}\0${record?.executionId || ''}`,
    );
    if (receivedOrder.join('\0') !== canonicalOrder.join('\0')) {
      errors.push('bundle.recordSet deve usar ordem canonica');
    }
  }
  if (!SHA256.test(bundle.sha256 || '')) {
    errors.push('bundle.sha256 invalido');
  } else if (
    isObject(bundle.recordSet) &&
    Array.isArray(bundle.recordSet.records) &&
    bundle.sha256 !==
      sha256(serialize(canonicalRecordSet(bundle.recordSet.records || [])))
  ) {
    errors.push('bundle.sha256 diverge do recordSet');
  }
  return errors;
}

function loadLedger(directory, { lock = false } = {}) {
  const realDirectory = assertExternalDirectory(directory, { lock });
  const ledger = readJson(path.join(realDirectory, LEDGER_FILE), 'ledger');
  const validation = validateLedger(ledger);
  if (validation.errors.length) throw new Error(validation.errors.join('\n'));
  return { ...validation, ledger, realDirectory };
}

function assertNewExternalFile(outputPath, ledgerDirectory) {
  if (typeof outputPath !== 'string' || !outputPath.trim()) {
    throw new Error('arquivo de saida obrigatorio');
  }
  const absolute = path.resolve(outputPath);
  const parent = path.dirname(absolute);
  const parentStat = fs.lstatSync(parent);
  if (parentStat.isSymbolicLink())
    throw new Error('diretorio pai nao pode ser symlink');
  if (!parentStat.isDirectory()) throw new Error('diretorio pai deve existir');
  const realParent = fs.realpathSync(parent);
  const realRepository = fs.realpathSync(ROOT);
  if (isInside(realRepository, realParent)) {
    throw new Error('arquivo de saida deve ficar fora do repositorio');
  }
  if (
    ledgerDirectory &&
    isInside(fs.realpathSync(ledgerDirectory), realParent)
  ) {
    throw new Error('arquivo de saida nao pode ficar no ledger-dir');
  }
  return path.join(realParent, path.basename(absolute));
}

function writeNewFile(filePath, content) {
  if (Buffer.byteLength(content, 'utf8') > MAX_INPUT_BYTES) {
    throw new Error('arquivo de saida excede limite');
  }
  let descriptor;
  let created = false;
  try {
    descriptor = fs.openSync(filePath, 'wx', 0o600);
    created = true;
    fs.writeFileSync(descriptor, content, 'utf8');
    fs.fsyncSync(descriptor);
  } catch (error) {
    if (descriptor !== undefined) {
      fs.closeSync(descriptor);
      descriptor = undefined;
    }
    if (
      created &&
      fs.existsSync(filePath) &&
      !fs.lstatSync(filePath).isSymbolicLink()
    ) {
      fs.unlinkSync(filePath);
    }
    if (error.code === 'EEXIST') {
      throw new Error('arquivo de saida ja existe', { cause: error });
    }
    throw error;
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function fsyncDirectory(directory) {
  let descriptor;
  try {
    descriptor = fs.openSync(directory, fs.constants.O_RDONLY);
    fs.fsyncSync(descriptor);
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function withLedgerLock(directory, operation) {
  const realDirectory = assertExternalDirectory(directory);
  const lockPath = path.join(realDirectory, LOCK_FILE);
  let descriptor;
  let acquired = false;
  try {
    descriptor = fs.openSync(lockPath, 'wx', 0o600);
    acquired = true;
    fs.closeSync(descriptor);
    descriptor = undefined;
    return operation(realDirectory);
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (
      acquired &&
      fs.existsSync(lockPath) &&
      !fs.lstatSync(lockPath).isSymbolicLink()
    ) {
      fs.unlinkSync(lockPath);
    }
  }
}

function replaceLedger(realDirectory, ledger) {
  const temporary = path.join(realDirectory, TEMP_FILE);
  const target = path.join(realDirectory, LEDGER_FILE);
  try {
    writeNewFile(temporary, serialize(ledger));
    fs.renameSync(temporary, target);
    fsyncDirectory(realDirectory);
  } catch (error) {
    if (fs.existsSync(temporary) && !fs.lstatSync(temporary).isSymbolicLink()) {
      fs.unlinkSync(temporary);
    }
    throw error;
  }
}

function readRecordSet(inputPath) {
  const recordSet = readJson(inputPath, 'record-set');
  return recordSet;
}

function initializeLedger(directory, recordSet) {
  const errors = validateRecordSet(recordSet);
  if (errors.length) throw new Error(errors.join('\n'));
  const realDirectory = assertExternalDirectory(directory, { empty: true });
  const lockPath = path.join(realDirectory, LOCK_FILE);
  let locked = false;
  try {
    const descriptor = fs.openSync(lockPath, 'wx', 0o600);
    fs.closeSync(descriptor);
    locked = true;
    const entries = fs.readdirSync(realDirectory);
    if (entries.length !== 1 || entries[0] !== LOCK_FILE) {
      throw new Error('ledger-dir mudou durante inicializacao');
    }
    const revision = buildRevision(1, null, recordSet.records);
    const ledger = { schemaVersion: LEDGER_SCHEMA, revisions: [revision] };
    writeNewFile(path.join(realDirectory, LEDGER_FILE), serialize(ledger));
    fsyncDirectory(realDirectory);
    return {
      ledgerSha256: revision.sha256,
      revision: 1,
      recordCount: revision.addedRecords.length,
    };
  } finally {
    if (locked && fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
  }
}

function sameRecord(left, right) {
  return serialize(left) === serialize(right);
}

function mergeRecordSets(existing, incoming) {
  if (
    !isObject(incoming) ||
    unknownKeys(incoming, RECORD_SET_KEYS, 'record-set').length ||
    incoming.schemaVersion !== RECORD_SET_SCHEMA
  ) {
    throw new Error('record-set possui schema invalido');
  }
  if (!Array.isArray(incoming.records) || incoming.records.length === 0) {
    throw new Error('record-set deve possuir registros');
  }
  if (incoming.records.some((record) => !isObject(record))) {
    throw new Error('record-set possui registro invalido');
  }
  const incomingRecordIds = new Set();
  const incomingExecutionIds = new Set();
  incoming.records.forEach((record) => {
    if (
      incomingRecordIds.has(record.recordId) ||
      incomingExecutionIds.has(record.executionId)
    ) {
      throw new Error('record-set possui identificador duplicado');
    }
    incomingRecordIds.add(record.recordId);
    incomingExecutionIds.add(record.executionId);
  });
  const byRecordId = new Map(
    existing.records.map((record) => [record.recordId, record]),
  );
  const byExecutionId = new Map(
    existing.records.map((record) => [record.executionId, record]),
  );
  const added = [];
  incoming.records.forEach((record) => {
    const recordMatch = byRecordId.get(record.recordId);
    const executionMatch = byExecutionId.get(record.executionId);
    if (recordMatch || executionMatch) {
      if (
        recordMatch &&
        executionMatch &&
        recordMatch === executionMatch &&
        sameRecord(recordMatch, record)
      ) {
        return;
      }
      throw new Error('conflito de recordId ou executionId');
    }
    added.push(record);
    byRecordId.set(record.recordId, record);
    byExecutionId.set(record.executionId, record);
  });
  const combined = canonicalRecordSet([...existing.records, ...added]);
  const errors = validateRecordSet(combined);
  if (errors.length) throw new Error(errors.join('\n'));
  return { added: canonicalRecords(added), combined };
}

function appendRecordSet(directory, recordSet, { dryRun = false } = {}) {
  const execute = (current) => {
    const merge = mergeRecordSets(current.recordSet, recordSet);
    if (!merge.added.length) {
      return {
        changed: false,
        addedCount: 0,
        revision: current.ledger.revisions.length,
        ledgerSha256: current.ledgerSha256,
      };
    }
    const revision = buildRevision(
      current.ledger.revisions.length + 1,
      current.ledgerSha256,
      merge.added,
    );
    if (!dryRun) {
      replaceLedger(current.realDirectory, {
        schemaVersion: LEDGER_SCHEMA,
        revisions: [...current.ledger.revisions, revision],
      });
    }
    return {
      changed: true,
      addedCount: merge.added.length,
      revision: revision.revision,
      ledgerSha256: revision.sha256,
    };
  };

  if (dryRun) return execute(loadLedger(directory));
  return withLedgerLock(directory, (realDirectory) =>
    execute(loadLedger(realDirectory, { lock: true })),
  );
}

function createBundle(recordSet) {
  const canonical = canonicalRecordSet(recordSet.records);
  return {
    schemaVersion: BUNDLE_SCHEMA,
    recordSet: canonical,
    sha256: sha256(serialize(canonical)),
  };
}

function exportBundle(directory, outputPath) {
  const current = loadLedger(directory);
  const bundle = createBundle(current.recordSet);
  const output = assertNewExternalFile(outputPath, current.realDirectory);
  writeNewFile(output, serialize(bundle));
  return { bundle, output };
}

function syncBundle(directory, bundle, options = {}) {
  const errors = validateBundle(bundle);
  if (errors.length) throw new Error(errors.join('\n'));
  return appendRecordSet(directory, bundle.recordSet, options);
}

function counts(items) {
  const values = new Map();
  items.forEach((item) => values.set(item, (values.get(item) || 0) + 1));
  return [...values]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([id, count]) => ({ id, count }));
}

function createAuditReport(validation) {
  const records = validation.recordSet.records;
  const findings = records.flatMap((record) =>
    record.findings.map((finding) => ({ record, finding })),
  );
  const openFindings = findings
    .filter(({ finding }) => finding.status === 'open')
    .map(({ record, finding }) => ({
      recordId: record.recordId,
      findingId: finding.id,
      severity: finding.severity,
    }))
    .sort((left, right) =>
      `${left.recordId}\0${left.findingId}`.localeCompare(
        `${right.recordId}\0${right.findingId}`,
      ),
    );
  const attention =
    openFindings.length > 0 ||
    records.some((record) => ATTENTION_OUTCOMES.has(record.outcome.status));
  return {
    schemaVersion: AUDIT_SCHEMA,
    ledgerSha256: validation.ledgerSha256,
    revisionCount: validation.ledger.revisions.length,
    recordCount: records.length,
    status: attention ? 'attention-required' : 'clean',
    outcomes: counts(records.map((record) => record.outcome.status)),
    findingSeverities: counts(findings.map(({ finding }) => finding.severity)),
    openFindings,
  };
}

function auditLedger(directory, outputPath) {
  const validation = loadLedger(directory);
  const report = createAuditReport(validation);
  if (outputPath) {
    const output = assertNewExternalFile(outputPath, validation.realDirectory);
    writeNewFile(output, serialize(report));
  }
  return report;
}

function parseOptions(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--dry-run') {
      if (options.dryRun) throw new Error('--dry-run duplicado');
      options.dryRun = true;
      continue;
    }
    if (!['--ledger-dir', '--input', '--output'].includes(argument)) {
      throw new Error(`argumento desconhecido: ${argument}`);
    }
    const value = args[index + 1];
    if (!value || value.startsWith('--'))
      throw new Error(`${argument} exige valor`);
    const key = {
      '--ledger-dir': 'ledgerDirectory',
      '--input': 'input',
      '--output': 'output',
    }[argument];
    if (options[key]) throw new Error(`${argument} duplicado`);
    options[key] = value;
    index += 1;
  }
  return options;
}

function requireExactOptions(command, options, required, optional = []) {
  required.forEach((key) => {
    if (!options[key]) throw new Error(`${command} exige ${key}`);
  });
  const allowed = new Set([...required, ...optional]);
  Object.keys(options).forEach((key) => {
    if (!allowed.has(key)) throw new Error(`${command} nao aceita ${key}`);
  });
}

function main(args = process.argv.slice(2)) {
  const command = args[0];
  const options = parseOptions(args.slice(1));
  if (command === 'init') {
    requireExactOptions(command, options, ['ledgerDirectory', 'input']);
    const result = initializeLedger(
      options.ledgerDirectory,
      readRecordSet(options.input),
    );
    process.stdout.write(
      `agent-record-ledger: initialized revision ${result.revision} (${result.recordCount} records)\n`,
    );
    return;
  }
  if (command === 'append') {
    requireExactOptions(
      command,
      options,
      ['ledgerDirectory', 'input'],
      ['dryRun'],
    );
    const result = appendRecordSet(
      options.ledgerDirectory,
      readRecordSet(options.input),
      { dryRun: options.dryRun === true },
    );
    process.stdout.write(
      `agent-record-ledger: ${options.dryRun ? 'would append' : 'appended'} ${result.addedCount} records\n`,
    );
    return;
  }
  if (command === 'audit') {
    requireExactOptions(command, options, ['ledgerDirectory'], ['output']);
    const report = auditLedger(options.ledgerDirectory, options.output);
    process.stdout.write(
      `agent-record-ledger: ${report.status} (${report.recordCount} records, ${report.revisionCount} revisions)\n`,
    );
    return;
  }
  if (command === 'export') {
    requireExactOptions(command, options, ['ledgerDirectory', 'output']);
    const result = exportBundle(options.ledgerDirectory, options.output);
    process.stdout.write(
      `agent-record-ledger: exported ${result.bundle.recordSet.records.length} records\n`,
    );
    return;
  }
  if (command === 'sync') {
    requireExactOptions(
      command,
      options,
      ['ledgerDirectory', 'input'],
      ['dryRun'],
    );
    const bundle = readJson(options.input, 'bundle');
    const result = syncBundle(options.ledgerDirectory, bundle, {
      dryRun: options.dryRun === true,
    });
    process.stdout.write(
      `agent-record-ledger: ${options.dryRun ? 'would sync' : 'synced'} ${result.addedCount} records\n`,
    );
    return;
  }
  throw new Error('comando deve ser init, append, audit, export ou sync');
}

if (require.main === module) {
  try {
    main();
  } catch {
    process.stderr.write('agent-record-ledger: operation failed\n');
    process.exitCode = 1;
  }
}

module.exports = {
  AUDIT_SCHEMA,
  BUNDLE_SCHEMA,
  LEDGER_SCHEMA,
  MAX_INPUT_BYTES,
  appendRecordSet,
  auditLedger,
  buildRevision,
  canonicalRecordSet,
  createAuditReport,
  createBundle,
  exportBundle,
  initializeLedger,
  loadLedger,
  mergeRecordSets,
  serialize,
  sha256,
  syncBundle,
  validateBundle,
  validateLedger,
};
