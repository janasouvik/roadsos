// ============================
// CUSTOM API ERROR
// ============================

export class ApiError extends Error {
  statusCode: number;
  errors: string[];
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: string[] = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: string[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], false);
  }
}

// ============================
// ASYNC HANDLER WRAPPER
// ============================

import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================
// STANDARD API RESPONSE
// ============================

export const sendSuccess = (
  res: Response,
  data: any = null,
  message = 'Success',
  statusCode = 200,
  meta?: object
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  });
};

export const sendError = (
  res: Response,
  message = 'Something went wrong',
  statusCode = 500,
  errors: string[] = []
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
