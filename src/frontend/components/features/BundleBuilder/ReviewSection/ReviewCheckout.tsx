"use client";

import Image from "next/image";
import { Button } from "@/frontend/components/ui/Button";

type ReviewCheckoutProps = {
  financingLabel: string;
  originalTotal: number;
  total: number;
  savings: number;
  variant?: "sidebar" | "mobile" | "stacked";
  onCheckout: () => void;
  onSave: () => void;
  saveMessage?: string | null;
  checkoutMessage?: string | null;
};

export function ReviewCheckout({
  financingLabel,
  originalTotal,
  total,
  savings,
  variant = "sidebar",
  onCheckout,
  onSave,
  saveMessage,
  checkoutMessage,
}: ReviewCheckoutProps) {
  const isStacked = variant === "stacked";

  return (
    <div className="flex w-full flex-col gap-2">
      {isStacked && (
        <div className="mb-2 flex items-start gap-6">
          <div className="relative size-[131px] shrink-0">
            <Image
              src="/assets/badges/satisfaction.png"
              alt="100% Wyze satisfaction guarantee"
              fill
              className="object-cover"
              sizes="131px"
            />
          </div>
          <div className="pt-6">
            <p className="text-lg font-semibold leading-[1.1] text-[#1f1f1f]">
              30-day hassle-free returns
            </p>
            <p className="mt-1 text-sm font-medium leading-[1.3] text-[rgba(31,31,31,0.75)]">
              If you&apos;re not totally in love with the product, we will
              refund you 100%.
            </p>
          </div>
        </div>
      )}

      <div className="flex w-full items-center justify-between">
        {!isStacked && (
          <div className="relative size-[78px] shrink-0">
            <Image
              src="/assets/badges/satisfaction.png"
              alt="100% Wyze satisfaction guarantee"
              fill
              className="object-cover"
              sizes="78px"
            />
          </div>
        )}
        <div
          className={`flex flex-col justify-center gap-2 ${isStacked ? "w-full flex-row items-center justify-between" : "items-end"}`}
        >
          <span className="rounded-[3px] bg-wyze-purple px-2 py-[5px] text-xs font-medium tracking-[-0.6px] text-white">
            {financingLabel}
          </span>
          <div className="flex items-baseline gap-2">
            {originalTotal > total && (
              <span className="text-lg font-medium leading-5 tracking-[0.045px] text-[#6f7882] line-through">
                ${originalTotal.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold leading-8 tracking-[-0.03px] text-wyze-purple">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-1 pt-2.5">
        {savings > 0 && (
          <p className="w-full text-center text-xs font-semibold tracking-[-0.056px] text-[#0aa288]">
            Congrats! You&apos;re saving ${savings.toFixed(2)} on your security
            bundle!
          </p>
        )}
        <Button variant="primary" onClick={onCheckout}>
          Checkout
        </Button>
        {checkoutMessage && (
          <p className="text-center text-xs font-medium text-wyze-purple">
            {checkoutMessage}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onSave}
        className="w-full text-center text-sm italic leading-[1.2] tracking-[-0.016px] text-[#484848] underline"
      >
        Save my system for later
      </button>
      {saveMessage && (
        <p className="text-center text-xs font-medium text-[#0aa288]">
          {saveMessage}
        </p>
      )}
    </div>
  );
}
