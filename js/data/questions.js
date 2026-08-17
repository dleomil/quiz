/* exported QuestionsDB */
/* global ContentCatalog */
const QuestionsDB = (function () {
  const sourceOrder = [
    'portugues',
    'matematica',
    'ciencias',
    'geografia',
    'historia',
    'ingles',
  ];

  const sources = window.QuestionsDataSources || {};
  const loadedSubjects = sourceOrder.filter((subject) => sources[subject]);

  const questions = [];
  const SUBJECT_META = {};
  const TOPIC_META = {};
  const topicCounts = {};
  const subjectCounts = {};
  const topicsBySubject = {};

  loadedSubjects.forEach((subject) => {
    const source = sources[subject];
    const sourceQuestions = Array.isArray(source.questions)
      ? source.questions
      : [];
    const sourceTopics = source.topicMeta || {};

    SUBJECT_META[subject] = source.subjectMeta || {
      name: subject,
      icon: '📚',
      available: true,
    };

    topicsBySubject[subject] = [];

    Object.keys(sourceTopics).forEach((topic) => {
      TOPIC_META[topic] = sourceTopics[topic];
      topicCounts[topic] = 0;
      topicsBySubject[subject].push(topic);
    });

    const normalizedQuestions = sourceQuestions.map((question) => ({
      ...question,
      schemaVersion: question.schemaVersion || 'legacy-content-v0',
      contentSetId: question.contentSetId || '2026-t1-v1',
    }));

    subjectCounts[subject] = normalizedQuestions.length;
    questions.push(...normalizedQuestions);

    normalizedQuestions.forEach((question) => {
      topicCounts[question.topic] = (topicCounts[question.topic] || 0) + 1;

      if (!TOPIC_META[question.topic]) {
        TOPIC_META[question.topic] = {
          name: question.topicName || question.topic,
          icon: '📝',
        };
      }

      if (!topicsBySubject[subject].includes(question.topic)) {
        topicsBySubject[subject].push(question.topic);
      }
    });
  });

  function shuffle(arr) {
    const a = [...arr];
    for (let index = a.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [a[index], a[randomIndex]] = [a[randomIndex], a[index]];
    }
    return a;
  }

  function countQuestions(subject, topic, contentSetId) {
    return questions.filter(
      (question) =>
        (!subject || question.subject === subject) &&
        (!topic || question.topic === topic) &&
        (!contentSetId || question.contentSetId === contentSetId),
    ).length;
  }

  return {
    getAll: () => questions,
    getByTopic: (topic, contentSetId) =>
      questions.filter(
        (question) =>
          (topic === 'all' || question.topic === topic) &&
          (!contentSetId || question.contentSetId === contentSetId),
      ),
    getTopics: () => Object.keys(TOPIC_META),
    getTopicInfo: (topic, contentSetId) => ({
      ...TOPIC_META[topic],
      count: contentSetId
        ? countQuestions(null, topic, contentSetId)
        : topicCounts[topic] || 0,
    }),
    getSubjects: () => Object.keys(SUBJECT_META),
    getSubjectInfo: (subject, contentSetId) => ({
      ...SUBJECT_META[subject],
      count: contentSetId
        ? countQuestions(subject, null, contentSetId)
        : subjectCounts[subject] || 0,
    }),
    getTopicsBySubject: (subject, contentSetId) =>
      (topicsBySubject[subject] || []).filter(
        (topic) =>
          !contentSetId || countQuestions(subject, topic, contentSetId),
      ),
    getAvailableCount: (topic, subject, contentSetId) =>
      countQuestions(
        subject && subject !== 'all' ? subject : null,
        topic && topic !== 'all' ? topic : null,
        contentSetId,
      ),
    getContentSets: () => ContentCatalog.getPublished(),
    getContentSet: (contentSetId) => ContentCatalog.getById(contentSetId),
    getDefaultContentSet: () => ContentCatalog.getDefault(),
    getRandom: (count, topic, subject, contentSetId) => {
      let pool = questions;
      if (subject && subject !== 'all')
        pool = pool.filter((question) => question.subject === subject);
      if (topic && topic !== 'all')
        pool = pool.filter((question) => question.topic === topic);
      if (contentSetId)
        pool = pool.filter(
          (question) => question.contentSetId === contentSetId,
        );
      return shuffle(pool).slice(0, Math.min(count, pool.length));
    },
  };
})();
