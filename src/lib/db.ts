import { PrismaClient } from "@prisma/client";

// Postgres (via Neon) has no meaningful "just use a local file" fallback the
// way SQLite did — DATABASE_URL must be set for the app's data layer to
// work at all. Failing loudly here beats a cryptic connection error deep
// inside the first query that actually runs.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add your Neon Postgres connection string to the environment (locally in .env, and in Vercel's Environment Variables for deployment)."
  );
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
