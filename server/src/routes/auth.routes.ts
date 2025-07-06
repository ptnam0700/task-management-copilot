import express from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { validatePasswordStrength } from '../middlewares/password.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authRateLimiter, // Add rate limiting to prevent registration abuse
  [
    // Validation middleware
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validatePasswordStrength, // Add password strength validation
  UserController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter, // Add rate limiting to prevent brute force attacks
  [
    // Validation middleware
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please include a valid email'),
    body('password')
      .exists()
      .withMessage('Password is required'),
  ],
  UserController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, UserController.getProfile);

export default router;