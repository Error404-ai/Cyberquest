const achievementService = require('../services/achievement.service');
const { sendSuccess, sendError } = require('../utils/response.util');

/**
 * Get user's achievements
 */
const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const achievements = await achievementService.getUserAchievements(userId);
    
    sendSuccess(res, 'Achievements fetched successfully', achievements);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Get all available badges
 */
const getAllBadges = async (req, res) => {
  try {
    const badges = await achievementService.getAllBadges();
    
    sendSuccess(res, 'Badges fetched successfully', badges);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Check and unlock achievements
 */
const checkAchievements = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const unlockedAchievements = await achievementService.checkAndUnlock(userId);
    
    sendSuccess(res, 'Achievements checked', { 
      newlyUnlocked: unlockedAchievements 
    });
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  getUserAchievements,
  getAllBadges,
  checkAchievements
};
