"use client";

import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ReviewSectionProps,
} from "./types";
import { ReviewEyebrow } from "./ReviewEyebrow";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewItemList } from "./ReviewItemList";
import { ReviewCheckout } from "./ReviewCheckout";

export function ReviewSection({
  items,
  financingLabel,
  originalTotal,
  total,
  savings,
  variant = "sidebar",
  onQuantityChange,
  onCheckout,
  onSave,
  saveMessage,
  checkoutMessage,
}: ReviewSectionProps) {
  const isStacked = variant === "stacked";

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  if (isStacked) {
    return (
      <section className="w-full rounded-[10px] bg-[#edf4ff] pt-[15px]">
        <div className="flex w-full flex-col items-center overflow-hidden px-5 pb-[31px] pt-5">
          <div className="flex w-full items-start justify-center gap-[52px]">
            <div className="flex w-full max-w-[552px] flex-col gap-2.5">
              <ReviewHeader variant="stacked" />
              <ReviewItemList
                groups={groups}
                variant="stacked"
                onQuantityChange={onQuantityChange}
              />
            </div>
            <div className="w-full max-w-[486px] pt-0">
              <ReviewCheckout
                financingLabel={financingLabel}
                originalTotal={originalTotal}
                total={total}
                savings={savings}
                variant="stacked"
                onCheckout={onCheckout}
                onSave={onSave}
                saveMessage={saveMessage}
                checkoutMessage={checkoutMessage}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col gap-[5px] rounded-[10px] bg-[#edf4ff] pt-[15px]">
      <ReviewEyebrow />

      <div className="flex w-full flex-col gap-2.5 overflow-hidden bg-[#edf4ff] px-5 pb-[31px] pt-5">
        <ReviewHeader variant={variant} />

        <ReviewItemList
          groups={groups}
          variant={variant}
          onQuantityChange={onQuantityChange}
        />

        <ReviewCheckout
          financingLabel={financingLabel}
          originalTotal={originalTotal}
          total={total}
          savings={savings}
          variant={variant}
          onCheckout={onCheckout}
          onSave={onSave}
          saveMessage={saveMessage}
          checkoutMessage={checkoutMessage}
        />
      </div>
    </section>
  );
}
