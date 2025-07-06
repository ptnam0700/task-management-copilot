import { IUser, IUserCreate } from '../interfaces/user.interface';
import { UserRepository } from '../repositories/userRepository';
import bcrypt from 'bcryptjs';

/**
 * User model for database operations
 * Acts as a facade for the underlying repository
 */
export class User {
  private static repository: UserRepository = new UserRepository();

  /**
   * Create a new user
   * @param userData User data to create
   * @returns Created user object without password
   */
  static async create(userData: IUserCreate): Promise<Omit<IUser, 'password_hash'>> {
    const user = await this.repository.create(userData);
    
    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Find a user by email
   * @param email User email
   * @returns User object or null if not found
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    return this.repository.findByEmail(email);
  }
  
  /**
   * Find a user by ID
   * @param id User ID
   * @returns User object without password hash or null if not found
   */
  static async findById(id: number): Promise<Omit<IUser, 'password_hash'> | null> {
    return this.repository.findByIdSafe(id);
  }
  
  /**
   * Check if a user with the given email already exists
   * @param email User email
   * @returns Boolean indicating if the email is already in use
   */
  static async emailExists(email: string): Promise<boolean> {
    return this.repository.emailExists(email);
  }
  
  /**
   * Check if a user with the given username already exists
   * @param username Username
   * @returns Boolean indicating if the username is already in use
   */
  static async usernameExists(username: string): Promise<boolean> {
    return this.repository.usernameExists(username);
  }

  /**
   * Update user information
   * @param id User ID
   * @param userData User data to update
   * @returns Updated user without password hash or null if not found
   */
  static async update(
    id: number, 
    userData: Partial<IUser>
  ): Promise<Omit<IUser, 'password_hash'> | null> {
    const updatedUser = await this.repository.update(id, userData);
    
    if (!updatedUser) return null;
    
    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Boolean indicating if deletion was successful
   */
  static async delete(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }

  /**
   * Find all users with optional filtering
   * @param filter Optional filter criteria
   * @returns Array of users (without password hashes)
   */
  static async findAll(filter?: Partial<IUser>): Promise<Omit<IUser, 'password_hash'>[]> {
    const users = await this.repository.findAll(filter);
    
    // Remove password hashes from all users
    return users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Change user password
   * @param userId User ID
   * @param currentPassword Current password (for verification)
   * @param newPassword New password
   * @returns Boolean indicating if password change was successful
   * @throws ApiError if current password is incorrect
   */
  static async changePassword(
    userId: number, 
    currentPassword: string, 
    newPassword: string
  ): Promise<boolean> {
    // Verify current password
    const user = await this.repository.findById(userId);
    if (!user) {
      return false;
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }
    
    // Change password
    return this.repository.changePassword(userId, newPassword);
  }
}