const gameService = require('../services/gameService');
const { sendSuccess, sendError } = require('../utils/response');

const getChallenges = async (req, res) => {
  try {
    const { gameType } = req.params;
    const { difficulty, count } = req.query;
    
    const challenges = await gameService.getChallenges(
      gameType,
      difficulty || 'easy',
      parseInt(count) || 5
    );
    
    sendSuccess(res, 'Challenges fetched successfully', challenges);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const submitGame = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { gameType, answers } = req.body;
    
    const result = await gameService.submitGame(userId, gameType, answers);
    
    sendSuccess(res, 'Game submitted successfully', result);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getGameHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit, gameType } = req.query;
    
    const history = await gameService.getGameHistory(
      userId,
      parseInt(limit) || 10,
      gameType || null
    );
    
    sendSuccess(res, 'Game history fetched successfully', history);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const stats = await gameService.getUserStats(userId);
    
    sendSuccess(res, 'Statistics fetched successfully', stats);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const analyzePasswordStrength = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return sendError(res, 'Password is required', 400);
    }
    
    const { calculatePasswordStrength, estimateCrackTime } = require('../utils/scoring');
    
    const score = calculatePasswordStrength(password);
    const crackTime = estimateCrackTime(password);
    
    // Determine strength level
    let strength = 'weak';
    if (score >= 80) strength = 'strong';
    else if (score >= 60) strength = 'medium';
    
    // Generate feedback
    const feedback = [];
    if (password.length < 12) feedback.push('Increase length to 12+ characters');
    if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
    if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
    if (!/[0-9]/.test(password)) feedback.push('Add numbers');
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters');
    if (/123|abc|password/i.test(password)) feedback.push('Avoid common patterns');
    
    sendSuccess(res, 'Password analyzed successfully', {
      password: password.replace(/./g, '*'), // Hide actual password
      score,
      strength,
      crackTime,
      feedback
    });
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

// Add to module.exports
module.exports = {
  getChallenges,
  submitGame,
  getGameHistory,
  getStats,
  analyzePasswordStrength  
};