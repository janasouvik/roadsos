import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!.id);
  ApiResponse.success(res, 'Profile fetched successfully', user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(
    req.user!.id,
    req.body,
    req.file,
  );
  ApiResponse.success(res, 'Profile updated successfully', user);
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteAccount(req.user!.id);
  res.clearCookie('refreshToken');
  ApiResponse.success(res, 'Account deleted successfully');
});
