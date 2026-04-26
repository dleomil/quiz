const ResultsView = (function () {
  const LETTERS = ['A', 'B', 'C', 'D'];

  function grade(pct) {
    if (pct >= 90) return { cls: 'grade-a', stars: '⭐⭐⭐⭐⭐', msg: 'Excelente! Você é incrível! 🏆' };
    if (pct >= 75) return { cls: 'grade-b', stars: '⭐⭐⭐⭐☆', msg: 'Muito bem! Continue assim! 🥇' };
    if (pct >= 60) return { cls: 'grade-c', stars: '⭐⭐⭐☆☆', msg: 'Bom trabalho! Quase lá! 🥈' };
    if (pct >= 40) return { cls: 'grade-d', stars: '⭐⭐☆☆☆', msg: 'Está melhorando! Continue estudando! 📚' };
    return         { cls: 'grade-f', stars: '⭐☆☆☆☆', msg: 'Não desista! Você vai conseguir! 💪' };
  }

  function buildGabItems(answers, questions) {
    return answers.map((ans, idx) => {
      const q         = questions[idx];
      const ok        = ans.isCorrect;
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
  }

  function downloadResults(s, g, pct, correct, total, topicLabel, dateStr) {
    const gabHtml = s.answers.map((ans, idx) => {
      const q        = s.questions[idx];
      const ok       = ans.isCorrect;
      const topicInfo = QuestionsDB.getTopicInfo(q.topic);
      const wrongMsg = !ok && q.wrongExplanations && q.wrongExplanations[ans.selected]
        ? `<p style="color:#B91C1C;font-size:.88rem;margin:6px 0 0;">❌ Você escolheu "${q.options[ans.selected]}": ${q.wrongExplanations[ans.selected]}</p>`
        : '';
      return `
        <div style="border:1px solid #E2E8F0;border-left:5px solid ${ok ? '#10B981' : '#EF4444'};border-radius:8px;padding:14px 16px;margin:10px 0;">
          <p style="font-size:.8rem;color:#64748B;margin:0 0 4px;">${topicInfo.icon} ${topicInfo.name} — Questão ${idx + 1}</p>
          <p style="font-weight:700;margin:0 0 8px;">${q.question}</p>
          ${ok
            ? `<span style="background:#D1FAE5;color:#065F46;padding:3px 12px;border-radius:20px;font-size:.85rem;font-weight:600;">✅ ${q.options[ans.selected]}</span>`
            : `<span style="background:#FEE2E2;color:#991B1B;padding:3px 12px;border-radius:20px;font-size:.85rem;font-weight:600;margin-right:8px;">❌ ${q.options[ans.selected]}</span>
               <span style="background:#D1FAE5;color:#065F46;padding:3px 12px;border-radius:20px;font-size:.85rem;font-weight:600;">✅ ${q.options[q.correctIndex]}</span>`}
          ${!ok ? `<p style="color:#475569;font-size:.88rem;margin:8px 0 0;font-style:italic;">${q.explanation}</p>${wrongMsg}` : ''}
        </div>`;
    }).join('');

    const scoreColor = pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Resultado Quiz — ${dateStr}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 28px 20px 48px; color: #1E293B; }
    h1 { color: #4F46E5; margin-bottom: 4px; }
    .meta { color: #64748B; font-size: .9rem; margin-bottom: 24px; }
    .score-box { background: #F8FAFC; border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 24px; }
    .score-num { font-size: 4rem; font-weight: 900; color: ${scoreColor}; line-height: 1; }
    .score-frac { font-size: 1.1rem; color: #64748B; margin: 6px 0; }
    .score-msg  { font-size: 1.1rem; font-weight: 700; margin-top: 10px; }
    hr { border: none; border-top: 2px solid #E2E8F0; margin: 28px 0; }
    h2 { color: #4F46E5; margin-bottom: 14px; }
    @media print { .no-print { display:none; } }
  </style>
</head>
<body>
  <h1>📚 Quiz Etapa — 3º Ano</h1>
  <p class="meta">${dateStr} &nbsp;·&nbsp; ${topicLabel}</p>

  <div class="score-box">
    <div class="score-num">${pct}%</div>
    <div class="score-frac">${correct} de ${total} questões certas</div>
    <div style="font-size:1.6rem;margin:8px 0;">${g.stars}</div>
    <div class="score-msg">${g.msg}</div>
  </div>

  <hr/>
  <h2>📋 Gabarito Completo</h2>
  ${gabHtml}

  <p style="margin-top:32px;font-size:.8rem;color:#94A3B8;text-align:center;">Gerado pelo Quiz Etapa</p>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `quiz-resultado-${dateStr.replace(/[/:, ]/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function render(el) {
    const s = Store.get();
    const total   = s.questions.length;
    const correct = s.answers.filter(a => a.isCorrect).length;
    const pct     = Math.round((correct / total) * 100);
    const g       = grade(pct);

    const now        = new Date();
    const dateStr    = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                     + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let topicLabel;
    if (s.selectedTopic === 'all') {
      const subjectInfo = s.selectedSubject ? QuestionsDB.getSubjectInfo(s.selectedSubject) : { name: 'Todos os Temas' };
      topicLabel = subjectInfo.name + ' — Todos os Assuntos';
    } else {
      topicLabel = QuestionsDB.getTopicInfo(s.selectedTopic).name;
    }

    el.innerHTML = `
      <div class="card results-top">
        <div class="score-circle ${g.cls}">
          <div class="score-pct">${pct}%</div>
          <div class="score-frac">${correct}/${total}</div>
        </div>
        <div class="score-msg">${g.msg}</div>
        <div class="stars-row">${g.stars}</div>

        <div class="results-actions">
          <button class="btn btn-primary"  id="btn-restart">🔄 Novo Quiz</button>
          <button class="btn btn-outline"  id="btn-history">📊 Histórico</button>
          <button class="btn btn-download" id="btn-download">⬇️ Baixar Resultado</button>
        </div>
      </div>

      <div class="card">
        <div class="gabarito-title">📋 Gabarito Completo</div>
        ${buildGabItems(s.answers, s.questions)}

        <div style="margin-top:20px; text-align:center; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn-primary"  id="btn-restart2">🔄 Fazer Outro Quiz</button>
          <button class="btn btn-download" id="btn-download2">⬇️ Baixar Resultado</button>
        </div>
      </div>
    `;

    el.querySelector('#btn-restart').addEventListener('click',  () => App.navigate('home'));
    el.querySelector('#btn-restart2').addEventListener('click', () => App.navigate('home'));
    el.querySelector('#btn-history').addEventListener('click',  () => App.navigate('history'));

    const doDownload = () => downloadResults(s, g, pct, correct, total, topicLabel, dateStr);
    el.querySelector('#btn-download').addEventListener('click',  doDownload);
    el.querySelector('#btn-download2').addEventListener('click', doDownload);
  }

  return { render };
})();
