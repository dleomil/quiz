const QuizView = (function () {
  const LETTERS = ['A', 'B', 'C', 'D'];

  function render(el) {
    const s = Store.get();
    const q = s.questions[s.index];
    const total   = s.questions.length;
    const correct = s.answers.filter(a => a.isCorrect).length;
    const pct = Math.round((s.index / total) * 100);

    const topicInfo = QuestionsDB.getTopicInfo(q.topic);

    el.innerHTML = `
      <div class="card">
        <div class="quiz-meta">
          <span class="counter">Pergunta ${s.index + 1} de ${total}</span>
          <span class="topic-tag">${topicInfo.icon} ${topicInfo.name}</span>
          <span class="score-live">✅ ${correct} certa${correct !== 1 ? 's' : ''}</span>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>

        ${q.text ? `
          <div class="text-excerpt">
            <div class="text-excerpt-label">📄 Leia o texto:</div>
            ${q.text}
          </div>` : ''}

        <div class="question-text">${s.index + 1}. ${q.question}</div>

        <div class="options" id="options">
          ${q.options.map((opt, i) => `
            <button class="option-btn" data-index="${i}">
              <span class="option-letter">${LETTERS[i]}</span>
              <span>${opt}</span>
            </button>`).join('')}
        </div>

        <div id="feedback"></div>
        <div class="quiz-next" id="next-area"></div>
      </div>
    `;

    el.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(el, q, parseInt(btn.dataset.index)));
    });
  }

  function handleAnswer(el, q, chosen) {
    const isCorrect = chosen === q.correctIndex;

    el.querySelectorAll('.option-btn').forEach(btn => {
      btn.disabled = true;
      const i = parseInt(btn.dataset.index);
      if (i === q.correctIndex) {
        btn.classList.add(isCorrect ? 'correct' : 'reveal');
      } else if (i === chosen && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    const s = Store.get();
    s.answers.push({ id: q.id, selected: chosen, correct: q.correctIndex, isCorrect });

    const fbEl = el.querySelector('#feedback');
    if (isCorrect) {
      fbEl.innerHTML = `
        <div class="feedback ok">
          <div class="feedback-title">✅ Correto! Muito bem!</div>
          <div class="feedback-explain">${q.explanation}</div>
        </div>`;
    } else {
      const wrongMsg = q.wrongExplanations && q.wrongExplanations[chosen]
        ? `<div class="feedback-why-wrong">❌ Você escolheu "${q.options[chosen]}": ${q.wrongExplanations[chosen]}</div>`
        : '';
      fbEl.innerHTML = `
        <div class="feedback fail">
          <div class="feedback-title">❌ Ops! A resposta certa era: ${q.options[q.correctIndex]}</div>
          <div class="feedback-explain">${q.explanation}</div>
          ${wrongMsg}
        </div>`;
    }

    const nextArea = el.querySelector('#next-area');
    const isLast = s.index >= s.questions.length - 1;
    const label  = isLast ? '🏁 Ver Resultado' : 'Próxima ➡️';
    nextArea.innerHTML = `<button class="btn btn-primary" id="next-btn">${label}</button>`;
    nextArea.querySelector('#next-btn').addEventListener('click', () => {
      if (isLast) {
        App.finishQuiz();
      } else {
        Store.set({ index: s.index + 1 });
        App.navigate('quiz');
      }
    });
  }

  return { render };
})();
