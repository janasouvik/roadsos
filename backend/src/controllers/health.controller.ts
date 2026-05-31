import { Request, Response } from 'express';
import { db } from '../config/database';
import { getRedisClient } from '../config/redis';
import { env } from '../config/env';
import os from 'os';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const start = Date.now();

  // Check DB
  let dbStatus = 'ok';
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  // Check Redis
  let redisStatus = 'ok';
  try {
    const client = getRedisClient();
    await client.ping();
  } catch {
    redisStatus = 'unavailable';
  }

  const responseTime = Date.now() - start;
  const isHealthy = dbStatus === 'ok';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    responseTime: `${responseTime}ms`,
    version: process.env.npm_package_version ?? '1.0.0',
    environment: env.NODE_ENV,
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    system: {
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
      },
      cpu: os.cpus().length,
      platform: os.platform(),
    },
  });
};
