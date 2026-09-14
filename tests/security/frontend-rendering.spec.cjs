const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..', '..');
const UTILS = path.join(ROOT, 'js', 'utils.js');
const STORE = path.join(ROOT, 'js', 'store.js');

{
  const context = vm.createContext({ window: {} });
  vm.runInContext(
    fs.readFileSync(UTILS, 'utf8') + '\nthis.__escapeHTML = escapeHTML;',
    context,
    { filename: UTILS },
  );
  assert.equal(context.__escapeHTML(`<&>"'`), '&lt;&amp;&gt;&quot;&#39;');
  assert.equal(context.__escapeHTML(null), '');
  assert.equal(context.__escapeHTML('&lt;img>'), '&amp;lt;img&gt;');
}

function loadStore(rawValue) {
  const writes = [];
  const storage = {
    getItem() {
      return rawValue;
    },
    setItem(key, value) {
      writes.push([key, value]);
    },
  };
  const context = vm.createContext({
    ContentCatalog: {
      LEGACY_CONTENT_SET_ID: 'legacy-unclassified',
      getDefault() {
        return { contentSetId: '2026-t2-v1' };
      },
    },
    localStorage: storage,
  });
  vm.runInContext(
    fs.readFileSync(STORE, 'utf8') + '\nthis.__Store = Store;',
    context,
    { filename: STORE },
  );
  return { store: context.__Store, writes };
}

function currentSession(overrides) {
  return Object.assign(
    {
      schemaVersion: 'session-v2',
      sessionId: 'session-safe-rendering',
      startedAt: '2026-09-14T12:00:00.000Z',
      finishedAt: '2026-09-14T12:01:00.000Z',
      contentSetId: '2026-t2-v1',
      contentVersion: 1,
      questionIds: ['question-1'],
      answers: [
        {
          questionId: 'question-1',
          selectedIndex: 0,
          isCorrect: true,
          isTimeout: false,
        },
      ],
      score: { correct: 1, total: 1, pct: 100 },
      date: '14/09/2026 09:01',
      subject: 'portugues',
      topicId: 'all',
      topic: 'Texto <img src=x onerror="window.__xss=1">',
      correct: 1,
      total: 1,
      pct: 100,
      durationSec: 60,
      timedOutCount: 0,
      unknown: 'must not escape the normalized copy',
    },
    overrides,
  );
}

function legacySession(index) {
  return {
    date: `01/09/2026 10:${String(index).padStart(2, '0')}`,
    subject: 'portugues',
    topicId: 'all',
    topic: 'Português <svg onload="window.__xss=1"></svg>',
    correct: 1,
    total: 2,
    pct: 50,
    durationSec: 30,
    timedOutCount: 0,
  };
}

['{invalid', '{}', 'null', '"text"'].forEach((rawValue) => {
  const loaded = loadStore(rawValue);
  assert.deepEqual(Array.from(loaded.store.get().history), []);
  assert.deepEqual(loaded.writes, []);
});

{
  const invalidScore = currentSession({
    sessionId: 'invalid-score',
    score: { correct: 0, total: 1, pct: 0 },
  });
  const invalidDate = currentSession({
    sessionId: 'invalid-date',
    startedAt: '09/14/2026 12:00',
  });
  const raw = JSON.stringify([
    currentSession(),
    invalidScore,
    invalidDate,
    legacySession(1),
    null,
    [],
  ]);
  const loaded = loadStore(raw);
  const history = Array.from(loaded.store.get().history);
  assert.equal(history.length, 2);
  assert.equal(history[0].schemaVersion, 'session-v2');
  assert.equal(history[0].topic, 'Texto <img src=x onerror="window.__xss=1">');
  assert.equal(history[0].unknown, undefined);
  assert.equal(history[1].schemaVersion, 'legacy-session-v1');
  assert.equal(history[1].contentSetId, 'legacy-unclassified');
  assert.deepEqual(loaded.writes, []);
}

{
  const raw = JSON.stringify(
    Array.from({ length: 65 }, (_, index) => legacySession(index)),
  );
  const loaded = loadStore(raw);
  assert.equal(loaded.store.get().history.length, 60);
  assert.deepEqual(loaded.writes, []);
}

const runtimeSources = [
  'js/views/home.js',
  'js/views/subject.js',
  'js/views/quiz.js',
  'js/views/results.js',
  'js/views/history.js',
].map((relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8'));
runtimeSources.forEach((source) => assert.doesNotMatch(source, /\son[a-z]+=/i));

process.stdout.write('frontend-rendering-security: ok\n');
