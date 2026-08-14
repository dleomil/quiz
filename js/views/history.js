/* exported HistoryView */
/* global Store, QuestionsDB, getGrade */
const HistoryView = (function () {
  function normalize(str) {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function durationLabel(durationSec) {
    if (!durationSec && durationSec !== 0) return 'Tempo não registrado';
    var mins = Math.floor(durationSec / 60);
    var secs = durationSec % 60;
    if (mins === 0) return secs + 's';
    return mins + 'min ' + String(secs).padStart(2, '0') + 's';
  }

  function extractSubjectLabel(item) {
    if (item.subject) {
      var meta = QuestionsDB.getSubjectInfo(item.subject);
      if (meta && meta.name) return meta.name;
    }
    if (item.topic && item.topic.includes('Portugu')) return 'Português';
    return 'Outros';
  }

  function extractTopicLabel(item) {
    if (item.topicId && item.topicId !== 'all') {
      var meta = QuestionsDB.getTopicInfo(item.topicId);
      if (meta && meta.name) return meta.name;
    }
    if (item.topic) return item.topic;
    return 'Tema não informado';
  }

  function extractContentSetLabel(item) {
    var contentSet = QuestionsDB.getContentSet(item.contentSetId);
    return contentSet ? contentSet.displayName : 'Acervo anterior';
  }

  function buildFilterOptions(history) {
    var subjectMap = new Map();
    var topicMap = new Map();
    history.forEach(function (item) {
      var subjectKey = item.subject || extractSubjectLabel(item);
      subjectMap.set(subjectKey, extractSubjectLabel(item));
      var topicKey = item.topicId || item.topic;
      topicMap.set(topicKey, extractTopicLabel(item));
    });
    return {
      subjects: Array.from(subjectMap.entries()),
      topics: Array.from(topicMap.entries()),
    };
  }

  function downloadCSV(history) {
    var header =
      'Data,Período,Matéria,Assunto,Acertos,Total,Nota (%),Duração (s),Timeouts\n';
    var rows = history.map(function (item) {
      return [
        item.date || '',
        extractContentSetLabel(item),
        extractSubjectLabel(item),
        extractTopicLabel(item),
        item.correct || 0,
        item.total || 0,
        item.pct || 0,
        item.durationSec || 0,
        item.timedOutCount || 0,
      ]
        .map(function (v) {
          return '"' + String(v).replace(/"/g, '""') + '"';
        })
        .join(',');
    });
    var csv = '\uFEFF' + header + rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download =
      'historico-quiz-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function render(el) {
    var state = Store.get();
    var history = state.history;
    var selectedContentSet = state.selectedContentSet;

    if (history.length === 0) {
      el.innerHTML =
        '<div class="card empty-state">' +
        '<div class="empty-icon">📊</div>' +
        '<div class="empty-msg">Nenhuma sessão registrada ainda.<br>Complete um quiz para ver seu histórico!</div>' +
        '</div>';
      return;
    }

    var opts = buildFilterOptions(history);
    var contentSets = QuestionsDB.getContentSets();
    var contentSetsHTML = contentSets
      .map(function (contentSet) {
        return (
          '<option value="' +
          contentSet.contentSetId +
          '"' +
          (contentSet.contentSetId === selectedContentSet ? ' selected' : '') +
          '>' +
          contentSet.displayName +
          '</option>'
        );
      })
      .join('');
    var subjectsHTML = opts.subjects
      .map(function (e) {
        return '<option value="' + e[0] + '">' + e[1] + '</option>';
      })
      .join('');
    var topicsHTML = opts.topics
      .map(function (e) {
        return '<option value="' + e[0] + '">' + e[1] + '</option>';
      })
      .join('');

    el.innerHTML =
      '<div class="card">' +
      '<div class="history-header">' +
      '<h2>📊 Histórico</h2>' +
      '<div class="history-header-actions">' +
      '<button class="btn btn-outline btn-sm" id="btn-download-csv" aria-label="Baixar histórico em CSV">⬇️ CSV</button>' +
      '<button class="btn btn-danger btn-sm" id="btn-clear-history" aria-label="Limpar histórico">🗑️ Limpar</button>' +
      '</div>' +
      '</div>' +
      (contentSets.length > 1
        ? '<div class="history-period-filter"><label for="filter-content-set">📚 Qual histórico você quer ver?</label>' +
          '<select id="filter-content-set" class="history-select"><option value="">Todos os trimestres</option>' +
          contentSetsHTML +
          '</select></div>'
        : '') +
      '<div class="history-filters">' +
      '<input type="search" id="history-search" class="history-search" placeholder="🔍 Buscar..." aria-label="Buscar"/>' +
      '<select id="filter-subject" class="history-select" aria-label="Matéria"><option value="">Todas as matérias</option>' +
      subjectsHTML +
      '</select>' +
      '<select id="filter-topic"   class="history-select" aria-label="Assunto"><option value="">Todos os assuntos</option>' +
      topicsHTML +
      '</select>' +
      '<select id="filter-sort"    class="history-select" aria-label="Ordenar">' +
      '<option value="date-desc">Mais recente</option>' +
      '<option value="date-asc">Mais antigo</option>' +
      '<option value="pct-desc">Melhor nota</option>' +
      '<option value="pct-asc">Pior nota</option>' +
      '</select>' +
      '</div>' +
      '<p class="history-summary" id="history-summary" aria-live="polite"></p>' +
      '<div class="stats-row" id="stats-row"></div>' +
      '<div class="chart-wrap"><canvas id="history-chart"></canvas></div>' +
      '<div class="session-list" id="session-list"></div>' +
      '</div>';

    var searchEl = el.querySelector('#history-search');
    var subjectEl = el.querySelector('#filter-subject');
    var contentSetEl = el.querySelector('#filter-content-set');
    var topicEl = el.querySelector('#filter-topic');
    var sortEl = el.querySelector('#filter-sort');
    var clearBtn = el.querySelector('#btn-clear-history');
    var chartInstance = null;

    function applyFilters() {
      var q = normalize(searchEl.value);
      var subject = subjectEl.value;
      var contentSet = contentSetEl ? contentSetEl.value : '';
      var topic = topicEl.value;
      var sort = sortEl.value;

      var filtered = history.filter(function (item) {
        if (subject && (item.subject || extractSubjectLabel(item)) !== subject)
          return false;
        if (topic && (item.topicId || item.topic) !== topic) return false;
        if (contentSet && item.contentSetId !== contentSet) return false;
        if (q) {
          var hay = normalize(
            extractTopicLabel(item) +
              ' ' +
              extractSubjectLabel(item) +
              ' ' +
              (item.date || ''),
          );
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      if (sort === 'pct-desc')
        filtered = filtered.slice().sort(function (a, b) {
          return b.pct - a.pct;
        });
      if (sort === 'pct-asc')
        filtered = filtered.slice().sort(function (a, b) {
          return a.pct - b.pct;
        });
      if (sort === 'date-asc') filtered = filtered.slice().reverse();

      renderStats(filtered);
      renderChart(filtered);
      renderList(filtered);
    }

    function renderStats(filtered) {
      var summaryEl = el.querySelector('#history-summary');
      var statsEl = el.querySelector('#stats-row');
      if (!filtered.length) {
        statsEl.innerHTML = '';
        summaryEl.textContent =
          'Nenhuma sessão encontrada com os filtros aplicados.';
        return;
      }
      var avg = Math.round(
        filtered.reduce(function (s, i) {
          return s + i.pct;
        }, 0) / filtered.length,
      );
      var best = Math.max.apply(
        null,
        filtered.map(function (i) {
          return i.pct;
        }),
      );
      var totalQ = filtered.reduce(function (s, i) {
        return s + (i.total || 0);
      }, 0);
      var correct = filtered.reduce(function (s, i) {
        return s + (i.correct || 0);
      }, 0);
      summaryEl.textContent = filtered.length + ' sessão(ões) encontrada(s)';
      statsEl.innerHTML =
        '<div class="stat-card"><div class="stat-val">' +
        filtered.length +
        '</div><div class="stat-lbl">Sessões</div></div>' +
        '<div class="stat-card"><div class="stat-val">' +
        avg +
        '%</div><div class="stat-lbl">Média</div></div>' +
        '<div class="stat-card"><div class="stat-val">' +
        best +
        '%</div><div class="stat-lbl">Melhor nota</div></div>' +
        '<div class="stat-card"><div class="stat-val">' +
        correct +
        '/' +
        totalQ +
        '</div><div class="stat-lbl">Acertos totais</div></div>';
    }

    function renderChart(filtered) {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      var last15 = filtered.slice(0, 15).reverse();
      if (!last15.length) return;
      var canvas = el.querySelector('#history-chart');
      if (!canvas) return;
      chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels: last15.map(function (_, i) {
            return '#' + (i + 1);
          }),
          datasets: [
            {
              label: 'Nota (%)',
              data: last15.map(function (i) {
                return i.pct;
              }),
              borderColor: '#4F46E5',
              backgroundColor: 'rgba(79,70,229,0.08)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: last15.map(function (i) {
                return getGrade(i.pct).cls === 'grade-a'
                  ? '#10B981'
                  : '#4F46E5';
              }),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: {
                callback: function (v) {
                  return v + '%';
                },
              },
            },
          },
        },
      });
    }

    function renderList(filtered) {
      var listEl = el.querySelector('#session-list');
      if (!filtered.length) {
        listEl.innerHTML =
          '<div class="history-empty-filter">Nenhuma sessão corresponde aos filtros.</div>';
        return;
      }
      listEl.innerHTML = filtered
        .map(function (item) {
          var g = getGrade(item.pct);
          return (
            '<div class="session-card" role="article">' +
            '<div class="session-badge ' +
            g.cls +
            '">' +
            item.pct +
            '%</div>' +
            '<div class="session-info">' +
            '<div class="session-period">' +
            extractContentSetLabel(item) +
            '</div>' +
            '<div class="session-date">' +
            (item.date || '') +
            ' · ' +
            extractSubjectLabel(item) +
            '</div>' +
            '<div class="session-topic">' +
            extractTopicLabel(item) +
            '</div>' +
            '<div class="session-meta">' +
            item.correct +
            '/' +
            item.total +
            ' corretas · ' +
            durationLabel(item.durationSec) +
            (item.timedOutCount
              ? ' · ⏰ ' + item.timedOutCount + ' timeout'
              : '') +
            '</div>' +
            '</div>' +
            '<div class="session-side">' +
            '<div class="session-stars">' +
            g.stars +
            '</div>' +
            '<div class="session-level">' +
            g.label +
            '</div>' +
            '</div>' +
            '</div>'
          );
        })
        .join('');
    }

    [searchEl, contentSetEl, subjectEl, topicEl, sortEl]
      .filter(Boolean)
      .forEach(function (input) {
        input.addEventListener('input', applyFilters);
      });

    clearBtn.addEventListener('click', function () {
      if (
        !confirm(
          'Deseja limpar todo o histórico? Esta ação não pode ser desfeita.',
        )
      )
        return;
      Store.clearHistory();
      render(document.getElementById('main-content'));
    });

    var downloadBtn = el.querySelector('#btn-download-csv');
    downloadBtn.addEventListener('click', function () {
      downloadCSV(history);
    });

    applyFilters();
  }

  return { render: render };
})();
