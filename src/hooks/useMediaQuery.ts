"use client";

import { useEffect, useState } from "react";

/** Tailwind `lg` — keep in sync with layout switching. */
export const LG_MEDIA_QUERY = "(min-width: 1024px)";

/** Tailwind `2xl` — keep in sync with layout switching. */
export const XL2_MEDIA_QUERY = "(min-width: 1536px)";

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 *
 * @param query - A valid `window.matchMedia` query string.
 * @returns `true` / `false` after mount, or `null` until then (avoids
 * SSR/client hydration mismatch).
 *
 * @example
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia(query);

    const update = () => setMatches(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
