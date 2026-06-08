/* exported HomeView */
/* global App, QuestionsDB */
const HomeView = (function () {
  function render(el) {
    const subjects = QuestionsDB.getSubjects();

    el.innerHTML = `
      <div class="home-hero card">
        <h2>🎓 Quiz Etapa — 3º Ano</h2>
        <p>Escolha a matéria e comece seu quiz!</p>

        <p class="topic-section-title">Escolha a matéria:</p>
        <div class="subject-grid" id="subject-grid">
          ${subjects
            .map((s) => {
              const m = QuestionsDB.getSubjectInfo(s);
              if (m.available) {
                return `
                <div class="subject-card" data-subject="${s}">
                  <div class="subject-icon">${m.icon}</div>
                  <div class="subject-name">${m.name}</div>
                  <div class="subject-count">${m.count} questões</div>
                </div>`;
              } else {
                return `
                <div class="subject-card disabled">
                  <div class="subject-icon">${m.icon}</div>
                  <div class="subject-name">${m.name}</div>
                  <div class="subject-soon">Em breve</div>
                </div>`;
              }
            })
            .join('')}
        </div>
      </div>
    `;

    el.querySelectorAll('.subject-card:not(.disabled)').forEach((card) => {
      card.addEventListener('click', () =>
        App.selectSubject(card.dataset.subject),
      );
    });
  }

  return { render };
})();
