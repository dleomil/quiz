const { digest } = require('./document-catalog.cjs');
const { analyzeEvents, assertEvents } = require('./agent-cli-events.cjs');

function usageFromEvents(jsonl, allowedTools = []) {
  return assertEvents(analyzeEvents(jsonl, allowedTools));
}

function makeReceipt(details) {
  const payload = {
    schemaVersion: 'agent-run-receipt-v1',
    ...details,
    observedModel: null,
    subscriptionUsage: null,
    attempts: 1,
    corrections: details.evaluation?.repairOf ? 1 : 0,
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
module.exports = { makeReceipt, usageFromEvents, analyzeEvents, assertEvents };
