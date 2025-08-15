# Barely Invoice MVP - Technical Implementation Plan

## Feature Summary

Implement a workspace-scoped invoicing system as an app variant of the barely.ai platform, enabling invoice creation, client management, email delivery, and Stripe payment collection through public payment pages.

## Architecture Overview

The invoice app will be implemented as a new app variant (`invoice`) within the existing monorepo structure, leveraging:
- Existing workspace multi-tenancy system for data isolation
- Stripe Connect infrastructure for payment processing  
- SendGrid integration for email delivery
- App variant configuration pattern established by fm/vip apps
- Shared UI components and authentication system

### Components Affected
- New app: `apps/invoice/`
- Database: Two new tables (Invoices, InvoiceClients)
- API: New tRPC routes for invoice operations
- Validators: New Zod schemas for invoice data validation
- Email: New invoice email template
- Constants: App configuration updates

## Key Technical Decisions

1. **App Variant Architecture**: Use existing app variant pattern to create focused invoice interface while hiding unnecessary navigation
2. **Database Design**: Workspace-scoped tables following existing patterns with soft deletes
3. **Payment Processing**: Leverage existing Stripe Connect per workspace, avoiding new OAuth implementation
4. **Public Routes**: Implement public payment pages using established public router patterns from vip/fm apps
5. **Email Delivery**: Use SendGrid transactional API directly instead of broadcast system
6. **Status Tracking**: Implement event-driven status updates via webhooks and database triggers
7. **Invoice Numbers**: Use workspace-scoped sequential numbering with format `INV-{workspacePrefix}-{number}`

## Dependencies & Assumptions

### Dependencies
- Workspace system fully operational (Bio MVP completion)
- Stripe Connect configured per workspace
- SendGrid API available for transactional emails
- Existing auth/session management
- Shared UI component library

### Assumptions
- Users have completed workspace onboarding
- Stripe Connect is active for payment collection
- Single currency (USD) for MVP
- HTML invoice display (no PDF generation)
- No recurring billing in MVP phase

## Implementation Checklist

### Feature 1: Database Schema & Models

- [ ] Create `packages/db/src/sql/invoice-client.sql.ts` with InvoiceClients table
  - workspace-scoped client records
  - Fields: id, workspaceId, name, email, company, address, deletedAt, createdAt, updatedAt
  - Index on workspaceId for query performance
  
- [ ] Create `packages/db/src/sql/invoice.sql.ts` with Invoices table
  - workspace-scoped invoice records
  - Fields: id, workspaceId, invoiceNumber, clientId, lineItems (JSONB), tax, subtotal, total, dueDate, status, stripePaymentIntentId, viewedAt, paidAt, deletedAt, createdAt, updatedAt
  - Indexes on workspaceId, clientId, status, invoiceNumber
  - Status enum: draft, sent, viewed, paid, overdue, voided

- [ ] Import new tables in `packages/db/src/client.ts` and add to dbSchema export

- [ ] Create Zod schemas in `packages/validators/src/schemas/invoice-client.schema.ts`
  - createInvoiceClientSchema, updateInvoiceClientSchema, selectInvoiceClientSchema
  
- [ ] Create Zod schemas in `packages/validators/src/schemas/invoice.schema.ts`
  - createInvoiceSchema, updateInvoiceSchema, selectInvoiceSchema
  - lineItemSchema for array validation
  
- [ ] Export schemas from `packages/validators/src/schemas/index.ts`

- [ ] Run database migration to create tables: `pnpm db:push`

### Feature 2: Invoice App Setup

- [ ] Create `apps/invoice/` directory structure copying from `apps/fm/`

- [ ] Configure `apps/invoice/package.json` with required dependencies:
  - Core Next.js and React dependencies
  - tRPC client packages (excluding @trpc/react-query)
  - UI and validation packages from workspace

- [ ] Set up `apps/invoice/next.config.mjs` with app variant configuration

- [ ] Create `apps/invoice/src/app/layout.tsx` with TRPCReactProvider wrapper

- [ ] Configure environment variables in `apps/invoice/.env`:
  - NEXT_PUBLIC_APP_VARIANT=invoice
  - Port configuration (3011)

- [ ] Update `packages/const/src/app.constants.ts` to add 'invoice' to APPS array

- [ ] Update `packages/auth/src/get-url.ts` to handle invoice app URLs

- [ ] Update development scripts in `scripts/dev-qr-codes.sh` for invoice app

### Feature 3: Client Management CRUD

- [ ] Create `packages/lib/src/trpc/routes/invoice-client.route.ts` with procedures:
  - create: Add new client to workspace
  - update: Modify client information
  - delete: Soft delete client
  - list: Paginated client list for workspace
  - byId: Get single client details

- [ ] Create client management UI in `apps/invoice/src/app/clients/page.tsx`:
  - Client list table with search/filter
  - Add/Edit client modal with form validation
  - Delete confirmation dialog

- [ ] Implement `ClientForm` component using useZodForm pattern:
  - TextField components for name, email, company
  - TextAreaField for address
  - Form validation with error display

- [ ] Add client dropdown component for invoice creation:
  - Searchable select with lazy loading
  - Quick-add new client option

### Feature 4: Invoice Creation & Management

- [ ] Create `packages/lib/src/trpc/routes/invoice.route.ts` with procedures:
  - create: Create new invoice with line items
  - update: Modify draft invoices
  - delete: Soft delete draft invoices
  - list: Paginated invoice list with filters
  - byId: Get single invoice with client data
  - duplicate: Copy existing invoice
  - markPaid: Manual payment marking

- [ ] Implement invoice number generation in `packages/lib/src/functions/invoice.fns.ts`:
  - Sequential numbering per workspace
  - Format: INV-{workspacePrefix}-{paddedNumber}

- [ ] Create invoice form in `apps/invoice/src/app/invoices/new/page.tsx`:
  - Client selection dropdown
  - Dynamic line items with add/remove
  - Automatic calculation of totals
  - Tax percentage input
  - Due date picker

- [ ] Build invoice list view in `apps/invoice/src/app/invoices/page.tsx`:
  - Status badges (draft, sent, paid, overdue)
  - Quick actions (duplicate, send, delete)
  - Filter by status and client
  - Search by invoice number

- [ ] Create invoice preview component:
  - Professional layout matching brand
  - Line items table with totals
  - Client and business information display

### Feature 5: Email Delivery System

- [ ] Create email template in `packages/email/src/templates/invoice.tsx`:
  - Professional invoice layout
  - Clear call-to-action button
  - Payment link integration
  - Tracking pixel for view status

- [ ] Implement email sending in `packages/lib/src/functions/invoice-email.fns.ts`:
  - SendGrid integration for transactional send
  - Email tracking pixel generation
  - Retry logic for failed sends

- [ ] Add send invoice procedure to invoice.route.ts:
  - Generate payment link
  - Send email via SendGrid
  - Update invoice status to 'sent'
  - Log email activity

- [ ] Create email tracking endpoint in `apps/invoice/src/app/api/track/[invoiceId]/route.ts`:
  - Update invoice viewedAt timestamp
  - Change status to 'viewed'
  - Return 1x1 transparent pixel

### Feature 6: Payment Collection

- [ ] Create public router in `packages/api/src/public/invoice-render.route.ts`:
  - getInvoiceByHandle: Retrieve invoice for payment page
  - No authentication required for public access

- [ ] Set up public router exports in `packages/api/src/public/invoice-render.router.ts`

- [ ] Create tRPC context in `packages/api/src/public/invoice-render.trpc.react.ts`

- [ ] Implement public payment page at `apps/invoice/src/app/pay/[handle]/[invoiceId]/page.tsx`:
  - Invoice details display
  - Pay button triggering Stripe Checkout
  - Mobile-responsive design
  - No authentication required

- [ ] Create Stripe Checkout session in `packages/lib/src/functions/invoice-payment.fns.ts`:
  - Use workspace's Stripe Connect account
  - Set payment intent metadata with invoiceId
  - Configure success/cancel URLs
  - Apply 0.5% platform fee

- [ ] Implement Stripe webhook handler at `apps/invoice/src/app/api/webhooks/stripe/route.ts`:
  - Handle payment_intent.succeeded event
  - Update invoice status to 'paid'
  - Record paidAt timestamp
  - Send payment confirmation email

### Feature 7: Dashboard & Analytics

- [ ] Create dashboard view at `apps/invoice/src/app/page.tsx`:
  - Outstanding invoice total calculation
  - Overdue invoice count and list
  - Recent activity feed (last 10 actions)
  - Quick action buttons
  - This month's revenue display

- [ ] Implement dashboard data aggregation in invoice.route.ts:
  - getDashboardStats procedure
  - Efficient queries with proper indexes
  - Cache results for performance

- [ ] Add status update cron job in `packages/lib/src/trigger/invoice-status.trigger.ts`:
  - Daily check for overdue invoices
  - Update status based on due date
  - Optional: Send overdue notifications

### Feature 8: Testing & Security

- [ ] Write unit tests for invoice number generation
- [ ] Test line item calculation logic
- [ ] Validate tax calculation accuracy
- [ ] Test email template rendering

- [ ] Implement integration tests for:
  - Invoice creation flow
  - Payment webhook handling
  - Email delivery tracking

- [ ] Security validations:
  - Workspace-scoped data access
  - Public page rate limiting
  - Payment webhook signature verification
  - XSS prevention in invoice display

- [ ] Performance testing:
  - Large client list pagination
  - Invoice list query optimization
  - Payment page load time

The next step is to organize the implementation plan by features. Run `/product-development:05_organize-plan` when ready.