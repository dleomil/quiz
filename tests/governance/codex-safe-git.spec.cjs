const assert = require('node:assert/strict');
const {
  authorizeQuizPush,
  normalizeQuizRemote,
  resolveCommand,
} = require('../../scripts/codex-safe-git.cjs');

function expectRejected(args, pattern) {
  assert.throws(() => resolveCommand(args), pattern);
}

function run() {
  assert.deepStrictEqual(resolveCommand(['status']).gitArgs, [
    'status',
    '--short',
    '--branch',
  ]);
  assert.deepStrictEqual(resolveCommand(['diff', '--check']).gitArgs, [
    '--no-pager',
    'diff',
    '--no-ext-diff',
    '--no-textconv',
    '--check',
  ]);
  assert.deepStrictEqual(resolveCommand(['add', '--', 'js/app.js']).gitArgs, [
    'add',
    '--',
    'js/app.js',
  ]);
  assert.deepStrictEqual(
    resolveCommand([
      'commit',
      '--message',
      'Ajusta validacao segura',
      '--',
      'scripts/app.js',
    ]).gitArgs,
    [
      'commit',
      '--only',
      '--message',
      'Ajusta validacao segura',
      '--',
      'scripts/app.js',
    ],
  );
  assert.deepStrictEqual(
    resolveCommand(['switch', '--create', 'feature/tarefa']).gitArgs,
    ['switch', '--create', 'feature/tarefa'],
  );

  expectRejected(['commit', '-m', 'texto'], /--message/);
  expectRejected(['commit', '--message', 'texto', '--amend', '--', 'a.js']);
  expectRejected(['commit', '--message', 'texto', '--', 'a.js', '--amend']);
  expectRejected(['add', '--', '../fora.js'], /Caminho nao permitido/);
  expectRejected(['add', '--', ':(top)/**'], /Caminho nao permitido/);
  expectRejected(['diff', '--output=/tmp/saida'], /diff aceita somente/);
  expectRejected(['reset', '--hard', 'HEAD'], /nao permitida/);
  expectRejected(['push', '--force'], /nao permitida/);

  assert.equal(
    normalizeQuizRemote('https://github.com/dleomil/quiz.git'),
    'https://github.com/dleomil/quiz',
  );
  assert.deepStrictEqual(
    authorizeQuizPush({
      remoteUrl: 'git@github.com:dleomil/quiz.git',
      branch: 'feature/t3-portugues',
    }),
    ['push', 'origin', 'HEAD:refs/heads/feature/t3-portugues'],
  );
  [
    { remoteUrl: 'https://github.com/other/project.git', branch: 'feature/a' },
    { remoteUrl: 'https://github.com/dleomil/quiz.git', branch: 'main' },
    { remoteUrl: 'https://github.com/dleomil/quiz.git', branch: 'develop' },
    { remoteUrl: 'https://github.com/dleomil/quiz.git', branch: 'release/a' },
  ].forEach((input) => {
    assert.throws(() => authorizeQuizPush(input));
  });

  process.stdout.write('codex-safe-git: ok\n');
}

run();
