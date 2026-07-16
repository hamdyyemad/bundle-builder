import { StepHeader } from "@/components/ui";
import { formatNextLabel } from "@/lib/bundle";
import type { StepContentProps } from "./types";
import { StepProductList } from "./StepProductList";

export function ExpandedStep({
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
  className,
}: StepContentProps) {
  return (
    <div className={className}>
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
      {products.length > 0 && (
        <StepProductList
          products={products}
          getCardView={getCardView}
          onQuantityChange={onQuantityChange}
          onVariantChange={onVariantChange}
          onPlanPick={onPlanPick}
          nextLabel={formatNextLabel(step.nextLabel)}
          onNext={onNext}
          layout="stack"
        />
      )}
    </div>
  );
}
