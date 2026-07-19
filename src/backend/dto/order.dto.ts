/** Request/response contracts for the orders endpoint. */

/** Cart as sent by the client: line key (`productId` or `productId:variantId`) -> quantity. */
export type CreateOrderDto = {
  quantities: Record<string, number>;
};

export type OrderLineDto = {
  itemId: string;
  variantId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderDto = {
  id: string;
  total: number;
  originalTotal: number;
  savings: number;
  lines: OrderLineDto[];
};

export class InvalidOrderError extends Error {}

/** Rejects anything that isn't a `Record<string, positive int>`. */
export function parseCreateOrderDto(body: unknown): CreateOrderDto {
  if (typeof body !== "object" || body === null) {
    throw new InvalidOrderError("Body must be an object");
  }

  const { quantities } = body as { quantities?: unknown };
  if (typeof quantities !== "object" || quantities === null) {
    throw new InvalidOrderError("`quantities` must be an object");
  }

  const parsed: Record<string, number> = {};
  for (const [key, value] of Object.entries(quantities)) {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
      throw new InvalidOrderError(
        `Quantity for "${key}" must be a positive integer`,
      );
    }
    parsed[key] = value;
  }

  return { quantities: parsed };
}
