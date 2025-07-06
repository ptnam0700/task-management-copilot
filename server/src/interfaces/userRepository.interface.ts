import { IBaseRepository } from './repository.interface';
import { IUser, IUserCreate } from './user.interface';

/**
 * User Repository Interface
 * Extends base repository with user-specific operations
 */
export interface IUserRepository extends IBaseRepository<IUser, number, IUserCreate> {
  /**
   * Find user by email
   * @param email User email
   * @returns Promise resolving to user or null if not found
   */
  findByEmail(email: string): Promise<IUser | null>;
  
  /**
   * Check if email exists
   * @param email User email
   * @returns Promise resolving to boolean indicating if email exists
   */
  emailExists(email: string): Promise<boolean>;
  
  /**
   * Check if username exists
   * @param username Username
   * @returns Promise resolving to boolean indicating if username exists
   */
  usernameExists(username: string): Promise<boolean>;
  
  /**
   * Find user by ID (without password hash)
   * @param id User ID
   * @returns Promise resolving to user without password hash or null if not found
   */
  findByIdSafe(id: number): Promise<Omit<IUser, 'password_hash'> | null>;
  
  /**
   * Change user password
   * @param userId User ID
   * @param newPassword New password (plain text)
   * @returns Promise resolving to boolean indicating success
   */
  changePassword(userId: number, newPassword: string): Promise<boolean>;
}