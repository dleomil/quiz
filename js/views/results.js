const ResultsView = (function () {
  const LETTERS = ['A', 'B', 'C', 'D'];

  function grade(pct) {
    if (pct >= 90) return { cls: 'grade-a', stars: '⭐⭐⭐⭐⭐', msg: 'Excelente! Você é incrível! 🏆' };
    if (pct >= 75) return { cls: 'grade-b', stars: '⭐⭐⭐⭐☆', msg: 'Muito bem! Continue assim! 🥇' };
    if (pct >= 60) return { cls: 'grade-c', stars: '⭐⭐⭐☆☆', msg: 'Bom trabalho! Quase lá! 🥈' };
    if (pct >= 40) return { cls: 'grade-d', stars: '⭐⭐☆☆☆', msg: 'Está melhorando! Continue estudando! 📚' };
    return         { cls: 'grade-f', stars: '⭐☆☆☆☆', msg: 'Não desista! Você vai conseguir! 💪' };
  }

  function render(el) {
    const s = Store.get();
    const total   = s.questions.length;
    const correct = s.answers.filter(a => a.isCorrect).length;
    const pct     = Math.round((correct / total) * 100);
    const g       = grade(pct);

    const gabItems = s.answers.map((ans, idx) => {
      const q      = s.questions[idx];
      const ok     = ans.isCorrect;
      const topicInfo = QuestionsDB.getTopicInfo(q.topic);
      const wrongMsg  = !ok && q.wrongExplanations && q.wrongExplanations[ans.selected]
        ? `<div class="gab-why-wrong">❌ Você escolheu "${q.options[ans.selected]}": ${q.wrongExplanations[ans.selected]}</div>`
        : '';

      return `
        <div class="gabarito-item ${ok ? 'ok-item' : 'fail-item'}">
          <div class="gab-num">${topicInfo.icon} ${topicInfo.name} — Questão ${idx + 1}</div>
          ${q.text ? `<div style="font-size:.83rem;color:var(--muted);font-style:italic;margin-bottom:4px;">Texto: "${q.text.slice(0, 80)}…"</div>` : ''}
          <div class="gab-q">${q.question}</div>
          <div class="gab-tags">
            ${ok
              ? `<span class="tag tag-user-ok">✅ Sua resposta: ${q.options[ans.selected]}</span>`
              : `<span class="tag tag-user-fail">❌ Sua resposta: ${q.options[ans.selected]}</span>
                 <span class="tag tag-correct">✅ Correta: ${q.options[q.correctIndex]}</span>`}
          </div>
          ${!ok ? `
            <div class="gab-explain">${q.explanation}</div>
            ${wrongMsg}
          ` : ''}
        </div>`;
    }).join('');

    el.innerHTML = `
      <div class="card results-top">
        <div class="score-circle ${g.cls}">
          <div class="score-pct">${pct}%</div>
          <div class="score-frac">${correct}/${total}</div>
        </div>
        <div class="score-msg">${g.msg}</div>
        <div class="stars-row">${g.stars}</div>

        <div class="results-actions">
          <button class="btn btn-primary" id="btn-restart">🔄 Novo Quiz</button>
          <button class="btn btn-outline"  id="btn-history">📊 Ver Histórico</button>
        </div>
      </div>

      <div class="card">
        <div class="gabarito-title">📋 Gabarito Completo</div>
        ${gabItems}

        <div style="margin-top:20px; text-align:center;">
          <button class="btn btn-primary" id="btn-restart2">🔄 Fazer Outro Quiz</button>
        </div>
      </div>
    `;

    el.querySelector('#btn-restart').addEventListener('click',  () => App.navigate('home'));
    el.querySelector('#btn-restart2').addEventListener('click', () => App.navigate('home'));
    el.querySelector('#btn-history').addEventListener('click',  () => App.navigate('history'));
  }

  return { render };
})();
