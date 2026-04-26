const SubjectView = (function () {
  function render(el) {
    const s = Store.get();
    const subject = s.selectedSubject;
    const subjectInfo = QuestionsDB.getSubjectInfo(subject);
    const topics = QuestionsDB.getTopicsBySubject(subject);

    el.innerHTML = `
      <div class="card">
        <div class="subject-header">
          <button class="btn-back" id="btn-back">← Voltar</button>
          <h2>${subjectInfo.icon} ${subjectInfo.name}</h2>
        </div>

        <p class="topic-section-title">Escolha o assunto:</p>
        <div class="topic-grid" id="topic-grid">
          <div class="topic-card" data-topic="all">
            <div class="topic-icon">🎯</div>
            <div class="topic-name">Todos os Assuntos</div>
            <div class="topic-count">${subjectInfo.count} questões</div>
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
      </div>
    `;

    el.querySelector('#btn-back').addEventListener('click', () => App.navigate('home'));

    el.querySelectorAll('.topic-card').forEach(card => {
      card.addEventListener('click', () => {
        App.startQuiz(card.dataset.topic, subject);
      });
    });
  }

  return { render };
})();
