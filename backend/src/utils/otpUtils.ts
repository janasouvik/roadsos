import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Generate a numeric OTP of the given length
 */
export const generateOtp = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Hash an OTP using SHA-256 for secure storage
 */
export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify an OTP against its hash
 */
export const verifyOtpHash = (otp: string, hashedOtp: string): boolean => {
  const hash = hashOtp(otp);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashedOtp));
};

/**
 * Get OTP expiry date
 */
export const getOtpExpiry = (minutes?: number): Date => {
  const m = minutes ?? env.OTP_EXPIRY_MINUTES;
  return new Date(Date.now() + m * 60 * 1000);
};
