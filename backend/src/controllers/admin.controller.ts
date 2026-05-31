import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { sosService } from '../services/sos.service';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getUsers(req.query as any);
  ApiResponse.paginated(res, 'Users fetched', result.users, result.meta);
});

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.blockUser(req.params.id as string);
  ApiResponse.success(res, result.message);
});

export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.unblockUser(req.params.id as string);
  ApiResponse.success(res, result.message);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.deleteUser(req.params.id as string);
  ApiResponse.success(res, result.message);
});

export const getSosRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getSosRequests(req.query as any);
  ApiResponse.paginated(res, 'SOS requests fetched', result.requests, result.meta);
});

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await adminService.getAnalytics();
  ApiResponse.success(res, 'Analytics fetched', analytics);
});

export const triggerSosForUser = asyncHandler(async (req: Request, res: Response) => {
  const { emergencyType, latitude, longitude, address, description } = req.body;
  const sosData = {
    emergencyType: emergencyType || 'POLICE',
    latitude: latitude || 0,
    longitude: longitude || 0,
    address: address || 'Triggered by Super Admin',
    description: description || 'Test SOS trigger by Super Admin'
  };
  const result = await sosService.create(req.params.userId as string, sosData as any);
  ApiResponse.success(res, 'SOS triggered successfully', result);
});

export const updateSosStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, assignedService } = req.body;
  const result = await adminService.updateSosStatus(req.params.id as string, status, assignedService);
  ApiResponse.success(res, 'SOS status updated successfully', result);
});
