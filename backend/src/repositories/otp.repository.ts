import { db } from '../config/database';
import { Otp } from '@prisma/client';

export const otpRepository = {
  async create(data: {
    email: string;
    otp: string;
    purpose: string;
    expiresAt: Date;
    userId?: string;
  }): Promise<Otp> {
    // Invalidate previous OTPs for the same email+purpose
    await db.otp.updateMany({
      where: {
        email: data.email,
        purpose: data.purpose,
        verified: false,
      },
      data: { verified: true },
    });

    return db.otp.create({ data });
  },

  async findLatest(email: string, purpose: string): Promise<Otp | null> {
    return db.otp.findFirst({
      where: {
        email,
        purpose,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async markVerified(id: string): Promise<void> {
    await db.otp.update({
      where: { id },
      data: { verified: true },
    });
  },

  async deleteExpired(): Promise<number> {
    const result = await db.otp.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  },
};
