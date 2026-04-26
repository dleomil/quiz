const App = (function () {
  const SESSIONS_PER_QUIZ = 30;
  const QUIZ_LOCK_MESSAGE = 'Finalize o quiz atual para voltar ou trocar de materia.';

  const views = {
    home: HomeView, subject: SubjectView,
    quiz: QuizView, results: ResultsView, history: HistoryView
  };

  function quizInProgress() {
    return Store.get().screen === 'quiz';
  }

  function navigate(screen, opts = {}) {
    if (!opts.force && quizInProgress() && screen !== 'quiz' && screen !== 'home') {
      alert(QUIZ_LOCK_MESSAGE);
      return;
    }

    Store.set({ screen });
    const el = document.getElementById('main-content');
    el.innerHTML = '';
    views[screen].render(el);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateHeader(screen);
  }

  function updateHeader(screen) {
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.screen === screen);
    });
  }

  function selectSubject(subject) {
    Store.set({ selectedSubject: subject });
    navigate('subject');
  }

  function startQuiz(topic, subject) {
    const qs = QuestionsDB.getRandom(SESSIONS_PER_QUIZ, topic, subject);
    if (qs.length === 0) { alert('Nenhuma pergunta encontrada para este tema.'); return; }
    Store.set({
      selectedTopic: topic,
      questions: qs,
      index: 0,
      answers: [],
      sessionStart: Date.now(),
      quizStarted: false
    });
    navigate('quiz', { force: true });
  }

  function beginQuiz() {
    Store.set({ quizStarted: true });
    navigate('quiz', { force: true });
  }

  function finishQuiz() {
    const s = Store.get();
    const correct = s.answers.filter(a => a.isCorrect).length;
    const total   = s.questions.length;
    const pct     = Math.round((correct / total) * 100);

    let topicName;
    if (s.selectedTopic === 'all') {
      const subjectInfo = s.selectedSubject
        ? QuestionsDB.getSubjectInfo(s.selectedSubject)
        : { name: 'Todos os Temas' };
      topicName = subjectInfo.name + ' — Todos os Assuntos';
    } else {
      topicName = QuestionsDB.getTopicInfo(s.selectedTopic).name;
    }

    const now  = new Date();
    const date = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    Store.addSession({
      date: `${date} ${time}`,
      subject: s.selectedSubject,
      topicId: s.selectedTopic,
      topic: topicName,
      correct,
      total,
      pct,
      durationSec: Math.round((Date.now() - s.sessionStart) / 1000),
      timedOutCount: s.answers.filter(a => a.isTimeout).length
    });

    navigate('results', { force: true });
  }

  function restart() {
    Store.set({
      selectedTopic: 'all',
      questions: [],
      index: 0,
      answers: [],
      quizStarted: false,
      sessionStart: null
    });
    navigate('home', { force: true });
  }

  function init() {
    document.getElementById('logo-home').addEventListener('click',   () => navigate('home', { force: true }));
    document.getElementById('nav-home').addEventListener('click',    () => navigate('home', { force: true }));
    document.getElementById('nav-history').addEventListener('click', () => navigate('history'));
    document.getElementById('btn-restart').addEventListener('click', restart);

    navigate('home');
  }

  return { navigate, selectSubject, startQuiz, beginQuiz, finishQuiz, restart, init };
})();

document.addEventListener('DOMContentLoaded', App.init);
