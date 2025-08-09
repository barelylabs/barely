# barely.bio Technical Implementation Plan (Feature-Organized)

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

9. **Naming Conventions**: Follow established patterns (byWorkspace, byId, create, update) for consistency across the monorepo.

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

## Required Configuration Updates

Before implementing any features, these configuration updates must be completed:

### Package.json Dependencies
```json
{
  "name": "@barely/bio",
  "version": "0.1.0",
  "scripts": {
    "dev": "pnpm with-env next dev --experimental-https --port=3011"
  },
  "dependencies": {
    "@barely/api": "workspace:*",
    "@barely/validators": "workspace:*",
    "@tanstack/react-query": "catalog:",
    "@trpc/client": "catalog:",
    "@trpc/server": "catalog:",
    "superjson": "^2.2.1"
    // Note: NO @trpc/react-query
  }
}
```

### Configuration Files
- **App Constants**: Add 'bio' to `packages/const/src/app.constants.ts`
- **URL Configuration**: Update `packages/auth/src/get-url.ts` with port 3011
- **Environment Variables**: Add to `packages/auth/env.ts`
- **ID Prefixes**: Add bio, bb, bec to `packages/utils/src/id.ts`
- **Database Client**: Register schemas in `packages/db/src/client.ts`
- **Scripts**: Update `scripts/dev-qr-codes.sh` with bio:3011

## Implementation Checklist (Organized by Feature)

### 🏗️ Feature 1: MVP Foundation - Basic Bio Page Creation & Viewing

This foundational feature enables artists to create a bio page and fans to view it. Must be completed first as all other features depend on it.

**Infrastructure & Setup**
- [ ] Create new Next.js app at `apps/bio` with TypeScript config (Port 3011)
- [ ] Configure subdomain routing for `[handle].barely.bio` pattern
- [ ] Configure CDN and edge caching rules for performance
- [ ] Set up tRPC client with TanStack Query and SuperJSON
- [ ] Create bio-render router, handler, and React hooks in `packages/api/src/public/`

**Data Layer & Validation**
- [ ] Create `bio.schema.ts` using drizzle-zod for auto-generated validation
- [ ] Define insertBioSchema, createBioSchema, updateBioSchema, publicBioSchema
- [ ] Extend bio schema with email capture settings (enabled, incentiveText)
- [ ] Create database migration for bio schema updates
- [ ] Register schemas in database client and validator exports

**API Development**
- [ ] Create bio.route.ts with standard naming (byWorkspace, byId, create, update)
- [ ] Create bio-render.route.ts for public access (byHandle, log, captureEmail)
- [ ] Use `satisfies TRPCRouterRecord` for type safety
- [ ] Use dbHttp for single operations, dbPool for transactions
- [ ] Add workspace-scoped bio creation with handle validation
- [ ] Add bio publish/unpublish state management
- [ ] Implement bio deletion with cascade handling
- [ ] Add Upstash rate limiting for public endpoints

**Frontend Implementation**
- [ ] Create bio page component with dynamic handle routing
- [ ] Implement ISR with on-demand revalidation API endpoint
- [ ] Implement SEO meta tags and OpenGraph image generation
- [ ] Create bio section in workspace settings
- [ ] Implement bio preview within admin panel

**Testing**
- [ ] Write unit tests for bio validation schemas
- [ ] Create integration tests for bio CRUD operations
- [ ] Implement E2E tests for bio page rendering
- [ ] Security test public endpoints and email capture

### 🔗 Feature 2: Link & Button Management

Enables artists to add, edit, reorder, and customize links on their bio page.

**Data & API**
- [ ] Implement bio.reorderButtons route with lexoRank
- [ ] Add link type detection (URL, email, phone, social)
- [ ] Create smart link suggestions from workspace data
- [ ] Use proper TRPCError for client errors, raise for server errors

**UI Components**
- [ ] Create bio button creation/editing UI
- [ ] Implement drag-and-drop reordering interface
- [ ] Add button color customization per link
- [ ] Implement embedded music player support

**Analytics Integration**
- [ ] Create link click tracking with position data
- [ ] Add link click tracking with position and context

**Future Enhancements**
- [ ] Add link scheduling functionality (future)

**Testing**
- [ ] Test drag-and-drop functionality across devices
- [ ] Verify link type detection accuracy

### 📧 Feature 3: Email Capture & Fan Relationships

Core differentiator that converts bio visitors into email subscribers.

**Backend Integration**
- [ ] Integrate with `@barely/email` fan creation flow
- [ ] Use dbPool for email capture transaction (fan creation + email record)
- [ ] Add email validation and duplicate checking
- [ ] Create welcome email automation trigger
- [ ] Implement GDPR-compliant consent handling
- [ ] Rate limit by IP (3 attempts per hour) using Upstash

**Frontend Components**
- [ ] Create email capture widget component
- [ ] Add spam protection (honeypot, rate limiting)

**Analytics**
- [ ] Track email capture conversion events
- [ ] Create email capture conversion tracking

**Testing**
- [ ] Test email capture flow end-to-end
- [ ] Verify GDPR compliance

### 📊 Feature 4: Analytics & Behavior Tracking

Provides insights into fan engagement and content performance.

**Analytics Infrastructure**
- [ ] Create Tinybird schemas for bio events
- [ ] Implement page view tracking with source attribution
- [ ] Implement scroll depth and engagement metrics
- [ ] Add UTM parameter preservation through bio flow
- [ ] Set up remarketing pixel auto-installation

**Dashboard Integration**
- [ ] Create real-time analytics dashboard integration
- [ ] Add bio analytics widget to main dashboard
- [ ] Add bio performance insights

**Testing**
- [ ] Verify analytics accuracy with test events
- [ ] Test remarketing pixel firing

### 🎨 Feature 5: Theme Customization & Branding

Allows artists to customize the look and feel of their bio page.

**Theme System**
- [ ] Define 5-10 professional bio themes
- [ ] Create color customization within theme constraints
- [ ] Add font selection system (3-5 options)
- [ ] Implement image shape options (square, circle, rounded)
- [ ] Create social icon color customization
- [ ] Add barely branding toggle for paid tiers

**Editor Experience**
- [ ] Implement theme preview in bio editor
- [ ] Create bio duplication/template functionality
- [ ] Create bio quick-edit actions

**Quality Assurance**
- [ ] Ensure all themes are WCAG AA compliant
- [ ] Add visual regression tests for themes

### 📱 Feature 6: Mobile Optimization & Performance

Ensures excellent experience on mobile devices where 90% of traffic originates.

**Performance Optimization**
- [ ] Implement responsive design for all screen sizes
- [ ] Optimize for Instagram/TikTok in-app browsers
- [ ] Implement lazy loading for below-fold content
- [ ] Optimize images with responsive srcset

**Progressive Web App**
- [ ] Add service worker for offline capability and PWA features
- [ ] Create offline mode with cached content
- [ ] Add install prompt for PWA functionality

**Interaction Enhancement**
- [ ] Add touch gesture support for link interactions

**Testing**
- [ ] Test on iOS and Android WebView implementations
- [ ] Load test bio pages for performance targets

### 🛠️ Feature 7: Admin Tools & Management

Provides workspace admins with tools to manage and monitor bio pages.

**Management Tools**
- [ ] Implement bio status indicators
- [ ] Add bio QR code generation
- [ ] Create bio sharing tools

**Import/Export**
- [ ] Implement bio import tool from competitors
- [ ] Add bio export functionality
- [ ] Create bio backup/restore system

**Monitoring & Operations**
- [ ] Set up bio page monitoring and alerts
- [ ] Configure auto-scaling for bio app
- [ ] Create deployment rollback procedures
- [ ] Document bio API for future extensions

## Implementation Order Recommendation

1. **Feature 1 (MVP Foundation)** - Must be completed first
2. **Feature 2 (Link Management)** - Core functionality needed for useful bio pages
3. **Feature 6 (Mobile Optimization)** - Critical for 90% of users
4. **Feature 3 (Email Capture)** - Key differentiator and value prop
5. **Feature 4 (Analytics)** - Provides value insights
6. **Feature 5 (Themes)** - Enhanced customization
7. **Feature 7 (Admin Tools)** - Management and scaling features

---

*Created: 2025-07-31*  
*Updated: 2025-08-09*  
*Version: 2.0 (Aligned with NEW_APP_GUIDELINES)*  
*Feature: barely.bio Link-in-Bio*