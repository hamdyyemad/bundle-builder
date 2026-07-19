/**
 * Backend-owned catalog types.
 *
 * Deliberately independent of `src/frontend` — the backend must not import from
 * the client layer. These mirror the frontend's catalog shapes structurally so
 * the API response deserialises straight into them.
 */

/** Category ids; keep in sync with the `categories` table. */
export const CategoryId = {
  Cameras: "cameras",
  Sensors: "sensors",
  Accessories: "accessories",
  Plan: "plan",
  Shipping: "shipping",
} as const;

export type CategoryId = (typeof CategoryId)[keyof typeof CategoryId];

export type VariantDto = {
  id: string;
  label: string;
  image: string;
};

export type ProductDto = {
  id: string;
  stepId: number;
  category: CategoryId;
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  priceLabel?: string;
  compareAtSuffix?: string;
  locked?: boolean;
  selectable: boolean;
  defaultSelected?: boolean;
  countInStock?: number;
  variants: VariantDto[];
};

export type PlanDto = {
  id: string;
  stepId: number;
  category: typeof CategoryId.Plan;
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  priceLabel?: string;
  compareAtSuffix?: string;
  selectable: boolean;
};

export type AdvantageDto = {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  priceLabel?: string;
  included?: boolean;
};

export type StepDto = {
  id: number;
  title: string;
  nextLabel: string;
  icon: string;
  category: CategoryId;
  /** Derived: `Step {id} of {total}`. */
  label: string;
};

export type CatalogDto = {
  financingLabel: string;
  steps: StepDto[];
  products: ProductDto[];
  plans: PlanDto[];
  advantages: AdvantageDto[];
};

export function formatStepLabel(stepId: number, totalSteps: number): string {
  return `Step ${stepId} of ${totalSteps}`;
}
