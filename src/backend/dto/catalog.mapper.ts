import type { Item, Step, Variant } from "@prisma/client";

import {
  formatStepLabel,
  type AdvantageDto,
  type CategoryId,
  type PlanDto,
  type ProductDto,
  type StepDto,
  type VariantDto,
} from "@/backend/dto/catalog.dto";

/** DB stores integer cents; the API speaks dollars. */
export function toDollars(cents: number): number {
  return cents / 100;
}

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export type ItemRow = Item & { variants: Variant[] };

/** Drops null-valued optional keys so rows match the DTO shapes exactly. */
function optional<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

function toVariantDto(variant: Variant): VariantDto {
  return { id: variant.id, label: variant.label, image: variant.image };
}

export function toProductDto(item: ItemRow): ProductDto {
  return {
    id: item.id,
    // Advantages have no step; products and plans always do.
    stepId: item.stepId ?? 0,
    category: item.categoryId as CategoryId,
    name: item.name,
    description: item.description,
    image: item.image,
    price: toDollars(item.priceCents),
    compareAtPrice:
      item.compareAtPriceCents != null
        ? toDollars(item.compareAtPriceCents)
        : undefined,
    priceLabel: optional(item.priceLabel),
    compareAtSuffix: optional(item.compareAtSuffix),
    locked: item.locked,
    selectable: item.selectable,
    defaultSelected: item.defaultSelected,
    countInStock: optional(item.countInStock),
    variants: item.variants.map(toVariantDto),
  };
}

export function toPlanDto(item: ItemRow): PlanDto {
  const product = toProductDto(item);
  return {
    id: product.id,
    stepId: product.stepId,
    category: "plan",
    name: product.name,
    description: product.description,
    image: product.image,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    priceLabel: product.priceLabel,
    compareAtSuffix: product.compareAtSuffix,
    selectable: product.selectable,
  };
}

export function toAdvantageDto(item: ItemRow): AdvantageDto {
  const product = toProductDto(item);
  return {
    id: product.id,
    category: product.category,
    name: product.name,
    description: product.description,
    image: product.image,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    priceLabel: product.priceLabel,
    included: item.included,
  };
}

export function toStepDto(step: Step, totalSteps: number): StepDto {
  return {
    id: step.id,
    title: step.title,
    nextLabel: step.nextLabel,
    icon: step.icon,
    category: step.categoryId as CategoryId,
    label: formatStepLabel(step.id, totalSteps),
  };
}
