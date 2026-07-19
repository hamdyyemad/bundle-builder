import { StepHeader } from "@/frontend/components/ui";
import type { StepContentProps } from "./types";

type CollapsedStepProps = Pick<
  StepContentProps,
  "step" | "onToggle" | "titleSize" | "iconSize" | "selectedLabel" | "className"
>;

export function CollapsedStep({
  step,
  onToggle,
  titleSize,
  iconSize,
  selectedLabel,
  className,
}: CollapsedStepProps) {
  return (
    <div className={className}>
      <StepHeader
        stepLabel={step.label}
        title={step.title}
        icon={step.icon}
        iconSize={iconSize}
        selectedLabel={selectedLabel}
        expanded={false}
        onToggle={onToggle}
        titleSize={titleSize}
      />
    </div>
  );
}
