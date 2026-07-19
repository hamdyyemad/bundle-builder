import "server-only";

import { toCents } from "@/backend/dto/catalog.mapper";
import {
  InvalidOrderError,
  type CreateOrderDto,
  type OrderDto,
} from "@/backend/dto/order.dto";
import { insertOrder } from "@/backend/repository/order.repository";
import {
  getCatalog,
  getCategoryOrder,
} from "@/backend/service/catalog.service";
import {
  buildPricedLines,
  calculateTotals,
  parseLineKey,
} from "@/backend/service/pricing";

/**
 * Prices and persists an order.
 *
 * Prices come from the catalog, never from the request — a client can choose
 * *what* to buy but not what it costs. Quantities are clamped to `countInStock`
 * and unknown line keys are rejected.
 */
export async function createOrder(dto: CreateOrderDto): Promise<OrderDto> {
  const [catalog, categoryOrder] = await Promise.all([
    getCatalog(),
    getCategoryOrder(),
  ]);

  const known = new Set<string>();
  for (const product of catalog.products) {
    known.add(product.id);
    for (const variant of product.variants) {
      known.add(`${product.id}:${variant.id}`);
    }
  }
  for (const plan of catalog.plans) known.add(plan.id);
  for (const advantage of catalog.advantages) known.add(advantage.id);

  const quantities: Record<string, number> = {};
  for (const [key, quantity] of Object.entries(dto.quantities)) {
    if (!known.has(key)) {
      throw new InvalidOrderError(`Unknown item "${key}"`);
    }

    const { productId } = parseLineKey(key);
    const max = catalog.products.find(
      (item) => item.id === productId,
    )?.countInStock;
    quantities[key] = max != null ? Math.min(quantity, max) : quantity;
  }

  const lines = buildPricedLines(catalog, quantities, categoryOrder);
  if (lines.length === 0) {
    throw new InvalidOrderError("Order is empty");
  }

  const totals = calculateTotals(catalog, lines);

  const order = await insertOrder({
    totalCents: toCents(totals.total),
    originalTotalCents: toCents(totals.originalTotal),
    savingsCents: toCents(totals.savings),
    lines: lines.map((line) => ({
      itemId: line.productId,
      variantId: line.variantId ?? null,
      name: line.name,
      quantity: line.quantity,
      unitPriceCents: toCents(line.unitPrice),
      compareAtPriceCents:
        line.compareAtPrice != null ? toCents(line.compareAtPrice) : null,
      lineTotalCents: toCents(line.lineTotal),
    })),
  });

  return {
    id: order.id,
    total: order.totalCents / 100,
    originalTotal: order.originalTotalCents / 100,
    savings: order.savingsCents / 100,
    lines: order.lines.map((line) => ({
      itemId: line.itemId,
      variantId: line.variantId,
      name: line.name,
      quantity: line.quantity,
      unitPrice: line.unitPriceCents / 100,
      lineTotal: line.lineTotalCents / 100,
    })),
  };
}
