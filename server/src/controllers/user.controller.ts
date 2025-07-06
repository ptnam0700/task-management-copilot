import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { ApiError } from '../utils/error.utils';
import { generateTokens } from '../utils/jwt.utils';
import { IUserCreate, IUserLogin } from '../interfaces/user.interface';

/**
 * User Controller
 */
export class UserController {
  /**
   * @route   POST /api/auth/register
   * @desc    Register a new user
   * @access  Public
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.badRequest('Validation error', 'VALIDATION_ERROR', errors.array()));
        return;
      }

      const userData: IUserCreate = req.body;

      // Create the user (validation is handled in the repository)
      const newUser = await User.create(userData);

      // Generate tokens
      const tokens = generateTokens({
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: newUser,
          ...tokens
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/login
   * @desc    Login user and return JWT token
   * @access  Public
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        next(ApiError.badRequest('Validation error', 'VALIDATION_ERROR', errors.array()));
        return;
      }

      const { email, password }: IUserLogin = req.body;

      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        next(ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS'));
        return;
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        next(ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS'));
        return;
      }

      // Generate tokens
      const tokens = generateTokens({
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      // Return user without password and tokens
      const { password_hash, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          ...tokens
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/auth/me
   * @desc    Get current user profile
   * @access  Private
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        next(ApiError.notFound('User not found', 'USER_NOT_FOUND'));
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/users/:id
   * @desc    Update user profile
   * @access  Private (self or admin)
   */
  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      // Authorization check: Only self or admin can update
      if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
        next(ApiError.forbidden('You are not authorized to update this profile', 'FORBIDDEN'));
        return;
      }
      
      // Update user
      const updatedUser = await User.update(userId, req.body);
      
      if (!updatedUser) {
        next(ApiError.notFound('User not found', 'USER_NOT_FOUND'));
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/users/change-password
   * @desc    Change user password
   * @access  Private
   */
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        next(ApiError.unauthorized('Not authorized', 'NOT_AUTHORIZED'));
        return;
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        next(ApiError.badRequest('Current password and new password are required', 'MISSING_FIELDS'));
        return;
      }
      
      // Change password
      const success = await User.changePassword(req.user.id, currentPassword, newPassword);
      
      if (!success) {
        next(ApiError.badRequest('Failed to change password', 'PASSWORD_CHANGE_FAILED'));
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Current password is incorrect') {
        next(ApiError.badRequest('Current password is incorrect', 'INVALID_CURRENT_PASSWORD'));
      } else {
        next(error);
      }
    }
  }

  /**
   * @route   GET /api/users
   * @desc    Get all users (admin only)
   * @access  Private/Admin
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        next(ApiError.forbidden('Admin access required', 'ADMIN_REQUIRED'));
        return;
      }

      // Extract query parameters for filtering
      const filter: Record<string, any> = {};
      if (req.query.username) filter.username = req.query.username as string;
      if (req.query.email) filter.email = req.query.email as string;
      if (req.query.role) filter.role = req.query.role as string;

      const users = await User.findAll(filter);
      
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   DELETE /api/users/:id
   * @desc    Delete user (self or admin)
   * @access  Private
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      // Authorization check: Only self or admin can delete
      if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
        next(ApiError.forbidden('You are not authorized to delete this user', 'FORBIDDEN'));
        return;
      }
      
      // Delete user
      const success = await User.delete(userId);
      
      if (!success) {
        next(ApiError.notFound('User not found', 'USER_NOT_FOUND'));
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}