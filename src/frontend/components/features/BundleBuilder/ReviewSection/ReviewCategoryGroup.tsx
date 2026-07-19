import type { ReviewGroup } from "./types";
import { ReviewLineItem } from "./ReviewLineItem";

type ReviewCategoryGroupProps = {
  group: ReviewGroup;
  variant: "sidebar" | "mobile" | "stacked";
  onQuantityChange: (key: string, quantity: number) => void;
};

export function ReviewCategoryGroup({
  group,
  variant,
  onQuantityChange,
}: ReviewCategoryGroupProps) {
  return (
    <div className="flex w-full flex-col gap-2 border-t border-[#ced6de] pt-[15px]">
      {group.label && (
        <p className="text-xs font-normal uppercase leading-4 tracking-[0.36px] text-[#a8b2bd]">
          {group.label}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {group.items.map((item) => (
          <ReviewLineItem
            key={item.key}
            item={item}
            variant={variant}
            onQuantityChange={onQuantityChange}
          />
        ))}
      </div>
    </div>
  );
}
