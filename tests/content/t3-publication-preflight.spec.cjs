const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  evaluateTopics,
  parseArguments,
} = require('../../scripts/t3-publication-preflight.cjs');

const contentSetId = '2026-t3-v1';

function fixtures({ completed = ['tema-pronto'], incomplete = [] } = {}) {
  const questions = [];
  completed.forEach((topic) => {
    for (let index = 0; index < 20; index += 1) {
      questions.push({
        contentSetId,
        topic,
        reviewStatus: 'published',
      });
    }
  });
  incomplete.forEach((topic) => {
    for (let index = 0; index < 8; index += 1) {
      questions.push({
        contentSetId,
        topic,
        reviewStatus: 'draft',
      });
    }
  });
  const topics = Object.fromEntries(
    [...completed, ...incomplete].map((topic) => [topic, 20]),
  );
  return {
    sources: { portugues: { questions } },
    coverageManifest: {
      contentSets: { [contentSetId]: { subjects: { portugues: topics } } },
    },
    contentCatalog: [{ contentSetId, status: 'published' }],
  };
}

function run() {
  assert.deepEqual(
    parseArguments([
      '--subject',
      'portugues',
      '--topic',
      'um',
      '--topic',
      'dois',
    ]),
    { subject: 'portugues', topics: ['um', 'dois'] },
  );
  assert.throws(() => parseArguments([]), /--subject obrigatorio/);
  assert.throws(
    () => parseArguments(['--subject', 'portugues']),
    /informe ao menos um --topic/,
  );
  assert.throws(
    () =>
      parseArguments([
        '--subject',
        'portugues',
        '--topic',
        'um',
        '--topic',
        'um',
      ]),
    /--topic duplicado/,
  );

  const completed = evaluateTopics({
    ...fixtures({ completed: ['tema-pronto'] }),
    subject: 'portugues',
    topics: ['tema-pronto'],
  });
  assert.equal(completed.decision, 'stop_already_complete');
  assert.equal(completed.topics[0].actual, 20);

  const incomplete = evaluateTopics({
    ...fixtures({ incomplete: ['tema-aberto'] }),
    subject: 'portugues',
    topics: ['tema-aberto'],
  });
  assert.equal(incomplete.decision, 'proceed_to_planning');
  assert.equal(incomplete.topics[0].actual, 8);

  const mixed = evaluateTopics({
    ...fixtures({ completed: ['tema-pronto'], incomplete: ['tema-aberto'] }),
    subject: 'portugues',
    topics: ['tema-pronto', 'tema-aberto'],
  });
  assert.equal(mixed.decision, 'stop_already_complete');

  assert.throws(
    () =>
      evaluateTopics({
        ...fixtures(),
        subject: 'portugues',
        topics: ['tema-fora-do-manifesto'],
      }),
    /tema nao declarado no manifesto T3/,
  );

  const root = path.resolve(__dirname, '../..');
  const actual = spawnSync(
    process.execPath,
    [
      path.join(root, 'scripts/t3-publication-preflight.cjs'),
      '--subject',
      'portugues',
      '--topic',
      'adjetivos',
    ],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(actual.status, 2);
  assert.match(actual.stdout, /"decision":"stop_already_complete"/);
  assert.match(actual.stdout, /"actual":20,"expected":20/);

  console.log('t3-publication-preflight: ok');
}

run();
