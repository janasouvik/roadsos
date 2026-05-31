import prisma from '../database';
import { ApiError, sendSuccess } from '../utils/apiError';
import { sendEmergencyContactNotification } from '../utils/email';
import logger from '../config/logger';

export class SosService {

  async create(userId: string, data: {
    latitude: number;
    longitude: number;
    address?: string;
    emergencyType: 'HOSPITAL' | 'AMBULANCE' | 'POLICE' | 'TOWING' | 'RESCUE';
    description?: string;
    imageUrl?: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { emergencyContacts: true },
    });
    if (!user) throw ApiError.notFound('User not found');

    const sos = await prisma.sosRequest.create({
      data: {
        userId,
        ...data,
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        title: '🚨 SOS Alert Triggered',
        message: `Your ${data.emergencyType} emergency alert has been sent. Help is on the way.`,
        type: 'SOS_ALERT',
        metadata: { sosId: sos.id },
      },
    });

    // Notify emergency contacts via email
    if (user.emergencyContacts.length > 0) {
      const locationStr = data.address || `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`;
      for (const contact of user.emergencyContacts) {
        if (contact.email) {
          sendEmergencyContactNotification(
            contact.email,
            contact.name,
            user.fullName,
            locationStr,
            data.emergencyType
          ).catch((err) => logger.error('Failed to notify emergency contact:', err));
        }
      }
    }

    logger.info(`SOS created: ${sos.id} by user ${userId} — ${data.emergencyType}`);
    return sos;
  }

  async getMyRequests(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      prisma.sosRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sosRequest.count({ where: { userId } }),
    ]);

    return {
      requests,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, userId: string) {
    const sos = await prisma.sosRequest.findFirst({
      where: { id, userId },
    });
    if (!sos) throw ApiError.notFound('SOS request not found');
    return sos;
  }

  async cancel(id: string, userId: string) {
    const sos = await prisma.sosRequest.findFirst({ where: { id, userId } });
    if (!sos) throw ApiError.notFound('SOS request not found');

    if (['COMPLETED', 'CANCELLED'].includes(sos.status)) {
      throw ApiError.badRequest(`Cannot cancel a ${sos.status.toLowerCase()} request`);
    }

    return prisma.sosRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async updateStatus(id: string, status: 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED', assignedService?: string) {
    const sos = await prisma.sosRequest.findUnique({ where: { id } });
    if (!sos) throw ApiError.notFound('SOS request not found');

    const updated = await prisma.sosRequest.update({
      where: { id },
      data: { status, assignedService },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: sos.userId,
        title: '🚑 SOS Status Updated',
        message: `Your emergency request is now ${status}`,
        type: 'SOS_UPDATE',
        metadata: { sosId: id, status },
      },
    });

    return updated;
  }
}

export const sosService = new SosService();
