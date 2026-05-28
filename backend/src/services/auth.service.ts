import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { userRepository } from '../repositories/user.repository';
import { otpRepository } from '../repositories/otp.repository';
import { db } from '../config/database';
import {
  generateTokenPair,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
} from '../utils/tokenUtils';
import { generateOtp, hashOtp, verifyOtpHash, getOtpExpiry } from '../utils/otpUtils';
import { ApiError } from '../utils/ApiError';
import { emailService } from './email.service';
import { logger } from '../config/logger';
import { OTP_PURPOSES } from '../constants';
import type {
  SignupInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyOtpInput,
  ChangePasswordInput,
} from '../validators/auth.validator';

export const authService = {
  /**
   * Register a new user account
   */
  async signup(data: SignupInput, meta: { ip?: string; userAgent?: string }) {
    // Check for existing email
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // Check for existing phone
    const existingPhone = await userRepository.findByPhone(data.phone);
    if (existingPhone) {
      throw ApiError.conflict('An account with this phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      bloodGroup: data.bloodGroup,
      address: data.address,
      gender: data.gender,
      dob: data.dob,
      dlNumber: data.dlNumber,
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
      vehicleModel: data.vehicleModel,
      medicalConditions: data.medicalConditions,
      currentMedications: data.currentMedications,
      disabilityInfo: data.disabilityInfo,
      aadhaar: data.aadhaar,
      insurance: data.insurance,
      organDonor: data.organDonor,
      allergies: data.allergies,
      avatar: data.avatar,
      emergencyContacts: {
        create: [
          {
            name: data.contactName,
            relationship: data.contactRelation,
            phone: data.contactPhone
          },
          ...(data.secondaryContactName ? [
            {
              name: data.secondaryContactName,
              relationship: data.secondaryContactRelation || '',
              phone: data.secondaryContactPhone || ''
            }
          ] : [])
        ]
      }
    });

    // Generate tokens
    const tokens = generateTokenPair(user.id, user.email, user.role);

    // Store refresh token
    await db.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: getTokenExpiry(env.JWT_REFRESH_EXPIRES_IN),
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    // Log device
    await db.deviceLog.create({
      data: {
        userId: user.id,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    // Send email verification OTP
    try {
      const otp = generateOtp();
      const hashedOtp = hashOtp(otp);
      await otpRepository.create({
        email: user.email,
        otp: hashedOtp,
        purpose: OTP_PURPOSES.EMAIL_VERIFICATION,
        expiresAt: getOtpExpiry(),
        userId: user.id,
      });
      await emailService.sendOtpEmail(user.email, user.fullName, otp, 'EMAIL_VERIFICATION');
    } catch (error) {
      logger.warn('Failed to send verification email:', error);
    }

    logger.info(`New user registered: ${user.email}`);

    return { user, ...tokens };
  },

  /**
   * Login an existing user
   */
  async login(data: LoginInput, meta: { ip?: string; userAgent?: string }) {
    // Find user with password
    const user = await userRepository.findByEmailWithPassword(data.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.isBlocked) {
      throw ApiError.forbidden('Your account has been blocked. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokenPair(user.id, user.email, user.role);

    // Store refresh token
    await db.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: getTokenExpiry(env.JWT_REFRESH_EXPIRES_IN),
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    // Log device
    await db.deviceLog.create({
      data: {
        userId: user.id,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    // Send welcome back email (async, non-blocking)
    emailService.sendWelcomeBackEmail(user.email, user.fullName).catch(() => {});

    logger.info(`User logged in: ${user.email}`);

    // Return safe user (no password)
    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  },

  /**
   * Logout — revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await db.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(token: string) {
    // Verify JWT
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Check DB
    const storedToken = await db.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked) {
      throw ApiError.unauthorized('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token has expired');
    }

    if (storedToken.user.isBlocked) {
      throw ApiError.forbidden('Account has been blocked');
    }

    // Rotate: revoke old token
    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new token pair
    const tokens = generateTokenPair(
      storedToken.userId,
      storedToken.user.email,
      storedToken.user.role,
    );

    // Store new refresh token
    await db.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: storedToken.userId,
        expiresAt: getTokenExpiry(env.JWT_REFRESH_EXPIRES_IN),
      },
    });

    return tokens;
  },

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    const user = await userRepository.findByEmail(data.email);

    // Always return success to prevent email enumeration
    if (!user) return;

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await otpRepository.create({
      email: user.email,
      otp: hashedOtp,
      purpose: OTP_PURPOSES.PASSWORD_RESET,
      expiresAt: getOtpExpiry(),
      userId: user.id,
    });

    await emailService.sendOtpEmail(
      user.email,
      user.fullName,
      otp,
      'PASSWORD_RESET',
    );

    logger.info(`Password reset OTP sent to: ${user.email}`);
  },

  /**
   * Reset password with OTP
   */
  async resetPassword(data: ResetPasswordInput): Promise<void> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw ApiError.badRequest('Invalid request');
    }

    const otpRecord = await otpRepository.findLatest(data.email, OTP_PURPOSES.PASSWORD_RESET);
    if (!otpRecord) {
      throw ApiError.badRequest('No valid OTP found. Please request a new one.');
    }

    const isOtpValid = verifyOtpHash(data.otp, otpRecord.otp);
    if (!isOtpValid) {
      throw ApiError.badRequest('Invalid OTP');
    }

    await otpRepository.markVerified(otpRecord.id);

    const hashedPassword = await bcrypt.hash(data.newPassword, env.BCRYPT_ROUNDS);
    await userRepository.updatePassword(user.id, hashedPassword);

    // Revoke all refresh tokens for security
    await db.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    logger.info(`Password reset successful for: ${user.email}`);
  },

  /**
   * Verify email OTP
   */
  async verifyOtp(data: VerifyOtpInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw ApiError.badRequest('User not found');
    }

    const otpRecord = await otpRepository.findLatest(data.email, data.purpose);
    if (!otpRecord) {
      throw ApiError.badRequest('No valid OTP found. Please request a new one.');
    }

    const isOtpValid = verifyOtpHash(data.otp, otpRecord.otp);
    if (!isOtpValid) {
      throw ApiError.badRequest('Invalid OTP');
    }

    await otpRepository.markVerified(otpRecord.id);

    if (data.purpose === OTP_PURPOSES.EMAIL_VERIFICATION) {
      await userRepository.markVerified(user.id);
      await emailService.sendWelcomeEmail(user.email, user.fullName);
    }

    logger.info(`OTP verified for: ${user.email}, purpose: ${data.purpose}`);
    return { verified: true };
  },

  /**
   * Resend OTP
   */
  async resendOtp(email: string, purpose: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await otpRepository.create({
      email: user.email,
      otp: hashedOtp,
      purpose,
      expiresAt: getOtpExpiry(),
      userId: user.id,
    });

    await emailService.sendOtpEmail(user.email, user.fullName, otp, purpose);
    logger.info(`OTP resent to: ${user.email}, purpose: ${purpose}`);
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, env.BCRYPT_ROUNDS);
    await userRepository.updatePassword(userId, hashedPassword);

    // Revoke all refresh tokens for security
    await db.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    logger.info(`Password changed for user: ${userId}`);
  },

  /**
   * Get current user info
   */
  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  },
};
