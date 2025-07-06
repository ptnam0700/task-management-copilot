import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiError } from '../utils/error.utils';
import { IUser, IUserCreate, IUserLogin } from '../interfaces/user.interface';
import { UserRepository } from '../repositories/userRepository';
import { validatePassword } from '../utils/password.utils';
import { generateTokens, verifyToken } from '../utils/jwt.utils';

/**
 * User Service
 * Handles business logic for user operations including authentication
 */
export class UserService {
  private repository: UserRepository;

  /**
   * Create a new UserService instance
   */
  constructor() {
    this.repository = new UserRepository();
  }

  /**
   * Register a new user
   * @param userData User data for registration
   * @returns Created user (without password) and tokens
   * @throws ApiError if validation fails or email/username exists
   */
  async register(userData: IUserCreate): Promise<{ user: Omit<IUser, 'password_hash'>, accessToken: string, refreshToken: string }> {
    try {
      // Additional validation can be added here
      if (!userData.email || !userData.username || !userData.password) {
        throw ApiError.badRequest('Email, username and password are required', 'MISSING_REQUIRED_FIELDS');
      }

      // Check if email exists
      const emailExists = await this.repository.emailExists(userData.email);
      if (emailExists) {
        throw ApiError.badRequest('Email is already in use', 'EMAIL_EXISTS');
      }

      // Check if username exists
      const usernameExists = await this.repository.usernameExists(userData.username);
      if (usernameExists) {
        throw ApiError.badRequest('Username is already in use', 'USERNAME_EXISTS');
      }

      // Validate password
      validatePassword(userData.password);

      // Create user
      const newUser = await this.repository.create(userData);

      // Generate tokens
      const tokens = generateTokens({
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      });

      // Return user without password and tokens
      const { password_hash, ...userWithoutPassword } = newUser;
      
      return {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in register:', error);
      throw new ApiError('Error registering user', 500);
    }
  }

  /**
   * Login a user
   * @param loginData User login credentials
   * @returns User (without password) and tokens
   * @throws ApiError if login fails
   */
  async login(loginData: IUserLogin): Promise<{ user: Omit<IUser, 'password_hash'>, accessToken: string, refreshToken: string }> {
    try {
      const { email, password } = loginData;

      // Check if user exists
      const user = await this.repository.findByEmail(email);
      if (!user) {
        throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
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
      
      return {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in login:', error);
      throw new ApiError('Error logging in user', 500);
    }
  }

  /**
   * Get user profile by ID
   * @param userId User ID
   * @returns User (without password) or null if not found
   */
  async getUserById(userId: number): Promise<Omit<IUser, 'password_hash'> | null> {
    try {
      return await this.repository.findByIdSafe(userId);
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  /**
   * Get all users (with optional filtering)
   * @param filter Optional filter criteria
   * @returns Array of users (without passwords)
   */
  async getAllUsers(filter?: Partial<IUser>): Promise<Omit<IUser, 'password_hash'>[]> {
    try {
      const users = await this.repository.findAll(filter);
      
      // Ensure password hashes are not returned
      return users.map(user => {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param userId User ID
   * @param userData User data to update
   * @param currentUserId ID of the user making the request (for authorization)
   * @param isAdmin Whether the requesting user is an admin
   * @returns Updated user (without password) or null if not found
   * @throws ApiError if user is not authorized or validation fails
   */
  async updateUser(
    userId: number, 
    userData: Partial<IUser>,
    currentUserId: number,
    isAdmin: boolean = false
  ): Promise<Omit<IUser, 'password_hash'> | null> {
    try {
      // Check if user exists
      const existingUser = await this.repository.findById(userId);
      if (!existingUser) {
        return null;
      }

      // Authorization check: Only self or admin can update
      if (userId !== currentUserId && !isAdmin) {
        throw ApiError.forbidden('You are not authorized to update this profile', 'FORBIDDEN');
      }

      // Check email uniqueness if updating email
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await this.repository.emailExists(userData.email);
        if (emailExists) {
          throw ApiError.badRequest('Email is already in use', 'EMAIL_EXISTS');
        }
      }

      // Check username uniqueness if updating username
      if (userData.username && userData.username !== existingUser.username) {
        const usernameExists = await this.repository.usernameExists(userData.username);
        if (usernameExists) {
          throw ApiError.badRequest('Username is already in use', 'USERNAME_EXISTS');
        }
      }

      // Prevent role escalation (only admins can change roles)
      if (userData.role && !isAdmin) {
        delete userData.role;
      }

      // Update user
      const updatedUser = await this.repository.update(userId, userData);
      if (!updatedUser) {
        return null;
      }

      // Return user without password
      const { password_hash, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in updateUser:', error);
      throw new ApiError('Error updating user', 500);
    }
  }

  /**
   * Delete user account
   * @param userId User ID to delete
   * @param currentUserId ID of the user making the request (for authorization)
   * @param isAdmin Whether the requesting user is an admin
   * @returns Boolean indicating if deletion was successful
   * @throws ApiError if user is not authorized
   */
  async deleteUser(
    userId: number,
    currentUserId: number,
    isAdmin: boolean = false
  ): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.repository.findById(userId);
      if (!existingUser) {
        return false;
      }

      // Authorization check: Only self or admin can delete
      if (userId !== currentUserId && !isAdmin) {
        throw ApiError.forbidden('You are not authorized to delete this account', 'FORBIDDEN');
      }

      // Delete user
      return await this.repository.delete(userId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in deleteUser:', error);
      throw new ApiError('Error deleting user', 500);
    }
  }

  /**
   * Change user password
   * @param userId User ID
   * @param currentPassword Current password (for verification)
   * @param newPassword New password
   * @returns Boolean indicating if password change was successful
   * @throws ApiError if current password is incorrect or validation fails
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // Get user with password hash
      const user = await this.repository.findById(userId);
      if (!user) {
        throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        throw ApiError.badRequest('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
      }

      // Validate new password
      validatePassword(newPassword);

      // Check that new password is different from current
      if (currentPassword === newPassword) {
        throw ApiError.badRequest('New password must be different from current password', 'PASSWORD_SAME');
      }

      // Update password
      return await this.repository.changePassword(userId, newPassword);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in changePassword:', error);
      throw new ApiError('Error changing password', 500);
    }
  }

  /**
   * Initiate password reset (generate token and store in DB)
   * @param email User email
   * @returns Boolean indicating if reset was initiated
   * Note: In a real application, this would send an email with the reset token
   */
  async initiatePasswordReset(email: string): Promise<{ success: boolean, resetToken?: string }> {
    try {
      // Check if user exists
      const user = await this.repository.findByEmail(email);
      if (!user) {
        // For security reasons, don't reveal that the email doesn't exist
        return { success: true };
      }

      // Generate reset token (32 bytes converted to hex string = 64 chars)
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // In a real application, you would:
      // 1. Hash the token and store it in the database with an expiration
      // 2. Send an email to the user with a link containing the token
      
      // For demonstration purposes, we'll return the token
      // In production, you would never return this directly to the client
      return { success: true, resetToken };
    } catch (error) {
      console.error('Error in initiatePasswordReset:', error);
      throw new ApiError('Error initiating password reset', 500);
    }
  }

  /**
   * Reset password using token
   * @param resetToken Password reset token
   * @param newPassword New password
   * @returns Boolean indicating if password was reset successfully
   * Note: In a real application, this would verify a token stored in DB
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<boolean> {
    try {
      // In a real application, you would:
      // 1. Verify that the reset token exists in the database and hasn't expired
      // 2. Get the associated user
      // 3. Update the password
      // 4. Delete the used reset token
      
      // For demonstration purposes, we'll just return success
      // In a real implementation, this would use an actual token from the database
      
      // Validate new password
      validatePassword(newPassword);
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in resetPassword:', error);
      throw new ApiError('Error resetting password', 500);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken Refresh token
   * @returns New access token or null if refresh token is invalid
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      // Verify refresh token
      const payload = verifyToken(refreshToken, true);
      if (!payload) {
        return null;
      }

      // Check if user still exists
      const user = await this.repository.findById(payload.id);
      if (!user) {
        return null;
      }

      // Generate new access token
      const tokens = generateTokens({
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      return tokens.accessToken;
    } catch (error) {
      console.error('Error in refreshAccessToken:', error);
      throw new ApiError('Error refreshing access token', 500);
    }
  }
}