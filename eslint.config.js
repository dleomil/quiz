const js = require('@eslint/js');

const commonGlobals = {
  console: 'readonly',
  Blob: 'readonly',
  URL: 'readonly',
  confirm: 'readonly',
  fetch: 'readonly',
  getComputedStyle: 'readonly',
  localStorage: 'readonly',
  requestAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  document: 'readonly',
  window: 'readonly',
  Chart: 'readonly',
};

const browserGlobals = {
  ...commonGlobals,
};

const nodeGlobals = {
  ...commonGlobals,
  __dirname: 'readonly',
  Buffer: 'readonly',
  clearImmediate: 'readonly',
  global: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly',
  setImmediate: 'readonly',
  Store: 'readonly',
};

module.exports = [
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'eslint.config.js'],
  },
  js.configs.recommended,
  {
    files: ['js/**/*.js', '*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: browserGlobals,
    },
  },
  {
    files: ['scripts/**/*.js', 'tests/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: nodeGlobals,
    },
  },
  {
    files: ['tests/**/*.cjs'],
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
