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

  const partialManifest = {
    schemaVersion: 'coverage-v1',
    contentSets: {
      '2026-t3-v2': {
        publicationMode: 'by-subject',
        intakeStatus: 'frozen',
        subjects: {
          portugues: { primeiro: 20, segundo: 20 },
          geografia: { agua: 20 },
        },
      },
    },
  };
  const partialCatalog = [
    {
      contentSetId: '2026-t3-v2',
      status: 'published',
      publicationMode: 'by-subject',
      publishedSubjects: ['portugues'],
    },
  ];
  const approved = ['primeiro', 'segundo'].flatMap((topic) =>
    Array.from({ length: 20 }, (_, index) => ({
      schemaVersion: 'content-v1',
      id: topic + index,
      contentSetId: '2026-t3-v2',
      subject: 'portugues',
      topic,
      reviewStatus: 'published',
    })),
  );
  const check = (
    questions = approved,
    metadata = partialManifest,
    catalogs = partialCatalog,
  ) =>
    validateCoverageManifest({ portugues: { questions } }, metadata, catalogs);
  assert.deepEqual(check(), []);
  assert.ok(
    check(approved.slice(1)).some((error) =>
      error.includes('atual=19 esperado=20'),
    ),
  );
  assert.ok(
    check(approved.filter((q) => q.topic !== 'segundo')).some((error) =>
      error.includes('atual=0 esperado=20'),
    ),
  );
  assert.ok(check([...approved, { ...approved[0], id: 'extra' }]).length);
  assert.ok(
    check([
      ...approved,
      { ...approved[0], subject: 'geografia', topic: 'agua', id: 'pendente' },
    ]).some((error) => error.includes('materia pendente')),
  );
  assert.ok(
    check(
      approved.map((q, i) => (i === 0 ? { ...q, reviewStatus: 'draft' } : q)),
    ).some((error) => error.includes('sem publicacao')),
  );
  for (const publishedSubjects of [
    [],
    ['portugues', 'portugues'],
    ['desconhecida'],
  ]) {
    assert.ok(
      check(approved, partialManifest, [
        { ...partialCatalog[0], publishedSubjects },
      ]).length,
    );
  }
  const underReview = JSON.parse(JSON.stringify(partialManifest));
  underReview.contentSets['2026-t3-v2'].intakeStatus = 'under-review';
  assert.ok(
    check(approved, underReview).some((error) =>
      error.includes('intake frozen'),
    ),
  );
  assert.deepEqual(
    check([], underReview, [
      { ...partialCatalog[0], status: 'draft', publishedSubjects: [] },
    ]),
    [],
  );
  assert.ok(
    check([], underReview, [{ ...partialCatalog[0], status: 'draft' }]).length,
  );

  console.log('content-coverage-validator: ok');
}

run();
