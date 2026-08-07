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
      status: 'published',
      grade: '3-ano',
      displayName: 'Acervo anterior',
      isCurrent: false,
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
