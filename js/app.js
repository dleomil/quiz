const App = (function () {
  const SESSIONS_PER_QUIZ = 30;
  const QUIZ_LOCK_MESSAGE = 'Finalize o quiz atual para voltar ou trocar de matéria.';

  const views = {
    home: HomeView, subject: SubjectView,
    quiz: QuizView, results: ResultsView, history: HistoryView
  };

  function quizInProgress() { return Store.get().screen === 'quiz'; }

  function navigate(screen, opts) {
    opts = opts || {};
    if (!views[screen]) { console.warn('[App] Tela inválida:', screen); return; }
    if (!opts.force && quizInProgress() && screen !== 'quiz' && screen !== 'home') {
      showToast(QUIZ_LOCK_MESSAGE, 'warning'); return;
    }
    if (typeof QuizView !== 'undefined' && typeof QuizView.clearTimers === 'function') {
      QuizView.clearTimers();
    }
    Store.set({ screen: screen });
    var el = document.getElementById('main-content');
    el.innerHTML = '';
    views[screen].render(el);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateHeader(screen);
  }

  function updateHeader(screen) {
    document.querySelectorAll('.nav-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.screen === screen);
    });
  }

  function selectSubject(subject) { Store.set({ selectedSubject: subject }); navigate('subject'); }

  function startQuiz(topic, subject) {
    var qs = QuestionsDB.getRandom(SESSIONS_PER_QUIZ, topic, subject);
    if (qs.length === 0) { showToast('Nenhuma pergunta encontrada para este tema.', 'warning'); return; }
    Store.set({ selectedTopic: topic, questions: qs, index: 0, answers: [], sessionStart: Date.now(), quizStarted: false });
    navigate('quiz', { force: true });
  }

  function beginQuiz() { Store.set({ quizStarted: true }); navigate('quiz', { force: true }); }

  function finishQuiz() {
    var s       = Store.get();
    var correct = s.answers.filter(function(a) { return a.isCorrect; }).length;
    var total   = s.questions.length;
    var pct     = Math.round((correct / total) * 100);
    var now     = new Date();
    Store.addSession({
      date:          now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
                     now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      subject: s.selectedSubject, topicId: s.selectedTopic,
      topic: resolveTopicLabel(s), correct: correct, total: total, pct: pct,
      durationSec: Math.round((Date.now() - s.sessionStart) / 1000),
      timedOutCount: s.answers.filter(function(a) { return a.isTimeout; }).length
    });
    navigate('results', { force: true });
  }

  function restart() {
    Store.set({ selectedTopic: 'all', questions: [], index: 0, answers: [], quizStarted: false, sessionStart: null });
    navigate('home', { force: true });
  }

  function init() {
    document.getElementById('logo-home').addEventListener('click', function() { navigate('home', { force: true }); });
    document.getElementById('nav-home').addEventListener('click', function() { navigate('home', { force: true }); });
    document.getElementById('nav-history').addEventListener('click', function() { navigate('history'); });
    document.getElementById('btn-restart').addEventListener('click', restart);
    // Theme toggle — persiste em localStorage
    (function() {
      var saved = localStorage.getItem('quiz_theme');
      if (saved) document.documentElement.setAttribute('data-theme', saved);
      if (typeof Chart !== 'undefined' && Chart.defaults) {
        Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1E293B';
      }
      document.getElementById('btn-theme').addEventListener('click', function() {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('quiz_theme', next);
        document.getElementById('btn-theme').textContent = next === 'dark' ? '☀️' : '🌙';
        if (typeof Chart !== 'undefined' && Chart.defaults) {
          Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1E293B';
        }
      });
      if (saved === 'dark') document.getElementById('btn-theme').textContent = '☀️';
    })();
    navigate('home');
  }

  return { navigate: navigate, selectSubject: selectSubject, startQuiz: startQuiz, beginQuiz: beginQuiz, finishQuiz: finishQuiz, restart: restart, init: init };
})();

document.addEventListener('DOMContentLoaded', App.init);
