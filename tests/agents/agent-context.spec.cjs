const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  fixtureRepository,
  workFor,
  commentFor,
} = require('./context-test-support.cjs');
const original = path.resolve(__dirname, '../..');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-context-test-'));
try {
  const root = fixtureRepository(original, directory);
  const { buildContext, renderContext, requiredPaths, validateWork } = require(
    path.join(root, 'scripts/agent-context.cjs'),
  );
  const input = {
    ...require('../fixtures/agents/editorial-scenarios.json')[1].input,
    subjectId: 'ingles',
    term: 't3',
  };
  const work = workFor(root, input, 'pedagogical-quality');
  const comment = commentFor(root);
  const readComment = () => comment;
  const bundle = buildContext(work, { root, readComment });
  assert.ok(
    bundle.documents.some((doc) => doc.path.includes('english-t2-bilingual')),
  );
  assert.ok(
    bundle.documents.some((doc) =>
      doc.path.includes('third-trimester-curriculum'),
    ),
  );
  for (const doc of bundle.documents)
    assert.ok(renderContext(bundle).includes(doc.content));
  assert.ok(bundle.approvals[0].evidenceRef.endsWith('#issuecomment-1'));
  assert.equal(bundle.documents.length, work.documents.length);
  const noEnglish = JSON.parse(JSON.stringify(work));
  assert.throws(
    () => requiredPaths({ ...work, curriculumCycle: '2027-t1' }, root),
    /ciclo sem manifesto/,
  );
  assert.ok(
    requiredPaths({ ...work, role: 'content-curator' }, root).includes(
      'docs/architecture/target-architecture.md',
    ),
  );
  noEnglish.documents = noEnglish.documents.filter(
    (doc) => !doc.id.includes('english-t2'),
  );
  assert.throws(
    () => buildContext(noEnglish, { root, readComment }),
    /contexto incompleto/,
  );
  assert.throws(
    () =>
      buildContext(
        { ...work, baseCommit: '0'.repeat(40) },
        { root, readComment },
      ),
    /base mudou/,
  );
  assert.throws(
    () =>
      buildContext(work, {
        root,
        readComment: () => ({ ...comment, body: 'Aprovado' }),
      }),
    /aceite documental/,
  );
  const stale = JSON.parse(JSON.stringify(work));
  stale.documents[0].sha256 = '0'.repeat(64);
  assert.throws(
    () => buildContext(stale, { root, readComment }),
    /aceite desatualizado/,
  );
  const bad = JSON.parse(JSON.stringify(bundle));
  bad.documents[0].content += ' alterado';
  assert.throws(() => renderContext(bad), /adulterado/);
  assert.throws(() => validateWork({ ...work, ignored: true }), /campos/);
  assert.throws(
    () =>
      validateWork({
        ...work,
        documents: [...work.documents, work.documents[0]],
      }),
    /duplicado/,
  );
  const rules = JSON.parse(
    fs.readFileSync(path.join(root, 'config/agent-context-policy.json')),
  );
  rules.dependencies['AGENTS.md'] = ['docs/agents/agent-operating-model.md'];
  rules.dependencies['docs/agents/agent-operating-model.md'] = ['AGENTS.md'];
  assert.ok(
    requiredPaths(work, root, rules).includes(
      'docs/agents/agent-operating-model.md',
    ),
  );
  const name = path.join(
    root,
    'docs/specs/english-t2-bilingual-question-support.md',
  );
  const source = fs.readFileSync(name);
  fs.appendFileSync(name, '\nMudanca sem nova aprovacao.\n');
  assert.throws(
    () => buildContext(work, { root, readComment }),
    /hash documental/,
  );
  fs.unlinkSync(name);
  assert.throws(() => buildContext(work, { root, readComment }), /ENOENT/);
  fs.writeFileSync(name, source);
  const catalogPath = path.join(root, 'config/document-catalog.json');
  const catalogSource = fs.readFileSync(catalogPath);
  fs.appendFileSync(catalogPath, '\n');
  assert.throws(
    () => buildContext(work, { root, readComment }),
    /configuracao mudou/,
  );
  fs.writeFileSync(catalogPath, catalogSource);
  const policyPath = path.join(root, 'config/agent-context-policy.json');
  fs.appendFileSync(policyPath, '\n');
  assert.throws(
    () => buildContext(work, { root, readComment }),
    /configuracao mudou/,
  );
  process.stdout.write(
    'agent-context: ok (contratos completos, apoio de Ingles, hashes e aceite)\n',
  );
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
