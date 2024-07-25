module.exports = function getRatingColor(rating) {
  const green = Math.min(255, Math.floor((rating - 1) * 63.75));
  const red = Math.min(255, Math.floor((5 - rating) * 63.75));
  return `rgb(${red}, ${green}, 0)`;
};
