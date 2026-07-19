# 02 — Architecture

How the app is split into frontend and backend, and the rules that keep them apart.

## Layout

```
src/
  app/                              # Next.js entry
    page.tsx                        # Server component: fetches catalog, renders provider
    api/
      catalog/route.ts              # GET  — catalog read
      orders/route.ts               # POST — place an order
      revalidate/route.ts           # POST — bust the catalog cache
  backend/
    repository/                     # Data access only (Prisma)
      db.ts                         # PrismaClient + pg adapter, globally cached
      catalog.repository.ts         # findCatalogRows()
      order.repository.ts           # insertOrder()
    service/                        # Business logic
      catalog.service.ts            # Caching + tag invalidation
      order.service.ts              # Validation, repricing, stock clamping
      pricing.ts                    # Authoritative pricing rules
    dto/                            # Contracts + mapping
      catalog.dto.ts                # Backend-owned catalog types
      catalog.mapper.ts             # DB rows -> DTOs, cents <-> dollars
      order.dto.ts                  # Request/response shapes + parser
    middleware/
      route-handler.ts              # withErrorHandling(), parseJsonBody()
    exception/
      error.ts                      # HttpError + status subclasses
  frontend/
    api/                            # The only place that calls the API
      catalog.api.ts                # GET /api/catalog (server-side)
      orders.api.ts                 # POST /api/orders (browser)
    providers/
      CatalogProvider.tsx           # Carries catalog into client components
    components/ hooks/ lib/ data/   # See 01-bundle-builder.md
```

## Dependency rules

Two rules, both enforceable by grep:

```bash
grep -rn "@/backend" src/frontend    # must be empty
grep -rn "@/frontend" src/backend    # must be empty
```

- **The frontend never imports the backend.** It talks to the API over HTTP.
- **The backend never imports the frontend.** It owns its own types in `dto/`.
- `src/app/api/*` route handlers *do* import `@/backend` — they are the backend's
  HTTP surface, not frontend code.

## Request flow

```
page.tsx (server component)
  └─ frontend/api/catalog.api.ts  ── HTTP ──▶ app/api/catalog/route.ts
                                                └─ service/catalog.service.ts   (cached)
                                                     └─ repository/catalog.repository.ts
                                                          └─ Prisma ─▶ Postgres
  └─ CatalogProvider ─▶ client components (useCatalog)

Checkout (browser)
  useBundleBuilder.checkout()
    └─ frontend/api/orders.api.ts ── HTTP ──▶ app/api/orders/route.ts
                                                └─ service/order.service.ts
                                                     └─ repository/order.repository.ts
```

### Why two fetch styles

`orders.api.ts` uses a relative URL (`fetch("/api/orders")`) because it runs in
the browser, which resolves it against the current origin.

`catalog.api.ts` builds an absolute URL because it runs on the server during SSR,
where there is no document to be relative to — a relative URL throws there. The
base comes from `APP_URL`, then `VERCEL_URL`, then `http://127.0.0.1:$PORT`.

## Error handling

Route handlers contain only their happy path. `withErrorHandling` wraps them:

| Thrown | Response |
| --- | --- |
| `HttpError` subclass | Its own status + message |
| `InvalidOrderError` | 400 + message |
| Anything else | 500 `{"error":"Internal server error"}`, full error logged server-side |

Handlers return a plain value (serialised as 200 JSON) or a `NextResponse` when
they need a custom status — that is how `POST /api/orders` returns 201.

The log label (`[POST /api/orders] unhandled error`) is derived from the request,
so it cannot drift from the real path.

Available errors in `exception/error.ts`: `BadRequestError` (400),
`UnauthorizedError` (401), `NotFoundError` (404), `ServiceUnavailableError` (503).

## Caching

The catalog is read on every render but changes rarely, so
`catalog.service.ts` wraps the query in `unstable_cache` tagged `catalog`.
`POST /api/revalidate` calls `revalidateTag` **and** `revalidatePath("/")` —
the tag alone clears the data cache while the page keeps serving its stale shell.

Two things to know:

- `catalog.api.ts` fetches with `cache: "no-store"` **on purpose**. Caching that
  hop too would create a second cache layer the tag cannot reach, and catalog
  edits would silently never appear.
- Invalidation is stale-while-revalidate: the first request after a revalidate
  still returns the old value and regenerates behind it. **Refresh twice** before
  concluding an edit did not take.

Because the catalog is fetched over HTTP at request time, `/` is server-rendered
on demand rather than statically prerendered.

## Money

Prices are **integer cents** in the database (`priceCents: 2798`) and dollars
everywhere else. Conversion happens only in `catalog.mapper.ts` (`toDollars`,
`toCents`).

Orders denormalise `name` and `unitPriceCents` onto `OrderLine`, so editing the
catalog never rewrites order history.

## Pricing is duplicated — on purpose

`backend/service/pricing.ts` and `frontend/lib/bundle.ts` implement the same
rules. The backend copy decides what the customer is **charged**; the frontend
copy decides what they **see**.

The server never trusts client-supplied prices: `order.service.ts` reprices every
line from the catalog and clamps quantities to `countInStock`.

If you change a pricing rule, change it in both files and run:

```bash
pnpm test:pricing
```

That script runs 8 carts through both implementations and fails if the totals
disagree. It is the only thing preventing the UI from displaying one total while
the server charges another.
