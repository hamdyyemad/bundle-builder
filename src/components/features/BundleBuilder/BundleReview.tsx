import { ReviewSection } from "./ReviewSection";
import type { useBundleBuilder } from "@/hooks";

type Bundle = ReturnType<typeof useBundleBuilder>;

type BundleReviewProps = {
  bundle: Bundle;
  variant?: "sidebar" | "mobile" | "stacked";
};

export function BundleReview({ bundle, variant }: BundleReviewProps) {
  return (
    <ReviewSection
      items={bundle.reviewLines}
      financingLabel={bundle.pricing.financingLabel}
      originalTotal={bundle.pricing.originalTotal}
      total={bundle.pricing.total}
      savings={bundle.pricing.savings}
      variant={variant}
      onQuantityChange={bundle.setReviewLineQuantity}
      onCheckout={bundle.checkout}
      onSave={bundle.saveForLater}
      saveMessage={bundle.saveMessage}
      checkoutMessage={bundle.checkoutMessage}
    />
  );
}
