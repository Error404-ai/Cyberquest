const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/analytics
 * @desc    Get user analytics and statistics
 * @access  Private
 */
router.get(
  '/',
  verifyToken,
  analyticsController.getUserAnalytics
);

/**
 * @route   GET /api/analytics/streak-calendar
 * @desc    Get streak calendar data
 * @access  Private
 */
router.get(
  '/streak-calendar',
  verifyToken,
  analyticsController.getStreakCalendar
);

module.exports = router;