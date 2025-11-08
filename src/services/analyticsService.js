const { db } = require('../config/firebase');

class AnalyticsService {
  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      
      // Get game sessions for skill breakdown
      const sessionsSnapshot = await db.collection('gameSessions')
        .where('userId', '==', userId)
        .get();
      
      // Calculate skill scores
      const skillScores = this.calculateSkillScores(sessionsSnapshot.docs, userData);
      
      // Calculate overall security score (weighted average)
      const overallScore = Math.round(
        (skillScores.phishing * 0.3) +
        (skillScores.passwords * 0.3) +
        (skillScores.urls * 0.25) +
        (skillScores.awareness * 0.15)
      );
      
      // Get community average for comparison
      const communityAverage = await this.getCommunityAverage();
      
      // Determine strengths and weaknesses
      const { strengths, weaknesses } = this.analyzeSkills(skillScores);
      
      return {
        overallScore,
        skillRadar: skillScores,
        strengths,
        weaknesses,
        communityAverage,
        percentile: this.calculatePercentile(overallScore, communityAverage),
        gamesPlayed: sessionsSnapshot.size,
        totalPoints: userData.totalPoints,
        level: userData.level,
        streakDays: userData.streakDays
      };
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }

  /**
   * Calculate skill scores from game sessions
   */
  calculateSkillScores(sessions, userData) {
    const scores = {
      phishing: 0,
      passwords: 0,
      urls: 0,
      awareness: 0
    };
    
    const counts = {
      phishing: 0,
      passwords: 0,
      urls: 0
    };
    
    sessions.forEach(doc => {
      const session = doc.data();
      const accuracy = session.accuracy;
      
      switch (session.gameType) {
        case 'phishing_detective':
          scores.phishing += accuracy;
          counts.phishing++;
          break;
        case 'password_strength':
          scores.passwords += accuracy;
          counts.passwords++;
          break;
        case 'url_inspector':
          scores.urls += accuracy;
          counts.urls++;
          break;
      }
    });
    
    // Calculate averages
    scores.phishing = counts.phishing > 0 
      ? Math.round(scores.phishing / counts.phishing) 
      : 50;
    scores.passwords = counts.passwords > 0 
      ? Math.round(scores.passwords / counts.passwords) 
      : 50;
    scores.urls = counts.urls > 0 
      ? Math.round(scores.urls / counts.urls) 
      : 50;
    
    // Awareness is based on streak and badges
    const streakScore = Math.min((userData.streakDays || 0) * 10, 50);
    const badgeScore = Math.min((userData.badges?.length || 0) * 5, 50);
    scores.awareness = Math.round((streakScore + badgeScore) / 2);
    
    return scores;
  }

  /**
   * Get community average score
   */
  async getCommunityAverage() {
    try {
      const usersSnapshot = await db.collection('users').get();
      
      if (usersSnapshot.empty) return 70;
      
      let totalScore = 0;
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        // Rough estimate based on level and points
        const score = Math.min(40 + (data.level * 3) + (data.totalPoints / 100), 100);
        totalScore += score;
      });
      
      return Math.round(totalScore / usersSnapshot.size);
    } catch (error) {
      return 70; // Default if calculation fails
    }
  }

  /**
   * Analyze strengths and weaknesses
   */
  analyzeSkills(skillScores) {
    const skills = [
      { name: 'Phishing Detection', score: skillScores.phishing },
      { name: 'Password Security', score: skillScores.passwords },
      { name: 'URL Inspection', score: skillScores.urls },
      { name: 'Security Awareness', score: skillScores.awareness }
    ];
    
    // Sort by score
    skills.sort((a, b) => b.score - a.score);
    
    return {
      strengths: skills.slice(0, 2).map(s => s.name),
      weaknesses: skills.slice(-2).map(s => s.name)
    };
  }

  /**
   * Calculate user's percentile
   */
  calculatePercentile(userScore, average) {
    // Simplified percentile calculation
    if (userScore >= average + 20) return 90;
    if (userScore >= average + 10) return 75;
    if (userScore >= average) return 60;
    if (userScore >= average - 10) return 40;
    return 25;
  }

  /**
   * Get streak calendar for a specific month
   */
  async getStreakCalendar(userId, year, month) {
    try {
      // Get all daily challenge completions for the month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const completionsSnapshot = await db.collection('dailyChallengeCompletions')
        .where('userId', '==', userId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .get();
      
      const completedDates = new Set();
      completionsSnapshot.docs.forEach(doc => {
        completedDates.add(doc.data().date);
      });
      
      // Generate calendar data
      const daysInMonth = new Date(year, month, 0).getDate();
      const calendar = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendar.push({
          date,
          completed: completedDates.has(date)
        });
      }
      
      return {
        year,
        month,
        days: calendar,
        totalCompleted: completedDates.size
      };
    } catch (error) {
      throw new Error(`Failed to fetch streak calendar: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsService();