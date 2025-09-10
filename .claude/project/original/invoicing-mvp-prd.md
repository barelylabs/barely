## Go-to-Market Strategy

### Launch Sequence

1. **Week 1-2**: Beta with barely.ai users (50 beta testers)
2. **Week 3-4**: ProductHunt preparation
   - Lifetime deal for first 500 users ($99)
   - Demo video showing 60-second invoice flow
3. **Month 2**: Public launch
   - ProductHunt (aim for top 5)
   - Reddit posts in r/freelance, r/smallbusiness
4. **Month 3+**: Content marketing
   - "QuickBooks alternative" SEO pages
   - Comparison pages vs competitors

### Marketing Positioning

- **Primary**: "So simple it's barely software"
- **Value prop**: "Send invoices in 60 seconds, get paid in days"
- **Differentiator**: Simple recurring billing for building predictable revenue

### Cross-Promotion with Barely Ecosystem

- Banner in barely.cart: "Invoice clients with Barely Invoice"
- Email to barely users: "New: Get paid for your creative work"
- Bundle offer: Add to any plan for $10/month# Barely Invoice PRD: MVP for Launch

## Product Vision

Dead-simple invoicing for freelancers who just want to get paid. No accounting jargon, no feature bloat - just create, send, and track payment in under 60 seconds. The bare minimum invoice tool that gets you paid faster.

## Product Name & Branding

- **Name**: Barely Invoice
- **Domain**: barelyinvoice.com (www. for marketing, app. for product)
- **Tagline**: "Invoicing that's barely there"
- **Position**: So simple it's barely software

## Target User

- Freelancers and consultants sending 5-20 invoices/month
- Agencies tired of QuickBooks complexity
- Service providers who value speed over features
- Your own marketing agency (dogfooding)
- Musicians invoicing for session work, sync licenses (cross-sell from barely ecosystem)

## Success Metrics

- Time to create and send first invoice: <60 seconds
- Payment collection rate: >90% within 30 days
- Daily active usage: >40% of users
- MRR target: $6,000 by month 3, $12,000 by month 6

## Architecture & Data Model

### Workspace-Based Structure

```typescript
Users {
  id: string
  email: string
  workspaces: Workspace[]
}

Workspaces {
  id: string
  handle: string @unique  // e.g., "acme-co"
  name: string
  businessDetails: JSON   // address, tax info, payment terms
  stripeAccountId: string?
  stripeOnboardingStatus: JSON
  users: User[]
  invoices: Invoice[]
  clients: Client[]
}

Invoices {
  id: string
  workspaceId: string
  invoiceNumber: string (auto-generated)
  publicUrl: string  // barelyinvoice.com/pay/{handle}/{invoiceId}
  fromDetails: JSON (from workspace)
  clientId: string
  lineItems: JSON[]
  tax: number (percentage)
  notes: string
  dueDate: date (one-time only)
  billingType: 'one_time' | 'recurring'
  recurringConfig?: {
    interval: 'monthly' | 'weekly' | 'quarterly'
    stripeSubscriptionId?: string
    nextBillingDate?: date
  }
  status: draft | sent | viewed | paid | overdue | active | cancelled
}

Clients {
  id: string
  workspaceId: string
  name: string
  email: string
  company?: string
  address?: string
}
```

## MVP Features (Launch Week)

### 1. Invoice Creation

**Core Functionality**

- One-page invoice builder
- Reusable line items
- Simple math (quantity × rate = total)
- Tax as single percentage
- Currency: USD only for MVP

## Data Model

```typescript
Invoice {
  id: string
  invoiceNumber: string (auto-generated)
  fromDetails: JSON (name, email, address)
  clientId: string
  lineItems: JSON[]
  tax: number (percentage)
  notes: string
  dueDate: date (one-time only)
  billingType: 'one_time' | 'recurring'
  recurringConfig?: {
    interval: 'monthly' | 'weekly' | 'quarterly'
    stripeSubscriptionId?: string
    nextBillingDate?: date
  }
  status: draft | sent | viewed | paid | overdue | active | cancelled
}
```

### 2. Client Management

**Core Functionality**

- Quick-add client during invoice creation
- Save client for reuse
- No complex CRM features

**Data Model**

```typescript
Client {
  id: string
  name: string
  email: string
  company?: string
  address?: string
}
```

### 3. Payment Collection

**Core Functionality**

- One-time OR recurring payment options
- Stripe payment link on invoice
- "Pay Now" button (one-time) or "Subscribe" button (recurring)
- Automatic payment confirmation
- Instant status update to "Paid" or "Active"

**Recurring Payments**

- Monthly, weekly, or quarterly billing cycles
- Automatic charge on schedule
- Subscription status tracking
- Cancel subscription from dashboard (user only, no client portal in MVP)

**Implementation**

- Stripe Checkout (both payment and subscription modes)
- 0.5% platform fee on top of Stripe fees
- Instant payout to user's Stripe account
- Webhook handling for subscription lifecycle

### 4. Invoice Delivery & Public Pages

**Core Functionality**

- Send via email (from your domain)
- Public payment URL: barelyinvoice.com/pay/{handle}/{invoiceId}
- Professional branded payment page with workspace details
- PDF download (client-side generation)
- "Viewed" tracking via email pixel

**Public Payment Page Features**

- Clean, professional design with workspace branding
- Clear amount and due date
- One-click payment (Stripe Checkout)
- Mobile-optimized
- No login required for clients

### 5. Templates & Automation

**Core Functionality**

- Save invoice as template
- Duplicate previous invoices
- Automatic late payment reminders (3, 7, 14 days) - one-time only
- Invoice templates for both one-time and recurring

**Recurring Invoice Management**

```typescript
// Set up once, runs forever
Invoice {
  billingType: 'one_time' | 'recurring'
  recurringConfig?: {
    interval: 'monthly' | 'weekly' | 'quarterly'
    stripeSubscriptionId: string
    status: 'active' | 'cancelled' | 'past_due'
  }
}
```

### 6. Dashboard

**Core Functionality**

- Outstanding invoice total
- Monthly recurring revenue (MRR) display
- Active subscriptions count
- Overdue alerts (one-time invoices)
- This month's collected revenue
- Recent activity feed
- Quick actions (new invoice, resend, mark paid, cancel subscription)

**Subscription Management View**

- List of active subscriptions
- Next billing date for each
- Quick cancel button (with confirmation)
- Subscription revenue vs one-time revenue breakdown

## NON-Goals for MVP (Avoid Scope Creep)

❌ Multi-currency support
❌ Expense tracking
❌ Time tracking
❌ Estimates/quotes
❌ Purchase orders
❌ Inventory management
❌ Team collaboration
❌ Advanced reporting
❌ Accounting integrations
❌ Custom invoice designs

## Technical Requirements

### Authentication

- Magic link email (existing implementation)
- Session management (existing)
- Google OAuth (post-launch, not MVP)

### Workspace Management (NEW - CRITICAL)

- Workspace creation flow (needed for barely.ai too)
- Handle validation/uniqueness
- Handle is used in all public URLs
- Workspace switching (if user has multiple)
- Invite flow (existing implementation)

### Stripe Integration (CRITICAL - IMPROVE EXISTING)

- Stripe Connect OAuth per workspace
- Improved onboarding UX with progress tracking
- Webhook handling for status updates
- Continue interrupted onboarding with one click
- Show requirements clearly if additional info needed
- Allow invoice creation while pending verification

### Performance

- Invoice creation: <2 seconds
- PDF generation: <3 seconds
- Payment processing: <5 seconds
- Dashboard load: <1 second

### Security

- PCI compliance via Stripe
- Encrypted invoice data
- Secure magic links for client access
- Workspace isolation for multi-tenant

## User Journey

### First-Time User Flow (Critical Path)

1. Sign up (magic link email - existing auth)
2. **NEW: Workspace Creation Flow**
   - Business/freelancer name
   - Handle selection (for public URLs)
   - Handle validation (unique, URL-safe)
   - Business address (for invoices)
   - Tax ID (optional)
   - Default payment terms (Net 30, etc.)
3. **Stripe Connect Onboarding (Required)**
   - Clear progress indicator (5 steps)
   - One-click continue if interrupted
   - Webhook status updates
   - Can create invoices while pending verification
4. Create first invoice from tutorial template
5. Choose one-time or recurring payment
6. Send test invoice to self
7. Experience the payment flow

### Stripe Connect UX (Improved)

```typescript
// Visual progress throughout
Steps: [
  'Create Account',
  'Business Details',
  'Bank Account',
  'Identity Verification',
  'Ready to Accept Payments'
]

// Smart state handling
- not_started: Show benefits, time estimate (3-5 min)
- in_progress: One-click continue button
- pending_verification: Can still create invoices
- complete: Ready to accept payments

// Webhook monitoring for real-time updates
- account.updated
- account.application.authorized
- capability.updated
```

### Returning User Flow (One-Time Invoice)

1. Dashboard shows overdue/pending
2. Click "New Invoice"
3. Select recent client or template
4. Choose "One-time payment"
5. Modify as needed
6. Send with one click

### Returning User Flow (Recurring/Subscription)

1. Dashboard shows MRR and active subscriptions
2. Click "New Recurring Invoice"
3. Select client and billing interval
4. Set subscription terms
5. Send subscription request
6. Monitor subscription status in dashboard
7. Cancel from dashboard if needed (no client portal yet)

## Pricing Strategy

### Standalone Pricing

- **Free**: 3 invoices/month, "Powered by Barely Invoice" branding
- **Starter ($9/month)**: Unlimited one-time invoices, no branding
- **Pro ($19/month)**: Add recurring/subscription billing
- **Agency ($49/month)**: Multiple workspaces, white-label option

### Transaction Fees

- Additional 0.5% on collected payments (capped at $20/invoice)
- Positions you to make money when users make money

### Barely Ecosystem Bundle (Future)

- Add to any barely plan for $10/month
- OR included free in Breakout tier ($149/month)
- Deeper integrations with barely.cart and barely.email

## Launch Checklist

### Pre-Launch: Workspace & Stripe Polish

- [ ] Workspace creation flow (reusable for barely.ai)
- [ ] Handle validation and uniqueness checking
- [ ] Improved Stripe Connect onboarding UX
- [ ] Stripe webhook handling for status updates
- [ ] Progress indicators for Stripe onboarding
- [ ] One-click continue for interrupted onboarding

### Week 1: Core Features

- [ ] Invoice CRUD operations
- [ ] Client management
- [ ] Public payment pages (/pay/{handle}/{invoiceId})
- [ ] Basic email sending with tracking

### Week 2: Payment Flow

- [ ] Stripe Checkout integration (payment mode)
- [ ] Stripe Subscriptions integration (subscription mode)
- [ ] Payment confirmation webhooks
- [ ] Subscription lifecycle webhooks
- [ ] Invoice status updates
- [ ] PDF generation
- [ ] Subscription management in dashboard

### Week 3: Polish & Launch

- [ ] Dashboard with metrics (including MRR)
- [ ] Subscription cancellation flow
- [ ] Late payment reminders (one-time only)
- [ ] Onboarding flow with both payment types
- [ ] Landing page at barelyinvoice.com
- [ ] ProductHunt assets and launch plan

## Competitive Advantages

1. **Recurring Revenue Made Simple**: Only tool focused on helping freelancers build subscription income
2. **Speed**: Invoice created and sent in <60 seconds
3. **Dual Model**: Seamlessly handle both one-time and recurring in same interface
4. **Price**: $19/month vs $30+ for competitors
5. **Dogfooding**: "I use this for my own agency"
6. **Payment-aligned fees**: Success when you succeed

## Key Differentiators

### vs QuickBooks ($30/month)

- 90% less features, 90% less complexity
- No accounting knowledge required
- 10x faster for simple invoicing
- Better recurring payment setup

### vs Wave (Free)

- Actually simple (Wave has become complex)
- Better payment experience
- Cleaner recurring billing setup
- Premium support option

### vs Invoice Ninja ($10/month)

- Cleaner, modern UI (shadcn)
- Faster performance (Next.js)
- Better payment flow (Stripe Checkout)
- Simpler subscription management

### vs Stripe Billing ($100+/month)

- 80% cheaper for basic needs
- Simpler interface for non-technical users
- Integrated invoicing + subscriptions
- No code required

## Post-Launch Roadmap (Month 2-3)

### Priority 1: Client Portal

- Let clients view their subscription status
- Update payment method
- Cancel subscription (with confirmation)
- Download invoice history

### Based on user feedback:

1. Multi-currency (if international users)
2. Basic expense tracking (receipts only)
3. Invoice templates marketplace
4. Zapier integration
5. White-label option ($149/month)
6. Usage-based billing for recurring
7. Subscription upgrade/downgrade flows

## Definition of Done for MVP

- [ ] Can create and send professional invoice in <60 seconds
- [ ] Can accept one-time payment via Stripe
- [ ] Can set up recurring subscription via Stripe
- [ ] Can track payment and subscription status
- [ ] Can cancel subscriptions from dashboard
- [ ] Can send automatic reminders (one-time invoices)
- [ ] Can handle recurring clients efficiently
- [ ] Dashboard shows MRR and recurring vs one-time breakdown
- [ ] Your agency is using it for retainer clients
- [ ] 10 beta users have sent real invoices (mix of one-time and recurring)

## Risk Mitigation

| Risk                  | Mitigation                                 |
| --------------------- | ------------------------------------------ |
| Stripe account issues | Clear onboarding about requirements        |
| Email deliverability  | Use established provider (SendGrid)        |
| PDF generation bugs   | Client-side generation, multiple libraries |
| Payment disputes      | Clear terms, Stripe handling               |
| Feature creep         | Public "Not Roadmap" page                  |

## Success Criteria

**Week 1 post-launch**: 50 signups, 10 paid invoices, 2 subscriptions
**Month 1**: 100 users, $500 MRR (mix of platform fees and subscriptions)
**Month 3**: 500 users, $6,000 MRR, 30% on recurring billing
**Month 6**: 1,000 users, $12,000 MRR, 50% using recurring features

---

**Critical Success Factors**:

1. Workspace creation flow must be seamless (it unlocks barely.ai launch too)
2. Stripe Connect onboarding must be crystal clear (every user goes through it)
3. The recurring payment feature is your key differentiator - make it prominent
4. Public payment pages must look professional (barelyinvoice.com/pay/{handle}/{invoiceId})
5. Keep it simple - resist feature requests that don't directly help users get paid faster
