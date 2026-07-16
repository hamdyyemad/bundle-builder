# 01 — Bundle Builder: work so far

Summary of bundle builder feature as implemented to date.

## Architecture

```
src/
  app/                              # Next.js entry (page + layout)
  components/
    features/BundleBuilder/         # Feature module
      BundleBuilder.tsx             # Orchestrator (layout switch)
      BundleSteps.tsx               # Shared AccordionStep wiring
      BundleReview.tsx              # Shared ReviewSection wiring
      AccordionStep/                # Step accordion + children
      ReviewSection/                # Review panel + children
    ui/                             # Shared primitives
  data/
    bundle/
      catalog.json                  # steps, products, plans, advantages
      category.json                 # category ids + review labels + order
    site/                           # fonts + page metadata
  hooks/
    useBundleBuilder.ts             # Cart / steps / pricing / save
    useMediaQuery.ts                # Generic matchMedia
    useIsDesktop.ts                 # lg / 2xl aliases
    useBundleLayout.ts              # mobile | sidebar | stacked
  lib/
    bundle.ts                       # Types, catalog helpers, pricing
    categories.ts                   # ProductCategory + labels/order
```

## Data model

### `catalog.json`

| Key | Purpose |
| --- | --- |
| `steps` | Accordion steps (`id`, `title`, `nextLabel`, `icon`, `category`) |
| `products` | Shoppable items (cameras, sensors, accessories, hub, …) |
| `plans` | Subscription picks (e.g. Cam Unlimited) — pick-only, no qty |
| `advantages` | Non-product perks (e.g. free shipping) shown in review |

Step copy rules:

- No hardcoded `label` — derived as `Step {id} of {total}`.
- `nextLabel` is destination-only (e.g. `"Choose your plan"`); UI prefixes `Next: `.

Product pricing rules:

- Use **`price`** + optional **`compareAtPrice`** only.
- Badge `Save X%` is derived automatically from those two (not stored in JSON).
- No separate `badge`, `discount`, or card-only price fields.

Included cart defaults (hub, shipping) live in code via `defaultSelected` / `included` + `applyDefaultSelections` — not a catalog `seed` block.

### `category.json`

Ordered list of `{ id, label }`. Source of truth for:

- `ProductCategory` enum-like const (`ProductCategory.Cameras`, …)
- Review group headings and sort order (`CATEGORY_LABELS`, `CATEGORY_ORDER`)

## Feature structure

- UI lives under `components/features/BundleBuilder/` (feature-first, not a flat `sections/` dump).
- `ReviewSection` and `AccordionStep` are folders: orchestrator + child components.
- `BundleBuilder` picks one layout via `useBundleLayout`:
  - `mobile` — single column, review below steps
  - `sidebar` — steps + sticky review (lg–2xl)
  - `stacked` — wide single column, review beside/below (2xl+)
- Shared wiring is DRY’d through `BundleSteps` (`layout`) and `BundleReview` (`variant`).

## State & data flow

```
catalog / categories
        ↓
  lib/bundle helpers
        ↓
  useBundleBuilder  ←── actions from Accordion / Review
        ↓
  BundleBuilder
    ├── BundleSteps → AccordionStep → ProductCard
    └── BundleReview → ReviewSection → line items / checkout
```

### `useBundleBuilder`

Owns:

- `expandedStep`, `activeVariants`, `quantities`
- Derived: `reviewLines`, `pricing`, `getCardView`, `countSelectedInStep`
- Messages: `saveMessage`, `checkoutMessage`

Actions:

- Step: `toggleStep`, `goToNextStep`
- Cart: `setProductCardQuantity`, `setActiveVariant`, `togglePlanSelection`, `setReviewLineQuantity`
- Footer: `saveForLater`, `checkout`

Hydrates from `localStorage` after mount; SSR first paint uses `createSeedState()` (first step open + included defaults).

Optimizations:

- Stable callbacks (`useCallback` + functional `setState` where possible)
- Timeout refs for save/checkout message clearing

### AccordionStep

Routes by `expanded` + `highlightExpanded`:

- Collapsed → header only
- Expanded (mobile) → `ExpandedStep`
- Expanded + highlighted (desktop) → `ExpandedHighlightedStep`

Uses `getCardView(productId)` for each card; writes back through quantity / variant / plan callbacks.

### ReviewSection

- Groups flat `reviewLines` by `CATEGORY_ORDER`
- Renders header, grouped line items (qty steppers), then checkout/save
- `variant` only changes layout (`mobile` | `sidebar` | `stacked`)

## Viewport hooks

Layered:

1. `useMediaQuery(query)` — generic
2. `useIsDesktop` / `useIsWide` — Tailwind `lg` / `2xl`
3. `useBundleLayout` — feature mapping → `mobile` | `sidebar` | `stacked`