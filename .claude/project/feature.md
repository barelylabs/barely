# Feature: Deferred Shipping Rate Calculation

## Context & Background

### Related Work
- **Builds On**: [[0_Projects/cart-performance-optimization]] - August 2025 project targeting 9.3s → 2.5s load time
- **Differs From**: Previous approach focused on BrandKit caching; this addresses a different bottleneck
- **Integrates With**: Existing `isFetchingRates` UI state already handles loading states

### Historical Context
- **Previous Attempts**: Cart performance project (Aug 2025) identified BrandKit blocking queries but didn't address shipping rate timing
- **Lessons Applied**: The existing project's polling mechanism (up to 12.7s backoff) is part of the problem we're now solving
- **Success Factors**: We're not adding new UI - leveraging existing loading states

## Problem Statement

Cart checkout pages take up to 5 seconds to first paint because shipping rate calculations happen during cart creation, and the page prefetch polls waiting for cart creation to complete. The ShipStation API call (500-2000ms) is in the critical path, blocking Time To First Paint.

### Evidence of Need
- Gap in existing solution: BrandKit caching doesn't address shipping rate timing
- Measurable impact: 5 second TTFP directly correlates with cart abandonment
- Technical validation: Code investigation confirms ShipStation API is called in `createMainCartFromFunnel()` before cart record exists

## Target Users

Fans/customers attempting to purchase merchandise from artists using Barely cart.

### Differentiation from Existing Users
- Not served by current optimization because: shipping rates weren't identified as a blocking issue until now
- Higher need for: fast checkout experience on mobile devices

## Current State & Pain Points

### How Users Handle This Today
- Current experience: Wait up to 5 seconds staring at loading screen
- Bounce: Many users abandon before checkout loads
- No workaround exists for end users

### Validated Pain Points
- **TTFP blocked by external API**: ShipStation rate estimation (500-2000ms) runs during cart creation
- **Polling compounds delay**: Page prefetch polls up to 12.7s waiting for cart to exist
- **Critical path includes non-critical data**: Shipping rate isn't needed until user submits - yet it blocks first paint

**Quantified impact**: Every extra second of load time increases abandonment. Industry standard: 3+ second load time loses 40%+ of mobile users.

## Recommended Solution

Defer shipping rate calculation from cart creation to a client-side side effect triggered after page load. The shipping rate should be calculated asynchronously once the checkout page has rendered, not as a prerequisite for rendering.

### Why This Approach
- Addresses the gap that BrandKit caching misses (shipping timing)
- Simpler than adding caching infrastructure - just changes WHEN calculation happens
- Leverages existing `isFetchingRates` UI state - no new components needed
- Avoids over-engineering: not adding Redis caching, not refactoring polling

## Success Criteria

### Differentiated Metrics
- **TTFP < 2 seconds** on checkout page (down from 5s)
- **Lighthouse Performance score improvement** (baseline TBD)
- Zero UX degradation - shipping amount still shows before user can submit

### Learning from Previous Attempts
- NOT measuring: Lighthouse score in isolation (previous project had 8 features, too broad)
- Focus on: Single metric (TTFP) with surgical change

## Core Functionality (MVP)

### Must Have (Validated through context)
1. **Remove shipping calculation from cart creation** - `createMainCartFromFunnel()` should skip `getProductsShippingRateEstimate()` calls
2. **Trigger shipping calculation on page mount** - Client-side effect calculates rates after first paint
3. **Handle null/undefined shipping gracefully** - Cart record exists without shipping amounts initially

### Reusable Components
- Use existing `isFetchingRates` Jotai atom for loading state
- Use existing `updateShippingAddressFromCheckout` mutation (already has correct Promise.all pattern)
- Use existing OrderSummary skeleton loader for shipping line

## Out of Scope for MVP

### Learned from Previous Attempts
- Full BrandKit caching overhaul (separate initiative)
- Redis session caching (over-engineering for this fix)
- Edge functions for shipping (premature optimization)
- Stripe element pre-warming (different bottleneck)

### Available in Existing Solutions
- Loading state UI - already exists
- Shipping recalculation on address change - already works

## Integration Points

### With Existing Features
- **OrderSummary component**: Already shows loading state when `isFetchingRates = true`
- **Checkout form**: Already disables submit button while rates fetch
- **Address change flow**: Already triggers shipping recalculation

### Technical Integration
- Extends: `updateShippingAddressFromCheckout` mutation or new lightweight mutation
- Reuses: Existing ShipEngine integration, existing rate calculation logic
- New requirements: Client-side trigger on checkout mount, handling initial null shipping state

## Complexity Assessment

**Overall Complexity**: Simple

**Reduced Complexity Through:**
- Reusing existing UI loading states
- Reusing existing shipping calculation functions
- Not changing the calculation logic, just the timing

**Remaining Complexity:**
- Ensuring cart can be created/saved without shipping amounts
- Handling edge cases (what if rates fail to load?)
- Coordinating the trigger timing (useEffect vs route load)

## Human Review Required

- [ ] Assumption: ShipStation API latency (500-2000ms) is the primary contributor - need to measure
- [ ] Assumption: Cart record can exist without shipping amounts (schema allows null?)
- [ ] Priority: Should this come before barely-usage-protection (deadline Feb 28)?

## Technical Considerations

High-level only:
- Fits within existing React Query / tRPC patterns
- Extends current checkout form's side effect model
- New requirement: Initial cart state with null shipping, client-triggered calculation

## Migration Path

### From Existing Solutions
- No user migration needed - behavior change is invisible
- Existing carts with shipping amounts continue to work
- New carts get shipping calculated post-load

### Deprecation Considerations
- Could eventually combine with shipping rate caching
- Coexists with future BrandKit optimizations

## Future Possibilities

### Based on Historical Patterns
- If successful, could enable: pre-fetching rates based on geo before checkout
- Watch for: scope creep into full caching layer
- Natural evolution toward: edge-computed shipping estimates
