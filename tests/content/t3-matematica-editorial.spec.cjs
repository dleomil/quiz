const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  TOPICS,
  buildQuestions,
  sha256,
} = require('../../scripts/create-t3-matematica-drafts.cjs');
const {
  validateContentSources,
} = require('../../scripts/validate-content.cjs');
const {
  reportPath,
  validateTopicReport,
} = require('../../scripts/validate-t3-matematica-editorial-reports.cjs');

const ROOT = path.resolve(__dirname, '../..');
const ids = new Set();

for (const topic of TOPICS) {
  const draftPath = path.join(
    ROOT,
    'docs/drafts',
    `2026-t3-v1-mat-${topic.id}.json`,
  );
  const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
  const generated = buildQuestions(topic);
  const questions = draft.questions;

  assert.equal(draft.schemaVersion, 'content-draft-v1');
  assert.equal(draft.contentSetId, '2026-t3-v1');
  assert.equal(questions.length, 20);
  assert.deepEqual(questions, generated);
  assert.deepEqual(validateContentSources({ matematica: { questions } }), []);
  assert.deepEqual(
    questions.reduce((counts, question) => {
      counts[question.correctIndex] = (counts[question.correctIndex] || 0) + 1;
      return counts;
    }, {}),
    { 0: 5, 1: 5, 2: 5, 3: 5 },
  );

  for (const question of questions) {
    assert.ok(!ids.has(question.id), `ID repetido: ${question.id}`);
    ids.add(question.id);
    assert.equal(question.subject, 'matematica');
    assert.equal(question.topic, topic.id);
    assert.equal(question.reviewStatus, 'draft');
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.equal(
      question.sourceRef.referenceId,
      'roteiro-estudos-av-mensal-t3-2026',
    );
    assert.equal(question.sourceRef.section, 'Matemática');
    assert.equal(question.sourceRef.topic, topic.id);
    assert.deepEqual(Object.keys(question.sourceRef).sort(), [
      'referenceId',
      'section',
      'topic',
    ]);
    assert.equal(
      Object.keys(question.wrongExplanations).length,
      3,
      `${question.id}: feedback incorreto incompleto`,
    );
    assert.equal(
      new Set(Object.values(question.wrongExplanations)).size,
      3,
      `${question.id}: feedback repetido entre distratores`,
    );
    for (const [optionIndex, feedback] of Object.entries(
      question.wrongExplanations,
    )) {
      assert.ok(
        feedback.includes(question.options[Number(optionIndex)]),
        `${question.id}: feedback não trata a alternativa selecionada`,
      );
      assert.doesNotMatch(
        feedback,
        /NaN|undefined|\.\.|\b1 resultados favoráveis\b|\b(?!1\b)\d+ resultado favorável\b/,
        `${question.id}: feedback contém defeito de geração ou concordância`,
      );
    }
    if (question.id === '2026t3v1_math_probabilidade_002') {
      assert.match(
        Object.values(question.wrongExplanations)[0],
        /A tem 2 resultados favoráveis; B tem 5 resultados favoráveis\. Há 8 possibilidades/,
      );
    }
    if (question.id === '2026t3v1_math_area_malha_002') {
      assert.match(question.explanation, /3 linhas com 4 quadradinhos em cada/);
    }
    if (question.id === '2026t3v1_math_decomposicao_multiplicacao_007') {
      assert.match(
        Object.values(question.wrongExplanations)[0],
        /Separe 16 em 10 \+ 6: 3 × 10 \+ 3 × 6 = 48/,
      );
    }
    if (question.id === '2026t3v1_math_retas_perpendiculares_018') {
      assert.match(question.question, /Qual par de retas forma um ângulo reto/);
      assert.match(
        question.options[question.correctIndex],
        /se cruzam em ângulo reto/,
      );
    }
    if (
      topic.id === 'divisao' &&
      /quantas (?:filas|caixas|cartelas)|quantos sacos|quantos grupos/i.test(
        question.question,
      )
    ) {
      assert.match(
        Object.values(question.wrongExplanations)[0],
        /Teste \d+ grupos:/,
      );
    }
    if (
      topic.id === 'perimetro' &&
      question.question.startsWith('Um triângulo')
    ) {
      const sides = [...question.question.matchAll(/(\d+) (?:cm|m)/g)].map(
        ([, side]) => Number(side),
      );
      assert.equal(sides.length, 3);
      const largestIndex = sides.indexOf(Math.max(...sides));
      const largest = sides[largestIndex];
      const smallerSides = sides.filter((_, index) => index !== largestIndex);
      assert.ok(
        smallerSides.reduce((sum, side) => sum + side, 0) > largest,
        `${question.id}: medidas não formam um triângulo`,
      );
    }
  }

  const report = JSON.parse(
    fs.readFileSync(reportPath(topic, questions), 'utf8'),
  );
  assert.equal(report.sourceSha256, sha256(questions));
  assert.deepEqual(validateTopicReport(report, topic, questions), []);
}

assert.equal(ids.size, 220);
console.log('t3-matematica: ok (220 questões em 11 temas, todas em rascunho)');
