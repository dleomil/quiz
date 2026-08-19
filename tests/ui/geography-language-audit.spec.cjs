/* global App, QuestionsDB */
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4186;
const baseUrl = process.env.BASE_URL || `http://127.0.0.1:${port}`;
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
      // Retry while the local server starts.
    }
    await wait(250);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

async function openQuestion(page, questionId) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate((id) => {
    const question = QuestionsDB.getAll().find((item) => item.id === id);
    if (!question) throw new Error(`Question not found: ${id}`);

    Store.set({
      selectedContentSet: '2026-t2-v1',
      selectedSubject: 'geografia',
      selectedTopic: question.topic,
      questions: [question],
      index: 0,
      answers: [],
      sessionStart: Date.now(),
      quizStarted: true,
    });
    App.navigate('quiz', { force: true });
  }, questionId);
  await page.locator('.question-text').waitFor({ state: 'visible' });
}

async function run() {
  const server = process.env.BASE_URL
    ? null
    : spawn(
        'python3',
        ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
        { cwd: repoRoot, stdio: 'ignore' },
      );

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1200 },
    });

    await openQuestion(page, 'GEO-T2-CAR-010');
    const paperOption = page.locator('.option-btn', {
      hasText: 'tipos de papel',
    });
    await paperOption.click();
    assert.strictEqual(
      await page
        .locator('.feedback-block')
        .nth(1)
        .locator('.feedback-explain')
        .textContent(),
      'Norte, sul, leste e oeste não são tipos de papel.',
    );

    await openQuestion(page, 'GEO-T2-REP-013');
    assert.ok(
      (await page.locator('.question-text').textContent()).includes(
        'Qual afirmação sobre as medidas de um croqui está correta?',
      ),
    );
    const correctIndex = await page.evaluate(
      () => Store.get().questions[0].correctIndex,
    );
    await page.locator('.option-btn').nth(correctIndex).click();
    assert.ok(
      (await page.locator('.feedback-title').textContent()).includes('Correto'),
    );

    await openQuestion(page, 'GEO-T2-MAP-008');
    assert.ok(
      (await page.locator('.question-text').textContent()).includes(
        'Onde a biblioteca aparece?',
      ),
    );

    await openQuestion(page, 'GEO-T2-MAP-017');
    assert.strictEqual(
      await page
        .locator('.option-btn')
        .filter({ hasText: 'seguindo por essa mesma rua' })
        .count(),
      1,
    );
    await page.screenshot({
      path: '/private/tmp/quiz-geography-language-audit-desktop.png',
      fullPage: true,
    });

    await page.setViewportSize({ width: 375, height: 812 });
    const viewport = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    assert.ok(viewport.scrollWidth <= viewport.clientWidth);
    await page.screenshot({
      path: '/private/tmp/quiz-geography-language-audit-mobile.png',
      fullPage: true,
    });

    await browser.close();
    console.log('geography-language-audit-ui: ok');
  } finally {
    server?.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
