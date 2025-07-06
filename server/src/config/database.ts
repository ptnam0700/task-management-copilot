import { Pool, PoolClient } from 'pg';
import { config } from './config';

// Create a connection pool configuration using environment variables
const poolConfig = {
  host: config.DATABASE.HOST,
  port: config.DATABASE.PORT,
  database: config.DATABASE.NAME,
  user: config.DATABASE.USER,
  password: config.DATABASE.PASSWORD,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
  // SSL configuration for production environments
  ssl: config.SERVER.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
};

// Create connection pool
const pool = new Pool(poolConfig);

// Connection pool error handler
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a query using a connection from the pool
 * @param text - SQL query text
 * @param params - Query parameters
 * @returns Query result
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (config.SERVER.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns Client and release function
 */
export const getClient = async () => {
  const client = await pool.connect();
  const originalRelease = client.release;
  
  // Override release method to log duration
  client.release = () => {
    client.release = originalRelease;
    return client.release();
  };
  
  return client;
};

/**
 * Execute a transaction with the provided callback function
 * @param callback - Function to execute within transaction
 * @returns Result of the callback function
 */
export const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

/**
 * Test database connection
 * @returns Boolean indicating successful connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

export default {
  pool,
  query,
  getClient,
  transaction,
  testConnection
};