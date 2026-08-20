const assert = require('node:assert/strict');
const {
  validateCoverageManifest,
} = require('../../scripts/validate-content.cjs');

function question(id, topic) {
  return {
    schemaVersion: 'content-v1',
    id,
    contentSetId: 'test-t1-v1',
    subject: 'matematica',
    topic,
  };
}

function sources(questions) {
  return { matematica: { questions } };
}

function manifest(expectedTopics) {
  return {
    schemaVersion: 'coverage-v1',
    contentSets: {
      'test-t1-v1': {
        subjects: { matematica: expectedTopics },
      },
    },
  };
}

function catalog(status) {
  return [{ contentSetId: 'test-t1-v1', status }];
}

function run() {
  assert.deepStrictEqual(
    validateCoverageManifest(
      sources([question('q1', 'medidas'), question('q2', 'medidas')]),
      manifest({ medidas: 2 }),
      catalog('published'),
    ),
    [],
  );

  const missingErrors = validateCoverageManifest(
    sources([question('q1', 'medidas')]),
    manifest({ medidas: 2 }),
    catalog('published'),
  );
  assert.ok(
    missingErrors.some((error) =>
      error.includes('atual=1 esperado=2 status=published'),
    ),
  );

  assert.deepStrictEqual(
    validateCoverageManifest(
      sources([question('q1', 'medidas')]),
      manifest({ medidas: 2 }),
      catalog('draft'),
    ),
    [],
  );

  const excessErrors = validateCoverageManifest(
    sources([question('q1', 'medidas'), question('q2', 'medidas')]),
    manifest({ medidas: 1 }),
    catalog('draft'),
  );
  assert.ok(
    excessErrors.some((error) =>
      error.includes('atual=2 esperado=1 status=draft'),
    ),
  );

  const unknownTopicErrors = validateCoverageManifest(
    sources([question('q1', 'tema_desconhecido')]),
    manifest({ medidas: 1 }),
    catalog('draft'),
  );
  assert.ok(
    unknownTopicErrors.some((error) =>
      error.includes('atual=1 esperado=nao-declarado'),
    ),
  );

  const missingManifestErrors = validateCoverageManifest(
    sources([question('q1', 'medidas')]),
    { schemaVersion: 'coverage-v1', contentSets: {} },
    catalog('published'),
  );
  assert.ok(
    missingManifestErrors.some((error) =>
      error.includes('published exige manifesto de cobertura'),
    ),
  );

  console.log('content-coverage-validator: ok');
}

run();
