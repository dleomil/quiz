const { digest } = require('./document-catalog.cjs');

function usageFromEvents(jsonl, allowedTools = []) {
  let usage = null;
  let completed = false;
  let unexpectedTool = false;
  for (const line of jsonl.split('\n').filter(Boolean)) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      throw new Error('eventos da CLI invalidos');
    }
    if (
      event.item &&
      !['agent_message', 'reasoning', 'plan', ...allowedTools].includes(
        event.item.type,
      )
    )
      unexpectedTool = true;
    if (event.type === 'turn.completed') {
      completed = true;
      const reported = event.usage;
      if (reported) {
        const keys = ['input_tokens', 'cached_input_tokens', 'output_tokens'];
        if (
          !keys.every(
            (key) => Number.isSafeInteger(reported[key]) && reported[key] >= 0,
          )
        )
          throw new Error('uso de tokens invalido');
        usage = Object.fromEntries(keys.map((key) => [key, reported[key]]));
      }
    }
  }
  if (unexpectedTool)
    throw new Error('ferramenta acionada em revisao sem ferramentas');
  if (!completed) throw new Error('execucao sem evento de conclusao');
  return usage;
}

function makeReceipt(details) {
  const payload = {
    schemaVersion: 'agent-run-receipt-v1',
    ...details,
    observedModel: null,
    subscriptionUsage: null,
    attempts: 1,
    corrections: 0,
    limitations: [
      'Modelo e esforco solicitados fixados; identidade remota nao atestada pela CLI.',
      'Disponibilidade no catalogo nao comprova acesso da conta.',
      'Consumo da assinatura e cobranca nao informados pela CLI; sem estimativa por preco de API.',
      'Tentativas contam invocacoes do runner; tentativas internas do servico nao informadas.',
      'Recibo local e evidencia rastreavel, sem assinatura criptografica de identidade humana.',
    ],
  };
  return { ...payload, sha256: digest(payload) };
}
module.exports = { makeReceipt, usageFromEvents };
