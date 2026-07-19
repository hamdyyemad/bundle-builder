import { cn } from "@/frontend/lib/cn";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center transition-opacity hover:opacity-90",
        variant === "primary" &&
          "w-full rounded bg-wyze-purple px-4 py-[13px] text-[17px] font-bold leading-normal text-white",
        variant === "outline" &&
          "h-[39px] rounded-[7px] border border-wyze-purple px-6 py-[5px] text-lg font-semibold leading-6 text-wyze-purple",
        variant === "ghost" &&
          "text-sm text-[#484848] underline underline-offset-2",
        className,
      )}
    >
      {children}
    </button>
  );
}
