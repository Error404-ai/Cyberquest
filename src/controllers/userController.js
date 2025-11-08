const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const updates = req.body;
    
    const result = await authService.updateProfile(userId, updates);
    
    sendSuccess(res, 'Profile updated successfully', result);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await authService.getUserProfile(userId);
    
    // Remove sensitive information for public view
    delete user.email;
    delete user.achievements;
    
    sendSuccess(res, 'User fetched successfully', user);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Update user streak
 */
const updateStreak = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Implementation for streak update logic
    // This would typically check last login and increment/reset streak
    
    sendSuccess(res, 'Streak updated successfully');
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  updateProfile,
  getUserById,
  updateStreak
};
