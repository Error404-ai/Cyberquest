const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validate, schemas } = require('../middlewares/validations');
const { gameLimiter } = require('../middlewares/rateLimit');

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
