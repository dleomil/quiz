const App = (function () {
  const SESSIONS_PER_QUIZ = 30;

  const views = {
    home: HomeView, subject: SubjectView,
    quiz: QuizView, results: ResultsView, history: HistoryView
  };

  function navigate(screen) {
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
      sessionStart: Date.now()
    });
    navigate('quiz');
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
      topic: topicName,
      correct,
      total,
      pct
    });

    navigate('results');
  }

  function restart() {
    const s = Store.get();
    if (s.screen === 'quiz') {
      if (!confirm('Quer mesmo recomeçar? O progresso atual será perdido.')) return;
    }
    navigate('home');
  }

  function init() {
    document.getElementById('nav-home').addEventListener('click',    () => navigate('home'));
    document.getElementById('nav-history').addEventListener('click', () => navigate('history'));
    document.getElementById('btn-restart').addEventListener('click', restart);

    navigate('home');
  }

  return { navigate, selectSubject, startQuiz, finishQuiz, restart, init };
})();

document.addEventListener('DOMContentLoaded', App.init);
