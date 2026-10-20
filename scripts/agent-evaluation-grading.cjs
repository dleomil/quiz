const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { permissionArguments, PROFILE } = require('./agent-writer-sandbox.cjs');
const { validateEditorialScenario } = require('./validate-codex-agents.cjs');
const { validateQuestion } = require('./validate-content.cjs');
const { sha256 } = require('./governance-guidelines.cjs');

function gradeEditorial(document, scenario, expected) {
  const errors = validateEditorialScenario({
    ...document,
    output: scenario.output,
  });
  const output = scenario.output || {};
  const normalizeEvidence = (value) =>
    String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/×/g, 'x')
      .replace(/[^a-z0-9]/g, '');
  if (expected.kind === 'valid') {
    if (
      output.decision !== 'approved' ||
      output.findings?.length ||
      output.doubts?.length
    )
      errors.push('Controle valido nao foi aceito sem achados.');
  } else if (
    output.decision === 'approved' ||
    !Array.isArray(output.findings) ||
    !output.findings.some(
      (item) =>
        item?.questionId === document.input.proposal.id &&
        item.criterion === expected.expectedCriterion &&
        ['major', 'blocking'].includes(item.severity) &&
        typeof item.evidence === 'string' &&
        item.evidence.trim().length >= 12 &&
        expected.evidenceGroups.every((group) =>
          group.some((fragment) =>
            normalizeEvidence(item.evidence).includes(
              normalizeEvidence(fragment),
            ),
          ),
        ),
    )
  )
    errors.push(
      `Defeito critico nao detectado com ID, criterio e evidencia: ${expected.expectedCriterion}.`,
    );
  return {
    passed: errors.length === 0,
    errors,
    expectedCriterion: expected.expectedCriterion,
  };
}
function gradeCuration(document, scenario, slot) {
  const errors = validateEditorialScenario({
    ...document,
    output: scenario.output,
  });
  const proposal = scenario.output?.proposal;
  if (!proposal)
    return { passed: false, errors: [...errors, 'Proposta ausente.'] };
  errors.push(...validateQuestion(proposal, document.input.subjectId));
  if (
    scenario.output.decision !== 'approved' ||
    proposal.id !== `EVAL-CUR-${slot.repetition}`
  )
    errors.push('Proposta nao concluida ou ID solicitado ausente.');
  const answer = slot.repetition === 1 ? 'is' : 'are';
  const normalize = (value) =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[.!?]$/g, '');
  if (
    normalize(proposal.options?.[proposal.correctIndex]) !== answer ||
    !Array.isArray(proposal.options) ||
    proposal.options.filter((option) => normalize(option) === answer).length !==
      1
  )
    errors.push(
      'Gabarito nao corresponde a fonte sintetica ou resposta nao e unica.',
    );
  const support = String(proposal.questionPt || '');
  if (
    !support.includes('___') ||
    (support.match(/___/g) || []).length !== 1 ||
    /\b(?:is|are|est[aá]|est[aã]o)\b/i.test(support) ||
    !(slot.repetition === 1 ? /livro/i : /parque/i).test(support)
  )
    errors.push(
      'Apoio em portugues ausente, generico, sem lacuna ou com resposta revelada.',
    );
  if (
    !(
      slot.repetition === 1
        ? /\bShe\b.*___.*reading.*book/i
        : /\bThey\b.*___.*playing.*park/i
    ).test(proposal.question)
  )
    errors.push('Enunciado nao corresponde ao mapa delimitado.');
  return { passed: errors.length === 0, errors };
}
function gradeDocumentation(bytes) {
  const value = bytes.toString('utf8');
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const errors = [];
  for (const title of ['Execucao', 'Regras', 'Falhas'])
    if (!new RegExp(`^(?:#{1,3} )?${title}[ \\t]*$`, 'm').test(normalized))
      errors.push(`Secao ausente: ${title}.`);
  if (
    !value.includes(
      'node exemplo.cjs --entrada respostas.json --saida resultado.json',
    )
  )
    errors.push('Comando especificado ausente.');
  if (
    !/TypeError/.test(value) ||
    !/vazi[ao]/i.test(value) ||
    !/zero|\b0\b/i.test(value)
  )
    errors.push('Falhas e entrada vazia nao documentadas.');
  if (
    !normalized.toLowerCase().includes('nao requer rede') ||
    !normalized.toLowerCase().includes('nao requer credenciais') ||
    !value.replace(/\s+/g, '').includes('points=correct*5') ||
    !value
      .replace(/\s+/g, '')
      .includes('percent=total===0?0:Math.round(correct*100/total)')
  )
    errors.push('Regras de calculo ou limites locais ausentes.');
  const blocks = [...value.matchAll(/```json\s*([\s\S]*?)```/g)];
  let exampleValid = false;
  for (const block of blocks) {
    try {
      const example = JSON.parse(block[1]);
      const result = example.output;
      if (
        JSON.stringify(example.input) ===
          '[{"correct":true},{"correct":false}]' &&
        result.total === 2 &&
        result.correct === 1 &&
        result.points === 5 &&
        result.percent === 50 &&
        Object.keys(result).sort().join(',') === 'correct,percent,points,total'
      )
        exampleValid = true;
    } catch {
      /* Outros blocos nao substituem o exemplo valido. */
    }
  }
  if (!exampleValid)
    errors.push('Exemplo JSON completo e consistente ausente.');
  return {
    passed: errors.length === 0,
    errors,
    limitations: [
      'Checagem estrutural e de fatos delimitados; nao comprova qualidade geral de toda documentacao.',
    ],
  };
}
function runIndependent(bin, workspace, scratch, program, payload) {
  const started = Date.now();
  const home = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-independent-check-'),
  );
  try {
    fs.writeFileSync(
      path.join(home, 'config.toml'),
      'approval_policy="never"\n',
    );
    const nonce = crypto.randomUUID();
    const result = spawnSync(
      bin,
      [
        'sandbox',
        '--include-managed-config',
        ...permissionArguments(workspace, [], scratch),
        '-P',
        PROFILE,
        '-C',
        workspace,
        process.execPath,
        '-e',
        program,
        JSON.stringify({ nonce, payload }),
      ],
      {
        cwd: workspace,
        env: {
          PATH: process.env.PATH,
          HOME: scratch,
          CODEX_HOME: home,
          TMPDIR: scratch,
        },
        encoding: 'utf8',
        timeout: 10000,
        maxBuffer: 1024 * 1024,
      },
    );
    if (result.error || result.status !== 0)
      return {
        passed: false,
        errors: ['Validacao independente falhou ou excedeu dez segundos.'],
      };
    let observed;
    try {
      observed = JSON.parse(result.stdout.trim());
    } catch {
      return {
        passed: false,
        errors: ['Validacao sem resultado estruturado completo.'],
      };
    }
    if (observed.nonce !== nonce || !Array.isArray(observed.results))
      return {
        passed: false,
        errors: ['Conclusao da validacao nao comprovada.'],
      };
    return {
      observed: observed.results,
      commandSha256: sha256(program),
      durationBoundMs: 10000,
      durationMs: Date.now() - started,
    };
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
}
function gradeCode(bin, workspace, scratch, target) {
  const vectors = [
    [],
    [{ correct: true }],
    [{ correct: false }],
    ...[3, 7, 11].map((length) =>
      Array.from({ length }, () => ({ correct: Boolean(crypto.randomInt(2)) })),
    ),
  ];
  const invalid = [null, {}, [null], [{ correct: 1 }], [{ correct: 'true' }]];
  const program = `const data=JSON.parse(process.argv[1]);const fn=require(require('node:path').resolve(data.payload.target));const results=[];
for(const vector of data.payload.vectors){const items=Object.freeze(vector.map(item=>Object.freeze({...item})));try{results.push({value:fn(items)});}catch(e){results.push({error:e.name});}}
for(const vector of data.payload.invalid){try{fn(vector);results.push({throws:false});}catch(e){results.push({throws:e.name==='TypeError'});}}
console.log(JSON.stringify({nonce:data.nonce,results}));`;
  const checked = runIndependent(bin, workspace, scratch, program, {
    target,
    vectors,
    invalid,
  });
  if (!checked.observed) return checked;
  const errors = [];
  if (checked.observed.length !== vectors.length + invalid.length)
    errors.push('Cobertura incompleta dos vetores.');
  vectors.forEach((items, index) => {
    const correct = items.filter((item) => item.correct).length;
    const expected = {
      total: items.length,
      correct,
      points: correct * 5,
      percent: items.length ? Math.round((correct * 100) / items.length) : 0,
    };
    const actual = checked.observed[index]?.value;
    if (
      !actual ||
      Object.keys(actual).sort().join(',') !== 'correct,percent,points,total' ||
      Object.keys(expected).some((key) => actual[key] !== expected[key])
    )
      errors.push(
        `CODE-RESULT/CODE-EMPTY/CODE-PURE: vetor ${index} divergente.`,
      );
  });
  invalid.forEach((_, index) => {
    if (!checked.observed[vectors.length + index]?.throws)
      errors.push(`CODE-INPUT: entrada invalida ${index} aceita.`);
  });
  return { passed: !errors.length, errors, vectors, ...checked };
}
function gradeVerification(output) {
  const errors = [];
  if (
    !output ||
    Object.keys(output).sort().join(',') !==
      'decision,facts,findings,limitations' ||
    !['adjustments_required', 'blocked'].includes(output.decision) ||
    !Array.isArray(output.findings) ||
    !output.findings.some(
      (item) =>
        item?.requirementId === 'VER-EMPTY' &&
        ['major', 'blocking'].includes(item.severity) &&
        typeof item.evidence === 'string' &&
        item.evidence.length >= 12 &&
        /reduce|valor inicial|acumulador/i.test(item.evidence) &&
        /vazi|empty/i.test(item.evidence),
    )
  )
    errors.push('VER-EMPTY nao foi identificado com evidencia especifica.');
  if (
    !Array.isArray(output?.facts) ||
    !output.facts.every((item) => typeof item === 'string') ||
    !Array.isArray(output?.limitations) ||
    !output.limitations.every((item) => typeof item === 'string')
  )
    errors.push('Fatos ou limitacoes invalidos.');
  return { passed: !errors.length, errors };
}
module.exports = {
  gradeEditorial,
  gradeCuration,
  gradeDocumentation,
  gradeCode,
  gradeVerification,
  runIndependent,
};
