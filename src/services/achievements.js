const { db } = require('../config/firebase');
const { ACHIEVEMENTS } = require('../config/constants');
const badgesData = require('../data/badges.json');

class AchievementService {
  /**
   * Get user's unlocked achievements
   */
  async getUserAchievements(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const unlockedBadges = userData.badges || [];
      
      // Get detailed badge information
      const achievements = unlockedBadges.map(badgeId => {
        const badge = badgesData.find(b => b.id === badgeId);
        return badge || null;
      }).filter(Boolean);

      // Calculate overall progress
      const totalBadges = badgesData.length;
      const progress = (unlockedBadges.length / totalBadges * 100).toFixed(1);

      return {
        unlocked: achievements,
        total: totalBadges,
        progress: parseFloat(progress),
        recentlyUnlocked: achievements.slice(-3) // Last 3 unlocked
      };
    } catch (error) {
      throw new Error(`Failed to fetch achievements: ${error.message}`);
    }
  }

  /**
   * Get all available badges with lock status
   */
  async getAllBadges() {
    try {
      return badgesData.map(badge => ({
        ...badge,
        locked: true // Client will compare with user's unlocked badges
      }));
    } catch (error) {
      throw new Error(`Failed to fetch badges: ${error.message}`);
    }
  }

  /**
   * Check if user qualifies for new achievements
   */
  async checkAndUnlock(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentBadges = userData.badges || [];
      const achievements = userData.achievements || {};
      const newlyUnlocked = [];

      // Check each badge criteria
      for (const badge of badgesData) {
        // Skip if already unlocked
        if (currentBadges.includes(badge.id)) {
          continue;
        }

        // Check unlock criteria
        let unlocked = false;

        switch (badge.id) {
          case 'first_steps':
            unlocked = achievements.games_played >= 1;
            break;
          
          case 'phishing_detective':
            unlocked = achievements.phishing_detected >= 10;
            break;
          
          case 'password_pro':
            unlocked = achievements.passwords_created >= 5;
            break;
          
          case 'url_guardian':
            unlocked = achievements.urls_inspected >= 20;
            break;
          
          case 'week_warrior':
            unlocked = userData.streakDays >= 7;
            break;
          
          case 'perfect_score':
            unlocked = achievements.perfect_scores >= 3;
            break;
          
          case 'century_club':
            unlocked = userData.totalPoints >= 100;
            break;
          
          case 'helping_hand':
            unlocked = achievements.community_helps >= 5;
            break;
          
          case 'level_10':
            unlocked = userData.level >= 10;
            break;
          
          case 'security_champion':
            unlocked = userData.level >= 20;
            break;

          default:
            unlocked = false;
        }

        // Unlock badge if criteria met
        if (unlocked) {
          currentBadges.push(badge.id);
          newlyUnlocked.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            rarity: badge.rarity
          });
        }
      }

      // Update user document if new badges unlocked
      if (newlyUnlocked.length > 0) {
        await db.collection('users').doc(userId).update({
          badges: currentBadges,
          updatedAt: new Date().toISOString()
        });
      }

      return newlyUnlocked;
    } catch (error) {
      throw new Error(`Failed to check achievements: ${error.message}`);
    }
  }

  /**
   * Get badge details by ID
   */
  async getBadgeById(badgeId) {
    try {
      const badge = badgesData.find(b => b.id === badgeId);
      
      if (!badge) {
        throw new Error('Badge not found');
      }

      return badge;
    } catch (error) {
      throw new Error(`Failed to fetch badge: ${error.message}`);
    }
  }

  /**
   * Get achievement progress for user
   */
  async getAchievementProgress(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const achievements = userData.achievements || {};

      return {
        phishing_detected: {
          current: achievements.phishing_detected || 0,
          required: 10,
          badge: 'phishing_detective'
        },
        passwords_created: {
          current: achievements.passwords_created || 0,
          required: 5,
          badge: 'password_pro'
        },
        urls_inspected: {
          current: achievements.urls_inspected || 0,
          required: 20,
          badge: 'url_guardian'
        },
        perfect_scores: {
          current: achievements.perfect_scores || 0,
          required: 3,
          badge: 'perfect_score'
        },
        streak_days: {
          current: userData.streakDays || 0,
          required: 7,
          badge: 'week_warrior'
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch progress: ${error.message}`);
    }
  }
}

module.exports = new AchievementService();
