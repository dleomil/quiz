const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const port = 4181;
const baseUrl = `http://127.0.0.1:${port}`;
const timeoutMs = 15000;

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

async function run() {
  const staticServer = spawn(
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
      viewport: { width: 1440, height: 1200 },
    });

    await page.goto(`${baseUrl}/painel/`, { waitUntil: 'networkidle' });

    const panel = await page.evaluate(() => ({
      title: document.querySelector('h1')?.textContent?.trim() || '',
      lead: document.querySelector('.panel-lead')?.textContent?.trim() || '',
      cardCount: document.querySelectorAll('.panel-card').length,
      backLink: document.querySelector('.primary-action')?.getAttribute('href'),
    }));

    assert.ok(panel.title.includes('Gestao central do produto'));
    assert.ok(panel.lead.includes('superficie existe separada'));
    assert.strictEqual(panel.cardCount, 4);
    assert.strictEqual(panel.backLink, '../index.html');

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const homeTitle = await page.evaluate(
      () => document.querySelector('.home-hero h2')?.textContent?.trim() || '',
    );
    assert.ok(homeTitle.includes('Quiz Etapa'));

    await page.screenshot({
      path: '/private/tmp/panel-base.png',
      fullPage: true,
    });

    await browser.close();
    console.log('panel-base-ui: ok');
  } finally {
    staticServer.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
