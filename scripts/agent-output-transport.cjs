const VERSION = 'agent-output-transport-v1';
const KINDS = [
  'object',
  'array',
  'string',
  'integer',
  'number',
  'boolean',
  'null',
];
const KEYS = new Set([
  'type',
  'properties',
  'required',
  'additionalProperties',
  'items',
  'enum',
  'anyOf',
  'minLength',
  'minimum',
  'maximum',
  'minItems',
  'maxItems',
]);
const text = () => ({ type: 'string', minLength: 1 });
const object = (properties) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
function check(value, message) {
  if (!value) throw new Error(`transporte: ${message}`);
}
function validateSchema(schema) {
  function visit(node, root = false) {
    check(
      node && typeof node === 'object' && !Array.isArray(node),
      'schema invalido',
    );
    check(
      Object.keys(node).every((key) => KEYS.has(key)),
      'palavra-chave nao suportada',
    );
    if (node.anyOf) {
      check(
        !root &&
          Object.keys(node).length === 1 &&
          Array.isArray(node.anyOf) &&
          node.anyOf.length > 0,
        'uniao invalida',
      );
      node.anyOf.forEach((child) => visit(child));
      return;
    }
    const types = Array.isArray(node.type) ? node.type : [node.type];
    check(
      types.length > 0 &&
        types.every((type) => KINDS.includes(type)) &&
        (!root || node.type === 'object'),
      'tipo invalido ou raiz nao e objeto',
    );
    if (types.includes('object')) {
      check(
        node.type === 'object' &&
          node.properties &&
          typeof node.properties === 'object' &&
          !Array.isArray(node.properties) &&
          node.additionalProperties === false,
        'objeto deve ser fechado',
      );
      check(
        Array.isArray(node.required) &&
          new Set(node.required).size === node.required.length &&
          JSON.stringify([...node.required].sort()) ===
            JSON.stringify(Object.keys(node.properties).sort()),
        'todas as propriedades devem ser obrigatorias',
      );
      Object.values(node.properties).forEach((child) => visit(child));
    }
    if (types.includes('array')) {
      check(node.items, 'array sem items');
      visit(node.items);
    }
    if (node.enum)
      check(Array.isArray(node.enum) && node.enum.length > 0, 'enum invalido');
  }
  visit(schema, true);
  return schema;
}
function validateValue(value, schema) {
  if (schema.anyOf) {
    check(
      schema.anyOf.some((branch) => {
        try {
          validateValue(value, branch);
          return true;
        } catch {
          return false;
        }
      }),
      'valor fora da uniao',
    );
    return;
  }
  const kind =
    value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  check(
    types.includes(kind) ||
      (types.includes('integer') && Number.isInteger(value)),
    'tipo de valor divergente',
  );
  if (schema.enum) check(schema.enum.includes(value), 'valor fora do enum');
  if (kind === 'object') {
    check(
      Object.keys(value).length === schema.required.length &&
        schema.required.every((key) => Object.hasOwn(value, key)),
      'campos ausentes ou extras',
    );
    for (const [key, child] of Object.entries(schema.properties))
      validateValue(value[key], child);
  }
  if (kind === 'array') {
    check(
      (schema.minItems === undefined || value.length >= schema.minItems) &&
        (schema.maxItems === undefined || value.length <= schema.maxItems),
      'tamanho de array invalido',
    );
    value.forEach((item) => validateValue(item, schema.items));
  }
  if (kind === 'string' && schema.minLength !== undefined)
    check(value.length >= schema.minLength, 'texto vazio');
  if (kind === 'number')
    check(
      Number.isFinite(value) &&
        (schema.minimum === undefined || value >= schema.minimum) &&
        (schema.maximum === undefined || value <= schema.maximum),
      'numero invalido',
    );
}
function plain(node, definitions) {
  if (node.$ref)
    return plain(definitions[node.$ref.replace('#/$defs/', '')], definitions);
  const result = JSON.parse(JSON.stringify(node));
  if (Object.hasOwn(result, 'const')) {
    result.type = typeof result.const;
    result.enum = [result.const];
    delete result.const;
  } else if (result.enum && !result.type) result.type = typeof result.enum[0];
  if (result.properties)
    result.properties = Object.fromEntries(
      Object.entries(result.properties).map(([key, child]) => [
        key,
        plain(child, definitions),
      ]),
    );
  if (result.items) result.items = plain(result.items, definitions);
  return result;
}
function editorialSchema(contract, agent, subject) {
  check(
    ['content_curator', 'pedagogical_quality'].includes(agent),
    'agente invalido',
  );
  const properties = Object.fromEntries(
    Object.entries(contract.properties)
      .filter(([key]) => key !== 'proposal')
      .map(([key, node]) => [key, plain(node, contract.$defs)]),
  );
  properties.agent = { type: 'string', enum: [agent] };
  properties.findings = {
    type: 'array',
    items: object({
      questionId: text(),
      criterion: text(),
      severity: { type: 'string', enum: ['minor', 'major', 'blocking'] },
      evidence: text(),
      recommendation: text(),
    }),
  };
  if (agent === 'content_curator') {
    const proposal = { ...contract.$defs.proposal };
    delete proposal.allOf;
    const fields = { ...proposal.properties };
    delete fields.wrongExplanations;
    const converted = plain(
      { ...proposal, properties: fields },
      contract.$defs,
    ).properties;
    converted.questionPt =
      subject === 'ingles'
        ? text()
        : { type: ['string', 'null'], minLength: 1 };
    converted.wrongExplanations = object(
      Object.fromEntries(
        ['0', '1', '2', '3'].map((key) => [
          key,
          { type: ['string', 'null'], minLength: 1 },
        ]),
      ),
    );
    properties.proposal = { anyOf: [object(converted), { type: 'null' }] };
  }
  return validateSchema(object(properties));
}
function curatorProposalSchema(contract, subject) {
  const proposal = { ...contract.$defs.proposal };
  delete proposal.allOf;
  const fields = { ...proposal.properties };
  delete fields.wrongExplanations;
  const converted = plain(
    { ...proposal, properties: fields },
    contract.$defs,
  ).properties;
  converted.questionPt =
    subject === 'ingles' ? text() : { type: ['string', 'null'], minLength: 1 };
  converted.wrongExplanations = object(
    Object.fromEntries(
      ['0', '1', '2', '3'].map((key) => [
        key,
        { type: ['string', 'null'], minLength: 1 },
      ]),
    ),
  );
  return object(converted);
}
function editorialBatchSchema(contract, agent, subject, batchSize) {
  check(
    ['content_curator', 'pedagogical_quality'].includes(agent),
    'agente invalido',
  );
  check(
    Number.isInteger(batchSize) && batchSize >= 1 && batchSize <= 20,
    'lote deve conter de 1 a 20 propostas',
  );
  const properties = Object.fromEntries(
    Object.entries(contract.properties)
      .filter(([key]) => key !== 'proposal')
      .map(([key, node]) => [key, plain(node, contract.$defs)]),
  );
  properties.agent = { type: 'string', enum: [agent] };
  properties.findings = {
    type: 'array',
    items: object({
      questionId: text(),
      criterion: text(),
      severity: { type: 'string', enum: ['minor', 'major', 'blocking'] },
      evidence: text(),
      recommendation: text(),
    }),
  };
  if (agent === 'content_curator') {
    properties.proposals = {
      type: 'array',
      items: curatorProposalSchema(contract, subject),
      minItems: 0,
      maxItems: batchSize,
    };
  } else {
    const finding = properties.findings.items;
    properties.results = {
      type: 'array',
      minItems: batchSize,
      maxItems: batchSize,
      items: object({
        questionId: text(),
        decision: {
          type: 'string',
          enum: ['approved', 'adjustments_required', 'blocked'],
        },
        findings: { type: 'array', items: finding },
        doubts: { type: 'array', items: text() },
        checks: object({
          question: text(),
          options: text(),
          answer: text(),
          explanation: text(),
          wrongExplanations: text(),
        }),
      }),
    };
  }
  return validateSchema(object(properties));
}
function decodeEditorial(raw, schema, agent) {
  validateValue(raw, schema);
  const result = JSON.parse(JSON.stringify(raw));
  if (agent === 'content_curator') {
    if (result.decision === 'blocked') {
      check(result.proposal === null, 'bloqueio nao pode conter proposta');
      delete result.proposal;
    } else {
      check(result.proposal !== null, 'decisao exige proposta');
      const proposal = result.proposal;
      for (const key of ['0', '1', '2', '3']) {
        if (key === String(proposal.correctIndex)) {
          check(
            proposal.wrongExplanations[key] === null,
            'alternativa correta deve ter feedback nulo no transporte',
          );
          delete proposal.wrongExplanations[key];
        } else
          check(
            typeof proposal.wrongExplanations[key] === 'string' &&
              proposal.wrongExplanations[key].trim(),
            'alternativa incorreta exige explicacao',
          );
      }
      if (proposal.questionPt === null) delete proposal.questionPt;
    }
  }
  return result;
}
function decodeEditorialBatch(raw, schema, agent) {
  validateValue(raw, schema);
  const result = JSON.parse(JSON.stringify(raw));
  if (agent === 'content_curator') {
    check(
      ['approved', 'adjustments_required', 'blocked'].includes(result.decision),
      'decisao de curadoria invalida',
    );
    if (result.decision === 'blocked') {
      check(
        result.proposals.length === 0,
        'bloqueio nao pode conter propostas',
      );
    } else {
      check(
        result.proposals.length === schema.properties.proposals.maxItems,
        'curadoria exige todas as propostas do lote',
      );
      const proposalIds = result.proposals.map((proposal) => proposal.id);
      check(
        new Set(proposalIds).size === proposalIds.length,
        'curadoria contem IDs duplicados',
      );
      for (const proposal of result.proposals) {
        for (const key of ['0', '1', '2', '3']) {
          if (key === String(proposal.correctIndex)) {
            check(
              proposal.wrongExplanations[key] === null,
              'alternativa correta deve ter feedback nulo no transporte',
            );
            delete proposal.wrongExplanations[key];
          } else
            check(
              typeof proposal.wrongExplanations[key] === 'string' &&
                proposal.wrongExplanations[key].trim(),
              'alternativa incorreta exige explicacao',
            );
        }
        if (proposal.questionPt === null) delete proposal.questionPt;
      }
    }
  } else {
    check(
      result.results.length === schema.properties.results.maxItems,
      'revisao exige um resultado por proposta',
    );
    const questionIds = result.results.map((item) => item.questionId);
    check(
      new Set(questionIds).size === questionIds.length,
      'revisao contem IDs duplicados',
    );
  }
  return result;
}
function verificationSchema() {
  return validateSchema(
    object({
      decision: {
        type: 'string',
        enum: ['approved', 'adjustments_required', 'blocked'],
      },
      findings: {
        type: 'array',
        items: object({
          requirementId: text(),
          severity: { type: 'string', enum: ['major', 'blocking'] },
          evidence: text(),
        }),
      },
      facts: { type: 'array', items: text() },
      limitations: { type: 'array', items: text() },
    }),
  );
}
const INSTRUCTIONS =
  'Formato de transporte: todas as propriedades do schema sao obrigatorias. Na curadoria, proposal deve ser null somente quando decision=blocked. Em wrongExplanations, informe as quatro chaves 0,1,2,3: somente a chave do correctIndex deve ser null; as outras tres exigem explicacoes preenchidas. questionPt e obrigatorio para ingles; use null apenas quando esse campo for opcional e estiver ausente. Nao omita propriedades do schema.';
const BATCH_INSTRUCTIONS =
  'Formato de transporte em lote: todas as propriedades do schema sao obrigatorias. Na curadoria, retorne propostas completas para todos os IDs de entrada, preservando IDs; use lista vazia somente em decisao blocked. Em wrongExplanations, inclua as quatro chaves 0,1,2,3 e use null somente na chave correta; as outras tres exigem explicacoes. questionPt e obrigatorio para ingles; use null apenas quando esse campo for opcional e estiver ausente. Na revisao, retorne exatamente um resultado para cada ID, sem duplicatas, e preencha os cinco checks com justificativas especificas. Nao omita propriedades.';
module.exports = {
  VERSION,
  INSTRUCTIONS,
  BATCH_INSTRUCTIONS,
  validateSchema,
  validateValue,
  editorialSchema,
  editorialBatchSchema,
  decodeEditorial,
  decodeEditorialBatch,
  verificationSchema,
};
