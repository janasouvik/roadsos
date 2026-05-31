import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware factory that validates request against a Zod schema.
 * Validates req.body, req.params, and req.query based on schema shape.
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.').replace(/^(body|params|query)\./, ''),
          message: e.message,
          code: e.code,
        }));
        next(
          new ApiError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            'Validation failed',
            errors,
          ),
        );
      } else {
        next(error);
      }
    }
  };
};
