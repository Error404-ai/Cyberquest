const authService = require('../services/authService');
const { db } = require('../config/firebase');
const { sendSuccess, sendError } = require('../utils/response');

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

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await authService.getUserProfile(userId);
    delete user.email;
    delete user.achievements;
    
    sendSuccess(res, 'User fetched successfully', user);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const updateStreak = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return sendError(res, 'User not found', 404);
    }
    
    const userData = userDoc.data();
    
    const lastActive = new Date(userData.lastActive);
    const now = new Date();
    
    // Reset hours to compare only dates
    lastActive.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    
    let newStreak = userData.streakDays || 0;
    
    if (daysDiff === 1) {
      // Consecutive day
      newStreak++;
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = 1;
    }
    // If daysDiff === 0, same day, no change
    
    await userRef.update({
      streakDays: newStreak,
      lastActive: new Date().toISOString()
    });
    
    sendSuccess(res, 'Streak updated', { 
      streakDays: newStreak,
      wasReset: daysDiff > 1
    });
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  updateProfile,
  getUserById,
  updateStreak
};