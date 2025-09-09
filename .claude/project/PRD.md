# Barely Invoice MVP – Product Requirements Document

### TL;DR

Barely Invoice is a dead-simple invoicing tool for freelancers and consultants who need to get paid fast without accounting complexity. Built as an app variant of the barely.ai platform, it enables users to create professional invoices in under 60 seconds, send payment links via email, and get paid through Stripe within days instead of weeks. The MVP focuses exclusively on the core payment collection flow with zero unnecessary features.

---

## Goals

### Business Goals

- **Demonstrate Micro-SaaS Revenue**: Generate $500 MRR within month 1, $1,900 by month 3
- **Validate Market Fit**: Prove demand for ultra-simple invoicing before full build
- **Expand Platform Usage**: Create first B2B product variant using existing infrastructure
- **Enable Dogfooding**: Use internally for agency client billing immediately

### User Goals

- **Get Paid Faster**: Reduce payment collection from 30+ days to under 7 days
- **Save Time**: Create and send invoices in under 60 seconds (vs 10-15 minutes)
- **Look Professional**: Send polished invoices that justify professional rates
- **Track Payment Status**: Know instantly when invoices are viewed and paid

### Non-Goals

- Complex accounting or bookkeeping features
- Multi-currency support
- Recurring/subscription billing (MVP phase)
- PDF generation (HTML invoice sufficient)
- Automated payment reminders (manual resend only)
- Invoice templates marketplace
- Time tracking or expense management
- Estimates or quotes
- Purchase orders

---

## User Stories

### Primary Persona – "Freelance Consultant"

- As a freelancer, I want to create an invoice with line items in under a minute, so that I can get back to billable work
- As a consultant, I want to save client information once, so that I don't retype details for every invoice
- As a service provider, I want clients to pay with one click, so that payment friction is eliminated
- As a freelancer, I want to know when my invoice is viewed, so that I can follow up appropriately
- As a consultant, I want automatic payment confirmation, so that I don't manually check my bank account
- As a freelancer, I want to add simple tax calculations, so that I comply with requirements without complexity
- As a service provider, I want professional-looking invoices, so that clients take my business seriously

---

## Functional Requirements

### **Client Management** (Priority: High)

- Create new clients with name, email, company, address
- Edit existing client information
- View list of all clients
- Select client from dropdown when creating invoice
- Delete clients (with confirmation)
- Client data scoped to workspace

### **Invoice Creation** (Priority: High)

- Add multiple line items with description, quantity, rate
- Automatic calculation of line totals and invoice total
- Add simple percentage-based tax
- Set payment due date
- Include invoice number (auto-generated, sequential)
- Select existing client or quick-add new one
- Save as draft or send immediately
- Invoice data scoped to workspace

### **Payment Collection** (Priority: High)

- Generate unique payment link for each invoice
- Public payment page at /pay/{workspace-handle}/{invoice-id}
- Accept credit/debit cards via Stripe Checkout
- Use workspace's existing Stripe Connect account
- Automatic webhook to mark invoice as paid
- Instant payment confirmation to user
- Platform fee of 0.5% on collected payments

### **Invoice Management** (Priority: High)

- View list of all invoices with status indicators
- Filter by status (draft, sent, viewed, paid)
- Search invoices by client or invoice number
- Duplicate existing invoice for similar projects
- Mark invoice as paid manually if needed
- Delete draft invoices

### **Invoice Delivery** (Priority: High)

- Send invoice via email from user's workspace
- Professional email template with payment link
- Track when invoice email is opened (pixel tracking)
- Update status to "viewed" automatically
- Resend invoice manually if needed

### **Status Tracking** (Priority: Medium)

- Clear status indicators: draft, sent, viewed, paid, overdue
- Automatic status updates based on actions
- Visual indicators in invoice list (colors/badges)
- Overdue alerts for unpaid past-due invoices
- Last activity timestamp on each invoice

### **Dashboard** (Priority: Medium)

- Total outstanding amount
- Number of overdue invoices
- Recent activity feed (last 10 actions)
- Quick actions: New Invoice, View Clients
- This month's collected total
- Average days to payment

---

## User Experience

### Entry Point & Onboarding

- User signs up via magic link (existing auth)
- Workspace created/selected (existing flow)
- Stripe Connect already configured (from other products)
- First invoice created from template/tutorial

### Core Experience

**Creating First Invoice:**
1. User clicks "New Invoice" from dashboard
2. Selects existing client or quick-adds new one
3. Adds line items with automatic calculation
4. Sets due date and tax percentage
5. Reviews invoice preview
6. Clicks "Send Invoice"
7. Email sent to client with payment link
8. User sees confirmation and returns to dashboard

**Client Payment Flow:**
1. Client receives professional invoice email
2. Clicks "Pay Now" button
3. Lands on public payment page (no login required)
4. Reviews invoice details
5. Clicks "Pay with Card"
6. Enters payment info via Stripe Checkout
7. Sees payment confirmation
8. User notified instantly of payment

**Returning User Flow:**
1. Dashboard shows outstanding invoices
2. User duplicates previous similar invoice
3. Updates line items and amount
4. Selects saved client from dropdown
5. Sends in under 60 seconds

### Advanced Features & Edge Cases

- Manual payment marking for cash/check payments
- Void invoice option for mistakes
- Email bounce handling with manual resend
- Payment failure notifications
- Export invoice list as CSV (future)

### UI/UX Highlights

- Mobile-responsive for invoice creation on the go
- Clean, minimal interface matching barely.ai design system
- Professional invoice layout inspiring trust
- One-click actions throughout
- Real-time calculation updates
- Loading states for all async operations

---

## Narrative

Sarah is a freelance marketing consultant who just finished a website copy project for a new client. Instead of opening Google Docs to create yet another invoice template, she logs into Barely Invoice.

In 45 seconds, she's created a professional invoice with three line items, added 8.5% tax, and selected her client from the dropdown (saved from last month's project). She hits send.

Her client receives a clean, professional invoice email. One click takes them to a payment page that looks trustworthy and modern. Another click to "Pay Now" and they're in Stripe's secure checkout. Payment complete.

Sarah gets a notification on her phone: "Invoice #1024 paid - $2,500 received!" The money hits her Stripe account immediately. No more checking the bank account daily or sending awkward payment reminders.

By month's end, Sarah has collected payments in an average of 4 days instead of her previous 35. She's spending 5 minutes per week on invoicing instead of 2 hours. That's 7+ hours per month back for billable work.

---

## Success Metrics

### User-Centric Metrics

- **Invoice Creation Time**: <60 seconds average
- **Payment Collection Time**: <7 days average
- **User Activation Rate**: 80% send first invoice within 24 hours
- **Invoice Completion Rate**: 90% of started invoices get sent
- **Client Payment Rate**: 90% pay within 30 days

### Business Metrics

- **Week 1**: 1 paid invoice through system
- **Month 1**: 10 paying users, $190 MRR
- **Month 3**: 100 paying users, $1,900 MRR
- **Platform Fees**: 0.5% of payment volume
- **Churn Rate**: <5% monthly

### Technical Metrics

- **Page Load Time**: <2 seconds
- **Payment Page Load**: <1 second (critical for conversion)
- **Email Delivery Rate**: >95%
- **Webhook Success Rate**: 99.9%
- **Uptime**: 99.9%

### Tracking Plan

- Invoice created (workspace_id, client_id, amount)
- Invoice sent (invoice_id, delivery_method)
- Invoice viewed (invoice_id, viewer_ip)
- Payment initiated (invoice_id, amount)
- Payment completed (invoice_id, amount, days_to_pay)
- Client created (workspace_id)
- User session (page_views, time_on_site)

---

## Technical Considerations

### Technical Needs

- **App Variant**: Configure as 'invoice' variant like barely.fm
- **Database Tables**: Two new tables (invoices, clients)
- **API Routes**: 6 new endpoints for CRUD operations
- **Email Service**: SendGrid for invoice delivery (existing)
- **Payment Processing**: Stripe Checkout + Connect (existing)
- **Webhook Handler**: Stripe payment confirmation

### Integration Points

- **Authentication**: Magic link system (existing)
- **Workspace System**: Multi-tenant architecture (existing)
- **Stripe Connect**: Payment processing (existing)
- **Component Library**: Reuse barely.ai UI components
- **Email Infrastructure**: SendGrid integration (existing)

### Data Storage & Privacy

- All invoice data encrypted at rest
- Client information scoped to workspace
- PCI compliance via Stripe (no card data stored)
- GDPR-compliant data deletion on request
- Audit trail for all invoice modifications

### Scalability & Performance

- Database indexes on workspace_id, client_id, status
- Paginated invoice lists (50 per page)
- Lazy load client dropdown for large lists
- CDN for static assets
- Queue-based email sending for reliability

### Potential Challenges

- **Risk**: Stripe Connect not configured for workspace
  - **Mitigation**: Graceful degradation with setup prompt
  
- **Risk**: Email deliverability issues
  - **Mitigation**: Use established SendGrid account, monitor bounces
  
- **Risk**: Users expect recurring billing immediately
  - **Mitigation**: Clear messaging about future features, collect feedback
  
- **Risk**: Payment disputes
  - **Mitigation**: Clear terms, Stripe's dispute handling

---

## MVP Definition

The MVP includes only:
1. Client management (CRUD)
2. Invoice creation with line items
3. Email delivery with payment link
4. Public payment page
5. Stripe payment processing
6. Status tracking
7. Basic dashboard

Everything else is post-MVP based on user feedback and requests.

---

## Post-MVP Roadmap

Based on user feedback, consider adding:
1. **Week 2**: Duplicate invoice feature
2. **Week 3**: CSV export
3. **Month 2**: Recurring invoices (if heavily requested)
4. **Month 3**: PDF generation (if required by users)
5. **Future**: Templates, automated reminders, multi-currency

---