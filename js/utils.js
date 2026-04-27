const GRADE_THRESHOLDS = [
  { min: 90, cls: 'grade-a', stars: '⭐⭐⭐⭐⭐', label: 'Excelente',       msg: 'Excelente! Você é incrível! 🏆' },
  { min: 75, cls: 'grade-b', stars: '⭐⭐⭐⭐',   label: 'Muito bom',       msg: 'Muito bem! Continue assim! 🥇' },
  { min: 60, cls: 'grade-c', stars: '⭐⭐⭐',     label: 'Bom',             msg: 'Bom trabalho! Quase lá! 🥈' },
  { min: 40, cls: 'grade-d', stars: '⭐⭐',       label: 'Regular',         msg: 'Está melhorando! Continue estudando! 📚' },
  { min:  0, cls: 'grade-f', stars: '⭐',         label: 'Precisa revisar', msg: 'Não desista! Você vai conseguir! 💪' },
];

function getGrade(pct) {
  return GRADE_THRESHOLDS.find(function(g) { return pct >= g.min; });
}

function resolveTopicLabel(state) {
  if (state.selectedTopic === 'all') {
    var info = state.selectedSubject ? QuestionsDB.getSubjectInfo(state.selectedSubject) : null;
    return (info ? info.name : 'Todos os Temas') + ' — Todos os Assuntos';
  }
  var info = QuestionsDB.getTopicInfo(state.selectedTopic);
  return info ? info.name : state.selectedTopic;
}

(function () {
  var TOAST_DURATION = 3500;
  function showToast(msg, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.setAttribute('role', 'alert');
    toast.textContent = msg;
    container.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('toast-visible'); });
    setTimeout(function() {
      toast.classList.remove('toast-visible');
      toast.addEventListener('transitionend', function() { toast.remove(); }, { once: true });
    }, TOAST_DURATION);
  }
  window.showToast = showToast;
})();
