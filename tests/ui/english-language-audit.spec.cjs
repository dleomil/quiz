/* global App, QuestionsDB */
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4187;
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
      selectedSubject: 'ingles',
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

    await openQuestion(page, 'ING-T2-PRE-001');
    assert.ok(
      (await page.locator('.question-support').textContent()).includes(
        'Complete a frase em inglês',
      ),
    );
    assert.ok(
      (await page.locator('.question-text').textContent()).includes(
        'word that means "dentro"',
      ),
    );
    await page.locator('.option-btn', { hasText: 'under' }).click();
    assert.ok(
      (await page.locator('.feedback-title').textContent()).includes('Ops'),
    );

    await openQuestion(page, 'ING-T2-PRE-011');
    assert.ok(
      (await page.locator('.question-support').textContent()).includes(
        'alternativa em inglês',
      ),
    );
    assert.ok(
      (await page.locator('.question-text').textContent()).includes(
        'O brinquedo está dentro da caixa',
      ),
    );
    assert.strictEqual(
      await page
        .locator('.option-btn', { hasText: 'The toy is between the box.' })
        .count(),
      0,
    );
    assert.strictEqual(
      await page
        .locator('.option-btn', { hasText: 'The toy is next to the box.' })
        .count(),
      1,
    );

    await openQuestion(page, 'ING-T2-FAD-011');
    assert.ok(
      (await page.locator('.question-support').textContent()).includes(
        'gesto de carinho',
      ),
    );
    assert.ok(
      (await page.locator('.question-text').textContent()).includes(
        'caring gesture',
      ),
    );
    const correctIndex = await page.evaluate(
      () => Store.get().questions[0].correctIndex,
    );
    await page.locator('.option-btn').nth(correctIndex).click();
    assert.ok(
      (await page.locator('.feedback-title').textContent()).includes('Correto'),
    );

    await openQuestion(page, 'ING-T2-SPO-016');
    assert.ok(
      (await page.locator('.question-support').textContent()).includes(
        'sobre um esporte',
      ),
    );
    assert.strictEqual(
      await page
        .locator('.option-btn', { hasText: 'I like swimming.' })
        .count(),
      1,
    );

    await openQuestion(page, 'ING-T2-ACT-011');
    assert.ok(
      (await page.locator('.question-support').textContent()).includes(
        'Escolha o verbo',
      ),
    );
    assert.ok(
      (await page.locator('.question-text').textContent()).includes(
        'verb that means "ler"',
      ),
    );
    await page.screenshot({
      path: '/private/tmp/quiz-english-language-audit-desktop.png',
      fullPage: true,
    });

    await page.locator('#btn-theme').click();
    assert.strictEqual(
      await page.locator('html').getAttribute('data-theme'),
      'dark',
    );
    await page.locator('.question-support').waitFor({ state: 'visible' });
    await page.waitForTimeout(250);
    const darkSupportColors = await page.evaluate(() => {
      const support = document.querySelector('.question-support');
      const option = document.querySelector('.option-btn');
      return {
        supportColor: getComputedStyle(support).color,
        supportBackground: getComputedStyle(support).backgroundColor,
        optionColor: getComputedStyle(option).color,
        optionBackground: getComputedStyle(option).backgroundColor,
      };
    });
    assert.deepStrictEqual(darkSupportColors, {
      supportColor: 'rgb(241, 245, 249)',
      supportBackground: 'rgb(30, 27, 75)',
      optionColor: 'rgb(241, 245, 249)',
      optionBackground: 'rgb(30, 41, 59)',
    });

    await page.setViewportSize({ width: 375, height: 812 });
    const viewport = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    assert.ok(viewport.scrollWidth <= viewport.clientWidth);
    await page.screenshot({
      path: '/private/tmp/quiz-english-language-audit-mobile.png',
      fullPage: true,
    });

    const actionCorrectIndex = await page.evaluate(
      () => Store.get().questions[0].correctIndex,
    );
    await page.locator('.option-btn').nth(actionCorrectIndex).click();
    await page.locator('#next-btn').click();
    await page.locator('.gab-question-support').waitFor({ state: 'visible' });
    assert.ok(
      (await page.locator('.gab-question-support').textContent()).includes(
        'Escolha o verbo',
      ),
    );
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/private/tmp/quiz-english-bilingual-result-mobile.png',
      fullPage: true,
    });

    await browser.close();
    console.log('english-language-audit-ui: ok');
  } finally {
    server?.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
