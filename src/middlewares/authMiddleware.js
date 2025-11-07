const { auth } = require('../config/firebase');
const { sendError } = require('../utils/response.util');

/**
 * Verify Firebase ID token from request header
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Unauthorized: No token provided', 401);
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify token with Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return sendError(res, 'Unauthorized: Invalid token', 401);
  }
};

/**
 * Optional auth - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
    }

    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};

module.exports = { verifyToken, optionalAuth };
