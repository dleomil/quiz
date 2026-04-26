const HistoryView = (function () {
  function normalize(str) {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

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

  function performanceLabel(pct) {
    if (pct >= 90) return 'Excelente';
    if (pct >= 75) return 'Muito bom';
    if (pct >= 60) return 'Bom';
    if (pct >= 40) return 'Regular';
    return 'Precisa revisar';
  }

  function durationLabel(durationSec) {
    if (!durationSec && durationSec !== 0) return 'Tempo nao registrado';
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}min ${String(secs).padStart(2, '0')}s`;
  }

  function extractSubjectLabel(item) {
    if (item.subject) {
      const meta = QuestionsDB.getSubjectInfo(item.subject);
      if (meta && meta.name) return meta.name;
    }
    if (item.topic && item.topic.includes('Portugues')) return 'Portugues';
    return 'Outros';
  }

  function extractTopicLabel(item) {
    if (item.topicId && item.topicId !== 'all') {
      const meta = QuestionsDB.getTopicInfo(item.topicId);
      if (meta && meta.name) return meta.name;
    }
    if (item.topic) return item.topic;
    return 'Tema nao informado';
  }

  function buildFilterOptions(history) {
    const subjectMap = new Map();
    const topicMap = new Map();

    history.forEach(item => {
      const subjectKey = item.subject || extractSubjectLabel(item);
      const subjectLabel = extractSubjectLabel(item);
      subjectMap.set(subjectKey, subjectLabel);

      const topicKey = item.topicId || item.topic;
      const topicLabel = extractTopicLabel(item);
      topicMap.set(topicKey, topicLabel);
    });

    return {
      subjects: [...subjectMap.entries()],
      topics: [...topicMap.entries()]
    };
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

    const filterOptions = buildFilterOptions(history);

    el.innerHTML = `
      <div class="card">
        <div class="history-header">
          <h2>📊 Histórico de Desempenho</h2>
          <button class="btn btn-danger" id="clear-btn" style="font-size:.85rem;padding:8px 14px;">🗑️ Limpar</button>
        </div>

        <div class="history-filters">
          <input class="history-search" id="history-search" type="search" placeholder="Buscar por materia ou assunto" />
          <select class="history-select" id="history-subject">
            <option value="all">Todas as materias</option>
            ${filterOptions.subjects.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
          </select>
          <select class="history-select" id="history-topic">
            <option value="all">Todos os assuntos</option>
            ${filterOptions.topics.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
          </select>
          <select class="history-select" id="history-score">
            <option value="all">Qualquer desempenho</option>
            <option value="high">75% ou mais</option>
            <option value="mid">50% a 74%</option>
            <option value="low">Abaixo de 50%</option>
          </select>
        </div>

        <div class="stats-row" id="history-stats">
        </div>

        <div class="chart-wrap">
          <canvas id="perf-chart"></canvas>
        </div>

        <div class="history-summary" id="history-summary"></div>
        <div class="session-list" id="session-list"></div>

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

    const searchEl = el.querySelector('#history-search');
    const subjectEl = el.querySelector('#history-subject');
    const topicEl = el.querySelector('#history-topic');
    const scoreEl = el.querySelector('#history-score');
    const statsEl = el.querySelector('#history-stats');
    const listEl = el.querySelector('#session-list');
    const summaryEl = el.querySelector('#history-summary');
    const chartCanvas = el.querySelector('#perf-chart');
    let chart = null;

    function scoreMatches(item, scoreFilter) {
      if (scoreFilter === 'high') return item.pct >= 75;
      if (scoreFilter === 'mid') return item.pct >= 50 && item.pct < 75;
      if (scoreFilter === 'low') return item.pct < 50;
      return true;
    }

    function renderStats(filtered) {
      const total = filtered.length;
      const avg = Math.round(filtered.reduce((sum, item) => sum + item.pct, 0) / total);
      const best = Math.max(...filtered.map(item => item.pct));
      const avgDuration = Math.round(filtered.reduce((sum, item) => sum + (item.durationSec || 0), 0) / total);

      statsEl.innerHTML = `
        <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">Quizzes filtrados</div></div>
        <div class="stat-card"><div class="stat-val">${avg}%</div><div class="stat-lbl">Media do filtro</div></div>
        <div class="stat-card"><div class="stat-val">${best}%</div><div class="stat-lbl">Melhor nota</div></div>
        <div class="stat-card"><div class="stat-val">${durationLabel(avgDuration)}</div><div class="stat-lbl">Tempo medio</div></div>
      `;
    }

    function renderList(filtered) {
      listEl.innerHTML = filtered.map(item => {
        const subjectLabel = extractSubjectLabel(item);
        const topicLabel = extractTopicLabel(item);
        const timeoutLabel = item.timedOutCount ? ` · ${item.timedOutCount} tempo${item.timedOutCount > 1 ? 's' : ''} esgotado${item.timedOutCount > 1 ? 's' : ''}` : '';

        return `
          <div class="session-card">
            <div class="session-badge ${badgeClass(item.pct)}">${item.pct}%</div>
            <div class="session-info">
              <div class="session-date">${item.date}</div>
              <div class="session-topic">${subjectLabel} · ${topicLabel}</div>
              <div class="session-meta">${item.correct}/${item.total} questoes certas · ${durationLabel(item.durationSec)}${timeoutLabel}</div>
            </div>
            <div class="session-side">
              <div class="session-stars">${stars(item.pct)}</div>
              <div class="session-level">${performanceLabel(item.pct)}</div>
            </div>
          </div>`;
      }).join('');
    }

    function renderChart(filtered) {
      if (chart) {
        chart.destroy();
        chart = null;
      }
      if (typeof Chart === 'undefined' || filtered.length === 0) return;

      const chartData = [...filtered].reverse().slice(-15);
      const ctx = chartCanvas.getContext('2d');
      chart = new Chart(ctx, {
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

    function applyFilters() {
      const search = normalize(searchEl.value);
      const subject = subjectEl.value;
      const topic = topicEl.value;
      const score = scoreEl.value;

      const filtered = history.filter(item => {
        const subjectKey = item.subject || extractSubjectLabel(item);
        const topicKey = item.topicId || item.topic;
        const haystack = normalize([
          extractSubjectLabel(item),
          extractTopicLabel(item),
          item.topic,
          item.date
        ].join(' '));

        return (subject === 'all' || subjectKey === subject)
          && (topic === 'all' || topicKey === topic)
          && scoreMatches(item, score)
          && (!search || haystack.includes(search));
      });

      if (filtered.length === 0) {
        statsEl.innerHTML = '';
        summaryEl.innerHTML = `<div class="history-empty-filter">Nenhum resultado encontrado com os filtros atuais.</div>`;
        listEl.innerHTML = '';
        if (chart) {
          chart.destroy();
          chart = null;
        }
        return;
      }

      summaryEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} no historico.`;
      renderStats(filtered);
      renderList(filtered);
      renderChart(filtered);
    }

    [searchEl, subjectEl, topicEl, scoreEl].forEach(control => {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  return { render };
})();
