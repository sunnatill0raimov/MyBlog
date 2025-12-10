import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  // Configure MongoDB connection options
  const options = {
    maxPoolSize: 10,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true,
    appName: 'ZeroOneChat',
    // Enable keepAlive to prevent socket timeouts
    socketOptions: {
      keepAlive: true,
      keepAliveInitialDelay: 300000
    }
  };

  try {
    logger.info('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(env.MONGODB_URI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      // Attempt to reconnect
      setTimeout(() => {
        logger.info('Attempting to reconnect to MongoDB...');
        mongoose.connect(env.MONGODB_URI, options)
          .then(() => logger.info('MongoDB reconnected successfully'))
          .catch(reconnectErr => logger.error('MongoDB reconnection failed:', reconnectErr));
      }, 5000); // Wait 5 seconds before reconnecting
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected - will attempt to reconnect');
      // Attempt to reconnect
      setTimeout(() => {
        logger.info('Attempting to reconnect to MongoDB...');
        mongoose.connect(env.MONGODB_URI, options)
          .then(() => logger.info('MongoDB reconnected successfully'))
          .catch(reconnectErr => logger.error('MongoDB reconnection failed:', reconnectErr));
      }, 5000); // Wait 5 seconds before reconnecting
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

    mongoose.connection.on('timeout', () => {
      logger.warn('MongoDB connection timeout - attempting to reconnect');
      // Attempt to reconnect
      setTimeout(() => {
        logger.info('Attempting to reconnect to MongoDB...');
        mongoose.connect(env.MONGODB_URI, options)
          .then(() => logger.info('MongoDB reconnected successfully'))
          .catch(reconnectErr => logger.error('MongoDB reconnection failed:', reconnectErr));
      }, 5000); // Wait 5 seconds before reconnecting
    });

  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    logger.info('Will retry connection in 10 seconds...');
    // Retry connection after delay
    setTimeout(() => {
      connectDB();
    }, 10000);
  }
};

// Add connection health check
const checkMongoDBConnection = () => {
  if (mongoose.connection.readyState === 1) {
    logger.info('MongoDB connection is healthy');
    return true;
  } else {
    logger.warn(`MongoDB connection state: ${mongoose.connection.readyState}`);
    return false;
  }
};

export { connectDB, checkMongoDBConnection };
export default connectDB;
