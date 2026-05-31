import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../utils/apiError';
import { authService } from '../services/auth.service';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);

  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Account created successfully! Please verify your email.', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(
    req.body,
    req.ip || undefined,
    req.get('user-agent') || undefined
  );

  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Logged in successfully');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie('refresh_token');
  sendSuccess(res, null, 'Logged out successfully');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token || req.body?.refreshToken || req.headers['x-refresh-token'] as string;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token required', errors: [] });
  }

  const result = await authService.refreshTokens(token);

  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, null, result.message);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;
  const result = await authService.resetPassword(email, otp, password);
  sendSuccess(res, null, result.message);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await authService.verifyOtp(email, otp);
  sendSuccess(res, null, result.message);
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resendOtp(req.body.email);
  sendSuccess(res, null, result.message);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const prisma = (await import('../database')).default;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      isVerified: true,
      lastLogin: true,
      createdAt: true,
      _count: {
        select: { sosRequests: true, emergencyContacts: true },
      },
    },
  });

  sendSuccess(res, user, 'User fetched');
});
