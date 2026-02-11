# Project Context: Usage Protection & Monetization

## Current Development

**Working on:** Tiered usage enforcement across all resource types, fixing Stripe upgrade path, and expanding billing dashboard for full usage visibility.

**Deadline:** February 28, 2026

**Problem:**
- 50 new sign-ups/month with zero revenue capture (Stripe IDs are `'fixme'`)
- 4x database cost increase with no limit enforcement
- Only 1 of 10 usage limits actually enforced

## Key Files in This Worktree

- `.claude/project/plan-organized.md` - **START HERE** - Implementation checklist by milestone
- `.claude/project/PRD.md` - Full product requirements
- `.claude/project/JTBD.md` - Jobs to be done analysis
- `.claude/project/feature.md` - Feature overview and rationale
- `.claude/project/plan.md` - Technical implementation plan

## Current Focus: Milestone 1 - Foundation

**This is the blocking milestone - complete this first.**

### 1.1 Database Schema Changes
- Add `eligibleForPlus` boolean (default: false)
- Add `usageWarnings` JSONB (default: `{}`)
- Verify/add usage tracking fields

### 1.2 Stripe Production IDs
All IDs have been collected - update `workspace-plans.constants.ts`:

| Plan | Product ID | Monthly Price | Yearly Price |
|------|------------|---------------|--------------|
| Bedroom | prod_Txeo2HSM6HnJx4 | price_1SzjV0HDMmzntRhpvQKmHeC8 | price_1SzjVSHDMmzntRhpiwbdyqbv |
| Rising | prod_TxevMytIBe6fon | price_1SzjbtHDMmzntRhprcbxD20W | price_1SzjcCHDMmzntRhpAZVE4aig |
| Breakout | prod_TxeweGMPwBFeVm | price_1Szjd0HDMmzntRhpQzAUpny0 | price_1SzjdNHDMmzntRhpE3gZv0CW |
| Bedroom+ | prod_Txey7RdoUEQFHi | price_1SzjeVHDMmzntRhpOy4yrqcW | price_1SzjemHDMmzntRhp0CXxI518 |
| Rising+ | prod_TxezRHktqwlWKI | price_1SzjfOHDMmzntRhpIItqCV70 | price_1SzjfgHDMmzntRhpAfaEeT4Y |
| Breakout+ | prod_Txf0wBNF8ZpgfR | price_1SzjgKHDMmzntRhpSSD7gNdz | price_1SzjgdHDMmzntRhpe1YEe9Wu |
| Invoice Pro | prod_Txf4YDcKhcTd0G | price_1SzjkhHDMmzntRhpufIFDzh4 | price_1SzjksHDMmzntRhp7fan3dl1 |

### 1.3 Remove Deprecated Plans
- Remove `agency` and `pro` from WORKSPACE_PLANS
- Update TypeScript types

### 1.4 Core Enforcement Utility
- Create `packages/lib/src/functions/usage.fns.ts`
- Implement `checkUsageLimit()` function with tiered thresholds

## Key Technical Decisions

1. **Tiered Enforcement**: 80% soft warning → 100% stern warning → 200% hard block
2. **Email Deduplication**: `usageWarnings` JSONB tracks sent warnings per billing cycle
3. **Plus Plan Gating**: `eligibleForPlus` flag - false shows "Apply" → cal.com/barely/nyc
4. **Usage Counting**: Count from database (like invoice pattern), not just counters

## Success Criteria

- [ ] All 10 resource types have tiered enforcement
- [ ] Warning emails at 80%/100% (once per billing cycle)
- [ ] Hard block at 200% with upgrade messaging
- [ ] User can upgrade Free → paid plan in production
- [ ] Billing page shows all 10 metrics
- [ ] Plus plans show "Apply" for non-eligible workspaces
- [ ] Deprecated plans removed

## Key Files to Modify

| File | Purpose |
|------|---------|
| `packages/const/src/workspace-plans.constants.ts` | Stripe IDs, remove deprecated |
| `packages/db/src/sql/workspace.sql.ts` | Schema changes |
| `packages/lib/src/functions/usage.fns.ts` | New enforcement utility |
| `packages/lib/src/functions/invoice.fns.ts` | Existing enforcement pattern (template) |

## Implementation Order (Recommended)

1. **Milestone 1: Foundation** (required first)
2. **Milestone 3.1-3.2: Upgrade Flow** (enables revenue immediately)
3. **Milestone 2: Warning Emails** (enables enforcement)
4. **Milestone 3.3-3.5: Billing Dashboard** (user transparency)
5. **Milestone 4: Resource Enforcement** (one at a time)
6. **Milestone 5: Billing Cycle** (anytime after M1)

## Quick Start

1. Read `.claude/project/plan-organized.md` for the full implementation checklist
2. Start with Milestone 1.2 (Stripe IDs) - this unblocks revenue immediately
3. Follow the existing `checkInvoiceUsageAndIncrement()` pattern in `invoice.fns.ts`

## Original Project

Full documentation: `/Users/barely/hub/0_Projects/barely-usage-protection/`
