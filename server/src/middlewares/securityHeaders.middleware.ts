import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware
 * Adds various security headers to responses
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Content-Security-Policy
  // Helps prevent XSS attacks by specifying which sources content can be loaded from
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self';"
  );
  
  // X-Content-Type-Options
  // Prevents MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  // Prevents clickjacking by disallowing your site to be displayed in iframes
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection
  // Adds an additional layer of XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict-Transport-Security
  // Enforces HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Referrer-Policy
  // Controls how much referrer information is included with requests
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Permissions-Policy
  // Limits which browser features can be used
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  
  next();
};