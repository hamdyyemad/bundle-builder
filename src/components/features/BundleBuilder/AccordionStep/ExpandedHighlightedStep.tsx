import { StepHeader } from "@/components/ui";
import { catalog, formatNextLabel } from "@/lib/bundle";
import type { StepContentProps } from "./types";
import { StepProductList } from "./StepProductList";
import { StepEmptyState } from "./StepEmptyState";

export function ExpandedHighlightedStep({
  step,
  products,
  getCardView,
  onToggle,
  onNext,
  onQuantityChange,
  onVariantChange,
  onPlanPick,
  titleSize,
  iconSize,
  selectedLabel,
  productLayout = "grid",
  className,
}: StepContentProps) {
  const nextLabel = formatNextLabel(step.nextLabel);
  const isLastStep = step.id === catalog.steps.at(-1)?.id;

  return (
    <section
      className={`flex w-full flex-col gap-[5px] rounded-[10px] bg-[#edf4ff] pt-[15px] ${className ?? ""}`}
    >
      <StepHeader
        stepLabel={step.label}
        title={step.title}
        icon={step.icon}
        iconSize={iconSize}
        selectedLabel={selectedLabel}
        expanded
        onToggle={onToggle}
        titleSize={titleSize}
      />
      <div className="flex w-full flex-col items-center gap-[15px] px-[15px] pb-5">
        {products.length > 0 ? (
          <StepProductList
            products={products}
            getCardView={getCardView}
            onQuantityChange={onQuantityChange}
            onVariantChange={onVariantChange}
            onPlanPick={onPlanPick}
            nextLabel={nextLabel}
            onNext={onNext}
            layout={productLayout}
          />
        ) : (
          <StepEmptyState
            stepTitle={step.title}
            nextLabel={nextLabel}
            onNext={onNext}
            showNext={!isLastStep}
          />
        )}
      </div>
    </section>
  );
}
