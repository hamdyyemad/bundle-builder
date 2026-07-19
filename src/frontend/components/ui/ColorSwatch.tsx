import Image from "next/image";
import { cn } from "@/frontend/lib/cn";
import type { VariantOption } from "@/frontend/lib/bundle";

type ColorSwatchProps = {
  option: VariantOption;
  selected?: boolean;
  onSelect?: () => void;
};

export function ColorSwatch({ option, selected, onSelect }: ColorSwatchProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex h-[26px] w-[65px] items-center justify-center gap-0.5 rounded-[2px] border-[0.5px] px-[3px] py-px",
        selected
          ? "border-[#0aa288] bg-[rgba(29,240,187,0.04)]"
          : "border-[#ccc] bg-white",
      )}
    >
      <span className="relative size-[22px] shrink-0 overflow-hidden rounded-[5px]">
        <Image
          src={option.image}
          alt={option.label}
          fill
          className="object-cover"
          sizes="28px"
        />
      </span>
      <span className="whitespace-nowrap text-[10px] font-medium tracking-[0.6px] text-[#1f1f1f]">
        {option.label}
      </span>
    </button>
  );
}
