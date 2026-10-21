module.exports = function totalPoints(items) {
  return items.map((item) => (item.correct ? 5 : 0)).reduce((a, b) => a + b);
};
