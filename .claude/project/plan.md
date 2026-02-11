# Technical Implementation Plan: Usage Protection & Monetization

## Feature Summary

Implement tiered usage enforcement (80%/100%/200% thresholds) across all 10 resource types, fix the broken Stripe upgrade path by configuring production price IDs, and expand the billing dashboard to show complete usage visibility. The system will follow the existing invoice enforcement pattern (`checkInvoiceUsageAndIncrement`) as the template for all new enforcement points.

---

## Architecture Overview

### Components Affected

| Component | Package | Changes |
|-----------|---------|---------|
| Plan Constants | `@barely/const` | Add Stripe production IDs, remove deprecated plans |
| Database Schema | `@barely/db` | Add `eligibleForPlus`, `usageWarnings` fields |
| Usage Functions | `@barely/lib` | New enforcement utility, extend existing patterns |
| tRPC Routes | `@barely/lib` | Add enforcement checks to 9 additional routes |
| Email Templates | `@barely/email` | Create 3 warning email templates |
| Usage Hooks | `@barely/hooks` | Extend `useUsage()` with all metrics |
| Billing UI | `apps/app` | Expand usage dashboard, fix Plus plan buttons |
| Background Jobs | `@barely/lib/trigger` | Warning email dispatch jobs |

### Data Flow

```
User Action → tRPC Route → checkUsageLimit() →
  ├─ OK → Proceed with action
  ├─ WARNING_80 → Proceed + Queue warning email (if not sent this cycle)
  ├─ WARNING_100 → Proceed + Queue warning email (if not sent this cycle)
  └─ BLOCKED_200 → Throw TRPCError + Queue block email (if not sent this cycle)
```

### Key Files

| File | Purpose |
|------|---------|
| `packages/const/src/workspace-plans.constants.ts` | Plan definitions, Stripe IDs |
| `packages/db/src/sql/workspace.sql.ts` | Workspace schema with usage fields |
| `packages/lib/src/functions/usage.fns.ts` | New enforcement utility (to create) |
| `packages/lib/src/functions/invoice.fns.ts` | Existing enforcement pattern (template) |
| `packages/hooks/src/use-usage.ts` | Frontend usage data hook |
| `apps/app/src/app/[handle]/settings/billing/` | Billing UI components |

---

## Key Technical Decisions

### 1. Enforcement Utility Design
**Decision**: Create a single `checkUsageLimit()` function that handles all resource types with tiered responses.

**Rationale**:
- Reduces code duplication across 10 enforcement points
- Centralizes threshold logic (80/100/200)
- Makes it easy to adjust thresholds globally
- Follows DRY principle

### 2. Warning Email Deduplication
**Decision**: Store sent warnings in a JSONB field (`usageWarnings`) on workspace, keyed by `{resourceType}_{threshold}`.

**Rationale**:
- Single field vs. 30+ boolean fields (10 resources × 3 thresholds)
- Easy to reset on billing cycle change
- Queryable for analytics
- Flexible schema for future threshold changes

### 3. Usage Counting Strategy
**Decision**: Count from database (like invoice pattern) rather than relying solely on increment counters.

**Rationale**:
- More accurate (counters can drift)
- Self-healing on billing cycle transitions
- Consistent with existing invoice enforcement

### 4. Billing Cycle Awareness
**Decision**: Use workspace's `billingCycleStart` field to determine current cycle boundaries.

**Rationale**:
- Already implemented in `getFirstAndLastDayOfBillingCycle()`
- Per-workspace cycle dates (not global reset)
- Consistent with existing invoice logic

### 5. Plus Plan Gating
**Decision**: Add `eligibleForPlus` boolean to workspace schema; check in frontend before showing upgrade button.

**Rationale**:
- Simple boolean flag vs. complex eligibility rules
- Can be set manually by admin after consultation call
- Clear separation between DIY and Plus upgrade flows

---

## Dependencies & Assumptions

### External Dependencies
- **Stripe**: Production price IDs already created and provided
- **Resend**: Email service configured and working
- **Trigger.dev**: Background job infrastructure exists

### Internal Dependencies
- Existing `checkInvoiceUsageAndIncrement()` pattern in `invoice.fns.ts`
- Existing `useUsage()` hook in `@barely/hooks`
- Existing billing page components in `apps/app`
- Existing email sending via `@barely/email`

### Assumptions
- All workspaces have a valid `plan` field (defaulted to 'free')
- All workspaces have a `billingCycleStart` field (defaulted)
- No existing workspaces are on deprecated 'agency' or 'pro' plans
- Current usage counters are approximately accurate

---

## Implementation Checklist

### Feature 1: Foundation & Configuration

This feature establishes the data model and configuration needed for all other features.

#### 1.1 Database Schema Changes
- [ ] Add `eligibleForPlus` boolean field to workspace schema (default: false)
- [ ] Add `usageWarnings` JSONB field to workspace schema (default: empty object)
- [ ] Add `fanUsage` integer field to workspace schema (default: 0) if not exists
- [ ] Add `memberUsage` integer field to workspace schema if not exists
- [ ] Add `pixelUsage` integer field to workspace schema if not exists
- [ ] Add `taskUsage` integer field to workspace schema if not exists
- [ ] Generate and run database migration

#### 1.2 Plan Constants Updates
- [ ] Update `bedroom` plan with production Stripe IDs:
  - productId: `prod_Txeo2HSM6HnJx4`
  - monthly: `price_1SzjV0HDMmzntRhpvQKmHeC8`
  - yearly: `price_1SzjVSHDMmzntRhpiwbdyqbv`
- [ ] Update `rising` plan with production Stripe IDs:
  - productId: `prod_TxevMytIBe6fon`
  - monthly: `price_1SzjbtHDMmzntRhprcbxD20W`
  - yearly: `price_1SzjcCHDMmzntRhpAZVE4aig`
- [ ] Update `breakout` plan with production Stripe IDs:
  - productId: `prod_TxeweGMPwBFeVm`
  - monthly: `price_1Szjd0HDMmzntRhpQzAUpny0`
  - yearly: `price_1SzjdNHDMmzntRhpE3gZv0CW`
- [ ] Update `bedroom.plus` plan with production Stripe IDs:
  - productId: `prod_Txey7RdoUEQFHi`
  - monthly: `price_1SzjeVHDMmzntRhpOy4yrqcW`
  - yearly: `price_1SzjemHDMmzntRhp0CXxI518`
- [ ] Update `rising.plus` plan with production Stripe IDs:
  - productId: `prod_TxezRHktqwlWKI`
  - monthly: `price_1SzjfOHDMmzntRhpIItqCV70`
  - yearly: `price_1SzjfgHDMmzntRhpAfaEeT4Y`
- [ ] Update `breakout.plus` plan with production Stripe IDs:
  - productId: `prod_Txf0wBNF8ZpgfR`
  - monthly: `price_1SzjgKHDMmzntRhpSSD7gNdz`
  - yearly: `price_1SzjgdHDMmzntRhpe1YEe9Wu`
- [ ] Update `invoice.pro` plan with production Stripe IDs:
  - productId: `prod_Txf4YDcKhcTd0G`
  - monthly: `price_1SzjkhHDMmzntRhpufIFDzh4`
  - yearly: `price_1SzjksHDMmzntRhp7fan3dl1`
- [ ] Remove `agency` plan from WORKSPACE_PLANS map
- [ ] Remove `pro` plan from WORKSPACE_PLANS map
- [ ] Remove 'agency' and 'pro' from WORKSPACE_PLAN_TYPES array
- [ ] Update any TypeScript types that reference removed plans

#### 1.3 Core Enforcement Utility
- [ ] Create `packages/lib/src/functions/usage.fns.ts`
- [ ] Define `UsageLimitType` enum: `'fans' | 'members' | 'pixels' | 'links' | 'clicks' | 'emails' | 'events' | 'tasks' | 'storage' | 'invoices'`
- [ ] Define `UsageStatus` enum: `'ok' | 'warning_80' | 'warning_100' | 'blocked_200'`
- [ ] Implement `getUsageCount(workspaceId, limitType)` - returns current usage count from DB
- [ ] Implement `getUsageLimit(workspace, limitType)` - returns limit considering overrides
- [ ] Implement `checkUsageLimit(workspaceId, limitType, incrementBy?)` returning:
  ```typescript
  {
    status: UsageStatus;
    current: number;
    limit: number;
    percentage: number;
    shouldSendEmail: boolean;
    upgradeUrl: string;
  }
  ```
- [ ] Implement `incrementUsage(workspaceId, limitType, amount)` - increments counter
- [ ] Implement `markWarningSent(workspaceId, limitType, threshold)` - updates usageWarnings JSONB
- [ ] Implement `hasWarningSent(workspace, limitType, threshold)` - checks usageWarnings JSONB
- [ ] Write unit tests for threshold calculations (79%, 80%, 100%, 199%, 200%, 201%)

#### 1.4 Foundation Testing
- [ ] Test that Stripe IDs resolve correctly in test vs production environments
- [ ] Test that deprecated plans are fully removed from type system
- [ ] Test that new schema fields are accessible via Drizzle ORM

---

### Feature 2: Warning Email System

This feature implements the email notification system for usage warnings.

#### 2.1 Email Templates
- [ ] Create `packages/email/src/templates/usage-warning-80.tsx` template:
  - Props: `resourceType`, `currentUsage`, `limit`, `workspaceName`, `upgradeUrl`
  - Subject: "You're approaching your {resource} limit on Barely"
  - Tone: Informative, helpful
  - Include upgrade CTA button
- [ ] Create `packages/email/src/templates/usage-warning-100.tsx` template:
  - Props: `resourceType`, `currentUsage`, `limit`, `workspaceName`, `upgradeUrl`
  - Subject: "You've reached your {resource} limit on Barely"
  - Tone: Urgent but not alarming
  - Explain grace period (can continue until 200%)
  - Include upgrade CTA button
- [ ] Create `packages/email/src/templates/usage-blocked-200.tsx` template:
  - Props: `resourceType`, `currentUsage`, `limit`, `workspaceName`, `upgradeUrl`
  - Subject: "{Resource} paused on your Barely workspace"
  - Tone: Clear, actionable
  - Explain what's blocked and how to unblock
  - Include prominent upgrade CTA
- [ ] Export all templates from `packages/email/src/index.ts`

#### 2.2 Email Dispatch Function
- [ ] Create `sendUsageWarningEmail(workspaceId, limitType, threshold)` in `usage.fns.ts`
- [ ] Fetch workspace owner email from database
- [ ] Select appropriate template based on threshold
- [ ] Call `sendEmail()` with 'transactional' type
- [ ] Mark warning as sent via `markWarningSent()`

#### 2.3 Background Job for Email Queue
- [ ] Create `packages/lib/src/trigger/usage-warning-email.ts`
- [ ] Define Trigger.dev task `send-usage-warning-email`
- [ ] Accept payload: `{ workspaceId, limitType, threshold }`
- [ ] Call `sendUsageWarningEmail()` within job

#### 2.4 Email System Testing
- [ ] Test email rendering for all 3 templates
- [ ] Test that emails are only sent once per threshold per billing cycle
- [ ] Test email deduplication via `usageWarnings` field

---

### Feature 3: Fans/Contacts Enforcement

Enforce limits on fan/contact creation.

#### 3.1 Backend - Fan Enforcement
- [ ] In `packages/lib/src/trpc/routes/fan.route.ts`, `create` mutation:
  - Call `checkUsageLimit(workspaceId, 'fans')` before insert
  - If `blocked_200`: throw TRPCError with upgrade message
  - If `warning_80` or `warning_100` and `shouldSendEmail`: queue warning email
  - After successful insert: call `incrementUsage(workspaceId, 'fans', 1)`
- [ ] In `fan.route.ts`, `importFromCsv` mutation:
  - Before import: check `checkUsageLimit(workspaceId, 'fans', csvRowCount)`
  - Block entire import if would exceed 200%
  - Warning if would approach/exceed 100%

#### 3.2 Frontend - Fan Usage Display
- [ ] Add fan count query to billing page data fetching
- [ ] Create `FanUsageSummary` component following `LinkUsageSummary` pattern
- [ ] Display current count / limit with progress bar
- [ ] Color coding: green (<80%), yellow (80-100%), red (>100%)

#### 3.3 Fan Enforcement Testing
- [ ] Test fan creation at 79%, 80%, 100%, 200% of limit
- [ ] Test CSV import blocking at limit
- [ ] Test warning email dispatch

---

### Feature 4: Team Members Enforcement

Enforce limits on workspace member invitations.

#### 4.1 Backend - Member Enforcement
- [ ] In `packages/lib/src/trpc/routes/workspace-invite.route.ts`, `inviteMember` mutation:
  - Count current workspace members from `_workspaceMembers` table
  - Call `checkUsageLimit(workspaceId, 'members')` before creating invite
  - If `blocked_200`: throw TRPCError with upgrade message
  - If `warning_80` or `warning_100` and `shouldSendEmail`: queue warning email
- [ ] Handle "unlimited" members for Breakout plan (check for -1 or MAX_INT)

#### 4.2 Frontend - Member Usage Display
- [ ] Add member count to `useUsage()` hook return
- [ ] Create `MemberUsageSummary` component
- [ ] Show "X of Y members" or "X members (unlimited)" for Breakout

#### 4.3 Member Enforcement Testing
- [ ] Test member invite at limit boundary
- [ ] Test unlimited plan behavior

---

### Feature 5: Links Enforcement

Enforce limits on link creation per month.

#### 5.1 Backend - Link Enforcement
- [ ] In `packages/lib/src/trpc/routes/link.route.ts`, `create` mutation:
  - Call `checkUsageLimit(workspaceId, 'links')` before insert
  - If `blocked_200`: throw TRPCError
  - Queue warning email if applicable
  - Increment `linkUsage` counter after successful creation
- [ ] Update `getUsageCount` for links to count from Links table WHERE createdAt within billing cycle

#### 5.2 Frontend - Link Usage Display
- [ ] Verify `LinkUsageSummary` component exists and works
- [ ] Add threshold-based color coding if not present

#### 5.3 Link Enforcement Testing
- [ ] Test link creation at limit boundaries
- [ ] Test billing cycle reset behavior

---

### Feature 6: Email Sending Enforcement

Enforce limits on emails sent per month.

#### 6.1 Backend - Email Enforcement
- [ ] Locate email sending route/function (likely in campaign or email routes)
- [ ] Before sending: call `checkUsageLimit(workspaceId, 'emails', emailCount)`
- [ ] Block if at 200%
- [ ] Queue warning if at 80% or 100%
- [ ] Increment `emailUsage` after successful send

#### 6.2 Frontend - Email Usage Display
- [ ] Add email usage to `useUsage()` hook
- [ ] Create `EmailUsageSummary` component
- [ ] Display emails sent this month / limit

#### 6.3 Email Enforcement Testing
- [ ] Test email send at limit boundaries
- [ ] Test bulk email blocking

---

### Feature 7: Event Tracking Enforcement

Enforce limits on tracked events per month.

#### 7.1 Backend - Event Enforcement
- [ ] Locate event tracking endpoint (likely Tinybird or analytics route)
- [ ] Before tracking: call `checkUsageLimit(workspaceId, 'events', eventCount)`
- [ ] Block if at 200%
- [ ] Queue warning if applicable
- [ ] Increment `eventUsage` counter

#### 7.2 Frontend - Event Usage Display
- [ ] Add event usage to `useUsage()` hook
- [ ] Create `EventUsageSummary` component

#### 7.3 Event Enforcement Testing
- [ ] Test event tracking at limit boundaries

---

### Feature 8: Tasks Enforcement

Enforce limits on task creation per month.

#### 8.1 Backend - Task Enforcement
- [ ] Locate task creation route
- [ ] Before creation: call `checkUsageLimit(workspaceId, 'tasks')`
- [ ] Block if at 200%
- [ ] Queue warning if applicable
- [ ] Increment `taskUsage` counter

#### 8.2 Frontend - Task Usage Display
- [ ] Add task usage to `useUsage()` hook
- [ ] Create `TaskUsageSummary` component

#### 8.3 Task Enforcement Testing
- [ ] Test task creation at limit boundaries

---

### Feature 9: File Storage Enforcement

Enforce limits on file storage.

#### 9.1 Backend - Storage Enforcement
- [ ] Locate file upload route/function
- [ ] Before upload: call `checkUsageLimit(workspaceId, 'storage', fileSizeBytes)`
- [ ] Block if at 200%
- [ ] Queue warning if applicable
- [ ] Increment `fileUsage_total` and `fileUsage_billingCycle`

#### 9.2 Frontend - Storage Usage Display
- [ ] Add storage usage to `useUsage()` hook
- [ ] Create `StorageUsageSummary` component
- [ ] Display as "X MB of Y MB used"

#### 9.3 Storage Enforcement Testing
- [ ] Test file upload at limit boundaries

---

### Feature 10: Retargeting Pixels Enforcement

Enforce limits on retargeting pixel creation.

#### 10.1 Backend - Pixel Enforcement
- [ ] Locate pixel creation route
- [ ] Before creation: call `checkUsageLimit(workspaceId, 'pixels')`
- [ ] Block if at 200% (note: Free plan has 0 pixels allowed)
- [ ] Special handling for Free plan: block at 0
- [ ] Queue warning if applicable

#### 10.2 Frontend - Pixel Usage Display
- [ ] Add pixel count to `useUsage()` hook
- [ ] Create `PixelUsageSummary` component
- [ ] Show "Not available on Free plan" when limit is 0

#### 10.3 Pixel Enforcement Testing
- [ ] Test Free plan pixel creation (should block immediately)
- [ ] Test paid plan pixel creation at limits

---

### Feature 11: Invoice Enforcement Enhancement

Extend existing invoice enforcement with tiered warnings.

#### 11.1 Backend - Invoice Warning Integration
- [ ] Refactor `checkInvoiceUsageAndIncrement` to use new `checkUsageLimit` utility
- [ ] Add warning email dispatch at 80% and 100%
- [ ] Maintain backward compatibility with existing error messages

#### 11.2 Frontend - Invoice Usage Display
- [ ] Verify `InvoiceUsageSummary` component works
- [ ] Add threshold-based color coding

#### 11.3 Invoice Enforcement Testing
- [ ] Test invoice creation triggers warnings at 80%, 100%
- [ ] Test hard block at 200%

---

### Feature 12: Upgrade Flow & Plus Plans

Fix the Stripe upgrade flow and implement Plus plan gating.

#### 12.1 Backend - Upgrade Flow Verification
- [ ] In `workspace-stripe.route.ts`, verify `createCheckoutLink` uses correct environment logic
- [ ] Test that production Stripe IDs are selected in production environment
- [ ] Verify webhook handler `handleStripePlanCheckoutSessionComplete` updates workspace plan correctly

#### 12.2 Frontend - DIY Plan Upgrade Buttons
- [ ] Locate plans page component
- [ ] Verify "Upgrade" buttons for Bedroom, Rising, Breakout call `createCheckoutLink` correctly
- [ ] Test full upgrade flow in test environment

#### 12.3 Frontend - Plus Plan Conditional Flow
- [ ] Add `eligibleForPlus` to workspace query/context
- [ ] In plans page, for Plus plans (Bedroom+, Rising+, Breakout+):
  - If `eligibleForPlus === false`: render "Apply" button linking to `https://cal.com/barely/nyc`
  - If `eligibleForPlus === true`: render standard "Upgrade" button
- [ ] Style "Apply" button distinctly (different color or outline style)

#### 12.4 Upgrade Flow Testing
- [ ] Test DIY plan upgrade end-to-end (Free → Bedroom)
- [ ] Test Plus plan "Apply" button links correctly
- [ ] Test Plus plan upgrade when eligible
- [ ] Test webhook updates workspace plan after payment

---

### Feature 13: Billing Dashboard Expansion

Expand billing page to show all usage metrics.

#### 13.1 Frontend - Usage Hook Enhancement
- [ ] In `packages/hooks/src/use-usage.ts`, add to return object:
  - `fanUsage` and `fanLimit`
  - `memberUsage` and `memberLimit`
  - `pixelUsage` and `pixelLimit`
  - `emailUsage` and `emailLimit`
  - `eventUsage` and `eventLimit`
  - `taskUsage` and `taskLimit`
  - `storageUsage` and `storageLimit`
- [ ] Fetch additional usage data from workspace query

#### 13.2 Frontend - Billing Page Components
- [ ] Create generic `UsageMetricCard` component with:
  - Props: `label`, `current`, `limit`, `unit?`
  - Progress bar with threshold coloring
  - Percentage display
- [ ] Refactor existing `LinkUsageSummary` and `InvoiceUsageSummary` to use `UsageMetricCard`
- [ ] Add all 10 usage metrics to billing page layout
- [ ] Add billing cycle date display prominently

#### 13.3 Frontend - Upgrade Prompts
- [ ] Show contextual upgrade CTA when any metric is >80%
- [ ] Link to plans page with relevant plan highlighted

#### 13.4 Billing Dashboard Testing
- [ ] Test all 10 metrics display correctly
- [ ] Test progress bar colors at each threshold
- [ ] Test responsive layout

---

### Feature 14: Usage Reset on Billing Cycle

Ensure usage counters reset properly on billing cycle boundaries.

#### 14.1 Backend - Billing Cycle Reset Logic
- [ ] Review `resetWorkspaceUsage` trigger job
- [ ] Modify to reset based on individual workspace `billingCycleStart` dates
- [ ] Reset `usageWarnings` JSONB field on cycle change
- [ ] Ensure monthly counters reset: `linkUsage`, `emailUsage`, `eventUsage`, `taskUsage`, `invoiceUsage`, `fileUsage_billingCycle`
- [ ] Do NOT reset cumulative counters: `fanUsage`, `memberUsage`, `pixelUsage`, `fileUsage_total`

#### 14.2 Backend - Cycle Boundary Detection
- [ ] In `checkUsageLimit`, detect if we've crossed into new billing cycle
- [ ] If in new cycle but counters not reset: self-heal by resetting

#### 14.3 Reset Testing
- [ ] Test billing cycle rollover behavior
- [ ] Test warning flags reset on new cycle

---

## Appendix: File Reference

| File Path | Changes |
|-----------|---------|
| `packages/const/src/workspace-plans.constants.ts` | Add Stripe IDs, remove deprecated plans |
| `packages/db/src/sql/workspace.sql.ts` | Add `eligibleForPlus`, `usageWarnings`, usage fields |
| `packages/lib/src/functions/usage.fns.ts` | New file - enforcement utility |
| `packages/lib/src/functions/invoice.fns.ts` | Refactor to use new utility |
| `packages/lib/src/trpc/routes/fan.route.ts` | Add enforcement |
| `packages/lib/src/trpc/routes/link.route.ts` | Add enforcement |
| `packages/lib/src/trpc/routes/workspace-invite.route.ts` | Add enforcement |
| `packages/lib/src/trpc/routes/workspace-stripe.route.ts` | Verify upgrade flow |
| `packages/lib/src/trigger/usage-warning-email.ts` | New file - email job |
| `packages/lib/src/trigger/workspace-usage.ts` | Update reset logic |
| `packages/email/src/templates/usage-warning-80.tsx` | New template |
| `packages/email/src/templates/usage-warning-100.tsx` | New template |
| `packages/email/src/templates/usage-blocked-200.tsx` | New template |
| `packages/hooks/src/use-usage.ts` | Extend with all metrics |
| `apps/app/src/app/[handle]/settings/billing/` | Expand usage display |
| `apps/app/src/app/[handle]/settings/billing/billing-summary.tsx` | Add metric components |
