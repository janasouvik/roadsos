import { db } from '../config/database';
import { EmergencyContact } from '@prisma/client';

export const contactRepository = {
  async create(data: {
    userId: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }): Promise<EmergencyContact> {
    return db.emergencyContact.create({ data });
  },

  async findByUser(userId: string): Promise<EmergencyContact[]> {
    return db.emergencyContact.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async findById(id: string, userId: string): Promise<EmergencyContact | null> {
    return db.emergencyContact.findFirst({ where: { id, userId } });
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{ name: string; relationship: string; phone: string; email: string }>,
  ): Promise<EmergencyContact> {
    return db.emergencyContact.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, userId: string): Promise<void> {
    await db.emergencyContact.deleteMany({ where: { id, userId } });
  },

  async countByUser(userId: string): Promise<number> {
    return db.emergencyContact.count({ where: { userId } });
  },
};
