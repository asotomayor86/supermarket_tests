import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // directUrl → conexión directa para migraciones (sin PgBouncer)
    // url        → conexión pooled para runtime serverless (con PgBouncer)
    url:       process.env["POSTGRES_URL_NON_POOLING"],
    // Prisma migrate usa `url`; el cliente en runtime usará POSTGRES_PRISMA_URL
    // configurado en src/lib/prisma.ts vía adapter o variable de entorno
  },
});
