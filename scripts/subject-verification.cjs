const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  validateBatch,
  validateReviews,
  validateApproval,
  packageHash,
} = require('./content-delivery.cjs');

function verifySubject({
  descriptor,
  coverage,
  policy,
  readJson,
  readText,
  allowTestEvidence = false,
}) {
  const errors = [];
  if (!allowTestEvidence) {
    try {
      if (
        !descriptor.runPath?.startsWith(
          `docs/editorial/subject-runs/${descriptor.subject}/`,
        )
      )
        throw new Error('registro operacional fora do escopo');
      const run = readJson(descriptor.runPath);
      if (
        run.schemaVersion !== 'subject-run-v1' ||
        run.subject !== descriptor.subject ||
        run.contentSetId !== descriptor.contentSetId ||
        !run.id ||
        !run.authorizationRef ||
        !/^[a-f0-9]{40}$/.test(run.baseSha) ||
        !Number.isFinite(run.startedAt) ||
        run.deadline !== run.startedAt + 180 * 60000 ||
        Date.now() >= run.deadline
      )
        throw new Error('registro operacional invalido ou prazo esgotado');
      if (
        !Array.isArray(run.calls) ||
        run.calls.some((c) => c.status === 'running')
      )
        throw new Error('chamadas editoriais ainda em execucao');
      for (const topic of run.topics) {
        if (run.calls.filter((c) => c.topic === topic).length > 6)
          throw new Error('orcamento de chamadas excedido');
        for (const pass of ['curation', 'pedagogical', 'linguistic'])
          if (
            !run.calls.some(
              (c) =>
                c.topic === topic &&
                c.pass === pass &&
                c.status === 'completed' &&
                c.evidencePath,
            )
          )
            throw new Error('passagem sem evidencia no registro operacional');
      }
      if (run.calls.some((c) => !run.topics.includes(c.topic)))
        throw new Error('chamada fora da materia');
      descriptor = { ...descriptor, run };
    } catch (error) {
      return { errors: [error.message], batches: [] };
    }
  }

  const { subject, contentSetId, batches, runtimePath } = descriptor;
  const delegation = policy.standingDelegation;
  if (
    descriptor.schemaVersion !== 'subject-delivery-v1' ||
    contentSetId !== delegation?.contentSetId ||
    !delegation.subjects.includes(subject)
  )
    return { errors: ['pacote fora do procedimento'], batches: [] };
  const curriculum = coverage.contentSets?.[contentSetId];
  const expectedTopics = Object.keys(
    curriculum?.subjects?.[subject] || {},
  ).sort();
  if (curriculum?.intakeStatus !== 'frozen' || !expectedTopics.length)
    errors.push('matriz ausente ou nao congelada');
  if (
    !Array.isArray(batches) ||
    JSON.stringify(batches.map((b) => b.topic).sort()) !==
      JSON.stringify(expectedTopics)
  )
    return {
      errors: [...errors, 'pacote exige todos os temas uma unica vez'],
      batches: [],
    };
  if (runtimePath !== `js/data/t3-${subject}-v2-published.js`)
    return { errors: ['caminho de runtime fora do escopo'], batches: [] };
  const context = vm.createContext({
    window: {
      QuestionsDataSources: { [subject]: { questions: [], topicMeta: {} } },
    },
  });
  try {
    vm.runInContext(readText(runtimePath), context, { timeout: 3000 });
  } catch {
    return { errors: ['runtime do candidato nao carregou'], batches: [] };
  }
  const sources = context.window.QuestionsDataSources;
  if (Object.keys(sources).some((key) => key !== subject))
    errors.push('runtime mistura materias');
  const runtime = JSON.parse(JSON.stringify(sources[subject]?.questions || []));
  if (
    runtime.some(
      (q) =>
        q.subject !== subject ||
        q.contentSetId !== contentSetId ||
        q.reviewStatus !== 'published',
    )
  )
    errors.push('runtime contem questoes fora do escopo ou rascunhos');
  const allIds = new Set();
  const results = [];
  for (const batch of batches) {
    try {
      if (!/^[a-z0-9-]+$/.test(batch.topic)) throw new Error('tema invalido');
      const prefix = `${contentSetId}--${subject}--${batch.topic}`;
      if (
        batch.draftPath !== `docs/drafts/${prefix}.json` ||
        batch.recordPath !== `docs/editorial/${prefix}.json`
      )
        throw new Error('caminho de lote fora do escopo');
      const questions = readJson(batch.draftPath).questions;
      const record = readJson(batch.recordPath);
      if (
        !allowTestEvidence &&
        (record.approval?.executionId !== descriptor.run.id ||
          record.approval?.evidenceRef !== descriptor.run.authorizationRef)
      )
        throw new Error('delegacao diverge da execucao');

      if (
        !Array.isArray(questions) ||
        questions.some(
          (q) =>
            q.subject !== subject ||
            q.contentSetId !== contentSetId ||
            q.topic !== batch.topic,
        )
      )
        throw new Error('rascunho fora do escopo');
      const checked = validateBatch(questions, {
        policy,
        coverage,
        topicNames: {},
      });
      errors.push(...checked.errors);
      errors.push(
        ...validateReviews(
          questions,
          record,
          (name) => {
            if (
              !allowTestEvidence &&
              !name.startsWith(`docs/editorial/subject-runs/${subject}/`)
            )
              throw new Error('evidencia fora da materia');
            return readJson(name);
          },
          { policy, allowTestEvidence },
        ),
      );
      errors.push(
        ...validateApproval(questions, record, policy, () => {
          throw new Error('procedimento exige delegacao');
        }),
      );
      if (!allowTestEvidence) {
        const curated = new Map();
        for (const ref of record.curationEvidencePaths || []) {
          if (!ref.startsWith(`docs/editorial/subject-runs/${subject}/`))
            throw new Error('origem de curadoria fora do escopo');
          const report = readJson(ref);
          const {
            digest,
            reviewProjection,
          } = require('./content-delivery.cjs');
          const evidence =
            require('./direct-curation.cjs').readCurationEvidence(report);
          if (
            !descriptor.run.calls.some(
              (c) =>
                c.topic === batch.topic &&
                c.pass === 'curation' &&
                c.status === 'completed' &&
                c.evidencePath === ref &&
                c.actor === evidence.agentInstanceId,
            )
          )
            throw new Error('curadoria ausente no registro operacional');
          const { scenario, output } = evidence;
          if (output?.decision !== 'approved')
            throw new Error('curadoria com pendencias');
          const findings =
            require('./direct-curation.cjs').validateDirectCuration(scenario, {
              expectedCount: output?.proposals?.length,
            });
          if (findings.length) throw new Error(findings.join('; '));
          for (const proposal of output.proposals)
            curated.set(digest(proposal), evidence.agentInstanceId);
          for (const question of questions) {
            const author = curated.get(digest(reviewProjection(question)));
            if (!author) continue;
            for (const review of record.reviews.filter(
              (r) => r.questionId === question.id,
            )) {
              if (
                !review.evidencePath.startsWith(
                  `docs/editorial/subject-runs/${subject}/`,
                )
              )
                throw new Error('origem da revisao fora do escopo');
              const execution = readJson(review.evidencePath).execution;
              if (execution?.agentInstanceId === author)
                throw new Error('autor nao pode revisar sua proposta');
              if (
                !descriptor.run.calls.some(
                  (c) =>
                    c.topic === batch.topic &&
                    c.pass === review.pass &&
                    c.status === 'completed' &&
                    c.evidencePath === review.evidencePath &&
                    c.actor === execution?.agentInstanceId,
                )
              )
                throw new Error('revisao ausente no registro operacional');
            }
          }
        }
        const { digest, reviewProjection } = require('./content-delivery.cjs');
        if (questions.some((q) => !curated.has(digest(reviewProjection(q)))))
          throw new Error('curadoria real ausente para IDs atuais');
      }
      const loaded = runtime.filter((q) => q.topic === batch.topic);
      if (packageHash(checked.questions) !== packageHash(loaded))
        errors.push(`${batch.topic}: runtime diverge do pacote`);
      if (
        record.visual?.sourceSha256 !== packageHash(questions) ||
        record.visual?.test !== 'content-delivery-ui' ||
        !record.visual?.evidenceRef
      )
        errors.push(`${batch.topic}: evidencia visual ausente`);
      for (const question of questions) {
        if (allIds.has(question.id))
          errors.push(`ID duplicado: ${question.id}`);
        allIds.add(question.id);
      }
      results.push({
        key: `${contentSetId}/${subject}/${batch.topic}`,
        stage: 'publish',
        sourceSha256: packageHash(checked.questions),
        ids: questions.map((q) => q.id),
      });
    } catch (error) {
      errors.push(`${batch.topic}: ${error.message}`);
    }
  }
  if (runtime.length !== allIds.size || runtime.some((q) => !allIds.has(q.id)))
    errors.push('runtime incompleto ou com IDs excedentes');
  return {
    schemaVersion: 'content-delivery-result-v1',
    subject,
    contentSetId,
    questions: runtime,
    errors,
    batches: results,
  };
}
function verifyFromDisk(root, descriptorPath) {
  const readText = (name) => {
    if (
      typeof name !== 'string' ||
      path.isAbsolute(name) ||
      name.split(/[\\/]/).includes('..')
    )
      throw new Error('caminho invalido');
    const resolved = fs.realpathSync(path.join(root, name));
    if (!resolved.startsWith(fs.realpathSync(root) + path.sep))
      throw new Error('caminho externo');
    return fs.readFileSync(resolved, 'utf8');
  };
  const readJson = (name) => JSON.parse(readText(name));
  return verifySubject({
    descriptor: readJson(descriptorPath),
    coverage: readJson('config/content-coverage-manifest.json'),
    policy: readJson('config/content-delivery-policy.json'),
    readJson,
    readText,
  });
}
if (require.main === module) {
  try {
    const result = verifyFromDisk(
      path.resolve(__dirname, '..'),
      process.argv[2] || '.github/subject-delivery.json',
    );
    process.stdout.write(JSON.stringify(result) + '\n');
    if (result.errors.length) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`subject-verification: ${error.message}\n`);
    process.exitCode = 1;
  }
}
module.exports = { verifySubject, verifyFromDisk };
