/* exported HomeView */
/* global App, Store, QuestionsDB */
const HomeView = (function () {
  function render(el) {
    const subjects = QuestionsDB.getSubjects();
    const contentSets = QuestionsDB.getContentSets();
    const selectedContentSet = Store.get().selectedContentSet;
    const contentSetSelector =
      contentSets.length > 1
        ? `<label class="content-set-picker">O que você quer estudar?
            <select id="content-set-select" aria-label="Período de estudo">
              ${contentSets
                .map(
                  (contentSet) =>
                    `<option value="${contentSet.contentSetId}" ${contentSet.contentSetId === selectedContentSet ? 'selected' : ''}>${contentSet.displayName}</option>`,
                )
                .join('')}
            </select>
          </label>`
        : '';

    el.innerHTML = `
      <div class="home-hero card">
        <h2>🎓 Quiz Etapa — 3º Ano</h2>
        <p>Escolha a matéria e comece seu quiz!</p>
        ${contentSetSelector}

        <p class="topic-section-title">Escolha a matéria:</p>
        <div class="subject-grid" id="subject-grid">
          ${subjects
            .filter(
              (subject) =>
                QuestionsDB.getSubjectInfo(subject, selectedContentSet).count,
            )
            .map((s) => {
              const m = QuestionsDB.getSubjectInfo(s, selectedContentSet);
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
    var contentSetSelect = el.querySelector('#content-set-select');
    if (contentSetSelect) {
      contentSetSelect.addEventListener('change', () =>
        App.selectContentSet(contentSetSelect.value),
      );
    }
  }

  return { render };
})();
