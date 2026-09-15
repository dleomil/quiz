/* exported ContentCatalog */
const ContentCatalog = (function () {
  const CURRENT_ACADEMIC_YEAR = 2026;
  const LEGACY_CONTENT_SET_ID = 'legacy-unclassified';
  const contentSets = [
    {
      schemaVersion: 'content-v1',
      contentSetId: LEGACY_CONTENT_SET_ID,
      academicYear: null,
      term: 'legacy',
      version: 0,
      status: 'retired',
      grade: '3-ano',
      displayName: 'Acervo anterior',
      isCurrent: false,
    },
    {
      schemaVersion: 'content-v1',
      contentSetId: '2026-t1-v1',
      academicYear: 2026,
      term: 't1',
      version: 1,
      status: 'published',
      answerDistributionPolicy: 'grandfathered',
      grade: '3-ano',
      displayName: '1º trimestre de 2026',
      isCurrent: false,
    },
    {
      schemaVersion: 'content-v1',
      contentSetId: '2026-t2-v1',
      academicYear: 2026,
      term: 't2',
      version: 1,
      status: 'retired',
      answerDistributionPolicy: 'grandfathered',
      grade: '3-ano',
      displayName: '2º trimestre de 2026 (versão anterior)',
      isCurrent: false,
    },
    {
      schemaVersion: 'content-v1',
      contentSetId: '2026-t2-v2',
      academicYear: 2026,
      term: 't2',
      version: 2,
      status: 'published',
      answerDistributionPolicy: 'balanced-five-v1',
      grade: '3-ano',
      displayName: '2º trimestre de 2026',
      isCurrent: true,
    },
  ];

  function getPublished() {
    return contentSets.filter(function (contentSet) {
      return contentSet.status === 'published';
    });
  }

  function getQuizSelectable() {
    return contentSets.filter(function (contentSet) {
      return (
        contentSet.status === 'published' &&
        contentSet.academicYear === CURRENT_ACADEMIC_YEAR
      );
    });
  }

  function getById(contentSetId) {
    return contentSets.find(function (contentSet) {
      return contentSet.contentSetId === contentSetId;
    });
  }

  function getDefault() {
    return (
      getQuizSelectable().find(function (contentSet) {
        return contentSet.isCurrent;
      }) || getQuizSelectable()[0]
    );
  }

  return {
    CURRENT_ACADEMIC_YEAR,
    LEGACY_CONTENT_SET_ID,
    getAll: function () {
      return contentSets.slice();
    },
    getPublished,
    getQuizSelectable,
    getById,
    getDefault,
  };
})();
