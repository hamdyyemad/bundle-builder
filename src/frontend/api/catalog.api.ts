import type { BundleCatalog } from "@/frontend/lib/bundle";

/**
 * Catalog access for the frontend.
 *
 * Talks to `GET /api/catalog` over HTTP — the frontend has no compile-time
 * knowledge of the backend. Called from server components during SSR so the
 * catalog is present in the first paint.
 */

/**
 * Absolute origin for server-side fetches — relative URLs have no base outside
 * the browser.
 *
 * Prefers the *incoming* request's host so the app calls itself on whatever
 * origin it is actually being served from. This matters on Vercel: `VERCEL_URL`
 * is the deployment-specific hostname, which sits behind deployment protection,
 * so fetching it from the server hits an auth wall instead of the API.
 */
async function resolveBaseUrl(): Promise<string> {
  const explicit = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  // Available during SSR; absent at build time.
  try {
    const { headers } = await import("next/headers");
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    if (host) {
      const protocol =
        headerList.get("x-forwarded-proto") ??
        (host.startsWith("localhost") || host.startsWith("127.0.0.1")
          ? "http"
          : "https");
      return `${protocol}://${host}`;
    }
  } catch {
    // Not in a request scope — fall through to the env-based defaults.
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
}

export class CatalogRequestError extends Error {}

export async function getCatalog(): Promise<BundleCatalog> {
  const response = await fetch(`${await resolveBaseUrl()}/api/catalog`, {
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
