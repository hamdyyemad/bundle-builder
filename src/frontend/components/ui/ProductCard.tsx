"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/frontend/lib/cn";
import type { CatalogProduct } from "@/frontend/lib/bundle";
import { getProductBadge } from "@/frontend/lib/bundle";
import { ColorSwatch } from "@/frontend/components/ui/ColorSwatch";
import { QuantitySelector } from "@/frontend/components/ui/QuantitySelector";
import { PriceDisplay } from "@/frontend/components/ui/PriceDisplay";

type ProductCardProps = {
  product: CatalogProduct;
  quantity: number;
  selected: boolean;
  activeVariantId?: string;
  displayPrice: number;
  displayCompareAt?: number;
  onQuantityChange: (quantity: number) => void;
  onVariantChange?: (variantId: string) => void;
  /** Plans: click to pick/unpick — no quantity stepper */
  selectionMode?: "quantity" | "pick";
  onPick?: () => void;
  /** Horizontal = Desktop Home cards; vertical = 2xl Long Section cards */
  layout?: "horizontal" | "vertical";
};

export function ProductCard({
  product,
  quantity,
  selected,
  activeVariantId,
  displayPrice,
  displayCompareAt,
  onQuantityChange,
  onVariantChange,
  selectionMode = "quantity",
  onPick,
  layout = "horizontal",
}: ProductCardProps) {
  const hasVariants = product.variants.length > 0;
  const isVertical = layout === "vertical";
  const isPick = selectionMode === "pick";
  const badge = getProductBadge(product);

  return (
    <article
      role={isPick ? "button" : undefined}
      tabIndex={isPick ? 0 : undefined}
      aria-pressed={isPick ? selected : undefined}
      onClick={isPick ? onPick : undefined}
      onKeyDown={
        isPick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPick?.();
              }
            }
          : undefined
      }
      className={cn(
        "overflow-hidden rounded-[10px] bg-white p-[11px]",
        selected
          ? "border-2 border-[rgba(78,47,210,0.7)]"
          : "border border-transparent",
        isPick && "cursor-pointer transition-shadow hover:shadow-sm",
        isVertical
          ? "flex flex-col items-center gap-[19px] px-[11px] py-[15px]"
          : "flex items-center gap-[13px] lg:gap-[19px]",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[5px]",
          isVertical
            ? "aspect-[214/124] w-full"
            : "h-[137px] w-[101px] shrink-0 lg:h-[151px]",
        )}
      >
        <div className="absolute inset-0 bg-white" />
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-1"
          sizes={isVertical ? "220px" : "101px"}
        />
        {badge && (
          <span className="absolute left-0 top-0 flex items-center justify-center rounded-[10px] bg-wyze-purple px-1.5 py-0.5 text-xs font-semibold text-white">
            {badge}
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex flex-col gap-2.5",
          isVertical ? "w-full" : "min-w-0 flex-1 lg:w-[205px] lg:flex-none",
        )}
      >
        <div className="flex flex-col gap-2 tracking-[0.6px]">
          <h3
            className={cn(
              "font-semibold leading-none text-[#1f1f1f]",
              isVertical ? "text-lg" : "text-base",
            )}
          >
            {product.name}
          </h3>
          <p
            className={cn(
              "font-medium leading-[1.3] text-[rgba(31,31,31,0.75)]",
              isVertical ? "text-sm" : "text-xs",
            )}
          >
            {product.description}{" "}
            <Link
              href="#"
              className="text-[#00e] underline"
              onClick={(event) => event.stopPropagation()}
            >
              Learn More
            </Link>
          </p>
        </div>

        {hasVariants && (
          <div className="flex flex-wrap gap-1.5">
            {product.variants.map((variant) => (
              <ColorSwatch
                key={variant.id}
                option={variant}
                selected={activeVariantId === variant.id}
                onSelect={() => onVariantChange?.(variant.id)}
              />
            ))}
          </div>
        )}

        <div className="flex w-full items-end gap-2.5">
          {!isPick && (
            <QuantitySelector
              value={quantity}
              size="md"
              disabled={!!product.locked}
              max={product.countInStock}
              onChange={onQuantityChange}
            />
          )}
          {isPick && (
            <span
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold",
                selected
                  ? "bg-wyze-purple text-white"
                  : "bg-[#f0f4f7] text-[#1f1f1f]",
              )}
            >
              {selected ? "Selected" : "Select"}
            </span>
          )}
          <div className="ml-auto">
            <PriceDisplay
              price={product.priceLabel ? undefined : displayPrice}
              originalPrice={displayCompareAt}
              priceLabel={product.priceLabel}
              originalPriceSuffix={product.compareAtSuffix}
              strikeColor={displayCompareAt && !product.priceLabel ? "red" : "gray"}
              size="sm"
              className={
                product.priceLabel
                  ? undefined
                  : displayCompareAt
                    ? "[&_span:last-child]:text-base [&_span:last-child]:font-normal [&_span:last-child]:leading-none [&_span:last-child]:tracking-[0.6px] [&_span:last-child]:text-[#575757] [&_span:first-child]:text-base [&_span:first-child]:font-normal [&_span:first-child]:leading-none"
                    : "[&_span]:text-base [&_span]:font-normal [&_span]:leading-none [&_span]:tracking-[0.6px] [&_span]:text-[#575757]"
              }
            />
          </div>
        </div>
      </div>
    </article>
  );
}
