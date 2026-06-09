/* global App */
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4180;
const baseUrl = `http://127.0.0.1:${port}`;
const timeoutMs = 15000;
const QUIZ_LOCK_MESSAGE =
  'Finalize o quiz atual para voltar ou trocar de matéria.';
const EMPTY_QUESTIONS_MESSAGE = 'Nenhuma pergunta encontrada para este tema.';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry until timeout
    }
    await wait(250);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

async function openQuiz(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('.subject-card').first().click();
  await page.locator('.topic-card').first().click();
  await page.locator('#btn-begin-quiz').click();
  await page.locator('.question-text').waitFor({ state: 'visible' });
}

async function run() {
  const server = spawn(
    'python3',
    ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
    {
      cwd: repoRoot,
      stdio: 'ignore',
    },
  );

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1600 },
    });

    await openQuiz(page);
    await page.locator('#nav-history').click();

    const navigationToast = await page.evaluate(() => ({
      toast: document
        .querySelector('#toast-container .toast')
        ?.textContent?.trim(),
      currentQuestion: document
        .querySelector('.question-text')
        ?.textContent?.trim(),
      historyTitle: document
        .querySelector('.history-title')
        ?.textContent?.trim(),
    }));

    assert.strictEqual(navigationToast.toast, QUIZ_LOCK_MESSAGE);
    assert.ok(navigationToast.currentQuestion);
    assert.strictEqual(navigationToast.historyTitle || '', '');

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      App.startQuiz('__missing_topic__', '__missing_subject__');
    });

    const missingQuestionsToast = await page.evaluate(() => ({
      toast: document
        .querySelector('#toast-container .toast')
        ?.textContent?.trim(),
      homeHero: document.querySelector('.home-hero')?.textContent?.trim(),
      questionText: document
        .querySelector('.question-text')
        ?.textContent?.trim(),
    }));

    assert.strictEqual(missingQuestionsToast.toast, EMPTY_QUESTIONS_MESSAGE);
    assert.ok(missingQuestionsToast.homeHero);
    assert.strictEqual(missingQuestionsToast.questionText || '', '');

    await browser.close();
    console.log('critical-rules: ok');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
