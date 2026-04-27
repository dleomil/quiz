const ResultsView = (function () {
  const LETTERS = ['A', 'B', 'C', 'D'];

  function buildGabaritoHTML(answers, questions) {
    return answers.map(function(ans, idx) {
      var q         = questions[idx];
      var ok        = ans.isCorrect;
      var isTimeout = !!ans.isTimeout;
      var topicInfo = QuestionsDB.getTopicInfo(q.topic);

      var userTag = isTimeout
        ? '<span class="tag tag-user-fail">⏰ Tempo esgotado</span>'
        : ok
          ? '<span class="tag tag-user-ok">✅ ' + q.options[ans.selected] + '</span>'
          : '<span class="tag tag-user-fail">❌ ' + q.options[ans.selected] + '</span>';

      var correctTag = !ok
        ? '<span class="tag tag-correct">✅ ' + q.options[q.correctIndex] + '</span>'
        : '';

      var wrongMsg = (!ok && !isTimeout && q.wrongExplanations && q.wrongExplanations[ans.selected])
        ? '<div class="gab-why-wrong">❌ Você escolheu "' + q.options[ans.selected] + '": ' + q.wrongExplanations[ans.selected] + '</div>'
        : '';

      var explainBlock = (!ok && q.explanation)
        ? '<div class="gab-explain">' + q.explanation + '</div>'
        : '';

      return '<div class="gabarito-item ' + (ok ? 'ok-item' : 'fail-item') + '" role="article">' +
        '<div class="gab-num">' + topicInfo.icon + ' ' + topicInfo.name + ' — Questão ' + (idx + 1) + '</div>' +
        '<div class="gab-q">' + q.question + '</div>' +
        '<div class="gab-tags">' + userTag + correctTag + '</div>' +
        explainBlock + wrongMsg +
        '</div>';
    }).join('');
  }

  function downloadResult(s, dateStr, topicLabel, total, correct, pct) {
    var g = getGrade(pct);
    var gabHTML = buildGabaritoHTML(s.answers, s.questions);
    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Resultado</title>' +
      '<style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:24px;color:#1E293B}' +
      'h1{color:#4F46E5}.ok-item{border-left:4px solid #10B981;padding:12px;margin-bottom:12px;background:#F0FDF4;border-radius:8px}' +
      '.fail-item{border-left:4px solid #EF4444;padding:12px;margin-bottom:12px;background:#FEF2F2;border-radius:8px}' +
      '.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-weight:700;margin-right:6px;font-size:.85rem}' +
      '.tag-user-ok{background:#ECFDF5;color:#059669}.tag-user-fail{background:#FEF2F2;color:#DC2626}' +
      '.tag-correct{background:#ECFDF5;color:#059669}.gab-explain{margin-top:8px;padding:8px;background:#F8FAFC;border-radius:6px;font-size:.88rem}' +
      '.gab-why-wrong{margin-top:6px;padding:6px;background:#FFF5F5;border-radius:6px;font-size:.84rem;color:#64748B}' +
      'footer{margin-top:32px;font-size:.8rem;color:#94A3B8}</style></head><body>' +
      '<h1>📝 Resultado do Quiz</h1>' +
      '<p><strong>Assunto:</strong> ' + topicLabel + '</p>' +
      '<p><strong>Data:</strong> ' + dateStr + '</p>' +
      '<p><strong>Nota:</strong> ' + pct + '% (' + correct + '/' + total + ') ' + g.stars + '</p>' +
      '<p><strong>Desempenho:</strong> ' + g.msg + '</p><hr/><h2>Gabarito</h2>' +
      gabHTML + '<footer>Gerado pelo Quiz Etapa</footer></body></html>';

    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = 'quiz-resultado-' + dateStr.replace(/[/:, ]/g, '-') + '.html';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  function render(el) {
    var s       = Store.get();
    var total   = s.questions.length;
    var correct = s.answers.filter(function(a) { return a.isCorrect; }).length;
    var pct     = Math.round((correct / total) * 100);
    var g       = getGrade(pct);
    var now     = new Date();
    var dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
                  ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    var topicLabel = resolveTopicLabel(s);
    var timedOut   = s.answers.filter(function(a) { return a.isTimeout; }).length;

    el.innerHTML =
      '<div class="card">' +
        '<div class="results-top">' +
          '<div class="score-circle ' + g.cls + '" role="img" aria-label="Nota: ' + pct + '%">' +
            '<span class="score-pct">' + pct + '%</span>' +
            '<span class="score-frac">' + correct + '/' + total + '</span>' +
          '</div>' +
          '<div class="score-msg">' + g.msg + '</div>' +
          '<div class="stars-row" aria-label="' + g.label + '">' + g.stars + '</div>' +
          (timedOut > 0 ? '<p style="color:var(--muted);font-size:.9rem;margin-bottom:12px">⏰ ' + timedOut + ' questão(ões) com tempo esgotado</p>' : '') +
          '<div class="results-actions">' +
            '<button class="btn btn-primary" onclick="App.startQuiz(Store.get().selectedTopic, Store.get().selectedSubject)">🔁 Refazer</button>' +
            '<button class="btn btn-outline" onclick="App.navigate(\'home\',{force:true})">🏠 Início</button>' +
            '<button class="btn btn-download" id="btn-download-result">⬇️ Baixar resultado</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="gabarito-title">📋 Gabarito detalhado</div>' +
        buildGabaritoHTML(s.answers, s.questions) +
      '</div>';

    el.querySelector('#btn-download-result').addEventListener('click', function() {
      downloadResult(s, dateStr, topicLabel, total, correct, pct);
    });
  }

  return { render: render };
})();
