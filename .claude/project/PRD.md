# Product Requirements Document: Deferred Shipping Rate Calculation

## Document Info

| Field | Value |
|-------|-------|
| Feature Name | Deferred Shipping Rate Calculation |
| Author | Product Team |
| Created | 2026-02-12 |
| Status | Ready for Implementation |
| Priority | P0 - Critical |

---

## Executive Summary

Cart checkout pages take up to 5 seconds to first paint because shipping rate calculations (ShipStation API, 500-2000ms) happen during cart creation, blocking the entire page from rendering. This feature defers shipping rate calculation to a client-side side effect triggered after page load, reducing Time To First Paint from 5 seconds to under 2 seconds while maintaining full functionality.

**Business Impact**:
- Reduce checkout abandonment caused by slow page loads
- Increase conversion rates from the same traffic
- Maintain shipping accuracy (calculation logic unchanged)

---

## Problem Statement

### Current Situation
- Checkout page takes up to 5 seconds to first paint
- Shipping rate calculation (ShipStation API) is called during cart creation
- Cart creation must complete before page prefetch returns
- Page prefetch polls for up to 12.7 seconds waiting for cart to exist
- The entire checkout form is blocked while shipping calculates

### Impact
- **Revenue**: Every extra second of load time increases abandonment. Industry standard: 3+ seconds loses 40%+ of mobile users
- **User Experience**: Fans stare at loading screen, may abandon before seeing checkout form
- **Trust**: Slow checkout signals unprofessionalism, undermines purchase confidence

### Evidence
- Code investigation confirms ShipStation API call in `createMainCartFromFunnel()` (cart.fns.ts:334-372)
- Page prefetch waits for cart to exist (cart.route.ts:205-226)
- Cart doesn't exist until shipping calculation completes
- Existing `isFetchingRates` UI state already handles loading - proves shipping can be async

---

## Goals & Success Metrics

### Primary Goals

| Goal | Success Metric | Target |
|------|----------------|--------|
| Reduce Time To First Paint | TTFP on checkout page | < 2 seconds (from 5s) |
| Maintain UX quality | Shipping visible before submit | 100% of checkouts |
| No functionality regression | Checkout completion rate | Equal or better |

### Non-Goals
- Changing shipping rate calculation logic
- Adding shipping rate caching
- Modifying the checkout UI
- Addressing other performance bottlenecks (BrandKit, etc.)

---

## User Segments & Jobs to Be Done

### Segment 1: Fans/Customers
**Primary Jobs:**
- Complete purchase quickly without friction
- See the checkout form immediately when clicking "checkout"
- Know the total including shipping before submitting payment

### Segment 2: Artists/Creators (Indirect)
**Primary Jobs:**
- Maximize conversion rates from traffic
- Earn revenue from fans who want to buy
- Present a professional checkout experience

---

## Requirements

### Functional Requirements

#### FR-1: Remove Shipping Calculation from Cart Creation

**Description**: The cart creation flow should no longer call ShipStation API. Cart records should be created with null/undefined shipping amounts.

**Current Flow:**
1. User hits checkout URL
2. Middleware creates cart via `/api/cart/create`
3. `createMainCartFromFunnel()` calls `getProductsShippingRateEstimate()` (BLOCKS 500-2000ms)
4. Cart record saved with shipping amounts
5. Page prefetch polls for cart to exist
6. Checkout form renders

**New Flow:**
1. User hits checkout URL
2. Middleware creates cart via `/api/cart/create`
3. `createMainCartFromFunnel()` skips shipping calculation
4. Cart record saved with null shipping amounts
5. Page prefetch returns immediately (cart exists)
6. Checkout form renders (TTFP achieved)
7. Client-side triggers shipping calculation (background)
8. Shipping amounts populated and displayed

**Acceptance Criteria:**
- [ ] `createMainCartFromFunnel()` does not call `getProductsShippingRateEstimate()`
- [ ] Cart records can be created with null shipping amounts
- [ ] No errors when cart has null shipping initially

---

#### FR-2: Client-Side Shipping Calculation Trigger

**Description**: After checkout page renders, trigger shipping rate calculation as a side effect.

**Trigger Point**: Checkout form mount (useEffect or equivalent)

**Behavior:**
1. On checkout form mount, check if shipping amounts are null
2. If null and geo data available (from middleware), trigger shipping calculation
3. Use existing `isFetchingRates` state to show loading indicator
4. Update cart with shipping amounts when calculation completes

**Acceptance Criteria:**
- [ ] Shipping calculation triggers after first paint
- [ ] Uses existing `isFetchingRates` Jotai atom for loading state
- [ ] OrderSummary shows skeleton/loading while shipping calculates
- [ ] Submit button remains disabled until shipping is calculated
- [ ] Shipping amounts are correct once calculated

---

#### FR-3: Handle Initial Null Shipping State

**Description**: The checkout UI must gracefully handle carts that don't yet have shipping amounts.

**OrderSummary Behavior:**
- Show product price immediately
- Show shipping line with loading indicator (existing skeleton)
- Show total as "Calculating..." or similar until shipping ready
- Update all amounts once shipping is calculated

**Form Behavior:**
- Submit button disabled while `isFetchingRates = true`
- No error messages for null shipping (expected state)

**Acceptance Criteria:**
- [ ] OrderSummary renders without shipping amount
- [ ] Loading indicator visible for shipping line
- [ ] Total updates correctly when shipping is calculated
- [ ] No console errors or UI glitches with null shipping

---

#### FR-4: Error Handling for Failed Shipping Calculation

**Description**: If shipping calculation fails post-load, show clear feedback and recovery path.

**Error Scenarios:**
- ShipStation API timeout
- Invalid address/geo data
- Network failure

**Error Handling:**
- Show error message in OrderSummary shipping line
- Provide "Retry" option
- Allow user to change address to trigger recalculation
- Do not block form entirely - user can fix address

**Acceptance Criteria:**
- [ ] Failed shipping calculation shows clear error message
- [ ] User can retry or update address to recalculate
- [ ] Cart is not left in broken state
- [ ] User is not stuck without recourse

---

### Non-Functional Requirements

#### NFR-1: Performance
- Time To First Paint < 2 seconds (from 5 seconds)
- Shipping calculation completes within 3 seconds of page load
- No increase in total checkout time

#### NFR-2: Reliability
- Shipping calculation must eventually complete successfully
- Existing error handling for ShipStation API still applies
- Cart state remains consistent

#### NFR-3: Compatibility
- Works with existing address change flow
- Works with bump products (main + bump shipping)
- Works with all geo data sources (Vercel headers)

---

## User Stories

### US-1: See Checkout Form Immediately
**As a** fan ready to buy merchandise
**I want to** see the checkout form right away
**So that** I can start entering my information without waiting

**Acceptance Criteria:**
- Given I click "checkout" on a product page
- When the checkout page loads
- Then I see the checkout form within 2 seconds
- And I can start entering my information immediately

---

### US-2: See Shipping Before Submitting
**As a** fan completing checkout
**I want to** see the shipping cost before I submit payment
**So that** I know the total I'll be charged

**Acceptance Criteria:**
- Given I'm on the checkout page
- When shipping is calculating
- Then I see a loading indicator for shipping
- And the submit button is disabled
- When shipping calculation completes
- Then I see the shipping cost
- And I see the correct total
- And the submit button is enabled

---

### US-3: Recover from Shipping Errors
**As a** fan with an unusual address
**I want to** understand why shipping can't be calculated
**So that** I can fix the issue and complete my purchase

**Acceptance Criteria:**
- Given shipping calculation fails
- When I view the checkout page
- Then I see a clear error message
- And I can retry or update my address
- When I fix the issue
- Then shipping recalculates successfully

---

## Out of Scope

The following are explicitly **not** included in this feature:

- Shipping rate caching or memoization
- Changes to the ShipStation API integration logic
- Changes to shipping rate markup calculations
- BrandKit caching or other performance optimizations
- Edge function deployment for shipping
- Pre-fetching shipping based on IP geo before checkout
- Changes to the checkout form UI design
- Changes to the address change flow

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| `isFetchingRates` Jotai atom | ✅ Exists | checkout-form.tsx |
| OrderSummary skeleton loader | ✅ Exists | Shows loading state |
| Submit button disabled state | ✅ Exists | Disabled while fetching rates |
| `updateShippingAddressFromCheckout` mutation | ✅ Exists | Has Promise.all pattern |
| ShipEngine integration | ✅ Exists | No changes needed |
| Cart schema | ⚠️ TBD | Verify shipping fields allow null |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Shipping fails more often post-load | Low | Medium | Same ShipStation call, just different timing |
| User submits before shipping loads | N/A | N/A | Submit button disabled until complete |
| Cart schema requires shipping | Low | High | Verify schema allows null before implementation |
| Race condition with address changes | Low | Medium | Existing debounce handles this |

---

## Launch Plan

### Phase 1: Schema Verification
- Confirm cart schema allows null shipping amounts
- Identify any validation that requires shipping

### Phase 2: Cart Creation Changes
- Remove `getProductsShippingRateEstimate()` calls from `createMainCartFromFunnel()`
- Cart creates immediately without shipping

### Phase 3: Client-Side Trigger
- Add useEffect or similar to trigger shipping calculation on mount
- Use existing mutation or create lightweight variant
- Integrate with existing `isFetchingRates` state

### Phase 4: Testing & Validation
- Measure TTFP before and after
- Test various geo scenarios
- Test error handling

### Phase 5: Deploy
- Deploy to production
- Monitor checkout completion rates
- Monitor ShipStation API success rates

---

## Appendix

### A: Key Files Reference

| File | Location | Role |
|------|----------|------|
| Cart creation | `packages/lib/src/functions/cart.fns.ts:334-372` | Remove shipping call |
| Page prefetch | `apps/cart/src/app/[mode]/[handle]/[key]/checkout/page.tsx:52-53` | Benefits from faster cart |
| Polling wait | `packages/lib/src/trpc/routes/cart.route.ts:205-226` | Resolves faster |
| Loading state | `apps/cart/src/app/[mode]/[handle]/[key]/checkout/checkout-form.tsx` | `isFetchingRates` atom |
| Shipping API | `packages/lib/src/integrations/shipping/shipengine.endpts.ts:289-317` | No changes |

### B: Existing Parallel Pattern

The correct `Promise.all()` pattern for shipping calculation already exists in `updateShippingAddressFromCheckout` (cart.route.ts:482-498). This can be reused or referenced for the client-side trigger.

### C: Performance Baseline

| Metric | Current | Target |
|--------|---------|--------|
| Time To First Paint | ~5 seconds | < 2 seconds |
| Total checkout time | ~5 seconds + user input | ~2 seconds + shipping calc + user input |
| Perceived speed | Slow, frustrating | Fast, professional |
