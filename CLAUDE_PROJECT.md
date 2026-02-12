# Project Context: Cart Checkout TTFP Optimization

## Current Development

**Working on:** Reduce checkout page Time To First Paint from 5 seconds to under 2 seconds by deferring shipping rate calculation to post-page-load.

**Deadline:** February 26, 2026

**Branch:** `feature/cart-checkout-ttfp`

## Key Files in This Worktree

- `.claude/project/PRD.md` - Full product requirements
- `.claude/project/plan-organized.md` - Implementation checklist by milestone
- `.claude/project/JTBD.md` - Jobs to be done analysis
- `.claude/project/feature.md` - Feature overview and rationale
- `.claude/project/plan.md` - Technical implementation plan

## Current Focus

**Milestone 0: Performance Baseline**
- Measure current TTFP on checkout page using Lighthouse/DevTools
- Record current cart creation time
- Document current checkout completion rate
- Screenshot current OrderSummary loading behavior

Then proceed to:

**Milestone 1: Remove Shipping from Cart Creation**
- File: `packages/lib/src/functions/cart.fns.ts`
- Remove lines 334-373 (shipping calculation block)
- Cart should create with null shipping amounts

## Key Technical Decisions

1. **Remove shipping from cart creation entirely** - Eliminates 500-2000ms blocking call
2. **Create new lightweight mutation** - `calculateInitialShipping` for post-load calculation
3. **Use existing isFetchingRates atom** - Already handles loading state
4. **Trigger on checkout form mount** - useEffect pattern with geo data from cart

## Success Criteria

- [ ] TTFP on checkout page < 2 seconds (from 5s)
- [ ] Shipping visible before user can submit payment
- [ ] Zero UX degradation - existing loading states handle async calculation
- [ ] No increase in checkout errors or failures

## Key Files to Modify

| File | Change |
|------|--------|
| `packages/lib/src/functions/cart.fns.ts` | Remove shipping calculation (lines 334-373) |
| `packages/validators/src/schemas/cart.schema.ts` | Add new schema |
| `packages/lib/src/trpc/routes/cart.route.ts` | Add new mutation |
| `apps/cart/src/app/[mode]/[handle]/[key]/checkout/checkout-form.tsx` | Trigger + UI |

## Root Cause (Validated)

The ShipStation API call (500-2000ms) happens in `createMainCartFromFunnel()`, which must complete before the cart record exists, which must exist before the page prefetch can return.

```
URL hit → Middleware → /api/cart/create → createMainCartFromFunnel()
    → getProductsShippingRateEstimate() [BLOCKING 500-2000ms]
    → Cart record saved → Page prefetch returns → Checkout renders
```

## Existing Patterns to Leverage

1. **`isFetchingRates` Jotai atom** - checkout-form.tsx line 50
2. **Promise.all shipping pattern** - cart.route.ts lines 482-498
3. **OrderSummary skeleton** - Already shows loading state
4. **Submit button disabled** - Already disabled while fetching rates

## Quick Start

1. This worktree is focused on implementing this specific project
2. All project artifacts are in `.claude/project/`
3. Start with the organized plan in `plan-organized.md`
4. Original project docs: `0_Projects/cart-checkout-ttfp/` (in vault root)
