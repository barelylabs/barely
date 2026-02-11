# Product Requirements Document: Barely Fulfillment Partner

## Document Info

| Field | Value |
|-------|-------|
| Feature Name | Barely Fulfillment Partner |
| Status | Draft |
| Owner | Adam Barito |
| Created | 2026-02-11 |
| Last Updated | 2026-02-11 |

---

## Executive Summary

Enable artists to designate Barely as their fulfillment partner for US orders (or all orders), allowing them to sell physical products internationally from a single workspace with competitive shipping rates. This feature eliminates the need for duplicate workspaces, multiple Stripe accounts, and fragmented ad campaigns when selling to both domestic and US markets.

**Business Impact:**
- Enables ~$150k+ in additional agency revenue via fulfillment fees
- Unblocks 1 UK client (The Now) ready to expand to US market
- Enables onboarding of 3 US clients contingent on fulfillment solution
- Supports agency goal of $1M GMV through Barely cart in 2026

---

## Problem Statement

### The Problem

Artists selling physical products internationally face a choice: expensive cross-border shipping that kills ad ROI, or the operational nightmare of managing duplicate workspaces, Stripe accounts, and ad campaigns per region.

### Who It Affects

1. **UK/EU artists** wanting to sell to US customers but blocked by:
   - Prohibitive international shipping costs ($15-25+ per order from UK to US)
   - Cart abandonment when customers see shipping at checkout
   - Unprofitable paid acquisition due to shipping impact on unit economics

2. **US artists** who want to sell physical products but:
   - Don't want to handle fulfillment themselves
   - Won't consider physical sales without a fulfillment partner
   - Need a turnkey solution integrated with their existing storefront

### Current Workarounds

| Workaround | Pain Points |
|------------|-------------|
| Ship from home country | Expensive, slow, poor customer experience, kills ad ROI |
| Duplicate workspaces | 2x products, 2x landing pages, 2x Stripe accounts, split analytics, complex ad targeting |
| Avoid international sales | Leaves money on the table, limits growth potential |

### Evidence of Need

- 1 UK client (The Now) has paid for product stocking in Brooklyn and is ready to launch
- 3 US clients will only sign if fulfillment solution is available
- Client has explicitly stated preference for single-workspace solution over duplicates
- Pricing validated at $3-4 per order (willing to pay for convenience)

---

## Goals & Success Metrics

### Goals

1. **Enable international expansion** - UK/EU artists can profitably sell to US customers
2. **Simplify operations** - Single workspace for all markets
3. **Generate fulfillment revenue** - Capture fees on Barely-fulfilled orders
4. **Increase platform stickiness** - Active fulfillment relationships reduce churn risk

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Beta client live | The Now processing split-fulfillment orders | Within 2 weeks of launch |
| US client onboarding | 3 new clients using Barely fulfillment | Within 30 days of launch |
| Setup time | Artists enable fulfillment after approval | < 2 minutes |
| Shipping accuracy | Correct origin used for shipping calculation | 100% of orders |
| Order routing | Orders correctly tagged with fulfillment responsibility | 100% of orders |
| Support tickets | No increase in shipping-related confusion tickets | Baseline or below |

### Non-Goals

- Building inventory management system
- Creating a separate Barely fulfillment dashboard
- Supporting multiple Barely fulfillment locations (EU warehouse)
- Per-product fulfillment assignment
- In-app returns handling

---

## User Stories

### Epic: Enable Barely as Fulfillment Partner

#### US-1: Enable Fulfillment Mode (Artist)
> As an **artist with Barely fulfillment eligibility**, I want to **choose my fulfillment mode** so that **I can configure how my orders are handled**.

**Acceptance Criteria:**
- [ ] Fulfillment settings only visible when `barelyFulfillmentEligible = true`
- [ ] Can select from three modes:
  - "I fulfill all orders" (default)
  - "Barely fulfills US orders, I fulfill the rest"
  - "Barely fulfills all orders"
- [ ] Setting persists and takes effect immediately
- [ ] Can change setting at any time

---

#### US-2: See Competitive US Shipping (Customer)
> As a **US customer** buying from a UK artist using Barely fulfillment, I want to **see shipping rates calculated from a US address** so that **I don't abandon my cart due to high international shipping**.

**Acceptance Criteria:**
- [ ] Shipping calculated from Barely's Brooklyn address for US customers when Barely fulfillment is enabled for US
- [ ] Shipping rates are competitive with domestic US retailers
- [ ] Customer sees no indication of international origin (transparent experience)

---

#### US-3: Filter Orders by Fulfillment Responsibility (Artist)
> As an **artist with split fulfillment**, I want to **filter my orders by who fulfills them** so that **I know exactly which orders I need to ship**.

**Acceptance Criteria:**
- [ ] Orders view has filter: "All Orders" | "My Fulfillment" | "Barely Fulfillment"
- [ ] Default view is "All Orders"
- [ ] Filter accurately reflects `fulfilledBy` field on each order
- [ ] Filter state persists during session

---

#### US-4: Automatic Fulfillment Assignment (System)
> As the **system**, I want to **automatically assign fulfillment responsibility when an order is created** so that **there's no ambiguity about who ships each order**.

**Acceptance Criteria:**
- [ ] Order tagged with `fulfilledBy: "artist"` or `fulfilledBy: "barely"` at creation
- [ ] Assignment based on:
  - Customer's shipping address (US vs non-US)
  - Workspace's fulfillment mode setting
- [ ] Assignment is immutable after order creation
- [ ] Assignment determines which fulfillment fee (if any) is captured

---

#### US-5: Capture Fulfillment Fees (System)
> As **Barely**, I want to **automatically capture fulfillment fees on Barely-fulfilled orders** so that **revenue is collected without manual intervention**.

**Acceptance Criteria:**
- [ ] Fee calculated as: flat fee + (order subtotal × percentage)
- [ ] Fee only applied when `fulfilledBy: "barely"`
- [ ] Fee deducted from artist payout alongside cart and shipping fees
- [ ] Fee amount stored on order record for reference

---

#### US-6: Access Fulfillment-Enabled Workspaces (Barely Team)
> As a **Barely team member**, I want to **access workspaces where Barely fulfillment is enabled** so that **I can fulfill orders assigned to Barely**.

**Acceptance Criteria:**
- [ ] Barely team has workspace access (existing user access mechanism)
- [ ] Can use "Barely Fulfillment" filter to see orders to ship
- [ ] Can mark orders as shipped using standard fulfillment flow
- [ ] Can view order details including shipping address

---

## Functional Requirements

### FR-1: Workspace Eligibility Flag

| ID | Requirement |
|----|-------------|
| FR-1.1 | Workspace model includes `barelyFulfillmentEligible` boolean field |
| FR-1.2 | Field defaults to `false` for all existing and new workspaces |
| FR-1.3 | Field can only be set via backend/database (not exposed in UI) |
| FR-1.4 | When `false`, no fulfillment settings are visible to artist |

### FR-2: Fulfillment Mode Setting

| ID | Requirement |
|----|-------------|
| FR-2.1 | Workspace model includes `barelyFulfillmentMode` enum field |
| FR-2.2 | Enum values: `artist_all`, `barely_us`, `barely_worldwide` |
| FR-2.3 | Default value: `artist_all` |
| FR-2.4 | Setting exposed in workspace settings when eligible |
| FR-2.5 | Setting takes effect immediately upon save |

### FR-3: Fulfillment Fee Configuration

| ID | Requirement |
|----|-------------|
| FR-3.1 | Workspace model includes `barelyFulfillmentFlatFeePerOrder` decimal field |
| FR-3.2 | Workspace model includes `barelyFulfillmentPercentageFeePerOrder` decimal field |
| FR-3.3 | Fields configured via backend when eligibility is granted |
| FR-3.4 | Fee calculation: `flatFee + (orderSubtotal × percentageFee)` |

### FR-4: Dynamic Shipping Calculation

| ID | Requirement |
|----|-------------|
| FR-4.1 | At checkout, system determines fulfillment responsibility before calculating shipping |
| FR-4.2 | If US customer AND mode is `barely_us` or `barely_worldwide` → use Barely address |
| FR-4.3 | If non-US customer AND mode is `barely_worldwide` → use Barely address |
| FR-4.4 | Otherwise → use artist's `shipFrom` address (existing behavior) |
| FR-4.5 | Barely address read from environment variables |

### FR-5: Order Fulfillment Assignment

| ID | Requirement |
|----|-------------|
| FR-5.1 | Order model includes `fulfilledBy` enum field (`artist` \| `barely`) |
| FR-5.2 | Order model includes `barelyFulfillmentFee` decimal field |
| FR-5.3 | `fulfilledBy` set at order creation based on shipping logic |
| FR-5.4 | `barelyFulfillmentFee` calculated and stored at order creation |
| FR-5.5 | Both fields are immutable after order creation |

### FR-6: Order Filtering

| ID | Requirement |
|----|-------------|
| FR-6.1 | Orders view includes fulfillment filter dropdown |
| FR-6.2 | Filter options: "All Orders", "My Fulfillment", "Barely Fulfillment" |
| FR-6.3 | "My Fulfillment" shows orders where `fulfilledBy = artist` |
| FR-6.4 | "Barely Fulfillment" shows orders where `fulfilledBy = barely` |
| FR-6.5 | Default filter: "All Orders" |

---

## User Experience

### UX-1: Fulfillment Settings (Workspace Settings)

**Location:** Workspace Settings > Fulfillment (new section)

**Visibility:** Only when `barelyFulfillmentEligible = true`

**Content:**
```
Fulfillment Partner
-------------------
Choose how your orders are fulfilled:

○ I fulfill all orders (current default)
  You handle shipping for all orders worldwide.

○ Barely fulfills US orders, I fulfill the rest
  Orders shipping to US addresses are fulfilled by Barely.
  You handle all other orders.

○ Barely fulfills all orders
  Barely handles shipping for all orders worldwide.

[Save Changes]

Note: Fulfillment fees apply to Barely-fulfilled orders.
Your current rates: $X.XX + Y% per order
```

### UX-2: Order Filter (Orders View)

**Location:** Orders page, above order list

**Implementation:** Dropdown or segmented control

```
Filter by: [All Orders ▼]
           ├─ All Orders
           ├─ My Fulfillment
           └─ Barely Fulfillment
```

### UX-3: Order Detail (Order Page)

**Addition:** Show fulfillment assignment on order detail

```
Fulfillment: Barely  (or "You")
Fulfillment Fee: $3.50  (only if Barely)
```

---

## Scope

### In Scope (MVP)

| Component | Description |
|-----------|-------------|
| Eligibility flag | Backend-set `barelyFulfillmentEligible` on workspace |
| Fulfillment mode | Artist-configurable setting with 3 options |
| Fee configuration | Backend-set flat + percentage fees on workspace |
| Shipping routing | Dynamic origin selection based on destination + mode |
| Order tagging | `fulfilledBy` field set at order creation |
| Fee capture | Fulfillment fee calculated and deducted from payout |
| Order filtering | Filter orders view by fulfillment responsibility |

### Out of Scope (MVP)

| Component | Reason | Future Consideration |
|-----------|--------|---------------------|
| Inventory management | Handled operationally | Post-MVP if volume justifies |
| Per-product fulfillment | Adds complexity | Post-MVP based on demand |
| Barely dashboard | Reuse existing workspace access | Post-MVP if scale requires |
| Returns handling | Handled via support email | Post-MVP based on volume |
| Multiple Barely locations | Start with Brooklyn only | Post-MVP for EU expansion |
| Approval workflows | Simple flag sufficient | Post-MVP if abuse occurs |
| Stock alerts | Manual coordination for now | Post-MVP if issues arise |

---

## Configuration

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `BARELY_FULFILLMENT_ADDRESS_LINE1` | `763 Park Pl #1R` | Street address |
| `BARELY_FULFILLMENT_ADDRESS_CITY` | `Brooklyn` | City |
| `BARELY_FULFILLMENT_ADDRESS_STATE` | `NY` | State |
| `BARELY_FULFILLMENT_ADDRESS_ZIP` | `11216` | ZIP code |
| `BARELY_FULFILLMENT_ADDRESS_COUNTRY` | `US` | Country |

### Database Schema Additions

**Workspace:**
- `barelyFulfillmentEligible: Boolean (default: false)`
- `barelyFulfillmentMode: Enum ['artist_all', 'barely_us', 'barely_worldwide'] (default: 'artist_all')`
- `barelyFulfillmentFlatFeePerOrder: Decimal (nullable)`
- `barelyFulfillmentPercentageFeePerOrder: Decimal (nullable)`

**Order:**
- `fulfilledBy: Enum ['artist', 'barely'] (default: 'artist')`
- `barelyFulfillmentFee: Decimal (default: 0)`

---

## Dependencies

### Technical Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| US shipping endpoint | Exists | Route Barely-fulfilled orders here |
| UK shipping endpoint | Exists | Continue using for artist-fulfilled non-US |
| Order management | Exists | Add field and filter |
| Workspace settings | Exists | Add new section |
| Payout calculation | Exists | Add new fee deduction |

### External Dependencies

| Dependency | Owner | Notes |
|------------|-------|-------|
| Product stocked at Brooklyn | Barely team | The Now's products already stocked |
| Workspace access for Barely team | Barely team | Standard user access |
| Fee structure confirmation | Adam | $3-4/order validated with clients |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Shipping calculated incorrectly | Medium | High | Thorough testing with all mode/destination combinations |
| Fee deduction errors | Low | High | Validate fee calculation logic; include in order record for audit |
| Order assigned to wrong fulfiller | Low | High | Immutable assignment at creation; clear logic documentation |
| Barely runs out of stock | Medium | Medium | Manual coordination; handled operationally outside app |
| Artist confusion about modes | Low | Low | Clear copy in settings; support documentation |

---

## Launch Plan

### Phase 1: Beta (The Now)

1. Deploy feature to production (behind eligibility flag)
2. Enable eligibility for The Now's workspace
3. Configure fee structure
4. The Now enables "Barely fulfills US orders" mode
5. Monitor first 10-20 orders for correctness
6. Gather feedback and iterate if needed

### Phase 2: US Client Onboarding

1. Onboard 3 US clients with "Barely fulfills all orders" mode
2. Configure appropriate fee structures
3. Monitor order flow and fulfillment process
4. Document any operational improvements needed

### Phase 3: General Availability

1. Establish onboarding process for new clients
2. Document eligibility criteria
3. Create support documentation
4. Consider self-service request flow (future)

---

## Open Questions

| Question | Status | Answer |
|----------|--------|--------|
| ~~Barely's Brooklyn address~~ | Resolved | 763 Park Pl #1R, Brooklyn, NY 11216 |
| ~~Fee collection mechanism~~ | Resolved | Flat + percentage, captured at order time |
| ~~How Barely sees orders~~ | Resolved | Workspace access + order filtering |
| ~~The Now readiness~~ | Resolved | Ready to go ASAP |
| Customer address changes post-order | Open | Recommend: disallow or require manual review |

---

## Related Documents

- [[feature|Feature: Barely Fulfillment Partner]]
- [[JTBD|Jobs to be Done: Barely Fulfillment Partner]]
- [[plan|Technical Implementation Plan]] (next step)
