function validateDelegatedApproval(questions, record, policy, packageHash) {
  const approval = record?.approval;
  const delegation = policy.standingDelegation;
  if (!delegation || !questions.length) return ['delegacao nao habilitada'];
  const first = questions[0];
  if (
    questions.some(
      (q) =>
        q.subject !== first.subject ||
        q.contentSetId !== first.contentSetId ||
        q.topic !== first.topic,
    )
  )
    return ['delegacao nao admite lote misturado'];
  if (
    !delegation.subjects.includes(first.subject) ||
    first.contentSetId !== delegation.contentSetId
  )
    return ['lote fora da delegacao'];
  if (
    approval?.kind !== 'delegated' ||
    approval.delegationId !== delegation.id ||
    approval.sourceSha256 !== packageHash(questions)
  )
    return ['delegacao ou hash do pacote diverge'];
  if (
    typeof approval.executionId !== 'string' ||
    !approval.executionId.trim() ||
    typeof approval.evidenceRef !== 'string' ||
    !approval.evidenceRef.trim()
  )
    return ['execucao ou referencia do comando ausente'];
  if ('approvedBy' in approval)
    return ['delegacao nao representa assinatura humana do pacote'];
  if (record.recoveryReports?.length)
    return ['recuperacao editorial fora do procedimento direto'];
  return [];
}
module.exports = { validateDelegatedApproval };
