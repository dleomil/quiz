const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const MANIFEST_PATH = '.github/merge-message-manifest.json';
const ASCII = /^[\x20-\x7E]+$/;
const ASCII_LINES = /^[\x20-\x7E\n]+$/;
const TEMPLATES = {
  promotion: {
    base: 'main',
    subject: 'Promove pacote aprovado para main',
    body: [
      'Objetivo: publicar o pacote aprovado.',
      'Escopo: conteudo T3 validado.',
      'Verificacoes: testes e validacoes aprovados.',
      'Reversao: reverter este merge.',
    ].join('\n'),
  },
  reconciliation: {
    base: 'develop',
    subject: 'Reconciliacao apos publicacao em develop',
    body: [
      'Objetivo: integrar main em develop.',
      'Escopo: preservar alteracoes de develop.',
      'Verificacoes: testes e ancestralidade aprovados.',
      'Reversao: reverter este merge.',
    ].join('\n'),
  },
};
const MANIFEST_KEYS = [
  'schemaVersion',
  'operation',
  'base',
  'head',
  'subject',
  'body',
];

function operationFor(baseRef, headRef) {
  if (
    baseRef === 'main' &&
    (headRef === 'develop' || /^(?:release)\/.+/.test(headRef || ''))
  ) {
    return 'promotion';
  }
  if (
    baseRef === 'develop' &&
    /^chore\/reconcile-main-develop(?:$|[-/])/.test(headRef || '')
  ) {
    return 'reconciliation';
  }
  return null;
}

function validateManifest(manifest, context = {}) {
  const { baseRef, headRef, prTitle, prBody } = context;
  const operation = operationFor(baseRef, headRef);
  if (!operation) return [];

  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return ['manifesto de mensagem de merge obrigatorio'];
  }

  const unknown = Object.keys(manifest).filter(
    (key) => !MANIFEST_KEYS.includes(key),
  );
  if (unknown.length) {
    errors.push(`campos nao autorizados: ${unknown.join(', ')}`);
  }
  MANIFEST_KEYS.forEach((key) => {
    if (!manifest[key]) errors.push(`${key} obrigatorio`);
  });

  const template = TEMPLATES[operation];
  if (manifest.schemaVersion !== 'merge-message-v1') {
    errors.push('schemaVersion deve ser merge-message-v1');
  }
  if (manifest.operation !== operation) {
    errors.push(`operation deve ser ${operation}`);
  }
  if (manifest.base !== template.base || baseRef !== template.base) {
    errors.push(`base deve ser ${template.base}`);
  }
  if (manifest.head !== headRef) {
    errors.push('head do manifesto deve corresponder a headRef');
  }
  if (!ASCII.test(manifest.subject || '')) {
    errors.push('subject deve conter somente caracteres ASCII');
  }
  if (manifest.subject !== template.subject) {
    errors.push('subject deve corresponder ao modelo em portugues');
  }
  if (typeof manifest.body !== 'string' || !ASCII_LINES.test(manifest.body)) {
    errors.push('body deve conter somente caracteres ASCII');
  }
  if (manifest.body !== template.body) {
    errors.push('body deve corresponder ao modelo em portugues');
  }
  if (prTitle !== undefined && prTitle !== manifest.subject) {
    errors.push('titulo da PR deve corresponder ao subject do manifesto');
  }
  if (prBody !== undefined && prBody !== manifest.body) {
    errors.push('corpo da PR deve corresponder ao body do manifesto');
  }

  return errors;
}

function auditCommitMessage(manifest, context = {}) {
  const errors = validateManifest(manifest, context);
  const operation = operationFor(context.baseRef, context.headRef);
  if (!operation || errors.length) return errors;

  const expected = `${manifest.subject}\n\n${manifest.body}`;
  const actual = String(context.commitMessage || '').replace(/\n+$/, '');
  if (actual !== expected) {
    errors.push('mensagem efetiva do merge diverge do manifesto');
  }
  return errors;
}

function readManifest(path = MANIFEST_PATH) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function report(errors, successMessage, skippedMessage) {
  if (errors.length) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`${successMessage || skippedMessage}\n`);
  }
}

if (require.main === module) {
  const mode = process.argv[2] || 'validate-pr';
  const context = {
    baseRef: process.env.BASE_REF,
    headRef: process.env.HEAD_REF,
    prTitle: process.env.PR_TITLE,
    prBody: process.env.PR_BODY,
  };
  const operation = operationFor(context.baseRef, context.headRef);

  if (mode === 'audit-merge') {
    if (!operation) {
      process.stdout.write('merge-message-audit: nao aplicavel\n');
    } else {
      const mergeSha = process.env.MERGE_SHA;
      const headSha = execFileSync('git', ['rev-parse', 'HEAD'], {
        encoding: 'utf8',
      }).trim();
      if (!mergeSha || mergeSha !== headSha) {
        report(['HEAD deve corresponder ao SHA mesclado'], '', '');
      } else {
        const manifest = readManifest();
        const commitMessage = execFileSync(
          'git',
          ['show', '-s', '--format=%B', mergeSha],
          { encoding: 'utf8' },
        );
        report(
          auditCommitMessage(manifest, { ...context, commitMessage }),
          'merge-message-audit: ok',
          '',
        );
      }
    }
  } else if (mode === 'validate-pr') {
    if (!operation) {
      process.stdout.write('merge-message-policy: nao aplicavel\n');
    } else {
      report(
        validateManifest(readManifest(), context),
        'merge-message-policy: ok',
        '',
      );
    }
  } else {
    report([`modo invalido: ${mode}`], '', '');
  }
}

module.exports = {
  MANIFEST_KEYS,
  TEMPLATES,
  auditCommitMessage,
  operationFor,
  validateManifest,
};
