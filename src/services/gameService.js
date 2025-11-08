const { db, admin } = require('../config/firebase');
const { POINTS, XP, GAME_TYPES } = require('../config/constants');
const { calculatePoints, calculateXP } = require('../utils/scoring');
const challengesData = require('../data/challenges.json');

class GameService {

  async getChallenges(gameType, difficulty = 'easy', count = 5) {
    try {
      const gameChallenges = challengesData[gameType];

      if (!gameChallenges) {
        throw new Error('Invalid game type');
      }

      const filteredChallenges = gameChallenges.filter(
        c => c.difficulty === difficulty
      );

      const shuffled = filteredChallenges.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);

      return selected.map(({ correctAnswer, explanation, ...challenge }) => challenge);
    } catch (error) {
      throw new Error(`Failed to fetch challenges: ${error.message}`);
    }
  }

  async submitGame(userId, gameType, answers) {
    try {
      const gameChallenges = challengesData[gameType];
      let correctCount = 0;
      let totalQuestions = answers.length;
      const results = [];

      // Calculate score
      answers.forEach(answer => {
        const challenge = gameChallenges.find(c => c.id === answer.questionId);
        
        if (!challenge) {
          results.push({
            questionId: answer.questionId,
            correct: false,
            correctAnswer: null,
            explanation: 'Question not found'
          });
          return;
        }

        const isCorrect = challenge.correctAnswer === answer.userAnswer;
        if (isCorrect) correctCount++;

        results.push({
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          correct: isCorrect,
          correctAnswer: challenge.correctAnswer,
          explanation: challenge.explanation,
          timeTaken: answer.timeTaken,
          redFlags: challenge.redFlags || [],
          missedFlags: !isCorrect ? (challenge.redFlags || []) : []
        });
      });

      const accuracy = (correctCount / totalQuestions) * 100;
      const pointsEarned = calculatePoints(correctCount, totalQuestions, gameType);
      const xpEarned = calculateXP(correctCount, totalQuestions);

      // Update user stats
      await this.updateUserStats(userId, pointsEarned, xpEarned, gameType, correctCount);

      // Save game session
      const sessionData = {
        userId,
        gameType,
        results,
        correctCount,
        totalQuestions,
        accuracy,
        pointsEarned,
        xpEarned,
        completedAt: new Date().toISOString()
      };

      const sessionRef = await db.collection('gameSessions').add(sessionData);

      // Check for achievements
      await this.checkGameAchievements(userId, accuracy, gameType);

      return {
        sessionId: sessionRef.id,
        results,
        score: {
          correctCount,
          totalQuestions,
          accuracy: accuracy.toFixed(2),
          pointsEarned,
          xpEarned
        }
      };
    } catch (error) {
      throw new Error(`Failed to submit game: ${error.message}`);
    }
  }

  /**
   * Update user statistics
   */
  async updateUserStats(userId, points, xp, gameType, correctCount) {
    const userRef = db.collection('users').doc(userId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const newTotalPoints = userData.totalPoints + points;
      const newXP = userData.xp + xp;
      
      // Calculate new level
      const newLevel = this.calculateLevel(newXP);

      // Update achievement counters
      const achievementKey = this.getAchievementKey(gameType);
      const newAchievements = {
        ...userData.achievements,
        [achievementKey]: (userData.achievements[achievementKey] || 0) + correctCount,
        games_played: (userData.achievements.games_played || 0) + 1
      };

      transaction.update(userRef, {
        totalPoints: newTotalPoints,
        dailyPoints: (userData.dailyPoints || 0) + points,
        weeklyPoints: userData.weeklyPoints + points,
        xp: newXP,
        level: newLevel,
        achievements: newAchievements,
        lastActive: new Date().toISOString()
      });
    });
  }

  /**
   * Calculate user level from XP
   */
  calculateLevel(xp) {
    const { LEVELS } = require('../config/constants');
    
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        return LEVELS[i].level;
      }
    }
    return 1;
  }

  /**
   * Get achievement key for game type
   */
  getAchievementKey(gameType) {
    const mapping = {
      phishing_detective: 'phishing_detected',
      password_strength: 'passwords_created',
      url_inspector: 'urls_inspected'
    };
    return mapping[gameType] || 'games_played';
  }

  /**
   * Check for perfect score achievement
   */
  async checkGameAchievements(userId, accuracy, gameType) {
    if (accuracy === 100) {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        'achievements.perfect_scores': admin.firestore.FieldValue.increment(1)
      });
    }
  }

  /**
   * Get user's game history - FIXED VERSION
   */
  async getGameHistory(userId, limit = 10, gameType = null) {
    try {
      console.log(`Fetching game history for user: ${userId}, gameType: ${gameType}, limit: ${limit}`);
      
      // Build query step by step
      let query = db.collection('gameSessions')
        .where('userId', '==', userId);

      // Add gameType filter BEFORE orderBy if provided
      if (gameType) {
        query = query.where('gameType', '==', gameType);
      }

      // Add orderBy and limit
      query = query
        .orderBy('completedAt', 'desc')
        .limit(limit);

      // Execute query with timeout
      const snapshot = await Promise.race([
        query.get(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 10000)
        )
      ]);
      
      console.log(`Found ${snapshot.size} game sessions`);

      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching game history:', error);
      
      // Check if it's an index error
      if (error.code === 9 || error.message.includes('index')) {
        console.error('Firestore index required!');
        console.error('Create index at: https://console.firebase.google.com/project/_/firestore/indexes');
        
        // Fallback: Get all sessions for user and filter in memory
        try {
          console.log('Attempting fallback query without orderBy...');
          const fallbackQuery = db.collection('gameSessions')
            .where('userId', '==', userId)
            .limit(50); // Get more for sorting

          const snapshot = await fallbackQuery.get();
          
          let sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Filter by gameType if needed
          if (gameType) {
            sessions = sessions.filter(s => s.gameType === gameType);
          }

          // Sort by completedAt in memory
          sessions.sort((a, b) => 
            new Date(b.completedAt) - new Date(a.completedAt)
          );

          // Return limited results
          return sessions.slice(0, limit);
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          throw new Error('Failed to fetch game history. Please check Firestore indexes.');
        }
      }
      
      throw new Error(`Failed to fetch game history: ${error.message}`);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      console.log(`Fetching stats for user: ${userId}`);
      
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      // Get game-specific stats with timeout
      const sessionsSnapshot = await Promise.race([
        db.collection('gameSessions')
          .where('userId', '==', userId)
          .get(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 10000)
        )
      ]);

      const gameStats = {
        totalGames: sessionsSnapshot.size,
        byType: {},
        averageAccuracy: 0
      };

      let totalAccuracy = 0;

      sessionsSnapshot.docs.forEach(doc => {
        const session = doc.data();
        
        if (!gameStats.byType[session.gameType]) {
          gameStats.byType[session.gameType] = {
            played: 0,
            totalCorrect: 0,
            totalQuestions: 0
          };
        }

        gameStats.byType[session.gameType].played++;
        gameStats.byType[session.gameType].totalCorrect += session.correctCount;
        gameStats.byType[session.gameType].totalQuestions += session.totalQuestions;
        
        totalAccuracy += session.accuracy;
      });

      gameStats.averageAccuracy = sessionsSnapshot.size > 0 
        ? (totalAccuracy / sessionsSnapshot.size).toFixed(2) 
        : 0;

      console.log(`Stats fetched successfully: ${gameStats.totalGames} games`);

      return {
        user: {
          level: userData.level,
          xp: userData.xp,
          totalPoints: userData.totalPoints,
          weeklyPoints: userData.weeklyPoints,
          streakDays: userData.streakDays
        },
        achievements: userData.achievements,
        games: gameStats
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }
  }
}

module.exports = new GameService();