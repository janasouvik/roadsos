import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    errors: [],
  });
};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} — ${duration}ms`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.userId,
    });
  });
  next();
};
