/* exported HomeView */
/* global App, Store, QuestionsDB */
const HomeView = (function () {
  function render(el) {
    const subjects = QuestionsDB.getSubjects();
    const contentSets = QuestionsDB.getContentSets();
    const selectedContentSet = Store.get().selectedContentSet;
    const contentSetSelector =
      contentSets.length > 1
        ? `<section class="content-set-picker" aria-labelledby="content-set-title">
            <p class="content-set-title" id="content-set-title">📅 Qual trimestre você quer estudar?</p>
            <div class="content-set-options" role="group" aria-label="Escolha o trimestre">
              ${contentSets
                .map((contentSet) => {
                  const isSelected =
                    contentSet.contentSetId === selectedContentSet;
                  return `<button
                    type="button"
                    class="content-set-option${isSelected ? ' selected' : ''}"
                    data-content-set="${contentSet.contentSetId}"
                    aria-pressed="${isSelected}"
                  >
                    <span class="content-set-option-name">${contentSet.displayName}</span>
                    <span class="content-set-option-state">${isSelected ? '✓ Estudando agora' : 'Escolher este trimestre'}</span>
                  </button>`;
                })
                .join('')}
            </div>
          </section>`
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
    el.querySelectorAll('.content-set-option').forEach((option) => {
      option.addEventListener('click', () => {
        if (option.getAttribute('aria-pressed') === 'true') return;
        App.selectContentSet(option.dataset.contentSet);
      });
    });
  }

  return { render };
})();
