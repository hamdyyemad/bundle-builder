import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client over the pg driver adapter.
 *
 * Cached on `globalThis` so dev hot-reload and serverless warm invocations reuse
 * one pool instead of opening a new one per module reload.
 *
 * Construction is **lazy**: `next build` imports route modules to collect page
 * data, and no database is configured during `docker build`. Connecting at
 * import time would fail the build. The client is created on first use instead,
 * so a missing `DATABASE_URL` surfaces when a query actually runs.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function getClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;

  const client = createClient();
  // Reuse across hot reloads in dev and warm invocations in serverless.
  globalForPrisma.prisma = client;
  return client;
}

/** Proxy so `prisma.x` builds the client on first access, not on import. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getClient(), property, receiver);
  },
});
