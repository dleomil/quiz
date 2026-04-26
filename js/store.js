const Store = (function () {
  const KEY = 'quiz_etapa_v1';

  const state = {
    screen: 'home',
    selectedSubject: 'portugues',
    selectedTopic: 'all',
    questions: [],
    index: 0,
    answers: [],      // [{id, selected, correct, isCorrect}]
    quizStarted: false,
    sessionStart: null,
    history: []
  };

  function loadHistory() {
    try { state.history = JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (_) { state.history = []; }
  }

  function saveHistory() {
    try { localStorage.setItem(KEY, JSON.stringify(state.history)); }
    catch (_) {}
  }

  function addSession(session) {
    state.history.unshift(session);
    if (state.history.length > 60) state.history.length = 60;
    saveHistory();
  }

  function clearHistory() {
    state.history = [];
    saveHistory();
  }

  loadHistory();

  return {
    get: () => state,
    set: (patch) => Object.assign(state, patch),
    addSession,
    clearHistory
  };
})();
