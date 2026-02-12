# Project Context: Barely Fulfillment Partner

## Current Development
Working on: Enable artists to designate Barely as their fulfillment partner for US orders (or all orders)
Deadline: 2026-02-25
Beta Client: The Now (UK artist)

## Key Files in This Worktree
- `.claude/project/PRD.md` - Full product requirements (6 user stories, 6 functional requirement groups)
- `.claude/project/plan-organized.md` - Implementation checklist organized by milestone
- `.claude/project/JTBD.md` - Jobs to be done analysis (3 primary, 3 secondary jobs)
- `.claude/project/feature.md` - Feature overview and business rationale
- `.claude/project/plan.md` - Original technical implementation plan

## Current Focus
Start with **Milestone 1: Foundation & Data Model**

1. Environment Configuration
   - Add Barely address env vars to `.env.example`
   - Create type-safe env access in `packages/lib/src/env.ts`

2. Workspace Schema Changes (`packages/db/src/sql/workspace.sql.ts`)
   - Add `barelyFulfillmentEligible` (boolean, default false)
   - Add `barelyFulfillmentMode` (enum: artist_all, barely_us, barely_worldwide)
   - Add `barelyFulfillmentFlatFeePerOrder` (integer, cents)
   - Add `barelyFulfillmentPercentageFeePerOrder` (integer, percentage × 100)

3. Cart Schema Changes (`packages/db/src/sql/cart.sql.ts`)
   - Add `fulfilledBy` (enum: artist, barely)
   - Add `barelyFulfillmentFee` (integer, cents)

4. Core Utility Functions
   - Create `packages/lib/src/utils/fulfillment.ts`
   - Implement `determineFulfillmentResponsibility()`
   - Implement `getShippingOriginAddress()`
   - Add `calculateBarelyFulfillmentFee()` to cart utils

## Key Technical Decisions
- Fulfillment determined at checkout (not post-purchase) - shipping rates need correct origin
- Barely address stored in env vars (not database) - single location for MVP
- Fee fields on workspace table - aligns with existing `cartFeePercentageOverride` pattern
- Fulfillment mode as enum: `artist_all`, `barely_us`, `barely_worldwide`
- Fulfillment fee added to Stripe `application_fee_amount`
- Order filtering via simple WHERE clause on `fulfilledBy` field

## Implementation Milestones
1. **Foundation & Data Model** ← START HERE
   - Schema changes, env vars, utility functions
2. **Checkout Integration**
   - Dynamic shipping, order assignment, fee capture
3. **Artist Settings**
   - Fulfillment configuration UI
4. **Order Management**
   - Filtering by fulfillment responsibility

## Success Criteria
- [ ] The Now processing split-fulfillment orders (US via Barely, non-US via artist)
- [ ] 3 US clients onboarded using Barely fulfillment
- [ ] Fulfillment fees captured automatically on Barely-fulfilled orders
- [ ] Artists can filter orders by fulfillment responsibility

## Barely Fulfillment Address (for env vars)
```
763 Park Pl #1R
Brooklyn, NY 11216
US
```

## Quick Start
1. This worktree is focused on implementing Barely Fulfillment Partner
2. All project artifacts are in `.claude/project/`
3. Start with Milestone 1 in `.claude/project/plan-organized.md`
4. Original project docs: `0_Projects/barely-fulfillment-partner/`

## Key Files to Modify
- `packages/db/src/sql/workspace.sql.ts` - Add fulfillment fields
- `packages/db/src/sql/cart.sql.ts` - Add fulfilledBy and fee fields
- `packages/lib/src/functions/cart.fns.ts` - Checkout flow integration
- `packages/lib/src/utils/cart.ts` - Fee calculation
- `packages/lib/src/utils/fulfillment.ts` - New file for fulfillment utilities
- `packages/lib/src/integrations/shipping/shipengine.endpts.ts` - Dynamic shipping origin
- `apps/app/src/app/[handle]/settings/fulfillment/page.tsx` - New settings page
- `apps/app/src/app/[handle]/orders/` - Add fulfillment filter
