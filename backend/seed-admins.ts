import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Admin@123456', 10);
  
  const users = [
    { email: 'superadmin@roadsos.com', fullName: 'Super Admin', phone: '0000000001', role: 'SUPER_ADMIN' },
    { email: 'admin.doctor@roadsos.com', fullName: 'Doctor Admin', phone: '0000000002', role: 'HOSPITAL' },
    { email: 'admin.police@roadsos.com', fullName: 'Police Admin', phone: '0000000003', role: 'POLICE' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password, role: u.role as any },
      create: {
        email: u.email,
        fullName: u.fullName,
        phone: u.phone,
        password,
        role: u.role as any,
        isVerified: true
      }
    });
    console.log(`Upserted ${u.email}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
