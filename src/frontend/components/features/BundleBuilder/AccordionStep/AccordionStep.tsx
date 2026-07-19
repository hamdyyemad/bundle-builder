"use client";

import type { AccordionStepProps } from "./types";
import { ExpandedHighlightedStep } from "./ExpandedHighlightedStep";
import { ExpandedStep } from "./ExpandedStep";
import { CollapsedStep } from "./CollapsedStep";

export type { AccordionStepProps } from "./types";

export function AccordionStep({
  step,
  expanded,
  selectedCount,
  products,
  getCardView,
  onToggle,
  onNext,
  onQuantityChange,
  onVariantChange,
  onPlanPick,
  titleSize,
  iconSize,
  showSelectedCount,
  highlightExpanded = false,
  productLayout = "grid",
  className,
}: AccordionStepProps) {
  const selectedLabel =
    showSelectedCount && selectedCount > 0
      ? `${selectedCount} selected`
      : showSelectedCount
        ? "0 selected"
        : undefined;

  const contentProps = {
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
    productLayout,
    className,
  };

  if (expanded && highlightExpanded) {
    return <ExpandedHighlightedStep {...contentProps} />;
  }

  if (expanded) {
    return <ExpandedStep {...contentProps} />;
  }

  return <CollapsedStep {...contentProps} />;
}
