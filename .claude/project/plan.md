# barely.bio Technical Implementation Plan

## Feature Summary

Implement a conversion-optimized link-in-bio solution that integrates seamlessly with the barely.ai ecosystem, enabling artists to create mobile-first bio pages with built-in email capture, analytics tracking, and remarketing capabilities.

## Architecture Overview

### High-Level Integration

The feature will be implemented as a new Next.js app (`apps/bio`) following the existing monorepo patterns, with shared backend infrastructure and new public-facing rendering endpoints. Key integration points:

- **New App**: `apps/bio` - Public-facing bio pages with SSG/ISR (Port: 3011)
- **Database**: Extend existing `Bios` and `BioButtons` schemas with email capture settings
- **API Layer**: Dual router architecture with admin and public routes following tRPC patterns
- **Shared Packages**: Leverage existing `@barely/ui`, `@barely/email`, `@barely/tb` for consistency
- **Analytics Pipeline**: Integrate with Tinybird for real-time click tracking
- **Email System**: Connect to `@barely/email` for capture and automation

### Component Architecture

```
apps/bio/
├── src/app/
│   ├── [handle]/          # Dynamic artist bio pages
│   │   ├── page.tsx       # Bio page render
│   │   └── layout.tsx     # SEO & meta tags
│   ├── api/
│   │   └── trpc/bioRender/[trpc]/route.ts
│   ├── trpc/
│   │   ├── react.tsx      # tRPC React provider
│   │   ├── server.tsx     # Server-side tRPC
│   │   └── query-client.tsx # TanStack Query setup
│   └── styles/
│       └── globals.css    # Tailwind styles
│
packages/
├── api/src/public/
│   ├── bio-render.router.ts      # Public router definition
│   ├── bio-render.trpc.react.ts  # React hooks
│   └── bio-render.handler.ts     # API handler
├── lib/src/trpc/routes/
│   ├── bio.route.ts              # Admin CRUD operations
│   └── bio-render.route.ts       # Public render routes
├── db/src/sql/bio.sql.ts         # Schema definitions
└── validators/src/schemas/bio.schema.ts # Validation schemas
```

## Key Technical Decisions

1. **Static Generation with ISR**: Use Next.js ISR (Incremental Static Regeneration) for bio pages to achieve sub-2s load times while maintaining fresh content. Revalidate on-demand when bio is updated.

2. **Email Capture as Native Component**: Implement email capture as a built-in bio component rather than external form to minimize API calls and maximize conversion rates.

3. **Edge Analytics**: Use Tinybird edge functions for analytics to avoid blocking page render and ensure accurate tracking even with ad blockers.

4. **Theme System Extension**: Extend existing `@barely/ui` theme system rather than building new one, ensuring consistency across all barely products.

5. **Subdomain Routing**: Use `[handle].barely.bio` pattern matching existing workspace handle system for clean URLs and easy migration.

6. **Mobile-First Responsive Images**: Implement responsive image optimization with Next.js Image component and Cloudinary integration for fast mobile loading.

7. **Database Client Strategy**: Use `dbHttp` for single-shot operations (fetching bio), `dbPool` for multi-shot operations (email capture with fan creation transactions).

8. **Type-Safe tRPC**: All routes use `satisfies TRPCRouterRecord` for compile-time type safety.

## Dependencies & Assumptions

### Dependencies
- Existing workspace handle system for URL routing
- `@barely/email` package for email capture and automation
- `@barely/tb` (Tinybird) for analytics pipeline
- `@barely/files` for image upload and optimization
- Cloudinary or similar CDN for image serving

### Assumptions
- Bio database schema exists and is sufficient for MVP (confirmed)
- Workspace handles are unique and suitable for subdomains
- Email capture can reuse existing fan/email infrastructure
- Analytics events follow existing event schema patterns
- Mobile browsers support service workers for offline capability

## Package Dependencies

### Bio App Package.json
```json
{
  "name": "@barely/bio",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm with-env next dev --experimental-https --port=3011",
    "build": "pnpm with-env next build",
    "preview": "pnpm with-env next start",
    "type-check": "tsc --noEmit",
    "with-env": "dotenv -e ../../.env --"
  },
  "dependencies": {
    "@barely/api": "workspace:*",
    "@barely/auth": "workspace:*",
    "@barely/db": "workspace:*",
    "@barely/email": "workspace:*",
    "@barely/hooks": "workspace:*",
    "@barely/lib": "workspace:*",
    "@barely/ui": "workspace:*",
    "@barely/utils": "workspace:*",
    "@barely/validators": "workspace:*",
    "@tanstack/react-query": "catalog:",
    "@tanstack/react-query-devtools": "^5.80.10",
    "@trpc/client": "catalog:",
    "@trpc/server": "catalog:",
    "lucide-react": "^0.441.0",
    "next": "^15.3.4",
    "react": "catalog:react19",
    "react-dom": "catalog:react19",
    "superjson": "^2.2.1",
    "tailwindcss": "catalog:",
    "zod": "catalog:"
  }
}
```

## tRPC Route Patterns

### Admin Routes (bio.route.ts)
Following the established naming conventions:
- `bio.byWorkspace` - Get paginated list for a workspace
- `bio.byId` - Get single bio by ID  
- `bio.byHandle` - Get bio by workspace handle
- `bio.totalByWorkspace` - Get count for workspace
- `bio.create` - Create new bio
- `bio.update` - Update existing bio
- `bio.archive` - Soft archive (set archivedAt)
- `bio.delete` - Soft delete (set deletedAt)
- `bio.duplicate` - Clone a bio template
- `bio.reorderButtons` - Update button positions

### Public Routes (bio-render.route.ts)
- `bioRender.byHandle` - Get public bio by handle
- `bioRender.log` - Log analytics events
- `bioRender.captureEmail` - Handle email submission with rate limiting
- `bioRender.trackClick` - Track link clicks with position

## Validation Schema Patterns

Using `drizzle-zod` for auto-generation from Drizzle tables:

```typescript
// packages/validators/src/schemas/bio.schema.ts
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { Bios } from '@barely/db/sql';

// Auto-generated schemas
export const insertBioSchema = createInsertSchema(Bios, {
  name: name => name.min(1, 'Name is required'),
  handle: handle => handle.regex(/^[a-z0-9-]+$/, 'Invalid handle format'),
});

// CRUD schemas following patterns
export const createBioSchema = insertBioSchema.omit({
  id: true,
  workspaceId: true,
});

export const updateBioSchema = insertBioSchema
  .partial()
  .required({ id: true });

// Public schemas (minimal exposure)
export const publicBioSchema = createSelectSchema(Bios)
  .pick({
    name: true,
    handle: true,
    avatarUrl: true,
    bio: true,
    theme: true,
    emailCaptureEnabled: true,
    emailIncentiveText: true,
  });

// Filter schemas
export const bioFilterSchema = commonFiltersSchema.extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
```

## Configuration Updates Required

### 1. App Constants
```typescript
// packages/const/src/app.constants.ts
export const APPS = [
  'app', 'cart', 'fm', 'link', 'page', 
  'press', 'www', 'nyc', 'vip', 
  'bio', // Add bio app
] as const;
```

### 2. URL Configuration
```typescript
// packages/auth/src/get-url.ts
if (isDevelopment()) {
  const portMap = {
    // ... existing apps
    bio: process.env.NEXT_PUBLIC_BIO_DEV_PORT ?? '3011',
  };
}

const urlMap = {
  // ... existing apps
  bio: process.env.NEXT_PUBLIC_BIO_BASE_URL ?? 'https://bio.barely.ai',
};
```

### 3. Environment Variables
```typescript
// packages/auth/env.ts
const client = z.object({
  // ... existing vars
  NEXT_PUBLIC_BIO_BASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_BIO_DEV_PORT: z.string().min(1).optional(),
});
```

### 4. ID Prefixes
```typescript
// packages/utils/src/id.ts
const prefixes = {
  // ... existing prefixes
  bio: 'bio',
  bioButton: 'bb',
  bioEmailCapture: 'bec',
} as const;
```

### 5. Database Client Registration
```typescript
// packages/db/src/client.ts
import { Bios, Bios_Relations, BioButtons, BioButtons_Relations } from './sql/bio.sql';

export const dbSchema = {
  // ... existing schemas
  Bios,
  Bios_Relations,
  BioButtons,
  BioButtons_Relations,
};
```

## Rate Limiting & Security

### Public Endpoint Protection
```typescript
// In bio-render.route.ts
import { ratelimit } from '../../integrations/upstash';

// Email capture with rate limiting
captureEmail: publicProcedure
  .input(emailCaptureSchema)
  .mutation(async ({ ctx, input }) => {
    // Rate limit by IP (3 attempts per hour)
    const { success } = await ratelimit(3, '1 h').limit(
      `bio.email.${input.bioId}.${ctx.visitor?.ip ?? '127.0.0.1'}`,
    );
    
    if (!success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many submissions. Please try again later.',
      });
    }
    
    // Use dbPool for transaction
    const pool = dbPool(ctx.pool);
    // ... email capture logic
  }),
```

## Error Handling Patterns

Following TRPCError conventions:
```typescript
import { TRPCError } from '@trpc/server';
import { raise } from '@barely/utils';

// Pattern 1: TRPCError for client errors
if (!bio) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Bio not found',
  });
}

// Pattern 2: raise for server errors
const result = await dbHttp.insert(Bios).values(data).returning();
return result[0] ?? raise('Failed to create bio');
```

## Implementation Checklist

### Bio Page Rendering & Infrastructure

- [ ] Create new Next.js app at `apps/bio` with TypeScript config (Port 3011)
- [ ] Configure subdomain routing for `[handle].barely.bio` pattern
- [ ] Implement ISR with on-demand revalidation API endpoint
- [ ] Create `bio-render.router.ts` in `packages/api/src/public/`
- [ ] Create `bio-render.trpc.react.ts` for React hooks
- [ ] Create `bio-render.handler.ts` for API handling
- [ ] Set up tRPC client with TanStack Query in `apps/bio/src/trpc/`
- [ ] Create bio page component with dynamic handle routing
- [ ] Implement SEO meta tags and OpenGraph image generation
- [ ] Add service worker for offline capability and PWA features
- [ ] Configure CDN and edge caching rules for performance

### Bio Management API & Data Layer

- [ ] Create `bio.schema.ts` using drizzle-zod for validation
- [ ] Implement bio.route.ts with standard naming (byWorkspace, byId, create, update, etc.)
- [ ] Implement bio-render.route.ts for public access (byHandle, log, captureEmail)
- [ ] Add workspace-scoped bio creation with handle validation
- [ ] Use `dbHttp` for single operations, `dbPool` for transactions
- [ ] Implement bio button reordering with lexoRank
- [ ] Create bio duplication/template functionality
- [ ] Add bio publish/unpublish state management
- [ ] Implement bio deletion with cascade handling
- [ ] Add Upstash rate limiting for public endpoints

### Email Capture Integration

- [ ] Extend bio schema with email capture settings (enabled, incentiveText)
- [ ] Create email capture widget component
- [ ] Integrate with `@barely/email` fan creation flow
- [ ] Implement GDPR-compliant consent handling
- [ ] Add email validation and duplicate checking
- [ ] Create welcome email automation trigger
- [ ] Track email capture conversion events
- [ ] Add spam protection (honeypot, rate limiting)

### Theme System & Customization

- [ ] Define 5-10 professional bio themes
- [ ] Implement theme preview in bio editor
- [ ] Create color customization within theme constraints
- [ ] Add font selection system (3-5 options)
- [ ] Implement image shape options (square, circle, rounded)
- [ ] Create social icon color customization
- [ ] Add barely branding toggle for paid tiers
- [ ] Ensure all themes are WCAG AA compliant

### Link & Button Management

- [ ] Create bio button creation/editing UI
- [ ] Implement drag-and-drop reordering interface
- [ ] Add link type detection (URL, email, phone, social)
- [ ] Create smart link suggestions from workspace data
- [ ] Implement embedded music player support
- [ ] Add link scheduling functionality (future)
- [ ] Create link click tracking with position data
- [ ] Add button color customization per link

### Analytics & Tracking

- [ ] Create Tinybird schemas for bio events
- [ ] Implement page view tracking with source attribution
- [ ] Add link click tracking with position and context
- [ ] Create email capture conversion tracking
- [ ] Implement scroll depth and engagement metrics
- [ ] Add UTM parameter preservation through bio flow
- [ ] Create real-time analytics dashboard integration
- [ ] Set up remarketing pixel auto-installation

### Mobile Optimization

- [ ] Implement responsive design for all screen sizes
- [ ] Optimize for Instagram/TikTok in-app browsers
- [ ] Add touch gesture support for link interactions
- [ ] Implement lazy loading for below-fold content
- [ ] Create offline mode with cached content
- [ ] Add install prompt for PWA functionality
- [ ] Optimize images with responsive srcset
- [ ] Test on iOS and Android WebView implementations

### Admin Interface Integration

- [ ] Create bio section in workspace settings
- [ ] Implement bio preview within admin panel
- [ ] Add bio analytics widget to main dashboard
- [ ] Create bio quick-edit actions
- [ ] Implement bio status indicators
- [ ] Add bio QR code generation
- [ ] Create bio sharing tools
- [ ] Add bio performance insights

### Testing & Quality Assurance

- [ ] Write unit tests for bio validation schemas
- [ ] Create integration tests for bio CRUD operations
- [ ] Implement E2E tests for bio page rendering
- [ ] Add visual regression tests for themes
- [ ] Test email capture flow end-to-end
- [ ] Verify analytics accuracy with test events
- [ ] Load test bio pages for performance targets
- [ ] Security test public endpoints and email capture

### Configuration & Setup

- [ ] Add 'bio' to APPS constant in `packages/const/src/app.constants.ts`
- [ ] Update URL handling in `packages/auth/src/get-url.ts` (port 3011)
- [ ] Add environment variables to `packages/auth/env.ts`
- [ ] Add ID prefixes (bio, bb, bec) to `packages/utils/src/id.ts`
- [ ] Register schemas in `packages/db/src/client.ts`
- [ ] Export validators from `packages/validators/src/schemas/index.ts`
- [ ] Update `scripts/dev-qr-codes.sh` with bio port
- [ ] Create package.json with proper dependencies (no @trpc/react-query)

### Migration & Deployment Preparation

- [ ] Create database migration for bio schema updates
- [ ] Implement bio import tool from competitors
- [ ] Add bio export functionality
- [ ] Create bio backup/restore system
- [ ] Set up bio page monitoring and alerts
- [ ] Configure auto-scaling for bio app
- [ ] Create deployment rollback procedures
- [ ] Document bio API for future extensions

---

*Created: 2025-07-31*  
*Updated: 2025-08-09*  
*Version: 2.0 (Aligned with NEW_APP_GUIDELINES)*  
*Feature: barely.bio Link-in-Bio*