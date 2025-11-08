const authService = require('../services/authService');
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
  const userId = req.user.uid;
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  
  const lastActive = new Date(userData.lastActive);
  const now = new Date();
  const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
  
  let newStreak = userData.streakDays || 0;
  
  if (daysDiff === 1) {
    newStreak++;
  } else if (daysDiff > 1) {
    newStreak = 1;
  }
  
  await userRef.update({
    streakDays: newStreak,
    lastActive: now.toISOString()
  });
  
  sendSuccess(res, 'Streak updated', { streakDays: newStreak });
};

module.exports = {
  updateProfile,
  getUserById,
  updateStreak
};
