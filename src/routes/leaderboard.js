const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/leaderboard/global
 * @desc    Get global leaderboard
 * @access  Public
 */
router.get(
  '/global',
  optionalAuth,
  leaderboardController.getGlobalLeaderboard
);

/**
 * @route   GET /api/leaderboard/rank
 * @desc    Get user's rank
 * @access  Private
 */
router.get(
  '/rank',
  verifyToken,
  leaderboardController.getUserRank
);

/**
 * @route   GET /api/leaderboard/community/:communityId
 * @desc    Get community leaderboard
 * @access  Public
 */
router.get(
  '/community/:communityId',
  leaderboardController.getCommunityLeaderboard
);

module.exports = router;
