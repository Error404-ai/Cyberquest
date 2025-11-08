const analyticsService = require('../services/analyticsService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get user analytics and statistics
 */
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const analytics = await analyticsService.getUserAnalytics(userId);
    
    sendSuccess(res, 'Analytics fetched successfully', analytics);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Get streak calendar data
 */
const getStreakCalendar = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { year, month } = req.query;
    
    const calendar = await analyticsService.getStreakCalendar(
      userId,
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1
    );
    
    sendSuccess(res, 'Streak calendar fetched', calendar);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  getUserAnalytics,
  getStreakCalendar
};