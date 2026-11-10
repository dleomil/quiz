function questions(topic = 'tema-sintetico') {
  return Array.from({ length: 20 }, (_, index) => ({
    schemaVersion: 'content-v1',
    id: `sintetico-${index}`,
    contentSetId: '2026-t3-v2',
    subject: 'historia',
    topic,
    question: 'Qual objeto foi descrito como feito de madeira?',
    options: ['Mesa', 'Copo de vidro', 'Colher de metal', 'Bola de borracha'],
    correctIndex: 0,
    explanation: 'A mesa descrita foi feita de madeira.',
    wrongExplanations: {
      1: 'O copo descrito foi feito de vidro.',
      2: 'A colher descrita foi feita de metal.',
      3: 'A bola descrita foi feita de borracha.',
    },
    skill: 'Identificar a informacao explicita no exemplo sintetico.',
    version: 1,
    reviewStatus: 'draft',
    sourceRef: { referenceId: 'fixture-sintetica', section: 'Teste', topic },
  }));
}
function scenario() {
  const proposals = questions();
  const input = {
    workItemId: 'fixture',
    contentSetId: '2026-t3-v2',
    subjectId: 'historia',
    topicId: proposals[0].topic,
    grade: '3',
    academicYear: 2026,
    term: 't3',
    authorizedSkill: proposals[0].skill,
    sourceRef: proposals[0].sourceRef,
    questionVersion: 1,
    authorizedObjective: 'Conferir o fluxo com dados sinteticos.',
    manifestState: 'frozen',
    humanFreezeApproval: {
      approvedBy: 'fixture',
      approvedAt: '2026-11-10',
      evidenceRef: 'fixture://congelamento',
    },
    requestedPass: 'curation',
    sourceStatus: 'authorized',
  };
  const output = {
    agent: 'content_curator',
    workItemId: input.workItemId,
    contentSetId: input.contentSetId,
    subjectId: input.subjectId,
    topicId: input.topicId,
    reviewPass: 'curation',
    decision: 'approved',
    facts: ['Somente dados sinteticos.'],
    doubts: [],
    findings: [],
    recommendations: [],
    humanApprovalRequired: true,
    proposals,
  };
  return {
    scenarioId: 'fixture-curadoria-direta',
    inputState: 'complete',
    input,
    output,
  };
}
module.exports = { questions, scenario };
