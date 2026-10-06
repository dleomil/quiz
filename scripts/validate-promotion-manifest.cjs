const fs = require('node:fs');
const { validateManifest } = require('./merge-message-policy.cjs');

const path = process.argv[2] || '.github/promotion-manifest.json';
const mergeMessagePath = '.github/merge-message-manifest.json';
const ascii = /^[\x20-\x7E]+$/;
const asciiLines = /^[\x20-\x7E\n]+$/;

function fail(message) {
  process.stderr.write(`promotion-manifest: ${message}\n`);
  process.exitCode = 1;
}

try {
  const manifest = JSON.parse(fs.readFileSync(path, 'utf8'));
  const mergeMessage = JSON.parse(fs.readFileSync(mergeMessagePath, 'utf8'));
  const required = ['base', 'head', 'title', 'body', 'checks', 'rollback'];
  const unknown = Object.keys(manifest).filter(
    (key) => !required.includes(key),
  );
  if (unknown.length) fail(`campos nao autorizados: ${unknown.join(', ')}`);
  required.forEach((key) => {
    if (!manifest[key]) fail(`${key} obrigatorio`);
  });
  if (manifest.base !== 'main') fail('base deve ser main');
  if (manifest.head !== 'develop' && !/^release\/.+/.test(manifest.head)) {
    fail('head deve ser develop ou release/*');
  }
  if (!ascii.test(manifest.title) || manifest.title.length > 72) {
    fail('title deve ser ASCII e ter no maximo 72 caracteres');
  }
  const lines = String(manifest.body).trim().split('\n');
  if (!asciiLines.test(manifest.body) || lines.length < 3 || lines.length > 5) {
    fail('body deve ser ASCII com 3 a 5 linhas');
  }
  if (!Array.isArray(manifest.checks) || !manifest.checks.length) {
    fail('checks deve ser lista nao vazia');
  }
  if (!ascii.test(manifest.rollback)) fail('rollback deve ser ASCII');
  if (manifest.title !== mergeMessage.subject) {
    fail('title deve corresponder ao subject do manifesto de merge');
  }
  if (manifest.body !== mergeMessage.body) {
    fail('body deve corresponder ao manifesto de merge');
  }
  validateManifest(mergeMessage, {
    baseRef: manifest.base,
    headRef: manifest.head,
  }).forEach(fail);
  if (!process.exitCode) process.stdout.write('promotion-manifest: ok\n');
} catch (error) {
  fail(`invalido: ${error.message}`);
}
