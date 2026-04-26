const App = (function () {
  const SESSIONS_PER_QUIZ = 25;

  const views = { home: HomeView, quiz: QuizView, results: ResultsView, history: HistoryView };

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

  function startQuiz(topic) {
    const qs = QuestionsDB.getRandom(SESSIONS_PER_QUIZ, topic);
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

    const topicInfo = s.selectedTopic === 'all'
      ? { name: 'Todos os Temas' }
      : QuestionsDB.getTopicInfo(s.selectedTopic);

    const now  = new Date();
    const date = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    Store.addSession({
      date: `${date} ${time}`,
      topic: topicInfo.name,
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
    // Wire header buttons
    document.getElementById('nav-home').addEventListener('click',    () => navigate('home'));
    document.getElementById('nav-history').addEventListener('click', () => navigate('history'));
    document.getElementById('btn-restart').addEventListener('click', restart);

    navigate('home');
  }

  return { navigate, startQuiz, finishQuiz, restart, init };
})();

document.addEventListener('DOMContentLoaded', App.init);
