/* global ContentCatalog, QuestionsDB */
const assert = require('assert');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..', '..');
const draftPath = path.join(
  repoRoot,
  'docs/drafts/2026-t3-v1-cie-luz-visao.json',
);
const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
const port = 4187;
const baseUrl = `http://127.0.0.1:${port}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url) {
  const deadline = Date.now() + 15000;
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

async function run() {
  const server = spawn(
    'python3',
    ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
    { cwd: repoRoot, stdio: 'ignore' },
  );

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const result = await page.evaluate((pilotDraft) => {
      window.__t3PilotDraft = pilotDraft;
      const questionIds = pilotDraft.questions.map((question) => question.id);
      const answers = pilotDraft.questions.map((question) => ({
        questionId: question.id,
        selectedIndex: question.correctIndex,
        isCorrect: true,
        isTimeout: false,
      }));
      Store.addSession({
        schemaVersion: 'session-v2',
        sessionId: 'session-2026-t3-v1-cie-luz-visao',
        startedAt: '2026-10-02T12:00:00.000Z',
        finishedAt: '2026-10-02T12:20:00.000Z',
        contentSetId: pilotDraft.contentSetId,
        contentVersion: 1,
        questionIds,
        answers,
        score: { correct: 20, total: 20, pct: 100 },
        date: '02/10/2026 09:00',
        subject: 'ciencias',
        topicId: 'luz-visao',
        topic: 'Luz e Visão',
        durationSec: 1200,
      });
      const state = Store.get();
      return {
        draftQuestionCount: window.__t3PilotDraft.questions.length,
        draftIds: questionIds,
        publishedContentSets: ContentCatalog.getPublished().map(
          (contentSet) => contentSet.contentSetId,
        ),
        runtimeT3Count: QuestionsDB.getAll().filter(
          (question) => question.contentSetId === pilotDraft.contentSetId,
        ).length,
        runtimeT3Subjects: QuestionsDB.getAll()
          .filter(
            (question) => question.contentSetId === pilotDraft.contentSetId,
          )
          .reduce((counts, question) => {
            counts[question.subject] = (counts[question.subject] || 0) + 1;
            return counts;
          }, {}),
        runtimeT3ScienceTopics: QuestionsDB.getAll()
          .filter(
            (question) =>
              question.contentSetId === pilotDraft.contentSetId &&
              question.subject === 'ciencias',
          )
          .reduce((topics, question) => {
            topics[question.topic] = (topics[question.topic] || 0) + 1;
            return topics;
          }, {}),
        historyEntry: state.history[0],
        persisted: JSON.parse(localStorage.getItem('quiz_etapa_v1'))[0],
      };
    }, draft);

    assert.strictEqual(result.draftQuestionCount, 20);
    assert.strictEqual(new Set(result.draftIds).size, 20);
    assert.deepStrictEqual(result.publishedContentSets, [
      '2026-t1-v1',
      '2026-t2-v1',
      '2026-t3-v1',
    ]);
    assert.strictEqual(result.runtimeT3Count, 420);
    assert.deepStrictEqual(result.runtimeT3Subjects, {
      ciencias: 140,
      geografia: 100,
      historia: 100,
      ingles: 80,
    });
    assert.deepStrictEqual(result.runtimeT3ScienceTopics, {
      'corpos-luz': 20,
      espelhos: 20,
      'luz-cores': 20,
      'luz-visao': 20,
      'materiais-transparentes': 20,
      'propriedades-luz': 20,
      'som-audicao': 20,
    });
    assert.strictEqual(result.historyEntry.contentSetId, '2026-t3-v1');
    assert.strictEqual(result.historyEntry.topicId, 'luz-visao');
    assert.strictEqual(result.historyEntry.total, 20);
    assert.strictEqual(result.historyEntry.pct, 100);
    assert.strictEqual(result.persisted.contentSetId, '2026-t3-v1');

    await browser.close();
    console.log(
      't3-pilot-draft-ui: ok (harness isolado, release incremental intacto)',
    );
  } finally {
    server.kill();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
