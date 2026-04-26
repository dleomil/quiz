const QuizView = (function () {
  const LETTERS = ['A', 'B', 'C', 'D'];
  const SECONDS_PER_QUESTION = 30;
  let timerInterval = null;
  let timerTimeout = null;

  function clearTimers() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (timerTimeout) {
      clearTimeout(timerTimeout);
      timerTimeout = null;
    }
  }

  function formatTimeLeft(msLeft) {
    const totalSeconds = Math.max(0, Math.ceil(msLeft / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function paintTimer(el, msLeft) {
    const timerEl = el.querySelector('#question-timer');
    const fillEl = el.querySelector('#timer-fill');
    if (!timerEl || !fillEl) return;

    const pctLeft = Math.max(0, Math.min(100, (msLeft / (SECONDS_PER_QUESTION * 1000)) * 100));
    timerEl.textContent = formatTimeLeft(msLeft);
    fillEl.style.width = `${pctLeft}%`;
    fillEl.classList.toggle('warning', pctLeft <= 35);
    fillEl.classList.toggle('danger', pctLeft <= 15);
  }

  function startTimer(el, q) {
    clearTimers();
    const deadline = Date.now() + (SECONDS_PER_QUESTION * 1000);
    paintTimer(el, deadline - Date.now());

    timerInterval = setInterval(() => {
      paintTimer(el, deadline - Date.now());
    }, 250);

    timerTimeout = setTimeout(() => {
      handleAnswer(el, q, null, true);
    }, SECONDS_PER_QUESTION * 1000);
  }

  function render(el) {
    clearTimers();
    delete el.dataset.answered;
    const s = Store.get();
    const total = s.questions.length;

    if (!s.quizStarted) {
      el.innerHTML = `
        <div class="card quiz-intro">
          <div class="quiz-intro-badge">Antes de comecar</div>
          <h2>Como funciona este quiz</h2>
          <p class="quiz-intro-copy">
            Leia com calma e responda cada pergunta dentro do tempo.
          </p>

          <div class="quiz-intro-grid">
            <div class="quiz-intro-item">
              <div class="quiz-intro-label">Tempo por pergunta</div>
              <div class="quiz-intro-value">30 segundos</div>
            </div>
            <div class="quiz-intro-item">
              <div class="quiz-intro-label">Total desta rodada</div>
              <div class="quiz-intro-value">${total} questoes</div>
            </div>
          </div>

          <div class="quiz-intro-notes">
            <div class="quiz-intro-note">Depois de cada resposta voce vera se acertou ou errou e o motivo.</div>
            <div class="quiz-intro-note">Nao e possivel voltar ou trocar de materia ate terminar este quiz.</div>
          </div>

          <button class="btn btn-primary btn-lg" id="btn-begin-quiz">▶️ Comecar agora</button>
        </div>
      `;

      el.querySelector('#btn-begin-quiz').addEventListener('click', () => App.beginQuiz());
      return;
    }

    const q = s.questions[s.index];
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

        <div class="question-timer-wrap" aria-live="polite">
          <div class="question-timer-top">
            <span class="timer-label">Tempo da pergunta</span>
            <span class="question-timer" id="question-timer">00:30</span>
          </div>
          <div class="timer-bar">
            <div class="timer-fill" id="timer-fill"></div>
          </div>
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

    startTimer(el, q);
  }

  function handleAnswer(el, q, chosen, isTimeout = false) {
    if (el.dataset.answered === 'true') return;
    el.dataset.answered = 'true';
    clearTimers();

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
    s.answers.push({ id: q.id, selected: chosen, correct: q.correctIndex, isCorrect, isTimeout });

    const fbEl = el.querySelector('#feedback');
    if (isTimeout) {
      fbEl.innerHTML = `
        <div class="feedback fail">
          <div class="feedback-title">⏰ O tempo acabou!</div>
          <div class="feedback-explain">A resposta certa era: ${q.options[q.correctIndex]}</div>
          <div class="feedback-why-wrong">${q.explanation}</div>
        </div>`;
    } else if (isCorrect) {
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
