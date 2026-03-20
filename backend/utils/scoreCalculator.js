/**
 * Calculate score for a correct answer with time bonus
 * @param {number} basePoints - Base points for the question
 * @param {number} timeTaken - Time taken in seconds
 * @param {number} totalTime - Total time allowed in seconds
 * @param {boolean} usedDoubleScore - Whether double score power-up was used
 * @returns {number} Calculated score
 */
export const calculateScore = (basePoints, timeTaken, totalTime, usedDoubleScore = false) => {
  if (timeTaken < 0 || timeTaken > totalTime) return 0;

  // Time bonus: faster answers get more points (up to 50% bonus)
  const timeRatio = 1 - timeTaken / totalTime;
  const timeBonus = Math.round(basePoints * 0.5 * timeRatio);
  const total = basePoints + timeBonus;

  return usedDoubleScore ? total * 2 : total;
};

/**
 * Calculate leaderboard rankings
 */
export const calculateRankings = (participants) => {
  return participants
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((p, index) => ({ ...p, rank: index + 1 }));
};
