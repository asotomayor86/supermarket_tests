import { PrismaClient } from "@prisma/client";

// En Prisma 7, la URL de conexión se pasa al constructor.
// En Vercel: POSTGRES_PRISMA_URL usa PgBouncer (pooled) → óptimo para serverless.
// En local: POSTGRES_URL_NON_POOLING es la conexión directa.
const getDatabaseUrl = () => {
  const url =
    process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error("No database URL configured");
  return url;
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
