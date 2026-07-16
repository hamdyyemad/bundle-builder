import type { CatalogProduct, StepDefinition } from "@/lib/bundle";
import type { useBundleBuilder } from "@/hooks/useBundleBuilder";

export type AccordionStepProps = {
  step: StepDefinition;
  expanded: boolean;
  selectedCount: number;
  products: CatalogProduct[];
  getCardView: ReturnType<typeof useBundleBuilder>["getCardView"];
  onToggle: () => void;
  onNext: () => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onVariantChange: (productId: string, variantId: string) => void;
  onPlanPick?: (planId: string) => void;
  titleSize: "mobile" | "desktop" | "wide";
  iconSize: number;
  showSelectedCount: boolean;
  highlightExpanded?: boolean;
  /** Product grid layout for the expanded step */
  productLayout?: "grid" | "stack" | "wide";
  className?: string;
};

export type StepContentProps = Pick<
  AccordionStepProps,
  | "step"
  | "products"
  | "getCardView"
  | "onToggle"
  | "onNext"
  | "onQuantityChange"
  | "onVariantChange"
  | "onPlanPick"
  | "titleSize"
  | "iconSize"
  | "className"
  | "productLayout"
> & {
  selectedLabel?: string;
};
