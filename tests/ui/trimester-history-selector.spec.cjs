const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4184;
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
      // Retry while the local server starts.
    }
    await wait(250);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

function session(contentSetId, date, pct) {
  return {
    schemaVersion: 'session-v2',
    sessionId: `session-${contentSetId}`,
    contentSetId,
    contentVersion: 1,
    date,
    subject: 'portugues',
    topicId: 'all',
    topic: 'Português',
    correct: pct / 10,
    total: 10,
    pct,
    durationSec: 120,
    timedOutCount: 0,
    questionIds: [],
    answers: [],
  };
}

async function installHistory(page, history) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate((items) => {
    localStorage.setItem('quiz_etapa_v1', JSON.stringify(items));
  }, history);
  await page.reload({ waitUntil: 'networkidle' });
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
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1200 },
    });
    const history = [
      session('2026-t2-v1', '12/08/2026 10:00', 90),
      session('2026-t1-v1', '10/04/2026 10:00', 70),
      {
        date: '01/02/2026 10:00',
        topic: 'Português',
        correct: 6,
        total: 10,
        pct: 60,
      },
    ];

    await installHistory(page, history);

    const options = page.locator('.content-set-option');
    assert.strictEqual(await options.count(), 2);
    assert.strictEqual(
      await options
        .filter({ hasText: '2º trimestre' })
        .getAttribute('aria-pressed'),
      'true',
    );

    await page.locator('#nav-history').click();
    assert.strictEqual(
      await page.locator('#filter-content-set').inputValue(),
      '2026-t2-v1',
    );
    assert.strictEqual(await page.locator('.session-card').count(), 1);
    assert.ok(
      (await page.locator('.session-period').textContent()).includes(
        '2º trimestre',
      ),
    );

    await page.locator('#filter-content-set').selectOption('');
    assert.strictEqual(await page.locator('.session-card').count(), 3);
    assert.deepStrictEqual(
      await page.locator('.session-period').allTextContents(),
      ['2º trimestre de 2026', '1º trimestre de 2026', 'Acervo anterior'],
    );
    assert.deepStrictEqual(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem('quiz_etapa_v1')),
      ),
      history,
    );

    await page.waitForTimeout(1200);
    await page.screenshot({
      path: '/private/tmp/quiz-trimester-history-desktop.png',
      fullPage: true,
    });

    await page.locator('#nav-home').click();
    await options.filter({ hasText: '1º trimestre' }).click();
    await page.locator('#nav-history').click();
    assert.strictEqual(
      await page.locator('#filter-content-set').inputValue(),
      '2026-t1-v1',
    );
    assert.strictEqual(await page.locator('.session-card').count(), 1);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('#nav-home').click();
    const mobileWidth = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    assert.ok(
      mobileWidth.scroll <= mobileWidth.client,
      `Horizontal overflow: ${JSON.stringify(mobileWidth)}`,
    );
    await page.screenshot({
      path: '/private/tmp/quiz-trimester-selector-mobile.png',
      fullPage: true,
    });

    await browser.close();
    console.log('trimester-history-selector-ui: ok');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
