/* exported ContentCatalog */
const ContentCatalog = (function () {
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
      grade: '3-ano',
      displayName: '1o trimestre de 2026',
      isCurrent: true,
    },
    {
      schemaVersion: 'content-v1',
      contentSetId: '2026-t2-v1',
      academicYear: 2026,
      term: 't2',
      version: 1,
      status: 'draft',
      grade: '3-ano',
      displayName: '2o trimestre de 2026',
      isCurrent: true,
    },
  ];

  function getPublished() {
    return contentSets.filter(function (contentSet) {
      return contentSet.status === 'published';
    });
  }

  function getById(contentSetId) {
    return contentSets.find(function (contentSet) {
      return contentSet.contentSetId === contentSetId;
    });
  }

  function getDefault() {
    return (
      getPublished().find(function (contentSet) {
        return contentSet.isCurrent;
      }) || getPublished()[0]
    );
  }

  return {
    LEGACY_CONTENT_SET_ID,
    getAll: function () {
      return contentSets.slice();
    },
    getPublished,
    getById,
    getDefault,
  };
})();
