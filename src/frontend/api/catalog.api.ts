import type { BundleCatalog } from "@/frontend/lib/bundle";

/**
 * Catalog access for the frontend.
 *
 * Talks to `GET /api/catalog` over HTTP — the frontend has no compile-time
 * knowledge of the backend. Called from server components during SSR so the
 * catalog is present in the first paint.
 */

/**
 * Absolute origin for server-side fetches (relative URLs need a base off the
 * browser). Vercel injects `VERCEL_URL`; other hosts set `APP_URL`.
 */
function resolveBaseUrl(): string {
  const explicit = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
}

export class CatalogRequestError extends Error {}

export async function getCatalog(): Promise<BundleCatalog> {
  const response = await fetch(`${resolveBaseUrl()}/api/catalog`, {
    // Do NOT cache here. The backend service already caches on the `catalog`
    // tag and is invalidated by POST /api/revalidate; a second cache layer at
    // this hop would hold stale data that the tag can't reach.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new CatalogRequestError(
      `Catalog request failed with status ${response.status}`,
    );
  }

  return (await response.json()) as BundleCatalog;
}
