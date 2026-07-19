import { NextResponse } from "next/server";

import { InvalidOrderError } from "@/backend/dto/order.dto";
import { BadRequestError, HttpError } from "@/backend/exception/error";

/**
 * Wraps a route handler with the shared error contract, so handlers contain
 * only their happy path.
 *
 * - `HttpError` subclasses become their own status + message.
 * - Known domain errors are translated (see `toHttpError`).
 * - Anything else is logged server-side and returned as a generic 500 — internal
 *   messages must never reach the client.
 */

type RouteContext = { params: Promise<Record<string, string>> };

type Handler<T> = (
  request: Request,
  context: RouteContext,
) => Promise<T | NextResponse>;

/** Maps domain errors onto HTTP ones, keeping services free of HTTP concerns. */
function toHttpError(error: unknown): HttpError | null {
  if (error instanceof HttpError) return error;
  // Invalid carts are a client mistake, not a server fault.
  if (error instanceof InvalidOrderError) {
    return new BadRequestError(error.message);
  }
  return null;
}

/** e.g. `POST /api/orders` — identifies the route in logs, derived not passed. */
function describeRequest(request: Request): string {
  try {
    return `${request.method} ${new URL(request.url).pathname}`;
  } catch {
    return request.method;
  }
}

export function withErrorHandling<T>(handler: Handler<T>) {
  return async (
    request: Request,
    context: RouteContext,
  ): Promise<NextResponse> => {
    try {
      const result = await handler(request, context);
      // Handlers may return a NextResponse directly (custom status/headers) or
      // a plain value to be serialised as 200 JSON.
      return result instanceof NextResponse
        ? result
        : NextResponse.json(result);
    } catch (error) {
      const httpError = toHttpError(error);

      if (httpError) {
        return NextResponse.json(
          { error: httpError.message, ...httpError.details },
          { status: httpError.status },
        );
      }

      console.error(`[${describeRequest(request)}] unhandled error`, error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

/** Parses a JSON body, turning malformed input into a 400. */
export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new BadRequestError("Invalid JSON body");
  }
}
