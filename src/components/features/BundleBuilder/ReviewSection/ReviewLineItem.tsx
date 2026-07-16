"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ReviewLine } from "@/lib/bundle";
import { ProductCategory } from "@/lib/categories";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { AssetImage } from "@/components/ui/AssetImage";

type ReviewLineItemProps = {
  item: ReviewLine;
  variant: "sidebar" | "mobile" | "stacked";
  onQuantityChange: (key: string, quantity: number) => void;
};

export function ReviewLineItem({
  item,
  variant,
  onQuantityChange,
}: ReviewLineItemProps) {
  const isPlan = item.category === ProductCategory.Plan;
  const isShipping = item.category === ProductCategory.Shipping;
  const isSvg = item.image.endsWith(".svg");
  const isStacked = variant === "stacked";
  const isMobile = variant === "mobile";
  const priceLayout =
    isStacked &&
    (item.category === ProductCategory.Cameras ||
      item.category === ProductCategory.Plan)
      ? "inline"
      : "stack";

  return (
    <div className="flex w-full items-center gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {isPlan ? (
          <div className="relative h-6 w-5 shrink-0 sm:h-[31px] sm:w-[26px]">
            <AssetImage
              src={item.image}
              alt=""
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="relative size-[41px] shrink-0 overflow-hidden rounded-[5px] bg-white">
            {isShipping || isSvg ? (
              <div className="absolute left-[6px] top-[6px] size-[29px]">
                <AssetImage
                  src={item.image}
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-0.5"
                sizes="41px"
              />
            )}
          </div>
        )}

        {isPlan ? (
          <p className="text-base font-bold tracking-[-0.032px] text-black">
            Cam <span className="text-wyze-purple">Unlimited</span>
          </p>
        ) : (
          <p
            className={cn(
              "min-w-0 flex-1 font-medium leading-4 text-[#0b0d10]",
              isStacked
                ? "text-lg tracking-[0.09px]"
                : isMobile
                  ? "text-xs tracking-[0.06px]"
                  : "text-sm tracking-[0.07px]",
            )}
          >
            {item.name}
          </p>
        )}

        {item.showStepper && (
          <QuantitySelector
            value={item.quantity}
            disabled={item.locked}
            max={item.countInStock}
            onChange={(value) => onQuantityChange(item.key, value)}
          />
        )}
      </div>

      <PriceDisplay
        price={item.priceLabel ? undefined : item.lineTotal}
        originalPrice={item.lineCompareAt}
        priceLabel={item.priceLabel}
        originalPriceSuffix={item.compareAtSuffix}
        layout={priceLayout}
        size={isStacked ? "md" : "sm"}
      />
    </div>
  );
}
