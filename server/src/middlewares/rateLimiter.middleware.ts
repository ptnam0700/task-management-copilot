import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Authentication rate limiter middleware
 * Limits the number of authentication attempts from the same IP
 * Helps prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // Limit each IP to 5 requests per window (15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Custom message for when the rate limit is reached
  message: {
    success: false,
    error: {
      message: 'Too many login attempts from this IP, please try again after 15 minutes',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  skipSuccessfulRequests: false, // Count successful requests against the rate limit
});

/**
 * General API rate limiter middleware
 * Protects API from excessive requests
 */
export const apiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minute window
  max: 100, // Limit each IP to 100 requests per window (10 minutes)
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 10 minutes',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

/**
 * Custom rate limiter factory for creating specific rate limiters
 * @param maxRequests Maximum number of requests allowed in the window
 * @param windowMinutes Window size in minutes
 * @param message Custom message when rate limit is exceeded
 * @returns Rate limiter middleware
 */
export const createRateLimiter = (
  maxRequests: number,
  windowMinutes: number,
  message: string = 'Too many requests from this IP'
) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        message,
        code: 'RATE_LIMIT_EXCEEDED'
      }
    }
  });
};