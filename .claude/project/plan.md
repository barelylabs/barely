# Technical Implementation Plan: Barely Fulfillment Partner

## Feature Summary

Implement a fulfillment partner system that allows eligible workspaces to route orders to Barely for fulfillment based on customer shipping destination. The system will dynamically select shipping origin (artist's address vs Barely's Brooklyn address) at checkout, tag orders with fulfillment responsibility, capture fulfillment fees, and provide filtering in the orders UI.

---

## Architecture Overview

### Components Affected

| Layer | Component | Changes |
|-------|-----------|---------|
| **Database** | `packages/db/src/sql/workspace.sql.ts` | Add fulfillment eligibility, mode, and fee fields |
| **Database** | `packages/db/src/sql/cart.sql.ts` | Add `fulfilledBy` and `barelyFulfillmentFee` fields |
| **Shared Logic** | `packages/lib/src/functions/cart.fns.ts` | Add fulfillment determination logic to checkout |
| **Shared Logic** | `packages/lib/src/integrations/shipping/shipengine.endpts.ts` | Support dynamic shipping origin |
| **Shared Logic** | `packages/lib/src/utils/cart.ts` | Add fulfillment fee calculation |
| **API** | `packages/lib/src/trpc/routes/workspace.route.ts` | Add fulfillment mode update mutation |
| **Frontend** | `apps/app/src/app/[handle]/settings/fulfillment/` | New fulfillment settings page |
| **Frontend** | `apps/app/src/app/[handle]/orders/` | Add fulfillment filter to orders list |
| **Config** | Environment variables | Add Barely fulfillment address |

### Data Flow

```
1. Checkout Request (cart/create)
   ↓
2. Determine Fulfillment Responsibility
   - Check workspace.barelyFulfillmentMode
   - Check customer shipTo.country
   - Assign: 'barely' | 'artist'
   ↓
3. Select Shipping Origin
   - If 'barely' → use Barely Brooklyn address (env vars)
   - If 'artist' → use workspace.shippingAddress* (existing)
   ↓
4. Calculate Shipping (ShipStation API)
   - Route to US API if shipping from Brooklyn
   - Route to UK API if shipping from UK
   ↓
5. Calculate Fulfillment Fee (if 'barely')
   - flatFee + (productAmount × percentageFee)
   ↓
6. Create Cart Record
   - Store fulfilledBy, barelyFulfillmentFee
   - Include in Stripe application fee
   ↓
7. Order Management
   - Filter by fulfilledBy in orders UI
   - Display fulfillment assignment on order detail
```

---

## Key Technical Decisions

### 1. Fulfillment Determination at Checkout (not post-purchase)

**Decision:** Determine `fulfilledBy` at cart creation based on customer's shipping address.

**Rationale:**
- Shipping rates must be calculated from the correct origin before payment
- Customer sees accurate shipping cost at checkout
- Assignment is immutable once order is created (prevents confusion)

**Trade-off:** If customer changes address post-purchase, fulfillment assignment doesn't change. This is acceptable for MVP (handled operationally).

---

### 2. Environment Variables for Barely Address (not database)

**Decision:** Store Barely's fulfillment address in environment variables, not in the database.

**Rationale:**
- Single fulfillment location for MVP (no need for dynamic lookup)
- Keeps sensitive address out of public codebase
- Easy to change without database migration
- Aligns with existing pattern for API keys

**Variables:**
```
BARELY_FULFILLMENT_ADDRESS_LINE1
BARELY_FULFILLMENT_ADDRESS_CITY
BARELY_FULFILLMENT_ADDRESS_STATE
BARELY_FULFILLMENT_ADDRESS_ZIP
BARELY_FULFILLMENT_ADDRESS_COUNTRY
```

---

### 3. Fee Fields on Workspace (not separate pricing table)

**Decision:** Add `barelyFulfillmentFlatFeePerOrder` and `barelyFulfillmentPercentageFeePerOrder` directly to workspace table.

**Rationale:**
- Simple 1:1 relationship (one fee structure per workspace)
- Aligns with existing `cartFeePercentageOverride` pattern
- Backend-configurable (not exposed in artist UI)
- Easy to audit and adjust per client

**Trade-off:** Less flexible than a separate pricing table, but sufficient for MVP.

---

### 4. Fulfillment Mode as Enum (not boolean)

**Decision:** Use `barelyFulfillmentMode` enum with three values instead of separate boolean flags.

**Values:**
- `artist_all` - Artist fulfills all orders (default, current behavior)
- `barely_us` - Barely fulfills US orders, artist fulfills rest
- `barely_worldwide` - Barely fulfills all orders

**Rationale:**
- Clear, mutually exclusive states
- Easy to extend with new modes later (e.g., `barely_eu`)
- Single field to check in fulfillment logic
- Matches UX design (radio button selection)

---

### 5. Fulfillment Fee Included in Application Fee

**Decision:** Add `barelyFulfillmentFee` to Stripe's `application_fee_amount` at payment intent creation.

**Rationale:**
- Automatic collection at point of sale
- No need for separate invoicing or reconciliation
- Aligns with existing fee collection pattern
- Artist sees net payout after all fees

**Implementation:**
```typescript
application_fee_amount = barelyCartFee + vatAmount + shippingAmount + barelyFulfillmentFee
```

---

### 6. Filter Orders by `fulfilledBy` Field (not separate table)

**Decision:** Add `fulfilledBy` as a simple enum field on carts table, filter via WHERE clause.

**Rationale:**
- Most orders have single fulfillment responsibility
- Simple query: `WHERE fulfilledBy = 'barely'`
- No join overhead
- Sufficient for MVP scale

**Trade-off:** Doesn't support split shipments within single order (out of scope for MVP).

---

## Dependencies & Assumptions

### Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| ShipStation US API | External | Exists | `SHIPSTATION_API_KEY_US` already configured |
| ShipStation UK API | External | Exists | `SHIPSTATION_API_KEY_UK` already configured |
| Drizzle ORM | Internal | Exists | Used for all schema definitions |
| tRPC | Internal | Exists | Used for all API mutations |
| Stripe Connect | External | Exists | Application fee mechanism in place |
| Workspace settings pattern | Internal | Exists | `/settings/payouts/` as reference |

### Assumptions

1. **Single Barely Location:** Brooklyn is the only Barely fulfillment location for MVP
2. **US = Barely Territory:** US country code (`US`) determines Barely fulfillment eligibility
3. **No Split Shipments:** Each order has single fulfillment responsibility
4. **Backend-Controlled Eligibility:** `barelyFulfillmentEligible` is set via database, not UI
5. **Existing User Access:** Barely team accesses workspaces via standard user invitation
6. **No Address Changes Post-Order:** Customer cannot change shipping address after checkout (or requires manual review)

---

## Implementation Checklist

### Feature 1: Workspace Fulfillment Configuration

This feature adds the data model and API for configuring Barely fulfillment on a workspace.

#### Database Schema

- [ ] Add `barelyFulfillmentEligible` boolean field to `Workspaces` table in `packages/db/src/sql/workspace.sql.ts`
  - Default: `false`
  - Not nullable

- [ ] Add `barelyFulfillmentMode` enum field to `Workspaces` table
  - Values: `'artist_all' | 'barely_us' | 'barely_worldwide'`
  - Default: `'artist_all'`
  - Not nullable

- [ ] Add `barelyFulfillmentFlatFeePerOrder` integer field to `Workspaces` table
  - Stored in cents (e.g., 100 = $1.00)
  - Nullable (null = no fee configured)

- [ ] Add `barelyFulfillmentPercentageFeePerOrder` integer field to `Workspaces` table
  - Stored as percentage × 100 (e.g., 500 = 5%)
  - Nullable (null = no fee configured)

- [ ] Generate and run database migration for workspace schema changes

#### Validation Schema

- [ ] Add `barelyFulfillmentMode` to workspace update schema in `packages/validators/src/`
  - Only allow update if `barelyFulfillmentEligible` is true
  - Validate enum values

#### API (tRPC)

- [ ] Add `barelyFulfillmentMode` to allowed update fields in `packages/lib/src/trpc/routes/workspace.route.ts`
  - Validate eligibility before allowing mode change
  - Return error if not eligible

- [ ] Create query to get fulfillment settings for workspace
  - Return: `eligible`, `mode`, `flatFee`, `percentageFee`

#### Frontend (Settings Page)

- [ ] Create new directory: `apps/app/src/app/[handle]/settings/fulfillment/`

- [ ] Create `page.tsx` with fulfillment settings form
  - Conditionally render based on `barelyFulfillmentEligible`
  - If not eligible: show "Contact us to enable Barely fulfillment"
  - If eligible: show radio button selection for mode

- [ ] Implement radio button group for fulfillment mode
  - Option 1: "I fulfill all orders" (`artist_all`)
  - Option 2: "Barely fulfills US orders, I fulfill the rest" (`barely_us`)
  - Option 3: "Barely fulfills all orders" (`barely_worldwide`)

- [ ] Display current fee structure (read-only)
  - Format: "$X.XX + Y% per Barely-fulfilled order"
  - Only show when eligible

- [ ] Add "Fulfillment" link to settings navigation sidebar
  - Only show when `barelyFulfillmentEligible` is true

- [ ] Use existing `SettingsCardForm` component pattern from payouts page

#### Testing

- [ ] Unit test: Workspace schema accepts new fields with correct defaults
- [ ] Unit test: Mode update validation rejects invalid values
- [ ] Unit test: Mode update fails when not eligible
- [ ] Integration test: Settings page renders correctly for eligible workspace
- [ ] Integration test: Settings page shows contact message for ineligible workspace
- [ ] Integration test: Mode change persists and takes effect

---

### Feature 2: Dynamic Shipping Calculation

This feature modifies checkout to calculate shipping from the correct origin based on fulfillment assignment.

#### Environment Variables

- [ ] Add environment variables to `.env.example`:
  ```
  BARELY_FULFILLMENT_ADDRESS_LINE1=
  BARELY_FULFILLMENT_ADDRESS_CITY=
  BARELY_FULFILLMENT_ADDRESS_STATE=
  BARELY_FULFILLMENT_ADDRESS_ZIP=
  BARELY_FULFILLMENT_ADDRESS_COUNTRY=
  ```

- [ ] Add environment variables to production environment
  - Values: `763 Park Pl #1R`, `Brooklyn`, `NY`, `11216`, `US`

- [ ] Create type-safe env access in `packages/lib/src/env.ts` or similar
  - Validate all address fields are present when accessed

#### Fulfillment Determination Logic

- [ ] Create utility function `determineFulfillmentResponsibility()` in `packages/lib/src/utils/fulfillment.ts`
  ```typescript
  function determineFulfillmentResponsibility(params: {
    workspaceMode: 'artist_all' | 'barely_us' | 'barely_worldwide';
    shipToCountry: string;
  }): 'artist' | 'barely'
  ```
  - If mode is `artist_all` → return `'artist'`
  - If mode is `barely_worldwide` → return `'barely'`
  - If mode is `barely_us` AND country is `US` → return `'barely'`
  - If mode is `barely_us` AND country is not `US` → return `'artist'`

- [ ] Create utility function `getShippingOriginAddress()` in `packages/lib/src/utils/fulfillment.ts`
  ```typescript
  function getShippingOriginAddress(params: {
    fulfilledBy: 'artist' | 'barely';
    workspace: Workspace;
  }): ShippingAddress
  ```
  - If `fulfilledBy === 'barely'` → return Barely address from env vars
  - If `fulfilledBy === 'artist'` → return `workspace.shippingAddress*`

#### Shipping Calculation Modification

- [ ] Modify `getProductsShippingRateEstimate()` in `packages/lib/src/functions/cart.fns.ts`
  - Accept new parameter: `shipFromOverride?: ShippingAddress`
  - If provided, use override instead of workspace address
  - Pass to ShipStation API call

- [ ] Modify `getShipStationRateEstimates()` in `packages/lib/src/integrations/shipping/shipengine.endpts.ts`
  - Accept `shipFrom` address as parameter (not hardcoded to workspace)
  - Select US or UK API key based on `shipFrom.country`

- [ ] Update cart creation flow in `createMainCartFromFunnel()`
  1. Before calculating shipping, determine fulfillment responsibility
  2. Get appropriate shipping origin address
  3. Pass origin to shipping rate estimate function

#### Testing

- [ ] Unit test: `determineFulfillmentResponsibility()` returns correct value for all mode/country combinations
- [ ] Unit test: `getShippingOriginAddress()` returns Barely address when `fulfilledBy === 'barely'`
- [ ] Unit test: `getShippingOriginAddress()` returns workspace address when `fulfilledBy === 'artist'`
- [ ] Integration test: US customer gets Brooklyn shipping rates when mode is `barely_us`
- [ ] Integration test: UK customer gets artist shipping rates when mode is `barely_us`
- [ ] Integration test: All customers get Brooklyn shipping rates when mode is `barely_worldwide`

---

### Feature 3: Order Fulfillment Assignment & Fee Capture

This feature tags orders with fulfillment responsibility and calculates/captures fulfillment fees.

#### Database Schema

- [ ] Add `fulfilledBy` enum field to `Carts` table in `packages/db/src/sql/cart.sql.ts`
  - Values: `'artist' | 'barely'`
  - Default: `'artist'`
  - Not nullable

- [ ] Add `barelyFulfillmentFee` integer field to `Carts` table
  - Stored in cents
  - Default: `0`
  - Not nullable

- [ ] Generate and run database migration for cart schema changes

#### Fee Calculation

- [ ] Create utility function `calculateBarelyFulfillmentFee()` in `packages/lib/src/utils/cart.ts`
  ```typescript
  function calculateBarelyFulfillmentFee(params: {
    fulfilledBy: 'artist' | 'barely';
    productAmountInCents: number;
    flatFeeInCents: number | null;
    percentageFee: number | null; // 500 = 5%
  }): number
  ```
  - If `fulfilledBy === 'artist'` → return `0`
  - If fees not configured → return `0`
  - Calculate: `flatFee + Math.round(productAmount * (percentage / 10000))`

- [ ] Modify `getFeeAmountForCheckout()` in `packages/lib/src/utils/cart.ts`
  - Accept new parameter: `barelyFulfillmentFee: number`
  - Add to application fee amount:
    ```typescript
    return barelyCartFee + vatAmount + shippingAmount + barelyFulfillmentFee
    ```

#### Cart Creation Flow

- [ ] Modify `createMainCartFromFunnel()` in `packages/lib/src/functions/cart.fns.ts`
  1. After determining fulfillment responsibility, calculate fulfillment fee
  2. Pass fulfillment fee to `getFeeAmountForCheckout()`
  3. Store `fulfilledBy` and `barelyFulfillmentFee` in cart insert

- [ ] Ensure `fulfilledBy` and `barelyFulfillmentFee` are immutable after cart creation
  - Do not include in any cart update mutations

#### Testing

- [ ] Unit test: `calculateBarelyFulfillmentFee()` returns 0 for artist fulfillment
- [ ] Unit test: `calculateBarelyFulfillmentFee()` calculates correctly for Barely fulfillment
- [ ] Unit test: `calculateBarelyFulfillmentFee()` handles null fee configuration
- [ ] Integration test: Cart created with correct `fulfilledBy` value
- [ ] Integration test: Cart created with correct `barelyFulfillmentFee` value
- [ ] Integration test: Stripe application fee includes fulfillment fee
- [ ] Integration test: Fulfillment fields are not modified by cart updates

---

### Feature 4: Order Filtering UI

This feature adds fulfillment filtering to the orders view in the app dashboard.

#### API (tRPC)

- [ ] Modify orders list query in `packages/lib/src/trpc/routes/cart.route.ts`
  - Add optional filter parameter: `fulfilledBy?: 'artist' | 'barely' | 'all'`
  - Apply WHERE clause when filter is specified
  - Default to `'all'` (no filter)

- [ ] Ensure `fulfilledBy` field is included in order list response

#### Frontend (Orders Page)

- [ ] Locate orders list component in `apps/app/src/app/[handle]/orders/`

- [ ] Add fulfillment filter dropdown above orders list
  - Options: "All Orders", "My Fulfillment", "Barely Fulfillment"
  - Default: "All Orders"
  - Use existing dropdown/select component pattern

- [ ] Wire filter to API query parameter
  - Update query when filter changes
  - Persist filter state in URL query param (optional)

- [ ] Conditionally show filter only when workspace has Barely fulfillment enabled
  - Check `barelyFulfillmentMode !== 'artist_all'`

#### Frontend (Order Detail)

- [ ] Locate order detail component in `apps/app/src/app/[handle]/orders/[orderId]/`

- [ ] Add fulfillment information section to order detail
  - Display: "Fulfillment: You" or "Fulfillment: Barely"
  - If Barely: Display "Fulfillment Fee: $X.XX"

- [ ] Use existing order detail layout pattern

#### Testing

- [ ] Unit test: Orders query filters correctly by `fulfilledBy`
- [ ] Integration test: Filter dropdown updates displayed orders
- [ ] Integration test: Order detail shows correct fulfillment assignment
- [ ] Integration test: Filter only appears for eligible workspaces
- [ ] E2E test: User can filter orders and see correct results

---

### Feature 5: Security & Validation

This feature ensures proper access control and data validation.

#### Access Control

- [ ] Verify `barelyFulfillmentEligible` can only be set via direct database access
  - Do not expose in any tRPC mutation
  - Do not include in workspace update schema

- [ ] Verify `barelyFulfillmentFlatFeePerOrder` and `barelyFulfillmentPercentageFeePerOrder` can only be set via direct database access
  - Do not expose in any tRPC mutation

- [ ] Verify fulfillment mode update requires workspace write permission
  - Use existing workspace authorization pattern

#### Input Validation

- [ ] Validate `barelyFulfillmentMode` enum values in update mutation
  - Reject invalid values with clear error message

- [ ] Validate eligibility before allowing mode change
  - Return error: "Barely fulfillment is not enabled for this workspace"

- [ ] Validate customer shipping address country before determining fulfillment
  - Handle missing country gracefully (default to artist fulfillment)

#### Data Integrity

- [ ] Ensure `fulfilledBy` is set at cart creation, not updatable after
  - Remove from any cart update mutations if present

- [ ] Ensure `barelyFulfillmentFee` matches calculation at time of order
  - Store calculated value, not reference to fee config
  - Handles fee config changes without affecting historical orders

#### Testing

- [ ] Security test: Cannot set eligibility via API
- [ ] Security test: Cannot set fee config via API
- [ ] Validation test: Invalid mode values rejected
- [ ] Validation test: Mode change blocked when not eligible
- [ ] Data integrity test: Fulfillment fields immutable after creation

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `packages/db/src/sql/workspace.sql.ts` | Modify | Add fulfillment fields to workspace |
| `packages/db/src/sql/cart.sql.ts` | Modify | Add fulfillment fields to cart |
| `packages/validators/src/schemas/` | Modify | Add fulfillment mode to update schema |
| `packages/lib/src/utils/fulfillment.ts` | Create | Fulfillment determination and address logic |
| `packages/lib/src/utils/cart.ts` | Modify | Add fulfillment fee calculation |
| `packages/lib/src/functions/cart.fns.ts` | Modify | Integrate fulfillment into checkout flow |
| `packages/lib/src/integrations/shipping/shipengine.endpts.ts` | Modify | Support dynamic shipping origin |
| `packages/lib/src/trpc/routes/workspace.route.ts` | Modify | Add fulfillment mode update |
| `packages/lib/src/trpc/routes/cart.route.ts` | Modify | Add fulfillment filter to orders query |
| `packages/lib/src/env.ts` | Modify | Add Barely address env vars |
| `apps/app/src/app/[handle]/settings/fulfillment/page.tsx` | Create | Fulfillment settings UI |
| `apps/app/src/app/[handle]/orders/` | Modify | Add fulfillment filter |
| `apps/app/src/app/[handle]/orders/[orderId]/` | Modify | Show fulfillment on order detail |
| `.env.example` | Modify | Document new env vars |

---

## Related Documents

- [[feature|Feature: Barely Fulfillment Partner]]
- [[JTBD|Jobs to be Done: Barely Fulfillment Partner]]
- [[PRD|Product Requirements Document: Barely Fulfillment Partner]]
