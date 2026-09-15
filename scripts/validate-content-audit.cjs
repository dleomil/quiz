const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { loadContentSources } = require('./validate-content.cjs');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_SET_ID = '2026-t2-v1';
const REMEDIATION_CONTENT_SET_ID = '2026-t2-v2';
const REVIEW_MODE = 'single-agent-sequential';
const PASSES = new Map([
  ['curriculum-factual', 'content_curator'],
  ['pedagogical-linguistic', 'pedagogical_quality'],
]);
const CATEGORIES = new Set([
  'factual-correctness',
  'curriculum-alignment',
  'single-defensible-answer',
  'language',
  'age-appropriateness',
  'distractor-quality',
  'explanation-quality',
  'inclusion-safety',
  'answer-distribution',
]);

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

function getQuestions(sources, contentSetId) {
  return Object.values(sources)
    .flatMap((source) => source.questions || [])
    .filter((question) => question.contentSetId === contentSetId)
    .sort((left, right) => left.id.localeCompare(right.id));
}

function contentSha256(questions) {
  const canonical = JSON.stringify(stableValue(questions));
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

function validRef(value) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    (value.startsWith('school-curriculum:') ||
      value.startsWith('https://') ||
      value.startsWith('https://github.com/'))
  );
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

function validateAuditReport(report, sources, expectedContentSetId) {
  const errors = [];
  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    return ['relatorio deve ser um objeto'];
  }
  const allowedTopLevel = new Set([
    'schemaVersion',
    'reviewMode',
    'reportStatus',
    'contentSetId',
    'sourceSha256',
    'remediationContentSetId',
    'remediationSha256',
    'reviews',
    'humanApproval',
  ]);
  Object.keys(report).forEach((key) => {
    if (!allowedTopLevel.has(key)) errors.push(`campo desconhecido: ${key}`);
  });
  if (report.schemaVersion !== 'content-quality-audit-v1') {
    errors.push('schemaVersion deve ser content-quality-audit-v1');
  }
  if (report.reviewMode !== REVIEW_MODE) {
    errors.push(`reviewMode deve ser ${REVIEW_MODE}`);
  }
  if (!['draft', 'final'].includes(report.reportStatus)) {
    errors.push('reportStatus deve ser draft ou final');
  }
  const isFinal = report.reportStatus === 'final';
  const contentSetId = expectedContentSetId || CONTENT_SET_ID;
  if (report.contentSetId !== contentSetId) {
    errors.push(`contentSetId deve ser ${contentSetId}`);
  }

  const questions = getQuestions(sources, contentSetId);
  if (questions.length === 0) {
    errors.push(`acervo sem questoes: ${contentSetId}`);
    return errors;
  }
  if (!/^[a-f0-9]{64}$/.test(report.sourceSha256 || '')) {
    errors.push('sourceSha256 invalido');
  } else if (report.sourceSha256 !== contentSha256(questions)) {
    errors.push('sourceSha256 diverge do conteudo atual');
  }
  if (!Array.isArray(report.reviews)) {
    errors.push('reviews deve ser uma lista');
    return errors;
  }

  const expectedIds = new Set(questions.map((question) => question.id));
  const reviewByQuestion = new Map();
  const reviewKeys = new Set();
  const findingIds = new Set();
  const allowedReviewKeys = new Set([
    'questionId',
    'pass',
    'actorId',
    'actorRole',
    'evidenceRefs',
    'decision',
    'findings',
  ]);
  const allowedFindingKeys = new Set([
    'findingId',
    'category',
    'severity',
    'field',
    'evidenceRef',
    'resolutionQuestionId',
    'resolution',
    'resolutionRef',
  ]);

  report.reviews.forEach((review, index) => {
    const label = `reviews[${index}]`;
    if (!review || typeof review !== 'object' || Array.isArray(review)) {
      errors.push(`${label} deve ser um objeto`);
      return;
    }
    Object.keys(review).forEach((key) => {
      if (!allowedReviewKeys.has(key)) {
        errors.push(`${label} campo desconhecido: ${key}`);
      }
    });
    if (!expectedIds.has(review.questionId)) {
      errors.push(
        `${label} questionId ausente do acervo: ${review.questionId}`,
      );
    }
    if (!PASSES.has(review.pass)) errors.push(`${label} pass invalido`);
    if (
      PASSES.has(review.pass) &&
      review.actorRole !== PASSES.get(review.pass)
    ) {
      errors.push(`${label} actorRole nao corresponde a passagem`);
    }
    if (typeof review.actorId !== 'string' || !review.actorId.trim()) {
      errors.push(`${label} actorId obrigatorio`);
    }
    if (
      !Array.isArray(review.evidenceRefs) ||
      review.evidenceRefs.length === 0 ||
      review.evidenceRefs.some((reference) => !validRef(reference))
    ) {
      errors.push(`${label} evidenceRefs deve apontar para fonte ou evidencia`);
    }
    if (!['clear', 'findings'].includes(review.decision)) {
      errors.push(`${label} decision invalida`);
    }
    if (!Array.isArray(review.findings)) {
      errors.push(`${label} findings deve ser uma lista`);
      return;
    }
    if (review.decision === 'clear' && review.findings.length !== 0) {
      errors.push(`${label} decisao clear nao pode conter achados`);
    }
    if (review.decision === 'findings' && review.findings.length === 0) {
      errors.push(`${label} decisao findings exige pelo menos um achado`);
    }
    const reviewKey = `${review.questionId}:${review.pass}`;
    if (reviewKeys.has(reviewKey)) errors.push(`${label} passagem duplicada`);
    reviewKeys.add(reviewKey);
    if (!reviewByQuestion.has(review.questionId)) {
      reviewByQuestion.set(review.questionId, []);
    }
    reviewByQuestion.get(review.questionId).push(review);

    review.findings.forEach((finding, findingIndex) => {
      const findingLabel = `${label}.findings[${findingIndex}]`;
      if (!finding || typeof finding !== 'object' || Array.isArray(finding)) {
        errors.push(`${findingLabel} deve ser um objeto`);
        return;
      }
      Object.keys(finding).forEach((key) => {
        if (!allowedFindingKeys.has(key)) {
          errors.push(`${findingLabel} campo desconhecido: ${key}`);
        }
      });
      if (
        typeof finding.findingId !== 'string' ||
        !finding.findingId.trim() ||
        findingIds.has(finding.findingId)
      ) {
        errors.push(`${findingLabel} findingId ausente ou duplicado`);
      }
      findingIds.add(finding.findingId);
      if (!CATEGORIES.has(finding.category)) {
        errors.push(`${findingLabel} category invalida`);
      }
      if (!['blocking', 'major', 'minor'].includes(finding.severity)) {
        errors.push(`${findingLabel} severity invalida`);
      }
      if (typeof finding.field !== 'string' || !finding.field.trim()) {
        errors.push(`${findingLabel} field obrigatorio`);
      }
      if (!validRef(finding.evidenceRef)) {
        errors.push(
          `${findingLabel} evidenceRef deve apontar para fonte ou evidencia`,
        );
      }
      if (!['pending', 'corrected', 'dismissed'].includes(finding.resolution)) {
        errors.push(`${findingLabel} resolution invalida`);
      }
      if (isFinal && finding.resolution === 'pending') {
        errors.push(`${findingLabel} achado continua sem resolucao`);
      }
      if (finding.resolution === 'corrected') {
        const expectedResolutionId = `2026t2v2_${review.questionId}`;
        if (finding.resolutionQuestionId !== expectedResolutionId) {
          errors.push(
            `${findingLabel} resolutionQuestionId deve ser ${expectedResolutionId}`,
          );
        }
        if (!validRef(finding.resolutionRef)) {
          errors.push(`${findingLabel} resolutionRef invalida`);
        }
      } else if (finding.resolution === 'dismissed') {
        if (!validRef(finding.resolutionRef)) {
          errors.push(`${findingLabel} resolutionRef invalida`);
        }
        if (finding.resolutionQuestionId !== undefined) {
          errors.push(
            `${findingLabel} achado dismissed nao pode apontar questao V2`,
          );
        }
      } else if (finding.resolutionRef || finding.resolutionQuestionId) {
        errors.push(`${findingLabel} achado pending nao pode ter resolucao`);
      }
    });
  });

  expectedIds.forEach((questionId) => {
    const reviews = reviewByQuestion.get(questionId) || [];
    const passes = new Set(reviews.map((review) => review.pass));
    if (isFinal && passes.size !== PASSES.size) {
      errors.push(`[${questionId}] exige as duas passagens`);
    }
  });
  reviewByQuestion.forEach((reviews, questionId) => {
    if (
      reviews.length > PASSES.size ||
      (isFinal && reviews.length !== PASSES.size)
    ) {
      errors.push(`[${questionId}] possui passagem ausente ou extra`);
    }
  });

  const actors = new Set(
    report.reviews
      .map((review) => review && review.actorId)
      .filter((actorId) => typeof actorId === 'string' && actorId.trim()),
  );
  if (actors.size > 1) {
    errors.push('single-agent-sequential exige um unico actorId');
  }

  if (isFinal) {
    if (report.remediationContentSetId !== REMEDIATION_CONTENT_SET_ID) {
      errors.push(
        `remediationContentSetId deve ser ${REMEDIATION_CONTENT_SET_ID}`,
      );
    }
    const remediationQuestions = getQuestions(
      sources,
      REMEDIATION_CONTENT_SET_ID,
    );
    if (remediationQuestions.length !== questions.length) {
      errors.push('V2 deve conter a mesma quantidade de questoes da V1');
    } else if (
      !/^[a-f0-9]{64}$/.test(report.remediationSha256 || '') ||
      report.remediationSha256 !== contentSha256(remediationQuestions)
    ) {
      errors.push('remediationSha256 invalido ou divergente da V2');
    }
    expectedIds.forEach((questionId) => {
      const v2Id = `2026t2v2_${questionId}`;
      if (!remediationQuestions.some((question) => question.id === v2Id)) {
        errors.push(`[${questionId}] questao correspondente ausente na V2`);
      }
    });
  }

  const approval = report.humanApproval;
  if (!approval || typeof approval !== 'object' || Array.isArray(approval)) {
    if (isFinal) errors.push('humanApproval obrigatoria');
  } else {
    const allowedApprovalKeys = new Set([
      'actorId',
      'decision',
      'approvedAt',
      'evidenceRef',
    ]);
    Object.keys(approval).forEach((key) => {
      if (!allowedApprovalKeys.has(key)) {
        errors.push(`humanApproval campo desconhecido: ${key}`);
      }
    });
    if (
      typeof approval.actorId !== 'string' ||
      !approval.actorId.trim() ||
      approval.decision !== 'approved'
    ) {
      errors.push('humanApproval exige decisao humana aprovada');
    }
    if (!validDate(approval.approvedAt)) {
      errors.push('humanApproval approvedAt invalida');
    }
    if (
      report.reviews.some(
        (review) => review && review.actorId === approval.actorId,
      )
    ) {
      errors.push('humanApproval deve ser de ator distinto dos revisores');
    }
    if (!validRef(approval.evidenceRef)) {
      errors.push('humanApproval evidenceRef invalida');
    }
  }
  return [...new Set(errors)];
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

function hasArgument(name) {
  return process.argv.includes(name);
}

function main() {
  const inputPath = argument('--input');
  const contentSetId = argument('--content-set-id') || CONTENT_SET_ID;
  const requireFinal = hasArgument('--require-final');
  if (!inputPath) {
    process.stderr.write(
      'use: npm run validate:content-audit -- --input <relatorio> [--content-set-id <id>] [--require-final]\n',
    );
    process.exitCode = 1;
    return;
  }
  let report;
  try {
    report = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  } catch (error) {
    process.stderr.write(`relatorio invalido: ${error.message}\n`);
    process.exitCode = 1;
    return;
  }
  if (requireFinal && report.reportStatus !== 'final') {
    process.stderr.write('reportStatus deve ser final\n');
    process.exitCode = 1;
    return;
  }
  const errors = validateAuditReport(
    report,
    loadContentSources(ROOT),
    contentSetId,
  );
  if (errors.length) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`content-quality-audit: ok (${contentSetId})\n`);
}

if (require.main === module) main();

module.exports = {
  contentSha256,
  getQuestions,
  validateAuditReport,
};
