/* exported ResultsView */
/* global App, Store, QuestionsDB, escapeHTML, getGrade, resolveTopicLabel */
const ResultsView = (function () {
  function getCorrectReason(q) {
    return q.explanation || 'Essa é a resposta certa para esta pergunta.';
  }

  function getWrongReason(q, chosen) {
    if (chosen === null || chosen === undefined || chosen < 0) {
      return 'Não houve resposta dentro do tempo.';
    }
    if (q.wrongExplanations && q.wrongExplanations[chosen]) {
      return q.wrongExplanations[chosen];
    }
    return 'Essa alternativa não combina com o enunciado.';
  }

  function buildGabaritoHTML(answers, questions) {
    return answers
      .map(function (ans, idx) {
        var q = questions[idx];
        var ok = ans.isCorrect;
        var isTimeout = !!ans.isTimeout;
        var topicInfo = QuestionsDB.getTopicInfo(q.topic);

        var userTag = isTimeout
          ? '<span class="tag tag-user-fail">⏰ Tempo esgotado</span>'
          : ok
            ? '<span class="tag tag-user-ok">✅ ' +
              escapeHTML(q.options[ans.selected]) +
              '</span>'
            : '<span class="tag tag-user-fail">❌ ' +
              escapeHTML(q.options[ans.selected]) +
              '</span>';

        var correctTag = !ok
          ? '<span class="tag tag-correct">✅ ' +
            escapeHTML(q.options[q.correctIndex]) +
            '</span>'
          : '';

        var correctReason =
          '<div class="gab-block">' +
          '<div class="gab-label">' +
          (ok ? 'Você acertou' : 'A resposta certa é') +
          '</div>' +
          '<div class="gab-answer">' +
          escapeHTML(q.options[q.correctIndex]) +
          '</div>' +
          '<div class="gab-explain">' +
          escapeHTML(getCorrectReason(q)) +
          '</div>' +
          '</div>';

        var wrongReason = !ok
          ? '<div class="gab-block">' +
            '<div class="gab-label">' +
            (isTimeout
              ? 'O tempo acabou'
              : 'Por que a sua resposta não está correta') +
            '</div>' +
            '<div class="gab-why-wrong">' +
            escapeHTML(
              isTimeout
                ? 'Você não respondeu a tempo.'
                : 'Você marcou "' +
                    (q.options[ans.selected] || 'nenhuma alternativa') +
                    '".',
            ) +
            '</div>' +
            '<div class="gab-explain">' +
            escapeHTML(getWrongReason(q, ans.selected)) +
            '</div>' +
            '</div>'
          : '';

        return (
          '<div class="gabarito-item ' +
          (ok ? 'ok-item' : 'fail-item') +
          '" role="article">' +
          '<div class="gab-num">' +
          escapeHTML(topicInfo.icon) +
          ' ' +
          escapeHTML(topicInfo.name) +
          ' — Questão ' +
          (idx + 1) +
          '</div>' +
          '<div class="gab-q">' +
          escapeHTML(q.question) +
          '</div>' +
          (q.subject === 'ingles' && q.questionPt
            ? '<div class="gab-question-support"><span>Em português:</span> ' +
              escapeHTML(q.questionPt) +
              '</div>'
            : '') +
          '<div class="gab-tags">' +
          userTag +
          correctTag +
          '</div>' +
          correctReason +
          wrongReason +
          '</div>'
        );
      })
      .join('');
  }

  function downloadResult(s, dateStr, topicLabel, total, correct, pct) {
    var g = getGrade(pct);
    var gabHTML = buildGabaritoHTML(s.answers, s.questions);
    var html =
      '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Resultado</title>' +
      '<style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:24px;color:#1E293B}' +
      'h1{color:#4F46E5}.ok-item{border-left:4px solid #10B981;padding:12px;margin-bottom:12px;background:#F0FDF4;border-radius:8px}' +
      '.fail-item{border-left:4px solid #EF4444;padding:12px;margin-bottom:12px;background:#FEF2F2;border-radius:8px}' +
      '.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-weight:700;margin-right:6px;font-size:.85rem}' +
      '.tag-user-ok{background:#ECFDF5;color:#059669}.tag-user-fail{background:#FEF2F2;color:#DC2626}' +
      '.tag-correct{background:#ECFDF5;color:#059669}.gab-block{margin-top:10px;padding:10px;background:#F8FAFC;border-radius:8px}' +
      '.gab-label{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#64748B;margin-bottom:4px}' +
      '.gab-answer{font-weight:700;margin-bottom:6px}.gab-explain{font-size:.88rem;line-height:1.5}.gab-why-wrong{font-size:.84rem;color:#64748B;line-height:1.5}' +
      'footer{margin-top:32px;font-size:.8rem;color:#94A3B8}</style></head><body>' +
      '<h1>📝 Resultado do Quiz</h1>' +
      '<p><strong>Assunto:</strong> ' +
      escapeHTML(topicLabel) +
      '</p>' +
      '<p><strong>Data:</strong> ' +
      escapeHTML(dateStr) +
      '</p>' +
      '<p><strong>Nota:</strong> ' +
      pct +
      '% (' +
      correct +
      '/' +
      total +
      ') ' +
      escapeHTML(g.stars) +
      '</p>' +
      '<p><strong>Desempenho:</strong> ' +
      escapeHTML(g.msg) +
      '</p><hr/><h2>Gabarito</h2>' +
      gabHTML +
      '<footer>Gerado pelo Quiz Etapa</footer></body></html>';

    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-resultado-' + dateStr.replace(/[/:, ]/g, '-') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function render(el) {
    var s = Store.get();
    var total = s.questions.length;
    var correct = s.answers.filter(function (a) {
      return a.isCorrect;
    }).length;
    var pct = Math.round((correct / total) * 100);
    var g = getGrade(pct);
    var now = new Date();
    var dateStr =
      now.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' ' +
      now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    var topicLabel = resolveTopicLabel(s);
    var timedOut = s.answers.filter(function (a) {
      return a.isTimeout;
    }).length;

    el.innerHTML =
      '<div class="card">' +
      '<div class="results-top">' +
      '<div class="score-circle ' +
      escapeHTML(g.cls) +
      '" role="img" aria-label="Nota: ' +
      pct +
      '%">' +
      '<span class="score-pct">' +
      pct +
      '%</span>' +
      '<span class="score-frac">' +
      correct +
      '/' +
      total +
      '</span>' +
      '</div>' +
      '<div class="score-msg">' +
      escapeHTML(g.msg) +
      '</div>' +
      '<div class="stars-row" aria-label="' +
      escapeHTML(g.label) +
      '">' +
      escapeHTML(g.stars) +
      '</div>' +
      (timedOut > 0
        ? '<p style="color:var(--muted);font-size:.9rem;margin-bottom:12px">⏰ ' +
          timedOut +
          ' questão(ões) com tempo esgotado</p>'
        : '') +
      '<div class="results-actions">' +
      '<button class="btn btn-primary" id="btn-repeat-quiz">🔁 Refazer</button>' +
      '<button class="btn btn-outline" id="btn-results-home">🏠 Início</button>' +
      '<button class="btn btn-download" id="btn-download-result">⬇️ Baixar resultado</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="card">' +
      '<div class="gabarito-title">📋 Gabarito detalhado</div>' +
      buildGabaritoHTML(s.answers, s.questions) +
      '</div>';

    el.querySelector('#btn-repeat-quiz').addEventListener('click', function () {
      App.startQuiz(Store.get().selectedTopic, Store.get().selectedSubject);
    });
    el.querySelector('#btn-results-home').addEventListener(
      'click',
      function () {
        App.navigate('home', { force: true });
      },
    );
    el.querySelector('#btn-download-result').addEventListener(
      'click',
      function () {
        downloadResult(s, dateStr, topicLabel, total, correct, pct);
      },
    );
  }

  return { render: render };
})();
