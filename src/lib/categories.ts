import categoryData from "@/data/bundle/category.json";

/**
 * Enum-like category ids. Keep values in sync with `category.json`.
 * Catalog steps/products reference these via the `category` field.
 */
export const ProductCategory = {
  Cameras: "cameras",
  Sensors: "sensors",
  Accessories: "accessories",
  Plan: "plan",
  Shipping: "shipping",
} as const;

export type ProductCategory =
  (typeof ProductCategory)[keyof typeof ProductCategory];

export type CategoryDefinition = {
  id: ProductCategory;
  /** Review-section group heading (empty = no heading). */
  label: string;
};

/** Ordered category list from `category.json` (order = review sort order). */
export const CATEGORIES = categoryData as CategoryDefinition[];

export const CATEGORY_ORDER = CATEGORIES.map((category) => category.id);

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label]),
) as Record<ProductCategory, string>;
