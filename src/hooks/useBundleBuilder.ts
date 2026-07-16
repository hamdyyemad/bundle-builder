"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  STORAGE_KEY,
  applyDefaultSelections,
  buildReviewLines,
  calculatePricing,
  catalog,
  countSelectedInStep as countSelectedInStepHelper,
  createSeedState,
  getActiveVariantId,
  getCompareAtPrice,
  getProduct,
  getQuantityForProduct,
  getSelectableStepItems,
  isPlanItem,
  lineKey,
  productHasAnyQuantity,
  type PersistedBundleState,
} from "@/lib/bundle";

function readSavedState(): PersistedBundleState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedBundleState;
    if (!parsed?.quantities || !parsed?.activeVariants) return null;
    return {
      expandedStep: parsed.expandedStep ?? catalog.steps[0]?.id ?? 1,
      activeVariants: parsed.activeVariants,
      quantities: applyDefaultSelections(parsed.quantities),
    };
  } catch {
    return null;
  }
}

/**
 * Owns bundle-builder client state: step accordion, product quantities,
 * active variants, review pricing, and save/checkout feedback.
 *
 * Hydrates from `localStorage` after mount (empty cart on SSR first paint), and exposes
 * stable callbacks for quantity/variant updates so memoized children can skip
 * unnecessary re-renders.
 *
 * @returns Catalog steps, derived review/pricing data, UI messages, and
 * actions for navigating steps and updating the cart.
 */
export function useBundleBuilder() {
  const [state, setState] = useState<PersistedBundleState>(createSeedState);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const stateRef = useRef(state);
  const saveTimeoutRef = useRef<number | null>(null);
  const checkoutTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Restore after mount so SSR HTML matches the seed first paint.
  useEffect(() => {
    const saved = readSavedState();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydrate
      setState(saved);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current != null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      if (checkoutTimeoutRef.current != null) {
        window.clearTimeout(checkoutTimeoutRef.current);
      }
    };
  }, []);

  const { expandedStep, activeVariants, quantities } = state;

  const reviewLines = useMemo(
    () => buildReviewLines(quantities),
    [quantities],
  );

  const pricing = useMemo(() => calculatePricing(reviewLines), [reviewLines]);
  const pricingTotalRef = useRef(pricing.total);

  useEffect(() => {
    pricingTotalRef.current = pricing.total;
  }, [pricing.total]);

  const selectableProducts = useMemo(() => getSelectableStepItems(), []);

  const setActiveVariant = useCallback((productId: string, variantId: string) => {
    setState((prev) => ({
      ...prev,
      activeVariants: { ...prev.activeVariants, [productId]: variantId },
    }));
  }, []);

  const setProductCardQuantity = useCallback(
    (productId: string, quantity: number) => {
      setState((prev) => {
        const product = getProduct(productId);
        if (!product || product.locked || isPlanItem(product)) return prev;

        const variantId = getActiveVariantId(product, prev.activeVariants);
        const key = lineKey(productId, variantId);
        let nextQty = Math.max(0, quantity);
        if (product.countInStock != null) {
          nextQty = Math.min(nextQty, product.countInStock);
        }

        const nextQuantities = { ...prev.quantities };
        if (nextQty === 0) delete nextQuantities[key];
        else nextQuantities[key] = nextQty;

        return {
          ...prev,
          quantities: applyDefaultSelections(nextQuantities),
        };
      });
    },
    [],
  );

  /** Plans are pick-only: selected = qty 1, deselected = removed. */
  const togglePlanSelection = useCallback((planId: string) => {
    setState((prev) => {
      const plan = getProduct(planId);
      if (!plan || !isPlanItem(plan)) return prev;

      const nextQuantities = { ...prev.quantities };
      if ((nextQuantities[planId] ?? 0) > 0) delete nextQuantities[planId];
      else nextQuantities[planId] = 1;

      return {
        ...prev,
        quantities: applyDefaultSelections(nextQuantities),
      };
    });
  }, []);

  const setReviewLineQuantity = useCallback((key: string, quantity: number) => {
    setState((prev) => {
      const [productId, variantId] = key.split(":");
      const product = getProduct(productId);
      if (!product || product.locked || isPlanItem(product)) return prev;

      let nextQty = Math.max(0, quantity);
      if (product.countInStock != null) {
        nextQty = Math.min(nextQty, product.countInStock);
      }

      const line = lineKey(productId, variantId || undefined);
      const nextQuantities = { ...prev.quantities };
      if (nextQty === 0) delete nextQuantities[line];
      else nextQuantities[line] = nextQty;

      return {
        ...prev,
        quantities: applyDefaultSelections(nextQuantities),
      };
    });
  }, []);

  const toggleStep = useCallback((stepId: number) => {
    setState((prev) => ({
      ...prev,
      expandedStep: prev.expandedStep === stepId ? 0 : stepId,
    }));
  }, []);

  const goToNextStep = useCallback((currentStepId: number) => {
    const next = catalog.steps.find((step) => step.id === currentStepId + 1);
    setState((prev) => ({
      ...prev,
      // Last step: collapse so the review panel is the focus
      expandedStep: next?.id ?? 0,
    }));
  }, []);

  const saveForLater = useCallback(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(stateRef.current),
    );
    setSaveMessage(
      "System saved. Come back anytime to pick up where you left off.",
    );

    if (saveTimeoutRef.current != null) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      setSaveMessage(null);
      saveTimeoutRef.current = null;
    }, 3500);
  }, []);

  const checkout = useCallback(() => {
    setCheckoutMessage(
      `Checkout ready — total $${pricingTotalRef.current.toFixed(2)}. (Prototype confirmation)`,
    );

    if (checkoutTimeoutRef.current != null) {
      window.clearTimeout(checkoutTimeoutRef.current);
    }
    checkoutTimeoutRef.current = window.setTimeout(() => {
      setCheckoutMessage(null);
      checkoutTimeoutRef.current = null;
    }, 4000);
  }, []);

  const getCardView = useCallback(
    (productId: string) => {
      const product = getProduct(productId);
      if (!product) return null;
      const activeVariantId = getActiveVariantId(product, activeVariants);
      const quantity = getQuantityForProduct(
        product,
        quantities,
        activeVariants,
      );
      const selected = productHasAnyQuantity(product, quantities);

      return {
        product,
        activeVariantId,
        quantity,
        selected,
        displayPrice: product.price,
        displayCompareAt: getCompareAtPrice(product),
        selectionMode: isPlanItem(product) ? ("pick" as const) : ("quantity" as const),
      };
    },
    [activeVariants, quantities],
  );

  const countSelectedInStep = useCallback(
    (stepId: number) => countSelectedInStepHelper(stepId, quantities),
    [quantities],
  );

  return {
    steps: catalog.steps,
    selectableProducts,
    expandedStep,
    activeVariants,
    quantities,
    reviewLines,
    pricing,
    saveMessage,
    checkoutMessage,
    toggleStep,
    goToNextStep,
    setActiveVariant,
    setProductCardQuantity,
    togglePlanSelection,
    setReviewLineQuantity,
    saveForLater,
    checkout,
    getCardView,
    countSelectedInStep,
  };
}
