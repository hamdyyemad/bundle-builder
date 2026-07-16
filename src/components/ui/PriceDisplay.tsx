import { cn } from "@/lib/cn";

type PriceDisplayProps = {
  price?: number;
  originalPrice?: number;
  priceLabel?: string;
  originalPriceSuffix?: string;
  layout?: "stack" | "inline";
  size?: "sm" | "md" | "lg";
  strikeColor?: "gray" | "red";
  className?: string;
};

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export function PriceDisplay({
  price,
  originalPrice,
  priceLabel,
  originalPriceSuffix,
  layout = "stack",
  size = "sm",
  strikeColor = "gray",
  className,
}: PriceDisplayProps) {
  const strike =
    strikeColor === "red" ? "text-[#d8392b]" : "text-[#6f7882]";
  const current =
    size === "lg"
      ? "text-2xl font-bold leading-8 tracking-[-0.03px] text-wyze-purple"
      : size === "md"
        ? "text-base font-semibold leading-4 tracking-[0.08px] text-wyze-purple"
        : "text-sm font-semibold leading-4 tracking-[0.07px] text-wyze-purple";
  const original =
    size === "lg"
      ? "text-lg font-medium leading-5 tracking-[0.045px]"
      : size === "md"
        ? "text-base font-medium leading-4 tracking-[0.08px]"
        : "text-sm font-medium leading-4 tracking-[0.07px]";

  const suffix =
    originalPriceSuffix ?? (priceLabel?.includes("/mo") ? "/mo" : "");

  return (
    <div
      className={cn(
        "flex whitespace-nowrap",
        layout === "stack"
          ? "flex-col items-end"
          : "flex-row items-baseline gap-2",
        className,
      )}
    >
      {originalPrice != null && (
        <span className={cn(original, strike, "line-through")}>
          {formatMoney(originalPrice)}
          {suffix}
        </span>
      )}
      {priceLabel ? (
        <span className={current}>{priceLabel}</span>
      ) : price != null ? (
        <span
          className={cn(
            size === "sm" && strikeColor === "red"
              ? "text-base font-normal leading-none tracking-[0.6px] text-[#575757]"
              : current,
          )}
        >
          {formatMoney(price)}
        </span>
      ) : null}
    </div>
  );
}
