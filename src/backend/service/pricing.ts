import {
  type AdvantageDto,
  type CatalogDto,
  type CategoryId,
  type PlanDto,
  type ProductDto,
  type VariantDto,
} from "@/backend/dto/catalog.dto";

/**
 * Authoritative order pricing.
 *
 * ⚠ This logic is intentionally duplicated from `src/frontend/lib/bundle.ts`,
 * which computes the totals the customer sees. The backend copy is what the
 * customer is actually charged.
 *
 * If you change a pricing rule here, change it there too — otherwise the UI
 * will display one total while the server charges another. `pnpm test:pricing`
 * asserts the two implementations agree and fails if they drift.
 */

export type PricedLine = {
  key: string;
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  category: CategoryId;
  unitPrice: number;
  compareAtPrice?: number;
  lineTotal: number;
  lineCompareAt?: number;
};

export function lineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

export function parseLineKey(key: string) {
  const [productId, variantId] = key.split(":");
  return { productId, variantId: variantId || undefined };
}

function planAsProduct(plan: PlanDto): ProductDto {
  return { ...plan, variants: [] };
}

function advantageAsProduct(advantage: AdvantageDto): ProductDto {
  return {
    ...advantage,
    stepId: 0,
    selectable: false,
    defaultSelected: advantage.included,
    locked: true,
    variants: [],
  };
}

function toPricedLine(
  product: ProductDto,
  quantity: number,
  variant?: VariantDto,
  includeVariantLabel = false,
): PricedLine {
  const unitPrice = product.price;
  const compareAt = product.compareAtPrice;
  const isFreeLabel = product.priceLabel === "FREE";

  return {
    key: lineKey(product.id, variant?.id),
    productId: product.id,
    variantId: variant?.id,
    name:
      variant && includeVariantLabel
        ? `${product.name} — ${variant.label}`
        : product.name,
    quantity,
    category: product.category,
    unitPrice,
    compareAtPrice: compareAt,
    lineTotal: isFreeLabel ? 0 : unitPrice * quantity,
    lineCompareAt: compareAt != null ? compareAt * quantity : undefined,
  };
}

export function buildPricedLines(
  catalog: CatalogDto,
  quantities: Record<string, number>,
  categoryOrder: string[],
): PricedLine[] {
  const lines: PricedLine[] = [];
  const allItems: ProductDto[] = [
    ...catalog.products,
    ...catalog.plans.map(planAsProduct),
    ...catalog.advantages.map(advantageAsProduct),
  ];

  for (const product of allItems) {
    if (product.variants.length === 0) {
      const quantity = quantities[product.id] ?? 0;
      if (quantity <= 0) continue;
      lines.push(toPricedLine(product, quantity));
      continue;
    }

    const variantsWithQty = product.variants.filter(
      (variant) => (quantities[lineKey(product.id, variant.id)] ?? 0) > 0,
    );

    for (const variant of variantsWithQty) {
      const quantity = quantities[lineKey(product.id, variant.id)] ?? 0;
      // Include colour in the name when multiple variants are in the cart.
      const includeVariantLabel = variantsWithQty.length > 1;
      lines.push(toPricedLine(product, quantity, variant, includeVariantLabel));
    }
  }

  return lines.sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
  );
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateTotals(catalog: CatalogDto, lines: PricedLine[]) {
  // Shipping is a perk line; it never contributes to the total.
  const contributing = lines.filter((line) => line.category !== "shipping");

  const total = contributing.reduce((sum, line) => sum + line.lineTotal, 0);

  const originalTotal = contributing.reduce((sum, line) => {
    if (line.lineCompareAt != null) return sum + line.lineCompareAt;
    return sum + line.lineTotal;
  }, 0);

  return {
    total: roundMoney(total),
    originalTotal: roundMoney(originalTotal),
    savings: roundMoney(Math.max(0, originalTotal - total)),
    financingLabel: catalog.financingLabel,
  };
}
