const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { digest } = require('./document-catalog.cjs');
const { sha256 } = require('./governance-guidelines.cjs');

const MAX_BYTES = 64 * 1024 * 1024;
function check(value, message) {
  if (!value) throw new Error(message);
}
function safePath(name) {
  return (
    typeof name === 'string' &&
    /^[\w./-]+$/.test(name) &&
    !name.startsWith('-') &&
    !path.posix.isAbsolute(name) &&
    name.split('/').every((part) => part && part !== '.' && part !== '..')
  );
}
function excluded(name) {
  return name
    .split('/')
    .some(
      (part) =>
        /^(?:\.git|\.codex|\.agents|\.aws|\.ssh|\.gnupg|\.env.*|\.npmrc|auth\.json|SchoolContent|node_modules)$/i.test(
          part,
        ) || /\.(?:pem|key|p12|pfx)$/i.test(part),
    );
}
function allowedPaths(paths) {
  check(
    Array.isArray(paths) &&
      paths.length > 0 &&
      new Set(paths).size === paths.length,
    'informe arquivos explicitos e distintos',
  );
  check(
    paths.every((name) => safePath(name) && !excluded(name)),
    'caminho permitido invalido ou protegido',
  );
  for (const name of paths)
    check(
      !paths.some((other) => other !== name && other.startsWith(`${name}/`)),
      'escopo sobrepoe arquivo e diretorio',
    );
  return [...paths].sort();
}
function git(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    maxBuffer: MAX_BYTES,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
function head(root) {
  return git(root, ['rev-parse', 'HEAD']).toString().trim();
}
function sourceFiles(root, commit) {
  check(/^[a-f0-9]{40}$/.test(commit), 'commit invalido');
  const files = new Map();
  let size = 0;
  for (const record of git(root, ['ls-tree', '-r', '-z', commit])
    .toString()
    .split('\0')
    .filter(Boolean)) {
    const split = record.indexOf('\t');
    const [mode, type, oid] = record.slice(0, split).split(' ');
    const name = record.slice(split + 1);
    if (excluded(name)) continue;
    check(safePath(name), `caminho Git nao suportado: ${name}`);
    check(
      type === 'blob' && ['100644', '100755'].includes(mode),
      `tipo Git proibido na copia: ${name}`,
    );
    const bytes = git(root, ['cat-file', 'blob', oid]);
    size += bytes.length;
    check(size <= MAX_BYTES, 'copia excede limite de tamanho');
    files.set(name, { kind: 'file', sha256: sha256(bytes), mode, bytes });
  }
  return files;
}
function state(root, name) {
  check(safePath(name), 'caminho inseguro');
  let current = root;
  const parts = name.split('/');
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
    check(!stat.isSymbolicLink(), `symlink detectado: ${name}`);
    if (index < parts.length - 1)
      check(stat.isDirectory(), `ancestral irregular: ${name}`);
    else {
      check(
        stat.isFile() && stat.nlink === 1,
        `arquivo irregular ou hardlink: ${name}`,
      );
      check(stat.size <= MAX_BYTES, 'arquivo excede limite');
      const fd = fs.openSync(
        current,
        fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
      );
      try {
        const bytes = fs.readFileSync(fd);
        return {
          kind: 'file',
          sha256: sha256(bytes),
          mode: stat.mode & 0o111 ? '100755' : '100644',
          bytes,
        };
      } finally {
        fs.closeSync(fd);
      }
    }
  }
  throw new Error('estado invalido');
}
function projection(value) {
  if (!value) return null;
  return { kind: value.kind, sha256: value.sha256, mode: value.mode };
}
function equal(a, b) {
  return digest(projection(a)) === digest(projection(b));
}
function originals(root, source, scope) {
  for (const name of scope)
    check(
      equal(state(root, name), source.get(name)),
      `conflito no original: ${name}; voltar ao planejamento`,
    );
}
function prepare(root, commit, paths, directory) {
  root = fs.realpathSync(root);
  check(head(root) === commit, 'commit base mudou; voltar ao planejamento');
  const scope = allowedPaths(paths);
  const source = sourceFiles(root, commit);
  originals(root, source, scope);
  check(!fs.existsSync(directory), 'copia ja existe');
  fs.mkdirSync(directory, { mode: 0o700 });
  for (const [name, value] of source) {
    const target = path.join(directory, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, value.bytes, {
      flag: 'wx',
      mode: value.mode === '100755' ? 0o755 : 0o644,
    });
  }
  for (const name of scope)
    fs.mkdirSync(path.dirname(path.join(directory, name)), { recursive: true });
  return { root, commit, scope, source, directory: fs.realpathSync(directory) };
}
function scan(directory, allowedDirectories) {
  const files = new Map();
  let size = 0;
  const walk = (relative) => {
    for (const name of fs.readdirSync(path.join(directory, relative)).sort()) {
      const target = relative ? `${relative}/${name}` : name;
      check(
        safePath(target) && !excluded(target),
        `arquivo extra protegido: ${target}`,
      );
      const stat = fs.lstatSync(path.join(directory, target));
      check(!stat.isSymbolicLink(), `symlink no diff integral: ${target}`);
      if (stat.isDirectory()) {
        check(
          !allowedDirectories || allowedDirectories.has(target),
          `diretorio extra fora do escopo: ${target}`,
        );
        walk(target);
      } else {
        const value = state(directory, target);
        size += value.bytes.length;
        check(size <= MAX_BYTES, 'resultado excede limite');
        files.set(target, value);
      }
    }
  };
  walk('');
  return files;
}
function collect(prepared, work, contextSha256, runId) {
  const directories = new Set();
  for (const name of [...prepared.source.keys(), ...prepared.scope]) {
    const parts = name.split('/');
    while (parts.length > 1) {
      parts.pop();
      directories.add(parts.join('/'));
    }
  }
  const after = scan(prepared.directory, directories);
  const changes = [];
  for (const name of [
    ...new Set([...prepared.source.keys(), ...after.keys()]),
  ].sort()) {
    const before = prepared.source.get(name);
    const next = after.get(name);
    if (equal(before, next)) continue;
    check(prepared.scope.includes(name), `mudanca fora do escopo: ${name}`);
    changes.push({
      path: name,
      before: projection(before),
      after: next
        ? { ...projection(next), contentBase64: next.bytes.toString('base64') }
        : null,
    });
  }
  const payload = {
    schemaVersion: 'agent-change-v1',
    runId,
    baseCommit: prepared.commit,
    workSha256: digest(work),
    contextSha256,
    allowedPaths: prepared.scope,
    changes,
  };
  return { ...payload, sha256: digest(payload) };
}
function validateArtifact(artifact, expected, work, contextSha256) {
  const { sha256: hash, ...payload } = artifact;
  check(
    /^[a-f0-9]{64}$/.test(expected) &&
      hash === expected &&
      digest(payload) === hash,
    'hash da proposta diverge da revisao',
  );
  check(
    Object.keys(payload).sort().join(',') ===
      'allowedPaths,baseCommit,changes,contextSha256,runId,schemaVersion,workSha256',
    'campos da proposta invalidos',
  );
  check(
    payload.schemaVersion === 'agent-change-v1' &&
      payload.baseCommit === work.baseCommit &&
      payload.workSha256 === digest(work) &&
      payload.contextSha256 === contextSha256 &&
      digest(payload.allowedPaths) === digest(allowedPaths(work.allowedPaths)),
    'proposta diverge da ficha ou contexto',
  );
  check(
    typeof payload.runId === 'string' &&
      payload.runId.length > 0 &&
      Array.isArray(payload.changes),
    'proposta invalida',
  );
  const paths = new Set();
  let size = 0;
  for (const change of payload.changes) {
    check(
      Object.keys(change).sort().join(',') === 'after,before,path' &&
        payload.allowedPaths.includes(change.path) &&
        !paths.has(change.path),
      'mudanca duplicada ou fora do escopo',
    );
    paths.add(change.path);
    for (const [key, value] of [
      ['before', change.before],
      ['after', change.after],
    ]) {
      if (value === null) continue;
      check(
        value &&
          Object.keys(value).sort().join(',') ===
            (key === 'before'
              ? 'kind,mode,sha256'
              : 'contentBase64,kind,mode,sha256') &&
          value.kind === 'file' &&
          ['100644', '100755'].includes(value.mode) &&
          /^[a-f0-9]{64}$/.test(value.sha256),
        'tipo de mudanca invalido',
      );
      if (key === 'after') {
        check(typeof value.contentBase64 === 'string', 'conteudo ausente');
        const bytes = Buffer.from(value.contentBase64, 'base64');
        size += bytes.length;
        check(
          size <= MAX_BYTES &&
            bytes.toString('base64') === value.contentBase64 &&
            sha256(bytes) === value.sha256,
          'conteudo ou hash invalido',
        );
      }
    }
    check(!equal(change.before, change.after), 'mudanca vazia');
  }
}
function apply(root, artifact, expected, work, contextSha256) {
  root = fs.realpathSync(root);
  validateArtifact(artifact, expected, work, contextSha256);
  const lock = path.join(
    fs.realpathSync(os.tmpdir()),
    `quiz-agent-apply-${sha256(root)}.lock`,
  );
  fs.mkdirSync(lock, { mode: 0o700 });
  const applied = [];
  const createdDirectories = [];
  try {
    check(
      head(root) === work.baseCommit,
      'commit base mudou; voltar ao planejamento',
    );
    const source = sourceFiles(root, work.baseCommit);
    originals(root, source, artifact.allowedPaths);
    for (const change of artifact.changes)
      check(
        equal(change.before, source.get(change.path)),
        'estado anterior adulterado',
      );
    for (const change of artifact.changes) {
      check(
        equal(state(root, change.path), source.get(change.path)),
        `conflito no original: ${change.path}`,
      );
      const target = path.join(root, change.path);
      if (change.after) {
        let current = root;
        for (const part of change.path.split('/').slice(0, -1)) {
          current = path.join(current, part);
          if (!fs.existsSync(current)) {
            fs.mkdirSync(current);
            createdDirectories.push(current);
          }
          check(
            fs.lstatSync(current).isDirectory() &&
              !fs.lstatSync(current).isSymbolicLink(),
            'ancestral mudou',
          );
        }
        const staging = path.join(
          path.dirname(target),
          `.quiz-stage-${process.pid}-${applied.length}`,
        );
        let staged = false;
        try {
          const descriptor = fs.openSync(
            staging,
            'wx',
            change.after.mode === '100755' ? 0o755 : 0o644,
          );
          staged = true;
          try {
            fs.writeFileSync(
              descriptor,
              Buffer.from(change.after.contentBase64, 'base64'),
            );
          } finally {
            fs.closeSync(descriptor);
          }
          check(
            equal(state(root, change.path), source.get(change.path)),
            'original mudou durante aplicacao',
          );
          fs.renameSync(staging, target);
        } finally {
          if (staged && fs.existsSync(staging)) fs.unlinkSync(staging);
        }
      } else fs.unlinkSync(target);
      applied.push(change);
    }
    return {
      applied: applied.map((change) => change.path),
      artifactSha256: expected,
    };
  } catch (error) {
    const conflicts = [];
    for (const change of applied.reverse()) {
      const target = path.join(root, change.path);
      let unchanged = false;
      try {
        unchanged = equal(state(root, change.path), change.after);
      } catch {
        /* Uma entrada substituida tambem deve ser preservada. */
      }
      if (!unchanged) {
        conflicts.push(change.path);
        continue;
      }
      if (change.before) {
        const bytes = git(root, ['show', `${work.baseCommit}:${change.path}`]);
        fs.writeFileSync(target, bytes, {
          mode: change.before.mode === '100755' ? 0o755 : 0o644,
        });
        fs.chmodSync(target, change.before.mode === '100755' ? 0o755 : 0o644);
      } else fs.unlinkSync(target);
    }
    for (const directory of createdDirectories.reverse())
      if (!fs.readdirSync(directory).length) fs.rmdirSync(directory);
    if (conflicts.length)
      throw new Error(
        `${error.message}; conflito durante rollback: ${conflicts.join(', ')}; preservar e revisar manualmente`,
        { cause: error },
      );
    throw error;
  } finally {
    fs.rmdirSync(lock);
  }
}
module.exports = {
  allowedPaths,
  prepare,
  collect,
  apply,
  scan,
  state,
  sourceFiles,
  validateArtifact,
};
