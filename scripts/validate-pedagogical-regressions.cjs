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

function questionTextFields(question) {
  return [
    ['question', question.question],
    ['questionPt', question.questionPt],
    ...(question.options || []).map((value, index) => [
      `options[${index}]`,
      value,
    ]),
    ['explanation', question.explanation],
    ...Object.entries(question.wrongExplanations || {}).map(
      ([index, value]) => [`wrongExplanations[${index}]`, value],
    ),
  ].filter(([, value]) => typeof value === 'string' && value.trim());
}

function finding(field, rule, evidence) {
  return { field, rule, evidence: normalize(evidence).slice(0, 80) };
}

function evaluateCaseFindings(regressionCase) {
  const question = regressionCase.question;
  const findings = [];

  questionTextFields(question).forEach(([field, text]) => {
    const normalizedText = normalize(text);

    if (question.subject === 'portugues') {
      for (const [incorrect] of ORTHOGRAPHY_REPLACEMENTS) {
        const match = text.match(new RegExp(`\\b${incorrect}\\b`, 'iu'));
        if (match) {
          findings.push(
            finding(field, 'linguistic.common-orthography', match[0]),
          );
        }
      }
    }

    const nominalAgreement = /\b(?:as\s+criança|a\s+crianças)\b/iu.exec(text);
    const verbAgreement =
      /\b(?:as\s+crianças\s+(?:brinca|corre|estuda|joga|canta|pula)|a\s+criança\s+(?:brincam|correm|estudam|jogam|cantam|pulam))\b/iu.exec(
        text,
      );
    const agreementMatch = nominalAgreement || verbAgreement;
    if (agreementMatch) {
      findings.push(
        finding(field, 'linguistic.subject-agreement', agreementMatch[0]),
      );
    }

    const repeatedToken =
      /(?<![\p{L}\p{N}_])([\p{L}\p{N}_]+)\s+\1(?![\p{L}\p{N}_])/iu.exec(
        normalizedText,
      );
    if (repeatedToken) {
      findings.push(
        finding(field, 'linguistic.repeated-token', repeatedToken[0]),
      );
    }
  });

  if (
    typeof question.explanation !== 'string' ||
    question.explanation.trim().length < 25 ||
    /^porque esta certo\.?$/i.test(question.explanation.trim())
  ) {
    findings.push(
      finding(
        'explanation',
        'pedagogical.explanation-too-short',
        question.explanation || '<ausente>',
      ),
    );
  }
  if (regressionCase.category === 'ambiguity') {
    findings.push(
      finding(
        'question',
        'semantic.ambiguity-requires-human-review',
        question.question,
      ),
    );
  }
  return findings;
}

function evaluateCase(regressionCase) {
  return [
    ...new Set(evaluateCaseFindings(regressionCase).map(({ rule }) => rule)),
  ];
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
  const candidates = [];
  Object.values(sources).forEach((source) => {
    source.questions
      .filter((question) => question.contentSetId === '2026-t2-v1')
      .forEach((question) => {
        evaluateCaseFindings({ category: 'published', question }).forEach(
          ({ field, rule, evidence }) => {
            candidates.push({
              questionId: question.id,
              field,
              rule,
              evidence,
            });
          },
        );
      });
  });
  return {
    schemaVersion: 't2-diagnostic-v1',
    blocking: false,
    candidates,
  };
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

module.exports = {
  evaluateCase,
  evaluateCaseFindings,
  scanPublishedT2,
  validateCorpus,
};
