import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

if (process.env.PROPC_DATABASE_URL) {
  process.env.PROPC_DATABASE_URL = process.env.PROPC_DATABASE_URL.trim();
}

if (!process.env.PROPC_DATABASE_URL || process.env.PROPC_DATABASE_URL === "undefined") {
  throw new Error("[Prisma] CRITICAL: PROPC_DATABASE_URL is missing. Check your .env file.");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  (() => {
    if (globalForPrisma.prisma) {
      console.log("[Prisma] Using existing global PrismaClient instance");
      return globalForPrisma.prisma;
    }
    console.log("[Prisma] Initializing new PrismaClient instance");
    
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.PROPC_DATABASE_URL,
        },
      },
      log: ["query", "info", "warn", "error"],
    });
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
