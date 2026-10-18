const assert = require('node:assert/strict');
const {
  validateQuestion,
  loadContentSources,
} = require('../../scripts/validate-content.cjs');
const original = require('../fixtures/content/history-english-regression.json');
const {
  buildQuestions,
} = require('../../scripts/create-t3-historia-imigrantes-ibericos.cjs');
const path = require('node:path');

const corrected = buildQuestions()[0];
const hasLanguageError = (question) =>
  validateQuestion(question, question.subject).some((error) =>
    error.includes('padrao em ingles'),
  );
assert.ok(
  hasLanguageError(original),
  'O conteúdo do incidente deve ser rejeitado.',
);
assert.equal(hasLanguageError(corrected), false);

for (const contentSetId of ['2026-t2-v1', '2026-t3-v1']) {
  for (const field of [
    'question',
    'questionPt',
    'text',
    'topicName',
    'explanation',
  ]) {
    assert.ok(
      hasLanguageError({
        ...corrected,
        contentSetId,
        [field]: original.question,
      }),
      `${contentSetId}: inglês em ${field} deve bloquear a validação`,
    );
  }
  for (let index = 0; index < 4; index += 1) {
    const options = [...corrected.options];
    options[index] = original.options[index];
    assert.ok(hasLanguageError({ ...corrected, contentSetId, options }));
  }
  for (const index of Object.keys(corrected.wrongExplanations)) {
    assert.ok(
      hasLanguageError({
        ...corrected,
        contentSetId,
        wrongExplanations: {
          ...corrected.wrongExplanations,
          [index]: original.wrongExplanations[index],
        },
      }),
    );
  }
}

assert.equal(hasLanguageError({ ...original, subject: 'ingles' }), false);
assert.equal(
  hasLanguageError({ ...original, contentSetId: '2026-t1-v1' }),
  false,
);
const activeHistory = loadContentSources(
  path.resolve(__dirname, '../..'),
).historia.questions.filter((question) =>
  /^2026-t[23]-v1$/.test(question.contentSetId),
);
assert.equal(activeHistory.length, 180);
assert.ok(activeHistory.every((question) => !hasLanguageError(question)));
console.log(
  'history-language: ok (História T2/T3 e campos visíveis; T1 preservado)',
);
