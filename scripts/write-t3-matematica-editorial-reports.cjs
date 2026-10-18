const { TOPICS, buildQuestions } = require('./create-t3-matematica-drafts.cjs');
const PASSES = ['pedagogical', 'linguistic'];

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

function diagnoseQuestions() {
  return {
    schemaVersion: 'technical-diagnostic-v1',
    editorialApproval: false,
    topics: TOPICS.map((topic) => ({
      topic: topic.id,
      findings: buildQuestions(topic).flatMap((question) =>
        PASSES.flatMap((pass) => findingsFor(question, topic, pass)),
      ),
    })),
  };
}

if (require.main === module)
  console.log(JSON.stringify(diagnoseQuestions(), null, 2));
module.exports = { findingsFor, diagnoseQuestions };
