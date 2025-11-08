const dailyChallengeService = require('../services/dailyChallengeService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get today's daily challenge
 */
const getDailyChallenge = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const challenge = await dailyChallengeService.getDailyChallenge(userId);
    
    sendSuccess(res, 'Daily challenge fetched successfully', challenge);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Complete daily challenge
 */
const completeDailyChallenge = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { answers } = req.body;
    
    const result = await dailyChallengeService.completeDailyChallenge(userId, answers);
    
    sendSuccess(res, 'Daily challenge completed', result);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Get daily challenge status
 */
const getDailyChallengeStatus = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const status = await dailyChallengeService.getDailyChallengeStatus(userId);
    
    sendSuccess(res, 'Status fetched successfully', status);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  getDailyChallenge,
  completeDailyChallenge,
  getDailyChallengeStatus
};