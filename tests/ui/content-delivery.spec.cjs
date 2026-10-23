/* global App, QuestionsDB */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('./playwright-browser.cjs');
const { loadContentSources } = require('../../scripts/validate-content.cjs');
const {
  batchKey,
  packageHash,
  validateBatch,
} = require('../../scripts/content-delivery.cjs');

const ROOT = path.resolve(__dirname, '../..');
const pilot = process.argv.includes('--pilot');
const preview = process.argv.includes('--preview');
const outputDirectory =
  process.env.CONTENT_DELIVERY_ARTIFACTS ||
  fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-content-delivery-ui-'));
async function run() {
  assert.ok(!(pilot && preview), 'Piloto e preview sao modos distintos.');
  let result;
  if (pilot) {
    const questions =
      require('../../scripts/create-t3-ingles-present-continuous.cjs').buildQuestions();
    result = {
      batches: [
        {
          key: batchKey(questions[0]),
          sourceSha256: packageHash(questions),
          ids: questions.map((q) => q.id),
          stage: 'publish',
        },
      ],
    };
  } else {
    assert.ok(
      process.env.CONTENT_DELIVERY_RESULT,
      'Informe CONTENT_DELIVERY_RESULT com a selecao validada.',
    );
    result = JSON.parse(
      fs.readFileSync(process.env.CONTENT_DELIVERY_RESULT, 'utf8'),
    );
    if (!preview)
      assert.deepEqual(
        result.errors,
        [],
        'O lote deve passar no gate antes do teste visual.',
      );
  }
  const batches = result.batches.filter((batch) => batch.stage === 'publish');
  if (!batches.length) {
    console.log('content-delivery-ui: sem lote publicado novo ou alterado');
    return;
  }
  const sources = JSON.parse(JSON.stringify(loadContentSources(ROOT)));
  const expected = batches.flatMap((batch) => {
    const [contentSetId, subject, topic] = batch.key.split('/');
    const questions = sources[subject].questions.filter(
      (q) => q.contentSetId === contentSetId && q.topic === topic,
    );
    assert.deepEqual(
      validateBatch(questions, {
        policy: require('../../config/content-delivery-policy.json'),
        coverage: require('../../config/content-coverage-manifest.json'),
      }).errors,
      [],
      'O preview tambem exige conteudo estruturalmente valido.',
    );
    assert.equal(
      packageHash(questions),
      batch.sourceSha256,
      'O pacote visual deve ser o pacote validado.',
    );
    assert.deepEqual(questions.map((q) => q.id).sort(), [...batch.ids].sort());
    return questions;
  });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4195';
  const server = process.env.BASE_URL
    ? null
    : spawn('python3', ['-m', 'http.server', '4195', '--bind', '127.0.0.1'], {
        cwd: ROOT,
        stdio: 'ignore',
      });
  let browser;
  try {
    const deadline = Date.now() + 15000;
    while (true) {
      try {
        if ((await fetch(baseUrl)).ok) break;
      } catch {
        /* Aguarda o servidor. */
      }
      if (Date.now() >= deadline) throw new Error('Quiz indisponivel.');
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    fs.mkdirSync(outputDirectory, { recursive: true });
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let responses = 0;
    for (const viewport of [
      { width: 1280, height: 1000 },
      { width: 375, height: 812 },
    ]) {
      await page.setViewportSize(viewport);
      for (const theme of ['light', 'dark']) {
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        assert.ok(
          await page.evaluate(() => typeof QuestionsDB !== 'undefined'),
          'O destino deve abrir o quiz sem tela de autenticacao.',
        );
        if (
          ((await page.locator('html').getAttribute('data-theme')) ||
            'light') !== theme
        )
          await page.locator('#btn-theme').click();
        assert.equal(
          (await page.locator('html').getAttribute('data-theme')) || 'light',
          theme,
        );
        for (const question of expected) {
          const loaded = await page.evaluate(
            (id) => QuestionsDB.getAll().find((q) => q.id === id),
            question.id,
          );
          assert.deepEqual(
            loaded,
            question,
            `${question.id}: o destino deve carregar a versao validada`,
          );
          await page.evaluate((q) => {
            Store.set({
              selectedContentSet: q.contentSetId,
              selectedSubject: q.subject,
              selectedTopic: q.topic,
              questions: [q],
              index: 0,
              answers: [],
              sessionStart: Date.now(),
              secsPerQuestion: 180,
              quizStarted: true,
            });
            App.navigate('quiz', { force: true });
          }, loaded);
          assert.equal(
            await page.locator('.question-text').textContent(),
            `1. ${question.question}`,
          );
          assert.ok(await page.locator('.question-text').isVisible());
          for (const option of await page.locator('.option-btn').all())
            assert.ok(await option.isVisible());
          assert.deepEqual(
            await page
              .locator('.option-btn > span:last-child')
              .allTextContents()
              .then((values) => values.map((value) => value.trim())),
            question.options,
          );
          if (question.subject === 'ingles') {
            assert.ok(await page.locator('.question-support').isVisible());
            assert.equal(
              (await page.locator('.question-support').textContent()).trim(),
              `Em português: ${question.questionPt}`,
            );
          } else
            assert.equal(await page.locator('.question-support').count(), 0);
          const width = await page.evaluate(() => ({
            scroll: document.documentElement.scrollWidth,
            client: document.documentElement.clientWidth,
          }));
          assert.ok(
            width.scroll <= width.client,
            `${question.id}: rolagem horizontal`,
          );
          if (question === expected[0])
            await page.screenshot({
              path: path.join(
                outputDirectory,
                `quiz-${viewport.width}-${theme}.png`,
              ),
              fullPage: true,
              animations: 'disabled',
            });
          const wrong =
            theme === 'light' &&
            question.id ===
              expected.find((q) => batchKey(q) === batchKey(question)).id;
          const chosen = wrong
            ? (question.correctIndex + 1) % 4
            : question.correctIndex;
          await page.locator(`.option-btn[data-index="${chosen}"]`).click();
          assert.match(
            await page.locator('.feedback-title').textContent(),
            wrong ? /Ops/ : /Correto/,
          );
          await page.locator('#next-btn').click();
          await page.locator('.gab-q').waitFor();
          assert.equal(
            await page.locator('.gab-q').textContent(),
            question.question,
          );
          const explanations = await page
            .locator('.gab-explain')
            .allTextContents();
          assert.equal(explanations[0], question.explanation);
          if (wrong)
            assert.equal(explanations[1], question.wrongExplanations[chosen]);
          if (question.subject === 'ingles') {
            assert.ok(await page.locator('.gab-question-support').isVisible());
            assert.equal(
              (
                await page.locator('.gab-question-support').textContent()
              ).trim(),
              `Em português: ${question.questionPt}`,
            );
          }
          const resultsWidth = await page.evaluate(() => ({
            scroll: document.documentElement.scrollWidth,
            client: document.documentElement.clientWidth,
          }));
          assert.ok(
            resultsWidth.scroll <= resultsWidth.client,
            `${question.id}: rolagem horizontal no gabarito`,
          );
          if (question === expected[0])
            await page.screenshot({
              path: path.join(
                outputDirectory,
                `gabarito-${viewport.width}-${theme}.png`,
              ),
              fullPage: true,
              animations: 'disabled',
            });
          responses += 1;
        }
      }
    }
    const evidence = {
      schemaVersion: 'content-delivery-visual-v1',
      test: 'content-delivery-ui',
      testOnly: pilot,
      purpose: pilot ? 'pilot' : preview ? 'preview' : 'publication',
      batches,
      responses,
      baseUrl,
      variants: [
        'desktop-light',
        'desktop-dark',
        'mobile-light',
        'mobile-dark',
      ],
    };
    fs.writeFileSync(
      path.join(outputDirectory, 'result.json'),
      JSON.stringify(evidence, null, 2) + '\n',
    );
    console.log(
      `content-delivery-ui: ok (${expected.length} IDs, ${responses} respostas, piloto tecnico=${pilot})`,
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
