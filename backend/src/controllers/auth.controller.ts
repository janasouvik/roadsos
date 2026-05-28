import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { StatusCodes } from 'http-status-codes';

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Set refresh token as HttpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  ApiResponse.created(res, 'Account created successfully. Please verify your email.', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.success(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security:
 *       - BearerAuth: []
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie('refreshToken');
  ApiResponse.success(res, 'Logged out successfully');
});

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Refresh token is required',
    });
    return;
  }

  const tokens = await authService.refreshToken(token);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.success(res, 'Token refreshed successfully', {
    accessToken: tokens.accessToken,
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body);
  ApiResponse.success(
    res,
    'If an account exists with this email, you will receive an OTP shortly.',
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  ApiResponse.success(res, 'Password reset successfully. Please login with your new password.');
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyOtp(req.body);
  ApiResponse.success(res, 'OTP verified successfully', result);
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  await authService.resendOtp(req.body.email, req.body.purpose);
  ApiResponse.success(res, 'OTP resent successfully. Check your email.');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  ApiResponse.success(res, 'User fetched successfully', user);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body);
  res.clearCookie('refreshToken');
  ApiResponse.success(res, 'Password changed successfully. Please login again.');
});
