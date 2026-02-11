# Technical Implementation Plan: Usage Protection & Monetization (Organized)

## Overview

This document reorganizes the implementation checklist into **milestones with clear dependencies**. Each milestone can be completed and tested independently before moving to the next. Within milestones, tasks are grouped so you can implement one complete capability at a time.

---

## Dependency Graph

```
Milestone 1: Foundation
    ├── Milestone 2: Warning Email Infrastructure
    │       └── Milestone 4: Resource Enforcement (all 10 types)
    │
    ├── Milestone 3: Upgrade & Billing Experience (parallel with M2)
    │
    └── Milestone 5: Billing Cycle Management (parallel with M2-M4)
```

---

## Milestone 1: Foundation (BLOCKING - Must Complete First)

This milestone establishes all shared infrastructure. Nothing else can proceed until this is complete.

### 1.1 Database Schema Changes

**Files:** `packages/db/src/sql/workspace.sql.ts`

- [ ] Add `eligibleForPlus` boolean field (default: false)
- [ ] Add `usageWarnings` JSONB field (default: `{}`)
- [ ] Verify `fanUsage` integer field exists (add if not, default: 0)
- [ ] Verify `memberUsage` integer field exists (add if not)
- [ ] Verify `pixelUsage` integer field exists (add if not)
- [ ] Verify `taskUsage` integer field exists (add if not)
- [ ] Generate database migration
- [ ] Run migration against development database
- [ ] Verify all fields accessible via Drizzle ORM queries

### 1.2 Stripe Production IDs & Plan Cleanup

**Files:** `packages/const/src/workspace-plans.constants.ts`

- [ ] Update `bedroom` plan:
  - `productId.production`: `prod_Txeo2HSM6HnJx4`
  - `price.monthly.production`: `price_1SzjV0HDMmzntRhpvQKmHeC8`
  - `price.yearly.production`: `price_1SzjVSHDMmzntRhpiwbdyqbv`
- [ ] Update `rising` plan:
  - `productId.production`: `prod_TxevMytIBe6fon`
  - `price.monthly.production`: `price_1SzjbtHDMmzntRhprcbxD20W`
  - `price.yearly.production`: `price_1SzjcCHDMmzntRhpAZVE4aig`
- [ ] Update `breakout` plan:
  - `productId.production`: `prod_TxeweGMPwBFeVm`
  - `price.monthly.production`: `price_1Szjd0HDMmzntRhpQzAUpny0`
  - `price.yearly.production`: `price_1SzjdNHDMmzntRhpE3gZv0CW`
- [ ] Update `bedroom.plus` plan:
  - `productId.production`: `prod_Txey7RdoUEQFHi`
  - `price.monthly.production`: `price_1SzjeVHDMmzntRhpOy4yrqcW`
  - `price.yearly.production`: `price_1SzjemHDMmzntRhp0CXxI518`
- [ ] Update `rising.plus` plan:
  - `productId.production`: `prod_TxezRHktqwlWKI`
  - `price.monthly.production`: `price_1SzjfOHDMmzntRhpIItqCV70`
  - `price.yearly.production`: `price_1SzjfgHDMmzntRhpAfaEeT4Y`
- [ ] Update `breakout.plus` plan:
  - `productId.production`: `prod_Txf0wBNF8ZpgfR`
  - `price.monthly.production`: `price_1SzjgKHDMmzntRhpSSD7gNdz`
  - `price.yearly.production`: `price_1SzjgdHDMmzntRhpe1YEe9Wu`
- [ ] Update `invoice.pro` plan:
  - `productId.production`: `prod_Txf4YDcKhcTd0G`
  - `price.monthly.production`: `price_1SzjkhHDMmzntRhpufIFDzh4`
  - `price.yearly.production`: `price_1SzjksHDMmzntRhp7fan3dl1`
- [ ] Remove `agency` plan from `WORKSPACE_PLANS` map
- [ ] Remove `pro` plan from `WORKSPACE_PLANS` map
- [ ] Remove `'agency'` and `'pro'` from `WORKSPACE_PLAN_TYPES` array
- [ ] Update TypeScript types referencing removed plans
- [ ] Search codebase for any remaining references to `agency` or `pro` plans

### 1.3 Core Enforcement Utility

**Files:** `packages/lib/src/functions/usage.fns.ts` (new file)

- [ ] Create new file `usage.fns.ts`
- [ ] Define types:
  ```typescript
  type UsageLimitType = 'fans' | 'members' | 'pixels' | 'links' | 'clicks' | 'emails' | 'events' | 'tasks' | 'storage' | 'invoices';
  type UsageStatus = 'ok' | 'warning_80' | 'warning_100' | 'blocked_200';
  ```
- [ ] Implement `getUsageCount(workspaceId, limitType)`:
  - Query database for current count based on limit type
  - For monthly limits: count records WHERE createdAt within billing cycle
  - For cumulative limits (fans, members, pixels): count total records
- [ ] Implement `getUsageLimit(workspace, limitType)`:
  - Get limit from `WORKSPACE_PLANS.get(workspace.plan)`
  - Check for override field (e.g., `workspace.linkUsageLimitOverride`)
  - Return override if set, otherwise plan limit
- [ ] Implement `checkUsageLimit(workspaceId, limitType, incrementBy = 1)`:
  - Fetch workspace with plan
  - Call `getUsageCount()` and `getUsageLimit()`
  - Calculate percentage: `(current + incrementBy) / limit * 100`
  - Determine status based on thresholds (80, 100, 200)
  - Call `hasWarningSent()` to determine `shouldSendEmail`
  - Return: `{ status, current, limit, percentage, shouldSendEmail, upgradeUrl }`
- [ ] Implement `incrementUsage(workspaceId, limitType, amount)`:
  - Update appropriate usage counter field in workspace
- [ ] Implement `markWarningSent(workspaceId, limitType, threshold)`:
  - Update `usageWarnings` JSONB: set `{limitType}_{threshold}` to current timestamp
- [ ] Implement `hasWarningSent(workspace, limitType, threshold)`:
  - Check if `usageWarnings[{limitType}_{threshold}]` exists and is within current billing cycle
- [ ] Export all functions from package index

### 1.4 Foundation Testing

- [ ] Unit test: `checkUsageLimit` returns correct status at 79%, 80%, 100%, 199%, 200%, 201%
- [ ] Unit test: `getUsageLimit` respects override fields
- [ ] Unit test: `hasWarningSent` correctly detects sent warnings within cycle
- [ ] Integration test: Stripe IDs resolve correctly based on environment
- [ ] Integration test: New schema fields are queryable

---

## Milestone 2: Warning Email Infrastructure

**Depends on:** Milestone 1 (enforcement utility, schema)

This milestone creates the email notification system used by all enforcement points.

### 2.1 Email Templates

**Files:** `packages/email/src/templates/`

- [ ] Create `usage-warning-80.tsx`:
  ```typescript
  interface Props {
    resourceType: string;
    resourceLabel: string; // Human-readable, e.g., "fans" → "Fans/Contacts"
    currentUsage: number;
    limit: number;
    workspaceName: string;
    upgradeUrl: string;
  }
  ```
  - Subject: "You're approaching your {resourceLabel} limit on Barely"
  - Body: Current usage, plan limit, percentage used
  - CTA button: "View Plans" → upgradeUrl
  - Tone: Informative, helpful
- [ ] Create `usage-warning-100.tsx`:
  - Same props as 80%
  - Subject: "You've reached your {resourceLabel} limit on Barely"
  - Body: Explain grace period (can continue until 200%)
  - CTA button: "Upgrade Now"
  - Tone: Urgent but supportive
- [ ] Create `usage-blocked-200.tsx`:
  - Same props as 80%
  - Subject: "{resourceLabel} paused on your Barely workspace"
  - Body: What's blocked, why, how to unblock
  - CTA button: "Upgrade to Continue"
  - Tone: Clear, actionable
- [ ] Export templates from `packages/email/src/index.ts`

### 2.2 Email Dispatch Logic

**Files:** `packages/lib/src/functions/usage.fns.ts`

- [ ] Add `getResourceLabel(limitType)` helper:
  - Maps 'fans' → 'Fans/Contacts', 'links' → 'Links', etc.
- [ ] Implement `sendUsageWarningEmail(workspaceId, limitType, threshold)`:
  - Fetch workspace with owner user
  - Get owner email address
  - Select template based on threshold (80, 100, 200)
  - Build upgrade URL: `/settings/billing/plans`
  - Call `sendEmail()` with transactional type
  - Call `markWarningSent()` to prevent duplicates

### 2.3 Background Job

**Files:** `packages/lib/src/trigger/usage-warning-email.ts` (new file)

- [ ] Create Trigger.dev task `send-usage-warning-email`:
  ```typescript
  payload: {
    workspaceId: string;
    limitType: UsageLimitType;
    threshold: 80 | 100 | 200;
  }
  ```
- [ ] Import and call `sendUsageWarningEmail()` within job
- [ ] Add error handling and logging
- [ ] Export task from trigger index

### 2.4 Email System Testing

- [ ] Visual test: Render all 3 templates with sample data
- [ ] Unit test: `sendUsageWarningEmail` calls correct template
- [ ] Unit test: Emails not sent if `hasWarningSent` returns true
- [ ] Integration test: Trigger.dev job executes successfully

---

## Milestone 3: Upgrade & Billing Experience

**Depends on:** Milestone 1 (schema, Stripe IDs)
**Can run in parallel with:** Milestone 2

This milestone fixes the upgrade flow and expands the billing dashboard.

### 3.1 Upgrade Flow Verification

**Files:** `packages/lib/src/trpc/routes/workspace-stripe.route.ts`, `packages/lib/src/functions/workspace-stripe.fns.ts`

- [ ] Verify `createCheckoutLink` mutation:
  - Correctly reads `NEXT_PUBLIC_VERCEL_ENV` for environment detection
  - Selects `production` price IDs when in production
  - Selects `test` price IDs when in development/preview
- [ ] Verify `handleStripePlanCheckoutSessionComplete`:
  - Correctly maps Stripe price ID back to plan via `getPlanByStripePriceId()`
  - Updates workspace `plan` field
- [ ] Test checkout flow end-to-end in test environment (Free → Bedroom)

### 3.2 Plus Plan Conditional Flow

**Files:** Plans page component (locate in `apps/app`)

- [ ] Add `eligibleForPlus` to workspace data query/context
- [ ] Create `PlusPlanButton` component:
  ```typescript
  interface Props {
    planId: string;
    eligibleForPlus: boolean;
    onUpgrade: () => void;
  }
  ```
  - If `!eligibleForPlus`: render "Apply" button → `https://cal.com/barely/nyc` (new tab)
  - If `eligibleForPlus`: render standard "Upgrade" button → checkout flow
- [ ] Style "Apply" button distinctly (outline style or different color)
- [ ] Apply `PlusPlanButton` to Bedroom+, Rising+, Breakout+ plan cards

### 3.3 Generic Usage Metric Component

**Files:** `apps/app/src/app/[handle]/settings/billing/`

- [ ] Create `UsageMetricCard` component:
  ```typescript
  interface Props {
    label: string;
    current: number;
    limit: number;
    unit?: string; // e.g., "MB" for storage
    isUnlimited?: boolean;
  }
  ```
  - Progress bar with fill based on percentage
  - Color: green (<80%), yellow (80-100%), red (>100%)
  - Display: "X / Y {unit}" or "X (unlimited)"
  - Percentage badge when > 80%
- [ ] Refactor `LinkUsageSummary` to use `UsageMetricCard`
- [ ] Refactor `InvoiceUsageSummary` to use `UsageMetricCard`

### 3.4 Usage Hook Enhancement

**Files:** `packages/hooks/src/use-usage.ts`

- [ ] Extend return object with all usage metrics:
  - `fanUsage`, `fanLimit`
  - `memberUsage`, `memberLimit`
  - `pixelUsage`, `pixelLimit`
  - `linkUsage`, `linkLimit` (verify existing)
  - `clickUsage`, `clickLimit`
  - `emailUsage`, `emailLimit`
  - `eventUsage`, `eventLimit`
  - `taskUsage`, `taskLimit`
  - `storageUsage`, `storageLimit`
  - `invoiceUsage`, `invoiceLimit` (verify existing)
- [ ] Fetch additional counts from workspace query or separate queries
- [ ] Handle "unlimited" values (return `Infinity` or special flag)

### 3.5 Billing Dashboard Expansion

**Files:** `apps/app/src/app/[handle]/settings/billing/billing-summary.tsx`

- [ ] Add all 10 `UsageMetricCard` components to billing page:
  - Fans/Contacts
  - Team Members
  - Retargeting Pixels
  - Links Created (this month)
  - Link Clicks (this month)
  - Emails Sent (this month)
  - Events Tracked (this month)
  - Tasks Created (this month)
  - File Storage
  - Invoices Created (this month)
- [ ] Display billing cycle dates prominently at top
- [ ] Add contextual upgrade CTA when any metric > 80%
- [ ] Ensure responsive layout (grid on desktop, stack on mobile)

### 3.6 Upgrade & Billing Testing

- [ ] Test DIY upgrade flow: Free → Bedroom (test environment)
- [ ] Test Plus plan "Apply" button opens cal.com link
- [ ] Test Plus plan upgrade when `eligibleForPlus = true`
- [ ] Test billing page displays all 10 metrics correctly
- [ ] Test progress bar colors at each threshold
- [ ] Test responsive layout on mobile viewport

---

## Milestone 4: Resource Enforcement

**Depends on:** Milestone 1 (enforcement utility), Milestone 2 (email system)

Each resource type is a self-contained unit. They can be implemented in any order within this milestone. Complete one fully (backend + frontend + test) before moving to the next.

---

### 4.1 Fans/Contacts Enforcement

**Backend - Files:** `packages/lib/src/trpc/routes/fan.route.ts`

- [ ] In `create` mutation, before insert:
  - Call `checkUsageLimit(ctx.workspace.id, 'fans')`
  - If `status === 'blocked_200'`: throw TRPCError with message including upgrade URL
  - If `shouldSendEmail`: trigger `send-usage-warning-email` job
- [ ] After successful insert:
  - Call `incrementUsage(ctx.workspace.id, 'fans', 1)`
- [ ] In `importFromCsv` mutation:
  - Count rows in CSV
  - Call `checkUsageLimit(ctx.workspace.id, 'fans', rowCount)`
  - Block entire import if would exceed 200%
  - Warn if would cross 80% or 100%

**Frontend - Files:** Billing page components

- [ ] Verify `fanUsage` and `fanLimit` available from `useUsage()`
- [ ] Add `FanUsageSummary` using `UsageMetricCard`

**Testing**

- [ ] Test fan creation at 79%, 80%, 100%, 200% of limit
- [ ] Test CSV import blocking when at limit
- [ ] Test warning email triggered correctly
- [ ] Test usage counter increments

---

### 4.2 Team Members Enforcement

**Backend - Files:** `packages/lib/src/trpc/routes/workspace-invite.route.ts`

- [ ] In `inviteMember` mutation, before creating invite:
  - Count current members: `SELECT COUNT(*) FROM _workspaceMembers WHERE workspaceId = ?`
  - Call `checkUsageLimit(ctx.workspace.id, 'members')`
  - Handle unlimited (Breakout plan): skip check if limit is `Infinity` or -1
  - If `blocked_200`: throw TRPCError
  - If `shouldSendEmail`: trigger warning email job

**Frontend - Files:** Billing page components

- [ ] Verify `memberUsage` and `memberLimit` available from `useUsage()`
- [ ] Add `MemberUsageSummary` using `UsageMetricCard`
- [ ] Show "unlimited" for Breakout plan

**Testing**

- [ ] Test member invite at limit boundary
- [ ] Test unlimited behavior on Breakout plan
- [ ] Test warning email triggered

---

### 4.3 Links Enforcement

**Backend - Files:** `packages/lib/src/trpc/routes/link.route.ts`

- [ ] In `create` mutation, before insert:
  - Call `checkUsageLimit(ctx.workspace.id, 'links')`
  - If `blocked_200`: throw TRPCError
  - If `shouldSendEmail`: trigger warning email job
- [ ] After successful insert:
  - Call `incrementUsage(ctx.workspace.id, 'links', 1)`
- [ ] Update `getUsageCount` for links:
  - Count from Links table WHERE `createdAt` within billing cycle AND `workspaceId` matches

**Frontend - Files:** Billing page components

- [ ] Verify `LinkUsageSummary` displays correctly with threshold colors

**Testing**

- [ ] Test link creation at limit boundaries
- [ ] Test billing cycle reset resets link count

---

### 4.4 Email Sending Enforcement

**Backend - Files:** Locate email/campaign sending route

- [ ] Before sending emails:
  - Call `checkUsageLimit(ctx.workspace.id, 'emails', recipientCount)`
  - If `blocked_200`: throw TRPCError
  - If `shouldSendEmail`: trigger warning email job
- [ ] After successful send:
  - Call `incrementUsage(ctx.workspace.id, 'emails', recipientCount)`

**Frontend - Files:** Billing page components

- [ ] Add `EmailUsageSummary` using `UsageMetricCard`

**Testing**

- [ ] Test email send at limit boundaries
- [ ] Test bulk email blocking when would exceed 200%

---

### 4.5 Event Tracking Enforcement

**Backend - Files:** Locate analytics/event tracking endpoint

- [ ] Before tracking events:
  - Call `checkUsageLimit(ctx.workspace.id, 'events', eventCount)`
  - If `blocked_200`: block tracking (return error or silently drop)
  - If `shouldSendEmail`: trigger warning email job
- [ ] After successful tracking:
  - Call `incrementUsage(ctx.workspace.id, 'events', eventCount)`

**Frontend - Files:** Billing page components

- [ ] Add `EventUsageSummary` using `UsageMetricCard`

**Testing**

- [ ] Test event tracking at limit boundaries

---

### 4.6 Tasks Enforcement

**Backend - Files:** Locate task creation route

- [ ] Before creating task:
  - Call `checkUsageLimit(ctx.workspace.id, 'tasks')`
  - If `blocked_200`: throw TRPCError
  - If `shouldSendEmail`: trigger warning email job
- [ ] After successful creation:
  - Call `incrementUsage(ctx.workspace.id, 'tasks', 1)`

**Frontend - Files:** Billing page components

- [ ] Add `TaskUsageSummary` using `UsageMetricCard`

**Testing**

- [ ] Test task creation at limit boundaries

---

### 4.7 File Storage Enforcement

**Backend - Files:** Locate file upload route/function

- [ ] Before upload:
  - Get file size in bytes
  - Call `checkUsageLimit(ctx.workspace.id, 'storage', fileSizeBytes)`
  - If `blocked_200`: throw TRPCError
  - If `shouldSendEmail`: trigger warning email job
- [ ] After successful upload:
  - Call `incrementUsage(ctx.workspace.id, 'storage', fileSizeBytes)`
  - Update both `fileUsage_total` and `fileUsage_billingCycle`

**Frontend - Files:** Billing page components

- [ ] Add `StorageUsageSummary` using `UsageMetricCard`
- [ ] Display in MB format (convert from bytes)

**Testing**

- [ ] Test file upload at limit boundaries

---

### 4.8 Retargeting Pixels Enforcement

**Backend - Files:** Locate pixel creation route

- [ ] Before creating pixel:
  - Call `checkUsageLimit(ctx.workspace.id, 'pixels')`
  - Special case: Free plan has limit of 0 → block immediately
  - If `blocked_200`: throw TRPCError
  - If `shouldSendEmail`: trigger warning email job
- [ ] Note: Pixels are cumulative, no increment needed (counted from table)

**Frontend - Files:** Billing page components

- [ ] Add `PixelUsageSummary` using `UsageMetricCard`
- [ ] Show "Not available on Free plan" when limit is 0

**Testing**

- [ ] Test Free plan pixel creation (should block immediately)
- [ ] Test paid plan pixel creation at limits

---

### 4.9 Link Clicks Enforcement

**Backend - Files:** Locate click tracking endpoint

- [ ] Before recording click:
  - Call `checkUsageLimit(ctx.workspace.id, 'clicks')`
  - If `blocked_200`: may silently drop or show error depending on UX decision
  - If `shouldSendEmail`: trigger warning email job
- [ ] After recording:
  - Increment click counter (if separate from analytics events)

**Frontend - Files:** Billing page components

- [ ] Verify click tracking displays in `UsageMetricCard`

**Testing**

- [ ] Test click tracking at limit boundaries

---

### 4.10 Invoice Enforcement Enhancement

**Backend - Files:** `packages/lib/src/functions/invoice.fns.ts`

- [ ] Refactor `checkInvoiceUsageAndIncrement` to use new `checkUsageLimit` utility
- [ ] Add warning email dispatch:
  - If `shouldSendEmail`: trigger `send-usage-warning-email` job
- [ ] Maintain backward compatibility with existing error messages
- [ ] Ensure 200% hard block behavior matches other resources

**Frontend - Files:** Billing page components

- [ ] Verify `InvoiceUsageSummary` displays with threshold colors

**Testing**

- [ ] Test invoice creation triggers warnings at 80%, 100%
- [ ] Test hard block at 200%
- [ ] Verify existing functionality not broken

---

## Milestone 5: Billing Cycle Management

**Depends on:** Milestone 1 (schema)
**Can run in parallel with:** Milestones 2-4

This milestone ensures usage resets properly on billing cycle boundaries.

### 5.1 Billing Cycle Reset Logic

**Files:** `packages/lib/src/trigger/workspace-usage.ts`

- [ ] Review existing `resetWorkspaceUsage` job
- [ ] Modify to process each workspace individually based on `billingCycleStart`:
  - Query workspaces where today is their cycle reset day
  - For each: reset monthly counters
- [ ] Reset monthly counters:
  - `linkUsage` → 0
  - `emailUsage` → 0
  - `eventUsage` → 0
  - `taskUsage` → 0
  - `invoiceUsage` → 0
  - `fileUsage_billingCycle` → 0
- [ ] Reset `usageWarnings` JSONB → `{}`
- [ ] Do NOT reset cumulative counters:
  - `fanUsage` (total fans, not monthly)
  - `memberUsage` (current members)
  - `pixelUsage` (current pixels)
  - `fileUsage_total` (total storage ever)

### 5.2 Self-Healing in Enforcement

**Files:** `packages/lib/src/functions/usage.fns.ts`

- [ ] In `checkUsageLimit`, add billing cycle detection:
  - Get current billing cycle boundaries from `getFirstAndLastDayOfBillingCycle(workspace.billingCycleStart)`
  - If `usageWarnings` contains timestamps from previous cycle: reset it
  - If monthly usage counter seems stale (optional heuristic): trigger reset

### 5.3 Billing Cycle Testing

- [ ] Test billing cycle rollover behavior
- [ ] Test that warning flags reset on new cycle
- [ ] Test that monthly counters reset
- [ ] Test that cumulative counters do NOT reset
- [ ] Test self-healing when counters are stale

---

## Implementation Order Summary

For a solo developer, the recommended order is:

1. **Milestone 1: Foundation** (required first)
2. **Milestone 3.1-3.2: Upgrade Flow** (enables revenue immediately)
3. **Milestone 2: Warning Emails** (enables enforcement)
4. **Milestone 3.3-3.5: Billing Dashboard** (user visibility)
5. **Milestone 4: Resource Enforcement** (one at a time, start with highest-impact: fans, links, emails)
6. **Milestone 5: Billing Cycle** (can be done anytime after M1)

This order prioritizes:
- Unlocking revenue (Stripe fix) as early as possible
- Protecting highest-cost resources first
- Providing user transparency before enforcement

---

## Quick Reference: Files Changed

| Milestone | Key Files |
|-----------|-----------|
| M1 | `workspace.sql.ts`, `workspace-plans.constants.ts`, `usage.fns.ts` (new) |
| M2 | `usage-warning-80.tsx` (new), `usage-warning-100.tsx` (new), `usage-blocked-200.tsx` (new), `usage-warning-email.ts` (new) |
| M3 | `workspace-stripe.route.ts`, `use-usage.ts`, billing page components |
| M4 | `fan.route.ts`, `link.route.ts`, `workspace-invite.route.ts`, `invoice.fns.ts`, + other route files |
| M5 | `workspace-usage.ts`, `usage.fns.ts` |
