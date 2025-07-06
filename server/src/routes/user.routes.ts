import express from 'express';
import { body, param } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validatePasswordStrength } from '../middlewares/password.middleware';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get(
  '/',
  protect,
  authorize('admin'),
  UserController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin or self)
 * @access  Private
 */
router.get(
  '/:id',
  protect,
  param('id').isInt().withMessage('User ID must be an integer'),
  UserController.getProfile
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (self or admin)
 */
router.put(
  '/:id',
  protect,
  [
    param('id').isInt().withMessage('User ID must be an integer'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please include a valid email'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin')
  ],
  UserController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (self or admin)
 */
router.delete(
  '/:id',
  protect,
  param('id').isInt().withMessage('User ID must be an integer'),
  UserController.deleteUser
);

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  protect,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
  ],
  validatePasswordStrength,
  UserController.changePassword
);

export default router;