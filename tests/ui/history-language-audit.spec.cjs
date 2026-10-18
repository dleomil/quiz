/* global App, QuestionsDB */
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');
const {
  buildQuestions,
} = require('../../scripts/create-t3-historia-imigrantes-ibericos.cjs');
const { validateQuestion } = require('../../scripts/validate-content.cjs');

const repoRoot = path.resolve(__dirname, '../..');
const port = 4193;
const baseUrl = process.env.BASE_URL || `http://127.0.0.1:${port}`;
const expected = buildQuestions().map((question) => ({
  ...question,
  reviewStatus: 'published',
}));

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
      selectedSubject: 'historia',
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
  await page.locator('.question-text').waitFor({ state: 'visible' });
}

async function run() {
  const server = process.env.BASE_URL
    ? null
    : spawn(
        'python3',
        ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
        {
          cwd: repoRoot,
          stdio: 'ignore',
        },
      );
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    for (const viewport of [
      { width: 1280, height: 1000 },
      { width: 375, height: 812 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      assert.ok(
        await page.evaluate(() => typeof QuestionsDB !== 'undefined'),
        'O endereço deve carregar o quiz, sem redirecionamento de autenticação.',
      );
      const activeHistory = await page.evaluate(() =>
        QuestionsDB.getAll().filter(
          (question) =>
            question.subject === 'historia' &&
            /^2026-t[23]-v1$/.test(question.contentSetId),
        ),
      );
      assert.equal(activeHistory.length, 180);
      assert.deepEqual(
        activeHistory.flatMap((question) =>
          validateQuestion(question, 'historia'),
        ),
        [],
      );
      assert.deepEqual(
        activeHistory.filter(
          (question) => question.topic === 'imigrantes-portugueses-espanhois',
        ),
        expected,
      );
      await page.locator('[data-subject="historia"]').click();
      const topic = page.locator(
        '[data-topic="imigrantes-portugueses-espanhois"]',
      );
      assert.equal(await topic.getAttribute('data-count'), '20');
      await topic.click();
      assert.equal(await topic.getAttribute('aria-pressed'), 'true');

      for (const question of expected) {
        for (let index = 0; index < 4; index += 1) {
          await openQuestion(page, question.id);
          assert.equal(
            await page.locator('.question-text').textContent(),
            `1. ${question.question}`,
          );
          assert.deepEqual(
            await page
              .locator('.option-btn > span:last-child')
              .allTextContents(),
            question.options,
          );
          await page.locator(`.option-btn[data-index="${index}"]`).click();
          const isCorrect = index === question.correctIndex;
          assert.match(
            await page.locator('.feedback-title').textContent(),
            isCorrect ? /Correto/ : /Ops/,
          );
          const feedback = await page.locator('#feedback').textContent();
          assert.ok(feedback.includes(question.explanation));
          if (!isCorrect)
            assert.ok(feedback.includes(question.wrongExplanations[index]));
          const dimensions = await page.evaluate(() => ({
            scroll: document.documentElement.scrollWidth,
            client: document.documentElement.clientWidth,
          }));
          assert.ok(
            dimensions.scroll <= dimensions.client,
            `${question.id}: rolagem horizontal`,
          );
        }
      }
      const device = viewport.width === 375 ? 'mobile' : 'desktop';
      await openQuestion(page, expected[0].id);
      await page.locator('.option-btn[data-index="1"]').click();
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector('.feedback')).opacity === '1',
      );
      await page.screenshot({
        path: path.join(os.tmpdir(), `quiz-history-language-${device}.png`),
        fullPage: true,
      });
    }
    console.log(
      'history-language-audit-ui: ok (20 questões, 160 respostas, desktop e celular)',
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
