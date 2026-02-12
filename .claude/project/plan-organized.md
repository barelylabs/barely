# Technical Implementation Plan: Barely Fulfillment Partner (Organized)

This document reorganizes the implementation checklist by end-to-end features, with clear dependencies and implementation milestones. Each milestone can be implemented, tested, and deployed independently.

---

## Implementation Order & Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│  Milestone 1: Foundation & Data Model                               │
│  (Schema, env vars, utilities - no user-facing changes)             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Milestone 2: Checkout Integration                                  │
│  (Dynamic shipping, order assignment, fee capture)                  │
│  User Stories: US-2, US-4, US-5                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│  Milestone 3: Artist Settings │   │  Milestone 4: Order Filtering │
│  (Configuration UI)           │   │  (Orders UI)                  │
│  User Story: US-1             │   │  User Stories: US-3, US-6     │
└───────────────────────────────┘   └───────────────────────────────┘
```

**Note:** Milestones 3 and 4 can be implemented in parallel after Milestone 2.

---

## Milestone 1: Foundation & Data Model

**Goal:** Establish the data model and utilities required by all other features. No user-facing changes.

**Jobs Addressed:** Foundation for all jobs - no direct user impact yet.

### 1.1 Environment Configuration

- [ ] Add environment variables to `.env.example`:
  ```
  BARELY_FULFILLMENT_ADDRESS_LINE1=
  BARELY_FULFILLMENT_ADDRESS_CITY=
  BARELY_FULFILLMENT_ADDRESS_STATE=
  BARELY_FULFILLMENT_ADDRESS_ZIP=
  BARELY_FULFILLMENT_ADDRESS_COUNTRY=
  ```

- [ ] Add environment variables to production/staging environments
  - Values: `763 Park Pl #1R`, `Brooklyn`, `NY`, `11216`, `US`

- [ ] Create type-safe env access in `packages/lib/src/env.ts` or similar
  - Validate all address fields are present when accessed
  - Export `getBarelyFulfillmentAddress()` function

### 1.2 Workspace Schema Changes

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

### 1.3 Cart (Order) Schema Changes

- [ ] Add `fulfilledBy` enum field to `Carts` table in `packages/db/src/sql/cart.sql.ts`
  - Values: `'artist' | 'barely'`
  - Default: `'artist'`
  - Not nullable

- [ ] Add `barelyFulfillmentFee` integer field to `Carts` table
  - Stored in cents
  - Default: `0`
  - Not nullable

### 1.4 Database Migration

- [ ] Generate database migration for workspace schema changes
- [ ] Generate database migration for cart schema changes
- [ ] Run migrations in development environment
- [ ] Verify existing data is unaffected (defaults applied correctly)

### 1.5 Core Utility Functions

- [ ] Create new file `packages/lib/src/utils/fulfillment.ts`

- [ ] Implement `determineFulfillmentResponsibility()`:
  ```typescript
  export function determineFulfillmentResponsibility(params: {
    workspaceMode: 'artist_all' | 'barely_us' | 'barely_worldwide';
    shipToCountry: string;
  }): 'artist' | 'barely'
  ```
  - If mode is `artist_all` → return `'artist'`
  - If mode is `barely_worldwide` → return `'barely'`
  - If mode is `barely_us` AND country is `US` → return `'barely'`
  - If mode is `barely_us` AND country is not `US` → return `'artist'`

- [ ] Implement `getShippingOriginAddress()`:
  ```typescript
  export function getShippingOriginAddress(params: {
    fulfilledBy: 'artist' | 'barely';
    workspace: Workspace;
  }): ShippingAddress
  ```
  - If `fulfilledBy === 'barely'` → return Barely address from env vars
  - If `fulfilledBy === 'artist'` → return `workspace.shippingAddress*`

- [ ] Implement `calculateBarelyFulfillmentFee()` in `packages/lib/src/utils/cart.ts`:
  ```typescript
  export function calculateBarelyFulfillmentFee(params: {
    fulfilledBy: 'artist' | 'barely';
    productAmountInCents: number;
    flatFeeInCents: number | null;
    percentageFee: number | null; // 500 = 5%
  }): number
  ```
  - If `fulfilledBy === 'artist'` → return `0`
  - If fees not configured → return `0`
  - Calculate: `flatFee + Math.round(productAmount * (percentage / 10000))`

### 1.6 Milestone 1 Testing

- [ ] Unit test: Workspace schema accepts new fields with correct defaults
- [ ] Unit test: Cart schema accepts new fields with correct defaults
- [ ] Unit test: `determineFulfillmentResponsibility()` returns correct value for all mode/country combinations:
  - `artist_all` + any country → `artist`
  - `barely_worldwide` + any country → `barely`
  - `barely_us` + `US` → `barely`
  - `barely_us` + `GB` → `artist`
  - `barely_us` + empty/null → `artist`
- [ ] Unit test: `getShippingOriginAddress()` returns Barely address when `fulfilledBy === 'barely'`
- [ ] Unit test: `getShippingOriginAddress()` returns workspace address when `fulfilledBy === 'artist'`
- [ ] Unit test: `calculateBarelyFulfillmentFee()` returns 0 for artist fulfillment
- [ ] Unit test: `calculateBarelyFulfillmentFee()` calculates correctly for Barely fulfillment
- [ ] Unit test: `calculateBarelyFulfillmentFee()` handles null fee configuration

### 1.7 Milestone 1 Security

- [ ] Verify `barelyFulfillmentEligible` is NOT in any tRPC mutation input schema
- [ ] Verify `barelyFulfillmentFlatFeePerOrder` is NOT in any tRPC mutation input schema
- [ ] Verify `barelyFulfillmentPercentageFeePerOrder` is NOT in any tRPC mutation input schema

---

## Milestone 2: Checkout Integration

**Goal:** Integrate fulfillment logic into the checkout flow. When enabled, orders will be routed correctly and fees captured.

**Jobs Addressed:**
- Job 1: Sell physical products to international customers profitably
- Job 2: Manage a single, unified store for all markets

**User Stories:**
- US-2: See Competitive US Shipping (Customer)
- US-4: Automatic Fulfillment Assignment (System)
- US-5: Capture Fulfillment Fees (System)

**Prerequisite:** Milestone 1 complete

### 2.1 Shipping Calculation Modification

- [ ] Modify `getShipStationRateEstimates()` in `packages/lib/src/integrations/shipping/shipengine.endpts.ts`
  - Accept `shipFrom` address as parameter (not hardcoded to workspace)
  - Select US or UK API key based on `shipFrom.country`
  - Maintain backward compatibility with existing callers

- [ ] Modify `getProductsShippingRateEstimate()` in `packages/lib/src/functions/cart.fns.ts`
  - Accept new parameter: `shipFromOverride?: ShippingAddress`
  - If provided, use override instead of workspace address
  - Pass to ShipStation API call

### 2.2 Cart Creation Flow Integration

- [ ] Modify `createMainCartFromFunnel()` in `packages/lib/src/functions/cart.fns.ts`:

  **Step 1: Determine fulfillment responsibility (before shipping calculation)**
  ```typescript
  const fulfilledBy = determineFulfillmentResponsibility({
    workspaceMode: workspace.barelyFulfillmentMode,
    shipToCountry: shipTo?.country ?? '',
  });
  ```

  **Step 2: Get appropriate shipping origin**
  ```typescript
  const shippingOrigin = getShippingOriginAddress({
    fulfilledBy,
    workspace,
  });
  ```

  **Step 3: Calculate shipping with correct origin**
  - Pass `shippingOrigin` to `getProductsShippingRateEstimate()`

  **Step 4: Calculate fulfillment fee**
  ```typescript
  const barelyFulfillmentFee = calculateBarelyFulfillmentFee({
    fulfilledBy,
    productAmountInCents: mainProductAmount,
    flatFeeInCents: workspace.barelyFulfillmentFlatFeePerOrder,
    percentageFee: workspace.barelyFulfillmentPercentageFeePerOrder,
  });
  ```

  **Step 5: Include in application fee**
  - Add `barelyFulfillmentFee` parameter to `getFeeAmountForCheckout()` call

  **Step 6: Store in cart record**
  - Include `fulfilledBy` and `barelyFulfillmentFee` in cart insert

### 2.3 Fee Calculation Integration

- [ ] Modify `getFeeAmountForCheckout()` in `packages/lib/src/utils/cart.ts`
  - Accept new parameter: `barelyFulfillmentFee: number`
  - Add to application fee amount:
    ```typescript
    return barelyCartFee + vatAmount + shippingAmount + barelyFulfillmentFee
    ```

### 2.4 Data Immutability

- [ ] Ensure `fulfilledBy` is NOT included in any cart update mutations
- [ ] Ensure `barelyFulfillmentFee` is NOT included in any cart update mutations
- [ ] Verify cart update schema in `packages/validators/src/` excludes these fields

### 2.5 Milestone 2 Testing

- [ ] Integration test: US customer gets Brooklyn shipping rates when mode is `barely_us`
- [ ] Integration test: UK customer gets artist shipping rates when mode is `barely_us`
- [ ] Integration test: All customers get Brooklyn shipping rates when mode is `barely_worldwide`
- [ ] Integration test: All customers get artist shipping rates when mode is `artist_all`
- [ ] Integration test: Cart created with correct `fulfilledBy` value
- [ ] Integration test: Cart created with correct `barelyFulfillmentFee` value
- [ ] Integration test: Stripe application fee includes fulfillment fee
- [ ] Integration test: Fulfillment fields are not modified by cart updates
- [ ] Integration test: Missing country defaults to artist fulfillment

### 2.6 Manual Verification

- [ ] Enable eligibility for test workspace via direct database update
- [ ] Set fulfillment mode to `barely_us` via direct database update
- [ ] Create test order with US shipping address → verify Barely fulfillment
- [ ] Create test order with UK shipping address → verify artist fulfillment
- [ ] Verify shipping rates differ appropriately

---

## Milestone 3: Artist Fulfillment Settings

**Goal:** Allow eligible artists to configure their fulfillment mode via the app settings.

**Jobs Addressed:**
- Job 5: Understand the costs of fulfillment partnership upfront
- Job 6: Get started with fulfillment partnership quickly

**User Story:**
- US-1: Enable Fulfillment Mode (Artist)

**Prerequisite:** Milestone 1 complete (Milestone 2 recommended but not required)

### 3.1 Validation Schema

- [ ] Add `barelyFulfillmentMode` to workspace update schema in `packages/validators/src/`
  - Type: `z.enum(['artist_all', 'barely_us', 'barely_worldwide'])`
  - Optional field (only included when updating)

### 3.2 API (tRPC) Updates

- [ ] Modify workspace update mutation in `packages/lib/src/trpc/routes/workspace.route.ts`
  - Add `barelyFulfillmentMode` to allowed update fields
  - Add validation: reject mode change if `barelyFulfillmentEligible !== true`
  - Return clear error: "Barely fulfillment is not enabled for this workspace"

- [ ] Create query to get fulfillment settings for workspace (or extend existing workspace query)
  - Return: `barelyFulfillmentEligible`, `barelyFulfillmentMode`, `barelyFulfillmentFlatFeePerOrder`, `barelyFulfillmentPercentageFeePerOrder`

### 3.3 Frontend Settings Page

- [ ] Create new directory: `apps/app/src/app/[handle]/settings/fulfillment/`

- [ ] Create `page.tsx` with fulfillment settings form
  - Use existing `SettingsCardForm` component pattern from payouts page
  - Fetch workspace fulfillment settings on load

- [ ] Implement conditional rendering based on eligibility:
  - If `barelyFulfillmentEligible === false`:
    ```
    Fulfillment Partnership
    -----------------------
    Barely fulfillment is not currently enabled for your workspace.

    Interested in having Barely handle fulfillment for your orders?
    Contact us at support@barely.io to learn more.
    ```
  - If `barelyFulfillmentEligible === true`: show configuration form

- [ ] Implement radio button group for fulfillment mode selection:
  - Option 1: "I fulfill all orders" (`artist_all`) - default
    - Description: "You handle shipping for all orders worldwide."
  - Option 2: "Barely fulfills US orders, I fulfill the rest" (`barely_us`)
    - Description: "Orders shipping to US addresses are fulfilled by Barely. You handle all other orders."
  - Option 3: "Barely fulfills all orders" (`barely_worldwide`)
    - Description: "Barely handles shipping for all orders worldwide."

- [ ] Display current fee structure (read-only):
  - Format: "Fulfillment fees: $X.XX + Y% per Barely-fulfilled order"
  - Only show when eligible
  - Show "No fees configured" if null

- [ ] Implement save functionality:
  - Call workspace update mutation with new mode
  - Show success/error toast
  - Setting takes effect immediately (no page reload required)

### 3.4 Settings Navigation

- [ ] Add "Fulfillment" link to settings navigation sidebar in `apps/app/src/app/[handle]/settings/`
  - Conditionally show only when `barelyFulfillmentEligible === true`
  - Position after "Payouts" in navigation order

### 3.5 Milestone 3 Testing

- [ ] Unit test: Validation schema accepts valid mode values
- [ ] Unit test: Validation schema rejects invalid mode values
- [ ] Unit test: Mode update mutation fails when not eligible
- [ ] Unit test: Mode update mutation succeeds when eligible
- [ ] Integration test: Settings page renders "contact us" for ineligible workspace
- [ ] Integration test: Settings page renders configuration form for eligible workspace
- [ ] Integration test: Mode change persists after save
- [ ] Integration test: Navigation link only appears for eligible workspaces

### 3.6 Milestone 3 Security

- [ ] Verify fulfillment mode update requires workspace write permission
- [ ] Verify eligibility check happens server-side (not just UI)

---

## Milestone 4: Order Management & Filtering

**Goal:** Allow artists to filter orders by fulfillment responsibility and see fulfillment details.

**Jobs Addressed:**
- Job 3: Know which orders I need to fulfill vs. which are handled for me

**User Stories:**
- US-3: Filter Orders by Fulfillment Responsibility (Artist)
- US-6: Access Fulfillment-Enabled Workspaces (Barely Team)

**Prerequisite:** Milestone 1 and 2 complete

### 4.1 API (tRPC) Updates

- [ ] Modify orders list query in `packages/lib/src/trpc/routes/cart.route.ts`
  - Add optional filter parameter: `fulfilledBy?: 'artist' | 'barely' | 'all'`
  - Apply WHERE clause when filter is specified:
    - `'artist'` → `WHERE fulfilledBy = 'artist'`
    - `'barely'` → `WHERE fulfilledBy = 'barely'`
    - `'all'` or undefined → no filter
  - Default to `'all'` (no filter)

- [ ] Ensure `fulfilledBy` field is included in order list response
- [ ] Ensure `barelyFulfillmentFee` field is included in order detail response

### 4.2 Orders List Page

- [ ] Locate orders list component in `apps/app/src/app/[handle]/orders/`

- [ ] Add fulfillment filter dropdown above orders list:
  - Options: "All Orders", "My Fulfillment", "Barely Fulfillment"
  - Default: "All Orders"
  - Use existing dropdown/select component pattern

- [ ] Wire filter to API query parameter:
  - Update query when filter changes
  - Re-fetch orders with new filter value

- [ ] Conditionally show filter only when workspace has Barely fulfillment enabled:
  - Check `barelyFulfillmentMode !== 'artist_all'`
  - If `artist_all`, don't show filter (all orders are artist-fulfilled anyway)

- [ ] (Optional) Persist filter state in URL query param for shareable links

### 4.3 Order Detail Page

- [ ] Locate order detail component in `apps/app/src/app/[handle]/orders/[orderId]/`

- [ ] Add fulfillment information section to order detail:
  ```
  Fulfillment
  -----------
  Fulfilled by: You  (or "Barely")
  ```

- [ ] If fulfilled by Barely, show fee:
  ```
  Fulfillment Fee: $3.50
  ```

- [ ] Use existing order detail layout pattern

### 4.4 Milestone 4 Testing

- [ ] Unit test: Orders query filters correctly by `fulfilledBy = 'artist'`
- [ ] Unit test: Orders query filters correctly by `fulfilledBy = 'barely'`
- [ ] Unit test: Orders query returns all when `fulfilledBy = 'all'`
- [ ] Integration test: Filter dropdown updates displayed orders
- [ ] Integration test: Order detail shows "You" for artist fulfillment
- [ ] Integration test: Order detail shows "Barely" for Barely fulfillment
- [ ] Integration test: Order detail shows fulfillment fee when applicable
- [ ] Integration test: Filter only appears for workspaces with non-default mode
- [ ] E2E test: User can filter orders and see correct results

---

## Cross-Cutting: Security & Validation Checklist

Apply these checks throughout implementation:

### Access Control

- [ ] `barelyFulfillmentEligible` can ONLY be set via direct database access
- [ ] `barelyFulfillmentFlatFeePerOrder` can ONLY be set via direct database access
- [ ] `barelyFulfillmentPercentageFeePerOrder` can ONLY be set via direct database access
- [ ] `barelyFulfillmentMode` update requires workspace write permission
- [ ] `fulfilledBy` and `barelyFulfillmentFee` are immutable after cart creation

### Input Validation

- [ ] `barelyFulfillmentMode` enum values validated in update mutation
- [ ] Eligibility checked before allowing mode change
- [ ] Customer shipping country validated/handled gracefully

### Data Integrity

- [ ] `fulfilledBy` set at cart creation, not updatable after
- [ ] `barelyFulfillmentFee` stores calculated value at time of order (not reference)
- [ ] Historical orders unaffected by fee configuration changes

### Security Tests

- [ ] Security test: Cannot set eligibility via API
- [ ] Security test: Cannot set fee config via API
- [ ] Validation test: Invalid mode values rejected
- [ ] Validation test: Mode change blocked when not eligible
- [ ] Data integrity test: Fulfillment fields immutable after creation

---

## File Summary by Milestone

### Milestone 1: Foundation
| File | Action | Purpose |
|------|--------|---------|
| `.env.example` | Modify | Document new env vars |
| `packages/lib/src/env.ts` | Modify | Add Barely address env access |
| `packages/db/src/sql/workspace.sql.ts` | Modify | Add fulfillment fields |
| `packages/db/src/sql/cart.sql.ts` | Modify | Add fulfillment fields |
| `packages/lib/src/utils/fulfillment.ts` | Create | Core fulfillment utilities |
| `packages/lib/src/utils/cart.ts` | Modify | Add fee calculation |

### Milestone 2: Checkout Integration
| File | Action | Purpose |
|------|--------|---------|
| `packages/lib/src/integrations/shipping/shipengine.endpts.ts` | Modify | Dynamic shipping origin |
| `packages/lib/src/functions/cart.fns.ts` | Modify | Integrate fulfillment into checkout |
| `packages/lib/src/utils/cart.ts` | Modify | Include fulfillment fee in app fee |

### Milestone 3: Artist Settings
| File | Action | Purpose |
|------|--------|---------|
| `packages/validators/src/schemas/` | Modify | Add mode to update schema |
| `packages/lib/src/trpc/routes/workspace.route.ts` | Modify | Add mode update mutation |
| `apps/app/src/app/[handle]/settings/fulfillment/page.tsx` | Create | Settings UI |
| `apps/app/src/app/[handle]/settings/` (nav) | Modify | Add nav link |

### Milestone 4: Order Management
| File | Action | Purpose |
|------|--------|---------|
| `packages/lib/src/trpc/routes/cart.route.ts` | Modify | Add filter to orders query |
| `apps/app/src/app/[handle]/orders/` | Modify | Add filter dropdown |
| `apps/app/src/app/[handle]/orders/[orderId]/` | Modify | Show fulfillment info |

---

## Deployment Sequence

1. **Deploy Milestone 1** - No user-facing changes, safe to deploy
2. **Enable for test workspace** - Set eligibility + fees via database
3. **Deploy Milestone 2** - Checkout integration active for eligible workspaces
4. **Test with real orders** - Verify shipping/fees/assignment
5. **Deploy Milestone 3** - Artists can configure via UI
6. **Deploy Milestone 4** - Order filtering available
7. **Enable for The Now** - Beta client goes live
8. **Monitor & iterate** - Watch for issues, gather feedback

---

## Related Documents

- [[feature|Feature: Barely Fulfillment Partner]]
- [[JTBD|Jobs to be Done: Barely Fulfillment Partner]]
- [[PRD|Product Requirements Document: Barely Fulfillment Partner]]
- [[plan|Technical Implementation Plan (Original)]]
