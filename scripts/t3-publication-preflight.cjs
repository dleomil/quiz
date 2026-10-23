const path = require('node:path');
const {
  loadContentCatalog,
  loadContentSources,
  loadCoverageManifest,
} = require('./validate-content.cjs');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_SET_ID = '2026-t3-v1';

function parseArguments(args) {
  const result = { subject: null, topics: [] };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument !== '--subject' && argument !== '--topic') {
      throw new Error('argumento invalido: ' + argument);
    }
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(argument + ' exige um valor');
    }
    if (argument === '--subject') {
      if (result.subject) throw new Error('--subject duplicado');
      result.subject = value;
    } else {
      result.topics.push(value);
    }
    index += 1;
  }
  if (!result.subject) throw new Error('--subject obrigatorio');
  if (result.topics.length === 0)
    throw new Error('informe ao menos um --topic');
  if (new Set(result.topics).size !== result.topics.length) {
    throw new Error('--topic duplicado');
  }
  return result;
}

function evaluateTopics({
  sources,
  coverageManifest,
  contentCatalog,
  subject,
  topics,
}) {
  const coverage = coverageManifest?.contentSets?.[CONTENT_SET_ID]?.subjects;
  const expectedTopics = coverage?.[subject];
  if (!expectedTopics) {
    throw new Error('materia nao declarada no manifesto T3: ' + subject);
  }

  const contentSet = contentCatalog.find(
    (entry) => entry.contentSetId === CONTENT_SET_ID,
  );
  if (!contentSet) throw new Error('acervo T3 ausente no catalogo');

  const questions = sources[subject]?.questions || [];
  const results = topics.map((topic) => {
    const expected = expectedTopics[topic];
    if (!Number.isInteger(expected) || expected < 1) {
      throw new Error('tema nao declarado no manifesto T3: ' + topic);
    }
    const matching = questions.filter(
      (question) =>
        question.contentSetId === CONTENT_SET_ID && question.topic === topic,
    );
    const actual = matching.length;
    if (actual > expected) {
      throw new Error(
        'cobertura acima da meta para ' + topic + ': atual=' + actual,
      );
    }
    const complete =
      contentSet.status === 'published' &&
      actual === expected &&
      matching.every((question) => question.reviewStatus === 'published');
    return {
      topic,
      actual,
      expected,
      contentStatus: contentSet.status,
      complete,
    };
  });

  return {
    schemaVersion: 't3-publication-preflight-v1',
    contentSetId: CONTENT_SET_ID,
    subject,
    topics: results,
    decision: results.some((result) => result.complete)
      ? 'stop_already_complete'
      : 'proceed_to_planning',
  };
}

function run(args = process.argv.slice(2), rootDirectory = ROOT) {
  try {
    const input = parseArguments(args);
    const result = evaluateTopics({
      sources: loadContentSources(rootDirectory),
      coverageManifest: loadCoverageManifest(rootDirectory),
      contentCatalog: loadContentCatalog(rootDirectory),
      ...input,
    });
    process.stdout.write(JSON.stringify(result) + '\n');
    if (result.decision === 'stop_already_complete') process.exitCode = 2;
  } catch (error) {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  }
}

if (require.main === module) run();

module.exports = { evaluateTopics, parseArguments, run };
