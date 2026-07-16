"use client";

import { cn } from "@/lib/cn";
import { AssetImage } from "@/components/ui/AssetImage";

type QuantitySelectorProps = {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  /** When set, + is disabled at this quantity (stock limit). */
  max?: number;
  className?: string;
  size?: "sm" | "md";
};

export function QuantitySelector({
  value,
  onChange,
  disabled = false,
  max,
  className,
  size = "sm",
}: QuantitySelectorProps) {
  const atMin = value <= 0;
  const atMax = max != null && value >= max;
  const canDecrease = !disabled && !atMin;
  const canIncrease = !disabled && !atMax;

  const btnClass =
    size === "sm"
      ? "size-5 rounded"
      : "size-5 rounded border-2 border-[#e6ebf0]";

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded py-1",
        size === "sm" ? "w-[72px]" : "w-20 gap-2.5 justify-center",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={!canDecrease}
        onClick={() => onChange?.(Math.max(0, value - 1))}
        className={cn(
          "flex items-center justify-center bg-white disabled:border disabled:border-[#ced6de] disabled:bg-[#f1f1f2]",
          btnClass,
        )}
      >
        <span className="relative block h-[9.6px] w-2 overflow-hidden">
          <AssetImage
            src={
              canDecrease
                ? "/assets/icons/minus.svg"
                : "/assets/icons/minus-disabled.svg"
            }
            alt=""
            fill
            className="object-contain"
          />
        </span>
      </button>
      <span
        className={cn(
          "font-semibold text-[#0b0d10]",
          size === "sm"
            ? "w-2 text-center text-sm leading-4"
            : "text-base font-medium leading-5",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={!canIncrease}
        onClick={() => {
          const next = value + 1;
          onChange?.(max != null ? Math.min(next, max) : next);
        }}
        className={cn(
          "flex items-center justify-center bg-white disabled:border disabled:border-[#ced6de] disabled:bg-[#f1f1f2]",
          btnClass,
        )}
      >
        <span className="relative block size-2 overflow-hidden">
          <AssetImage
            src={
              canIncrease
                ? "/assets/icons/add.svg"
                : "/assets/icons/add-disabled.svg"
            }
            alt=""
            fill
            className="object-contain"
          />
        </span>
      </button>
    </div>
  );
}
