import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Server configuration
const SERVER = {
  PORT: process.env.PORT || 3001, // Changed from 3000 to 3001
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Database configuration
const DATABASE = {
  HOST: process.env.DB_HOST || 'localhost',
  PORT: parseInt(process.env.DB_PORT || '5432', 10),
  NAME: process.env.DB_NAME || 'task_management',
  USER: process.env.DB_USER || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || 'postgres',
};

// JWT configuration
const JWT = {
  SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_dev_only',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_key_for_dev_only',
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

// CORS configuration
const CORS = {
  ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Log environment mode
console.log(`Server running in ${SERVER.NODE_ENV} mode`);

// Function to validate required environment variables
const validateEnv = (): void => {
  const requiredEnvs: string[] = [
    'DB_HOST', 
    'DB_NAME', 
    'DB_USER', 
    'DB_PASSWORD',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  if (SERVER.NODE_ENV === 'production') {
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    if (missingEnvs.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvs.join(', ')}`);
    }
  }
};

// Export all configuration
export const config = {
  SERVER,
  DATABASE,
  JWT,
  CORS,
  validateEnv,
};

export default config;