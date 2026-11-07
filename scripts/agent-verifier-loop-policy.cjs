'use strict';

const { digest } = require('./document-catalog.cjs');

const AUTO_LIMIT = 2;
const EXTRA_LIMIT = 2;
const TOTAL_LIMIT = AUTO_LIMIT + EXTRA_LIMIT;

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function outputSignature(output) {
  return digest({
    decision: output.decision,
    findings: output.findings
      .map((item) => ({
        requirementId: item.requirementId,
        severity: item.severity,
      }))
      .sort(
        (a, b) =>
          a.requirementId.localeCompare(b.requirementId) ||
          a.severity.localeCompare(b.severity),
      ),
  });
}

function needsSecondPass(output) {
  return output.reviewStatus === 'needs_review';
}

function isConverged(previous, current) {
  return (
    Boolean(previous) &&
    current.reviewStatus === 'conclusive' &&
    previous.signature === outputSignature(current)
  );
}

function reserveCall(state) {
  check(
    state.callsUsed < TOTAL_LIMIT,
    'teto absoluto de quatro execucoes atingido',
  );
  return { ...state, callsUsed: state.callsUsed + 1 };
}

function canAuthorize(state) {
  return (
    state.status === 'awaiting_authorization' &&
    !state.extraAuthorizationUsed &&
    state.callsUsed >= 1 &&
    state.callsUsed <= AUTO_LIMIT &&
    state.callsUsed < TOTAL_LIMIT
  );
}

function validateAuthorization(state, workSha256, statement) {
  check(
    canAuthorize(state),
    'tarefa nao esta aguardando a unica extensao permitida',
  );
  check(
    workSha256 === state.workSha256,
    'hash da ficha diverge; autorizacao rejeitada',
  );
  check(
    /\b(aprovo|autorizo)\b/i.test(statement) &&
      /\b(at[eé])\s*(2|duas)\b/i.test(statement) &&
      statement.includes(state.workSha256),
    'declaracao deve autorizar ate duas execucoes e mencionar o hash integral da ficha',
  );
  return {
    maximumAdditionalCalls: EXTRA_LIMIT,
    totalCeiling: TOTAL_LIMIT,
  };
}

module.exports = {
  AUTO_LIMIT,
  EXTRA_LIMIT,
  TOTAL_LIMIT,
  canAuthorize,
  isConverged,
  needsSecondPass,
  outputSignature,
  reserveCall,
  validateAuthorization,
};
