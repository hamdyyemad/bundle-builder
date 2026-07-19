# Bundle Builder

A Next.js bundle builder for a home security system: pick cameras, a plan,
sensors and extras across an accordion flow, with a live review panel and
checkout. The catalog is stored in Postgres so products can be edited without a
redeploy.

## Quick start

```bash
pnpm install                 # runs `prisma generate` via postinstall
cp .env.example .env         # then fill in the values
pnpm db:up                   # start Postgres (Docker, host port 5433)
pnpm db:migrate              # apply migrations
pnpm db:seed                 # load the catalog
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> Postgres runs on host port **5433**, not 5432, to avoid colliding with a
> locally installed Postgres. See [docs/03-database.md](docs/03-database.md) if
> you hit an authentication error.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string |
| `REVALIDATE_SECRET` | yes | Bearer token for `POST /api/revalidate` |
| `APP_URL` | no | Absolute origin for server-side fetches; falls back to `VERCEL_URL`, then localhost |

## Scripts

| Command | Does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint |
| `pnpm test:pricing` | Assert backend and frontend pricing agree |
| `pnpm db:up` / `db:down` | Start / stop the Postgres container |
| `pnpm db:migrate` / `db:deploy` | Apply migrations (dev / prod) |
| `pnpm db:seed` | Seed the catalog (idempotent) |
| `pnpm db:studio` | Browse and edit rows in Prisma Studio |

## Structure

```
src/
  app/          Next.js entry + API route handlers
  backend/      repository / service / dto / middleware / exception
  frontend/     api / providers / components / hooks / lib / data
prisma/         schema, migrations, seed
docs/           architecture and database notes
```

The frontend never imports the backend, and the backend never imports the
frontend — they talk over HTTP. Both rules are greppable:

```bash
grep -rn "@/backend" src/frontend    # must be empty
grep -rn "@/frontend" src/backend    # must be empty
```

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/catalog` | Catalog (steps, products, plans, advantages) |
| `POST /api/orders` | Place an order — repriced server-side |
| `POST /api/revalidate` | Bust the catalog cache after an edit |

Orders are **always repriced from the catalog**. Prices sent by a client are
ignored, and quantities are clamped to `countInStock`.

## Editing the catalog

Change rows with `pnpm db:studio` (or SQL), then invalidate the cache:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer $REVALIDATE_SECRET"
```

Invalidation is stale-while-revalidate — the first page load after revalidating
still shows the old value, the next one is correct.

## Pricing rules are duplicated

`src/backend/service/pricing.ts` (what the customer is charged) and
`src/frontend/lib/bundle.ts` (what they see) implement the same rules
independently. **Change one, change the other**, then run:

```bash
pnpm test:pricing
```

It runs 8 carts through both and fails if the totals disagree.

## Docker

```bash
docker build -t bundle-builder .
docker run -d --name bundle-builder -p 3001:3000 \
  -e DATABASE_URL="postgresql://bundle:bundle@host.docker.internal:5433/bundle_builder?schema=public" \
  -e REVALIDATE_SECRET="..." \
  bundle-builder
```

`host.docker.internal` lets the container reach the `pnpm db:up` Postgres running
on your host. The build itself needs no database.

```bash
docker logs -f bundle-builder   # follow logs
docker stop bundle-builder      # stop
docker rm bundle-builder        # remove stopped container
```

The app image needs a reachable Postgres — `docker-compose.yml` only starts the
database, not the app.

## Deploy on Vercel

Vercel does not use the Dockerfile; it builds Next.js on its own platform.

1. Provision Postgres (e.g. the Neon integration) and set `DATABASE_URL`.
2. Set `REVALIDATE_SECRET` — `openssl rand -hex 32`.
3. Build command: `prisma migrate deploy && next build`.
4. Run `pnpm db:seed` once against production.

Full details in [docs/03-database.md](docs/03-database.md).

## Docs

- [01 — Bundle Builder](docs/01-bundle-builder.md) — feature, UI, state flow
- [02 — Architecture](docs/02-architecture.md) — layering, request flow, caching
- [03 — Database & Prisma](docs/03-database.md) — schema, migrations, seeding
