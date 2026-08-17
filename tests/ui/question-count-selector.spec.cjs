/* global App */
const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4185;
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

async function openHistoryTopics(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.strictEqual(
    await page.evaluate(() => Store.get().selectedContentSet),
    '2026-t2-v1',
  );
  await page.locator('.subject-card[data-subject="historia"]').click();
}

async function selectCountAndStart(page, topicCard, count) {
  await topicCard.click();
  await page.locator('#question-count-input').fill(String(count));
  await page.locator('#btn-start-selected-count').click();
}

async function quizSnapshot(page) {
  return page.evaluate(() => {
    const state = Store.get();
    return {
      contentSetId: state.selectedContentSet,
      selectedTopic: state.selectedTopic,
      count: state.questions.length,
      uniqueIds: new Set(state.questions.map((question) => question.id)).size,
      subjects: [
        ...new Set(state.questions.map((question) => question.subject)),
      ],
      contentSets: [
        ...new Set(state.questions.map((question) => question.contentSetId)),
      ],
      topics: [...new Set(state.questions.map((question) => question.topic))],
      intro: document.querySelector('.quiz-intro-value')?.textContent?.trim(),
    };
  });
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

    await openHistoryTopics(page);
    const allTopics = page.locator('.topic-card[data-topic="all"]');
    assert.strictEqual(await allTopics.getAttribute('data-count'), '80');
    await allTopics.click();

    const input = page.locator('#question-count-input');
    const start = page.locator('#btn-start-selected-count');
    assert.strictEqual(await input.getAttribute('min'), '2');
    assert.strictEqual(await input.getAttribute('max'), '80');
    assert.strictEqual(await input.inputValue(), '30');

    await input.fill('');
    assert.strictEqual(await start.isDisabled(), true);
    await page.locator('#count-inc').click();
    assert.strictEqual(await input.inputValue(), '2');

    await input.fill('1');
    assert.strictEqual(await start.isDisabled(), true);
    assert.ok(
      (await page.locator('#question-count-error').textContent()).includes(
        '2 até 80',
      ),
    );
    await page.locator('#count-inc').click();
    assert.strictEqual(await input.inputValue(), '2');

    await input.fill('81');
    await page.locator('#count-dec').click();
    assert.strictEqual(await input.inputValue(), '80');

    await input.fill('2.5');
    assert.strictEqual(await start.isDisabled(), true);

    await page.evaluate(() => App.startQuiz('all', 'historia', 81));
    assert.strictEqual(
      await page.locator('#toast-container .toast').last().textContent(),
      'Escolha entre 2 e 80 questões.',
    );
    assert.strictEqual(
      await page.locator('#question-count-panel').isVisible(),
      true,
    );

    await input.fill('2');
    assert.strictEqual(await start.isEnabled(), true);
    await start.click();
    const minimumSnapshot = await quizSnapshot(page);
    assert.strictEqual(minimumSnapshot.contentSetId, '2026-t2-v1');
    assert.strictEqual(minimumSnapshot.selectedTopic, 'all');
    assert.strictEqual(minimumSnapshot.count, 2);
    assert.strictEqual(minimumSnapshot.uniqueIds, 2);
    assert.deepStrictEqual(minimumSnapshot.subjects, ['historia']);
    assert.deepStrictEqual(minimumSnapshot.contentSets, ['2026-t2-v1']);
    assert.strictEqual(minimumSnapshot.intro, '2 questões');

    await openHistoryTopics(page);
    await allTopics.click();
    await page.locator('[data-count-choice="all"]').click();
    await start.click();
    const allSnapshot = await quizSnapshot(page);
    assert.strictEqual(allSnapshot.count, 80);
    assert.strictEqual(allSnapshot.uniqueIds, 80);
    assert.deepStrictEqual(allSnapshot.subjects, ['historia']);
    assert.deepStrictEqual(allSnapshot.contentSets, ['2026-t2-v1']);
    assert.strictEqual(allSnapshot.topics.length, 4);
    assert.strictEqual(allSnapshot.intro, '80 questões');

    await openHistoryTopics(page);
    const specificTopic = page
      .locator('.topic-card:not([data-topic="all"])')
      .first();
    const topicId = await specificTopic.getAttribute('data-topic');
    await specificTopic.click();
    assert.strictEqual(await input.getAttribute('max'), '20');
    await page.locator('[data-count-choice="all"]').click();
    await start.click();
    const completeTopicSnapshot = await quizSnapshot(page);
    assert.strictEqual(completeTopicSnapshot.count, 20);
    assert.strictEqual(completeTopicSnapshot.uniqueIds, 20);
    assert.deepStrictEqual(completeTopicSnapshot.topics, [topicId]);
    assert.strictEqual(completeTopicSnapshot.intro, '20 questões');

    await openHistoryTopics(page);
    await selectCountAndStart(page, specificTopic, 7);
    const topicSnapshot = await quizSnapshot(page);
    assert.strictEqual(topicSnapshot.count, 7);
    assert.strictEqual(topicSnapshot.uniqueIds, 7);
    assert.deepStrictEqual(topicSnapshot.topics, [topicId]);
    assert.strictEqual(topicSnapshot.intro, '7 questões');

    await openHistoryTopics(page);
    await allTopics.focus();
    await page.keyboard.press('Enter');
    assert.strictEqual(
      await page.locator('#question-count-panel').isVisible(),
      true,
    );
    await input.fill('4');
    await page.locator('#count-inc').focus();
    await page.keyboard.press('Enter');
    assert.strictEqual(await input.inputValue(), '5');
    await input.focus();
    await page.keyboard.press('Enter');
    assert.strictEqual((await quizSnapshot(page)).count, 5);
    await page.locator('#btn-begin-quiz').focus();
    await page.keyboard.press('Enter');
    assert.strictEqual(
      await page.locator('.counter').textContent(),
      'Pergunta 1 de 5',
    );

    await openHistoryTopics(page);
    await allTopics.click();
    await page.screenshot({
      path: '/private/tmp/quiz-question-count-desktop.png',
      fullPage: true,
    });

    await page.setViewportSize({ width: 375, height: 812 });
    const mobileLayout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      panelColor: getComputedStyle(
        document.querySelector('.question-count-heading h3'),
      ).color,
    }));
    assert.ok(mobileLayout.scrollWidth <= mobileLayout.clientWidth);
    assert.strictEqual(mobileLayout.panelColor, 'rgb(30, 41, 59)');
    await page.screenshot({
      path: '/private/tmp/quiz-question-count-mobile.png',
      fullPage: true,
    });

    await page.evaluate(() =>
      document.documentElement.setAttribute('data-theme', 'dark'),
    );
    assert.strictEqual(
      await page
        .locator('.question-count-heading h3')
        .evaluate((element) => getComputedStyle(element).color),
      'rgb(241, 245, 249)',
    );

    await browser.close();
    console.log('question-count-selector-ui: ok');
  } finally {
    server?.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
