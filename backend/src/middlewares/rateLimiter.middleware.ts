import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { StatusCodes } from 'http-status-codes';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 10000, // Increased to prevent blocking correct logins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

/**
 * Stricter rate limiter for auth endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased to prevent blocking correct logins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  skipSuccessfulRequests: true,
});

/**
 * OTP resend rate limiter — max 3 per 10 minutes
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 10 minutes.',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

/**
 * SOS creation rate limiter — max 5 per 5 minutes
 */
export const sosLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many SOS requests. Please wait before sending another.',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});
