const HomeView = (function () {
  function render(el) {
    const topics = QuestionsDB.getTopics();
    const total  = QuestionsDB.getAll().length;

    el.innerHTML = `
      <div class="home-hero card">
        <h2>🎓 Quiz Etapa — 3º Ano</h2>
        <p>Escolha o tema, responda 25 perguntas e veja sua nota!</p>

        <p class="topic-section-title">Escolha o tema:</p>
        <div class="topic-grid" id="topic-grid">
          <div class="topic-card selected" data-topic="all">
            <div class="topic-icon">🎯</div>
            <div class="topic-name">Todos os Temas</div>
            <div class="topic-count">${total} questões</div>
          </div>
          ${topics.map(t => {
            const m = QuestionsDB.getTopicInfo(t);
            return `
              <div class="topic-card" data-topic="${t}">
                <div class="topic-icon">${m.icon}</div>
                <div class="topic-name">${m.name}</div>
                <div class="topic-count">${m.count} questões</div>
              </div>`;
          }).join('')}
        </div>

        <button class="btn btn-primary btn-lg w-full" id="start-btn">
          ▶️ Começar o Quiz!
        </button>
      </div>
    `;

    let selected = 'all';

    el.querySelectorAll('.topic-card').forEach(card => {
      card.addEventListener('click', () => {
        el.querySelectorAll('.topic-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selected = card.dataset.topic;
      });
    });

    el.querySelector('#start-btn').addEventListener('click', () => {
      App.startQuiz(selected);
    });
  }

  return { render };
})();
