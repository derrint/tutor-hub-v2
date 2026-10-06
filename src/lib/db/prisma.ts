import { PrismaClient } from "@prisma/client";

/** Bump when the Prisma schema changes so dev HMR does not keep a stale client. */
const PRISMA_SCHEMA_FINGERPRINT = "monthly-report-content-json-v1";

type PrismaGlobal = {
  prisma?: PrismaClient;
  prismaSchemaFingerprint?: string;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaFingerprint !== PRISMA_SCHEMA_FINGERPRINT
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaFingerprint = PRISMA_SCHEMA_FINGERPRINT;
}
