import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';

/**
 * Global error handler middleware.
 * Must be registered last in the Express middleware chain.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  // Log all errors
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Handle known operational errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle JWT errors
  if (err instanceof TokenExpiredError) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Token has expired. Please login again.',
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token.',
    });
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[]) ?? [];
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `${fields.join(', ')} already exists`,
        errors: [{ field: fields[0], message: `${fields[0]} already in use` }],
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Record not found',
      });
      return;
    }

    if (err.code === 'P2003') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid reference: related record does not exist',
      });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Invalid data provided',
    });
    return;
  }

  // Handle Multer errors
  if (err.message === 'File too large') {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'File size exceeds the allowed limit',
    });
    return;
  }

  // Default 500 Internal Server Error
  const isProduction = env.NODE_ENV === 'production';
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: isProduction ? 'An unexpected error occurred' : err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
