const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function fixtureRepository(root, directory) {
  const target = path.join(directory, 'repo');
  execFileSync('git', [
    'clone',
    '--quiet',
    '--shared',
    '--no-hardlinks',
    root,
    target,
  ]);
  for (const name of [
    'scripts/agent-context.cjs',
    'scripts/agent-auth.cjs',
    'scripts/agent-run-receipt.cjs',
    'scripts/run-editorial-agent.cjs',
    'config/agent-context-policy.json',
  ]) {
    fs.copyFileSync(path.join(root, name), path.join(target, name));
  }
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, 'config/document-catalog.json')),
  );
  for (const doc of catalog.documents.filter((item) => item.normative)) {
    fs.mkdirSync(path.dirname(path.join(target, doc.path)), {
      recursive: true,
    });
    fs.copyFileSync(path.join(root, doc.path), path.join(target, doc.path));
  }
  fs.copyFileSync(
    path.join(root, 'config/document-catalog.json'),
    path.join(target, 'config/document-catalog.json'),
  );
  execFileSync(
    'git',
    [
      'add',
      '--',
      'scripts',
      'config/agent-context-policy.json',
      'config/document-catalog.json',
      'docs',
      'AGENTS.md',
    ],
    { cwd: target },
  );
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '--quiet',
      '--allow-empty',
      '-m',
      'Prepara fixture isolada',
    ],
    { cwd: target },
  );
  const { baseline } = require(
    path.join(target, 'scripts/document-catalog.cjs'),
  );
  const snapshot = baseline(target, 'HEAD');
  const policyPath = path.join(target, 'config/agent-context-policy.json');
  const policy = JSON.parse(fs.readFileSync(policyPath));
  policy.approvals = [
    {
      sourceCommit: snapshot.sourceCommit,
      sha256: snapshot.sha256,
      evidenceRef: 'https://github.com/dleomil/quiz/issues/1#issuecomment-1',
    },
  ];
  fs.writeFileSync(policyPath, JSON.stringify(policy));
  execFileSync('git', ['add', '--', 'config/agent-context-policy.json'], {
    cwd: target,
  });
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '--quiet',
      '-m',
      'Vincula aceite exclusivamente ficticio',
    ],
    { cwd: target },
  );
  return target;
}
function workFor(root, input, role) {
  const { requiredPaths } = require(
    path.join(root, 'scripts/agent-context.cjs'),
  );
  const policy = JSON.parse(
    fs.readFileSync(path.join(root, 'config/agent-context-policy.json')),
  );
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, 'config/document-catalog.json')),
  );
  const work = {
    schemaVersion: 'agent-work-v1',
    id: input.workItemId,
    objective: input.authorizedObjective,
    baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).trim(),
    role,
    subjectId: input.subjectId,
    curriculumCycle: `${input.academicYear}-${input.term}`,
    dependencies: [],
    documents: [],
    requirements: ['Cumprir o contrato editorial.'],
    validExamples: ['Pergunta clara e apoio especifico sem revelar resposta.'],
    invalidExamples: [
      'Pergunta de Historia em ingles ou ingles sem apoio em portugues.',
    ],
    allowedPaths: [],
    acceptanceCriteria: ['Saida valida, com fatos e achados.'],
    commands: [],
    evidence: [],
    independentVerifier: 'verificador-em-execucao-separada',
    stopConditions: ['Contrato ausente ou divergente.'],
    rollback: 'Descartar a proposta sem publicar.',
  };
  work.documents = requiredPaths(work, root).map((name) => {
    const doc = catalog.documents.find((item) => item.path === name);
    return {
      id: doc.id,
      version: doc.version,
      sha256: doc.sha256,
      sourceCommit: policy.approvals[0].sourceCommit,
    };
  });
  return work;
}
function commentFor(root) {
  const rule = JSON.parse(
    fs.readFileSync(path.join(root, 'config/agent-context-policy.json')),
  ).approvals[0];
  return {
    html_url: rule.evidenceRef,
    user: { login: 'dleomil', type: 'User' },
    created_at: '2026-10-19T17:48:09Z',
    body: `Aprovo o baseline documental hash ${rule.sha256}`,
  };
}
module.exports = { fixtureRepository, workFor, commentFor };
