import { db } from '../config/database';
import { EmergencyType, Prisma, SosRequest, SosStatus } from '@prisma/client';

export const sosRepository = {
  async create(data: {
    userId: string;
    latitude: number;
    longitude: number;
    address?: string;
    emergencyType: EmergencyType;
    description?: string;
    googleMapsLink?: string;
    severity?: string;
    accidentImage?: string;
    accidentVideo?: string;
    accidentAudio?: string;
  }): Promise<SosRequest> {
    return db.sosRequest.create({ data });
  },

  async findById(id: string): Promise<SosRequest | null> {
    return db.sosRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
    });
  },

  async findByUser(
    userId: string,
    params: { skip: number; take: number },
  ): Promise<[SosRequest[], number]> {
    const where: Prisma.SosRequestWhereInput = { userId };
    const [requests, total] = await Promise.all([
      db.sosRequest.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      db.sosRequest.count({ where }),
    ]);
    return [requests, total];
  },

  async findAll(params: {
    skip: number;
    take: number;
    status?: SosStatus;
    emergencyType?: EmergencyType;
    search?: string;
  }): Promise<[SosRequest[], number]> {
    const where: Prisma.SosRequestWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.emergencyType && { emergencyType: params.emergencyType }),
      ...(params.search && {
        OR: [
          { address: { contains: params.search, mode: 'insensitive' } },
          { user: { fullName: { contains: params.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [requests, total] = await Promise.all([
      db.sosRequest.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              bloodGroup: true,
              address: true,
              gender: true,
              dob: true,
              dlNumber: true,
              vehicleType: true,
              vehicleNumber: true,
              vehicleModel: true,
              medicalConditions: true,
              currentMedications: true,
              disabilityInfo: true,
              aadhaar: true,
              insurance: true,
              organDonor: true,
              allergies: true,
              emergencyContacts: {
                select: {
                  id: true,
                  name: true,
                  relationship: true,
                  phone: true,
                  email: true
                }
              }
            }
          },
        },
      }),
      db.sosRequest.count({ where }),
    ]);
    return [requests, total];
  },

  async updateStatus(
    id: string,
    status: SosStatus,
    assignedService?: string,
  ): Promise<SosRequest> {
    return db.sosRequest.update({
      where: { id },
      data: { status, ...(assignedService && { assignedService }) },
    });
  },

  async cancel(id: string, userId: string): Promise<SosRequest> {
    return db.sosRequest.update({
      where: { id, userId },
      data: { status: SosStatus.CANCELLED },
    });
  },

  // Analytics
  async getStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    byType: Record<string, number>;
  }> {
    const [total, pending, inProgress, completed, byType] = await Promise.all([
      db.sosRequest.count(),
      db.sosRequest.count({ where: { status: 'PENDING' } }),
      db.sosRequest.count({ where: { status: 'IN_PROGRESS' } }),
      db.sosRequest.count({ where: { status: 'COMPLETED' } }),
      db.sosRequest.groupBy({ by: ['emergencyType'], _count: true }),
    ]);

    const typeMap: Record<string, number> = {};
    byType.forEach((t) => {
      typeMap[t.emergencyType] = t._count;
    });

    return { total, pending, inProgress, completed, byType: typeMap };
  },
};
