import { AccordionStep } from "./AccordionStep";
import type { useBundleBuilder } from "@/frontend/hooks";
import type { BundleLayout } from "@/frontend/hooks";

type Bundle = ReturnType<typeof useBundleBuilder>;

type BundleStepsProps = {
  bundle: Bundle;
  layout: BundleLayout;
};

export function BundleSteps({ bundle, layout }: BundleStepsProps) {
  const isMobile = layout === "mobile";
  const isStacked = layout === "stacked";

  return bundle.steps.map((step) => (
    <AccordionStep
      key={step.id}
      step={step}
      expanded={bundle.expandedStep === step.id}
      selectedCount={bundle.countSelectedInStep(step.id)}
      products={bundle.selectableProducts.filter(
        (product) => product.stepId === step.id,
      )}
      getCardView={bundle.getCardView}
      onToggle={() => bundle.toggleStep(step.id)}
      onNext={() => bundle.goToNextStep(step.id)}
      onQuantityChange={bundle.setProductCardQuantity}
      onVariantChange={bundle.setActiveVariant}
      onPlanPick={bundle.togglePlanSelection}
      titleSize={isMobile ? "mobile" : isStacked ? "wide" : "desktop"}
      iconSize={
        isMobile ? (step.id === 2 ? 24 : 20) : isStacked ? 30 : 26
      }
      showSelectedCount={isMobile || bundle.expandedStep === step.id}
      highlightExpanded={!isMobile}
      productLayout={isStacked ? "wide" : "grid"}
      className={isMobile && step.id > 1 ? "pt-[5px]" : undefined}
    />
  ));
}
