import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../database';
import { redis } from '../config/redis';
import { ApiError } from '../utils/apiError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOtp,
} from '../utils/jwt';
import {
  sendOtpEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../utils/email';
import { env } from '../config/env';
import logger from '../config/logger';

const SALT_ROUNDS = 12;
const OTP_TTL = env.OTP_EXPIRES_MINUTES * 60;

export class AuthService {

  // ============================
  // SIGN UP
  // ============================
  async signup(data: { fullName: string; email: string; phone?: string; password: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw ApiError.conflict('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
      },
      select: { id: true, fullName: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
    });

    // Generate and store OTP
    const otp = generateOtp();
    await this.storeOtp(data.email, otp, user.id);
    await sendOtpEmail(data.email, otp, data.fullName);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokenPair(user.id, user.email, user.role);

    logger.info(`New user registered: ${user.email}`);

    return { user, accessToken, refreshToken };
  }

  // ============================
  // LOGIN
  // ============================
  async login(data: { email: string; password: string }, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) throw ApiError.unauthorized('Invalid email or password');
    if (user.isBlocked) throw ApiError.forbidden('Your account has been blocked');

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

    // Update last login + log device
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await prisma.loginHistory.create({
      data: { userId: user.id, ipAddress, userAgent },
    });

    const { accessToken, refreshToken } = await this.generateTokenPair(user.id, user.email, user.role);

    const { password: _, ...safeUser } = user;

    logger.info(`User logged in: ${user.email}`);

    return { user: safeUser, accessToken, refreshToken };
  }

  // ============================
  // REFRESH TOKEN
  // ============================
  async refreshTokens(token: string) {
    const decoded = verifyRefreshToken(token);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token expired or invalid');
    }

    // Token rotation — delete old, issue new
    await prisma.refreshToken.delete({ where: { token } });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isBlocked: true },
    });

    if (!user || user.isBlocked) throw ApiError.unauthorized();

    const tokens = await this.generateTokenPair(user.id, user.email, user.role);
    return tokens;
  }

  // ============================
  // LOGOUT
  // ============================
  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  // ============================
  // VERIFY OTP
  // ============================
  async verifyOtp(email: string, otp: string) {
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      throw ApiError.badRequest('Invalid or expired OTP');
    }

    await redis.del(`otp:${email}`);

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.isVerified) {
      await sendWelcomeEmail(email, user.fullName);
    }

    return { message: 'Email verified successfully' };
  }

  // ============================
  // RESEND OTP
  // ============================
  async resendOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw ApiError.notFound('User not found');
    if (user.isVerified) throw ApiError.badRequest('Email already verified');

    const otp = generateOtp();
    await this.storeOtp(email, otp, user.id);
    await sendOtpEmail(email, otp, user.fullName);

    return { message: 'OTP resent successfully' };
  }

  // ============================
  // FORGOT PASSWORD
  // ============================
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found (security best practice)
      return { message: 'If this email exists, a reset code has been sent' };
    }

    const otp = generateOtp();
    await redis.set(`reset:${email}`, otp, OTP_TTL);
    await sendPasswordResetEmail(email, otp, user.fullName);

    return { message: 'Password reset code sent to your email' };
  }

  // ============================
  // RESET PASSWORD
  // ============================
  async resetPassword(email: string, otp: string, newPassword: string) {
    const storedOtp = await redis.get(`reset:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      throw ApiError.badRequest('Invalid or expired reset code');
    }

    await redis.del(`reset:${email}`);

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { user: { email } },
    });

    return { message: 'Password reset successfully' };
  }

  // ============================
  // CHANGE PASSWORD
  // ============================
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return { message: 'Password changed successfully' };
  }

  // ============================
  // HELPERS
  // ============================
  private async generateTokenPair(userId: string, email: string, role: Role) {
    const payload = { userId, email, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private async storeOtp(email: string, otp: string, userId: string) {
    await redis.set(`otp:${email}`, otp, OTP_TTL);

    await prisma.otp.create({
      data: {
        email,
        otp,
        userId,
        expiresAt: new Date(Date.now() + OTP_TTL * 1000),
      },
    });
  }
}

export const authService = new AuthService();
