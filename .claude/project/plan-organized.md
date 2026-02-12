# Technical Implementation Plan: Deferred Shipping Rate Calculation (Organized by Feature)

## Feature Summary

Defer shipping rate calculation from cart creation to a client-side side effect triggered after checkout page render, reducing Time To First Paint from ~5 seconds to <2 seconds by removing the blocking ShipStation API call from the critical path.

## Architecture Overview

The solution modifies the cart creation flow to skip shipping calculation, then triggers shipping calculation client-side after the checkout form mounts. This leverages existing UI loading states and mutation patterns.

**Components Affected:**

| Layer | Component | Change |
|-------|-----------|--------|
| Backend | `createMainCartFromFunnel()` in cart.fns.ts | Remove shipping calculation |
| Backend | New tRPC mutation | Calculate shipping post-load |
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

---

## Implementation Milestones

The features are organized in dependency order. Each milestone can be completed and tested independently before moving to the next.

### Milestone 0: Performance Baseline (Pre-Implementation)

Capture baseline metrics before making any changes.

- [ ] Measure current TTFP on checkout page using Lighthouse/DevTools
- [ ] Record current cart creation time (can add console.time or trace)
- [ ] Document current checkout completion rate (if available)
- [ ] Screenshot current OrderSummary loading behavior for comparison

---

### Milestone 1: Remove Shipping from Cart Creation

**Goal:** Cart creation completes immediately without waiting for ShipStation API.

**Dependency:** None (this is the foundation)

**Files to Modify:**
- `packages/lib/src/functions/cart.fns.ts`

**Implementation:**

- [ ] In `createMainCartFromFunnel()`, locate the shipping calculation block (lines 334-373)
- [ ] Remove the entire `if (shipTo?.country && shipTo.state && shipTo.city)` block:
  - Remove the first `getProductsShippingRateEstimate()` call for main product
  - Remove the second `getProductsShippingRateEstimate()` call for main + bump
  - Remove assignments to `cart.mainShippingAmount` and `cart.bumpShippingPrice`
- [ ] Verify cart record is created with null shipping amounts (this is the default behavior when not set)
- [ ] Verify no other code paths in `createMainCartFromFunnel()` set shipping amounts

**Testing:**

- [ ] Manually test cart creation - should complete immediately
- [ ] Verify cart record in database has null `mainShippingAmount` and `bumpShippingPrice`
- [ ] Measure cart creation time - should be significantly faster (500-2000ms reduction)
- [ ] Verify checkout page still loads (will have null shipping, handled in Milestone 3)

---

### Milestone 2: Create Initial Shipping Calculation Mutation

**Goal:** New backend endpoint that calculates shipping using geo data from cart.

**Dependency:** Milestone 1 (cart must be created without shipping for this to be needed)

**Files to Modify:**
- `packages/validators/src/schemas/cart.schema.ts`
- `packages/lib/src/trpc/routes/cart.route.ts`

**Implementation - Validator:**

- [ ] Add new schema `calculateInitialShippingSchema` in cart.schema.ts:
  ```typescript
  export const calculateInitialShippingSchema = z.object({
    cartId: z.string(),
    handle: z.string(),
    key: z.string(),
  });
  ```

**Implementation - tRPC Mutation:**

- [ ] Create new public mutation `calculateInitialShipping` in cart.route.ts
- [ ] Add rate limiting using existing pattern (lines 433-437):
  ```typescript
  const rateLimit = ratelimit(30, '1 m');
  const { success } = await rateLimit.limit(input.cartId);
  if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  ```
- [ ] Fetch cart by cartId with handle/key validation
- [ ] Fetch funnel using `getFunnelByParams(handle, key)`
- [ ] Early return if cart has no geo data (shippingAddressCountry is null)
- [ ] Extract shipFrom from `funnel.workspace` shipping address fields
- [ ] Extract shipTo from cart's stored geo fields
- [ ] Call `getProductsShippingRateEstimate()` using Promise.all pattern (copy from lines 482-498)
- [ ] Update cart record with calculated shipping amounts
- [ ] Return success response with amounts

**Implementation - Error Handling:**

- [ ] Wrap ShipStation calls in try/catch
- [ ] Return error flag without throwing (allows UI to handle gracefully)
- [ ] Log errors to console for monitoring

**Testing:**

- [ ] Test mutation with valid geo data returns correct shipping amounts
- [ ] Test mutation with missing geo data returns early (no error, no calculation)
- [ ] Test mutation with invalid cartId returns appropriate error
- [ ] Test rate limiting prevents excessive calls

---

### Milestone 3: Handle Null Shipping State in UI

**Goal:** Checkout form renders correctly with null shipping, showing loading state.

**Dependency:** Milestone 1 (cart now has null shipping on initial load)

**Files to Modify:**
- `apps/cart/src/app/[mode]/[handle]/[key]/checkout/checkout-form.tsx`
- `packages/lib/src/functions/cart.fns.ts` (if `getAmountsForCheckout` needs changes)

**Implementation - OrderSummary:**

- [ ] Verify OrderSummary already handles `isFetchingRates` loading state (lines 1007-1017)
  - Should show pulse animation when true
  - Should show amount when false
- [ ] Check if total calculation handles null shipping:
  - Inspect `getAmountsForCheckout()` function
  - If it crashes on null, add null coalescing: `amounts.checkoutShippingAndHandlingAmount ?? 0`
- [ ] Ensure shipping line doesn't show "0" but shows loading indicator when null

**Implementation - SubmitButton:**

- [ ] Verify SubmitButton is disabled when `isFetchingRates` is true (lines 931-956)
- [ ] No changes expected if already implemented correctly

**Implementation - Initial State:**

- [ ] When checkout form mounts with null shipping, set `isFetchingRates` to true initially
- [ ] Add check in component initialization:
  ```typescript
  useEffect(() => {
    if (cart.mainShippingAmount === null) {
      setIsFetchingRates(true);
    }
  }, []); // Only on mount
  ```

**Testing:**

- [ ] Load checkout page - OrderSummary shows loading indicator for shipping
- [ ] Submit button is disabled while shipping is null
- [ ] No console errors with null shipping amounts
- [ ] Product price and other amounts display correctly

---

### Milestone 4: Client-Side Shipping Trigger

**Goal:** Checkout form automatically triggers shipping calculation on mount.

**Dependency:** Milestone 2 (mutation must exist), Milestone 3 (UI must handle loading state)

**Files to Modify:**
- `apps/cart/src/app/[mode]/[handle]/[key]/checkout/checkout-form.tsx`

**Implementation:**

- [ ] Import the new `calculateInitialShipping` mutation from tRPC client
- [ ] Add useMutation hook:
  ```typescript
  const { mutateAsync: calculateShipping, isPending: isCalculatingShipping } = useMutation(
    trpc.calculateInitialShipping.mutationOptions({
      onMutate: () => setIsFetchingRates(true),
      onSuccess: () => {
        // Invalidate cart query to get updated data
        void utils.byIdAndParams.invalidate({ id: cartId, handle, key: cartKey });
      },
      onSettled: () => setIsFetchingRates(false),
    }),
  );
  ```
- [ ] Add useEffect to trigger on mount:
  ```typescript
  const shippingCalculated = useRef(false);

  useEffect(() => {
    // Only calculate if:
    // 1. We haven't already triggered calculation
    // 2. Shipping is null (not already calculated)
    // 3. We have geo data to use
    if (shippingCalculated.current) return;
    if (cart.mainShippingAmount !== null) return;
    if (!cart.shippingAddressCountry) return;

    shippingCalculated.current = true;
    void calculateShipping({ cartId, handle, key: cartKey });
  }, [cart, cartId, handle, cartKey, calculateShipping]);
  ```
- [ ] Ensure query invalidation refreshes the cart data after mutation

**Testing:**

- [ ] Load checkout page - shipping calculation triggers automatically
- [ ] Loading indicator shows during calculation
- [ ] Shipping amount appears after calculation completes
- [ ] Submit button becomes enabled
- [ ] Calculation only triggers once (reload should use cached result or recalculate)

---

### Milestone 5: Error Handling

**Goal:** Graceful handling when shipping calculation fails.

**Dependency:** Milestone 4 (shipping trigger must be in place)

**Files to Modify:**
- `apps/cart/src/app/[mode]/[handle]/[key]/checkout/checkout-form.tsx`

**Implementation - Error State:**

- [ ] Add error state atom or local state:
  ```typescript
  const [shippingError, setShippingError] = useState<string | null>(null);
  ```
- [ ] Update mutation to handle errors:
  ```typescript
  onError: (error) => {
    setShippingError('Unable to calculate shipping. Please enter your address.');
    setIsFetchingRates(false);
  },
  ```

**Implementation - Error Display:**

- [ ] In OrderSummary, show error message instead of loading when error exists:
  ```typescript
  {shippingError ? (
    <Text variant='sm/normal' className='text-red-500'>{shippingError}</Text>
  ) : isFetchingRates ? (
    <div className='h-4 w-10 animate-pulse rounded bg-brandKit-block-text' />
  ) : (
    <Text variant='md/medium'>{formatMinorToMajorCurrency(...)}</Text>
  )}
  ```

**Implementation - Recovery:**

- [ ] Allow address entry to clear error and trigger address-based calculation
- [ ] When user enters address via Stripe element, clear shippingError state
- [ ] Existing `updateShippingAddressFromCheckout` flow handles recalculation

**Testing:**

- [ ] Simulate ShipStation failure - error message appears
- [ ] User can enter address to recover
- [ ] After address entry, shipping calculates successfully
- [ ] No stuck states

---

### Milestone 6: Integration & Regression Testing

**Goal:** Verify full checkout flow works correctly with all changes.

**Dependency:** All previous milestones

**End-to-End Tests:**

- [ ] Complete checkout flow: landing → checkout → payment → confirmation
- [ ] Checkout with bump product (both shipping calculations)
- [ ] Checkout without bump product
- [ ] Checkout with invalid/missing geo data (should prompt for address)
- [ ] Address change after initial shipping calculation
- [ ] Page reload during shipping calculation

**Performance Validation:**

- [ ] Measure TTFP after all changes (target: <2 seconds)
- [ ] Compare to baseline from Milestone 0
- [ ] Verify total checkout time is not increased (may be slightly different due to parallel vs serial)
- [ ] Test on mobile device/throttled connection

**Regression Tests:**

- [ ] Existing address change flow still works (Stripe AddressElement → updateShippingAddressFromCheckout)
- [ ] Bump product toggle updates shipping correctly
- [ ] Quantity changes trigger shipping recalculation (if applicable)
- [ ] Submit button remains disabled until shipping is calculated
- [ ] Multiple checkouts don't interfere with each other

---

## Implementation Order Summary

| Milestone | Description | Can Start After |
|-----------|-------------|-----------------|
| **M0** | Performance Baseline | Immediately |
| **M1** | Remove Shipping from Cart Creation | M0 |
| **M2** | Create Shipping Calculation Mutation | M1 |
| **M3** | Handle Null Shipping in UI | M1 |
| **M4** | Client-Side Shipping Trigger | M2, M3 |
| **M5** | Error Handling | M4 |
| **M6** | Integration Testing | M5 |

**Parallel Work Opportunities:**
- M2 and M3 can be done in parallel after M1
- M0 can be done immediately (before any code changes)

---

## File Reference

| File | Milestone | Changes |
|------|-----------|---------|
| `packages/lib/src/functions/cart.fns.ts` | M1 | Remove shipping calculation block |
| `packages/validators/src/schemas/cart.schema.ts` | M2 | Add new schema |
| `packages/lib/src/trpc/routes/cart.route.ts` | M2 | Add new mutation |
| `apps/cart/src/app/[mode]/[handle]/[key]/checkout/checkout-form.tsx` | M3, M4, M5 | Handle null state, trigger calculation, error handling |
