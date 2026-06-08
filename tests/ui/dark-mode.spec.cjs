const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4179;
const baseUrl = `http://127.0.0.1:${port}`;
const timeoutMs = 15000;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(url) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (err) {
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
  const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
    cwd: repoRoot,
    stdio: 'ignore',
  });

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
    await page.addInitScript(() => localStorage.setItem('quiz_theme', 'dark'));

    await openQuiz(page);

    const colors = await page.evaluate(() => {
      const question = document.querySelector('.question-text');
      const option = document.querySelector('.option-btn');
      return {
        question: question ? getComputedStyle(question).color : null,
        option: option ? getComputedStyle(option).color : null,
        optionBg: option ? getComputedStyle(option).backgroundColor : null,
      };
    });

    assert.strictEqual(colors.question, 'rgb(241, 245, 249)');
    assert.strictEqual(colors.option, 'rgb(241, 245, 249)');
    assert.strictEqual(colors.optionBg, 'rgb(30, 41, 59)');

    const wrongIndex = await page.evaluate(() => {
      const correctIndex = Store.get().questions[Store.get().index].correctIndex;
      return correctIndex === 0 ? 1 : 0;
    });

    await page.locator('.option-btn').nth(wrongIndex).click();
    await page.locator('.feedback-block').nth(1).waitFor({ state: 'visible' });

    const wrongFeedback = await page.evaluate(() => ({
      title: document.querySelector('.feedback-title')?.textContent?.trim(),
      blockCount: document.querySelectorAll('.feedback-block').length,
      labels: [...document.querySelectorAll('.feedback-label')].map(el => el.textContent.trim()),
      blocks: [...document.querySelectorAll('.feedback-block')].map(el => ({
        explain: el.querySelector('.feedback-explain')?.textContent?.trim() || '',
        why: el.querySelector('.feedback-why')?.textContent?.trim() || '',
      })),
    }));

    assert.ok(wrongFeedback.title.includes('Ops'));
    assert.strictEqual(wrongFeedback.blockCount, 2);
    assert.deepStrictEqual(wrongFeedback.labels, [
      'A resposta certa é',
      'Por que a sua resposta não está correta',
    ]);
    assert.ok(wrongFeedback.blocks[0].why.length > 0);
    assert.ok(wrongFeedback.blocks[1].explain.length > 0);

    await page.screenshot({ path: '/private/tmp/quiz-feedback-wrong.png', fullPage: true });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.locator('.subject-card').first().click();
    await page.locator('.topic-card').first().click();
    await page.locator('#btn-begin-quiz').click();
    await page.locator('.question-text').waitFor({ state: 'visible' });

    const correctIndex = await page.evaluate(() => Store.get().questions[Store.get().index].correctIndex);
    await page.locator('.option-btn').nth(correctIndex).click();
    await page.locator('.feedback-block').waitFor({ state: 'visible' });

    const correctFeedback = await page.evaluate(() => ({
      title: document.querySelector('.feedback-title')?.textContent?.trim(),
      blockCount: document.querySelectorAll('.feedback-block').length,
      labels: [...document.querySelectorAll('.feedback-label')].map(el => el.textContent.trim()),
    }));

    assert.ok(correctFeedback.title.includes('Correto'));
    assert.strictEqual(correctFeedback.blockCount, 1);
    assert.deepStrictEqual(correctFeedback.labels, ['Você acertou']);

    await page.screenshot({ path: '/private/tmp/quiz-feedback-correct.png', fullPage: true });

    await browser.close();
    console.log('dark-mode-ui: ok');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
