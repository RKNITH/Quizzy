export const formatScore = (score) =>
  new Intl.NumberFormat('en-US').format(score || 0);

export const getTimerColor = (timeLeft, total) => {
  const ratio = timeLeft / total;
  if (ratio > 0.5) return '#34d399';  // green
  if (ratio > 0.25) return '#fbbf24'; // yellow
  return '#f87171';                   // red
};

export const getRankEmoji = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

export const getRankTitle = (rank) => {
  const titles = {
    Grandmaster: { color: '#fbbf24', icon: '👑' },
    Master: { color: '#a78bfa', icon: '⚔️' },
    Expert: { color: '#60a5fa', icon: '🔥' },
    Advanced: { color: '#34d399', icon: '⚡' },
    Intermediate: { color: '#fb923c', icon: '🎯' },
    Novice: { color: '#9ca3af', icon: '🌱' },
  };
  return titles[rank] || titles.Novice;
};

export const getCategoryIcon = (category) => {
  const icons = {
    Math: '🧮',
    GK: '🌍',
    Coding: '💻',
    Science: '🔬',
    History: '📜',
    Sports: '⚽',
    'AI-Generated': '🤖',
  };
  return icons[category] || '❓';
};

export const getCategoryColor = (category) => {
  const colors = {
    Math: 'from-blue-500 to-cyan-500',
    GK: 'from-green-500 to-emerald-500',
    Coding: 'from-purple-500 to-violet-500',
    Science: 'from-orange-500 to-amber-500',
    History: 'from-rose-500 to-pink-500',
    Sports: 'from-teal-500 to-green-500',
    'AI-Generated': 'from-indigo-500 to-purple-500',
  };
  return colors[category] || 'from-gray-500 to-slate-500';
};

export const getDifficultyColor = (difficulty) => {
  return {
    easy: 'text-emerald-400 bg-emerald-400/10',
    medium: 'text-amber-400 bg-amber-400/10',
    hard: 'text-rose-400 bg-rose-400/10',
    mixed: 'text-purple-400 bg-purple-400/10',
  }[difficulty] || 'text-gray-400 bg-gray-400/10';
};

export const calculateTimeTaken = (startTime) => {
  if (!startTime) return 0;
  return Math.round((Date.now() - startTime) / 1000);
};

export const truncate = (str, n = 60) =>
  str?.length > n ? str.slice(0, n) + '...' : str;

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
