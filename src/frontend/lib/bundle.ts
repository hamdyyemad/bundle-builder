import { CATEGORY_ORDER, ProductCategory } from "@/frontend/lib/categories";
import type { ProductCategory as CategoryId } from "@/frontend/lib/categories";
export type VariantOption = {
  id: string;
  label: string;
  image: string;
};

export type CatalogProduct = {
  id: string;
  stepId: number;
  category: CategoryId;
  name: string;
  description: string;
  image: string;
  /** Current / sale price */
  price: number;
  /** Original list price (also drives auto `Save X%` badge when higher than price). */
  compareAtPrice?: number;
  priceLabel?: string;
  compareAtSuffix?: string;
  locked?: boolean;
  /** Shown in step product grids when true */
  selectable: boolean;
  /** Included in the cart at qty 1 on first load */
  defaultSelected?: boolean;
  /** Max quantity that can be added (disables + at this value) */
  countInStock?: number;
  variants: VariantOption[];
};

/** Bundle perk shown in review (e.g. free shipping) — not a shoppable product. */
export type CatalogAdvantage = {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  priceLabel?: string;
  /** Always present in the cart / review when true */
  included?: boolean;
};

/** Subscription / service pick — select only, no quantity. */
export type CatalogPlan = {
  id: string;
  stepId: number;
  category: typeof ProductCategory.Plan;
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  priceLabel?: string;
  compareAtSuffix?: string;
  selectable: boolean;
};

/** Raw step shape as stored in catalog.json (no derived display strings). */
export type CatalogStep = {
  id: number;
  title: string;
  /** Destination copy only — UI prefixes with "Next: ". */
  nextLabel: string;
  icon: string;
  category: CategoryId;
};

export type StepDefinition = CatalogStep & {
  /** Derived: `Step {id} of {total}`. */
  label: string;
};

export type BundleCatalog = {
  financingLabel: string;
  steps: StepDefinition[];
  products: CatalogProduct[];
  plans: CatalogPlan[];
  advantages: CatalogAdvantage[];
};

export function formatStepLabel(stepId: number, totalSteps: number) {
  return `Step ${stepId} of ${totalSteps}`;
}

/** Prefixes the catalog destination with the standard CTA lead-in. */
export function formatNextLabel(nextLabel: string) {
  return `Next: ${nextLabel}`;
}

export type PersistedBundleState = {
  expandedStep: number;
  activeVariants: Record<string, string>;
  quantities: Record<string, number>;
};

export type ReviewLine = {
  key: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  quantity: number;
  category: CategoryId;
  unitPrice: number;
  compareAtPrice?: number;
  lineTotal: number;
  lineCompareAt?: number;
  priceLabel?: string;
  compareAtSuffix?: string;
  locked?: boolean;
  countInStock?: number;
  showStepper: boolean;
};

/**
 * Placeholder used before the server-fetched catalog is available (and by the
 * seed state on first render). Real data comes from the DB via CatalogProvider.
 */
export const EMPTY_CATALOG: BundleCatalog = {
  financingLabel: "",
  steps: [],
  products: [],
  plans: [],
  advantages: [],
};

export const STORAGE_KEY = "wyze-bundle-system-v2";

export function planAsProduct(plan: CatalogPlan): CatalogProduct {
  return {
    ...plan,
    variants: [],
  };
}

export function advantageAsProduct(advantage: CatalogAdvantage): CatalogProduct {
  return {
    ...advantage,
    stepId: 0,
    selectable: false,
    defaultSelected: advantage.included,
    locked: true,
    variants: [],
  };
}

export function getAdvantage(catalog: BundleCatalog, advantageId: string) {
  return catalog.advantages.find((item) => item.id === advantageId);
}

/** Products + plans shown in accordion step grids. */
export function getSelectableStepItems(
  catalog: BundleCatalog,
): CatalogProduct[] {
  return [
    ...catalog.products.filter((product) => product.selectable),
    ...catalog.plans
      .filter((plan) => plan.selectable)
      .map(planAsProduct),
  ];
}

export function lineKey(productId: string, variantId?: string) {
  return variantId ? `${productId}:${variantId}` : productId;
}

export function parseLineKey(key: string) {
  const [productId, variantId] = key.split(":");
  return { productId, variantId: variantId || undefined };
}

export function getPlan(catalog: BundleCatalog, planId: string) {
  return catalog.plans.find((plan) => plan.id === planId);
}

export function getProduct(
  catalog: BundleCatalog,
  productId: string,
): CatalogProduct | undefined {
  const product = catalog.products.find((item) => item.id === productId);
  if (product) return product;
  const plan = getPlan(catalog, productId);
  if (plan) return planAsProduct(plan);
  const advantage = getAdvantage(catalog, productId);
  return advantage ? advantageAsProduct(advantage) : undefined;
}

export function isPlanItem(item: CatalogProduct) {
  return item.category === ProductCategory.Plan;
}

export function getActiveVariantId(
  product: CatalogProduct,
  activeVariants: Record<string, string>,
) {
  if (product.variants.length === 0) return undefined;
  return activeVariants[product.id] ?? product.variants[0]?.id;
}

export function getQuantityForProduct(
  product: CatalogProduct,
  quantities: Record<string, number>,
  activeVariants: Record<string, string>,
) {
  const variantId = getActiveVariantId(product, activeVariants);
  return quantities[lineKey(product.id, variantId)] ?? 0;
}

export function productHasAnyQuantity(
  product: CatalogProduct,
  quantities: Record<string, number>,
) {
  if (product.variants.length === 0) {
    return (quantities[product.id] ?? 0) > 0;
  }
  return product.variants.some(
    (variant) => (quantities[lineKey(product.id, variant.id)] ?? 0) > 0,
  );
}

export function countSelectedInStep(
  catalog: BundleCatalog,
  stepId: number,
  quantities: Record<string, number>,
) {
  const items = getSelectableStepItems(catalog).filter(
    (product) => product.stepId === stepId,
  );
  return items.filter((product) => productHasAnyQuantity(product, quantities))
    .length;
}

export function buildReviewLines(
  catalog: BundleCatalog,
  quantities: Record<string, number>,
): ReviewLine[] {
  const lines: ReviewLine[] = [];
  const allItems: CatalogProduct[] = [
    ...catalog.products,
    ...catalog.plans.map(planAsProduct),
    ...catalog.advantages.map(advantageAsProduct),
  ];

  for (const product of allItems) {
    if (product.variants.length === 0) {
      const quantity = quantities[product.id] ?? 0;
      if (quantity <= 0) continue;
      lines.push(toReviewLine(product, quantity));
      continue;
    }

    const activeVariantsWithQty = product.variants.filter(
      (variant) => (quantities[lineKey(product.id, variant.id)] ?? 0) > 0,
    );

    for (const variant of activeVariantsWithQty) {
      const quantity = quantities[lineKey(product.id, variant.id)] ?? 0;
      // Include color in the name when multiple variants of this product are in the cart
      const includeVariantLabel = activeVariantsWithQty.length > 1;
      lines.push(toReviewLine(product, quantity, variant, includeVariantLabel));
    }
  }

  const categoryOrder = CATEGORY_ORDER;

  return lines.sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
  );
}

function toReviewLine(
  product: CatalogProduct,
  quantity: number,
  variant?: VariantOption,
  includeVariantLabel = false,
): ReviewLine {
  const unitPrice = product.price;
  const compareAt = getCompareAtPrice(product);
  const isFreeLabel = product.priceLabel === "FREE";

  return {
    key: lineKey(product.id, variant?.id),
    productId: product.id,
    variantId: variant?.id,
    name:
      variant && includeVariantLabel
        ? `${product.name} — ${variant.label}`
        : product.name,
    image: product.image,
    quantity,
    category: product.category,
    unitPrice,
    compareAtPrice: compareAt,
    lineTotal: isFreeLabel ? 0 : unitPrice * quantity,
    lineCompareAt: compareAt != null ? compareAt * quantity : undefined,
    priceLabel: product.priceLabel,
    compareAtSuffix: product.compareAtSuffix,
    locked: product.locked,
    countInStock: product.countInStock,
    showStepper:
      product.category !== ProductCategory.Plan &&
      product.category !== ProductCategory.Shipping,
  };
}

export function calculatePricing(
  catalog: BundleCatalog,
  lines: ReviewLine[],
) {
  const contributing = lines.filter(
    (line) => line.category !== ProductCategory.Shipping,
  );

  const total = contributing.reduce((sum, line) => sum + line.lineTotal, 0);

  const originalTotal = contributing.reduce((sum, line) => {
    if (line.lineCompareAt != null) return sum + line.lineCompareAt;
    return sum + line.lineTotal;
  }, 0);

  const savings = Math.max(0, originalTotal - total);

  return {
    total: roundMoney(total),
    originalTotal: roundMoney(originalTotal),
    savings: roundMoney(savings),
    financingLabel: catalog.financingLabel,
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Original / list price when provided. */
export function getCompareAtPrice(
  product: Pick<CatalogProduct, "compareAtPrice">,
): number | undefined {
  return product.compareAtPrice;
}

/** Card badge from price vs compare-at, e.g. `Save 22%`. */
export function getProductBadge(
  product: Pick<CatalogProduct, "price" | "compareAtPrice" | "priceLabel">,
): string | undefined {
  const compareAt = product.compareAtPrice;
  if (
    compareAt == null ||
    compareAt <= product.price ||
    product.priceLabel === "FREE"
  ) {
    return undefined;
  }

  const percent = Math.round(((compareAt - product.price) / compareAt) * 100);
  if (percent <= 0) return undefined;
  return `Save ${percent}%`;
}

/** Force locked / review-only defaults (hub, included advantages) into quantities. */
export function applyDefaultSelections(
  catalog: BundleCatalog,
  quantities: Record<string, number>,
): Record<string, number> {
  const next = { ...quantities };
  for (const product of catalog.products) {
    if (!product.defaultSelected) continue;
    if (product.locked || !product.selectable) {
      next[product.id] = 1;
    } else if (next[product.id] == null) {
      next[product.id] = 1;
    }
  }
  for (const advantage of catalog.advantages) {
    if (advantage.included) {
      next[advantage.id] = 1;
    }
  }
  return next;
}

/** First step open; hub + included advantages selected by default. */
export function createSeedState(catalog: BundleCatalog): PersistedBundleState {
  return {
    expandedStep: catalog.steps[0]?.id ?? 1,
    activeVariants: {},
    quantities: applyDefaultSelections(catalog, {}),
  };
}
