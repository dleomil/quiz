const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  ROOT,
  buildBundle,
  exportBundle,
  importBundle,
  serialize,
  sha256,
  validateBundle,
  validateCatalog,
  validateCatalogStructure,
} = require('../../scripts/governance-guidelines.cjs');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function temporaryDirectory(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function fixtureWorkspace() {
  const root = temporaryDirectory('guideline-fixture-');
  const sourcePath = 'docs/harness/policy.md';
  const absoluteSource = path.join(root, ...sourcePath.split('/'));
  fs.mkdirSync(path.dirname(absoluteSource), { recursive: true });
  const content = '# Policy\n\nFonte normativa.\n';
  fs.writeFileSync(absoluteSource, content);
  const catalog = {
    schemaVersion: 'governance-guidelines-v1',
    guidelines: [
      {
        id: 'fixture-policy',
        version: '1.0.0',
        status: 'active',
        type: 'policy',
        owner: 'architecture',
        sourcePath,
        sha256: sha256(content),
        appliesTo: ['pull-requests'],
        enforcement: 'automated-blocking',
        evidence: ['validator output'],
        metrics: [
          {
            id: 'validation-rate',
            definition: 'Bundles validos sobre bundles avaliados.',
            target: '100%',
            source: 'PR Governance',
          },
        ],
      },
    ],
  };
  return { root, sourcePath, absoluteSource, catalog };
}

function expectError(errors, text) {
  assert.ok(
    errors.some((error) => error.includes(text)),
    errors.join('\n'),
  );
}

function runStructureTests() {
  const fixture = fixtureWorkspace();
  try {
    assert.deepEqual(
      validateCatalog(fixture.catalog, {
        rootDirectory: fixture.root,
        requireTracked: false,
      }),
      [],
    );

    const unknown = clone(fixture.catalog);
    unknown.guidelines[0].normativeText = 'nao permitido';
    expectError(validateCatalogStructure(unknown), 'campo desconhecido');

    const duplicate = clone(fixture.catalog);
    duplicate.guidelines.push(clone(duplicate.guidelines[0]));
    expectError(validateCatalogStructure(duplicate), 'id duplicado');

    const invalidVersion = clone(fixture.catalog);
    invalidVersion.guidelines[0].version = 'v1';
    expectError(validateCatalogStructure(invalidVersion), 'deve ser SemVer');

    const missingSource = clone(fixture.catalog);
    missingSource.guidelines[0].sourcePath = 'docs/harness/missing.md';
    expectError(
      validateCatalog(missingSource, {
        rootDirectory: fixture.root,
        requireTracked: false,
      }),
      'sourcePath ausente',
    );

    const divergentHash = clone(fixture.catalog);
    divergentHash.guidelines[0].sha256 = '0'.repeat(64);
    expectError(
      validateCatalog(divergentHash, {
        rootDirectory: fixture.root,
        requireTracked: false,
      }),
      'hash SHA-256 diverge',
    );

    const invalidEnforcement = clone(fixture.catalog);
    invalidEnforcement.guidelines[0].enforcement = 'optional';
    expectError(
      validateCatalogStructure(invalidEnforcement),
      'enforcement invalido',
    );

    const invalidMetric = clone(fixture.catalog);
    invalidMetric.guidelines[0].metrics[0].target = '';
    expectError(
      validateCatalogStructure(invalidMetric),
      'target deve ser texto nao vazio',
    );

    const unknownMetric = clone(fixture.catalog);
    unknownMetric.guidelines[0].metrics[0].unit = 'percent';
    expectError(validateCatalogStructure(unknownMetric), 'campo desconhecido');

    const duplicateMetric = clone(fixture.catalog);
    duplicateMetric.guidelines[0].metrics.push(
      clone(duplicateMetric.guidelines[0].metrics[0]),
    );
    expectError(validateCatalogStructure(duplicateMetric), 'id duplicado');

    const unauthorized = clone(fixture.catalog);
    unauthorized.guidelines[0].sourcePath = 'docs/product/policy.md';
    expectError(
      validateCatalogStructure(unauthorized),
      'fora das raizes autorizadas',
    );
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
}

function runSymlinkTest() {
  const fixture = fixtureWorkspace();
  const linkedPath = path.join(fixture.root, 'docs', 'harness', 'linked.md');
  try {
    fs.symlinkSync(fixture.absoluteSource, linkedPath);
    const catalog = clone(fixture.catalog);
    catalog.guidelines[0].sourcePath = 'docs/harness/linked.md';
    expectError(
      validateCatalog(catalog, {
        rootDirectory: fixture.root,
        requireTracked: false,
      }),
      'nao pode ser symlink',
    );

    const linkedDirectory = path.join(fixture.root, 'docs', 'agents');
    fs.symlinkSync(path.join(fixture.root, 'docs', 'harness'), linkedDirectory);
    const catalogWithLinkedDirectory = clone(fixture.catalog);
    catalogWithLinkedDirectory.guidelines[0].sourcePath =
      'docs/agents/policy.md';
    expectError(
      validateCatalog(catalogWithLinkedDirectory, {
        rootDirectory: fixture.root,
        requireTracked: false,
      }),
      'nao pode ser symlink',
    );
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
}

function runBundleValidationTests() {
  const fixture = fixtureWorkspace();
  try {
    const bundle = buildBundle(fixture.catalog, {
      rootDirectory: fixture.root,
      requireTracked: false,
    });
    assert.deepEqual(validateBundle(bundle), []);

    const missing = clone(bundle);
    missing.documents = [];
    expectError(validateBundle(missing), 'documento ausente');

    const extra = clone(bundle);
    extra.documents.push({
      sourcePath: 'docs/harness/extra.md',
      sha256: sha256('extra'),
      content: 'extra',
    });
    expectError(validateBundle(extra), 'documento extra');

    const tampered = clone(bundle);
    tampered.documents[0].content += 'alterado';
    expectError(validateBundle(tampered), 'hash SHA-256 diverge do conteudo');

    const traversal = clone(bundle);
    traversal.documents[0].sourcePath = 'docs/harness/../escape.md';
    expectError(validateBundle(traversal), 'nao pode conter traversal');

    const absolute = clone(bundle);
    absolute.documents[0].sourcePath = '/tmp/escape.md';
    expectError(validateBundle(absolute), 'nao pode ser absoluto');
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
}

function runRepositoryIntegrationTests() {
  const temp = temporaryDirectory('guideline-integration-');
  const firstBundle = path.join(temp, 'first.json');
  const secondBundle = path.join(temp, 'second.json');
  const imported = path.join(temp, 'imported');
  const dryRunSentinel = path.join(temp, 'dry-run-sentinel');
  try {
    const first = exportBundle(firstBundle);
    const second = exportBundle(secondBundle);
    assert.equal(
      fs.readFileSync(firstBundle, 'utf8'),
      fs.readFileSync(secondBundle, 'utf8'),
    );
    assert.equal(serialize(first), serialize(second));
    assert.throws(() => exportBundle(firstBundle), /ja existe/);

    const dryRunResult = importBundle(firstBundle, { dryRun: true });
    assert.equal(dryRunResult.schemaVersion, 'guideline-bundle-v1');
    assert.equal(fs.existsSync(dryRunSentinel), false);

    const cliResult = spawnSync(
      process.execPath,
      [
        path.join(ROOT, 'scripts', 'governance-guidelines.cjs'),
        'import',
        '--input',
        firstBundle,
        '--dry-run',
      ],
      { cwd: ROOT, encoding: 'utf8' },
    );
    assert.equal(cliResult.status, 0, cliResult.stderr);
    assert.match(cliResult.stdout, /guideline-bundle: valid/);

    fs.mkdirSync(imported);
    importBundle(firstBundle, { outputDirectory: imported });
    assert.deepEqual(
      JSON.parse(fs.readFileSync(path.join(imported, 'manifest.json'), 'utf8')),
      first.catalog,
    );
    first.documents.forEach((document) => {
      assert.equal(
        fs.readFileSync(
          path.join(imported, ...document.sourcePath.split('/')),
          'utf8',
        ),
        document.content,
      );
    });
    assert.throws(
      () => importBundle(firstBundle, { outputDirectory: imported }),
      /deve estar vazio/,
    );

    const nonEmpty = path.join(temp, 'non-empty');
    fs.mkdirSync(nonEmpty);
    fs.writeFileSync(path.join(nonEmpty, 'keep.txt'), 'keep');
    assert.throws(
      () => importBundle(firstBundle, { outputDirectory: nonEmpty }),
      /deve estar vazio/,
    );

    const symlinkOutput = path.join(temp, 'output-link');
    const realOutput = path.join(temp, 'real-output');
    fs.mkdirSync(realOutput);
    fs.symlinkSync(realOutput, symlinkOutput);
    assert.throws(
      () => importBundle(firstBundle, { outputDirectory: symlinkOutput }),
      /nao pode ser symlink/,
    );

    const inputLink = path.join(temp, 'input-link.json');
    fs.symlinkSync(firstBundle, inputLink);
    assert.throws(
      () => importBundle(inputLink, { dryRun: true }),
      /nao pode ser symlink/,
    );

    const insideRepository = fs.mkdtempSync(
      path.join(ROOT, '.guideline-import-test-'),
    );
    try {
      assert.throws(
        () => importBundle(firstBundle, { outputDirectory: insideRepository }),
        /fora do repositorio/,
      );
    } finally {
      fs.rmSync(insideRepository, { recursive: true, force: true });
    }
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

runStructureTests();
runSymlinkTest();
runBundleValidationTests();
runRepositoryIntegrationTests();
process.stdout.write('governance-guidelines: ok\n');
