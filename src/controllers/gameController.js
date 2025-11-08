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

module.exports = {
  getChallenges,
  submitGame,
  getGameHistory,
  getStats
};