import { userRepository } from '../repositories/user.repository';
import { sosRepository } from '../repositories/sos.repository';
import { db } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { logger } from '../config/logger';
import { SosStatus } from '@prisma/client';
import { getSocketServer } from '../sockets';
import { SOCKET_EVENTS } from '../constants';

export const adminService = {
  async getUsers(query: {
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { skip, take, page, limit } = parsePagination(query);
    const [users, total] = await userRepository.findAll({
      skip,
      take,
      search: query.search,
      role: query.role as any,
    });
    return { users, meta: buildPaginationMeta(total, page, limit) };
  },

  async blockUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    await userRepository.blockUser(id);
    logger.info(`User blocked by admin: ${id}`);
    return { message: 'User blocked successfully' };
  },

  async unblockUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    await userRepository.unblockUser(id);
    logger.info(`User unblocked by admin: ${id}`);
    return { message: 'User unblocked successfully' };
  },

  async deleteUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    await userRepository.delete(id);
    logger.info(`User deleted by admin: ${id}`);
    return { message: 'User deleted successfully' };
  },

  async getSosRequests(query: {
    page?: string;
    limit?: string;
    status?: string;
    emergencyType?: string;
    search?: string;
  }) {
    const { skip, take, page, limit } = parsePagination(query);
    const [requests, total] = await sosRepository.findAll({
      skip,
      take,
      status: query.status as SosStatus | undefined,
      emergencyType: query.emergencyType as any,
      search: query.search,
    });
    return { requests, meta: buildPaginationMeta(total, page, limit) };
  },

  async getAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalUsers,
      newUsersThisMonth,
      totalSos,
      sosThisWeek,
      sosStats,
      verifiedUsers,
      blockedUsers,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.sosRequest.count(),
      db.sosRequest.count({ where: { createdAt: { gte: startOfWeek } } }),
      sosRepository.getStats(),
      db.user.count({ where: { isVerified: true } }),
      db.user.count({ where: { isBlocked: true } }),
    ]);

    return {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        verified: verifiedUsers,
        blocked: blockedUsers,
      },
      sos: {
        total: totalSos,
        thisWeek: sosThisWeek,
        pending: sosStats.pending,
        inProgress: sosStats.inProgress,
        completed: sosStats.completed,
        byType: sosStats.byType,
      },
    };
  },

  async updateSosStatus(id: string, status: SosStatus, assignedService?: string) {
    const sos = await sosRepository.findById(id);
    if (!sos) throw ApiError.notFound('SOS request not found');

    const updated = await sosRepository.updateStatus(id, status, assignedService);

    // Emit Socket.IO event to notify the user
    try {
      const io = getSocketServer();
      io.to(`user_${sos.userId}`).emit(SOCKET_EVENTS.SOS_STATUS_UPDATED, {
        sosId: id,
        status,
        assignedService,
      });
    } catch (err) {
      logger.warn(`Failed to emit socket update for SOS: ${id}`);
    }

    logger.info(`SOS ${id} status updated to ${status} by admin`);
    return updated;
  },
};
