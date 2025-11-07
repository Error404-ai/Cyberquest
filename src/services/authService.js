const { auth, db } = require('../config/firebase');
const { POINTS, XP } = require('../config/constants');

class AuthService {
  /**
   * Create new user in Firebase Auth and Firestore
   */
  async createUser(email, password, username) {
    try {
      // Check if username exists
      const usernameQuery = await db.collection('users')
        .where('username', '==', username)
        .get();

      if (!usernameQuery.empty) {
        throw new Error('Username already taken');
      }

      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: username
      });

      // Create user document in Firestore
      const userData = {
        uid: userRecord.uid,
        email: email,
        username: username,
        displayName: username,
        photoURL: null,
        bio: '',
        totalPoints: 0,
        weeklyPoints: 0,
        level: 1,
        xp: 0,
        badges: [],
        achievements: {
          phishing_detected: 0,
          passwords_created: 0,
          urls_inspected: 0,
          perfect_scores: 0,
          games_played: 0
        },
        streakDays: 0,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      return {
        uid: userRecord.uid,
        email: email,
        username: username
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      return userDoc.data();
    } catch (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    try {
      const allowedUpdates = ['username', 'displayName', 'photoURL', 'bio'];
      const filteredUpdates = {};

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      filteredUpdates.updatedAt = new Date().toISOString();

      await db.collection('users').doc(userId).update(filteredUpdates);

      return { message: 'Profile updated successfully' };
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId) {
    try {
      // Delete from Firebase Auth
      await auth.deleteUser(userId);

      // Delete from Firestore
      await db.collection('users').doc(userId).delete();

      // Delete user's game sessions
      const sessions = await db.collection('gameSessions')
        .where('userId', '==', userId)
        .get();

      const batch = db.batch();
      sessions.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      return { message: 'Account deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
