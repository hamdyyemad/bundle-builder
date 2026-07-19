import "server-only";

import { unstable_cache } from "next/cache";

import type { CatalogDto } from "@/backend/dto/catalog.dto";
import {
  toAdvantageDto,
  toPlanDto,
  toProductDto,
  toStepDto,
} from "@/backend/dto/catalog.mapper";
import { findCatalogRows } from "@/backend/repository/catalog.repository";

/** Cache tag for the whole catalog; busted by POST /api/revalidate. */
export const CATALOG_CACHE_TAG = "catalog";

/** Catalog plus the category ordering used to sort review lines. */
export type CatalogBundle = {
  catalog: CatalogDto;
  categoryOrder: string[];
};

async function loadCatalog(): Promise<CatalogBundle> {
  const rows = await findCatalogRows();

  return {
    catalog: {
      financingLabel: rows.financingLabel,
      steps: rows.steps.map((step) => toStepDto(step, rows.steps.length)),
      products: rows.products.map(toProductDto),
      plans: rows.plans.map(toPlanDto),
      advantages: rows.advantages.map(toAdvantageDto),
    },
    categoryOrder: rows.categoryOrder,
  };
}

/**
 * Cached catalog read.
 *
 * The catalog changes rarely but is read on every render, so results are cached
 * indefinitely and invalidated by tag on edit rather than expiring on a timer.
 */
const getCatalogBundle = unstable_cache(loadCatalog, ["catalog"], {
  tags: [CATALOG_CACHE_TAG],
});

export async function getCatalog(): Promise<CatalogDto> {
  return (await getCatalogBundle()).catalog;
}

/** Category ids in review-display order, straight from the DB. */
export async function getCategoryOrder(): Promise<string[]> {
  return (await getCatalogBundle()).categoryOrder;
}
