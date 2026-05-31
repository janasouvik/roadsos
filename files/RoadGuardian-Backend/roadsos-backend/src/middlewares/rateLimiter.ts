import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { Request, Response } from 'express';

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errors: [],
  },
  skip: (req: Request) => req.path === '/health',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in 15 minutes',
    errors: [],
  },
  keyGenerator: (req: Request) => req.ip || 'unknown',
});

export const sosRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many SOS requests. Please call 112 directly for immediate help.',
    errors: [],
  },
});
