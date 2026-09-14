/* exported Store */
/* global ContentCatalog */
const Store = (function () {
  const KEY = 'quiz_etapa_v1';
  const MAX_HISTORY = 60;

  const state = {
    screen: 'home',
    selectedSubject: 'portugues',
    selectedTopic: 'all',
    selectedContentSet: ContentCatalog.getDefault().contentSetId,
    questions: [],
    index: 0,
    answers: [],
    secsPerQuestion: 30,
    quizStarted: false,
    sessionStart: null,
    history: [],
  };

  function loadHistory() {
    try {
      var stored = JSON.parse(localStorage.getItem(KEY));
      state.history = Array.isArray(stored) ? stored : [];
    } catch {
      state.history = [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state.history));
    } catch (error) {
      if (error && error.name === 'QuotaExceededError') {
        state.history = state.history.slice(0, Math.floor(MAX_HISTORY / 2));
        try {
          localStorage.setItem(KEY, JSON.stringify(state.history));
        } catch {
          /* ignore retry failure */
        }
      }
    }
  }

  function addSession(session) {
    state.history.unshift(session);
    if (state.history.length > MAX_HISTORY) state.history.length = MAX_HISTORY;
    saveHistory();
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function boundedString(value, maximum, required) {
    if (typeof value !== 'string' || value.length > maximum) return null;
    if (required && !value.trim()) return null;
    return value;
  }

  function nonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
  }

  function isIsoDateTime(value) {
    var match =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(
        value,
      );
    if (!match || Number.isNaN(Date.parse(value))) return false;

    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    var hour = Number(match[4]);
    var minute = Number(match[5]);
    var second = Number(match[6]);
    var offsetHour = match[8] === undefined ? 0 : Number(match[8]);
    var offsetMinute = match[9] === undefined ? 0 : Number(match[9]);
    var leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    var daysInMonth = [
      31,
      leapYear ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];

    return (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= daysInMonth[month - 1] &&
      hour <= 23 &&
      minute <= 59 &&
      second <= 59 &&
      offsetHour <= 23 &&
      offsetMinute <= 59
    );
  }

  function normalizeAnswer(answer, questionId) {
    if (!isObject(answer)) return null;
    if (boundedString(answer.questionId, 160, true) !== questionId) return null;
    if (typeof answer.isCorrect !== 'boolean') return null;
    if (typeof answer.isTimeout !== 'boolean') return null;
    if (
      answer.selectedIndex !== null &&
      (!Number.isInteger(answer.selectedIndex) ||
        answer.selectedIndex < 0 ||
        answer.selectedIndex > 3)
    ) {
      return null;
    }
    if (!answer.isTimeout && answer.selectedIndex === null) return null;
    if (answer.isTimeout && answer.selectedIndex !== null) return null;
    if (answer.isTimeout && answer.isCorrect) return null;
    return {
      questionId: answer.questionId,
      selectedIndex: answer.selectedIndex,
      isCorrect: answer.isCorrect,
      isTimeout: answer.isTimeout,
    };
  }

  function normalizeCurrentSession(session) {
    var sessionId = boundedString(session.sessionId, 160, true);
    var startedAt = boundedString(session.startedAt, 64, true);
    var finishedAt = boundedString(session.finishedAt, 64, true);
    var contentSetId = boundedString(session.contentSetId, 160, true);
    var subject = boundedString(session.subject, 160, true);
    var topicId = boundedString(session.topicId, 160, true);
    if (
      !sessionId ||
      !startedAt ||
      !finishedAt ||
      !contentSetId ||
      !subject ||
      !topicId ||
      !isIsoDateTime(startedAt) ||
      !isIsoDateTime(finishedAt) ||
      Date.parse(startedAt) > Date.parse(finishedAt) ||
      !nonNegativeInteger(session.contentVersion) ||
      !nonNegativeInteger(session.durationSec) ||
      !Array.isArray(session.questionIds) ||
      session.questionIds.length === 0 ||
      session.questionIds.length > 500 ||
      !Array.isArray(session.answers) ||
      session.answers.length !== session.questionIds.length ||
      !isObject(session.score)
    ) {
      return null;
    }

    var questionIds = session.questionIds.map(function (questionId) {
      return boundedString(questionId, 160, true);
    });
    if (
      questionIds.some(function (questionId) {
        return !questionId;
      }) ||
      new Set(questionIds).size !== questionIds.length
    ) {
      return null;
    }

    var answers = session.answers.map(function (answer, index) {
      return normalizeAnswer(answer, questionIds[index]);
    });
    if (
      answers.some(function (answer) {
        return !answer;
      })
    ) {
      return null;
    }

    var correct = answers.filter(function (answer) {
      return answer.isCorrect;
    }).length;
    var total = answers.length;
    var pct = Math.round((correct / total) * 100);
    if (
      session.score.correct !== correct ||
      session.score.total !== total ||
      session.score.pct !== pct
    ) {
      return null;
    }

    var date = boundedString(session.date, 160, false);
    var topic = boundedString(session.topic, 320, false);
    return {
      schemaVersion: 'session-v2',
      sessionId: sessionId,
      startedAt: startedAt,
      finishedAt: finishedAt,
      contentSetId: contentSetId,
      contentVersion: session.contentVersion,
      questionIds: questionIds,
      answers: answers,
      score: { correct: correct, total: total, pct: pct },
      date: date === null ? finishedAt : date,
      subject: subject,
      topicId: topicId,
      topic: topic === null || !topic ? topicId : topic,
      correct: correct,
      total: total,
      pct: pct,
      durationSec: session.durationSec,
      timedOutCount: answers.filter(function (answer) {
        return answer.isTimeout;
      }).length,
    };
  }

  function normalizeLegacySession(session) {
    var date = boundedString(session.date, 160, true);
    var subject = boundedString(session.subject, 160, false);
    var topicId = boundedString(session.topicId, 160, false);
    var topic = boundedString(session.topic, 320, false);
    if (
      !date ||
      !nonNegativeInteger(session.correct) ||
      !Number.isInteger(session.total) ||
      session.total < 1 ||
      session.correct > session.total ||
      !Number.isInteger(session.pct) ||
      session.pct < 0 ||
      session.pct > 100 ||
      session.pct !== Math.round((session.correct / session.total) * 100) ||
      (session.durationSec !== undefined &&
        !nonNegativeInteger(session.durationSec)) ||
      (session.timedOutCount !== undefined &&
        !nonNegativeInteger(session.timedOutCount))
    ) {
      return null;
    }
    return {
      schemaVersion: 'legacy-session-v1',
      contentSetId: ContentCatalog.LEGACY_CONTENT_SET_ID,
      contentVersion: 0,
      date: date,
      subject: subject || '',
      topicId: topicId || '',
      topic: topic || 'Tema não informado',
      correct: session.correct,
      total: session.total,
      pct: session.pct,
      durationSec: session.durationSec === undefined ? 0 : session.durationSec,
      timedOutCount:
        session.timedOutCount === undefined ? 0 : session.timedOutCount,
    };
  }

  function normalizeHistorySession(session) {
    if (!isObject(session)) return null;
    if (session.schemaVersion === 'session-v2') {
      return normalizeCurrentSession(session);
    }
    if (
      session.schemaVersion === undefined ||
      session.schemaVersion === 'legacy-session-v1'
    ) {
      return normalizeLegacySession(session);
    }
    return null;
  }

  function clearHistory() {
    state.history = [];
    saveHistory();
  }

  loadHistory();

  return {
    get: function () {
      return Object.assign({}, state, {
        history: state.history
          .slice(0, MAX_HISTORY)
          .map(normalizeHistorySession)
          .filter(function (session) {
            return session !== null;
          }),
      });
    },
    _raw: function () {
      return state;
    },
    set: function (patch) {
      Object.assign(state, patch);
    },
    addSession: addSession,
    clearHistory: clearHistory,
  };
})();
