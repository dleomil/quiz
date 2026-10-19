const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { sha256 } = require('../../scripts/governance-guidelines.cjs');
const {
  CATALOG_PATH,
  ROOT,
  baseline,
  compareCatalogs,
  compareVersions,
  digest,
  loadCatalog,
  projectGovernance,
  readSource,
  safePath,
  serialize,
  structuralErrors,
  synchronize,
  validate,
  verifyApproval,
} = require('../../scripts/document-catalog.cjs');

const clone = (value) => JSON.parse(JSON.stringify(value));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-documents-'));
function git(...args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
function write(name, content) {
  const target = path.join(root, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}
function expect(errors, part) {
  assert.ok(
    errors.some((error) => error.includes(part)),
    errors.join('\n'),
  );
}
try {
  git('init', '--quiet');
  git('config', 'user.email', 'fixture@example.invalid');
  git('config', 'user.name', 'Fixture');
  write('README.md', '# Referencia\n');
  write('docs/specs/policy.md', '# Norma\n');
  write(
    'docs/specs/english-t2-bilingual-question-support.md',
    '# Contrato aplicado ao Ingles\n',
  );
  write(
    'docs/specs/t3-sem-classificacao.md',
    '# Apenas o nome nao implica aprovacao\n',
  );
  write('docs/audits/historico.md', '# Registro antigo\n');
  write(
    'config/agent-capabilities.json',
    JSON.stringify({ roles: [{ contractPaths: ['docs/specs/policy.md'] }] }),
  );
  const guidelines = {
    schemaVersion: 'governance-guidelines-v1',
    guidelines: [
      {
        id: 'policy',
        sourcePath: 'docs/specs/policy.md',
        version: '1.2.0',
        owner: 'content',
        type: 'policy',
        sha256: sha256('# Norma\n'),
      },
    ],
  };
  write('config/governance-guidelines.json', serialize(guidelines));
  const initial = synchronize(root, null, guidelines);
  write(CATALOG_PATH, serialize(initial));
  git('add', '.');
  git('commit', '--quiet', '-m', 'Prepara fixture documental');
  const commit = git('rev-parse', 'HEAD').trim();
  assert.deepEqual(validate(root, initial, guidelines), []);
  assert.deepEqual(synchronize(root, initial, guidelines), initial);
  assert.equal(
    initial.documents.find((item) => item.path === 'docs/specs/policy.md')
      .version,
    '1.2.0',
  );
  assert.equal(
    initial.documents.find((item) => item.path.includes('t2-bilingual'))
      .normative,
    true,
  );
  assert.equal(
    initial.documents.find((item) => item.path.includes('sem-classificacao'))
      .status,
    'unclassified',
  );
  assert.equal(
    initial.documents.find((item) => item.kind === 'historical').normative,
    false,
  );

  write('docs/specs/policy.md', '# Norma alterada\n');
  expect(validate(root, initial, guidelines), 'hash documental diverge');
  const updated = synchronize(root, initial, guidelines);
  const item = updated.documents.find(
    (document) => document.path === 'docs/specs/policy.md',
  );
  assert.equal(item.revision, 2);
  assert.equal(item.version, '1.2.1');
  assert.equal(item.status, 'draft');
  assert.deepEqual(
    synchronize(root, updated, projectGovernance(updated, guidelines)),
    updated,
  );
  expect(validate(root, updated, guidelines), 'projecao de governanca diverge');
  assert.deepEqual(
    validate(root, updated, projectGovernance(updated, guidelines)),
    [],
  );
  assert.deepEqual(compareCatalogs(initial, updated).errors, []);
  const stale = clone(updated);
  stale.documents.find((document) => document.id === item.id).revision = 1;
  expect(compareCatalogs(initial, stale).errors, 'proxima revisao');
  const inherited = clone(updated);
  inherited.documents.find((document) => document.id === item.id).status =
    'approved';
  expect(compareCatalogs(initial, inherited).errors, 'nao herda aprovacao');
  const unchangedVersion = clone(updated);
  unchangedVersion.documents.find(
    (document) => document.id === item.id,
  ).version = '1.2.0';
  expect(compareCatalogs(initial, unchangedVersion).errors, 'versao maior');
  const historical = clone(initial);
  historical.documents.find(
    (document) => document.kind === 'historical',
  ).status = 'approved';
  expect(structuralErrors(historical), 'historico nao pode');
  const duplicate = clone(initial);
  duplicate.documents.push(clone(initial.documents[0]));
  expect(structuralErrors(duplicate), 'duplicado');
  const extraField = clone(initial);
  extraField.documents[0].approval = true;
  expect(structuralErrors(extraField), 'registro documental invalido');
  const removal = clone(initial);
  removal.documents = removal.documents.filter(
    (document) => document.path !== 'docs/specs/policy.md',
  );
  expect(compareCatalogs(initial, removal).errors, 'exclusao normativa');

  const bundle = baseline(root, commit);
  assert.deepEqual(bundle, baseline(root, commit));
  assert.equal(
    bundle.documents.find(
      (document) => document.path === 'docs/specs/policy.md',
    ).sha256,
    sha256('# Norma\n'),
  );
  assert.equal(bundle.sourceCommit, commit);
  assert.ok(
    bundle.documents.every(
      (document) => document.normative && document.kind !== 'historical',
    ),
  );
  const url = 'https://github.com/dleomil/quiz/issues/999#issuecomment-123';
  const comment = {
    html_url: url,
    user: { login: 'dleomil', type: 'User' },
    body: `Aprovo o baseline documental hash ${bundle.sha256}`,
    created_at: '2026-10-19T12:00:00Z',
  };
  assert.equal(
    verifyApproval(bundle, url, () => comment).baselineSha256,
    bundle.sha256,
  );
  assert.throws(
    () =>
      verifyApproval(bundle, url, () => ({
        ...comment,
        body: 'Pode implementar',
      })),
    /aceite documental/,
  );
  assert.throws(
    () =>
      verifyApproval(bundle, url, () => ({
        ...comment,
        user: { login: 'dleomil', type: 'Bot' },
      })),
    /aceite documental/,
  );
  assert.throws(
    () =>
      verifyApproval(bundle, url.replace('dleomil', 'outro'), () => comment),
    /referencia/,
  );
  assert.throws(
    () =>
      verifyApproval(
        { ...bundle, sourceCommit: 'a'.repeat(40) },
        url,
        () => comment,
      ),
    /baseline invalido/,
  );
  assert.equal(compareVersions('2.0.0', '1.99.0'), 1);
  assert.equal(compareVersions('1.10.0', '1.2.0'), 1);
  assert.ok(!safePath('../fora.md'));
  assert.ok(!safePath('/tmp/fora.md'));
  assert.ok(!safePath('C:\\fora.md'));
  assert.throws(() => baseline(root, '--all'), /revisao Git invalida/);

  write('docs/novo.md', '# Novo arquivo ainda nao commitado\n');
  expect(
    validate(root, updated, projectGovernance(updated, guidelines)),
    'documento sem cadastro',
  );
  const link = path.join(root, 'docs', 'link.md');
  fs.symlinkSync(path.join(root, 'README.md'), link);
  assert.throws(() => readSource(root, 'docs/link.md'), /symlink/);
  assert.throws(() => synchronize(root, initial, guidelines), /symlink/);
  fs.unlinkSync(link);
  const outside = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-document-outside-'),
  );
  try {
    fs.symlinkSync(outside, path.join(root, 'alias'));
    assert.throws(() => readSource(root, 'alias/x.md'), /symlink/);
  } finally {
    fs.rmSync(outside, { recursive: true, force: true });
  }

  const invalidCli = spawnSync(
    process.execPath,
    [path.join(ROOT, 'scripts/document-catalog.cjs'), 'sync', '--ref', 'HEAD'],
    { encoding: 'utf8' },
  );
  assert.notEqual(invalidCli.status, 0);
  assert.match(invalidCli.stderr, /argumento documental invalido/);
  const repositoryCatalog = loadCatalog(ROOT);
  assert.deepEqual(
    validate(
      ROOT,
      repositoryCatalog,
      require('../../config/governance-guidelines.json'),
    ),
    [],
  );
  assert.equal(digest(bundle), digest(clone(bundle)));
  process.stdout.write(
    'document-catalog: ok (inventario, snapshot, mudancas, historico e aceite exato)\n',
  );
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
