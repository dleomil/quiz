const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SUBJECT_FILES = [
  'portugues',
  'matematica',
  'ciencias',
  'geografia',
  'historia',
  'ingles',
];
const REVIEW_STATUSES = new Set([
  'draft',
  'pedagogical-approved',
  'published',
  'retired',
]);
const COVERAGE_MANIFEST_PATH = path.join(
  'config',
  'content-coverage-manifest.json',
);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOption(value) {
  return String(value).trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
}

function questionLabel(question) {
  return isNonEmptyString(question && question.id) ? question.id : '<sem-id>';
}

function validateQuestion(question, sourceName) {
  const errors = [];
  const label = questionLabel(question);

  if (!question || typeof question !== 'object') {
    return ['[' + sourceName + '] questao invalida: objeto ausente'];
  }

  ['id', 'subject', 'topic', 'question', 'explanation'].forEach(
    function (field) {
      if (!isNonEmptyString(question[field])) {
        errors.push('[' + label + '] campo obrigatorio ausente: ' + field);
      }
    },
  );

  if (question.subject !== sourceName) {
    errors.push(
      '[' + label + '] subject deve corresponder a fonte ' + sourceName,
    );
  }

  if (!Array.isArray(question.options) || question.options.length !== 4) {
    errors.push(
      '[' + label + '] options deve ter exatamente quatro alternativas',
    );
  } else {
    const normalizedOptions = question.options.map(normalizeOption);
    if (
      normalizedOptions.some(function (option) {
        return !option;
      })
    ) {
      errors.push('[' + label + '] options nao pode conter alternativa vazia');
    }
    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      errors.push('[' + label + '] options contem alternativas duplicadas');
    }
  }

  if (
    !Number.isInteger(question.correctIndex) ||
    !Array.isArray(question.options) ||
    question.correctIndex < 0 ||
    question.correctIndex >= question.options.length
  ) {
    errors.push(
      '[' + label + '] correctIndex deve apontar para uma alternativa valida',
    );
  }

  if (question.schemaVersion === undefined) return errors;

  if (question.schemaVersion !== 'content-v1') {
    errors.push(
      '[' + label + '] schemaVersion nao suportada: ' + question.schemaVersion,
    );
    return errors;
  }

  ['contentSetId', 'skill', 'reviewStatus'].forEach(function (field) {
    if (!isNonEmptyString(question[field])) {
      errors.push('[' + label + '] content-v1 exige ' + field);
    }
  });

  if (
    isNonEmptyString(question.reviewStatus) &&
    !REVIEW_STATUSES.has(question.reviewStatus)
  ) {
    errors.push('[' + label + '] reviewStatus invalido');
  }

  if (!Number.isInteger(question.version) || question.version < 1) {
    errors.push('[' + label + '] content-v1 exige version inteiro positivo');
  }

  if (!question.sourceRef || typeof question.sourceRef !== 'object') {
    errors.push('[' + label + '] content-v1 exige sourceRef');
  } else {
    ['referenceId', 'section'].forEach(function (field) {
      if (!isNonEmptyString(question.sourceRef[field])) {
        errors.push('[' + label + '] sourceRef exige ' + field);
      }
    });
    if (
      !isNonEmptyString(question.sourceRef.topic) &&
      !isNonEmptyString(question.sourceRef.page)
    ) {
      errors.push('[' + label + '] sourceRef exige topic (ou page legado)');
    }
  }

  if (
    !question.wrongExplanations ||
    typeof question.wrongExplanations !== 'object'
  ) {
    errors.push('[' + label + '] content-v1 exige wrongExplanations');
  } else if (Array.isArray(question.options)) {
    question.options.forEach(function (_, index) {
      if (
        index !== question.correctIndex &&
        !isNonEmptyString(question.wrongExplanations[index])
      ) {
        errors.push(
          '[' +
            label +
            '] wrongExplanations exige explicacao para indice ' +
            index,
        );
      }
    });
  }

  return errors;
}

function validateContentSources(sources) {
  const errors = [];
  const ids = new Set();

  Object.keys(sources).forEach(function (sourceName) {
    const source = sources[sourceName];
    if (!source || !Array.isArray(source.questions)) {
      errors.push(
        '[' + sourceName + '] fonte deve possuir questions como array',
      );
      return;
    }

    source.questions.forEach(function (question) {
      errors.push.apply(errors, validateQuestion(question, sourceName));
      if (!isNonEmptyString(question && question.id)) return;
      if (ids.has(question.id)) {
        errors.push('[' + question.id + '] id duplicado entre fontes');
      }
      ids.add(question.id);
    });
  });

  return errors;
}

function countQuestionsByTopic(sources, contentSetId) {
  const counts = new Map();

  Object.values(sources).forEach(function (source) {
    if (!source || !Array.isArray(source.questions)) return;
    source.questions.forEach(function (question) {
      if (question.contentSetId !== contentSetId) return;
      const key = question.subject + ':' + question.topic;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });

  return counts;
}

function coverageLabel(contentSetId, subject, topic) {
  return '[coverage:' + contentSetId + ':' + subject + ':' + topic + ']';
}

function validateCoverageManifest(sources, manifest, contentSets) {
  const errors = [];
  const catalogById = new Map(
    contentSets.map(function (contentSet) {
      return [contentSet.contentSetId, contentSet];
    }),
  );

  if (!manifest || manifest.schemaVersion !== 'coverage-v1') {
    return ['[coverage] schemaVersion deve ser coverage-v1'];
  }
  if (!manifest.contentSets || typeof manifest.contentSets !== 'object') {
    return ['[coverage] contentSets deve ser um objeto'];
  }

  const declaredContentSets = new Set(Object.keys(manifest.contentSets));
  const contentV1SetIds = new Set();
  Object.values(sources).forEach(function (source) {
    if (!source || !Array.isArray(source.questions)) return;
    source.questions.forEach(function (question) {
      if (question.schemaVersion === 'content-v1') {
        contentV1SetIds.add(question.contentSetId);
      }
    });
  });

  contentV1SetIds.forEach(function (contentSetId) {
    const catalog = catalogById.get(contentSetId);
    if (
      catalog &&
      catalog.status === 'published' &&
      !declaredContentSets.has(contentSetId)
    ) {
      errors.push(
        '[coverage:' +
          contentSetId +
          '] acervo published exige manifesto de cobertura',
      );
    }
  });

  Object.entries(manifest.contentSets).forEach(function ([
    contentSetId,
    entry,
  ]) {
    const catalog = catalogById.get(contentSetId);
    if (!catalog) {
      errors.push('[coverage:' + contentSetId + '] acervo ausente no catalogo');
      return;
    }
    if (!entry || !entry.subjects || typeof entry.subjects !== 'object') {
      errors.push(
        '[coverage:' + contentSetId + '] subjects deve ser um objeto',
      );
      return;
    }

    const expectedByTopic = new Map();
    Object.entries(entry.subjects).forEach(function ([subject, topics]) {
      if (!topics || typeof topics !== 'object') {
        errors.push(
          '[coverage:' +
            contentSetId +
            ':' +
            subject +
            '] temas devem ser um objeto',
        );
        return;
      }
      Object.entries(topics).forEach(function ([topic, expected]) {
        const label = coverageLabel(contentSetId, subject, topic);
        if (!Number.isInteger(expected) || expected < 1) {
          errors.push(label + ' esperado deve ser inteiro positivo');
          return;
        }
        expectedByTopic.set(subject + ':' + topic, expected);
      });
    });

    const actualByTopic = countQuestionsByTopic(sources, contentSetId);
    actualByTopic.forEach(function (actual, key) {
      if (expectedByTopic.has(key)) return;
      const separator = key.indexOf(':');
      const subject = key.slice(0, separator);
      const topic = key.slice(separator + 1);
      errors.push(
        coverageLabel(contentSetId, subject, topic) +
          ' atual=' +
          actual +
          ' esperado=nao-declarado',
      );
    });

    expectedByTopic.forEach(function (expected, key) {
      const actual = actualByTopic.get(key) || 0;
      const separator = key.indexOf(':');
      const subject = key.slice(0, separator);
      const topic = key.slice(separator + 1);
      const mustBeComplete = catalog.status === 'published';
      if (actual > expected || (mustBeComplete && actual !== expected)) {
        errors.push(
          coverageLabel(contentSetId, subject, topic) +
            ' atual=' +
            actual +
            ' esperado=' +
            expected +
            ' status=' +
            catalog.status,
        );
      }
    });
  });

  return errors;
}

function loadContentSources(rootDir) {
  const context = vm.createContext({ window: {} });
  const dataDirectory = path.join(rootDir, 'js', 'data', 'subjects');

  SUBJECT_FILES.forEach(function (subject) {
    const sourcePath = path.join(dataDirectory, subject + '.js');
    vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, {
      filename: sourcePath,
    });
  });

  return context.window.QuestionsDataSources || {};
}

function loadContentCatalog(rootDir) {
  const context = vm.createContext({});
  const catalogPath = path.join(rootDir, 'js', 'data', 'content-catalog.js');
  const source = fs.readFileSync(catalogPath, 'utf8');
  vm.runInContext(
    source + '\nthis.__contentSets = ContentCatalog.getAll();',
    context,
    { filename: catalogPath },
  );
  return context.__contentSets;
}

function loadCoverageManifest(rootDir) {
  const manifestPath = path.join(rootDir, COVERAGE_MANIFEST_PATH);
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function validateRepositoryContent(rootDir) {
  const sources = loadContentSources(rootDir);
  return validateContentSources(sources).concat(
    validateCoverageManifest(
      sources,
      loadCoverageManifest(rootDir),
      loadContentCatalog(rootDir),
    ),
  );
}

if (require.main === module) {
  const errors = validateRepositoryContent(path.join(__dirname, '..'));
  if (errors.length) {
    process.stderr.write(errors.join('\n') + '\n');
    process.exitCode = 1;
  } else {
    process.stdout.write('content-validation: ok\n');
  }
}

module.exports = {
  loadContentCatalog,
  loadContentSources,
  loadCoverageManifest,
  validateContentSources,
  validateCoverageManifest,
  validateQuestion,
  validateRepositoryContent,
};
