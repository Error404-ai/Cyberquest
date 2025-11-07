const { POINTS, XP } = require('../config/constants');

/**
 * Calculate points earned from game
 */
const calculatePoints = (correctCount, totalQuestions, gameType) => {
  const basePoints = correctCount * POINTS.CORRECT_ANSWER;
  const accuracy = (correctCount / totalQuestions) * 100;

  // Bonus for high accuracy
  let bonus = 0;
  if (accuracy === 100) {
    bonus = POINTS.STREAK_BONUS;
  } else if (accuracy >= 80) {
    bonus = 50;
  }

  return basePoints + bonus;
};

/**
 * Calculate XP earned from game
 */
const calculateXP = (correctCount, totalQuestions) => {
  const baseXP = correctCount * XP.CORRECT_ANSWER;
  const accuracy = (correctCount / totalQuestions) * 100;

  // Bonus for high accuracy
  let bonus = 0;
  if (accuracy === 100) {
    bonus = XP.STREAK_BONUS;
  } else if (accuracy >= 80) {
    bonus = 25;
  }

  return baseXP + bonus;
};

/**
 * Calculate password strength score
 */
const calculatePasswordStrength = (password) => {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 20;

  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;

  // Penalize common patterns
  if (/123|abc|qwe/i.test(password)) score -= 20;
  if (/^[a-zA-Z]+$/.test(password)) score -= 10;

  return Math.max(0, Math.min(100, score));
};

/**
 * Estimate password crack time
 */
const estimateCrackTime = (password) => {
  const charsetSize = getCharsetSize(password);
  const combinations = Math.pow(charsetSize, password.length);
  const attemptsPerSecond = 1e9; // 1 billion attempts/sec
  const seconds = combinations / attemptsPerSecond;

  return formatTime(seconds);
};

/**
 * Get character set size for password
 */
const getCharsetSize = (password) => {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 33;
  return size;
};

/**
 * Format time duration
 */
const formatTime = (seconds) => {
  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return `${Math.ceil(seconds)} seconds`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.ceil(seconds / 86400)} days`;
  return `${Math.ceil(seconds / 31536000).toLocaleString()} years`;
};

module.exports = {
  calculatePoints,
  calculateXP,
  calculatePasswordStrength,
  estimateCrackTime,
  getCharsetSize,
  formatTime
};
