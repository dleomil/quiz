const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_DIRECTORY = path.join(ROOT, 'docs/drafts');
const OUTPUT_PATH = path.join(ROOT, 'js/data/t3-matematica-published.js');
const TOPICS = [
  ['probabilidade', 'Probabilidade'],
  ['multiplicacao', 'Multiplicação'],
  ['divisao', 'Divisão'],
  ['divisao-metodos', 'Métodos longo e breve da divisão'],
  ['expressoes', 'Expressões aritméticas simples'],
  ['decomposicao-multiplicacao', 'Decomposição com multiplicação'],
  ['problemas-expressoes', 'Problemas com expressões'],
  ['area-malha', 'Área da malha quadriculada'],
  ['perimetro', 'Perímetro'],
  ['retas-perpendiculares', 'Retas perpendiculares'],
  ['divisao-euclidiana', 'Divisão euclidiana'],
];

function buildRelease() {
  const questions = TOPICS.flatMap(([topic]) => {
    const draftPath = path.join(
      DRAFT_DIRECTORY,
      `2026-t3-v1-mat-${topic}.json`,
    );
    const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
    if (draft.contentSetId !== '2026-t3-v1' || draft.questions.length !== 20) {
      throw new Error(`Draft incompleto ou de outro content set: ${topic}`);
    }
    return draft.questions.map((question) => {
      if (question.reviewStatus !== 'draft' || question.topic !== topic) {
        throw new Error(`Questão fora do contrato editorial: ${question.id}`);
      }
      return { ...question, reviewStatus: 'published' };
    });
  });

  const topicMeta = Object.fromEntries(
    TOPICS.map(([topic, name]) => [topic, { name, icon: '🔢' }]),
  );
  const bundle = `/* Publicação T3 de Matemática: 11 temas aprovados. */\n(function () {\n  const publishedQuestions = ${JSON.stringify(questions, null, 2)};\n  const source = window.QuestionsDataSources.matematica;\n  if (!source) return;\n  source.questions.push(...publishedQuestions);\n  Object.assign(source.topicMeta, ${JSON.stringify(topicMeta, null, 2)});\n})();\n`;
  fs.writeFileSync(OUTPUT_PATH, bundle);
  return questions.length;
}

if (require.main === module) {
  process.stdout.write(
    `t3-matematica-release: ${buildRelease()} questões geradas\n`,
  );
}

module.exports = { buildRelease, TOPICS };
