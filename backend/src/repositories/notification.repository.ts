import { db } from '../config/database';
import { Notification, NotificationType } from '@prisma/client';

export const notificationRepository = {
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    return db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        ...(data.metadata && { metadata: data.metadata as object }),
      },
    });
  },

  async findByUser(
    userId: string,
    params: { skip: number; take: number },
  ): Promise<[Notification[], number]> {
    const where = { userId };
    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.count({ where }),
    ]);
    return [notifications, total];
  },

  async markRead(id: string, userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async countUnread(userId: string): Promise<number> {
    return db.notification.count({ where: { userId, isRead: false } });
  },
};
