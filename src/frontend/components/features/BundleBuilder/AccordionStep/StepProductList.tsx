import { Button, ProductCard } from "@/frontend/components/ui";
import type { CatalogProduct } from "@/frontend/lib/bundle";
import type { AccordionStepProps } from "./types";

type StepProductListProps = {
  products: CatalogProduct[];
  getCardView: AccordionStepProps["getCardView"];
  onQuantityChange: AccordionStepProps["onQuantityChange"];
  onVariantChange: AccordionStepProps["onVariantChange"];
  onPlanPick?: AccordionStepProps["onPlanPick"];
  nextLabel: string;
  onNext: () => void;
  layout: "grid" | "stack" | "wide";
};

export function StepProductList({
  products,
  getCardView,
  onQuantityChange,
  onVariantChange,
  onPlanPick,
  nextLabel,
  onNext,
  layout,
}: StepProductListProps) {
  const cardLayout = layout === "wide" ? "vertical" : "horizontal";

  const cards = products.flatMap((product) => {
    const view = getCardView(product.id);
    if (!view) return [];
    return [
      <ProductCard
        key={product.id}
        product={view.product}
        quantity={view.quantity}
        selected={view.selected}
        activeVariantId={view.activeVariantId}
        displayPrice={view.displayPrice}
        displayCompareAt={view.displayCompareAt}
        selectionMode={view.selectionMode}
        onQuantityChange={(quantity) => onQuantityChange(product.id, quantity)}
        onVariantChange={(variantId) => onVariantChange(product.id, variantId)}
        onPick={() => onPlanPick?.(product.id)}
        layout={cardLayout}
      />,
    ];
  });

  if (layout === "wide") {
    return (
      <>
        <div className="grid w-full grid-cols-5 gap-[15px]">{cards}</div>
        <Button variant="outline" className="self-center" onClick={onNext}>
          {nextLabel}
        </Button>
      </>
    );
  }

  if (layout === "grid") {
    return (
      <>
        {/* Odd last card spans both columns and stays one-column wide, matching Figma */}
        <div className="grid w-full grid-cols-1 gap-[15px] sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:w-[calc((100%-15px)/2)] sm:[&>*:last-child:nth-child(odd)]:justify-self-center">
          {cards}
        </div>
        <Button variant="outline" className="self-center" onClick={onNext}>
          {nextLabel}
        </Button>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-[15px] px-[15px] py-4">
      {cards}
      <Button variant="outline" className="self-center" onClick={onNext}>
        {nextLabel}
      </Button>
    </div>
  );
}
