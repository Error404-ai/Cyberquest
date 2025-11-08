const express = require('express');
const router = express.Router();
const dailyChallengeController = require('../controllers/dailyChallengeController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/challenges/daily
 * @desc    Get today's daily challenge
 * @access  Private
 */
router.get(
  '/daily',
  verifyToken,
  dailyChallengeController.getDailyChallenge
);

/**
 * @route   POST /api/challenges/daily/complete
 * @desc    Complete daily challenge
 * @access  Private
 */
router.post(
  '/daily/complete',
  verifyToken,
  dailyChallengeController.completeDailyChallenge
);

/**
 * @route   GET /api/challenges/daily/status
 * @desc    Get daily challenge status
 * @access  Private
 */
router.get(
  '/daily/status',
  verifyToken,
  dailyChallengeController.getDailyChallengeStatus
);

module.exports = router;