const assert = require('node:assert/strict');
const {
  TEMPLATES,
  auditCommitMessage,
  operationFor,
  validateManifest,
} = require('../../scripts/merge-message-policy.cjs');

function manifestFor(operation, headRef) {
  return {
    schemaVersion: 'merge-message-v1',
    operation,
    base: TEMPLATES[operation].base,
    head: headRef,
    subject: TEMPLATES[operation].subject,
    body: TEMPLATES[operation].body,
  };
}

function run() {
  const promotion = manifestFor('promotion', 'develop');
  const promotionContext = {
    baseRef: 'main',
    headRef: 'develop',
    prTitle: promotion.subject,
    prBody: promotion.body,
  };
  assert.deepStrictEqual(validateManifest(promotion, promotionContext), []);
  assert.deepStrictEqual(
    validateManifest(manifestFor('promotion', 'release/approved'), {
      ...promotionContext,
      headRef: 'release/approved',
      prTitle: TEMPLATES.promotion.subject,
    }),
    [],
  );

  const reconciliation = manifestFor(
    'reconciliation',
    'chore/reconcile-main-develop-portugues',
  );
  const reconciliationContext = {
    baseRef: 'develop',
    headRef: reconciliation.head,
    prTitle: reconciliation.subject,
    prBody: reconciliation.body,
  };
  assert.deepStrictEqual(
    validateManifest(reconciliation, reconciliationContext),
    [],
  );
  assert.deepStrictEqual(
    auditCommitMessage(reconciliation, {
      ...reconciliationContext,
      commitMessage: `${reconciliation.subject}\n\n${reconciliation.body}\n`,
    }),
    [],
  );

  assert.strictEqual(operationFor('develop', 'feature/atividade'), null);
  assert.deepStrictEqual(
    validateManifest(null, {
      baseRef: 'develop',
      headRef: 'feature/atividade',
    }),
    [],
  );

  assert.ok(
    validateManifest(promotion, {
      ...promotionContext,
      prTitle: 'Merge pull request #1 from owner/release',
    }).some((error) => error.includes('titulo da PR')),
  );
  assert.ok(
    validateManifest(
      { ...promotion, subject: 'Promotes approved content to main' },
      promotionContext,
    ).some((error) => error.includes('subject deve corresponder')),
  );
  assert.ok(
    validateManifest(
      { ...promotion, body: `${promotion.body}\nExtra.` },
      {
        ...promotionContext,
        prBody: `${promotion.body}\nExtra.`,
      },
    ).some((error) => error.includes('body deve corresponder')),
  );
  assert.ok(
    validateManifest(
      { ...promotion, subject: 'Promoção para main' },
      {
        ...promotionContext,
        prTitle: 'Promoção para main',
      },
    ).some((error) => error.includes('ASCII')),
  );
  assert.ok(
    validateManifest(promotion, {
      ...promotionContext,
      headRef: 'release/another',
    }).some((error) => error.includes('head do manifesto')),
  );
  assert.ok(
    validateManifest({ ...promotion, extra: true }, promotionContext).some(
      (error) => error.includes('campos nao autorizados'),
    ),
  );

  const validCommit = `${promotion.subject}\n\n${promotion.body}\n`;
  assert.deepStrictEqual(
    auditCommitMessage(promotion, {
      ...promotionContext,
      commitMessage: validCommit,
    }),
    [],
  );
  assert.ok(
    auditCommitMessage(promotion, {
      ...promotionContext,
      commitMessage:
        'Merge pull request #1 from owner/develop\n\n' + promotion.body,
    }).some((error) => error.includes('mensagem efetiva')),
  );

  process.stdout.write('merge-message-policy: ok\n');
}

run();
