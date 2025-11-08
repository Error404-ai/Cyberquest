const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Register new user
 */
const signUp = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    const result = await authService.createUser(email, password, username);
    
    sendSuccess(res, 'User created successfully', result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const profile = await authService.getUserProfile(userId);
    
    sendSuccess(res, 'Profile fetched successfully', profile);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

/**
 * Delete user account
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    await authService.deleteUser(userId);
    
    sendSuccess(res, 'Account deleted successfully');
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  signUp,
  getProfile,
  deleteAccount
};
