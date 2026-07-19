/**
 * Orders API client.
 *
 * Runs in the browser and talks to `/api/orders` over HTTP — no backend import,
 * so none of the server code reaches the client bundle.
 */

export type OrderLineResponse = {
  itemId: string;
  variantId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderResponse = {
  id: string;
  total: number;
  originalTotal: number;
  savings: number;
  lines: OrderLineResponse[];
};

/** Thrown for a non-2xx response, carrying the server's message. */
export class OrderRequestError extends Error {}

export async function createOrder(
  quantities: Record<string, number>,
): Promise<OrderResponse> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantities }),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new OrderRequestError("Server returned an unreadable response");
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      typeof (payload as { error?: unknown }).error === "string"
        ? (payload as { error: string }).error
        : "Checkout failed";
    throw new OrderRequestError(message);
  }

  return payload as OrderResponse;
}
