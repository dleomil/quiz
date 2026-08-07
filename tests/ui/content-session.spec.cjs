/* global App, QuestionsDB */
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4182;
const baseUrl = `http://127.0.0.1:${port}`;
const timeoutMs = 15000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry until the local server starts.
    }
    await wait(250);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

async function run() {
  const server = spawn(
    'python3',
    ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
    { cwd: repoRoot, stdio: 'ignore' },
  );

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const legacySession = {
      date: '01/08/2026 10:00',
      subject: 'portugues',
      topicId: 'all',
      topic: 'Português',
      correct: 8,
      total: 10,
      pct: 80,
      durationSec: 300,
      timedOutCount: 0,
    };

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.evaluate((session) => {
      localStorage.setItem('quiz_etapa_v1', JSON.stringify([session]));
    }, legacySession);
    await page.reload({ waitUntil: 'networkidle' });

    const legacySnapshot = await page.evaluate(() => ({
      selectedContentSet: Store.get().selectedContentSet,
      history: Store.get().history,
      persisted: JSON.parse(localStorage.getItem('quiz_etapa_v1')),
      questionContentSets: QuestionsDB.getRandom(
        3,
        'all',
        'portugues',
        '2026-t1-v1',
      ).map((question) => question.contentSetId),
    }));

    assert.strictEqual(legacySnapshot.selectedContentSet, '2026-t1-v1');
    assert.strictEqual(
      legacySnapshot.history[0].schemaVersion,
      'legacy-session-v1',
    );
    assert.strictEqual(
      legacySnapshot.history[0].contentSetId,
      'legacy-unclassified',
    );
    assert.strictEqual(legacySnapshot.persisted[0].schemaVersion, undefined);
    assert.ok(
      legacySnapshot.questionContentSets.every(
        (contentSetId) => contentSetId === '2026-t1-v1',
      ),
    );

    const newSession = await page.evaluate(() => {
      const question = QuestionsDB.getRandom(
        1,
        'all',
        'portugues',
        '2026-t1-v1',
      )[0];
      Store.set({
        selectedSubject: question.subject,
        selectedTopic: question.topic,
        selectedContentSet: '2026-t1-v1',
        questions: [question],
        answers: [
          {
            id: question.id,
            selected: question.correctIndex,
            correct: question.correctIndex,
            isCorrect: true,
            isTimeout: false,
          },
        ],
        sessionStart: Date.now() - 1000,
      });
      App.finishQuiz();
      return JSON.parse(localStorage.getItem('quiz_etapa_v1'))[0];
    });

    assert.strictEqual(newSession.schemaVersion, 'session-v2');
    assert.strictEqual(newSession.contentSetId, '2026-t1-v1');
    assert.strictEqual(newSession.contentVersion, 1);
    assert.strictEqual(newSession.questionIds.length, 1);
    assert.strictEqual(
      newSession.answers[0].questionId,
      newSession.questionIds[0],
    );
    assert.strictEqual(newSession.score.pct, 100);
    assert.ok(newSession.sessionId);
    assert.ok(newSession.startedAt);
    assert.ok(newSession.finishedAt);

    await browser.close();
    console.log('content-session-ui: ok');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
