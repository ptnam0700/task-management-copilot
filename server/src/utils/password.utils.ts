import { ApiError } from './error.utils';

/**
 * Validates password strength based on requirements
 * @param password Password to validate
 * @returns Boolean indicating if password meets strength requirements or throws ApiError
 */
export const validatePasswordStrength = (password: string): boolean => {
  // Check minimum length (at least 8 characters)
  if (password.length < 8) {
    throw ApiError.badRequest(
      'Password must be at least 8 characters long',
      'PASSWORD_TOO_SHORT'
    );
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    throw ApiError.badRequest(
      'Password must contain at least one uppercase letter',
      'PASSWORD_NEEDS_UPPERCASE'
    );
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    throw ApiError.badRequest(
      'Password must contain at least one lowercase letter',
      'PASSWORD_NEEDS_LOWERCASE'
    );
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    throw ApiError.badRequest(
      'Password must contain at least one number',
      'PASSWORD_NEEDS_NUMBER'
    );
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    throw ApiError.badRequest(
      'Password must contain at least one special character',
      'PASSWORD_NEEDS_SPECIAL'
    );
  }

  return true;
};

/**
 * Common password check (prevents easily guessable passwords)
 * @param password Password to check
 * @returns Boolean indicating if password is not in common password list
 */
export const isNotCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password',
    'password123',
    '123456',
    '123456789',
    'qwerty',
    'admin',
    'welcome',
    'letmein'
    // Add more common passwords as needed
  ];

  const normalizedPassword = password.toLowerCase();
  return !commonPasswords.includes(normalizedPassword);
};

/**
 * Comprehensive password validation
 * @param password Password to validate
 * @returns true if password is valid, throws ApiError otherwise
 */
export const validatePassword = (password: string): boolean => {
  // Check password strength requirements
  validatePasswordStrength(password);

  // Check if password is not a common password
  // if (!isNotCommonPassword(password)) {
  //   throw ApiError.badRequest(
  //     'Password is too common and easily guessable',
  //     'PASSWORD_TOO_COMMON'
  //   );
  // }

  return true;
};