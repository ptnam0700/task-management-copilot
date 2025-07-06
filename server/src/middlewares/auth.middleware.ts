import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { IUserTokenPayload } from '../interfaces/user.interface';
import { ApiError } from '../utils/error.utils';

// Extend Express Request interface to include strongly typed user property
declare global {
  namespace Express {
    interface Request {
      user?: IUserTokenPayload;
    }
  }
}

/**
 * Extract JWT token from request headers, cookies, or query params
 * @param req Express request object
 * @returns Token string or null if not found
 */
const extractToken = (req: Request): string | null => {
  // Check Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  
  // Check if token exists in cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  // Check if token exists in query params (less secure, use with caution)
  if (req.query && req.query.token) {
    return req.query.token as string;
  }
  
  return null;
};

/**
 * Middleware to protect routes that require authentication
 * @throws {ApiError} 401 Unauthorized if token is missing or invalid
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from request
    const token = extractToken(req);
    
    // Check if token exists
    if (!token) {
      next(ApiError.unauthorized('Not authorized to access this route', 'UNAUTHORIZED'));
      return;
    }
    
    // Verify token using utility function
    const decodedUser = verifyToken(token);
    
    // Check if token verification was successful
    if (!decodedUser) {
      next(ApiError.unauthorized('Invalid or expired token', 'INVALID_TOKEN'));
      return;
    }
    
    // Add user info from token to request object
    req.user = decodedUser;
    
    next();
  } catch (error) {
    // Pass any other errors to error handler
    next(new ApiError('Authentication failed', 500, 'AUTH_ERROR'));
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param roles Array of roles allowed to access the route
 * @throws {ApiError} 403 Forbidden if user doesn't have required role
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user exists and has a role property
    if (!req.user) {
      next(ApiError.unauthorized('User not authenticated', 'USER_NOT_AUTHENTICATED'));
      return;
    }
    
    // If no roles are specified, allow access
    if (roles.length === 0) {
      next();
      return;
    }
    
    // Check if user has required role
    if (!req.user.role || !roles.includes(req.user.role)) {
      next(ApiError.forbidden('You do not have permission to perform this action', 'FORBIDDEN'));
      return;
    }
    
    next();
  };
};

/**
 * Optional authentication middleware - doesn't reject if no token is provided
 * but will set req.user if a valid token is found
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decodedUser = verifyToken(token);
      if (decodedUser) {
        req.user = decodedUser;
      }
    }
    
    next();
  } catch (error) {
    // Don't throw an error for optional auth, just continue
    next();
  }
};