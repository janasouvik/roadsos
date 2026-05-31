import { PrismaClient, ServiceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================
  // SEED ADMIN USER
  // ============================
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@roadguardian.com' },
    update: {},
    create: {
      fullName: 'Road Guardian Admin',
      email: 'admin@roadguardian.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isVerified: true,
      phone: '+919876543210',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // ============================
  // SEED TEST USER
  // ============================
  const userPassword = await bcrypt.hash('User@123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@roadguardian.com' },
    update: {},
    create: {
      fullName: 'Test User',
      email: 'test@roadguardian.com',
      password: userPassword,
      role: 'USER',
      isVerified: true,
      phone: '+919876543211',
    },
  });
  console.log('✅ Test user created:', testUser.email);

  // ============================
  // SEED SERVICE PROVIDERS
  // ============================
  const services = [
    // Bengaluru Hospitals
    { name: 'Manipal Hospital', type: ServiceType.HOSPITAL, address: 'Old Airport Rd, Bengaluru', phone: '080-2502-4444', latitude: 12.9563, longitude: 77.6477 },
    { name: 'Fortis Hospital', type: ServiceType.HOSPITAL, address: 'Bannerghatta Rd, Bengaluru', phone: '080-6621-4444', latitude: 12.8947, longitude: 77.5972 },
    { name: 'Apollo Hospital', type: ServiceType.HOSPITAL, address: 'Bannerghatta Rd, Bengaluru', phone: '080-2630-4050', latitude: 12.8924, longitude: 77.5962 },
    { name: 'Narayana Health', type: ServiceType.HOSPITAL, address: 'Bommasandra, Bengaluru', phone: '080-7122-2222', latitude: 12.8101, longitude: 77.6769 },

    // Bengaluru Ambulances
    { name: 'ZIQITZA 108 Ambulance', type: ServiceType.AMBULANCE, address: 'Central Dispatch, Bengaluru', phone: '108', latitude: 12.9716, longitude: 77.5946 },
    { name: 'GVK EMRI Ambulance', type: ServiceType.AMBULANCE, address: 'Bengaluru HQ', phone: '1800-108-1008', latitude: 12.9784, longitude: 77.6408 },

    // Police Stations
    { name: 'MG Road Police Station', type: ServiceType.POLICE, address: 'MG Road, Bengaluru', phone: '100', latitude: 12.9756, longitude: 77.6073 },
    { name: 'Indiranagar Police Station', type: ServiceType.POLICE, address: 'Indiranagar, Bengaluru', phone: '080-2520-6100', latitude: 12.9784, longitude: 77.6408 },
    { name: 'Koramangala Police Station', type: ServiceType.POLICE, address: 'Koramangala, Bengaluru', phone: '080-2552-3130', latitude: 12.9352, longitude: 77.6245 },

    // Towing
    { name: 'Quick Tow Services', type: ServiceType.TOWING, address: 'Electronic City, Bengaluru', phone: '+919845678901', latitude: 12.8459, longitude: 77.6603 },
    { name: 'City Towing & Rescue', type: ServiceType.TOWING, address: 'Whitefield, Bengaluru', phone: '+919876543220', latitude: 12.9698, longitude: 77.7499 },

    // Rescue
    { name: 'Karnataka State Fire & Emergency', type: ServiceType.RESCUE, address: 'Shivajinagar, Bengaluru', phone: '101', latitude: 12.9859, longitude: 77.6006 },
    { name: 'NDRF Team Bengaluru', type: ServiceType.RESCUE, address: 'Yelahanka, Bengaluru', phone: '1800-180-4534', latitude: 13.1004, longitude: 77.5963 },

    // Pharmacies
    { name: 'Apollo Pharmacy 24/7', type: ServiceType.PHARMACY, address: 'Koramangala, Bengaluru', phone: '1860-500-0101', latitude: 12.9352, longitude: 77.6100 },
    { name: 'MedPlus Pharmacy', type: ServiceType.PHARMACY, address: 'Indiranagar, Bengaluru', phone: '040-6000-6000', latitude: 12.9789, longitude: 77.6412 },

    // Blood Banks
    { name: 'Rotary TTK Blood Bank', type: ServiceType.BLOOD_BANK, address: 'Millers Road, Bengaluru', phone: '080-2286-3173', latitude: 12.9895, longitude: 77.5879 },
    { name: 'St. John\'s Blood Bank', type: ServiceType.BLOOD_BANK, address: 'Koramangala, Bengaluru', phone: '080-2206-5000', latitude: 12.9427, longitude: 77.6155 },
  ];

  for (const service of services) {
    await prisma.serviceProvider.upsert({
      where: { id: service.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: service.name.toLowerCase().replace(/\s+/g, '-'),
        ...service,
        isAvailable: true,
        rating: 4 + Math.random(),
      },
    });
  }
  console.log(`✅ ${services.length} service providers seeded`);

  // ============================
  // SEED EMERGENCY CONTACTS
  // ============================
  await prisma.emergencyContact.upsert({
    where: { id: 'seed-contact-1' },
    update: {},
    create: {
      id: 'seed-contact-1',
      userId: testUser.id,
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+919876543299',
      email: 'jane@example.com',
    },
  });
  console.log('✅ Emergency contacts seeded');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin: admin@roadguardian.com / Admin@123');
  console.log('   User:  test@roadguardian.com / User@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
