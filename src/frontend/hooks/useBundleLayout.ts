"use client";

import { useIsDesktop, useIsWide } from "./useIsDesktop";

export type BundleLayout = "mobile" | "sidebar" | "stacked";

/**
 * Maps viewport width to the Bundle Builder layout mode.
 *
 * Consumes generic breakpoint hooks (`useIsDesktop`, `useIsWide`):
 * - `mobile`  — &lt; 1024px
 * - `sidebar` — 1024px–1535px (steps + sticky review)
 * - `stacked` — ≥ 1536px (single column, review below)
 *
 * @returns The layout mode, or `null` until both breakpoints have mounted.
 */
export function useBundleLayout(): BundleLayout | null {
  const isDesktop = useIsDesktop();
  const isWide = useIsWide();

  if (isDesktop === null || isWide === null) return null;
  if (isWide) return "stacked";
  if (isDesktop) return "sidebar";
  return "mobile";
}
