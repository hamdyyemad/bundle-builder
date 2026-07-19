// Middleware
import { withErrorHandling } from "@/backend/middleware";

// Service
import { getCatalog } from "@/backend/service/catalog.service";

/**
 * Catalog read endpoint.
 *
 * The service caches on the `catalog` tag, so this stays cheap under repeated
 * calls and is invalidated by POST /api/revalidate rather than by a timer.
 */
export const GET = withErrorHandling(() => getCatalog());
