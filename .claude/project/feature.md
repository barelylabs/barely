# Feature: Usage Protection & Monetization

## Context & Background

### Current State
- **50 new sign-ups/month** since November (up from 1-2/month)
- **4x increase in Neon database costs**
- Users appear legitimate (unique emails, creating real workspaces)
- **Zero revenue capture** - paid tiers exist but Stripe IDs are all `'fixme'`
- **Most limits not enforced** - only invoice usage and cart fees are checked

### What Exists
- Plan definitions with all limits in `workspace-plans.constants.ts`
- Database fields for tracking usage (eventUsage, emailUsage, linkUsage, etc.)
- Usage reset scheduler for billing cycles
- Checkout flow code (works in test, broken in production)
- Partial billing page showing some usage

### What's Missing
- Production Stripe product/price IDs
- Enforcement checks for 9 of 11 limit types
- Warning system at threshold levels
- Complete usage visibility for users

## Problem Statement

We're experiencing real user growth but can't monetize it because the upgrade path is broken, and we can't protect against abuse because limits aren't enforced. Users on the free plan can effectively use unlimited resources, driving up infrastructure costs with no revenue offset.

### Evidence of Need
- Database costs quadrupled in 2 months
- 50 users/month × unlimited resources = unsustainable
- Upgrade flow throws errors in production (tested: fails with 'fixme' price IDs)

## Target Users

1. **Free tier users** - Need clear boundaries on what they can use, visibility into their usage, and a working upgrade path when they need more
2. **Barely team** - Need protection against runaway costs and ability to convert users to paid plans

## Recommended Solution

### Tiered Enforcement System

| Threshold | Behavior |
|-----------|----------|
| **80%** | Soft warning - in-app banner + email notification with upgrade CTA |
| **100%** | Stern warning - more prominent in-app warning + email, still allow action |
| **200%** | Hard limit - block action, email about shutdown, require upgrade to continue |

**Email frequency**: One warning email per threshold per billing cycle (prevents spam if user hovers around threshold)

### Limits to Enforce

| Limit | Free | Bedroom | Rising | Breakout |
|-------|------|---------|--------|----------|
| Fans/contacts | 1,000 | 2,500 | 5,000 | 10,000 |
| Team members | 1 | 5 | 10 | Unlimited |
| Retargeting pixels | 0 | 1 | 3 | 5 |
| Links/month | 50 | 1,000 | 5,000 | 25,000 |
| Link clicks/month | 10,000 | 50,000 | 250,000 | 1B |
| Emails/month | 10,000 | 10,000 | 10,000 | 10,000 |
| Events/month | 5,000 | 50,000 | 150,000 | 500,000 |
| Tasks/month | 100 | 2,500 | 5,000 | 10,000 |
| File storage | 200MB | 200MB | 200MB | 200MB |
| Invoices/month | 3 | 50 | 200 | Unlimited |

*Note: Invoice enforcement already exists - extend with tiered warnings*

### Working Upgrade Path

#### DIY Plans (Bedroom, Rising, Breakout)
Standard self-service upgrade flow:
1. User clicks "Upgrade" button
2. Redirected to Stripe Checkout with plan's price ID
3. On successful payment, webhook updates workspace plan

#### Plus Plans (Bedroom+, Rising+, Breakout+)
Conditional flow based on `eligibleForPlus` workspace flag:

| `eligibleForPlus` | Button Text | Action |
|-------------------|-------------|--------|
| `false` | "Apply" | Links to `cal.com/barely/nyc` |
| `true` | "Upgrade" | Standard Stripe Checkout flow |

This ensures Plus plans (which include coaching) require a conversation before purchase.

### Deprecated Plans Removal
Remove `agency` and `pro` plans entirely from codebase - they're no longer offered and have placeholder IDs.

### Usage Dashboard Expansion

Extend existing billing page to show all usage metrics:
- Current: Invoices created, Link clicks
- Add: Fans, Members, Links created, Emails sent, Events tracked, Tasks, Storage

## Success Criteria

- [ ] All 10 limit types have enforcement at 80%, 100%, and 200% thresholds
- [ ] Warning emails sent at 80% and 100% thresholds (once per threshold per billing cycle)
- [ ] Hard block at 200% with clear upgrade messaging
- [ ] User can upgrade from free → paid DIY plan in production (end-to-end test)
- [ ] Plus plan upgrade shows "Apply" for non-eligible workspaces
- [ ] Billing page shows all usage metrics with progress bars
- [ ] Deprecated plans (agency, pro) removed from codebase

## Core Functionality (MVP)

### Must Have

1. **Enforcement utility function**
   - Check usage against plan limit
   - Return status: `ok` | `warning_80` | `warning_100` | `blocked_200`
   - Include upgrade URL in response
   - Track which warnings have been sent this billing cycle

2. **Enforcement integration points**
   - Fan/contact creation → check fans limit
   - Team member invite → check members limit
   - Pixel creation → check pixels limit
   - Link creation → check links limit (increment linkUsage)
   - Email send → check emails limit (increment emailUsage)
   - Event track → check events limit (increment eventUsage)
   - Task creation → check tasks limit
   - File upload → check storage limit (increment fileUsage)

3. **Warning email templates**
   - 80% warning: "You're approaching your [resource] limit"
   - 100% warning: "You've reached your [resource] limit"
   - 200% blocked: "Your [resource] has been paused"

4. **Stripe production IDs** ✅ COLLECTED
   - Update `workspace-plans.constants.ts` with real IDs
   - Remove deprecated plans (agency, pro)

5. **Plus plan conditional upgrade**
   - Add `eligibleForPlus` boolean field to workspace schema
   - Modify upgrade buttons to check flag
   - "Apply" → cal.com/barely/nyc when not eligible
   - Standard checkout when eligible

6. **Billing page expansion**
   - Add usage rows for all tracked metrics
   - Progress bar showing current/limit
   - Color coding: green (<80%), yellow (80-100%), red (>100%)

### Reusable Components
- Extend existing `checkInvoiceUsageAndIncrement()` pattern
- Use existing `use-usage` hook for frontend
- Use existing email infrastructure for warnings
- Extend existing billing page components

## Out of Scope for MVP

- Admin dashboard for viewing all workspace usage
- Automatic downgrade for non-payment
- Usage analytics/trends over time
- Granular rate limiting (per-minute/hour)
- Custom limit overrides via UI (already exists in DB, admin-only)

## Technical Considerations

### Enforcement Pattern
```typescript
// Pseudocode for enforcement utility
async function checkUsageLimit(
  workspaceId: string,
  limitType: 'fans' | 'members' | 'links' | 'emails' | 'events' | 'tasks' | 'storage' | 'pixels',
  incrementBy?: number
): Promise<{
  status: 'ok' | 'warning_80' | 'warning_100' | 'blocked_200';
  current: number;
  limit: number;
  percentage: number;
  upgradeUrl: string;
  shouldSendEmail: boolean; // false if already sent this cycle
}>
```

### Key Files to Modify
- `packages/const/src/workspace-plans.constants.ts` - Add Stripe IDs, remove deprecated plans
- `packages/db/src/sql/workspace.sql.ts` - Add `eligibleForPlus` field, warning tracking fields
- `packages/lib/src/functions/usage.fns.ts` - New enforcement utilities
- `packages/lib/src/functions/*.fns.ts` - Add checks to each feature
- `packages/lib/src/trigger/usage-warnings.ts` - Warning email jobs
- `apps/app/src/app/[handle]/settings/billing/page.tsx` - Expand usage display
- Plans page component - Conditional Plus plan buttons

### Database Additions
- `eligibleForPlus` boolean on workspace (default false)
- `usageWarnings` jsonb field to track sent warnings per billing cycle:
  ```json
  {
    "fans_80": "2026-02-10T...",
    "fans_100": null,
    "emails_80": "2026-02-08T...",
    ...
  }
  ```

## Stripe Production IDs

### DIY Plans

| Plan | Product ID | Monthly Price ID | Yearly Price ID |
|------|------------|------------------|-----------------|
| Bedroom | `prod_Txeo2HSM6HnJx4` | `price_1SzjV0HDMmzntRhpvQKmHeC8` | `price_1SzjVSHDMmzntRhpiwbdyqbv` |
| Rising | `prod_TxevMytIBe6fon` | `price_1SzjbtHDMmzntRhprcbxD20W` | `price_1SzjcCHDMmzntRhpAZVE4aig` |
| Breakout | `prod_TxeweGMPwBFeVm` | `price_1Szjd0HDMmzntRhpQzAUpny0` | `price_1SzjdNHDMmzntRhpE3gZv0CW` |

### Plus Plans (Require eligibleForPlus = true)

| Plan | Product ID | Monthly Price ID | Yearly Price ID |
|------|------------|------------------|-----------------|
| Bedroom+ | `prod_Txey7RdoUEQFHi` | `price_1SzjeVHDMmzntRhpOy4yrqcW` | `price_1SzjemHDMmzntRhp0CXxI518` |
| Rising+ | `prod_TxezRHktqwlWKI` | `price_1SzjfOHDMmzntRhpIItqCV70` | `price_1SzjfgHDMmzntRhpAfaEeT4Y` |
| Breakout+ | `prod_Txf0wBNF8ZpgfR` | `price_1SzjgKHDMmzntRhpSSD7gNdz` | `price_1SzjgdHDMmzntRhpe1YEe9Wu` |

### Invoice Pro

| Plan | Product ID | Monthly Price ID | Yearly Price ID |
|------|------------|------------------|-----------------|
| Invoice Pro | `prod_Txf4YDcKhcTd0G` | `price_1SzjkhHDMmzntRhpufIFDzh4` | `price_1SzjksHDMmzntRhp7fan3dl1` |

## Human Review Required

- [x] ~~Confirm tiered thresholds (80/100/200%) are appropriate~~ ✅ Confirmed
- [x] ~~Review Stripe pricing matches business intent~~ ✅ All IDs collected
- [x] ~~Should deprecated plans (agency, pro) be removed entirely?~~ ✅ Yes, remove
- [x] ~~Confirm email warning frequency~~ ✅ Once per threshold per billing cycle
- [x] ~~Keep Invoice Pro plan?~~ ✅ Yes, IDs provided

## Complexity Assessment

**Overall Complexity**: Medium

**Reduced by:**
- Following existing invoice enforcement pattern
- Using existing usage tracking fields
- Extending existing billing page components

**Remaining complexity:**
- 10 integration points to add enforcement
- Email template creation
- Plus plan conditional flow
- End-to-end testing of upgrade flow
