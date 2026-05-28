import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;

export const createRedisClient = (): Redis => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 5) {
        logger.error('Redis connection failed after 5 retries');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redisClient.on('error', (err) => {
    logger.error('❌ Redis error:', err.message);
  });

  redisClient.on('close', () => {
    logger.warn('🔌 Redis connection closed');
  });

  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  const client = createRedisClient();
  try {
    await client.connect();
  } catch (error) {
    logger.warn('⚠️ Redis not available — running without cache');
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('🔌 Redis disconnected');
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
};

// Redis utility helpers
export const setCache = async (
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> => {
  try {
    const client = getRedisClient();
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  } catch {
    logger.warn(`Cache set failed for key: ${key}`);
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    return await client.get(key);
  } catch {
    logger.warn(`Cache get failed for key: ${key}`);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch {
    logger.warn(`Cache delete failed for key: ${key}`);
  }
};

export const existsCache = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  } catch {
    return false;
  }
};
