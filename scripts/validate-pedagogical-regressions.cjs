const fs = require('node:fs');
const path = require('node:path');
const {
  loadContentSources,
  validateQuestion,
} = require('./validate-content.cjs');

const ROOT = path.resolve(__dirname, '..');
const CORPUS_PATH = path.join(
  ROOT,
  'config',
  'pedagogical-regression-corpus.json',
);
const REQUIRED_CATEGORIES = new Set([
  'clean',
  'orthography',
  'agreement',
  'unnatural-option',
  'insufficient-explanation',
  'ambiguity',
]);
const ORTHOGRAPHY_REPLACEMENTS = new Map([
  ['voce', 'você'],
  ['crianca', 'criança'],
  ['nao', 'não'],
  ['tambem', 'também'],
]);

function normalize(value) {
  return String(value).trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
}

function allQuestionText(question) {
  return [
    question.question,
    ...(question.options || []),
    question.explanation,
    ...Object.values(question.wrongExplanations || {}),
  ].join(' ');
}

function evaluateCase(regressionCase) {
  const question = regressionCase.question;
  const findings = [];
  const text = allQuestionText(question);
  const normalizedText = normalize(text);

  if (question.subject === 'portugues') {
    for (const [incorrect, correct] of ORTHOGRAPHY_REPLACEMENTS) {
      if (new RegExp(`\\b${incorrect}\\b`, 'i').test(text)) {
        findings.push('linguistic.common-orthography');
      }
      if (new RegExp(`\\b${correct}\\b`, 'i').test(text)) break;
    }
  }
  if (
    /\bas\s+criança\s+\w+\b/i.test(text) ||
    /\ba\s+crianças\s+\w+\b/i.test(text)
  ) {
    findings.push('linguistic.subject-agreement');
  }
  if (/\b(\w+)\s+\1\b/i.test(normalizedText)) {
    findings.push('linguistic.repeated-token');
  }
  if (
    typeof question.explanation !== 'string' ||
    question.explanation.trim().length < 25 ||
    /^porque esta certo\.?$/i.test(question.explanation.trim())
  ) {
    findings.push('pedagogical.explanation-too-short');
  }
  if (regressionCase.category === 'ambiguity') {
    findings.push('semantic.ambiguity-requires-human-review');
  }
  return [...new Set(findings)];
}

function validateCorpus(corpus) {
  const errors = [];
  if (!corpus || corpus.schemaVersion !== 'pedagogical-regression-v1') {
    return ['corpus deve usar schema pedagogical-regression-v1'];
  }
  if (!Array.isArray(corpus.cases) || corpus.cases.length === 0) {
    return ['corpus deve possuir cases'];
  }
  const ids = new Set();
  const categories = new Set();
  corpus.cases.forEach((regressionCase, index) => {
    const label = `[${regressionCase?.id || `case-${index}`}]`;
    if (!regressionCase.id || ids.has(regressionCase.id)) {
      errors.push(`${label} id ausente ou duplicado`);
    }
    ids.add(regressionCase.id);
    categories.add(regressionCase.category);
    if (
      !['pass', 'fail', 'not_evaluable'].includes(
        regressionCase.expectedOutcome,
      )
    ) {
      errors.push(`${label} expectedOutcome invalido`);
    }
    if (!Array.isArray(regressionCase.expectedRules)) {
      errors.push(`${label} expectedRules deve ser lista`);
    }
    errors.push(
      ...validateQuestion(
        regressionCase.question,
        regressionCase.question?.subject || 'synthetic',
      ),
    );
    const actualRules = evaluateCase(regressionCase);
    if (
      JSON.stringify([...actualRules].sort()) !==
      JSON.stringify([...(regressionCase.expectedRules || [])].sort())
    ) {
      errors.push(`${label} regras observadas divergem das esperadas`);
    }
    const expectedOutcome = actualRules.length
      ? regressionCase.category === 'ambiguity'
        ? 'not_evaluable'
        : 'fail'
      : 'pass';
    if (expectedOutcome !== regressionCase.expectedOutcome) {
      errors.push(`${label} resultado observado diverge do esperado`);
    }
  });
  REQUIRED_CATEGORIES.forEach((category) => {
    if (!categories.has(category))
      errors.push(`categoria ausente: ${category}`);
  });
  return errors;
}

function scanPublishedT2(rootDirectory) {
  const sources = loadContentSources(rootDirectory);
  const counts = new Map();
  Object.values(sources).forEach((source) => {
    source.questions
      .filter((question) => question.contentSetId === '2026-t2-v1')
      .forEach((question) => {
        evaluateCase({ category: 'published', question }).forEach((rule) => {
          counts.set(rule, (counts.get(rule) || 0) + 1);
        });
      });
  });
  return Object.fromEntries([...counts.entries()].sort());
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));
  const errors = validateCorpus(corpus);
  if (errors.length) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write('pedagogical-regression-corpus: ok\n');
  if (process.argv.includes('--scan-t2')) {
    process.stdout.write(
      `t2-read-only-scan: ${JSON.stringify(scanPublishedT2(ROOT))}\n`,
    );
  }
}

if (require.main === module) main();

module.exports = { evaluateCase, scanPublishedT2, validateCorpus };
