/**
 * Guards the intentional duplication between the backend's authoritative
 * pricing (`src/backend/service/pricing.ts`) and the frontend's display pricing
 * (`src/frontend/lib/bundle.ts`).
 *
 * If the two ever disagree the customer is charged something other than what
 * the UI showed, so this exits non-zero on any divergence.
 *
 * Run: pnpm test:pricing
 */
import catalogJson from "../src/frontend/data/bundle/catalog.json";
import categoryJson from "../src/frontend/data/bundle/category.json";
import {
  buildPricedLines,
  calculateTotals,
} from "../src/backend/service/pricing";
import type { CatalogDto } from "../src/backend/dto/catalog.dto";
import {
  buildReviewLines,
  calculatePricing,
  formatStepLabel,
  type BundleCatalog,
} from "../src/frontend/lib/bundle";

const frontendCatalog: BundleCatalog = {
  ...(catalogJson as unknown as Omit<BundleCatalog, "steps">),
  steps: catalogJson.steps.map((step, _, steps) => ({
    ...step,
    label: formatStepLabel(step.id, steps.length),
  })),
} as BundleCatalog;

const backendCatalog = frontendCatalog as unknown as CatalogDto;
const categoryOrder = (categoryJson as Array<{ id: string }>).map((c) => c.id);

/** Carts chosen to cover variants, FREE labels, locked items and stock limits. */
const CARTS: Array<[string, Record<string, number>]> = [
  ["single product", { "cam-v4:white": 1 }],
  ["multi-qty", { "cam-v4:white": 3 }],
  [
    "multiple variants of one product",
    { "cam-v4:white": 2, "cam-v4:black": 1, "cam-v4:grey": 4 },
  ],
  ["FREE + locked item", { "sense-hub": 1, "cam-v4:white": 1 }],
  ["shipping advantage included", { shipping: 1, "cam-v4:white": 2 }],
  ["plan (pick-only)", { "cam-unlimited": 1, "cam-v4:white": 1 }],
  ["no compare-at price", { "duo-doorbell": 2 }],
  [
    "everything at once",
    {
      "cam-v4:white": 2,
      "cam-v4:black": 1,
      "cam-pan-v3:black": 1,
      "floodlight-v2:white": 3,
      "duo-doorbell": 1,
      "battery-cam-pro:black": 2,
      "motion-sensor": 5,
      "sense-hub": 1,
      microsd: 4,
      "cam-unlimited": 1,
      shipping: 1,
    },
  ],
];

let failures = 0;

for (const [name, quantities] of CARTS) {
  const frontendTotals = calculatePricing(
    frontendCatalog,
    buildReviewLines(frontendCatalog, quantities),
  );
  const backendTotals = calculateTotals(
    backendCatalog,
    buildPricedLines(backendCatalog, quantities, categoryOrder),
  );

  const fields = ["total", "originalTotal", "savings"] as const;
  const diffs = fields.filter(
    (field) => frontendTotals[field] !== backendTotals[field],
  );

  if (diffs.length > 0) {
    failures += 1;
    console.error(`✗ ${name}`);
    for (const field of diffs) {
      console.error(
        `    ${field}: frontend=${frontendTotals[field]} backend=${backendTotals[field]}`,
      );
    }
  } else {
    console.log(`✓ ${name} — total $${backendTotals.total.toFixed(2)}`);
  }
}

if (failures > 0) {
  console.error(
    `\n${failures} cart(s) diverged. Backend and frontend pricing must agree —` +
      ` update both copies of the rule.`,
  );
  process.exit(1);
}

console.log(`\nAll ${CARTS.length} carts agree.`);
