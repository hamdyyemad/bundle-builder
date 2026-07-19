import "server-only";

import { ItemKind } from "@prisma/client";

import { prisma } from "@/backend/repository/db";

/**
 * Raw catalog reads. No caching and no business rules — the service layer owns
 * both; this only talks to the database.
 */
export async function findCatalogRows() {
  const [steps, items, settings, categories] = await Promise.all([
    prisma.step.findMany({ orderBy: { id: "asc" } }),
    prisma.item.findMany({
      orderBy: { sortOrder: "asc" },
      include: { variants: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.catalogSettings.findUnique({ where: { id: 1 } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return {
    steps,
    products: items.filter((item) => item.kind === ItemKind.PRODUCT),
    plans: items.filter((item) => item.kind === ItemKind.PLAN),
    advantages: items.filter((item) => item.kind === ItemKind.ADVANTAGE),
    financingLabel: settings?.financingLabel ?? "",
    categoryOrder: categories.map((category) => category.id),
  };
}
