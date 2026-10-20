const fs = require('node:fs');
const path = require('node:path');
const { sha256 } = require('./governance-guidelines.cjs');
const { digest, ROOT } = require('./document-catalog.cjs');
const { analyzeEvents } = require('./agent-cli-events.cjs');
const LIMIT = 16 * 1024 * 1024;
function readBytes(file, limit = LIMIT) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.nlink !== 1 || stat.size > limit)
      throw new Error('captura irregular ou excessiva');
    return fs.readFileSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}
function writeBytes(file, bytes) {
  const fd = fs.openSync(
    file,
    fs.constants.O_WRONLY |
      fs.constants.O_CREAT |
      fs.constants.O_EXCL |
      fs.constants.O_NOFOLLOW,
    0o600,
  );
  try {
    fs.writeFileSync(fd, bytes);
  } finally {
    fs.closeSync(fd);
  }
}
function createCapture(output, allowedTools = [], context = {}) {
  const parent = fs.realpathSync(path.dirname(output));
  const repository = fs.realpathSync(ROOT);
  if (parent === repository || parent.startsWith(repository + path.sep))
    throw new Error('captura deve ficar fora do checkout');
  const directory = `${output}.capture`;
  fs.mkdirSync(directory, { mode: 0o700 });
  const descriptors = {};
  try {
    for (const name of ['stdout', 'stderr'])
      descriptors[name] = fs.openSync(
        path.join(directory, `${name}.${name === 'stdout' ? 'jsonl' : 'txt'}`),
        fs.constants.O_WRONLY |
          fs.constants.O_CREAT |
          fs.constants.O_EXCL |
          fs.constants.O_NOFOLLOW,
        0o600,
      );
  } catch (error) {
    for (const fd of Object.values(descriptors)) fs.closeSync(fd);
    throw error;
  }
  let bytes = 0,
    truncated = false,
    closed = false,
    exitCode = null,
    processError = null,
    manifest;
  const files = {};
  function append(stream, value) {
    if (closed) throw new Error('captura encerrada');
    const chunk = value.subarray(0, Math.max(0, LIMIT - bytes));
    let offset = 0;
    while (offset < chunk.length)
      offset += fs.writeSync(
        descriptors[stream],
        chunk,
        offset,
        chunk.length - offset,
      );
    bytes += chunk.length;
    if (chunk.length !== value.length) truncated = true;
  }
  function complete(code, error) {
    if (closed) return;
    exitCode = code;
    processError ||= error ? 'process_failure' : null;
    for (const fd of Object.values(descriptors)) fs.closeSync(fd);
    closed = true;
  }
  function save(name, value) {
    if (!['response.json', 'proposal.json'].includes(name))
      throw new Error('arquivo de captura nao autorizado');
    const raw = Buffer.isBuffer(value)
      ? value
      : Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
    try {
      if (raw.length > LIMIT) throw new Error('resposta de captura excessiva');
      writeBytes(path.join(directory, name), raw);
    } catch (error) {
      processError = 'capture_failure';
      throw error;
    }
  }
  function finish(finalFile) {
    if (manifest) return manifest;
    complete(exitCode, processError);
    if (finalFile) {
      try {
        save('response.json', readBytes(finalFile));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    for (const name of fs.readdirSync(directory)) {
      if (
        ![
          'stdout.jsonl',
          'stderr.txt',
          'response.json',
          'proposal.json',
        ].includes(name)
      )
        throw new Error('arquivo estranho na captura');
      const raw = readBytes(path.join(directory, name));
      files[name] = { sha256: sha256(raw), bytes: raw.length };
    }
    const diagnosis = analyzeEvents(
      readBytes(path.join(directory, 'stdout.jsonl')).toString('utf8'),
      allowedTools,
      context,
    );
    const payload = {
      schemaVersion: 'agent-event-capture-v1',
      files,
      exitCode,
      processError,
      truncated,
      diagnosis,
    };
    manifest = { ...payload, sha256: digest(payload) };
    writeBytes(
      path.join(directory, 'manifest.json'),
      Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`),
    );
    return manifest;
  }
  return { append, complete, save, finish };
}
function verifyCapture(output, expectedHash) {
  const directory = `${output}.capture`;
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink() || stat.mode & 0o077)
    throw new Error('diretorio de captura irregular');
  const manifest = JSON.parse(readBytes(path.join(directory, 'manifest.json')));
  const { sha256: hash, ...payload } = manifest;
  if (
    hash !== expectedHash ||
    hash !== digest(payload) ||
    manifest.schemaVersion !== 'agent-event-capture-v1'
  )
    throw new Error('manifesto de captura divergente');
  if (!manifest.files?.['stdout.jsonl'] || !manifest.files?.['stderr.txt'])
    throw new Error('captura incompleta');
  const expected = ['manifest.json', ...Object.keys(manifest.files)].sort();
  if (
    JSON.stringify(fs.readdirSync(directory).sort()) !==
    JSON.stringify(expected)
  )
    throw new Error('arquivos da captura divergentes');
  for (const [name, state] of Object.entries(manifest.files)) {
    if (
      ![
        'stdout.jsonl',
        'stderr.txt',
        'response.json',
        'proposal.json',
      ].includes(name)
    )
      throw new Error('caminho de captura nao autorizado');
    const raw = readBytes(path.join(directory, name));
    if (sha256(raw) !== state.sha256 || raw.length !== state.bytes)
      throw new Error('captura alterada');
  }
  return { directory, manifest };
}
module.exports = { LIMIT, createCapture, verifyCapture, readBytes, writeBytes };
