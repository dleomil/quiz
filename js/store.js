const Store = (function () {
  const KEY = 'quiz_etapa_v1';
  const MAX_HISTORY = 60;

  const state = {
    screen: 'home', selectedSubject: 'portugues', selectedTopic: 'all',
    questions: [], index: 0, answers: [],
    quizStarted: false, sessionStart: null, history: []
  };

  function loadHistory() {
    try { state.history = JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (_) { state.history = []; }
  }

  function saveHistory() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state.history));
    } catch (e) {
      if (e && e.name === 'QuotaExceededError') {
        state.history = state.history.slice(0, Math.floor(MAX_HISTORY / 2));
        try { localStorage.setItem(KEY, JSON.stringify(state.history)); } catch (_) {}
      }
    }
  }

  function addSession(session) {
    state.history.unshift(session);
    if (state.history.length > MAX_HISTORY) state.history.length = MAX_HISTORY;
    saveHistory();
  }

  function clearHistory() { state.history = []; saveHistory(); }

  loadHistory();

  return {
    get:  function() { return Object.assign({}, state, { history: state.history.slice() }); },
    _raw: function() { return state; },
    set:  function(patch) { Object.assign(state, patch); },
    addSession: addSession,
    clearHistory: clearHistory
  };
})();
