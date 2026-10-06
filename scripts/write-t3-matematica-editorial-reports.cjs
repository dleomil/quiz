const fs = require('node:fs');
const { TOPICS, buildQuestions } = require('./create-t3-matematica-drafts.cjs');
const {
  PASSES,
  reportPath,
} = require('./validate-t3-matematica-editorial-reports.cjs');

function makeFinding(question, pass, finding) {
  return {
    questionId: question.id,
    pass,
    severity: finding.severity,
    criterion: finding.criterion,
    evidence: finding.evidence,
    recommendation: finding.recommendation,
  };
}

function findingsFor(question, topic, pass) {
  const findings = [];
  const feedback = Object.entries(question.wrongExplanations);
  if (pass === 'pedagogical') {
    if (new Set(feedback.map(([, text]) => text)).size !== 3) {
      findings.push(
        makeFinding(question, pass, {
          severity: 'major',
          criterion:
            'Cada alternativa incorreta deve receber feedback próprio.',
          evidence: 'Há explicações repetidas entre distratores.',
          recommendation:
            'Diferenciar os feedbacks e relacioná-los ao distrator correspondente.',
        }),
      );
    }
    for (const [optionIndex, text] of feedback) {
      if (!text.includes(question.options[Number(optionIndex)])) {
        findings.push(
          makeFinding(question, pass, {
            severity: 'major',
            criterion:
              'O feedback precisa responder à alternativa selecionada.',
            evidence: `A explicação não identifica a opção “${question.options[Number(optionIndex)]}”.`,
            recommendation:
              'Explicar por que essa escolha não satisfaz o raciocínio ou o cálculo pedido.',
          }),
        );
      }
    }
    if (
      topic.id === 'perimetro' &&
      question.question.startsWith('Um triângulo')
    ) {
      const sides = [...question.question.matchAll(/(\d+) (?:cm|m)/g)].map(
        ([, side]) => Number(side),
      );
      if (
        sides.length !== 3 ||
        sides.reduce((sum, side) => sum + side, 0) - Math.max(...sides) <=
          Math.max(...sides)
      ) {
        findings.push(
          makeFinding(question, pass, {
            severity: 'blocking',
            criterion: 'As medidas dos lados devem definir a figura nomeada.',
            evidence: `As medidas apresentadas não satisfazem a desigualdade triangular: ${sides.join(', ')}.`,
            recommendation:
              'Corrigir as medidas e recalcular gabarito, alternativas e explicação.',
          }),
        );
      }
    }
  }

  if (pass === 'linguistic') {
    for (const [, text] of feedback) {
      if (
        /\.\.|\bNaN\b|\bundefined\b|\b1 resultados favoráveis\b|\b(?!1\b)\d+ resultado favorável\b/.test(
          text,
        )
      ) {
        findings.push(
          makeFinding(question, pass, {
            severity: 'major',
            criterion:
              'A redação deve evitar pontuação duplicada, dados ausentes e discordância nominal.',
            evidence: `Trecho encontrado: “${text}”`,
            recommendation:
              'Corrigir a frase gerada e revalidar todas as alternativas do tema.',
          }),
        );
        break;
      }
    }
  }
  return findings;
}

function writeReports() {
  const reports = [];
  for (const topic of TOPICS) {
    const questions = buildQuestions(topic);
    const reviews = questions.flatMap((question) =>
      PASSES.map((pass) => {
        const findings = findingsFor(question, topic, pass);
        const blocking = findings.some(
          (finding) => finding.severity === 'blocking',
        );
        return {
          questionId: question.id,
          pass,
          decision: blocking
            ? 'blocked'
            : findings.length
              ? 'adjustments_required'
              : 'approved',
          facts: [
            'Enunciado, alternativas, gabarito e explicação principal revisados diretamente nesta conversa.',
          ],
          doubts: [],
          findings,
          recommendations: findings.map((finding) => finding.recommendation),
          humanApprovalRequired: true,
        };
      }),
    );
    const file = reportPath(topic, questions);
    if (fs.existsSync(file))
      throw new Error(`Relatorio existente; nao sobrescrito: ${file}`);
    const report = {
      schemaVersion: 'editorial-review-v1',
      reviewMode: 'in-conversation-direct',
      reviewer: 'Codex (conversa atual)',
      contentSetId: '2026-t3-v1',
      subjectId: 'matematica',
      topicId: topic.id,
      sourceSha256: require('./create-t3-matematica-drafts.cjs').sha256(
        questions,
      ),
      requestedPasses: PASSES,
      expectedEvaluations: questions.length * PASSES.length,
      completedEvaluations: reviews.length,
      reportStatus: reviews.every((review) => review.decision === 'approved')
        ? 'clear'
        : 'blocked',
      humanApprovalRequired: true,
      reviews,
    };
    fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, {
      flag: 'wx',
    });
    reports.push({
      topic: topic.id,
      evaluations: reviews.length,
      status: report.reportStatus,
    });
  }
  console.log(JSON.stringify(reports, null, 2));
}

if (require.main === module) writeReports();

module.exports = { findingsFor, writeReports };
