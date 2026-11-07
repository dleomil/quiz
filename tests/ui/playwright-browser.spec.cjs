const assert = require('node:assert/strict');
const { launchOptions } = require('./playwright-browser.cjs');

assert.deepEqual(launchOptions({ headless: true }, undefined), {
  headless: true,
});
assert.deepEqual(launchOptions({ headless: true }, 'chrome'), {
  headless: true,
  channel: 'chrome',
});

process.stdout.write(
  'playwright-browser: ok (canal Chrome selecionado sem instalar Chromium)\n',
);
