const leaderboardService = require('../services/leaderboard.service');
const { sendSuccess, sendError } = require('../utils/response.util');

/**
 * Get global leaderboard
 */
const getGlobalLeaderboard = async (req, res) => {
  try {
    const { timeframe, limit } = req.query;
    
    const leaderboard = await leaderboardService.getGlobalLeaderboard(
      timeframe || 'all-time',
      parseInt(limit) || 100
    );
    
    sendSuccess(res, 'Leaderboard fetched successfully', leaderboard);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Get user's rank
 */
const getUserRank = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { timeframe } = req.query;
    
    const rank = await leaderboardService.getUserRank(userId, timeframe || 'all-time');
    
    sendSuccess(res, 'Rank fetched successfully', rank);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Get community leaderboard
 */
const getCommunityLeaderboard = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { limit } = req.query;
    
    const leaderboard = await leaderboardService.getCommunityLeaderboard(
      communityId,
      parseInt(limit) || 50
    );
    
    sendSuccess(res, 'Community leaderboard fetched successfully', leaderboard);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  getGlobalLeaderboard,
  getUserRank,
  getCommunityLeaderboard
};
