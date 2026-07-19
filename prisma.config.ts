import "dotenv/config";

import { defineConfig } from "prisma/config";

/**
 * Prisma 7 config. Holds the Migrate connection URL (which no longer lives in
 * schema.prisma) and wires the seed script.
 *
 * `DATABASE_URL` is read directly rather than via `env()`: `env()` throws at
 * config load when the variable is unset, which breaks `prisma generate` during
 * `docker build`, where no database is configured and none is needed. Commands
 * that actually connect (`migrate`, `db seed`) still fail loudly without it.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
