import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding initial data...");

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: "demo" },
    update: {},
    create: {
      name: "PropCare Demo",
      subdomain: "demo",
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@propcare.ch" },
    update: {},
    create: {
      email: "admin@propcare.ch",
      password: hashedPassword,
      name: "System Admin",
      role: "ADMIN",
      tenantId: tenant.id,
    },
  });

  // Create sample properties
  await prisma.property.upsert({
    where: { id: "prop-1" },
    update: {},
    create: {
      id: "prop-1",
      name: "Residence du Lac",
      address: "Quai du Mont-Blanc 12",
      zipCode: "1201",
      city: "Geneva",
      tenantId: tenant.id,
    },
  });

  await prisma.property.upsert({
    where: { id: "prop-2" },
    update: {},
    create: {
      id: "prop-2",
      name: "Zürich Heights",
      address: "Bahnhofstrasse 45",
      zipCode: "8001",
      city: "Zürich",
      tenantId: tenant.id,
    },
  });

  // Create sample contractors
  await prisma.contractor.upsert({
    where: { id: "cont-1" },
    update: {},
    create: {
      id: "cont-1",
      name: "Swiss Plumbing Pros",
      email: "info@swissplumbing.ch",
      phone: "+41 22 123 45 67",
      tradeType: "Plumbing",
      zipCodes: "1201, 1202, 1203",
      cities: "Geneva",
      tenantId: tenant.id,
    },
  });

  await prisma.contractor.upsert({
    where: { id: "cont-2" },
    update: {},
    create: {
      id: "cont-2",
      name: "Zürich Electricians",
      email: "service@zurelec.ch",
      phone: "+41 44 987 65 43",
      tradeType: "Electrical",
      zipCodes: "8001, 8002, 8003",
      cities: "Zürich",
      tenantId: tenant.id,
    },
  });

  console.log("Seed completed.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
