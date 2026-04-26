const HistoryView = (function () {
  function badgeClass(pct) {
    if (pct >= 90) return 'grade-a';
    if (pct >= 75) return 'grade-b';
    if (pct >= 60) return 'grade-c';
    if (pct >= 40) return 'grade-d';
    return 'grade-f';
  }

  function stars(pct) {
    if (pct >= 90) return '⭐⭐⭐⭐⭐';
    if (pct >= 75) return '⭐⭐⭐⭐';
    if (pct >= 60) return '⭐⭐⭐';
    if (pct >= 40) return '⭐⭐';
    return '⭐';
  }

  function render(el) {
    const history = Store.get().history;

    if (history.length === 0) {
      el.innerHTML = `
        <div class="card empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-msg">Nenhum quiz feito ainda!<br>Comece seu primeiro quiz para ver o histórico.</div>
          <br>
          <button class="btn btn-primary" onclick="App.navigate('home')">▶️ Fazer um Quiz</button>
        </div>`;
      return;
    }

    // Stats
    const avg   = Math.round(history.reduce((s, h) => s + h.pct, 0) / history.length);
    const best  = Math.max(...history.map(h => h.pct));
    const total = history.length;

    // Chart data (last 15)
    const chartData = [...history].reverse().slice(-15);

    el.innerHTML = `
      <div class="card">
        <div class="history-header">
          <h2>📊 Histórico de Desempenho</h2>
          <button class="btn btn-danger" id="clear-btn" style="font-size:.85rem;padding:8px 14px;">🗑️ Limpar</button>
        </div>

        <div class="stats-row">
          <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">Quizzes feitos</div></div>
          <div class="stat-card"><div class="stat-val">${avg}%</div><div class="stat-lbl">Média geral</div></div>
          <div class="stat-card"><div class="stat-val">${best}%</div><div class="stat-lbl">Melhor nota</div></div>
        </div>

        <div class="chart-wrap">
          <canvas id="perf-chart"></canvas>
        </div>

        <div class="session-list">
          ${history.map((h, i) => `
            <div class="session-card">
              <div class="session-badge ${badgeClass(h.pct)}">${h.pct}%</div>
              <div class="session-info">
                <div class="session-date">${h.date} &mdash; ${h.topic}</div>
                <div class="session-topic">${h.correct}/${h.total} questões certas</div>
              </div>
              <div class="session-stars">${stars(h.pct)}</div>
            </div>`).join('')}
        </div>

        <div style="margin-top:20px;text-align:center;">
          <button class="btn btn-primary" onclick="App.navigate('home')">▶️ Novo Quiz</button>
        </div>
      </div>
    `;

    el.querySelector('#clear-btn').addEventListener('click', () => {
      if (confirm('Tem certeza que quer apagar todo o histórico?')) {
        Store.clearHistory();
        App.navigate('history');
      }
    });

    // Build chart
    if (typeof Chart !== 'undefined' && chartData.length > 0) {
      const ctx = el.querySelector('#perf-chart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.map((_, i) => `Quiz ${i + 1}`),
          datasets: [{
            label: 'Nota (%)',
            data: chartData.map(h => h.pct),
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79,70,229,0.12)',
            pointBackgroundColor: chartData.map(h =>
              h.pct >= 75 ? '#10B981' : h.pct >= 50 ? '#F59E0B' : '#EF4444'
            ),
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v => v + '%' }, grid: { color: '#E2E8F0' } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: ctx => ` ${ctx.parsed.y}%` }
            }
          }
        }
      });
    }
  }

  return { render };
})();
