# Project Context: Barely Invoice MVP

## Current Development
Working on: Dead-simple invoicing tool for freelancers enabling 60-second invoice creation with Stripe payments
Deadline: 2025-08-31 (2.5 weeks - overnight MVP approach)

## Key Files in This Worktree
- `.claude/project/PRD.md` - Full product requirements
- `.claude/project/plan-organized.md` - Implementation checklist by feature
- `.claude/project/JTBD.md` - Jobs to be done analysis
- `.claude/project/feature.md` - Feature overview and rationale
- `.claude/project/original/invoicing-mvp-prd.md` - Original PRD with recurring billing vision

## Current Focus
Start with Feature 0: Core App Infrastructure & Database Foundation
- Set up the invoice app variant
- Create core database tables
- Configure app routing and environment

## Key Technical Decisions
1. **App Variant Architecture**: Use existing pattern (like fm/vip apps) for focused interface
2. **Database Design**: Workspace-scoped tables with soft deletes
3. **Payment Processing**: Leverage existing Stripe Connect per workspace
4. **Public Routes**: Payment pages using established patterns
5. **Email Delivery**: SendGrid transactional API
6. **Status Tracking**: Event-driven via webhooks
7. **Invoice Numbers**: Format `INV-{workspacePrefix}-{number}`

## Success Criteria
- Invoice creation time: <60 seconds average
- Payment collection time: <7 days average  
- 80% user activation rate (send first invoice within 24 hours)
- Week 1: 1 paid invoice through system
- Month 1: 10 paying users, $190 MRR

## Implementation Order
1. Feature 0: Core App Infrastructure & Database Foundation
2. Feature 1: Client Management
3. Feature 2: Invoice Creation & Management
4. Feature 3: Payment Collection & Processing
5. Feature 4: Invoice Delivery & Status Tracking
6. Feature 5: Dashboard & Analytics
7. Feature 6: Security & Performance Optimization

## Quick Start
1. This worktree is focused on implementing the Barely Invoice MVP
2. All project artifacts are in .claude/project/
3. Start with the organized plan in .claude/project/plan-organized.md
4. Original project docs: 0_Projects/barely-invoice-mvp/

## Dependencies
- Bio MVP workspace system (must be operational)
- Existing Stripe Connect infrastructure
- SendGrid for transactional emails
- Shared UI component library