import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Demo Tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'PropCare Demo',
      subdomain: 'demo',
    },
  });

  console.log(`Tenant created: ${tenant.name}`);

  // Create Demo User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Demo Admin',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log(`User created: ${user.name}`);

  // Create Demo Property
  const property = await prisma.property.create({
    data: {
      name: 'Sunset Apartments',
      address: '123 Sunshine Blvd',
      city: 'Los Angeles',
      zipCode: '90001',
      tenantId: tenant.id,
    },
  });

  console.log(`Property created: ${property.name}`);

  // Create some contractors
  await prisma.contractor.createMany({
    data: [
      { 
        name: "John's Plumbing", 
        email: 'john@plumbing.com', 
        phone: '555-0101', 
        tradeType: 'PLUMBING', 
        zipCodes: '90001,90002', 
        cities: 'Los Angeles',
        tenantId: tenant.id 
      },
      { 
        name: 'Sparky Electric', 
        email: 'info@sparky.com', 
        phone: '555-0202', 
        tradeType: 'ELECTRICAL', 
        zipCodes: '90001,90005', 
        cities: 'Los Angeles',
        tenantId: tenant.id 
      },
      { 
        name: 'Cool Air HVAC', 
        email: 'service@coolair.com', 
        phone: '555-0303', 
        tradeType: 'HVAC', 
        zipCodes: '90001,90010', 
        cities: 'Los Angeles',
        tenantId: tenant.id 
      },
    ],
  });

  console.log('Contractors created');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
