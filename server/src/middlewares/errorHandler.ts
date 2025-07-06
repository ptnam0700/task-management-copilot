import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error.utils';
import { config } from '../config/config';

/**
 * Global error handling middleware
 */
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`);
  if (config.SERVER.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  // Check if error is an ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(config.SERVER.NODE_ENV === 'development' && { stack: err.stack }),
        ...(err.errors && { errors: err.errors })
      }
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      }
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      }
    });
  }
  
  // Handle unknown errors
  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error',
      code: 'SERVER_ERROR',
      ...(config.SERVER.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export default errorHandler;