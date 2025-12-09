import redis from 'redis';
import { env } from './env.js';
import logger from '../utils/logger.js';

let redisClient = null;

// Create Redis client
const createRedisClient = () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: env.REDIS_URL,
      socket: {
        tls: true,
        rejectUnauthorized: false,
      },
    });

    // Error handling
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis Client Disconnected');
    });

    // Connect to Redis
    redisClient.connect().catch((err) => {
      logger.error('Redis Connection Failed:', err);
    });
  }

  return redisClient;
};

// Get Redis client instance
export const getRedisClient = () => {
  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
};

// Close Redis connection
export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

export default redisClient;
