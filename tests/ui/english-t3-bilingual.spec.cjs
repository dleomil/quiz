/* global App, QuestionsDB */
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('./playwright-browser.cjs');
const { validateQuestion } = require('../../scripts/validate-content.cjs');

const ROOT = path.resolve(__dirname, '../..');
const port = 4194;
const baseUrl = process.env.BASE_URL || `http://127.0.0.1:${port}`;
const topics = [
  'present-continuous',
  'places-city',
  'celebrations',
  'means-transport',
];
const expected = topics.flatMap((topic) =>
  require(path.join(ROOT, `scripts/create-t3-ingles-${topic}.cjs`))
    .buildQuestions()
    .map((question) => ({ ...question, reviewStatus: 'published' })),
);

async function waitForServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(baseUrl)).ok) return;
    } catch {
      // Aguarda o servidor local iniciar.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Quiz indisponível em ${baseUrl}`);
}

async function openQuestion(page, id) {
  await page.evaluate((questionId) => {
    const question = QuestionsDB.getAll().find(
      (item) => item.id === questionId,
    );
    if (!question) throw new Error(`Questão ausente: ${questionId}`);
    Store.set({
      selectedContentSet: '2026-t3-v1',
      selectedSubject: 'ingles',
      selectedTopic: question.topic,
      questions: [question],
      index: 0,
      answers: [],
      sessionStart: Date.now(),
      secsPerQuestion: 180,
      quizStarted: true,
    });
    App.navigate('quiz', { force: true });
  }, id);
  await page.locator('.question-support').waitFor({ state: 'visible' });
}

async function assertWidth(page, id) {
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  assert.ok(
    dimensions.scroll <= dimensions.client,
    `${id}: rolagem horizontal`,
  );
}

async function run() {
  const server = process.env.BASE_URL
    ? null
    : spawn(
        'python3',
        ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
        { cwd: ROOT, stdio: 'ignore' },
      );
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    for (const viewport of [
      { width: 1280, height: 1000, device: 'desktop' },
      { width: 375, height: 812, device: 'mobile' },
    ]) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      for (const theme of ['light', 'dark']) {
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        assert.ok(
          await page.evaluate(() => typeof QuestionsDB !== 'undefined'),
          'O endereço deve carregar o quiz, sem redirecionamento de autenticação.',
        );
        const loaded = await page.evaluate(() =>
          QuestionsDB.getAll().filter(
            (question) =>
              question.subject === 'ingles' &&
              question.contentSetId === '2026-t3-v1',
          ),
        );
        assert.equal(loaded.length, 80);
        assert.deepEqual(loaded, expected);
        assert.deepEqual(
          loaded.flatMap((question) => validateQuestion(question, 'ingles')),
          [],
        );
        if (
          ((await page.locator('html').getAttribute('data-theme')) ||
            'light') !== theme
        ) {
          await page.locator('#btn-theme').click();
        }
        assert.equal(
          (await page.locator('html').getAttribute('data-theme')) || 'light',
          theme,
        );

        for (const question of expected) {
          await openQuestion(page, question.id);
          const support = await page.locator('.question-support').textContent();
          assert.equal(support.trim(), `Em português: ${question.questionPt}`);
          assert.equal(
            await page.locator('.question-text').textContent(),
            `1. ${question.question}`,
          );
          await assertWidth(page, question.id);
          const wrong = theme === 'light' && question.id.endsWith('_001');
          const chosen = wrong
            ? (question.correctIndex + 1) % 4
            : question.correctIndex;
          await page.locator(`.option-btn[data-index="${chosen}"]`).click();
          assert.match(
            await page.locator('.feedback-title').textContent(),
            wrong ? /Ops/ : /Correto/,
          );
          assert.equal(
            (await page.locator('.question-support').textContent()).trim(),
            `Em português: ${question.questionPt}`,
          );
          await page.locator('#next-btn').click();
          await page
            .locator('.gab-question-support')
            .waitFor({ state: 'visible' });
          assert.equal(
            (await page.locator('.gab-question-support').textContent()).trim(),
            `Em português: ${question.questionPt}`,
          );
          assert.equal(
            await page.locator('.gab-q').textContent(),
            question.question,
          );
          await assertWidth(page, question.id);
        }
        await page.screenshot({
          path: path.join(
            os.tmpdir(),
            `quiz-english-t3-results-${viewport.device}-${theme}.png`,
          ),
          fullPage: true,
          animations: 'disabled',
        });
        await openQuestion(page, '2026t3v1_ing_present_continuous_006');
        if (theme === 'dark') {
          await page.waitForFunction(
            () =>
              getComputedStyle(document.querySelector('.question-support'))
                .color === 'rgb(241, 245, 249)',
          );
        }
        await page.screenshot({
          path: path.join(
            os.tmpdir(),
            `quiz-english-t3-question-${viewport.device}-${theme}.png`,
          ),
          fullPage: true,
          animations: 'disabled',
        });
      }
    }
    console.log(
      'english-t3-bilingual-ui: ok (80 apoios no quiz e gabarito, 320 respostas, desktop/celular, claro/escuro)',
    );
  } finally {
    await browser?.close();
    server?.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
