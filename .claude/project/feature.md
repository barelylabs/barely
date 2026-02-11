# Feature: Barely Fulfillment Partner

## Context & Background

### Related Work
- **Builds On**: Existing US and UK shipping endpoints in the barely app
- **Extends**: Current workspace and order management system
- **Enables**: Agency $1M GMV target for 2026

### Business Context
- UK agency clients want to expand into US market but shipping from UK is prohibitively expensive
- US clients won't consider physical media sales without a fulfillment solution
- Current workaround (duplicate workspaces) is painful and creates operational overhead
- This feature enables Barely to capture ~$150k+ in additional agency revenue via fulfillment fees

### Validated Demand
- 1 UK client (The Now) ready to go - has paid for product stocking in Brooklyn
- 3 US clients contingent on this capability
- Pricing validated at $3-4 per order

## Problem Statement

Artists selling physical products internationally face a choice: expensive cross-border shipping that kills ad ROI, or the operational nightmare of managing duplicate workspaces, Stripe accounts, and ad campaigns per region. This friction prevents UK/EU artists from effectively selling to US customers and discourages US artists from selling physical products at all.

### Evidence of Need
- UK client's US shipping costs make paid acquisition unprofitable
- 3 prospective US clients won't sign without fulfillment solution
- Current workaround requires: 2 workspaces, 2 Stripe accounts, duplicate products/funnels/landing pages, split ad campaigns

## Target Users

### Primary: UK/EU Artists Expanding to US
- Already selling physical products in home market
- Want to run paid campaigns to US audiences
- Need affordable US shipping to make unit economics work
- Currently blocked by shipping costs or workaround complexity

### Secondary: US Artists Needing Fulfillment
- Want to sell physical products but don't want to fulfill themselves
- Would only consider physical media sales with a fulfillment partner
- Willing to pay per-order fees for convenience

## Current State & Pain Points

### How Users Handle This Today
- **Workaround**: Create 2 separate workspaces in the barely app
  - Duplicate all landing pages, products, cart funnels
  - Attach separate Stripe account to US workspace
  - Split ad campaigns so UK fans → UK workspace, US fans → US workspace
  - Manage sales/analytics across two separate systems
- **Or**: Ship internationally from home country (expensive, slow, kills ad ROI)
- **Or**: Don't sell to international customers at all

### Validated Pain Points
- Duplicate workspace setup takes significant time
- Ongoing operational overhead managing two systems
- Split Stripe accounts complicate accounting
- Ad campaign management is more complex
- Client explicitly prefers streamlined single-workspace solution

## Recommended Solution

Enable artists to designate Barely as their fulfillment partner for US orders (or all orders). When enabled:
- Shipping estimates at checkout automatically calculate from the appropriate origin (Barely's Brooklyn address for Barely-fulfilled regions, artist's address for artist-fulfilled regions)
- Orders are tagged with fulfillment responsibility
- Artists can filter their orders view by fulfillment responsibility

### Why This Approach
- Single workspace, single Stripe account, single product catalog
- Minimal UI changes (one setting + one filter)
- Leverages existing shipping endpoints (US and UK already exist)
- Simple eligibility flag allows Barely to vet artists before enabling
- No inventory management complexity in MVP

## Success Criteria

### Business Metrics
- UK client (The Now) successfully processing split-fulfillment orders within 2 weeks of launch
- 3 US clients onboarded within 30 days of launch
- Path to $1M GMV through Barely cart in 2026

### Feature Metrics
- Artists can enable Barely fulfillment in <2 minutes after approval
- Checkout shipping estimates reflect correct origin based on destination
- Order filtering correctly separates fulfillment responsibilities
- Zero increase in support tickets related to shipping confusion

### User Outcomes
- Artists run single workspace for all markets
- Shipping costs displayed to US customers are competitive (Brooklyn origin)
- Artists can see exactly which orders they need to fulfill

## Core Functionality (MVP)

### Must Have

**1. Workspace Eligibility Flag**
- Backend-set flag: `barelyFulfillmentEligible`
- When false: current behavior, no fulfillment options visible
- When true: artist can configure fulfillment mode

**2. Artist Fulfillment Mode Setting**
- Location: Workspace settings
- Options:
  - "I fulfill all orders" (default, current behavior)
  - "Barely fulfills US orders, I fulfill the rest"
  - "Barely fulfills all orders"
- Only visible when workspace is eligible

**3. Dynamic Shipping Calculation**
- At checkout, determine shipping origin based on:
  - Customer's shipTo address (US vs non-US)
  - Workspace's fulfillment mode setting
- US customer + (US-only OR worldwide Barely fulfillment) → use US shipping endpoint with Barely's Brooklyn address
- Non-US customer + worldwide Barely fulfillment → use US shipping endpoint with Barely's Brooklyn address
- Otherwise → use existing logic with artist's shipFrom address

**4. Order Fulfillment Assignment**
- When order is created, tag with fulfillment responsibility: `fulfilledBy: "artist" | "barely"`
- Logic mirrors shipping calculation logic
- Stored on order record for filtering

**5. Order Filtering**
- Add filter to orders view: "All Orders" | "My Fulfillment" | "Barely Fulfillment"
- Simple filter on `fulfilledBy` field
- Default to "All Orders"

**6. Fulfillment Fee Capture**
- Workspace fields: `barelyFulfillmentFlatFeePerOrder` (e.g., $1.00), `barelyFulfillmentPercentageFeePerOrder` (e.g., 5%)
- At time of order, calculate fulfillment fee: flat fee + (order subtotal × percentage)
- Deduct from artist payout alongside existing cart and shipping fees
- Only applied to orders where `fulfilledBy: "barely"`

### Configuration

**Environment Variables (not in public repo)**
- `BARELY_FULFILLMENT_ADDRESS_LINE1` = "763 Park Pl #1R"
- `BARELY_FULFILLMENT_ADDRESS_CITY` = "Brooklyn"
- `BARELY_FULFILLMENT_ADDRESS_STATE` = "NY"
- `BARELY_FULFILLMENT_ADDRESS_ZIP` = "11216"
- `BARELY_FULFILLMENT_ADDRESS_COUNTRY` = "US"

## Out of Scope for MVP

### Explicitly Deferred
- Inventory/stock management (handled operationally)
- Per-product fulfillment settings (all products use same fulfillment mode)
- Barely-side dashboard (Barely team uses existing workspace filtering)
- Returns handling in-app (handled via support email)
- Non-US Barely fulfillment locations
- Complex approval workflows (simple backend flag for now)
- Automated stock alerts or notifications

### Available via Workaround
- Multi-region Barely fulfillment → separate workspaces per region
- Per-product fulfillment → manual coordination with Barely team

## Integration Points

### With Existing Features
- **Shipping Endpoints**: US and UK endpoints already exist, route to appropriate one
- **Order Management**: Add `fulfilledBy` field and filter capability
- **Workspace Settings**: Add fulfillment mode configuration
- **Checkout Flow**: Modify shipping calculation to consider fulfillment mode

### Data Model Changes
- Workspace: Add `barelyFulfillmentEligible` (boolean), `barelyFulfillmentMode` (enum), `barelyFulfillmentFlatFeePerOrder` (decimal), `barelyFulfillmentPercentageFeePerOrder` (decimal)
- Order: Add `fulfilledBy` (enum: artist | barely), `barelyFulfillmentFee` (decimal, calculated at order time)

## Complexity Assessment

**Overall Complexity**: Medium

**Reduced Complexity Through:**
- Using existing shipping endpoints (no new carrier integrations)
- Simple boolean eligibility (no approval workflow)
- No inventory management
- No Barely-specific dashboard (reuse existing)

**Remaining Complexity:**
- Shipping calculation routing logic
- Ensuring checkout correctly determines fulfillment before calculating shipping
- Order filter UI addition

## Human Review Required

- [x] Confirm Barely's Brooklyn address for env variables → 763 Park Pl #1R, Brooklyn, NY 11216
- [x] Confirm fulfillment fee structure → Flat fee + percentage per order, captured at purchase time
- [x] Confirm The Now is ready for beta testing → Ready to go ASAP
- [x] Decide: How does Barely get notified of orders to fulfill? → Barely team gets workspace access, uses order filtering

## Technical Considerations

*High-level only - implementation details in later phases*

- Shipping calculation happens at checkout - need to determine fulfillment responsibility before calling shipping endpoint
- `fulfilledBy` should be immutable once order is created (based on address at time of purchase)
- Consider: What if customer changes address after order? (Probably: don't allow, or recalculate fulfillment)
- Env variables for Barely address keep sensitive data out of repo

## Operational Considerations

### Barely Fulfillment Operations
- Barely team gets workspace access to fulfillment-enabled workspaces
- Use "Barely Fulfillment" filter to see orders to fulfill
- Mark orders as shipped using standard order fulfillment flow
- Returns/support handled via existing support email channel

### Client Onboarding
- Artist requests Barely fulfillment
- Barely team verifies product is stocked in Brooklyn
- Barely team sets `barelyFulfillmentEligible = true` and configures fee structure
- Artist configures fulfillment mode in workspace settings

## Future Possibilities

### Natural Extensions (Post-MVP)
- Multiple Barely fulfillment locations (EU warehouse)
- Per-product fulfillment assignment
- Inventory sync and stock alerts
- Barely-specific fulfillment dashboard
- Fulfillment fee reporting/analytics

### Watch For (Scope Creep)
- Complex inventory management before validating basic fulfillment
- Per-SKU fulfillment routing before proving demand
- Real-time stock sync before manual process is painful
