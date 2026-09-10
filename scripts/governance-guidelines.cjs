const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'config', 'governance-guidelines.json');
const CATALOG_SCHEMA = 'governance-guidelines-v1';
const BUNDLE_SCHEMA = 'guideline-bundle-v1';
const ALLOWED_SOURCE_ROOTS = [
  'docs/agents',
  'docs/github',
  'docs/harness',
  'docs/specs',
];
const STATUSES = new Set(['active', 'deprecated', 'retired']);
const TYPES = new Set(['contract', 'guideline', 'policy', 'standard']);
const ENFORCEMENTS = new Set([
  'automated-blocking',
  'automated-diagnostic',
  'manual-blocking',
  'advisory',
]);
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256 = /^[a-f0-9]{64}$/;

const TOP_LEVEL_KEYS = new Set(['schemaVersion', 'guidelines']);
const GUIDELINE_KEYS = new Set([
  'id',
  'version',
  'status',
  'type',
  'owner',
  'sourcePath',
  'sha256',
  'appliesTo',
  'enforcement',
  'evidence',
  'metrics',
  'replaces',
]);
const METRIC_KEYS = new Set(['id', 'definition', 'target', 'source']);
const REPLACEMENT_KEYS = new Set(['id', 'version']);
const BUNDLE_KEYS = new Set(['schemaVersion', 'catalog', 'documents']);
const DOCUMENT_KEYS = new Set(['sourcePath', 'sha256', 'content']);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function unknownKeys(value, allowed, label) {
  if (!isPlainObject(value)) return [`${label} deve ser objeto`];
  return Object.keys(value)
    .filter((key) => !allowed.has(key))
    .map((key) => `${label} possui campo desconhecido: ${key}`);
}

function validateStringList(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    return [`${label} deve ser lista nao vazia`];
  }
  const errors = [];
  value.forEach((item, index) => {
    if (!isNonEmptyString(item))
      errors.push(`${label}[${index}] deve ser texto`);
  });
  if (new Set(value).size !== value.length)
    errors.push(`${label} possui duplicatas`);
  return errors;
}

function validateSourcePath(sourcePath, label) {
  if (!isNonEmptyString(sourcePath)) return [`${label} deve ser texto`];
  if (sourcePath.includes('\\'))
    return [`${label} deve usar separadores POSIX`];
  if (path.posix.isAbsolute(sourcePath) || path.win32.isAbsolute(sourcePath)) {
    return [`${label} nao pode ser absoluto`];
  }
  if (
    path.posix.normalize(sourcePath) !== sourcePath ||
    sourcePath.split('/').includes('..')
  ) {
    return [`${label} nao pode conter traversal`];
  }
  if (!sourcePath.endsWith('.md'))
    return [`${label} deve apontar para Markdown`];
  if (!ALLOWED_SOURCE_ROOTS.some((root) => sourcePath.startsWith(`${root}/`))) {
    return [`${label} esta fora das raizes autorizadas`];
  }
  return [];
}

function validateMetric(metric, label) {
  const errors = unknownKeys(metric, METRIC_KEYS, label);
  if (!isPlainObject(metric)) return errors;
  METRIC_KEYS.forEach((key) => {
    if (!isNonEmptyString(metric[key]))
      errors.push(`${label}.${key} deve ser texto nao vazio`);
  });
  if (isNonEmptyString(metric.id) && !SLUG.test(metric.id)) {
    errors.push(`${label}.id deve ser slug`);
  }
  return errors;
}

function validateReplacement(replacement, label) {
  const errors = unknownKeys(replacement, REPLACEMENT_KEYS, label);
  if (!isPlainObject(replacement)) return errors;
  if (!isNonEmptyString(replacement.id) || !SLUG.test(replacement.id)) {
    errors.push(`${label}.id deve ser slug`);
  }
  if (
    !isNonEmptyString(replacement.version) ||
    !SEMVER.test(replacement.version)
  ) {
    errors.push(`${label}.version deve ser SemVer`);
  }
  return errors;
}

function validateCatalogStructure(catalog) {
  const errors = unknownKeys(catalog, TOP_LEVEL_KEYS, 'catalogo');
  if (!isPlainObject(catalog)) return errors;
  if (catalog.schemaVersion !== CATALOG_SCHEMA) {
    errors.push(`schemaVersion deve ser ${CATALOG_SCHEMA}`);
  }
  if (!Array.isArray(catalog.guidelines) || catalog.guidelines.length === 0) {
    errors.push('guidelines deve ser lista nao vazia');
    return errors;
  }

  const ids = new Set();
  const sources = new Set();
  catalog.guidelines.forEach((guideline, index) => {
    const label = `guidelines[${index}]`;
    errors.push(...unknownKeys(guideline, GUIDELINE_KEYS, label));
    if (!isPlainObject(guideline)) return;
    if (!isNonEmptyString(guideline.id) || !SLUG.test(guideline.id)) {
      errors.push(`${label}.id deve ser slug`);
    } else if (ids.has(guideline.id)) {
      errors.push(`${label}.id duplicado: ${guideline.id}`);
    } else {
      ids.add(guideline.id);
    }
    if (
      !isNonEmptyString(guideline.version) ||
      !SEMVER.test(guideline.version)
    ) {
      errors.push(`${label}.version deve ser SemVer`);
    }
    if (!STATUSES.has(guideline.status))
      errors.push(`${label}.status invalido`);
    if (!TYPES.has(guideline.type)) errors.push(`${label}.type invalido`);
    if (!isNonEmptyString(guideline.owner) || !SLUG.test(guideline.owner)) {
      errors.push(`${label}.owner deve ser slug`);
    }
    errors.push(
      ...validateSourcePath(guideline.sourcePath, `${label}.sourcePath`),
    );
    if (isNonEmptyString(guideline.sourcePath)) {
      if (sources.has(guideline.sourcePath)) {
        errors.push(`${label}.sourcePath duplicado: ${guideline.sourcePath}`);
      } else {
        sources.add(guideline.sourcePath);
      }
    }
    if (!isNonEmptyString(guideline.sha256) || !SHA256.test(guideline.sha256)) {
      errors.push(`${label}.sha256 invalido`);
    }
    errors.push(
      ...validateStringList(guideline.appliesTo, `${label}.appliesTo`),
    );
    if (Array.isArray(guideline.appliesTo)) {
      guideline.appliesTo.forEach((item, itemIndex) => {
        if (isNonEmptyString(item) && !SLUG.test(item)) {
          errors.push(`${label}.appliesTo[${itemIndex}] deve ser slug`);
        }
      });
    }
    if (!ENFORCEMENTS.has(guideline.enforcement)) {
      errors.push(`${label}.enforcement invalido`);
    }
    errors.push(...validateStringList(guideline.evidence, `${label}.evidence`));
    if (guideline.metrics !== undefined) {
      if (!Array.isArray(guideline.metrics) || guideline.metrics.length === 0) {
        errors.push(`${label}.metrics deve ser lista nao vazia`);
      } else {
        const metricIds = new Set();
        guideline.metrics.forEach((metric, metricIndex) => {
          errors.push(
            ...validateMetric(metric, `${label}.metrics[${metricIndex}]`),
          );
          if (isPlainObject(metric) && isNonEmptyString(metric.id)) {
            if (metricIds.has(metric.id)) {
              errors.push(`${label}.metrics possui id duplicado: ${metric.id}`);
            }
            metricIds.add(metric.id);
          }
        });
      }
    }
    if (guideline.replaces !== undefined) {
      if (
        !Array.isArray(guideline.replaces) ||
        guideline.replaces.length === 0
      ) {
        errors.push(`${label}.replaces deve ser lista nao vazia`);
      } else {
        guideline.replaces.forEach((replacement, replacementIndex) => {
          errors.push(
            ...validateReplacement(
              replacement,
              `${label}.replaces[${replacementIndex}]`,
            ),
          );
        });
      }
    }
  });
  return errors;
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function readRegularFile(filePath, label, encoding) {
  let descriptor;
  try {
    descriptor = fs.openSync(
      filePath,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
    );
    if (!fs.fstatSync(descriptor).isFile()) {
      throw new Error(`${label} deve ser arquivo regular`);
    }
    return fs.readFileSync(descriptor, encoding);
  } catch (error) {
    if (error && error.code === 'ELOOP') {
      throw new Error(`${label} nao pode ser symlink`, { cause: error });
    }
    throw error;
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function writeNewFile(filePath, content, label) {
  let descriptor;
  try {
    descriptor = fs.openSync(
      filePath,
      fs.constants.O_WRONLY |
        fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        fs.constants.O_NOFOLLOW,
      0o600,
    );
    fs.writeFileSync(descriptor, content);
  } catch (error) {
    if (error && error.code === 'EEXIST') {
      throw new Error(`${label} ja existe`, { cause: error });
    }
    if (error && error.code === 'ELOOP') {
      throw new Error(`${label} nao pode ser symlink`, { cause: error });
    }
    throw error;
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function resolveSource(rootDirectory, sourcePath) {
  const absolutePath = path.resolve(rootDirectory, ...sourcePath.split('/'));
  const relative = path.relative(rootDirectory, absolutePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`sourcePath fora do repositorio: ${sourcePath}`);
  }
  return absolutePath;
}

function hasSymlinkComponent(rootDirectory, sourcePath) {
  let current = rootDirectory;
  for (const segment of sourcePath.split('/')) {
    current = path.join(current, segment);
    if (fs.lstatSync(current).isSymbolicLink()) return true;
  }
  return false;
}

function validateCatalog(catalog, options = {}) {
  const rootDirectory = path.resolve(options.rootDirectory || ROOT);
  const requireTracked = options.requireTracked !== false;
  const errors = validateCatalogStructure(catalog);
  if (errors.length || !Array.isArray(catalog && catalog.guidelines))
    return errors;

  catalog.guidelines.forEach((guideline) => {
    const label = `[${guideline.id}]`;
    let absolutePath;
    try {
      absolutePath = resolveSource(rootDirectory, guideline.sourcePath);
      if (hasSymlinkComponent(rootDirectory, guideline.sourcePath)) {
        errors.push(`${label} sourcePath nao pode ser symlink`);
        return;
      }
      const realRoot = fs.realpathSync(rootDirectory);
      const realSource = fs.realpathSync(absolutePath);
      const realRelative = path.relative(realRoot, realSource);
      if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
        errors.push(`${label} sourcePath resolve fora do repositorio`);
        return;
      }
      const content = readRegularFile(absolutePath, `${label} sourcePath`);
      if (sha256(content) !== guideline.sha256) {
        errors.push(`${label} hash SHA-256 diverge do documento`);
      }
      if (requireTracked) {
        try {
          execFileSync(
            'git',
            [
              '--literal-pathspecs',
              'ls-files',
              '--error-unmatch',
              '--',
              guideline.sourcePath,
            ],
            {
              cwd: rootDirectory,
              stdio: 'ignore',
            },
          );
        } catch {
          errors.push(`${label} sourcePath nao esta versionado no Git`);
        }
      }
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        errors.push(`${label} sourcePath ausente: ${guideline.sourcePath}`);
      } else {
        errors.push(`${label} falha ao ler sourcePath: ${error.message}`);
      }
    }
  });
  return errors;
}

function canonicalCatalog(catalog) {
  return {
    schemaVersion: catalog.schemaVersion,
    guidelines: [...catalog.guidelines].sort((left, right) =>
      `${left.id}@${left.version}`.localeCompare(
        `${right.id}@${right.version}`,
      ),
    ),
  };
}

function buildBundle(catalog, options = {}) {
  const rootDirectory = path.resolve(options.rootDirectory || ROOT);
  const errors = validateCatalog(catalog, options);
  if (errors.length) throw new Error(errors.join('\n'));
  const normalizedCatalog = canonicalCatalog(catalog);
  return {
    schemaVersion: BUNDLE_SCHEMA,
    catalog: normalizedCatalog,
    documents: normalizedCatalog.guidelines
      .map((guideline) => {
        const content = readRegularFile(
          resolveSource(rootDirectory, guideline.sourcePath),
          `[${guideline.id}] sourcePath`,
          'utf8',
        );
        if (sha256(content) !== guideline.sha256) {
          throw new Error(
            `[${guideline.id}] sourcePath mudou durante a exportacao`,
          );
        }
        return {
          sourcePath: guideline.sourcePath,
          sha256: guideline.sha256,
          content,
        };
      })
      .sort((left, right) => left.sourcePath.localeCompare(right.sourcePath)),
  };
}

function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function validateBundle(bundle) {
  const errors = unknownKeys(bundle, BUNDLE_KEYS, 'bundle');
  if (!isPlainObject(bundle)) return errors;
  if (bundle.schemaVersion !== BUNDLE_SCHEMA) {
    errors.push(`bundle.schemaVersion deve ser ${BUNDLE_SCHEMA}`);
  }
  errors.push(...validateCatalogStructure(bundle.catalog));
  if (!Array.isArray(bundle.documents)) {
    errors.push('bundle.documents deve ser lista');
    return errors;
  }

  const documents = new Map();
  bundle.documents.forEach((document, index) => {
    const label = `bundle.documents[${index}]`;
    errors.push(...unknownKeys(document, DOCUMENT_KEYS, label));
    if (!isPlainObject(document)) return;
    errors.push(
      ...validateSourcePath(document.sourcePath, `${label}.sourcePath`),
    );
    if (!isNonEmptyString(document.sha256) || !SHA256.test(document.sha256)) {
      errors.push(`${label}.sha256 invalido`);
    }
    if (typeof document.content !== 'string')
      errors.push(`${label}.content deve ser texto`);
    if (documents.has(document.sourcePath)) {
      errors.push(`${label}.sourcePath duplicado: ${document.sourcePath}`);
    } else {
      documents.set(document.sourcePath, document);
    }
    if (
      typeof document.content === 'string' &&
      SHA256.test(document.sha256 || '')
    ) {
      if (sha256(document.content) !== document.sha256) {
        errors.push(`${label} hash SHA-256 diverge do conteudo`);
      }
    }
  });

  if (Array.isArray(bundle.catalog && bundle.catalog.guidelines)) {
    const expected = new Map(
      bundle.catalog.guidelines.map((guideline) => [
        guideline.sourcePath,
        guideline.sha256,
      ]),
    );
    expected.forEach((expectedHash, sourcePath) => {
      const document = documents.get(sourcePath);
      if (!document) errors.push(`bundle documento ausente: ${sourcePath}`);
      else if (document.sha256 !== expectedHash) {
        errors.push(`bundle hash diverge do catalogo: ${sourcePath}`);
      }
    });
    documents.forEach((_, sourcePath) => {
      if (!expected.has(sourcePath))
        errors.push(`bundle documento extra: ${sourcePath}`);
    });
  }
  return errors;
}

function readJsonFile(filePath, label) {
  try {
    return JSON.parse(readRegularFile(filePath, label, 'utf8'));
  } catch (error) {
    throw new Error(`${label} possui JSON invalido: ${error.message}`, {
      cause: error,
    });
  }
}

function exportBundle(outputPath, options = {}) {
  const absoluteOutput = path.resolve(outputPath);
  const parent = path.dirname(absoluteOutput);
  if (!fs.existsSync(parent) || !fs.lstatSync(parent).isDirectory()) {
    throw new Error('diretorio pai da saida deve existir');
  }
  const catalog = readJsonFile(
    options.manifestPath || MANIFEST_PATH,
    'catalogo',
  );
  const bundle = buildBundle(catalog, options);
  writeNewFile(absoluteOutput, serialize(bundle), 'arquivo de saida');
  return bundle;
}

function assertSafeOutputDirectory(outputDirectory, repositoryRoot = ROOT) {
  const absoluteOutput = path.resolve(outputDirectory);
  const stat = fs.lstatSync(absoluteOutput);
  if (stat.isSymbolicLink()) throw new Error('output-dir nao pode ser symlink');
  if (!stat.isDirectory()) throw new Error('output-dir deve ser diretorio');
  if (fs.readdirSync(absoluteOutput).length !== 0)
    throw new Error('output-dir deve estar vazio');
  const realOutput = fs.realpathSync(absoluteOutput);
  const realRepository = fs.realpathSync(repositoryRoot);
  const relative = path.relative(realRepository, realOutput);
  if (!relative || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    throw new Error('output-dir deve ficar fora do repositorio');
  }
  return realOutput;
}

function importBundle(inputPath, options = {}) {
  const absoluteInput = path.resolve(inputPath);
  const bundle = readJsonFile(absoluteInput, 'bundle de entrada');
  const errors = validateBundle(bundle);
  if (errors.length) throw new Error(errors.join('\n'));
  if (options.dryRun) return bundle;
  if (!isNonEmptyString(options.outputDirectory)) {
    throw new Error('import exige --output-dir ou --dry-run');
  }
  const outputDirectory = assertSafeOutputDirectory(
    options.outputDirectory,
    options.repositoryRoot || ROOT,
  );
  writeNewFile(
    path.join(outputDirectory, 'manifest.json'),
    serialize(bundle.catalog),
    'manifest de destino',
  );
  bundle.documents.forEach((document) => {
    const target = path.join(
      outputDirectory,
      ...document.sourcePath.split('/'),
    );
    fs.mkdirSync(path.dirname(target), { recursive: true });
    writeNewFile(
      target,
      document.content,
      `documento de destino ${document.sourcePath}`,
    );
  });
  return bundle;
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
    if (
      argument !== '--input' &&
      argument !== '--output' &&
      argument !== '--output-dir'
    ) {
      throw new Error(`argumento desconhecido: ${argument}`);
    }
    const value = args[index + 1];
    if (!value || value.startsWith('--'))
      throw new Error(`${argument} exige valor`);
    const key = {
      '--input': 'input',
      '--output': 'output',
      '--output-dir': 'outputDirectory',
    }[argument];
    if (options[key]) throw new Error(`${argument} duplicado`);
    options[key] = value;
    index += 1;
  }
  return options;
}

function main(args = process.argv.slice(2)) {
  const command = args[0] || 'validate';
  const options = parseOptions(args.slice(1));
  if (command === 'validate') {
    if (Object.keys(options).length)
      throw new Error('validate nao aceita opcoes');
    const catalog = readJsonFile(MANIFEST_PATH, 'catalogo');
    const errors = validateCatalog(catalog);
    if (errors.length) throw new Error(errors.join('\n'));
    process.stdout.write('governance-guidelines: ok\n');
    return;
  }
  if (command === 'export') {
    if (!options.output || Object.keys(options).length !== 1) {
      throw new Error('uso: export --output <arquivo>');
    }
    const bundle = exportBundle(options.output);
    process.stdout.write(
      `guideline-bundle: exported ${bundle.documents.length} documents\n`,
    );
    return;
  }
  if (command === 'import') {
    if (!options.input) throw new Error('import exige --input <arquivo>');
    if (options.dryRun === true && options.outputDirectory) {
      throw new Error('--dry-run e --output-dir sao mutuamente exclusivos');
    }
    if (options.dryRun !== true && !options.outputDirectory) {
      throw new Error('import exige --dry-run ou --output-dir <diretorio>');
    }
    const bundle = importBundle(options.input, {
      dryRun: options.dryRun === true,
      outputDirectory: options.outputDirectory,
    });
    process.stdout.write(
      `guideline-bundle: ${options.dryRun ? 'valid' : 'imported'} ${bundle.documents.length} documents\n`,
    );
    return;
  }
  throw new Error(`comando desconhecido: ${command}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  BUNDLE_SCHEMA,
  CATALOG_SCHEMA,
  ROOT,
  assertSafeOutputDirectory,
  buildBundle,
  exportBundle,
  importBundle,
  serialize,
  sha256,
  validateBundle,
  validateCatalog,
  validateCatalogStructure,
};
