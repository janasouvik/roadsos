import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { JwtPayload, TokenPair } from '../types/auth.types';
import { Role } from '@prisma/client';

/**
 * Generate a JWT access token (15 minutes)
 */
export const generateAccessToken = (
  userId: string,
  email: string,
  role: Role,
): string => {
  return jwt.sign(
    { userId, email, role } as JwtPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
};

/**
 * Generate a JWT refresh token (7 days)
 */
export const generateRefreshToken = (
  userId: string,
  email: string,
  role: Role,
): string => {
  return jwt.sign(
    { userId, email, role } as JwtPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (
  userId: string,
  email: string,
  role: Role,
): TokenPair => {
  return {
    accessToken: generateAccessToken(userId, email, role),
    refreshToken: generateRefreshToken(userId, email, role),
  };
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

/**
 * Generate a random opaque token (for refresh token storage)
 */
export const generateOpaqueToken = (): string => {
  return uuidv4() + '-' + uuidv4();
};

/**
 * Get token expiry date from string (e.g. "7d", "15m")
 */
export const getTokenExpiry = (expiresIn: string): Date => {
  const unit = expiresIn.slice(-1);
  const amount = parseInt(expiresIn.slice(0, -1));
  const now = new Date();

  switch (unit) {
    case 'm':
      return new Date(now.getTime() + amount * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + amount * 60 * 60 * 1000);
    case 'd':
      return new Date(now.getTime() + amount * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
};
