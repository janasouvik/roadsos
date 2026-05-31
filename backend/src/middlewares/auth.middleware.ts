import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../utils/tokenUtils';
import { db } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Role } from '@prisma/client';
import { logger } from '../config/logger';

/**
 * Authenticate user via Bearer JWT token
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No authorization token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Invalid authorization format');
    }

    // Verify JWT
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    // Fetch user from DB
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        isBlocked: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (user.isBlocked) {
      throw ApiError.forbidden('Your account has been blocked. Contact support.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize users based on their roles
 * Usage: authorizeRoles('ADMIN', 'SUPER_ADMIN')
 */
export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} (${req.user.role}) to ${req.path}`);
      next(
        ApiError.forbidden(
          `Access denied. Required roles: ${roles.join(', ')}`,
        ),
      );
      return;
    }

    next();
  };
};

/**
 * Optional authentication — attaches user if token present but doesn't throw if not
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        isBlocked: true,
      },
    });

    if (user && !user.isBlocked) {
      req.user = user;
    }
  } catch {
    // Silently ignore auth errors for optional routes
  }
  next();
};
