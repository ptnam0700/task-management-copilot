import { query, transaction } from '../config/database';
import { ApiError } from '../utils/error.utils';
import { IUser, IUserCreate } from '../interfaces/user.interface';
import { IUserRepository } from '../interfaces/userRepository.interface';
import bcrypt from 'bcryptjs';
import { validatePassword } from '../utils/password.utils';

/**
 * PostgreSQL implementation of the User Repository
 */
export class UserRepository implements IUserRepository {
  /**
   * Find a user by ID
   * @param id User ID
   * @returns User object or null if not found
   */
  async findById(id: number): Promise<IUser | null> {
    try {
      const result = await query(
        `SELECT * FROM users WHERE user_id = $1`,
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw new ApiError('Error finding user by ID', 500);
    }
  }

  /**
   * Find a user by ID (without password hash)
   * @param id User ID
   * @returns User object without password hash or null if not found
   */
  async findByIdSafe(id: number): Promise<Omit<IUser, 'password_hash'> | null> {
    try {
      const result = await query(
        `SELECT user_id, username, email, created_at, role 
         FROM users 
         WHERE user_id = $1`,
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in findByIdSafe:', error);
      throw new ApiError('Error finding user by ID', 500);
    }
  }

  /**
   * Find a user by email
   * @param email User email
   * @returns User object or null if not found
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const result = await query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw new ApiError('Error finding user by email', 500);
    }
  }

  /**
   * Create a new user
   * @param userData User data to create
   * @returns Created user object
   */
  async create(userData: IUserCreate): Promise<IUser> {
    try {
      // Validate user data
      this.validateUserData(userData);
      
      // Check if email already exists
      const emailExists = await this.emailExists(userData.email);
      if (emailExists) {
        throw ApiError.badRequest('Email is already in use', 'EMAIL_EXISTS');
      }
      
      // Check if username already exists
      const usernameExists = await this.usernameExists(userData.username);
      if (usernameExists) {
        throw ApiError.badRequest('Username is already in use', 'USERNAME_EXISTS');
      }
      
      // Validate password
      validatePassword(userData.password);
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const result = await query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userData.username, userData.email, password_hash, userData.role || 'user']
      );
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in create:', error);
      throw new ApiError('Error creating user', 500);
    }
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param userData User data to update
   * @returns Updated user object or null if not found
   */
  async update(id: number, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      // Check if user exists
      const existingUser = await this.findById(id);
      if (!existingUser) {
        return null;
      }
      
      // Build update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (userData.username) {
        // Check if new username is taken by another user
        if (userData.username !== existingUser.username) {
          const usernameExists = await this.usernameExists(userData.username);
          if (usernameExists) {
            throw ApiError.badRequest('Username is already in use', 'USERNAME_EXISTS');
          }
        }
        updates.push(`username = $${paramCount++}`);
        values.push(userData.username);
      }
      
      if (userData.email) {
        // Check if new email is taken by another user
        if (userData.email !== existingUser.email) {
          const emailExists = await this.emailExists(userData.email);
          if (emailExists) {
            throw ApiError.badRequest('Email is already in use', 'EMAIL_EXISTS');
          }
        }
        updates.push(`email = $${paramCount++}`);
        values.push(userData.email);
      }
      
      if (userData.role) {
        updates.push(`role = $${paramCount++}`);
        values.push(userData.role);
      }
      
      // If nothing to update
      if (updates.length === 0) {
        return existingUser;
      }
      
      // Add user_id to values
      values.push(id);
      
      const result = await query(
        `UPDATE users
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE user_id = $${paramCount}
         RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in update:', error);
      throw new ApiError('Error updating user', 500);
    }
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Boolean indicating if deletion was successful
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query(
        `DELETE FROM users WHERE user_id = $1 RETURNING user_id`,
        [id]
      );
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw new ApiError('Error deleting user', 500);
    }
  }

  /**
   * Find all users (optionally filtered)
   * @param filter Optional filter criteria
   * @returns Array of users matching filter criteria
   */
  async findAll(filter?: Partial<IUser>): Promise<IUser[]> {
    try {
      let queryText = `SELECT user_id, username, email, created_at, role FROM users`;
      const values: any[] = [];
      let paramCount = 1;
      
      // Build WHERE clause if filters are provided
      if (filter && Object.keys(filter).length > 0) {
        const conditions: string[] = [];
        
        if (filter.username) {
          conditions.push(`username LIKE $${paramCount++}`);
          values.push(`%${filter.username}%`);
        }
        
        if (filter.email) {
          conditions.push(`email LIKE $${paramCount++}`);
          values.push(`%${filter.email}%`);
        }
        
        if (filter.role) {
          conditions.push(`role = $${paramCount++}`);
          values.push(filter.role);
        }
        
        if (conditions.length > 0) {
          queryText += ` WHERE ${conditions.join(' AND ')}`;
        }
      }
      
      queryText += ` ORDER BY created_at DESC`;
      
      const result = await query(queryText, values);
      
      return result.rows;
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new ApiError('Error finding users', 500);
    }
  }

  /**
   * Check if a user with the given email already exists
   * @param email User email
   * @returns Boolean indicating if the email is already in use
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const result = await query(
        `SELECT COUNT(*) FROM users WHERE email = $1`,
        [email]
      );
      
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error in emailExists:', error);
      throw new ApiError('Error checking email existence', 500);
    }
  }

  /**
   * Check if a user with the given username already exists
   * @param username Username
   * @returns Boolean indicating if the username is already in use
   */
  async usernameExists(username: string): Promise<boolean> {
    try {
      const result = await query(
        `SELECT COUNT(*) FROM users WHERE username = $1`,
        [username]
      );
      
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error in usernameExists:', error);
      throw new ApiError('Error checking username existence', 500);
    }
  }

  /**
   * Change user password
   * @param userId User ID
   * @param newPassword New password (plain text)
   * @returns Boolean indicating if password change was successful
   */
  async changePassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      // Validate password
      validatePassword(newPassword);
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      
      const result = await query(
        `UPDATE users
         SET password_hash = $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING user_id`,
        [password_hash, userId]
      );
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in changePassword:', error);
      throw new ApiError('Error changing password', 500);
    }
  }

  /**
   * Validate user data
   * @param userData User data to validate
   * @throws ApiError if validation fails
   */
  private validateUserData(userData: IUserCreate): void {
    // Validate username
    if (!userData.username || userData.username.trim().length < 3) {
      throw ApiError.badRequest('Username must be at least 3 characters long', 'INVALID_USERNAME');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      throw ApiError.badRequest('Please provide a valid email address', 'INVALID_EMAIL');
    }
    
    // Validate role if provided
    if (userData.role && !['user', 'admin'].includes(userData.role)) {
      throw ApiError.badRequest('Role must be either "user" or "admin"', 'INVALID_ROLE');
    }
  }
}