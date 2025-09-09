# Feature: Barely Invoice - Overnight MVP

## Context & Background

### Related Work
- **Builds On**: [[0_Projects/barely-invoice-mvp/invoicing-mvp-prd]] - Full PRD exists
- **Differs From**: Complex PRD - this is the 8-hour buildable version
- **Integrates With**: Existing auth, Stripe, and email infrastructure

### Historical Context
- **Previous Attempts**: Publisher MVP validated agency payment pain
- **Lessons Applied**: Start hyper-minimal, expand based on usage
- **Success Factors**: Reuse everything, build nothing new except invoice logic

## Problem Statement

Freelancers need to send professional invoices and get paid quickly without complex accounting software.

### Evidence of Need
- Your agency manually chasing payments (immediate validation)
- QuickBooks at $30/month is overkill for simple invoicing
- Demonstrates micro-SaaS revenue while platform builds

## Target Users

Freelancers and consultants who:
- Send 5-20 invoices per month
- Want payment in days, not weeks
- Don't need accounting features

### Differentiation from Existing Users
- Not served by barely.ai platform (B2B vs B2C)
- Need invoice/payment flow, not subscription billing
- Professional services vs creative products

## Current State & Pain Points

### How Users Handle This Today
- Manual invoices in Google Docs + payment chase
- QuickBooks ($30/mo) with 10% feature usage
- Wave (free but complex)

### Validated Pain Points
- Creating invoice: 10-15 minutes
- Payment collection: 30+ day average
- No simple recurring option (without Stripe knowledge)

## Recommended Solution

Dead-simple invoice creation and payment collection via Stripe Checkout.

### Why This Approach
- 80% simpler than QuickBooks
- Leverages existing Stripe Checkout (no Connect complexity)
- Can build in 8 hours with existing infrastructure
- Validates before expanding

## Success Criteria

### Week 1
- 1 real invoice paid through system

### Month 1  
- 10 paying customers ($190 MRR)
- <60 second invoice creation
- <7 day payment average

### Month 3
- 100 customers ($1,900 MRR)
- Recurring invoices added IF requested

## Core Functionality (TRUE Overnight MVP)

### Must Have (8 hours)
- Client management (CRUD)
- Create invoice with saved clients
- Line items with automatic totaling
- Send payment link via email
- Accept payment via Stripe Checkout
- Auto-mark paid via webhook
- Basic invoice list view

### Reusable Components
- Magic link auth (existing)
- Email sending via SendGrid (existing)
- Stripe Checkout (simpler than Connect)
- Database/API patterns (existing)

## Out of Scope for Overnight MVP

### Save for Week 2+
- Recurring/subscription invoices
- Client management system
- PDF generation
- Automated reminders
- Templates marketplace
- Workspace/multi-user
- Stripe Connect onboarding

### Never Build
- Expense tracking
- Time tracking  
- Accounting integrations
- Inventory management

## Integration Points

### With Existing Infrastructure
- Auth: Magic links (existing)
- Email: SendGrid (existing)
- Payments: Stripe Checkout (existing)
- Database: Add invoices table only

### Technical Integration
- Extends: Existing Next.js app
- Reuses: Component library, API patterns
- New requirements: Invoice data model only

## Complexity Assessment

**Overall Complexity**: Simple (8 hours)

**Reduced Complexity Through:**
- No workspace system (single user)
- No Stripe Connect (direct checkout)
- No PDF generation (HTML only)
- No recurring logic (one-time only)

**Remaining Complexity:**
- Invoice data model
- Payment page design
- Webhook handling

## Human Review Required

- [ ] Assumption: Freelancers will pay without recurring feature
- [ ] Differentiation: Is "simple" enough vs free Wave?
- [ ] Priority: Should this wait until after Bio MVP ships?

## Technical Considerations

- Two new database tables (invoices, clients)
- 6 new routes (invoices CRUD, clients CRUD, pay, webhook)
- Reuse existing UI components
- Deploy as subdomain or path on existing app
- Simple userId association (no workspaces)

## Migration Path

### From Manual Process
- Import CSV of clients (future)
- Copy/paste from Google Docs

### To Full Version
- Add workspaces when multi-user need emerges
- Add recurring when customers request
- Gradual feature addition based on usage

## Future Possibilities

### Based on Usage Data
- IF recurring heavily requested: Add in week 3
- IF teams need access: Add workspaces
- IF PDF required: Add generation
- Natural evolution toward full PRD vision

## The Claude Code Challenge

**Build Directive for Claude:**
"You have 8 hours. Build only:
1. Client management (create, list, select)
2. Invoice creation with clients and line items
3. Payment link generation via Stripe Checkout
4. Public payment page (/pay/[invoiceId])
5. Webhook to mark paid
6. Basic invoice list view

Two tables: invoices and clients. Use existing auth, Stripe, and email. 
No workspaces, no recurring, no PDF. Ship by morning."