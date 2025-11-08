const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');        
const userRoutes = require('./userRoutes');        
const gameRoutes = require('./gameRoutes');       
const leaderboardRoutes = require('./leaderboard'); 
const achievementRoutes = require('./achievements'); 

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CyberQuest API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/games', gameRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/achievements', achievementRoutes);

module.exports = router;