"use client";

import { BundleReview } from "./BundleReview";
import { BundleSteps } from "./BundleSteps";
import { useBundleBuilder, useBundleLayout } from "@/frontend/hooks";

type BundleBuilderState = ReturnType<typeof useBundleBuilder>;

export function BundleBuilder() {
  const bundle = useBundleBuilder();
  const layout = useBundleLayout();

  return (
    <main className="min-h-screen bg-white">
      {layout === null ? null : layout === "mobile" ? (
        <MobileView bundle={bundle} />
      ) : layout === "stacked" ? (
        <StackedView bundle={bundle} />
      ) : (
        <SidebarView bundle={bundle} />
      )}
    </main>
  );
}

/** Mobile — single column: steps, then review */
function MobileView({ bundle }: { bundle: BundleBuilderState }) {
  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col items-center gap-5 pt-[31px]">
      <h1 className="w-[348px] text-center text-[31.875px] font-bold leading-[1.1] tracking-[-0.064px] text-[#1f1f1f]">
        Let&apos;s get started!
      </h1>

      <div className="flex w-full flex-col">
        <BundleSteps bundle={bundle} layout="mobile" />
        <div className="mt-0">
          <BundleReview bundle={bundle} variant="mobile" />
        </div>
      </div>
    </div>
  );
}

/** Desktop Home — two columns with sticky review sidebar */
function SidebarView({ bundle }: { bundle: BundleBuilderState }) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] justify-center gap-[46px] py-[49px]">
      <div className="flex w-[768px] shrink-0 flex-col gap-[13px]">
        <BundleSteps bundle={bundle} layout="sidebar" />
      </div>

      <aside className="w-[399px] shrink-0 self-start sticky top-6">
        <BundleReview bundle={bundle} variant="sidebar" />
      </aside>
    </div>
  );
}

/** Desktop Long (2xl+) — single column: steps, then review */
function StackedView({ bundle }: { bundle: BundleBuilderState }) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] justify-center py-[49px]">
      <div className="flex w-full max-w-[1213px] flex-col gap-[13px]">
        <BundleSteps bundle={bundle} layout="stacked" />
        <BundleReview bundle={bundle} variant="stacked" />
      </div>
    </div>
  );
}
