import type { ReviewGroup } from "./types";
import { ReviewCategoryGroup } from "./ReviewCategoryGroup";

type ReviewItemListProps = {
  groups: ReviewGroup[];
  variant: "sidebar" | "mobile" | "stacked";
  onQuantityChange: (key: string, quantity: number) => void;
};

export function ReviewItemList({
  groups,
  variant,
  onQuantityChange,
}: ReviewItemListProps) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      {groups.map((group) => (
        <ReviewCategoryGroup
          key={group.category}
          group={group}
          variant={variant}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </div>
  );
}
