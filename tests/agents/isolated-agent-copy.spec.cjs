const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const copy = require('../../scripts/agent-isolated-copy.cjs');
const { digest } = require('../../scripts/document-catalog.cjs');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-copy-test-'));
const root = path.join(directory, 'repo');
fs.mkdirSync(root);
const git = (...args) =>
  execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const write = (name, value) => {
  fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
  fs.writeFileSync(path.join(root, name), value);
};
try {
  git('init', '--quiet');
  for (const [name, value] of Object.entries({
    'package.json': '{}',
    'edit.txt': 'original',
    'delete.txt': 'remover',
    'unchanged.txt': 'preservar',
    '.env': 'segredo ficticio',
    '.codex/config.toml': 'config ficticia',
    'SchoolContent/source.txt': 'material ficticio',
  }))
    write(name, value);
  git('add', '.');
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'Cria fixture',
  );
  const commit = git('rev-parse', 'HEAD').toString().trim();
  write('untracked.txt', 'nao copiar');
  let sequence = 0;
  const prepare = () =>
    copy.prepare(
      root,
      commit,
      ['edit.txt', 'delete.txt', 'new/nested.txt'],
      path.join(directory, `copy-${sequence++}`),
    );
  const prepared = prepare();
  for (const name of [
    '.git',
    '.codex',
    '.env',
    'SchoolContent',
    'untracked.txt',
  ])
    assert.equal(
      fs.existsSync(path.join(prepared.directory, name)),
      false,
      name,
    );
  const work = { baseCommit: commit, allowedPaths: prepared.scope };
  const context = 'a'.repeat(64);
  fs.writeFileSync(path.join(prepared.directory, 'edit.txt'), 'alterado');
  fs.chmodSync(path.join(prepared.directory, 'edit.txt'), 0o755);
  fs.unlinkSync(path.join(prepared.directory, 'delete.txt'));
  fs.writeFileSync(
    path.join(prepared.directory, 'new/nested.txt'),
    Buffer.from([0, 255, 10]),
  );
  const artifact = copy.collect(prepared, work, context, 'run-fixture');
  assert.deepEqual(
    artifact.changes.map((item) => item.path),
    ['delete.txt', 'edit.txt', 'new/nested.txt'],
  );
  assert.equal(artifact.changes[0].after, null);
  assert.equal(artifact.changes[1].after.mode, '100755');
  assert.equal(
    fs.readFileSync(path.join(root, 'edit.txt'), 'utf8'),
    'original',
  );
  assert.throws(
    () => copy.apply(root, artifact, 'b'.repeat(64), work, context),
    /hash/,
  );
  assert.throws(
    () => copy.apply(root, artifact, artifact.sha256, work, 'c'.repeat(64)),
    /contexto/,
  );
  write('new/nested.txt', 'arquivo novo do usuario');
  assert.throws(
    () => copy.apply(root, artifact, artifact.sha256, work, context),
    /conflito/,
  );
  assert.equal(
    fs.readFileSync(path.join(root, 'edit.txt'), 'utf8'),
    'original',
  );
  fs.unlinkSync(path.join(root, 'new/nested.txt'));
  write('edit.txt', 'mudanca do usuario');
  assert.throws(prepare, /conflito/);
  assert.throws(
    () => copy.apply(root, artifact, artifact.sha256, work, context),
    /conflito/,
  );
  write('edit.txt', 'original');

  const lock = path.join(
    fs.realpathSync(os.tmpdir()),
    `quiz-agent-apply-${require('../../scripts/governance-guidelines.cjs').sha256(fs.realpathSync(root))}.lock`,
  );
  fs.mkdirSync(lock);
  assert.throws(
    () => copy.apply(root, artifact, artifact.sha256, work, context),
    /EEXIST/,
  );
  fs.rmdirSync(lock);
  const staging = path.join(root, `.quiz-stage-${process.pid}-1`);
  fs.writeFileSync(staging, 'arquivo preexistente');
  assert.throws(
    () => copy.apply(root, artifact, artifact.sha256, work, context),
    /EEXIST/,
  );
  assert.equal(fs.readFileSync(staging, 'utf8'), 'arquivo preexistente');
  assert.equal(
    fs.readFileSync(path.join(root, 'delete.txt'), 'utf8'),
    'remover',
  );
  fs.unlinkSync(staging);
  const rename = fs.renameSync;
  try {
    fs.renameSync = () => {
      write('delete.txt', 'edicao concorrente do usuario');
      throw Object.assign(new Error('falha de permissao simulada'), {
        code: 'EACCES',
      });
    };
    assert.throws(
      () => copy.apply(root, artifact, artifact.sha256, work, context),
      /conflito durante rollback/,
    );
    assert.equal(
      fs.readFileSync(path.join(root, 'delete.txt'), 'utf8'),
      'edicao concorrente do usuario',
    );
    assert.equal(
      fs.readFileSync(path.join(root, 'edit.txt'), 'utf8'),
      'original',
    );
  } finally {
    fs.renameSync = rename;
  }
  write('delete.txt', 'remover');
  const applied = copy.apply(root, artifact, artifact.sha256, work, context);
  assert.equal(applied.applied.length, 3);
  assert.equal(
    fs.readFileSync(path.join(root, 'edit.txt'), 'utf8'),
    'alterado',
  );
  assert.equal(fs.statSync(path.join(root, 'edit.txt')).mode & 0o111, 0o111);
  assert.deepEqual(
    fs.readFileSync(path.join(root, 'new/nested.txt')),
    Buffer.from([0, 255, 10]),
  );
  assert.equal(fs.existsSync(path.join(root, 'delete.txt')), false);
  assert.equal(
    fs.readFileSync(path.join(root, 'untracked.txt'), 'utf8'),
    'nao copiar',
  );
  assert.throws(
    () => copy.apply(root, artifact, artifact.sha256, work, context),
    /conflito/,
  );

  for (const paths of [
    ['../escape'],
    ['/absolute'],
    ['a/../b'],
    ['a//b'],
    ['a\\b'],
    ['*.txt'],
    ['a', 'a/b'],
    ['.env'],
    ['.codex/a'],
    ['SchoolContent/a'],
  ])
    assert.throws(
      () => copy.allowedPaths(paths),
      /invalido|protegido|sobrepoe/,
    );
  const extra = { ...prepared, directory: path.join(directory, 'extra') };
  fs.mkdirSync(extra.directory);
  for (const [name, value] of prepared.source) {
    fs.mkdirSync(path.dirname(path.join(extra.directory, name)), {
      recursive: true,
    });
    fs.writeFileSync(path.join(extra.directory, name), value.bytes);
  }
  fs.mkdirSync(path.join(extra.directory, 'empty-extra'));
  assert.throws(
    () => copy.collect(extra, work, context, 'run'),
    /diretorio extra/,
  );
  fs.rmdirSync(path.join(extra.directory, 'empty-extra'));
  fs.writeFileSync(path.join(extra.directory, 'outside.txt'), 'extra');
  assert.throws(
    () => copy.collect(extra, work, context, 'run'),
    /fora do escopo/,
  );
  fs.unlinkSync(path.join(extra.directory, 'outside.txt'));
  fs.symlinkSync(
    path.join(root, 'edit.txt'),
    path.join(extra.directory, 'edit.txt.link'),
  );
  assert.throws(() => copy.collect(extra, work, context, 'run'), /symlink/);
  fs.unlinkSync(path.join(extra.directory, 'edit.txt.link'));
  fs.linkSync(
    path.join(extra.directory, 'edit.txt'),
    path.join(extra.directory, 'hardlink.txt'),
  );
  assert.throws(() => copy.collect(extra, work, context, 'run'), /hardlink/);

  const forged = JSON.parse(JSON.stringify(artifact));
  forged.changes[0].before.sha256 = 'd'.repeat(64);
  const { sha256: _hash, ...payload } = forged;
  forged.sha256 = digest(payload);
  assert.throws(
    () => copy.validateArtifact(forged, artifact.sha256, work, context),
    /hash/,
  );
  fs.symlinkSync('/private/tmp', path.join(root, 'link'));
  assert.throws(() => copy.state(root, 'link'), /symlink/);
  assert.throws(() => copy.state(root, 'link/file.txt'), /symlink/);
  git('add', 'link');
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'Inclui symlink ficticio',
  );
  assert.throws(
    () => copy.sourceFiles(root, git('rev-parse', 'HEAD').toString().trim()),
    /tipo Git proibido/,
  );
  process.stdout.write('isolated-agent-copy: ok\n');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
