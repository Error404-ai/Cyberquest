const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  verifyToken,
  validate(schemas.updateProfile),
  userController.updateProfile
);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Public
 */
router.get(
  '/:userId',
  userController.getUserById
);

/**
 * @route   POST /api/users/streak
 * @desc    Update user streak
 * @access  Private
 */
router.post(
  '/streak',
  verifyToken,
  userController.updateStreak
);

module.exports = router;
