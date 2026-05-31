import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError, asyncHandler } from '../utils/apiError';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import prisma from '../database';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
      };
    }
  }
}

// ============================
// AUTHENTICATE USER
// ============================
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      throw ApiError.unauthorized('No authentication token provided');
    }

    const decoded = verifyAccessToken(token);

    // Verify user still exists and is not blocked
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isBlocked: true },
    });

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (user.isBlocked) {
      throw ApiError.forbidden('Your account has been blocked');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  }
);

// ============================
// OPTIONAL AUTH (no error if no token)
// ============================
export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, role: true, isBlocked: true },
        });
        if (user && !user.isBlocked) {
          req.user = { userId: user.id, email: user.email, role: user.role };
        }
      }
    } catch { /* ignore */ }
    next();
  }
);

// ============================
// AUTHORIZE ROLES
// ============================
export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role as Role)) {
      throw ApiError.forbidden(`Access restricted to: ${roles.join(', ')}`);
    }
    next();
  };
};

// ============================
// VERIFY OWNERSHIP
// ============================
export const verifyOwnership = (getResourceUserId: (req: Request) => Promise<string | null>) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();

    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const resourceUserId = await getResourceUserId(req);
    if (!resourceUserId || resourceUserId !== req.user.userId) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    next();
  });
};
