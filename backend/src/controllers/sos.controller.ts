import { Request, Response } from 'express';
import { sosService } from '../services/sos.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createSos = asyncHandler(async (req: Request, res: Response) => {
  const sos = await sosService.create(req.user!.id, req.body);
  ApiResponse.created(res, 'SOS request created successfully', sos);
});

export const getMyRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await sosService.getMyRequests(req.user!.id, req.query as any);
  ApiResponse.paginated(res, 'SOS requests fetched', result.requests, result.meta);
});

export const getSosById = asyncHandler(async (req: Request, res: Response) => {
  const sos = await sosService.getById(req.params.id as string, req.user!.id);
  ApiResponse.success(res, 'SOS request fetched', sos);
});

export const cancelSos = asyncHandler(async (req: Request, res: Response) => {
  const sos = await sosService.cancel(req.params.id as string, req.user!.id);
  ApiResponse.success(res, 'SOS request cancelled', sos);
});
