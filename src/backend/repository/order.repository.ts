import "server-only";

import { prisma } from "@/backend/repository/db";

export type OrderLineInput = {
  itemId: string;
  variantId: string | null;
  name: string;
  quantity: number;
  unitPriceCents: number;
  compareAtPriceCents: number | null;
  lineTotalCents: number;
};

export type OrderInput = {
  totalCents: number;
  originalTotalCents: number;
  savingsCents: number;
  lines: OrderLineInput[];
};

/** Writes the order and its lines in a single nested create. */
export async function insertOrder(input: OrderInput) {
  return prisma.order.create({
    data: {
      totalCents: input.totalCents,
      originalTotalCents: input.originalTotalCents,
      savingsCents: input.savingsCents,
      lines: { create: input.lines },
    },
    include: { lines: true },
  });
}
