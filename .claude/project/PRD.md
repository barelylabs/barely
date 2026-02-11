# Product Requirements Document: Usage Protection & Monetization

## Document Info

| Field | Value |
|-------|-------|
| Feature Name | Usage Protection & Monetization |
| Author | Product Team |
| Created | 2026-02-11 |
| Status | Ready for Implementation |
| Priority | P0 - Critical |

---

## Executive Summary

Barely is experiencing organic user growth (50 sign-ups/month, up from 1-2) but cannot monetize this growth because the upgrade path is broken and usage limits aren't enforced. This feature implements tiered usage enforcement across all resource types, fixes the paid plan upgrade flow, and gives users full visibility into their usage.

**Business Impact**:
- Protect against rising infrastructure costs (database costs 4x'd in 2 months)
- Enable revenue capture from users who want to pay but currently can't
- Create sustainable unit economics as the platform grows

---

## Problem Statement

### Current Situation
- Users on free plans can use effectively unlimited resources
- Infrastructure costs are rising without corresponding revenue
- Upgrade flow throws errors in production (Stripe IDs are placeholders)
- Users have limited visibility into their usage (only 2 of 10 metrics shown)

### Impact
- **Financial**: Database costs quadrupled; no revenue offset
- **Operational**: No protection against abuse or runaway usage
- **User Experience**: Users who want to upgrade cannot; no usage transparency

### Evidence
- 50 new sign-ups/month since November (legitimate users)
- Neon database bill increased 4x in December/January
- Production upgrade flow fails with 'fixme' price ID errors

---

## Goals & Success Metrics

### Primary Goals

| Goal | Success Metric | Target |
|------|----------------|--------|
| Protect infrastructure costs | Cost growth correlates with revenue | Costs stable or tied to conversions |
| Enable monetization | Paid subscriptions | >0 paying customers |
| Provide usage transparency | Users can see all usage metrics | 100% of limits visible |
| Graceful limit enforcement | Users warned before blocked | 100% get warnings at 80%, 100% |

### Non-Goals
- Admin dashboard for platform-wide usage monitoring (future)
- Automatic plan downgrades for non-payment (future)
- Per-minute/hour rate limiting (future)
- Usage trends/analytics over time (future)

---

## User Segments & Jobs to Be Done

### Segment 1: Free Tier Artists
**Primary Jobs:**
- Understand how much of their plan they're using
- Get warned before hitting limits
- Upgrade seamlessly when they need more capacity

### Segment 2: Growth-Stage Artists
**Primary Jobs:**
- Compare plans to choose the right tier
- Upgrade quickly to continue growing
- Access Plus plans with coaching (via application)

### Segment 3: Barely Team (Internal)
**Primary Jobs:**
- Protect infrastructure from runaway costs
- Convert free users to paying customers
- Maintain sustainable unit economics

---

## Requirements

### Functional Requirements

#### FR-1: Tiered Usage Enforcement

**Description**: Implement a three-tier warning and enforcement system for all resource limits.

| Threshold | Behavior | Notification |
|-----------|----------|--------------|
| 80% of limit | Soft warning | In-app banner + email with upgrade CTA |
| 100% of limit | Stern warning | Prominent in-app warning + email, action still allowed |
| 200% of limit | Hard block | Action blocked, email about pause, upgrade required |

**Limits to Enforce:**

| Resource | Enforcement Point |
|----------|-------------------|
| Fans/contacts | Fan creation |
| Team members | Member invitation |
| Retargeting pixels | Pixel creation |
| Links/month | Link creation |
| Link clicks/month | Click tracking |
| Emails/month | Email send |
| Events/month | Event tracking |
| Tasks/month | Task creation |
| File storage | File upload |
| Invoices/month | Invoice creation (extend existing) |

**Email Frequency**: One email per threshold per billing cycle (prevents spam).

**Acceptance Criteria:**
- [ ] Each of the 10 resource types has enforcement at all three thresholds
- [ ] Warning emails are sent at 80% and 100% (once per billing cycle)
- [ ] Actions are blocked at 200% with clear upgrade messaging
- [ ] Enforcement respects plan-specific limits (Free vs Bedroom vs Rising vs Breakout)

---

#### FR-2: Working Upgrade Path

**Description**: Fix the broken upgrade flow so users can actually pay for higher tiers.

**DIY Plans (Bedroom, Rising, Breakout, Invoice Pro):**
1. User clicks "Upgrade" button
2. System creates Stripe Checkout session with correct price ID
3. User completes payment on Stripe
4. Webhook updates workspace plan
5. User immediately has access to higher limits

**Plus Plans (Bedroom+, Rising+, Breakout+):**
Conditional flow based on `eligibleForPlus` workspace flag:

| Condition | Button Text | Action |
|-----------|-------------|--------|
| `eligibleForPlus = false` | "Apply" | Opens cal.com/barely/nyc |
| `eligibleForPlus = true` | "Upgrade" | Standard Stripe Checkout |

**Stripe Production IDs to Configure:**

| Plan | Product ID | Monthly Price | Yearly Price |
|------|------------|---------------|--------------|
| Bedroom | prod_Txeo2HSM6HnJx4 | price_1SzjV0HDMmzntRhpvQKmHeC8 | price_1SzjVSHDMmzntRhpiwbdyqbv |
| Rising | prod_TxevMytIBe6fon | price_1SzjbtHDMmzntRhprcbxD20W | price_1SzjcCHDMmzntRhpAZVE4aig |
| Breakout | prod_TxeweGMPwBFeVm | price_1Szjd0HDMmzntRhpQzAUpny0 | price_1SzjdNHDMmzntRhpE3gZv0CW |
| Bedroom+ | prod_Txey7RdoUEQFHi | price_1SzjeVHDMmzntRhpOy4yrqcW | price_1SzjemHDMmzntRhp0CXxI518 |
| Rising+ | prod_TxezRHktqwlWKI | price_1SzjfOHDMmzntRhpIItqCV70 | price_1SzjfgHDMmzntRhpAfaEeT4Y |
| Breakout+ | prod_Txf0wBNF8ZpgfR | price_1SzjgKHDMmzntRhpSSD7gNdz | price_1SzjgdHDMmzntRhpe1YEe9Wu |
| Invoice Pro | prod_Txf4YDcKhcTd0G | price_1SzjkhHDMmzntRhpufIFDzh4 | price_1SzjksHDMmzntRhp7fan3dl1 |

**Acceptance Criteria:**
- [ ] User can complete upgrade from Free → any DIY plan in production
- [ ] Plus plans show "Apply" button linking to cal.com/barely/nyc when not eligible
- [ ] Plus plans show "Upgrade" button when eligible
- [ ] Webhook correctly updates workspace plan after payment
- [ ] User has immediate access to new limits after upgrade

---

#### FR-3: Usage Dashboard Expansion

**Description**: Extend the billing page to show all usage metrics with visual indicators.

**Current State**: Shows only Invoices Created and Link Clicks

**Required State**: Show all 10 metrics:
- Fans/contacts
- Team members
- Retargeting pixels
- Links created (this month)
- Link clicks (this month)
- Emails sent (this month)
- Events tracked (this month)
- Tasks created (this month)
- File storage used
- Invoices created (this month)

**Visual Design:**
- Progress bar for each metric showing current/limit
- Color coding:
  - Green: < 80% usage
  - Yellow: 80-100% usage
  - Red: > 100% usage
- Billing cycle dates displayed
- "View Plans" CTA for users approaching limits

**Acceptance Criteria:**
- [ ] All 10 usage metrics visible on billing page
- [ ] Progress bars accurately reflect current usage vs plan limit
- [ ] Color coding matches threshold levels
- [ ] Billing cycle dates are displayed
- [ ] Upgrade CTA is visible

---

#### FR-4: Warning Email Templates

**Description**: Create email templates for usage warnings at each threshold.

**80% Warning Email:**
- Subject: "You're approaching your [resource] limit on Barely"
- Content: Current usage, plan limit, upgrade CTA
- Tone: Informative, helpful

**100% Warning Email:**
- Subject: "You've reached your [resource] limit on Barely"
- Content: Current usage, limit reached, upgrade CTA, grace period explanation
- Tone: Urgent but not alarming

**200% Block Email:**
- Subject: "[Resource] paused on your Barely workspace"
- Content: What's blocked, why, how to unblock (upgrade)
- Tone: Clear, actionable

**Acceptance Criteria:**
- [ ] All three email templates created
- [ ] Emails include correct usage numbers and plan limits
- [ ] Upgrade CTA links to plans page
- [ ] Emails are sent only once per threshold per billing cycle

---

#### FR-5: Deprecated Plans Removal

**Description**: Remove `agency` and `pro` plans from the codebase entirely.

**Rationale**: These plans are no longer offered and have placeholder Stripe IDs.

**Acceptance Criteria:**
- [ ] `agency` plan removed from workspace-plans.constants.ts
- [ ] `pro` plan removed from workspace-plans.constants.ts
- [ ] No references to these plans remain in UI
- [ ] Existing workspaces on these plans (if any) are handled gracefully

---

### Non-Functional Requirements

#### NFR-1: Performance
- Usage checks must add < 50ms latency to affected operations
- Billing page must load within 2 seconds

#### NFR-2: Reliability
- Usage tracking must be eventually consistent (minor delays acceptable)
- Upgrade flow must have zero downtime

#### NFR-3: Security
- Stripe webhook signatures must be verified
- Usage data must be workspace-scoped (no cross-workspace access)

---

## User Stories

### US-1: View My Usage
**As a** free tier artist
**I want to** see how much of each resource I'm using
**So that** I can plan my activities and avoid surprises

**Acceptance Criteria:**
- Given I'm on the billing page
- When I view the usage section
- Then I see all 10 usage metrics with current/limit values

---

### US-2: Receive Usage Warning
**As a** free tier artist
**I want to** be notified when I'm approaching my limits
**So that** I can decide whether to upgrade before being blocked

**Acceptance Criteria:**
- Given I'm at 80% of my fan limit
- When I add another fan
- Then I see an in-app warning banner
- And I receive an email (if first warning this cycle)

---

### US-3: Upgrade to Paid Plan
**As a** growth-stage artist
**I want to** upgrade to a higher plan
**So that** I can continue growing without limits

**Acceptance Criteria:**
- Given I'm on the plans page
- When I click "Upgrade" on Bedroom plan
- Then I'm redirected to Stripe Checkout
- And after payment my workspace is on Bedroom plan

---

### US-4: Apply for Plus Plan
**As an** artist interested in coaching
**I want to** apply for a Plus plan
**So that** I can get personalized guidance

**Acceptance Criteria:**
- Given I'm on the plans page
- And my workspace is not eligible for Plus
- When I click "Apply" on Rising+ plan
- Then I'm taken to cal.com/barely/nyc to schedule a call

---

### US-5: Blocked at Hard Limit
**As a** free tier artist at 200% of my limit
**I want to** understand why I'm blocked and how to unblock
**So that** I can continue using the platform

**Acceptance Criteria:**
- Given I'm at 200% of my email limit
- When I try to send an email
- Then I see a clear message explaining the block
- And I see a prominent upgrade CTA
- And I received an email about the pause

---

## Out of Scope

The following are explicitly **not** included in this feature:

- Admin dashboard for viewing all workspace usage across the platform
- Automatic plan downgrade when payment fails
- Usage trends, charts, or historical analytics
- Per-minute or per-hour rate limiting
- Custom limit overrides via UI (DB-only for admin use)
- Proration or mid-cycle upgrade calculations
- Plan downgrade flow (upgrade only for MVP)

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Stripe Production IDs | ✅ Complete | All 7 plans configured |
| Existing usage tracking fields | ✅ Exists | eventUsage, emailUsage, etc. in DB |
| Existing invoice enforcement | ✅ Exists | Pattern to extend |
| Billing page component | ✅ Exists | Extend with more metrics |
| Email infrastructure | ✅ Exists | Use for warning emails |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users angry about new limits | Medium | Medium | Generous limits, clear warnings, grace period to 200% |
| False positive blocks | Low | High | Extensive testing, monitoring, quick override capability |
| Stripe webhook failures | Low | High | Retry logic, manual intervention path |
| Existing high-usage users | Low | Medium | Grandfather period or proactive outreach |

---

## Launch Plan

### Phase 1: Foundation
- Add Stripe production IDs to constants
- Remove deprecated plans
- Add `eligibleForPlus` and `usageWarnings` fields to DB

### Phase 2: Enforcement
- Implement enforcement utility function
- Add enforcement to all 10 resource types
- Create warning email templates

### Phase 3: User Experience
- Expand billing page with all usage metrics
- Implement Plus plan conditional upgrade flow
- End-to-end testing of upgrade path

### Phase 4: Launch
- Deploy to production
- Monitor for issues
- Respond to user feedback

---

## Appendix

### A: Plan Limits Reference

| Limit | Free | Bedroom | Rising | Breakout |
|-------|------|---------|--------|----------|
| Fans | 1,000 | 2,500 | 5,000 | 10,000 |
| Members | 1 | 5 | 10 | Unlimited |
| Pixels | 0 | 1 | 3 | 5 |
| Links/mo | 50 | 1,000 | 5,000 | 25,000 |
| Clicks/mo | 10,000 | 50,000 | 250,000 | 1B |
| Emails/mo | 10,000 | 10,000 | 10,000 | 10,000 |
| Events/mo | 5,000 | 50,000 | 150,000 | 500,000 |
| Tasks/mo | 100 | 2,500 | 5,000 | 10,000 |
| Storage | 200MB | 200MB | 200MB | 200MB |
| Invoices/mo | 3 | 50 | 200 | Unlimited |

### B: Pricing Reference

| Plan | Monthly | Yearly |
|------|---------|--------|
| Bedroom | $30 | $300 ($25/mo) |
| Rising | $90 | $900 ($75/mo) |
| Breakout | $300 | $3,000 ($250/mo) |
| Bedroom+ | Contact | Contact |
| Rising+ | $200 | $2,000 |
| Breakout+ | $1,800 | $18,000 |
| Invoice Pro | $9 | $90 |
