import Redis from 'ioredis';
import { env } from './env';
import logger from './logger';

let redisClient: Redis;
let useInMemory = false;
const inMemoryStore = new Map<string, { value: string; expiresAt?: number }>();

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      password: env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Fail fast to fall back to in-memory store
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    await redisClient.connect();
  } catch (error) {
    logger.warn('⚠️ Redis connection failed. Falling back to in-memory store.');
    useInMemory = true;
  }
};

export const getRedis = (): Redis => {
  if (!redisClient) throw new Error('Redis not connected');
  return redisClient;
};

// Helper methods
export const redis = {
  set: async (key: string, value: string, ttlSeconds?: number): Promise<void> => {
    if (useInMemory) {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
      inMemoryStore.set(key, { value, expiresAt });
      return;
    }
    if (ttlSeconds) {
      await getRedis().setex(key, ttlSeconds, value);
    } else {
      await getRedis().set(key, value);
    }
  },

  get: async (key: string): Promise<string | null> => {
    if (useInMemory) {
      const item = inMemoryStore.get(key);
      if (!item) return null;
      if (item.expiresAt && item.expiresAt < Date.now()) {
        inMemoryStore.delete(key);
        return null;
      }
      return item.value;
    }
    return getRedis().get(key);
  },

  del: async (key: string): Promise<void> => {
    if (useInMemory) {
      inMemoryStore.delete(key);
      return;
    }
    await getRedis().del(key);
  },

  exists: async (key: string): Promise<boolean> => {
    if (useInMemory) {
      const item = inMemoryStore.get(key);
      if (!item) return false;
      if (item.expiresAt && item.expiresAt < Date.now()) {
        inMemoryStore.delete(key);
        return false;
      }
      return true;
    }
    const result = await getRedis().exists(key);
    return result === 1;
  },

  setJson: async (key: string, value: object, ttlSeconds?: number): Promise<void> => {
    await redis.set(key, JSON.stringify(value), ttlSeconds);
  },

  getJson: async <T>(key: string): Promise<T | null> => {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  },
};
