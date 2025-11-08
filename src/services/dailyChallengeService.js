const { db } = require('../config/firebase');
const { POINTS, XP } = require('../config/constants');
const challengesData = require('../data/challenges.json');

class DailyChallengeService {
  /**
   * Get today's daily challenge
   */
  async getDailyChallenge(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if user already completed today
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      const lastCompleted = userData.lastDailyChallengeDate;
      const isCompleted = lastCompleted === today;
      
      // Get today's challenge (deterministic based on date)
      const challenge = this.getTodayChallenge(today);
      
      return {
        challenge: isCompleted ? null : challenge,
        isCompleted,
        streak: userData.streakDays || 0,
        nextChallengeIn: this.getTimeUntilMidnight(),
        rewards: {
          points: POINTS.DAILY_CHALLENGE,
          xp: XP.DAILY_CHALLENGE
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch daily challenge: ${error.message}`);
    }
  }

  /**
   * Get deterministic challenge for today
   */
  getTodayChallenge(dateString) {
    // Use date as seed for consistent daily challenge
    const seed = dateString.split('-').join('');
    const allChallenges = challengesData.phishing_detective;
    
    const index = parseInt(seed) % allChallenges.length;
    const challenge = allChallenges[index];
    
    // Remove answer from response
    const { correctAnswer, explanation, ...challengeData } = challenge;
    
    return {
      ...challengeData,
      date: dateString,
      timeLimit: 60 // 60 seconds
    };
  }

  /**
   * Complete daily challenge
   */
  async completeDailyChallenge(userId, answers) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already completed
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData.lastDailyChallengeDate === today) {
        throw new Error('Daily challenge already completed today');
      }
      
      // Get today's challenge and validate
      const allChallenges = challengesData.phishing_detective;
      const seed = today.split('-').join('');
      const index = parseInt(seed) % allChallenges.length;
      const challenge = allChallenges[index];
      
      // Check answer
      const answer = answers[0]; // Daily challenge is single question
      const isCorrect = challenge.correctAnswer === answer.userAnswer;
      
      const pointsEarned = isCorrect ? POINTS.DAILY_CHALLENGE : 0;
      const xpEarned = isCorrect ? XP.DAILY_CHALLENGE : 0;
      
      // Update user
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        lastDailyChallengeDate: today,
        totalPoints: userData.totalPoints + pointsEarned,
        dailyPoints: (userData.dailyPoints || 0) + pointsEarned,
        weeklyPoints: userData.weeklyPoints + pointsEarned,
        xp: userData.xp + xpEarned,
        lastActive: new Date().toISOString()
      });
      
      // Save completion record
      await db.collection('dailyChallengeCompletions').add({
        userId,
        date: today,
        challengeId: challenge.id,
        userAnswer: answer.userAnswer,
        isCorrect,
        pointsEarned,
        xpEarned,
        timeTaken: answer.timeTaken,
        completedAt: new Date().toISOString()
      });
      
      return {
        isCorrect,
        correctAnswer: challenge.correctAnswer,
        explanation: challenge.explanation,
        pointsEarned,
        xpEarned,
        newStreak: userData.streakDays + (isCorrect ? 0 : 0), // Streak updated separately
        redFlags: challenge.redFlags
      };
    } catch (error) {
      throw new Error(`Failed to complete daily challenge: ${error.message}`);
    }
  }

  /**
   * Get daily challenge status
   */
  async getDailyChallengeStatus(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      return {
        isCompleted: userData.lastDailyChallengeDate === today,
        streak: userData.streakDays || 0,
        lastCompleted: userData.lastDailyChallengeDate || null,
        nextChallengeIn: this.getTimeUntilMidnight()
      };
    } catch (error) {
      throw new Error(`Failed to fetch status: ${error.message}`);
    }
  }

  /**
   * Get milliseconds until midnight
   */
  getTimeUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow - now;
    const hours = Math.floor(msUntilMidnight / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
}

module.exports = new DailyChallengeService();