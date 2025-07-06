import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import { generateTokens } from '../utils/jwt.utils';

const router = express.Router();

/**
 * @route   GET /api/test/public
 * @desc    Test public route (no auth required)
 * @access  Public
 */
router.get('/public', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Public route works!',
    user: req.user || null
  });
});

/**
 * @route   GET /api/test/protected
 * @desc    Test protected route (auth required)
 * @access  Private
 */
router.get('/protected', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected route works!',
    user: req.user
  });
});

/**
 * @route   GET /api/test/admin
 * @desc    Test admin route (auth + admin role required)
 * @access  Private/Admin
 */
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin route works!',
    user: req.user
  });
});

/**
 * @route   POST /api/test/token
 * @desc    Get test token for authentication testing
 * @access  Public
 */
router.post('/token', (req, res) => {
  const { role } = req.body;
  
  // Create a mock user for testing
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: role || 'user' // Allow role to be specified for testing purposes
  };
  
  // Generate tokens
  const tokens = generateTokens(mockUser);
  
  res.status(200).json({
    success: true,
    message: 'Test tokens generated',
    data: tokens
  });
});

export default router;