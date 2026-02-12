# Technical Implementation Plan: Deferred Shipping Rate Calculation

## Feature Summary

Defer shipping rate calculation from cart creation to a client-side side effect triggered after checkout page render, reducing Time To First Paint from ~5 seconds to <2 seconds by removing the blocking ShipStation API call from the critical path.

## Architecture Overview

The solution modifies the cart creation flow to skip shipping calculation, then triggers shipping calculation client-side after the checkout form mounts. This leverages existing UI loading states and mutation patterns.

**Components Affected:**

| Layer | Component | Change |
|-------|-----------|--------|
| Backend | `createMainCartFromFunnel()` in cart.fns.ts | Remove shipping calculation |
| Backend | New tRPC mutation or modified existing | Calculate shipping post-load |
| Frontend | checkout-form.tsx | Add useEffect to trigger shipping on mount |
| Frontend | OrderSummary component | Handle initial null shipping state |
| Database | Cart schema | No change (already nullable) |

**Data Flow (New):**
```
1. User hits checkout URL
2. Middleware fires /api/cart/create (no shipping calc)
3. Cart record saved with null shipping amounts
4. Page prefetch returns immediately
5. Checkout form renders (TTFP achieved)
6. useEffect detects null shipping → triggers mutation
7. isFetchingRates = true → loading state shown
8. ShipStation API called (background)
9. Cart updated with shipping amounts
10. isFetchingRates = false → amounts displayed
```

## Key Technical Decisions

### 1. Remove shipping from cart creation entirely
**Rationale:** The shipping calculation is the only external API call in `createMainCartFromFunnel()`. Removing it eliminates the 500-2000ms blocking call from the critical path.

### 2. Create new lightweight mutation for initial shipping calculation
**Rationale:** The existing `updateShippingAddressFromCheckout` requires a full address with postal code. For initial calculation, we only have geo data (country, state, city) from Vercel headers. A new mutation allows simpler inputs and clearer separation of concerns.

### 3. Use existing isFetchingRates atom for loading state
**Rationale:** The state management pattern already exists and is observed by SubmitButton and OrderSummary. Reusing it ensures consistent behavior and avoids duplication.

### 4. Trigger on checkout form mount with geo data from cart
**Rationale:** The middleware already extracts geo data from Vercel headers and passes it to cart creation. This data is stored on the cart record and can be used for initial shipping calculation.

### 5. Handle null shipping gracefully in UI (no error state)
**Rationale:** Null shipping on initial render is expected, not an error. The UI should show a loading indicator, not an error message.

## Dependencies & Assumptions

**Dependencies:**
- `isFetchingRatesAtom` (Jotai atom in checkout-form.tsx) - for loading state
- `getProductsShippingRateEstimate()` (shipengine.endpts.ts) - shipping calculation
- `atomWithToggle` pattern from @barely/ui - for boolean atom
- Cart schema shipping fields are nullable - ✅ Verified (cart.sql.ts lines 96, 103, 112-114)

**Assumptions:**
- Geo data (country, state, city) from Vercel headers is sufficient for initial shipping estimate
- The existing debounce pattern (500ms) is acceptable for the initial trigger
- Rate limiting (30 req/min) will not be hit by initial calculations
- ShipStation API latency remains 500-2000ms

## Implementation Checklist

### Feature 1: Remove Shipping from Cart Creation

**Backend - cart.fns.ts:**
- [ ] In `createMainCartFromFunnel()`, remove the shipping calculation block (lines 334-373)
  - Remove the `if (shipTo?.country && shipTo.state && shipTo.city)` conditional
  - Remove both `getProductsShippingRateEstimate()` calls
  - Remove assignments to `cart.mainShippingAmount` and `cart.bumpShippingPrice`
- [ ] Ensure cart record is created with null shipping amounts (default behavior)
- [ ] Verify no other code paths in `createMainCartFromFunnel()` set shipping amounts

**Testing:**
- [ ] Test that cart creation completes without shipping calculation
- [ ] Verify cart record has null shipping amounts after creation
- [ ] Measure cart creation time before/after change

---

### Feature 2: New Initial Shipping Calculation Mutation

**Backend - cart.route.ts:**
- [ ] Create new tRPC mutation `calculateInitialShipping` with schema:
  ```typescript
  {
    cartId: z.string(),
    handle: z.string(),
    key: z.string(),
  }
  ```
- [ ] Implement mutation logic:
  - Fetch cart and funnel by cartId, handle, key
  - Extract shipTo from cart's geo data fields (stored during creation)
  - Extract shipFrom from funnel workspace shipping address
  - Call `getProductsShippingRateEstimate()` using Promise.all pattern (copy from lines 482-498)
  - Update cart with calculated shipping amounts
  - Return updated amounts
- [ ] Add rate limiting (reuse existing pattern from line 433-437)
- [ ] Handle case where geo data is insufficient (return early, no error)

**Validators - cart.schema.ts:**
- [ ] Add `calculateInitialShippingSchema` validator with cartId, handle, key fields

**Testing:**
- [ ] Test mutation with valid geo data returns shipping amounts
- [ ] Test mutation with missing geo data returns gracefully (no crash)
- [ ] Test rate limiting prevents abuse

---

### Feature 3: Client-Side Shipping Trigger on Mount

**Frontend - checkout-form.tsx:**
- [ ] Import the new `calculateInitialShipping` mutation from tRPC client
- [ ] Add useMutation hook for `calculateInitialShipping`:
  ```typescript
  const { mutateAsync: calculateShipping } = useMutation(
    trpc.calculateInitialShipping.mutationOptions({
      onMutate: () => setIsFetchingRates(true),
      onSettled: () => setIsFetchingRates(false),
    }),
  );
  ```
- [ ] Add useEffect to trigger shipping calculation on mount:
  ```typescript
  const shippingCalculated = useRef(false);

  useEffect(() => {
    if (shippingCalculated.current) return;
    if (!cart.mainShippingAmount && cart.shippingAddressCountry) {
      shippingCalculated.current = true;
      calculateShipping({ cartId, handle, key: cartKey });
    }
  }, [cart, cartId, handle, cartKey, calculateShipping]);
  ```
- [ ] Ensure isFetchingRates is set to true before mutation starts
- [ ] Invalidate cart query after mutation succeeds to update UI

**Testing:**
- [ ] Test that shipping calculation triggers on checkout form mount
- [ ] Test that shipping calculation only triggers once (useRef guard)
- [ ] Test that isFetchingRates shows loading state during calculation
- [ ] Test that shipping amounts update correctly after calculation

---

### Feature 4: Handle Null Shipping State in UI

**Frontend - checkout-form.tsx (OrderSummary section):**
- [ ] Verify OrderSummary already handles isFetchingRates loading state (lines 1007-1017)
- [ ] Ensure shipping line shows pulse animation when isFetchingRates is true
- [ ] Ensure total calculation handles null shipping gracefully
  - Check `getAmountsForCheckout()` handles null shipping amounts
  - If not, add null coalescing: `amounts.checkoutShippingAndHandlingAmount ?? 0`

**Frontend - checkout-form.tsx (SubmitButton section):**
- [ ] Verify SubmitButton is disabled when isFetchingRates is true (lines 931-956)
- [ ] No changes needed if already working

**Frontend - checkout-form.tsx (Initial render):**
- [ ] Set isFetchingRates to true on initial render if shipping is null
  - Add initialization: `const [isFetchingRates, setIsFetchingRates] = useAtom(isFetchingRatesAtom);`
  - Set initial value based on cart.mainShippingAmount being null

**Testing:**
- [ ] Test OrderSummary shows loading state when shipping is null
- [ ] Test SubmitButton is disabled when shipping is calculating
- [ ] Test total displays correctly once shipping is calculated
- [ ] Test no console errors with null shipping amounts

---

### Feature 5: Error Handling for Failed Shipping Calculation

**Backend - cart.route.ts:**
- [ ] In `calculateInitialShipping` mutation, wrap ShipStation call in try/catch
- [ ] Return error state without throwing (allows UI to handle gracefully)
- [ ] Log errors for monitoring

**Frontend - checkout-form.tsx:**
- [ ] Handle error response from calculateInitialShipping mutation
- [ ] Show error message in OrderSummary shipping line area
- [ ] Provide retry mechanism (button to recalculate)
- [ ] Allow user to enter full address to trigger address-based calculation

**Shared - Error state atom:**
- [ ] Consider adding `shippingErrorAtom` to track error state
- [ ] Or reuse existing error handling patterns in the form

**Testing:**
- [ ] Test error display when ShipStation API fails
- [ ] Test retry functionality
- [ ] Test that entering address recovers from error state

---

### Feature 6: Integration & Regression Testing

**End-to-End Tests:**
- [ ] Test complete checkout flow with deferred shipping calculation
- [ ] Test checkout with bump product (requires both shipping calculations)
- [ ] Test checkout without bump product
- [ ] Test checkout with invalid/missing geo data
- [ ] Test address change after initial shipping calculation
- [ ] Test page reload during shipping calculation

**Performance Validation:**
- [ ] Measure TTFP before implementation (baseline)
- [ ] Measure TTFP after implementation (should be <2 seconds)
- [ ] Verify total checkout time is not increased
- [ ] Monitor ShipStation API success rates

**Regression Tests:**
- [ ] Verify existing address change flow still works
- [ ] Verify bump product toggle updates shipping correctly
- [ ] Verify quantity changes trigger shipping recalculation
- [ ] Verify submit button remains disabled until shipping calculated
