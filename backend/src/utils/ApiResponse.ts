import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export interface ApiResponseData {
  success: boolean;
  message: string;
  data?: unknown;
  meta?: unknown;
  errors?: unknown[];
}

export class ApiResponse {
  static success(
    res: Response,
    message: string,
    data?: unknown,
    statusCode = StatusCodes.OK,
    meta?: unknown,
  ): Response {
    const response: ApiResponseData = {
      success: true,
      message,
      data: data ?? null,
    };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  static created(res: Response, message: string, data?: unknown): Response {
    return ApiResponse.success(res, message, data, StatusCodes.CREATED);
  }

  static error(
    res: Response,
    message: string,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    errors: unknown[] = [],
  ): Response {
    const response: ApiResponseData = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static noContent(res: Response): Response {
    return res.status(StatusCodes.NO_CONTENT).send();
  }

  static paginated(
    res: Response,
    message: string,
    data: unknown[],
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    },
  ): Response {
    return res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
      meta,
    });
  }
}
