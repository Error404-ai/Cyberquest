module.exports = {
  // Point values
  POINTS: {
    CORRECT_ANSWER: 50,
    LEARNING_BONUS: 10,
    STREAK_BONUS: 100,
    DAILY_CHALLENGE: 200,
    ACHIEVEMENT_UNLOCK: 500,
    COMMUNITY_HELP: 75
  },

  // XP values
  XP: {
    CORRECT_ANSWER: 20,
    LEARNING_BONUS: 5,
    STREAK_BONUS: 50,
    DAILY_CHALLENGE: 100,
    ACHIEVEMENT_UNLOCK: 200
  },

  // Game types
  GAME_TYPES: {
    PHISHING_DETECTIVE: 'phishing_detective',
    PASSWORD_STRENGTH: 'password_strength',
    URL_INSPECTOR: 'url_inspector'
  },

  // Achievement IDs
  ACHIEVEMENTS: {
    FIRST_STEPS: 'first_steps',
    PHISHING_DETECTIVE: 'phishing_detective',
    PASSWORD_PRO: 'password_pro',
    URL_GUARDIAN: 'url_guardian',
    WEEK_WARRIOR: 'week_warrior',
    PERFECT_SCORE: 'perfect_score'
  },

  // Level thresholds
  LEVELS: [
    { level: 1, xpRequired: 0, title: 'Security Novice' },
    { level: 2, xpRequired: 100, title: 'Security Novice' },
    { level: 3, xpRequired: 250, title: 'Security Novice' },
    { level: 4, xpRequired: 450, title: 'Security Novice' },
    { level: 5, xpRequired: 700, title: 'Security Novice' },
    { level: 6, xpRequired: 1000, title: 'Aware User' },
    { level: 7, xpRequired: 1400, title: 'Aware User' },
    { level: 8, xpRequired: 1900, title: 'Aware User' },
    { level: 9, xpRequired: 2500, title: 'Aware User' },
    { level: 10, xpRequired: 3200, title: 'Aware User' },
    { level: 11, xpRequired: 4000, title: 'Security Conscious' }
  ]
};
