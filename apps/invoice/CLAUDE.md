# CLAUDE.md - Invoice App

This file provides guidance specific to the Invoice app within the barely.ai monorepo.

## App Architecture Overview

The invoice functionality is split across **two separate apps**:

### 1. `apps/invoice` - Public-Facing Invoice App (This App)

- **Purpose**: Public endpoints for clients to view and pay invoices
- **Audience**: End users (clients of workspace owners) who receive invoices
- **Functionality**:
  - View invoice details
  - Make payments (one-time and recurring)
  - Download invoice PDFs
  - Public landing page/waitlist
- **Routes**:
  - `/pay/[handle]/[invoiceId]` - Payment page
  - `/[handle]/[invoiceId]/pdf` - PDF view
  - `/` - Marketing landing page
- **No Authentication Required**: These are public routes accessible via shareable links

### 2. `apps/app` (Invoice Variant) - Workspace Invoice Management

- **Purpose**: Admin interface for workspace owners to create and manage invoices
- **Audience**: Workspace owners and team members
- **Uses**: Same `@apps/app/` codebase with `NEXT_PUBLIC_CURRENT_APP=invoice` environment variable
- **Functionality**:
  - Create/edit/delete invoices
  - Manage clients
  - View invoice analytics
  - Configure invoice settings
- **Authentication Required**: Uses Better Auth with workspace sessions

## Key Distinctions

### When to Add Code to `apps/invoice`:

- Public invoice viewing/payment functionality
- Routes that external users access via shareable links
- Marketing/landing pages for the invoice product
- Any functionality that should NOT require authentication

### When to Add Code to `apps/app` (Invoice Variant):

- Invoice creation and management UI
- Workspace-specific invoice settings
- Invoice analytics dashboards
- Any functionality requiring workspace authentication

## Environment Configuration

The invoice variant of `apps/app` is controlled by:

```bash
NEXT_PUBLIC_CURRENT_APP=invoice
```

This environment variable determines:

- Which features are visible in the UI
- App-specific branding and theming
- Navigation and routing behavior
- API endpoint configurations (e.g., auth client baseURL)

## Related Files

- **Public tRPC Router**: `packages/api/src/public/invoice-render.route.ts`
- **Admin tRPC Router**: `packages/lib/src/trpc/routes/invoice.route.ts`
- **Database Schema**: `packages/db/src/sql/invoices.sql.ts`
- **Validators**: `packages/validators/src/schemas/invoice.ts`

## Development

```bash
# Run the public invoice app
pnpm --filter @barely/invoice dev  # Runs on port 3012

# Run the invoice management variant (workspace app)
NEXT_PUBLIC_CURRENT_APP=invoice pnpm --filter @barely/app dev  # Runs on port 3000
```

## Common Patterns

### Public Routes

- Use `useInvoiceRenderTRPC()` from `@barely/api/public/invoice-render.trpc.react`
- No authentication checks required
- Routes should be accessible via invoice ID and workspace handle

### Admin Routes (in apps/app)

- Use standard workspace tRPC client
- Require authentication via Better Auth
- Routes should be under workspace context (`/[workspaceHandle]/invoices`)
