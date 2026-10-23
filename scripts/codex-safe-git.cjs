#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const ALLOWED_QUIZ_BRANCH_PREFIXES = [
  'feature/',
  'fix/',
  'chore/',
  'docs/',
  'refactor/',
];

function fail(message) {
  const error = new Error(message);
  error.code = 'SAFE_GIT_REJECTED';
  throw error;
}

function validatePaths(paths) {
  if (!paths.length) fail('Informe ao menos um caminho depois de --.');
  paths.forEach((filePath) => {
    if (
      !filePath ||
      filePath.startsWith('-') ||
      filePath.startsWith(':(') ||
      path.isAbsolute(filePath) ||
      filePath.split(/[\\/]/).includes('..')
    ) {
      fail(`Caminho nao permitido: ${filePath}`);
    }
  });
}

function parsePathList(args) {
  const separatorIndex = args.indexOf('--');
  if (separatorIndex < 0 || separatorIndex !== 0) {
    fail('Use -- antes dos caminhos.');
  }
  const paths = args.slice(1);
  validatePaths(paths);
  return paths;
}

function validateBranchName(branch) {
  if (
    typeof branch !== 'string' ||
    !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(branch) ||
    branch.includes('..') ||
    branch.includes('//') ||
    branch.endsWith('/') ||
    branch.endsWith('.') ||
    branch.endsWith('.lock')
  ) {
    fail(`Nome de branch nao permitido: ${branch}`);
  }
}

function normalizeQuizRemote(remoteUrl) {
  if (typeof remoteUrl !== 'string') return null;
  const normalized = remoteUrl
    .trim()
    .replace(/\.git$/i, '')
    .replace(/\/$/, '')
    .toLowerCase();
  const accepted = [
    'https://github.com/dleomil/quiz',
    'ssh://git@github.com/dleomil/quiz',
    'git@github.com:dleomil/quiz',
  ];
  return accepted.includes(normalized) ? normalized : null;
}

function authorizeQuizPush({ remoteUrl, branch }) {
  if (!normalizeQuizRemote(remoteUrl)) {
    fail('Push automatico permitido somente para dleomil/quiz.');
  }
  validateBranchName(branch);
  if (
    !ALLOWED_QUIZ_BRANCH_PREFIXES.some((prefix) => branch.startsWith(prefix))
  ) {
    fail(
      'Push automatico permitido somente para branches temporarias de trabalho.',
    );
  }
  return ['push', 'origin', `HEAD:refs/heads/${branch}`];
}

function resolveCommand(args) {
  const [operation, ...rest] = args;
  if (!operation) fail('Informe uma operacao segura do Git.');

  if (operation === 'status' && rest.length === 0) {
    return { gitArgs: ['status', '--short', '--branch'] };
  }
  if (operation === 'diff') {
    if (rest.length === 0) {
      return {
        gitArgs: ['--no-pager', 'diff', '--no-ext-diff', '--no-textconv'],
      };
    }
    if (rest.length === 1 && rest[0] === '--cached') {
      return {
        gitArgs: [
          '--no-pager',
          'diff',
          '--no-ext-diff',
          '--no-textconv',
          '--cached',
        ],
      };
    }
    if (rest.length === 1 && rest[0] === '--check') {
      return {
        gitArgs: [
          '--no-pager',
          'diff',
          '--no-ext-diff',
          '--no-textconv',
          '--check',
        ],
      };
    }
    if (rest.length === 1 && rest[0] === '--stat') {
      return {
        gitArgs: [
          '--no-pager',
          'diff',
          '--no-ext-diff',
          '--no-textconv',
          '--stat',
        ],
      };
    }
    fail('diff aceita somente --cached, --check ou --stat.');
  }
  if (operation === 'add') {
    return { gitArgs: ['add', '--', ...parsePathList(rest)] };
  }
  if (operation === 'commit') {
    if (rest[0] !== '--message' || !rest[1] || rest[2] !== '--') {
      fail(
        'Use commit --message <texto> -- <caminhos>; amend nao e permitido.',
      );
    }
    const message = rest[1];
    const paths = parsePathList(rest.slice(2));
    return {
      gitArgs: ['commit', '--only', '--message', message, '--', ...paths],
    };
  }
  if (operation === 'switch') {
    if (rest.length === 2 && rest[0] === '--create') {
      validateBranchName(rest[1]);
      return { gitArgs: ['switch', '--create', rest[1]] };
    }
    if (rest.length === 1) {
      validateBranchName(rest[0]);
      return { gitArgs: ['switch', rest[0]] };
    }
    fail('Use switch <branch> ou switch --create <branch>.');
  }
  if (operation === 'push-quiz' && rest.length === 0) {
    return { operation };
  }
  fail(`Operacao Git nao permitida: ${operation}`);
}

function captureGit(gitArgs, cwd) {
  const result = spawnSync('git', gitArgs, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    fail((result.stderr || 'Falha ao consultar o repositorio Git.').trim());
  }
  return result.stdout.trim();
}

function execute(args, options = {}) {
  const cwd = options.cwd || process.cwd();
  const command = resolveCommand(args);
  let gitArgs = command.gitArgs;

  if (command.operation === 'push-quiz') {
    const remoteUrl = captureGit(['remote', 'get-url', 'origin'], cwd);
    const branch = captureGit(['branch', '--show-current'], cwd);
    gitArgs = authorizeQuizPush({ remoteUrl, branch });
  }

  const result = spawnSync('git', gitArgs, {
    cwd,
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) throw result.error;
  return result.status === null ? 1 : result.status;
}

if (require.main === module) {
  try {
    process.exitCode = execute(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`codex-safe-git: ${error.message}\n`);
    process.exitCode = 2;
  }
}

module.exports = {
  ALLOWED_QUIZ_BRANCH_PREFIXES,
  authorizeQuizPush,
  execute,
  normalizeQuizRemote,
  parsePathList,
  resolveCommand,
  validateBranchName,
  validatePaths,
};
