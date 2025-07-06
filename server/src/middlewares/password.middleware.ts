import { Request, Response, NextFunction } from 'express';
import { validatePassword } from '../utils/password.utils';
import { ApiError } from '../utils/error.utils';

/**
 * Middleware to validate password strength
 * Checks if password meets required complexity criteria
 */
export const validatePasswordStrength = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { password } = req.body;

    if (!password) {
      next(ApiError.badRequest('Password is required', 'PASSWORD_REQUIRED'));
      return;
    }

    // Use the password validation utility
    validatePassword(password);
    
    next();
  } catch (error) {
    next(error);
  }
};