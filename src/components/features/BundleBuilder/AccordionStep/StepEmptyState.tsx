import { Button } from "@/components/ui";

type StepEmptyStateProps = {
  stepTitle: string;
  nextLabel: string;
  onNext: () => void;
  showNext?: boolean;
};

export function StepEmptyState({
  stepTitle,
  nextLabel,
  onNext,
  showNext = true,
}: StepEmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4 py-6">
      <p className="text-center text-sm font-medium text-[rgba(31,31,31,0.75)]">
        Your {stepTitle.toLowerCase()} selections are reflected in the review
        panel.
      </p>
      {showNext && (
        <Button variant="outline" className="self-center" onClick={onNext}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
