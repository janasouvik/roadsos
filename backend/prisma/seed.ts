import { PrismaClient, Role, ServiceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const hashedPassword = await bcrypt.hash('Admin@123456', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@roadsos.com' },
    update: {},
    create: {
      fullName: 'Super Admin',
      email: 'superadmin@roadsos.com',
      phone: '+919999999999',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isVerified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@roadsos.com' },
    update: {},
    create: {
      fullName: 'ROADSOS Admin',
      email: 'admin@roadsos.com',
      phone: '+918888888888',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  const policeAdmin = await prisma.user.upsert({
    where: { email: 'admin.police@roadsos.com' },
    update: {},
    create: {
      fullName: 'Police Admin',
      email: 'admin.police@roadsos.com',
      phone: '+917777777777',
      password: hashedPassword,
      role: Role.POLICE,
      isVerified: true,
    },
  });

  const hospitalAdmin = await prisma.user.upsert({
    where: { email: 'admin.hospital@roadsos.com' },
    update: {},
    create: {
      fullName: 'Hospital Admin',
      email: 'admin.hospital@roadsos.com',
      phone: '+916666666666',
      password: hashedPassword,
      role: Role.HOSPITAL,
      isVerified: true,
    },
  });

  console.log(`✅ Created super admin: ${superAdmin.email}`);
  console.log(`✅ Created admin: ${admin.email}`);
  console.log(`✅ Created police admin: ${policeAdmin.email}`);
  console.log(`✅ Created hospital admin: ${hospitalAdmin.email}`);

  // Seed Service Providers
  const providers = [
    {
      name: 'AIIMS Delhi Emergency',
      type: ServiceType.HOSPITAL,
      address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, 110029',
      phone: '+911126588500',
      latitude: 28.5672,
      longitude: 77.2100,
    },
    {
      name: 'Safdarjung Hospital',
      type: ServiceType.HOSPITAL,
      address: 'Sri Aurobindo Marg, New Delhi, 110029',
      phone: '+911126707444',
      latitude: 28.5706,
      longitude: 77.2042,
    },
    {
      name: 'Delhi Ambulance Services',
      type: ServiceType.AMBULANCE,
      address: 'Connaught Place, New Delhi',
      phone: '+91102',
      latitude: 28.6315,
      longitude: 77.2167,
    },
    {
      name: 'Mumbai Ambulance Network',
      type: ServiceType.AMBULANCE,
      address: 'Nariman Point, Mumbai, 400021',
      phone: '+91108',
      latitude: 18.9256,
      longitude: 72.8242,
    },
    {
      name: 'Delhi Police Emergency',
      type: ServiceType.POLICE,
      address: 'Parliament Street, New Delhi, 110001',
      phone: '+91100',
      latitude: 28.6189,
      longitude: 77.2133,
    },
    {
      name: 'Maharashtra State Police',
      type: ServiceType.POLICE,
      address: 'Crawford Market, Mumbai, 400001',
      phone: '+91100',
      latitude: 18.9470,
      longitude: 72.8371,
    },
    {
      name: 'National Highway Towing',
      type: ServiceType.TOWING,
      address: 'NH-48, Gurugram, Haryana',
      phone: '+911800111222',
      latitude: 28.4595,
      longitude: 77.0266,
    },
    {
      name: 'NDRF Rescue Unit Delhi',
      type: ServiceType.RESCUE,
      address: 'Greater Noida, Uttar Pradesh',
      phone: '+911800113462',
      latitude: 28.4744,
      longitude: 77.5040,
    },
  ];

  for (const provider of providers) {
    await prisma.serviceProvider.upsert({
      where: { id: provider.phone },
      update: {},
      create: {
        ...provider,
        isAvailable: true,
      },
    });
  }

  console.log(`✅ Seeded ${providers.length} service providers`);
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
