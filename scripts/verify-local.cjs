const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { checkScope } = require('./subject-scope.cjs');
const { verifyFromDisk } = require('./subject-verification.cjs');

const TESTS = [
  'subject-run',
  'auth-status',
  'editorial-agent-runner',
  'agent-event-capture',
  'writer-agent-runner',
  'verifier-comparison',
  'editorial-recovery',
  'agent-capability-model',
  'codex-agent-validator',
  'agent-context',
  'direct-curation',
  'delegated-approval',
  'subject-verification',
  'subject-scope',
  'verify-selection',
  'subject-integration',
  'direct-curation-capture',
];
const INFRA = new Set([
  'AGENTS.md',
  'package.json',
  '.github/workflows/pr-governance.yml',
  'config/content-delivery-policy.json',
  'config/document-catalog.json',
  'config/governance-guidelines.json',
  'config/agent-capabilities.json',
  '.codex/agents/content-curator.toml',
  '.codex/agents/pedagogical-quality.toml',
  'docs/specs/agent-context-and-auth.md',
  'docs/specs/final-exams-november-2026-intake.md',
  'docs/specs/content-delivery-contract.md',
  'docs/specs/editorial-agent-output-contract.md',
  'docs/harness/production-delivery-failure-log.json',
  'docs/harness/subject-update-procedure.md',
  'scripts/agent-auth.cjs',
  'scripts/agent-context.cjs',
  'scripts/agent-cli-events.cjs',
  'scripts/run-editorial-agent.cjs',
  'scripts/content-delivery.cjs',
  'scripts/direct-curation.cjs',
  'scripts/delegated-approval.cjs',
  'scripts/subject-verification.cjs',
  'scripts/subject-scope.cjs',
  'scripts/verify-local.cjs',
  'scripts/capture-direct-editorial.cjs',
  'scripts/subject-run.cjs',
  'tests/helpers/subject-synthetic.cjs',
  'tests/agents/context-test-support.cjs',
  'tests/agents/evaluation-test-support.cjs',
  'tests/ui/content-delivery.spec.cjs',
  ...TESTS.map((name) => `tests/agents/${name}.spec.cjs`),
]);
function profileFor(files) {
  if (files.includes('.github/subject-delivery.json')) return 'subject';
  if (
    files.some((file) =>
      /^docs\/drafts\/2026-t3-v2--ciencias--[a-z0-9-]+\.json$/.test(file),
    ) &&
    files.every(
      (file) =>
        INFRA.has(file) ||
        /^docs\/drafts\/2026-t3-v2--ciencias--[a-z0-9-]+\.json$/.test(file),
    )
  )
    return 'science-drafts';
  if (files.every((file) => INFRA.has(file))) return 'infrastructure';
  return 'legacy';
}

function verifyScienceDrafts(root, files) {
  const { validateBatch } = require('./content-delivery.cjs');
  const policy = JSON.parse(
    fs.readFileSync(path.join(root, 'config/content-delivery-policy.json')),
  );
  const coverage = JSON.parse(
    fs.readFileSync(path.join(root, 'config/content-coverage-manifest.json')),
  );
  const expectedTopics = Object.keys(
    coverage.contentSets['2026-t3-v2'].subjects.ciencias,
  ).sort();
  const draftFiles = files
    .filter((name) =>
      /^docs\/drafts\/2026-t3-v2--ciencias--[a-z0-9-]+\.json$/.test(name),
    )
    .sort();
  const expectedFiles = expectedTopics
    .map((topic) => `docs/drafts/2026-t3-v2--ciencias--${topic}.json`)
    .sort();
  if (JSON.stringify(draftFiles) !== JSON.stringify(expectedFiles))
    throw new Error('rascunhos de Ciencias nao cobrem a matriz completa');
  let count = 0;
  for (const name of draftFiles) {
    const questions = JSON.parse(
      fs.readFileSync(path.join(root, name), 'utf8'),
    ).questions;
    const checked = validateBatch(questions, { policy, coverage });
    if (checked.errors.length) throw new Error(checked.errors.join('\n'));
    if (questions.some((question) => question.reviewStatus !== 'draft'))
      throw new Error(`${name}: rascunho fora do estado draft`);
    count += questions.length;
  }
  if (count !== expectedTopics.length * 20)
    throw new Error(`cobertura de Ciencias invalida: ${count} questoes`);
  console.log(
    `science-drafts: ${expectedTopics.length} temas, ${count} questoes`,
  );
}
function run(args = process.argv.slice(2)) {
  const root = path.resolve(__dirname, '..');
  const options = { '--base-ref': 'origin/develop', '--head-ref': 'WORKTREE' };
  for (let i = 0; i < args.length; i += 2) {
    if (
      !Object.hasOwn(options, args[i]) ||
      !/^[a-zA-Z0-9_./-]+$/.test(args[i + 1] || '') ||
      args[i + 1].startsWith('-')
    )
      throw new Error('referencia invalida');
    options[args[i]] = args[i + 1];
  }
  const base = options['--base-ref'],
    head = options['--head-ref'];
  const git = (values) =>
    execFileSync('git', values, { cwd: root, encoding: 'utf8' });
  if (
    head !== 'WORKTREE' &&
    git(['rev-parse', 'HEAD']).trim() !== git(['rev-parse', head]).trim()
  )
    throw new Error('workspace diverge do head validado');
  const files = [
    ...new Set(
      [
        ...git([
          'diff',
          '--name-only',
          base,
          ...(head === 'WORKTREE' ? [] : [head]),
        ])
          .trim()
          .split('\n'),
        ...(head === 'WORKTREE'
          ? git(['ls-files', '--others', '--exclude-standard'])
              .trim()
              .split('\n')
          : []),
      ].filter(Boolean),
    ),
  ];
  if (
    head !== 'WORKTREE' &&
    git(['status', '--porcelain', '--untracked-files=no']).trim()
  )
    throw new Error('workspace alterado fora do head validado');
  const profile = profileFor(files);
  console.log(`verify:local: ${profile} (${files.length} arquivos)`);
  if (profile === 'science-drafts') verifyScienceDrafts(root, files);
  const command = (bin, values, env = {}) => {
    const result = spawnSync(bin, values, {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, ...env },
      shell: false,
    });
    if (result.error || result.status !== 0)
      throw new Error(`verificacao falhou: ${bin} ${values.join(' ')}`);
  };
  const dependencyRoot = process.env.QUIZ_DEPENDENCY_ROOT || root;
  if (profile === 'legacy') {
    command('npm', ['test']);
    command('npm', ['run', 'lint']);
    command('npm', ['run', 'format:check']);
  } else {
    if (profile === 'subject') {
      const readHead = (name) =>
        head === 'WORKTREE'
          ? fs.readFileSync(path.join(root, name), 'utf8')
          : git(['show', `${head}:${name}`]);
      const descriptor = JSON.parse(readHead('.github/subject-delivery.json'));
      checkScope(
        files,
        descriptor,
        (name) => git(['show', `${base}:${name}`]),
        readHead,
      );
      const result = verifyFromDisk(root, '.github/subject-delivery.json');
      if (result.errors.length) throw new Error(result.errors.join('\n'));
      const resultPath = path.join(
        require('node:os').tmpdir(),
        `subject-delivery-${require('node:crypto').randomUUID()}.json`,
      );
      fs.writeFileSync(resultPath, JSON.stringify(result), {
        flag: 'wx',
        mode: 0o600,
      });
      try {
        command(process.execPath, ['tests/ui/content-delivery.spec.cjs'], {
          CONTENT_DELIVERY_RESULT: resultPath,
        });
      } finally {
        fs.unlinkSync(resultPath);
      }
      const finalCheck = verifyFromDisk(root, '.github/subject-delivery.json');
      if (finalCheck.errors.length)
        throw new Error(finalCheck.errors.join('\n'));
    } else {
      for (const name of TESTS)
        command(process.execPath, [`tests/agents/${name}.spec.cjs`]);
    }
    const changedDocs = files.filter(
      (name) => name.endsWith('.md') && fs.existsSync(path.join(root, name)),
    );
    if (changedDocs.length) {
      const catalog = JSON.parse(
        fs.readFileSync(
          path.join(root, 'config/document-catalog.json'),
          'utf8',
        ),
      );
      for (const name of changedDocs) {
        const entry = catalog.documents.find((item) => item.path === name);
        const hash = require('node:crypto')
          .createHash('sha256')
          .update(fs.readFileSync(path.join(root, name)))
          .digest('hex');
        if (!entry || entry.sha256 !== hash)
          throw new Error(`catalogo documental diverge: ${name}`);
      }
    }
    const existing = files.filter((name) =>
      fs.existsSync(path.join(root, name)),
    );
    const code = existing.filter((name) => /\.(?:cjs|js)$/.test(name));
    if (code.length)
      command(process.execPath, [
        path.join(dependencyRoot, 'node_modules/eslint/bin/eslint.js'),
        ...code,
      ]);
    const formatted = existing.filter((name) =>
      /\.(?:cjs|js|json|md|yml)$/.test(name),
    );
    if (formatted.length)
      command(process.execPath, [
        path.join(dependencyRoot, 'node_modules/prettier/bin/prettier.cjs'),
        '--check',
        ...formatted,
      ]);
  }
  command('git', ['diff', '--check']);
}
if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(`verify:local: ${error.message}`);
    process.exitCode = 1;
  }
}
module.exports = { profileFor, run, verifyScienceDrafts };
