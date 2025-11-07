const { db, realtimeDb } = require('../config/firebase');

class LeaderboardService {
  /**
   * Get global leaderboard with rankings
   */
  async getGlobalLeaderboard(timeframe = 'all-time', limit = 100) {
    try {
      let pointsField = 'totalPoints';
      
      // Determine which points field to use based on timeframe
      if (timeframe === 'weekly') {
        pointsField = 'weeklyPoints';
      } else if (timeframe === 'daily') {
        pointsField = 'dailyPoints';
      }

      // Query users sorted by points
      const usersSnapshot = await db.collection('users')
        .orderBy(pointsField, 'desc')
        .limit(limit)
        .get();

      const leaderboard = [];
      let rank = 1;

      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        leaderboard.push({
          rank: rank++,
          userId: doc.id,
          username: userData.username,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          points: userData[pointsField],
          level: userData.level,
          badges: userData.badges.length,
          lastActive: userData.lastActive
        });
      });

      return {
        timeframe,
        updated: new Date().toISOString(),
        entries: leaderboard
      };
    } catch (error) {
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }
  }

  /**
   * Get user's rank in leaderboard
   */
  async getUserRank(userId, timeframe = 'all-time') {
    try {
      let pointsField = 'totalPoints';
      
      if (timeframe === 'weekly') {
        pointsField = 'weeklyPoints';
      } else if (timeframe === 'daily') {
        pointsField = 'dailyPoints';
      }

      // Get user's data
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const userPoints = userData[pointsField];

      // Count users with more points
      const higherRankedSnapshot = await db.collection('users')
        .where(pointsField, '>', userPoints)
        .get();

      const rank = higherRankedSnapshot.size + 1;

      // Get total user count for percentile
      const totalUsersSnapshot = await db.collection('users').count().get();
      const totalUsers = totalUsersSnapshot.data().count;
      
      const percentile = ((totalUsers - rank) / totalUsers * 100).toFixed(1);

      return {
        rank,
        points: userPoints,
        totalUsers,
        percentile: parseFloat(percentile),
        timeframe
      };
    } catch (error) {
      throw new Error(`Failed to fetch user rank: ${error.message}`);
    }
  }

  /**
   * Get community/team leaderboard
   */
  async getCommunityLeaderboard(communityId, limit = 50) {
    try {
      const usersSnapshot = await db.collection('users')
        .where('communityId', '==', communityId)
        .orderBy('totalPoints', 'desc')
        .limit(limit)
        .get();

      const leaderboard = [];
      let rank = 1;

      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        leaderboard.push({
          rank: rank++,
          userId: doc.id,
          username: userData.username,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          points: userData.totalPoints,
          level: userData.level
        });
      });

      return {
        communityId,
        entries: leaderboard
      };
    } catch (error) {
      throw new Error(`Failed to fetch community leaderboard: ${error.message}`);
    }
  }

  /**
   * Update real-time leaderboard (called after score updates)
   */
  async updateRealtimeLeaderboard(userId, username, points) {
    try {
      // Update in Realtime Database for live updates
      const leaderboardRef = realtimeDb.ref('leaderboard/global');
      
      await leaderboardRef.child(userId).set({
        username,
        points,
        timestamp: Date.now()
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to update realtime leaderboard:', error);
      // Don't throw - this is non-critical
      return { success: false };
    }
  }

  /**
   * Reset weekly points (to be called via cron job)
   */
  async resetWeeklyPoints() {
    try {
      const usersSnapshot = await db.collection('users').get();
      
      const batch = db.batch();
      usersSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { weeklyPoints: 0 });
      });

      await batch.commit();

      return { message: 'Weekly points reset successfully' };
    } catch (error) {
      throw new Error(`Failed to reset weekly points: ${error.message}`);
    }
  }
}

module.exports = new LeaderboardService();
