# 03 — Database & Prisma

Postgres via Prisma 7. The catalog lives in the database so products can be
edited without a redeploy.

## First-time setup

```bash
pnpm install                 # runs `prisma generate` via postinstall
cp .env.example .env         # then fill in the values
pnpm db:up                   # start Postgres in Docker
pnpm db:migrate              # create + apply migrations
pnpm db:seed                 # load the catalog from src/frontend/data/bundle/*.json
pnpm dev
```

### Local port is 5433, not 5432

`docker-compose.yml` maps Postgres to host port **5433**, because 5432 is often
taken by a locally installed Postgres. If you see
`P1000: Authentication failed`, something else is probably listening on the port
in your `DATABASE_URL`:

```bash
netstat -ano | grep ':5432'      # anything here that is not Docker will shadow the container
```

## Scripts

| Command | Does |
| --- | --- |
| `pnpm db:up` | Start the Postgres container |
| `pnpm db:down` | Stop it (data survives in the `db-data` volume) |
| `pnpm db:migrate` | Create and apply a migration from schema changes (dev) |
| `pnpm db:deploy` | Apply existing migrations without generating (prod/CI) |
| `pnpm db:seed` | Seed the catalog from JSON — idempotent |
| `pnpm db:studio` | Open Prisma Studio to browse/edit rows |

## Schema

Seven models in `prisma/schema.prisma`, mapped to snake_case tables.

| Model | Table | Purpose |
| --- | --- | --- |
| `Category` | `categories` | Ids, review headings, `sortOrder` |
| `Step` | `steps` | Accordion steps |
| `Item` | `items` | Products, plans and advantages |
| `Variant` | `variants` | Colour variants of an item |
| `CatalogSettings` | `catalog_settings` | Single row: `financingLabel` |
| `Order` | `orders` | Placed orders with server-computed totals |
| `OrderLine` | `order_lines` | Line items, denormalised |

### Three decisions worth knowing

**One `items` table, three kinds.** Products, plans and advantages differ by only
two optional columns, so they share a table with an `ItemKind` discriminator
(`PRODUCT` / `PLAN` / `ADVANTAGE`). `catalog.mapper.ts` splits them back apart on
read. Three tables would have meant three queries and a merge on every read.

**Variants use a composite key** `@@id([itemId, id])`. Variant ids repeat across
products — `white` and `black` appear on four different items — so a bare `id`
primary key would collide.

**Money is integer cents.** `priceCents: 2798`, never `27.98`. Avoids float drift
in pricing maths.

## Prisma 7 notes

Prisma 7 moved the connection URL **out of `schema.prisma`**. There is no
`url = env("DATABASE_URL")` in the datasource block. Instead:

- **Migrations** read it from `prisma.config.ts` (`datasource.url`).
- **Runtime** gets it from the driver adapter in `src/backend/repository/db.ts`:

  ```ts
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  ```

The adapter is also what makes the client work well on serverless — the client is
cached on `globalThis` so warm invocations reuse one pool.

## Seeding

`prisma/seed.ts` reads `src/frontend/data/bundle/catalog.json` and
`category.json` — the same data the app shipped with before the database existed.

It is **idempotent**: it upserts by id and prunes rows no longer present in the
JSON, so re-running it produces identical counts (10 items, 9 variants, 4 steps,
5 categories) rather than duplicates.

The JSON is now a *seed source*, not a runtime data source. Nothing reads it at
request time.

## Editing the catalog

Edit rows (Prisma Studio, SQL, or a migration), then invalidate the cache:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer $REVALIDATE_SECRET"
```

The change appears without a redeploy. Note the invalidation is
stale-while-revalidate: **the first page load after revalidating still shows the
old value**, the next one is correct.

Without a valid secret this endpoint returns 401; if `REVALIDATE_SECRET` is unset
it returns 503 and refuses.

## Docker

The `Dockerfile` copies `prisma/` and `prisma.config.ts` into the deps stage
because the `postinstall` hook runs `prisma generate`, which needs the schema
present before install. Migrations and schema are also copied into the runner so
the container can run `prisma migrate deploy` on start.

### Building without a database

There is no `DATABASE_URL` during `docker build`, and none is needed —
`prisma generate` only reads the schema. Two things make that work, and both
will break the build if reverted:

- **`prisma.config.ts` reads `process.env.DATABASE_URL` directly, not `env()`.**
  Prisma 7's `env()` throws at config load when the variable is unset, which
  fails `prisma generate` in the deps stage.
- **`repository/db.ts` constructs the Prisma client lazily** (behind a Proxy).
  `next build` imports route modules to collect page data; connecting at import
  time fails the build with `DATABASE_URL is not set`.

Commands that genuinely need a connection (`migrate`, `db seed`) still fail
loudly without it, and a missing `DATABASE_URL` at *runtime* returns a 500 with
the cause logged server-side.

Vercel ignores the Dockerfile entirely — it builds Next.js on its own platform.

## Deploying to Vercel

Nothing needs configuring in the Vercel dashboard's Build & Development
Settings — leave every field on its default. The repo handles it:

- **`vercel-build`** in `package.json` runs `prisma migrate deploy && next build`.
  Vercel prefers this script over `build` automatically, so migrations apply on
  every deploy.
- **`postinstall`** runs `prisma generate` during install.
- **`next.config.ts`** drops `output: "standalone"` when `VERCEL` is set —
  standalone is for the Docker image and Vercel builds its own output.

Steps:

1. Provision Postgres (the Neon integration works well) and set `DATABASE_URL`.
2. Set `REVALIDATE_SECRET` — generate with `openssl rand -hex 32`.
   **Never ship the `dev-only-change-me` placeholder.**
3. Deploy. The first build creates the tables.
4. Seed the catalog once, from your machine, pointed at the production database:

   ```bash
   DATABASE_URL="<production-url>" pnpm db:seed
   ```

   The seed is idempotent, so re-running it is safe.
5. Set `APP_URL` only if you are behind a proxy or custom domain — otherwise
   `VERCEL_URL` is used automatically.

### Connection pooling

Serverless functions open many short-lived connections. Use your provider's
**pooled** connection string for `DATABASE_URL` (Neon and Supabase both offer
one), or you will exhaust the connection limit under load.

Prisma Migrate needs a **direct** (unpooled) connection. If your provider
requires that split, run migrations with the direct URL rather than the pooled
one.
