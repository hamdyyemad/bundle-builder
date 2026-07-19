import { revalidatePath, revalidateTag } from "next/cache";

// Exceptions
import {
  ServiceUnavailableError,
  UnauthorizedError,
} from "@/backend/exception";

// Middleware
import { withErrorHandling } from "@/backend/middleware";

// Service
import { CATALOG_CACHE_TAG } from "@/backend/service/catalog.service";

/** Length-safe compare so the secret can't be probed byte by byte. */
function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i += 1) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Busts the cached catalog after an edit, so changes appear without a redeploy.
 *
 * Call with `Authorization: Bearer $REVALIDATE_SECRET`.
 */
export const POST = withErrorHandling(async (request: Request) => {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    console.error("REVALIDATE_SECRET is not set; refusing the request");
    throw new ServiceUnavailableError("Not configured");
  }

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secretMatches(provided, expected)) {
    throw new UnauthorizedError();
  }

  // "max": the catalog stays cached until explicitly invalidated here.
  revalidateTag(CATALOG_CACHE_TAG, "max");
  // The tag clears the data cache, but "/" is rendered from it — without this
  // the stale shell would keep being served.
  revalidatePath("/");

  return { revalidated: true, tag: CATALOG_CACHE_TAG };
});
