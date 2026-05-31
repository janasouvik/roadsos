import { db } from '../config/database';
import { Prisma, Role, User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'>;

const safeUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  isVerified: true,
  isBlocked: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
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
};

export const userRepository = {
  async findById(id: string): Promise<SafeUser | null> {
    return db.user.findUnique({ where: { id }, select: safeUserSelect });
  },

  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({ where: { email } });
  },

  async findByPhone(phone: string): Promise<User | null> {
    return db.user.findUnique({ where: { phone } });
  },

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return db.user.findUnique({ where: { email } });
  },

  async create(data: Prisma.UserCreateInput): Promise<SafeUser> {
    return db.user.create({
      data: {
        ...data,
        role: data.role ?? Role.USER,
      },
      select: safeUserSelect,
    });
  },

  async update(id: string, data: Prisma.UserUpdateInput): Promise<SafeUser> {
    return db.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  },

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await db.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  },

  async updateLastLogin(id: string): Promise<void> {
    await db.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  },

  async markVerified(id: string): Promise<void> {
    await db.user.update({
      where: { id },
      data: { isVerified: true },
    });
  },

  async blockUser(id: string): Promise<void> {
    await db.user.update({ where: { id }, data: { isBlocked: true } });
  },

  async unblockUser(id: string): Promise<void> {
    await db.user.update({ where: { id }, data: { isBlocked: false } });
  },

  async delete(id: string): Promise<void> {
    await db.user.delete({ where: { id } });
  },

  async findAll(params: {
    skip: number;
    take: number;
    search?: string;
    role?: Role;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<[SafeUser[], number]> {
    const where: Prisma.UserWhereInput = {
      ...(params.search && {
        OR: [
          { fullName: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
          { phone: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.role && { role: params.role }),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy ?? { createdAt: 'desc' },
        select: safeUserSelect,
      }),
      db.user.count({ where }),
    ]);

    return [users, total];
  },
};
