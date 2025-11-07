const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { gameLimiter } = require('../middleware/rateLimit.middleware');

/**
 * @route   GET /api/games/:gameType/challenges
 * @desc    Get challenges for a game type
 * @access  Public
 */
router.get(
  '/:gameType/challenges',
  gameController.getChallenges
);

/**
 * @route   POST /api/games/submit
 * @desc    Submit game answers
 * @access  Private
 */
router.post(
  '/submit',
  verifyToken,
  gameLimiter,
  validate(schemas.gameSubmission),
  gameController.submitGame
);

/**
 * @route   GET /api/games/history
 * @desc    Get user's game history
 * @access  Private
 */
router.get(
  '/history',
  verifyToken,
  gameController.getGameHistory
);

/**
 * @route   GET /api/games/stats
 * @desc    Get user's game statistics
 * @access  Private
 */
router.get(
  '/stats',
  verifyToken,
  gameController.getStats
);

module.exports = router;
