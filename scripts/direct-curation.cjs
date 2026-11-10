const { validateEditorialScenario } = require('./validate-codex-agents.cjs');

function validateDirectCuration(scenario, { expectedCount = 20 } = {}) {
  const errors = [];
  if (
    scenario?.input?.contentSetId !== '2026-t3-v2' ||
    !['historia', 'ingles', 'matematica', 'ciencias'].includes(
      scenario?.input?.subjectId,
    )
  )
    return ['curadoria direta fora do escopo autorizado'];
  const proposals = scenario?.output?.proposals;
  if (
    !Number.isInteger(expectedCount) ||
    expectedCount < 1 ||
    expectedCount > 20 ||
    !Array.isArray(proposals) ||
    proposals.length !== expectedCount
  )
    return ['curadoria direta exige 20 propostas completas'];
  if (new Set(proposals.map((q) => q.id)).size !== proposals.length)
    errors.push('IDs duplicados na curadoria');
  for (const proposal of proposals) {
    const output = { ...scenario.output, proposal };
    delete output.proposals;
    if (output.agent !== 'content_curator' || output.reviewPass !== 'curation')
      errors.push('curadoria exige autor e passagem proprios');
    errors.push(...validateEditorialScenario({ ...scenario, output }));
  }
  return [...new Set(errors)];
}
module.exports = { validateDirectCuration };
