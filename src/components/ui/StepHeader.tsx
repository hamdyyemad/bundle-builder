"use client";

import { cn } from "@/lib/cn";
import { AssetImage } from "@/components/ui/AssetImage";

type StepHeaderProps = {
  stepLabel: string;
  title: string;
  icon: string;
  iconSize?: number;
  selectedLabel?: string;
  expanded?: boolean;
  onToggle?: () => void;
  titleSize?: "mobile" | "desktop" | "wide";
};

export function StepHeader({
  stepLabel,
  title,
  icon,
  iconSize = 26,
  selectedLabel,
  expanded = false,
  onToggle,
  titleSize = "desktop",
}: StepHeaderProps) {
  const titleClass =
    titleSize === "mobile"
      ? "text-lg"
      : titleSize === "wide"
        ? "text-[28px]"
        : "text-[22px]";

  return (
    <div className="flex w-full flex-col gap-[5px]">
      <div className="flex w-full items-center px-[15px]">
        <p className="flex-1 text-[10px] font-medium uppercase leading-none tracking-[1.6px] text-[#484848] lg:text-xs">
          {stepLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center border-[#1f1f1f] border-solid px-[15px] py-5",
          expanded ? "border-t-[0.5px]" : "border-y-[0.5px]",
        )}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className="relative shrink-0"
              style={{ width: iconSize, height: iconSize }}
            >
              <AssetImage
                src={icon}
                alt=""
                fill
                className="object-contain"
              />
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 text-left font-semibold leading-none text-[#0b0d10]",
                titleClass,
              )}
            >
              {title}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {selectedLabel && (
              <span className="whitespace-nowrap text-sm font-medium leading-4 text-wyze-purple">
                {selectedLabel}
              </span>
            )}
            <span
              className={cn(
                "relative size-3",
                !expanded && selectedLabel ? "rotate-180" : "",
              )}
            >
              <AssetImage
                src={
                  expanded || selectedLabel
                    ? "/assets/icons/carrot-up.svg"
                    : "/assets/icons/carrot-down.svg"
                }
                alt=""
                fill
                className="object-contain"
              />
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
