import { EmergencyType, SosStatus } from '@prisma/client';
import { sosRepository } from '../repositories/sos.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { contactRepository } from '../repositories/contact.repository';
import { ApiError } from '../utils/ApiError';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { emailService } from './email.service';
import { userRepository } from '../repositories/user.repository';
import { logger } from '../config/logger';
import { CreateSosInput } from '../validators/sos.validator';
import { getSocketServer } from '../sockets';
import { SOCKET_EVENTS } from '../constants';

export const sosService = {
  async create(userId: string, data: CreateSosInput) {
    const googleMapsLink = data.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`;

    const sos = await sosRepository.create({
      userId,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      emergencyType: data.emergencyType as EmergencyType,
      description: data.description,
      googleMapsLink,
      severity: data.severity || 'LOW',
      accidentImage: data.accidentImage,
      accidentVideo: data.accidentVideo,
      accidentAudio: data.accidentAudio,
    });

    // Notify admin via Socket.IO
    try {
      const io = getSocketServer();
      io.to('admin_room').emit(SOCKET_EVENTS.SOS_NEW, {
        sosId: sos.id,
        emergencyType: sos.emergencyType,
        location: { lat: sos.latitude, lng: sos.longitude },
        address: sos.address,
        timestamp: sos.createdAt,
      });
    } catch {
      logger.warn('Socket.IO not available for SOS broadcast');
    }

    // Create notification
    await notificationRepository.create({
      userId,
      title: '🚨 SOS Alert Sent',
      message: `Your ${data.emergencyType} emergency request has been submitted. Help is on the way.`,
      type: 'SOS_UPDATE',
    });

    // Notify emergency contacts via email
    try {
      const contacts = await contactRepository.findByUser(userId);
      const user = await userRepository.findById(userId);
      if (user && contacts.length > 0) {
        const emailsWithAddresses = contacts.filter((c) => c.email);
        for (const contact of emailsWithAddresses) {
          emailService
            .sendEmergencyNotification(contact.email!, user.fullName, {
              emergencyType: data.emergencyType,
              address: data.address,
              timestamp: sos.createdAt,
            })
            .catch(() => {});
        }
      }
    } catch (error) {
      logger.warn('Failed to notify emergency contacts:', error);
    }

    logger.info(`SOS created: ${sos.id} by user: ${userId}, type: ${data.emergencyType}`);
    return sos;
  },

  async getMyRequests(userId: string, query: { page?: string; limit?: string }) {
    const { skip, take, page, limit } = parsePagination(query);
    const [requests, total] = await sosRepository.findByUser(userId, { skip, take });
    return {
      requests,
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getById(id: string, userId: string) {
    const sos = await sosRepository.findById(id);
    if (!sos) throw ApiError.notFound('SOS request not found');
    if (sos.userId !== userId) throw ApiError.forbidden('Access denied');
    return sos;
  },

  async cancel(id: string, userId: string) {
    const sos = await sosRepository.findById(id);
    if (!sos) throw ApiError.notFound('SOS request not found');
    if (sos.userId !== userId) throw ApiError.forbidden('Not authorized to cancel this request');
    if (sos.status === SosStatus.COMPLETED || sos.status === SosStatus.CANCELLED) {
      throw ApiError.badRequest(`Cannot cancel a ${sos.status} request`);
    }

    const updated = await sosRepository.cancel(id, userId);

    // Emit socket update
    try {
      const io = getSocketServer();
      io.to(`user_${userId}`).emit(SOCKET_EVENTS.SOS_STATUS_UPDATED, {
        sosId: id,
        status: SosStatus.CANCELLED,
      });
    } catch {
      // ignore
    }

    logger.info(`SOS cancelled: ${id} by user: ${userId}`);
    return updated;
  },
};
