import bcrypt from 'bcryptjs';
import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repositories/userRepository';
import { ApiError } from '../../src/utils/error.utils';
import { IUser, IUserCreate, IUserLogin } from '../../src/interfaces/user.interface';
import * as jwtUtils from '../../src/utils/jwt.utils';
import * as passwordUtils from '../../src/utils/password.utils';

// Mock the dependencies
jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/utils/jwt.utils');
jest.mock('../../src/utils/password.utils');
jest.mock('bcryptjs');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  
  // Mock data
  const mockUser: IUser = {
    user_id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashedpassword123',
    created_at: new Date('2023-01-01'),
    role: 'user'
  };
  
  const mockUserCreate: IUserCreate = {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'Password123!',
    role: 'user'
  };
  
  const mockUserLogin: IUserLogin = {
    email: 'test@example.com',
    password: 'Password123!'
  };
  
  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of UserService for each test
    userService = new UserService();
    
    // Get the mocked UserRepository instance
    mockUserRepository = UserRepository.prototype as jest.Mocked<UserRepository>;
    
    // Setup default mock implementations
    (jwtUtils.generateTokens as jest.Mock).mockReturnValue(mockTokens);
    (passwordUtils.validatePassword as jest.Mock).mockImplementation(() => true);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.usernameExists.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.register(mockUserCreate);
      
      // Assert
      expect(result).toEqual({
        user: {
          user_id: mockUser.user_id,
          username: mockUser.username,
          email: mockUser.email,
          created_at: mockUser.created_at,
          role: mockUser.role
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken
      });
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(mockUserCreate.email);
      expect(mockUserRepository.usernameExists).toHaveBeenCalledWith(mockUserCreate.username);
      expect(mockUserRepository.create).toHaveBeenCalledWith(mockUserCreate);
      expect(jwtUtils.generateTokens).toHaveBeenCalledWith({
        id: mockUser.user_id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      });
    });

    it('should throw error if required fields are missing', async () => {
      // Arrange
      const incompleteUser = { username: 'test' } as IUserCreate;
      
      // Act & Assert
      await expect(userService.register(incompleteUser))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      mockUserRepository.emailExists.mockResolvedValue(true);
      
      // Act & Assert
      await expect(userService.register(mockUserCreate))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if username already exists', async () => {
      // Arrange
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.usernameExists.mockResolvedValue(true);
      
      // Act & Assert
      await expect(userService.register(mockUserCreate))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if password validation fails', async () => {
      // Arrange
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.usernameExists.mockResolvedValue(false);
      (passwordUtils.validatePassword as jest.Mock).mockImplementation(() => {
        throw new ApiError('Invalid password', 400);
      });
      
      // Act & Assert
      await expect(userService.register(mockUserCreate))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.login(mockUserLogin);
      
      // Assert
      expect(result).toEqual({
        user: {
          user_id: mockUser.user_id,
          username: mockUser.username,
          email: mockUser.email,
          created_at: mockUser.created_at,
          role: mockUser.role
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUserLogin.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockUserLogin.password, mockUser.password_hash);
      expect(jwtUtils.generateTokens).toHaveBeenCalledWith({
        id: mockUser.user_id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      });
    });

    it('should throw error if user does not exist', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.login(mockUserLogin))
        .rejects.toThrow(ApiError);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtUtils.generateTokens).not.toHaveBeenCalled();
    });

    it('should throw error if password is incorrect', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      // Act & Assert
      await expect(userService.login(mockUserLogin))
        .rejects.toThrow(ApiError);
      expect(jwtUtils.generateTokens).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user by id without password_hash', async () => {
      // Arrange
      mockUserRepository.findByIdSafe.mockResolvedValue({
        user_id: mockUser.user_id,
        username: mockUser.username,
        email: mockUser.email,
        created_at: mockUser.created_at,
        role: mockUser.role
      });
      
      // Act
      const result = await userService.getUserById(mockUser.user_id);
      
      // Assert
      expect(result).toEqual({
        user_id: mockUser.user_id,
        username: mockUser.username,
        email: mockUser.email,
        created_at: mockUser.created_at,
        role: mockUser.role
      });
      expect(mockUserRepository.findByIdSafe).toHaveBeenCalledWith(mockUser.user_id);
    });

    it('should return null if user not found', async () => {
      // Arrange
      mockUserRepository.findByIdSafe.mockResolvedValue(null);
      
      // Act
      const result = await userService.getUserById(999);
      
      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findByIdSafe).toHaveBeenCalledWith(999);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without password_hash', async () => {
      // Arrange
      const secondUser = { ...mockUser, user_id: 2, email: 'user2@example.com', username: 'user2' };
      mockUserRepository.findAll.mockResolvedValue([mockUser, secondUser]);
      
      // Act
      const result = await userService.getAllUsers();
      
      // Assert
      expect(result).toEqual([
        {
          user_id: mockUser.user_id,
          username: mockUser.username,
          email: mockUser.email,
          created_at: mockUser.created_at,
          role: mockUser.role
        },
        {
          user_id: secondUser.user_id,
          username: secondUser.username,
          email: secondUser.email,
          created_at: secondUser.created_at,
          role: secondUser.role
        }
      ]);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });

    it('should apply filter when provided', async () => {
      // Arrange
      const filter = { role: 'admin' };
      mockUserRepository.findAll.mockResolvedValue([{ ...mockUser, role: 'admin' }]);
      
      // Act
      const result = await userService.getAllUsers(filter);
      
      // Assert
      expect(result.length).toBe(1);
      expect(result[0].role).toBe('admin');
      expect(mockUserRepository.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully when user is updating own profile', async () => {
      // Arrange
      const userId = 1;
      const updateData = { username: 'updateduser' };
      const updatedUser = { ...mockUser, ...updateData };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.usernameExists.mockResolvedValue(false);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      
      // Act
      const result = await userService.updateUser(userId, updateData, userId);
      
      // Assert
      expect(result).toEqual({
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.email,
        created_at: updatedUser.created_at,
        role: updatedUser.role
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should allow admin to update other user profiles', async () => {
      // Arrange
      const userId = 2;
      const adminId = 1;
      const updateData = { username: 'updateduser' };
      const updatedUser = { ...mockUser, user_id: 2, ...updateData };
      
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, user_id: 2 });
      mockUserRepository.usernameExists.mockResolvedValue(false);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      
      // Act
      const result = await userService.updateUser(userId, updateData, adminId, true);
      
      // Assert
      expect(result).not.toBeNull();
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should return null if user not found', async () => {
      // Arrange
      const userId = 999;
      const updateData = { username: 'updateduser' };
      
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await userService.updateUser(userId, updateData, userId);
      
      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if user is not authorized to update profile', async () => {
      // Arrange
      const userId = 2;
      const currentUserId = 1;
      const updateData = { username: 'updateduser' };
      
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, user_id: userId });
      
      // Act & Assert
      await expect(userService.updateUser(userId, updateData, currentUserId, false))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if updated email already exists', async () => {
      // Arrange
      const userId = 1;
      const updateData = { email: 'existing@example.com' };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.emailExists.mockResolvedValue(true);
      
      // Act & Assert
      await expect(userService.updateUser(userId, updateData, userId))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if updated username already exists', async () => {
      // Arrange
      const userId = 1;
      const updateData = { username: 'existinguser' };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.usernameExists.mockResolvedValue(true);
      
      // Act & Assert
      await expect(userService.updateUser(userId, updateData, userId))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should not allow non-admin to update role', async () => {
      // Arrange
      const userId = 1;
      const updateData = { role: 'admin' };
      const updatedUser = { ...mockUser };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      
      // Act
      await userService.updateUser(userId, updateData, userId, false);
      
      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {});
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully when user is deleting own account', async () => {
      // Arrange
      const userId = 1;
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);
      
      // Act
      const result = await userService.deleteUser(userId, userId);
      
      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should allow admin to delete other user accounts', async () => {
      // Arrange
      const userId = 2;
      const adminId = 1;
      
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, user_id: userId });
      mockUserRepository.delete.mockResolvedValue(true);
      
      // Act
      const result = await userService.deleteUser(userId, adminId, true);
      
      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should return false if user not found', async () => {
      // Arrange
      const userId = 999;
      
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await userService.deleteUser(userId, userId);
      
      // Assert
      expect(result).toBe(false);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if user is not authorized to delete account', async () => {
      // Arrange
      const userId = 2;
      const currentUserId = 1;
      
      mockUserRepository.findById.mockResolvedValue({ ...mockUser, user_id: userId });
      
      // Act & Assert
      await expect(userService.deleteUser(userId, currentUserId, false))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const userId = 1;
      const currentPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUserRepository.changePassword.mockResolvedValue(true);
      
      // Act
      const result = await userService.changePassword(userId, currentPassword, newPassword);
      
      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.password_hash);
      expect(passwordUtils.validatePassword).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.changePassword).toHaveBeenCalledWith(userId, newPassword);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 999;
      const currentPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';
      
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.changePassword(userId, currentPassword, newPassword))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.changePassword).not.toHaveBeenCalled();
    });

    it('should throw error if current password is incorrect', async () => {
      // Arrange
      const userId = 1;
      const currentPassword = 'WrongPassword123!';
      const newPassword = 'NewPassword123!';
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      // Act & Assert
      await expect(userService.changePassword(userId, currentPassword, newPassword))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.changePassword).not.toHaveBeenCalled();
    });

    it('should throw error if new password is same as old password', async () => {
      // Arrange
      const userId = 1;
      const currentPassword = 'Password123!';
      const newPassword = 'Password123!';
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      // Act & Assert
      await expect(userService.changePassword(userId, currentPassword, newPassword))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.changePassword).not.toHaveBeenCalled();
    });

    it('should throw error if new password validation fails', async () => {
      // Arrange
      const userId = 1;
      const currentPassword = 'OldPassword123!';
      const newPassword = 'weak';
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (passwordUtils.validatePassword as jest.Mock).mockImplementation(() => {
        throw new ApiError('Invalid password', 400);
      });
      
      // Act & Assert
      await expect(userService.changePassword(userId, currentPassword, newPassword))
        .rejects.toThrow(ApiError);
      expect(mockUserRepository.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('initiatePasswordReset', () => {
    it('should initiate password reset successfully when user exists', async () => {
      // Arrange
      const email = 'test@example.com';
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.initiatePasswordReset(email);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.resetToken).toBeDefined();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return success even if user does not exist (security measure)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      // Act
      const result = await userService.initiatePasswordReset(email);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.resetToken).toBeUndefined();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const payload = {
        id: mockUser.user_id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      };
      
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(payload);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (jwtUtils.generateTokens as jest.Mock).mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });
      
      // Act
      const result = await userService.refreshAccessToken(refreshToken);
      
      // Assert
      expect(result).toBe('new-access-token');
      expect(jwtUtils.verifyToken).toHaveBeenCalledWith(refreshToken, true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.id);
      expect(jwtUtils.generateTokens).toHaveBeenCalledWith(payload);
    });

    it('should return null if refresh token is invalid', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';
      
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(null);
      
      // Act
      const result = await userService.refreshAccessToken(refreshToken);
      
      // Assert
      expect(result).toBeNull();
      expect(jwtUtils.verifyToken).toHaveBeenCalledWith(refreshToken, true);
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should return null if user no longer exists', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const payload = {
        id: 999,
        username: 'deleteduser',
        email: 'deleted@example.com',
        role: 'user'
      };
      
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(payload);
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await userService.refreshAccessToken(refreshToken);
      
      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.id);
      expect(jwtUtils.generateTokens).not.toHaveBeenCalled();
    });
  });
});