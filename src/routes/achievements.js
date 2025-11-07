const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievement.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/achievements
 * @desc    Get user's achievements
 * @access  Private
 */
router.get(
  '/',
  verifyToken,
  achievementController.getUserAchievements
);

/**
 * @route   GET /api/achievements/badges
 * @desc    Get all available badges
 * @access  Public
 */
router.get(
  '/badges',
  achievementController.getAllBadges
);

/**
 * @route   POST /api/achievements/check
 * @desc    Check and unlock achievements
 * @access  Private
 */
router.post(
  '/check',
  verifyToken,
  achievementController.checkAchievements
);

module.exports = router;
