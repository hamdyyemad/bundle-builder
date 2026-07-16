import type { ReviewLine } from "@/lib/bundle";
import type { ProductCategory } from "@/lib/categories";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories";

export type ReviewSectionProps = {
  items: ReviewLine[];
  financingLabel: string;
  originalTotal: number;
  total: number;
  savings: number;
  /** sidebar = Desktop Home; mobile = Mobile; stacked = 2xl Long Section */
  variant?: "sidebar" | "mobile" | "stacked";
  onQuantityChange: (key: string, quantity: number) => void;
  onCheckout: () => void;
  onSave: () => void;
  saveMessage?: string | null;
  checkoutMessage?: string | null;
};

export type ReviewGroup = {
  category: ProductCategory;
  label: string;
  items: ReviewLine[];
};

export { CATEGORY_LABELS, CATEGORY_ORDER };
