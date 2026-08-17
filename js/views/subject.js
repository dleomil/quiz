/* exported SubjectView */
/* global App, Store, QuestionsDB */
const SubjectView = (function () {
  const DEFAULT_QUESTION_COUNT = 30;

  function questionLabel(count) {
    return count === 1 ? 'questão' : 'questões';
  }

  function quickChoices(minimum, maximum) {
    return [2, 10, 20].filter((count) => count >= minimum && count < maximum);
  }

  function renderQuantityPanel(el, card, topic, subject, available, name) {
    const panel = el.querySelector('#question-count-panel');
    const minimum = Math.min(2, available);
    const suggested = Math.min(DEFAULT_QUESTION_COUNT, available);
    const choices = quickChoices(minimum, available);

    el.querySelectorAll('.topic-card').forEach((topicCard) => {
      const isSelected = topicCard === card;
      topicCard.classList.toggle('selected', isSelected);
      topicCard.setAttribute('aria-pressed', String(isSelected));
    });

    panel.innerHTML = `
      <form class="question-count-form" id="question-count-form" novalidate>
        <div class="question-count-heading">
          <span class="question-count-icon" aria-hidden="true">🎒</span>
          <div>
            <p class="question-count-eyebrow">${name}</p>
            <h3 id="question-count-title">Quantas questões você quer fazer?</h3>
          </div>
        </div>
        <p class="question-count-help" id="question-count-help">
          Escolha um número de ${minimum} até ${available}.
        </p>

        <div class="question-count-picker">
          <button type="button" class="count-step" id="count-dec" aria-label="Diminuir uma questão">−</button>
          <label class="sr-only" for="question-count-input">Quantidade de questões</label>
          <input
            class="question-count-input"
            id="question-count-input"
            type="number"
            inputmode="numeric"
            min="${minimum}"
            max="${available}"
            step="1"
            value="${suggested}"
            aria-describedby="question-count-help question-count-error"
          />
          <button type="button" class="count-step" id="count-inc" aria-label="Aumentar uma questão">+</button>
        </div>

        <div class="question-count-shortcuts" aria-label="Atalhos de quantidade">
          ${choices
            .map(
              (count) =>
                `<button type="button" class="count-shortcut" data-count="${count}" aria-pressed="${count === suggested}">${count}</button>`,
            )
            .join('')}
          <button type="button" class="count-shortcut" data-count="${available}" data-count-choice="all" aria-pressed="${available === suggested}">Todas (${available})</button>
        </div>

        <p class="question-count-error" id="question-count-error" role="status" aria-live="polite"></p>
        <button type="submit" class="btn btn-primary btn-lg question-count-start" id="btn-start-selected-count">
          ▶️ Começar ${suggested} ${questionLabel(suggested)}
        </button>
      </form>
    `;
    panel.hidden = false;

    const input = panel.querySelector('#question-count-input');
    const decrease = panel.querySelector('#count-dec');
    const increase = panel.querySelector('#count-inc');
    const start = panel.querySelector('#btn-start-selected-count');
    const error = panel.querySelector('#question-count-error');
    const shortcuts = [...panel.querySelectorAll('.count-shortcut')];

    function currentValue() {
      return Number(input.value);
    }

    function isValid(value) {
      return Number.isInteger(value) && value >= minimum && value <= available;
    }

    function updateControls() {
      const value = currentValue();
      const valid = isValid(value);
      input.setAttribute('aria-invalid', String(!valid));
      start.disabled = !valid;
      decrease.disabled = value <= minimum;
      increase.disabled = value >= available;
      error.textContent = valid
        ? ''
        : `Digite um número inteiro de ${minimum} até ${available}.`;
      start.textContent = valid
        ? `▶️ Começar ${value} ${questionLabel(value)}`
        : '▶️ Escolha uma quantidade válida';
      shortcuts.forEach((shortcut) => {
        shortcut.setAttribute(
          'aria-pressed',
          String(valid && Number(shortcut.dataset.count) === value),
        );
      });
    }

    function setCount(value) {
      input.value = String(Math.min(available, Math.max(minimum, value)));
      updateControls();
    }

    decrease.addEventListener('click', () => setCount(currentValue() - 1));
    increase.addEventListener('click', () => setCount(currentValue() + 1));
    shortcuts.forEach((shortcut) => {
      shortcut.addEventListener('click', () =>
        setCount(Number(shortcut.dataset.count)),
      );
    });
    input.addEventListener('input', updateControls);
    panel
      .querySelector('#question-count-form')
      .addEventListener('submit', (event) => {
        event.preventDefault();
        const value = currentValue();
        if (!isValid(value)) {
          updateControls();
          input.focus();
          return;
        }
        App.startQuiz(topic, subject, value);
      });

    updateControls();
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function render(el) {
    const s = Store.get();
    const subject = s.selectedSubject;
    const subjectInfo = QuestionsDB.getSubjectInfo(
      subject,
      s.selectedContentSet,
    );
    const topics = QuestionsDB.getTopicsBySubject(
      subject,
      s.selectedContentSet,
    );

    el.innerHTML = `
      <div class="card">
        <div class="subject-header">
          <button class="btn-back" id="btn-back">← Voltar</button>
          <h2>${subjectInfo.icon} ${subjectInfo.name}</h2>
        </div>

        <p class="topic-section-title">Escolha o assunto:</p>
        <div class="topic-grid" id="topic-grid">
          <button type="button" class="topic-card" data-topic="all" data-count="${subjectInfo.count}" aria-pressed="false">
            <div class="topic-icon">🎯</div>
            <div class="topic-name">Todos os Assuntos</div>
            <div class="topic-count">${subjectInfo.count} questões</div>
          </button>
          ${topics
            .map((t) => {
              const m = QuestionsDB.getTopicInfo(t, s.selectedContentSet);
              const available = QuestionsDB.getAvailableCount(
                t,
                subject,
                s.selectedContentSet,
              );
              return `
              <button type="button" class="topic-card" data-topic="${t}" data-count="${available}" aria-pressed="false">
                <div class="topic-icon">${m.icon}</div>
                <div class="topic-name">${m.name}</div>
                <div class="topic-count">${available} questões</div>
              </button>`;
            })
            .join('')}
        </div>
        <section class="question-count-panel" id="question-count-panel" tabindex="-1" aria-labelledby="question-count-title" hidden></section>
      </div>
    `;

    el.querySelector('#btn-back').addEventListener('click', () =>
      App.navigate('home'),
    );

    el.querySelectorAll('.topic-card').forEach((card) => {
      card.addEventListener('click', () => {
        renderQuantityPanel(
          el,
          card,
          card.dataset.topic,
          subject,
          Number(card.dataset.count),
          card.querySelector('.topic-name').textContent,
        );
      });
    });
  }

  return { render };
})();
