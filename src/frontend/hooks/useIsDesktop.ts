"use client";

import {
  LG_MEDIA_QUERY,
  XL2_MEDIA_QUERY,
  useMediaQuery,
} from "./useMediaQuery";

/**
 * Whether the viewport is at least Tailwind `lg` (≥ 1024px).
 *
 * @returns `true` / `false` after mount, or `null` until then.
 */
export function useIsDesktop(): boolean | null {
  return useMediaQuery(LG_MEDIA_QUERY);
}

/**
 * Whether the viewport is at least Tailwind `2xl` (≥ 1536px).
 *
 * @returns `true` / `false` after mount, or `null` until then.
 */
export function useIsWide(): boolean | null {
  return useMediaQuery(XL2_MEDIA_QUERY);
}
