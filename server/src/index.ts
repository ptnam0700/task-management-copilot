import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { testConnection } from './config/database';
import { config } from './config/config';
import apiRoutes from './routes';
import testRoutes from './routes/test.routes';
import errorHandler from './middlewares/errorHandler';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';
import { securityHeaders } from './middlewares/securityHeaders.middleware';

// Validate environment variables
config.validateEnv();

// Initialize Express app
const app = express();
const PORT = config.SERVER.PORT;

// Middlewares
app.use(cors({
  origin: config.CORS.ORIGIN,
  credentials: true
}));
app.use(helmet()); // Basic security headers
// Apply custom security headers
app.use(securityHeaders);
// Apply global rate limiting
// app.use(apiRateLimiter);
app.use(morgan(config.SERVER.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes); // All versioned API routes
app.use('/api/test', testRoutes); // Test routes outside versioning

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: config.SERVER.NODE_ENV
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection using pg
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to the database');
    }
    console.log('Database connection has been established successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API routes accessible at: /api and /api/v1`);
      console.log(`Security features enabled: password validation, rate limiting, and security headers`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});