const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/signup',
  authLimiter,
  validate(schemas.signUp),
  authController.signUp
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  verifyToken,
  authController.getProfile
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/account',
  verifyToken,
  authController.deleteAccount
);

module.exports = router;
