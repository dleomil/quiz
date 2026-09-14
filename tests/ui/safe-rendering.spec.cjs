/* global App, DOMParser, QuestionsDB */
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4187;
const baseUrl = `http://127.0.0.1:${port}`;
const timeoutMs = 15000;
const payload =
  '<img src=x onerror=__xss=1>' +
  '<script>__xss=2</script>' +
  '<svg onload=__xss=3></svg>' +
  '<iframe srcdoc="<script>parent.__xss=4</script>"></iframe>';
const unsafeSelector =
  'script,img,svg,iframe,[onerror],[onload],[onclick],[srcdoc]';

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
      // Retry while the local server starts.
    }
    await wait(250);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

function historySession(topic, invalid) {
  return {
    schemaVersion: 'session-v2',
    sessionId: invalid ? 'invalid-session' : 'safe-rendering-session',
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
    score: invalid
      ? { correct: 0, total: 1, pct: 0 }
      : { correct: 1, total: 1, pct: 100 },
    date: '14/09/2026 09:01',
    subject: 'portugues',
    topicId: 'unknown-safe-rendering-topic',
    topic,
    correct: 1,
    total: 1,
    pct: 100,
    durationSec: 60,
    timedOutCount: 0,
  };
}

function legacySession(topic) {
  return {
    date: '01/09/2026 10:01',
    subject: 'portugues',
    topicId: 'unknown-legacy-topic',
    topic,
    correct: 1,
    total: 2,
    pct: 50,
    durationSec: 30,
    timedOutCount: 0,
  };
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
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const wrongIndex = await page.evaluate((unsafe) => {
      window.__xss = 0;
      const question = QuestionsDB.getByTopic('action_verbs', '2026-t2-v1')[0];
      question.text = unsafe;
      question.question = unsafe;
      question.questionPt = unsafe;
      question.options = [unsafe, unsafe, unsafe, unsafe];
      question.explanation = unsafe;
      question.wrongExplanations = {
        0: unsafe,
        1: unsafe,
        2: unsafe,
        3: unsafe,
      };
      Store.set({
        selectedSubject: 'ingles',
        selectedTopic: 'action_verbs',
        selectedContentSet: '2026-t2-v1',
        questions: [question],
        answers: [],
        index: 0,
        quizStarted: true,
        sessionStart: Date.now(),
      });
      App.navigate('quiz', { force: true });
      return (question.correctIndex + 1) % 4;
    }, payload);

    assert.ok(
      (await page.locator('.question-text').textContent()).includes(payload),
    );
    assert.ok(
      (await page.locator('.text-excerpt').textContent()).includes(payload),
    );
    assert.ok(
      (await page.locator('.question-support').textContent()).includes(payload),
    );
    assert.equal(
      await page.locator(`#main-content ${unsafeSelector}`).count(),
      0,
    );
    assert.equal(await page.evaluate(() => window.__xss), 0);

    await page.locator(`.option-btn[data-index="${wrongIndex}"]`).click();
    assert.ok(
      (await page.locator('#feedback').textContent()).includes(payload),
    );
    assert.equal(await page.locator(`#feedback ${unsafeSelector}`).count(), 0);
    assert.equal(await page.evaluate(() => window.__xss), 0);

    await page.locator('#next-btn').click();
    assert.ok(
      (await page.locator('.gabarito-item').textContent()).includes(payload),
    );
    assert.equal(
      await page.locator(`#main-content ${unsafeSelector}`).count(),
      0,
    );
    assert.equal(await page.locator('[onclick]').count(), 0);
    assert.equal(await page.evaluate(() => window.__xss), 0);

    await page.evaluate(() => {
      const createObjectURL = URL.createObjectURL.bind(URL);
      URL.createObjectURL = (blob) => {
        window.__downloadedResult = blob.text();
        return createObjectURL(blob);
      };
    });
    await page.locator('#btn-download-result').click();
    await page.waitForFunction(() => window.__downloadedResult);
    const downloaded = await page.evaluate(async (unsafe) => {
      const html = await window.__downloadedResult;
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      return {
        unsafeElements: parsed.querySelectorAll(
          'script,img,svg,iframe,[onerror],[onload],[onclick],[srcdoc]',
        ).length,
        containsLiteralPayload: parsed.body.textContent.includes(unsafe),
      };
    }, payload);
    assert.deepEqual(downloaded, {
      unsafeElements: 0,
      containsLiteralPayload: true,
    });

    await page.locator('#btn-results-home').click();
    assert.equal(await page.locator('.home-hero').count(), 1);
    await page.evaluate(() => App.navigate('results', { force: true }));
    await page.locator('#btn-repeat-quiz').click();
    assert.equal(await page.locator('.quiz-intro').count(), 1);

    const storedHistory = [
      historySession(payload, false),
      historySession(payload, true),
      legacySession(payload),
    ];
    await page.evaluate((history) => {
      localStorage.setItem('quiz_etapa_v1', JSON.stringify(history));
    }, storedHistory);
    await page.addInitScript(() => {
      window.__xss = 0;
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#nav-history').click();
    await page.locator('#filter-content-set').selectOption('');

    assert.equal(await page.locator('.session-card').count(), 2);
    assert.ok(
      (await page.locator('#session-list').textContent()).includes(payload),
    );
    assert.equal(
      await page.locator(`#session-list ${unsafeSelector}`).count(),
      0,
    );
    assert.equal(await page.evaluate(() => window.__xss), 0);
    assert.deepEqual(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem('quiz_etapa_v1')),
      ),
      storedHistory,
    );

    await browser.close();
    console.log('safe-rendering-ui: ok');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
