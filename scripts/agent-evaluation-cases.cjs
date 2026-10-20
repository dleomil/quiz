const fs = require('node:fs');
const path = require('node:path');
const { requiredPaths } = require('./agent-context.cjs');
const { readSource } = require('./document-catalog.cjs');

const CRITERIA = [
  'idioma',
  'apoio-generico',
  'resposta-revelada',
  'ambiguidade',
  'resposta-incorreta',
  'feedback-contraditorio',
];
const CODE_REQUIREMENTS = [
  'CODE-EXPORT: exporte uma funcao CommonJS summarizeResponses(responses).',
  'CODE-INPUT: responses deve ser array de objetos com correct booleano; entrada invalida deve lancar TypeError.',
  'CODE-RESULT: retorne somente {total, correct, points, percent}; points e correct vezes 5; percent e Math.round(correct * 100 / total).',
  'CODE-EMPTY: array vazio retorna {total:0, correct:0, points:0, percent:0}.',
  'CODE-PURE: preserve a entrada, inclusive objetos congelados; nao use dependencias, rede ou efeitos externos.',
];
const DOCUMENTATION_REQUIREMENTS = [
  'DOC-HEADINGS: escreva em portugues, com os titulos Execução, Regras e Falhas, cada um em linha propria.',
  'DOC-COMMAND: inclua exatamente node exemplo.cjs --entrada respostas.json --saida resultado.json.',
  'DOC-SCORE: explique total, correct, points e percent; inclua points = correct * 5 e percent = total === 0 ? 0 : Math.round(correct * 100 / total), como formulas de calculo.',
  'DOC-EXAMPLE: inclua um bloco ```json com {"input":[{"correct":true},{"correct":false}],"output":{"total":2,"correct":1,"points":5,"percent":50}}.',
  'DOC-EMPTY: explique que entrada vazia produz zeros; entrada invalida causa TypeError.',
  'DOC-LOCAL: indique uso local e inclua as frases Não requer rede. e Não requer credenciais.',
];
function inputFor(slot, configuration) {
  let proposal;
  let pass;
  if (slot.category === 'editorial') {
    const item = configuration.cases.find((row) => row.id === slot.caseId);
    proposal = item.proposal;
    pass = item.pass;
  }
  const topic = proposal?.topic || 'present-continuous';
  const sourceRef = proposal?.sourceRef || {
    referenceId: 'synthetic-evaluation-only',
    section: 'ingles',
    topic,
  };
  const input = {
    workItemId: slot.id,
    contentSetId: 'synthetic-evaluation-2026-t3',
    subjectId: proposal?.subject || 'ingles',
    topicId: topic,
    grade: '3-ano',
    academicYear: 2026,
    term: 't3',
    authorizedSkill: proposal?.skill || `avaliacao-sintetica-${topic}`,
    sourceRef,
    questionVersion: 1,
    authorizedObjective:
      slot.category === 'curation'
        ? `Exercicio sintetico: criar somente a pergunta EVAL-CUR-${slot.repetition} de present continuous conforme os fatos fornecidos; sem publicacao.`
        : 'Exercicio sintetico: avaliar somente a passagem solicitada da proposta fornecida; sem publicacao.',
    manifestState: 'frozen',
    humanFreezeApproval: {
      approvedBy: 'autorizacao-do-experimento-sintetico-apenas',
      approvedAt: '2026-10-20',
      evidenceRef:
        'fixture://agent-evolution-2026-10/not-a-production-approval',
    },
    requestedPass: pass || 'curation',
    sourceStatus: 'authorized',
  };
  if (configuration.benchmark) {
    const curriculum = configuration.benchmark.curriculum[input.subjectId];
    input.authorizedObjective = curriculum.objective;
    input.authorizedSkill = curriculum.skill;
    input.sourceRef = curriculum.sourceRef;
  }
  if (proposal) input.proposal = proposal;
  return { scenarioId: slot.id, inputState: 'complete', input };
}
function workFor(slot, configuration, root, repair) {
  const editorial = ['editorial', 'curation'].includes(slot.category);
  const document = editorial ? inputFor(slot, configuration) : null;
  const requirements =
    slot.category === 'code'
      ? CODE_REQUIREMENTS
      : slot.category === 'documentation'
        ? DOCUMENTATION_REQUIREMENTS
        : slot.category === 'verification'
          ? [
              'VER-POINTS: totalPoints soma 5 por item correto e zero por incorreto.',
              'VER-EMPTY: totalPoints deve retornar zero para lista vazia.',
              'VER-COVERAGE: confronte todos os requisitos com o codigo e as evidencias reais dos testes; passagem nos testes nao basta.',
              'Retorne JSON {decision,findings,facts,limitations}; decision approved, adjustments_required ou blocked. Cada achado tem requirementId, severity (major ou blocking) e evidence especifica.',
            ]
          : slot.category === 'editorial'
            ? [
                'Examine somente a passagem solicitada; detecte defeitos criticos e aceite o controle quando estiver correto.',
                `Use criterion com um destes IDs exatos quando aplicavel: ${CRITERIA.join(', ')}.`,
                'Vincule cada achado ao ID correto e apresente evidencia especifica; achados criticos usam major ou blocking.',
                'Cite literalmente uma parte do campo com problema; para ambiguidade, cite as duas alternativas defensaveis. Explique tambem o resultado correto quando houver erro numerico.',
                'A fonte e o congelamento desta entrada sao ficticios e exclusivos da avaliacao autorizada; nenhuma aprovacao curricular real foi fornecida ou sera gerada.',
              ]
            : [
                `Gere apenas a proposta EVAL-CUR-${slot.repetition}, com quatro alternativas distintas e explicacoes de todas as erradas.`,
                'Use enunciado em ingles e apoio em portugues especifico, com a mesma lacuna ___, sem revelar a resposta.',
                slot.repetition === 1
                  ? 'Fonte sintetica: She ___ reading a book. Forma correta is. Distratores are, am e be. Traducao dos elementos: ela, lendo, um livro. Nao escreva esta ou is no apoio em portugues.'
                  : 'Fonte sintetica: They ___ playing in the park. Forma correta are. Distratores is, am e be. Traducao dos elementos: eles, brincando, no parque. Nao escreva estao ou are no apoio em portugues.',
                'Registre humanApprovalRequired=true e reviewStatus=draft. Este artefato sintetico nao esta autorizado para publicacao.',
              ];
  const target = configuration.plan.authorFiles[slot.category];
  const work = {
    schemaVersion: 'agent-work-v1',
    id: slot.id,
    objective:
      (configuration.benchmark && document
        ? slot.category === 'editorial'
          ? 'Revisar somente a passagem solicitada da proposta sintética fornecida, confrontando-a com o objetivo curricular e os fatos autorizados; sem publicação.'
          : `Criar somente a pergunta sintética EVAL-CUR-${slot.repetition} de present continuous conforme o objetivo curricular e os fatos autorizados; sem publicação.`
        : document?.input.authorizedObjective) ||
      `Avaliacao sintetica delimitada de ${slot.category}.`,
    baseCommit: configuration.commit,
    role: slot.role,
    subjectId: document?.input.subjectId || null,
    curriculumCycle: editorial ? '2026-t3' : null,
    dependencies: [],
    documents: [],
    requirements: [...requirements],
    validExamples:
      slot.category === 'code'
        ? [
            'Duas respostas, uma correta: total 2, correct 1, points 5, percent 50.',
          ]
        : [
            'Artefato completo, restrito ao objetivo e com evidencias especificas.',
          ],
    invalidExamples: [
      'Omitir requisito, inventar aprovacao, alterar outros arquivos ou declarar testes que nao executou.',
    ],
    allowedPaths: target ? [target] : [],
    acceptanceCriteria: [...requirements],
    commands: target
      ? [
          `node --version${slot.category === 'code' ? `; node --check ${target}` : ''}`,
        ]
      : [],
    evidence: [],
    independentVerifier: `independent-script-${slot.id}`,
    stopConditions: [
      'Fonte ou contrato divergente; recurso externo, segredo ou rede necessario.',
    ],
    rollback:
      'Descartar a proposta sintetica. Nenhum resultado e aplicado ao projeto.',
  };
  if (configuration.benchmark && document) {
    const curriculum =
      configuration.benchmark.curriculum[document.input.subjectId];
    work.requirements.push(
      `Objetivo de aprendizagem autorizado: ${curriculum.objective}`,
      `Fonte sintética autorizada ${curriculum.sourceRef.referenceId}, vinculada ao escopo ${configuration.benchmark.manifestPath}, tema ${curriculum.topic}: ${curriculum.facts.join(' ')}`,
    );
  }
  if (repair)
    work.requirements.push(
      `Correcao unica da tentativa ${slot.repairOf}. Diagnostico independente: ${JSON.stringify(repair.grade)}. Proposta anterior: ${JSON.stringify(repair.output)}.`,
    );
  const catalog = JSON.parse(readSource(root, 'config/document-catalog.json'));
  const policy = JSON.parse(
    readSource(root, 'config/agent-context-policy.json'),
  );
  work.documents = requiredPaths(work, root).map((name) => {
    const doc = catalog.documents.find((item) => item.path === name);
    return {
      id: doc.id,
      version: doc.version,
      sha256: doc.sha256,
      sourceCommit: policy.approvals[0].sourceCommit,
    };
  });
  return { work, document };
}
function verificationSource(root, configuration) {
  return fs.readFileSync(
    path.join(root, configuration.plan.verificationFile),
    'utf8',
  );
}
module.exports = { workFor, inputFor, verificationSource, CRITERIA };
