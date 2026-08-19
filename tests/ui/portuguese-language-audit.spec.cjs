/* global App, QuestionsDB */
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4188;
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
  const applicationLoaded = await page.evaluate(
    () => typeof QuestionsDB !== 'undefined' && typeof App !== 'undefined',
  );
  if (!applicationLoaded) {
    throw new Error(
      `Quiz unavailable at ${page.url()}. The preview may require authentication.`,
    );
  }

  await page.evaluate((id) => {
    const question = QuestionsDB.getAll().find((item) => item.id === id);
    if (!question) throw new Error(`Question not found: ${id}`);

    Store.set({
      selectedContentSet: '2026-t2-v1',
      selectedSubject: 'portugues',
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

    await openQuestion(page, 'pt_t2_lu_006');
    assert.ok(
      (await page.locator('.question-text').textContent()).includes(
        'ane__ de presente',
      ),
    );
    const wrongIndex = await page.evaluate(() => {
      const question = Store.get().questions[0];
      return question.correctIndex === 0 ? 1 : 0;
    });
    await page.locator('.option-btn').nth(wrongIndex).click();
    assert.ok(
      (await page.locator('.feedback-title').textContent()).includes('Ops'),
    );

    await openQuestion(page, 'pt_t2_ceci_001');
    assert.ok(
      (await page.locator('.question-text').textContent()).includes(
        'A ____ do filme foi engraçada.',
      ),
    );

    await openQuestion(page, 'pt_t2_pron_015');
    assert.ok(
      (await page.locator('.question-text').textContent()).includes(
        'pergunta diretamente a uma mulher adulta',
      ),
    );
    assert.strictEqual(
      await page
        .locator('.option-btn', { hasText: 'A senhora chegou cedo?' })
        .count(),
      1,
    );

    await openQuestion(page, 'pt_t2_vii_004');
    const correctIndex = await page.evaluate(
      () => Store.get().questions[0].correctIndex,
    );
    await page.locator('.option-btn').nth(correctIndex).click();
    assert.ok(
      (await page.locator('.feedback-title').textContent()).includes('Correto'),
    );
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/private/tmp/quiz-portuguese-language-audit-desktop.png',
      fullPage: true,
    });

    await page.setViewportSize({ width: 375, height: 812 });
    const viewport = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    assert.ok(viewport.scrollWidth <= viewport.clientWidth);
    await page.screenshot({
      path: '/private/tmp/quiz-portuguese-language-audit-mobile.png',
      fullPage: true,
    });

    await browser.close();
    console.log('portuguese-language-audit-ui: ok');
  } finally {
    server?.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
