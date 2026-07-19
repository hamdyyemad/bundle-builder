import { cn } from "@/frontend/lib/cn";

type ReviewHeaderProps = {
  variant: "sidebar" | "mobile" | "stacked";
};

export function ReviewHeader({ variant }: ReviewHeaderProps) {
  const isMobile = variant === "mobile";
  const isStacked = variant === "stacked";

  return (
    <div className="flex flex-col gap-[5px] tracking-[0.6px]">
      <h2
        className={cn(
          "font-semibold leading-none text-[#1f1f1f]",
          isStacked ? "text-[28px]" : "text-[22px]",
        )}
      >
        Your security system
      </h2>
      <p
        className={cn(
          "font-medium leading-[1.3] text-[rgba(31,31,31,0.75)]",
          isStacked ? "text-base" : isMobile ? "text-xs" : "text-sm",
        )}
      >
        Review your personalized protection system designed to keep what
        matters most safe.
      </p>
    </div>
  );
}
