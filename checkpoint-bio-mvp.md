# Bio MVP Development Checkpoint

**Branch:** `feature/bio-mvp`  
**Date:** 2025-08-09  
**Status:** Feature 4 Complete - Analytics Dashboard Implemented

## Project Overview

The bio MVP (barely.bio) is a link-in-bio solution integrated into the barely.ai ecosystem. It allows creators to build customizable landing pages with buttons linking to their content, social profiles, and other resources.

## Features Completed

### ✅ Feature 1: MVP Foundation
- **Database Schema**: Complete bio and bio button tables with many-to-many relationships
- **Basic CRUD Operations**: Full tRPC routes for bio and button management
- **Public Rendering**: Server-side rendered bio pages with ISR caching
- **Authentication Integration**: Workspace-based permissions using Better Auth
- **Core UI Components**: Bio editor interface with form handling

### ✅ Feature 2: Link & Button Management
- **Link Type Detection**: Comprehensive detection for 15+ platforms (social, email, phone, URLs)
- **Smart Suggestions**: AI-powered button recommendations from workspace data
- **Drag & Drop Reordering**: Accessible interface using @dnd-kit with LexoRank ordering
- **Theme-Based Styling**: 7 professional themes with platform-specific brand colors
- **Click Tracking**: Complete analytics pipeline with Tinybird ingestion and Meta pixel integration

### ✅ Feature 3: Email Capture & Fan Relationships
- **Email Capture Widget**: Beautiful, responsive component with success states and GDPR compliance
- **Fan Management**: Complete integration with existing fan database and workspace relationships
- **Database Transactions**: Atomic operations ensuring data consistency for fan creation
- **Rate Limiting**: IP-based rate limiting (3 attempts/hour) using Upstash Redis
- **Marketing Consent**: Proper opt-in/opt-out handling with consent tracking
- **Spam Protection**: Honeypot fields and server-side validation
- **Analytics Integration**: Email capture events tracked in Tinybird pipeline
- **Dynamic Rendering**: Bio pages conditionally show email capture based on settings

### ✅ Feature 4: Analytics Dashboard
- **Comprehensive Bio Stats Page**: `/[handle]/bio/stats` with timeseries visualizations
- **Tinybird Integration**: Real-time analytics pipeline with materialized views for bio events
- **Bio Timeseries Chart**: Interactive charts showing views, button clicks, and email captures over time
- **Button Performance Table**: Individual button click tracking with URL-based icon detection
- **Event Type Support**: Added bio/view, bio/buttonClick, bio/emailCapture to analytics system
- **Stat Filters**: Date range selection, toggleable metrics, and badge filtering
- **Geographic & Device Analytics**: Integration with existing location, device, browser, and referrer stats
- **Type-Safe Implementation**: Complete tRPC routes and Zod schemas for bio analytics

## Architecture Overview

### Database Schema (`packages/db/src/sql/bio.sql.ts`)
```sql
-- Bios table: Main bio page configuration
Bios {
  id, workspaceId, handle, route, slug,
  img, imgShape, title, subtitle,
  titleColor, buttonColor, iconColor, textColor,
  socialDisplay, socialButtonColor, socialIconColor,
  theme, barelyBranding,
  emailCaptureEnabled, emailCaptureIncentiveText
}

-- BioButtons table: Individual button configuration
BioButtons {
  id, workspaceId, linkId?, formId?,
  text, buttonColor, textColor, email?, phone?
}

-- Join table: Bio-to-Button relationships with ordering
_BioButtons_To_Bios {
  bioId, bioButtonId, lexoRank
}
```

**Note**: `views` and `clicks` columns intentionally omitted for MVP - tracking handled via Tinybird events instead.

### API Architecture

#### Admin Routes (`packages/lib/src/trpc/routes/bio.route.ts`)
- `bio.byWorkspace()` - List user's bios with pagination
- `bio.byId()` - Get bio with buttons for editing
- `bio.create()` - Create new bio
- `bio.update()` - Update bio configuration
- `bio.delete()` - Soft delete bio
- `bio.getSuggestions()` - Generate smart button suggestions
- `bioButton.create()` - Create new button
- `bioButton.update()` - Update button configuration
- `bioButton.delete()` - Remove button
- `bioButton.reorder()` - Update LexoRank ordering

#### Public Routes (`packages/lib/src/trpc/routes/bio-render.route.ts`)
- `bio.byHandle()` - Get public bio data with ISR caching and email capture settings
- `bio.log()` - Track bio/button events (view, buttonClick, emailCapture)
- `bio.captureEmail()` - Handle email capture with fan creation and consent tracking

### Core Functions

#### Link Type Detection (`packages/lib/src/functions/link-type.fns.ts`)
- `detectLinkType(input)` - Identify link types from URLs/text
- `formatLinkUrl(input, type?)` - Standardize URLs with proper protocols
- `validateLink(input, type?)` - Validate link format
- `suggestLinkText(url, type?)` - Generate appropriate button text
- `getLinkTypeInfo(type)` - Get display info (icon, color, name)

Supports: `url | email | phone | spotify | apple_music | youtube | instagram | tiktok | twitter | facebook | soundcloud | bandcamp | patreon | discord | twitch`

#### Smart Suggestions (`packages/lib/src/functions/bio-suggestions.fns.ts`)
- `generateBioButtonSuggestions(params)` - Generate prioritized button suggestions
- Sources: Workspace links, tracks, Spotify artist profile, social profiles
- Priority-based ranking system (100-50 scale)

#### Analytics Tracking (`packages/lib/src/functions/bio-event.fns.ts`)
- `recordBioEvent()` - Complete event tracking pipeline
- **Events**: `bio/view`, `bio/buttonClick`, `bio/emailCapture`
- **Integrations**: Tinybird ingestion + Meta pixel reporting
- **Rate limiting**: 1 event per IP per hour (1 second in dev)
- **Usage limits**: Respects workspace event usage quotas

#### Theme System (`packages/lib/src/functions/bio-themes.ts`)
- **7 Themes**: `default | minimal | neon | sunset | ocean | forest | monochrome`
- **Platform Colors**: Brand-accurate colors for social platforms
- **CSS Variables**: Dynamic theming with CSS custom properties

### UI Components

#### Core Components (`apps/app/src/app/bio/[bioId]/`)
- `page.tsx` - Main bio editor layout
- `bio-form.tsx` - Bio configuration form with theme selector
- `button-list.tsx` - Drag-and-drop button management
- `button-form.tsx` - Button creation/editing modal
- `theme-selector.tsx` - Live theme preview interface

#### Form Patterns
All forms follow established barely.ai patterns:
- `useZodForm` hook for state management
- Form components from `@barely/ui/forms/` (TextField, SubmitButton, etc.)
- Zod v4 schemas for validation
- `z.email()` syntax for email validation

### Public Rendering (`apps/bio/`)
- **Next.js App Router**: Server-side rendering with ISR
- **Route Structure**: `[handle]/` for bio pages
- **Caching**: 60-second ISR with on-demand revalidation
- **Analytics**: Automatic view/click tracking via tRPC mutations
- **Email Capture**: Dynamic rendering based on bio settings
- **Responsive Design**: Mobile-first with theme-based styling

## Integration Points

### Authentication & Authorization
- **Better Auth**: Session-based authentication
- **Workspace Model**: Multi-tenant architecture
- **Route Protection**: All admin routes require valid workspace session

### Analytics Pipeline
- **Tinybird**: Real-time event ingestion following FM app patterns
- **Meta Pixel**: Facebook/Instagram conversion tracking
- **Event Schema**: Standardized web event format with visitor context
- **Rate Limiting**: Upstash Redis for event throttling

### Database Integration
- **Drizzle ORM**: Type-safe database operations
- **Neon PostgreSQL**: Production database with connection pooling
- **Soft Deletes**: All entities support `deletedAt` timestamps
- **CUID2 IDs**: Consistent ID generation across the platform

### Fan Management Integration
- **Fan Database**: Seamless integration with existing fan schema
- **Workspace Relations**: Many-to-many fan-workspace relationships
- **Marketing Consent**: Proper consent tracking with opt-in/opt-out
- **Source Attribution**: Bio referrals tracked via `appReferer` field
- **Duplicate Handling**: Email-based deduplication with consent updates

## Development Commands

```bash
# Development
pnpm dev                    # Start all services
pnpm dev:app               # Start just the main app

# Database
pnpm db:push               # Push schema changes
pnpm db:studio             # Open Drizzle Studio

# Code Quality
pnpm typecheck             # TypeScript compilation
pnpm lint                  # ESLint checks
pnpm lint:fix             # Auto-fix linting issues

# Testing
pnpm test                  # Run test suite
```

## Known Limitations & TODOs

### Email Capture
- **Welcome Email Automation**: Framework ready, requires trigger implementation
- **Email Templates**: Basic success messages, could be enhanced with custom templates
- **A/B Testing**: Email capture variations not implemented (future enhancement)

### Analytics
- **Link URL Extraction**: `linkClickDestinationHref` currently set to `null`
  - Requires proper link relation loading in bio-event tracking
  - Marked with TODO comments
- **Email Analytics Dashboard**: Capture rates and conversion metrics (future feature)

### Feature Scope
- **Custom Color Overrides**: Intentionally excluded from MVP
  - Only theme-based colors implemented
  - Reduces complexity and accessibility concerns
- **Music Player**: Framework ready but not fully implemented
  - VIP app patterns available for reference

## Next Steps: Feature 5+

With Feature 4 (Analytics Dashboard) complete, upcoming development could include:
- **Advanced Customization**: Custom themes, backgrounds, and layouts
- **Enhanced Music Integration**: Full player implementation with playlist support
- **A/B Testing**: Email capture and button optimization experiments
- **Welcome Email Automation**: Trigger-based email sequences for new subscribers
- **QR Code Generation**: Dynamic QR codes for offline-to-online marketing
- **Link Scheduling**: Time-based button visibility and scheduling
- **Bio Templates**: Pre-designed templates for different creator types

## File Structure Reference

### Core Implementation Files
```
packages/
├── db/src/sql/bio.sql.ts                    # Database schema
├── lib/src/
│   ├── functions/
│   │   ├── bio-event.fns.ts                # Analytics tracking
│   │   ├── bio-suggestions.fns.ts          # Smart suggestions
│   │   ├── bio-themes.ts                   # Theme system
│   │   └── link-type.fns.ts               # Link detection
│   └── trpc/routes/
│       ├── bio.route.ts                   # Admin API routes
│       └── bio-render.route.ts            # Public API routes

apps/
├── app/src/app/bio/[bioId]/               # Admin UI components
└── bio/src/app/[handle]/                  # Public bio pages with email capture
```

### Configuration Files
- `packages/const/src/event.constants.ts` - Bio event types
- `packages/utils/src/id.ts` - Bio button ID prefix ('bb')
- `packages/validators/src/schemas/` - Zod validation schemas

## Environment & Dependencies

### Key Dependencies
- **@dnd-kit/core** - Drag and drop functionality
- **@dnd-kit/sortable** - Sortable list implementation
- **lexorank** - Fractional ordering system
- **tinybird** - Analytics ingestion
- **better-auth** - Authentication system
- **@upstash/redis** - Rate limiting for email capture
- **@tanstack/react-query** - Client-side data fetching and mutations

### Environment Variables
All bio-related environment variables inherit from the main barely.ai configuration. No additional bio-specific environment setup required.

---

**Ready State**: Feature 4 complete! Analytics dashboard fully implemented with:
- ✅ Complete Tinybird analytics pipeline for bio events
- ✅ Interactive timeseries visualizations for views, clicks, and email captures
- ✅ Button performance analytics with individual click tracking
- ✅ Geographic and device analytics integration
- ✅ Real-time data processing with materialized views
- ✅ Type-safe tRPC routes and Zod schemas
- ✅ Responsive dashboard UI following established patterns

**Analytics Implementation Summary**:
- **Tinybird Pipes**: Created `barely_bio_events_pipe.pipe`, `v2_bio_timeseries.pipe`, `v2_bio_buttonStats.pipe`
- **TypeScript Integration**: Added bio queries to `packages/tb/src/query/events.ts`
- **tRPC Routes**: Added `bioTimeseries` and `bioButtonStats` to `stat.route.ts`
- **React Components**: `bio-stat-header.tsx`, `bio-timeseries.tsx`, `bio-button-stats.tsx`
- **Hook Integration**: Created `use-bio-stat-filters.ts` for state management

**Core Value**: Bio creators now have comprehensive analytics to understand their audience engagement, optimize button placement, and track email capture conversion rates. This data-driven approach enables creators to make informed decisions about their bio page strategy and measure the effectiveness of their marketing efforts.