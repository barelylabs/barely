# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

barely.io is an open-source marketing platform for independent musicians built as a Turborepo monorepo with 9 Next.js applications and shared packages.

## Development Commands

### Environment Setup
```bash
# First-time setup: pull environment and set up database
pnpm dev:pull

# Start all apps in development (includes QR codes for mobile testing)
pnpm dev

# Start specific app
pnpm dev --filter=@barely/app

# Enable development environment
pnpm dev:enable
```

### Database Operations
```bash
# Open database studio
pnpm db:studio

# Push schema changes to database
pnpm db:push

# Generate database migrations
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Pull database from production
pnpm db:pull

# Seed database with sample data
pnpm db:seed
```

### Code Quality
```bash
# Lint all packages
pnpm lint

# Format all code
pnpm format

# Type check all packages
pnpm typecheck

# Fix linting issues
pnpm lint:fix
```

### Build & Deploy
```bash
# Build all apps
pnpm build

# Build for preview
pnpm build:preview

# Build for production
pnpm build:production

# Deploy to staging
pnpm deploy:staging

# Deploy to production
pnpm deploy:production
```

## Architecture

### Monorepo Structure
- **Apps** (9 Next.js applications):
  - `app` (port 3000) - Main dashboard
  - `cart` (port 3001) - E-commerce checkout
  - `fm` (port 3002) - Music streaming aggregator
  - `link` (port 3003) - Link management
  - `page` (port 3004) - Landing page builder
  - `press` (port 3005) - Press kit builder
  - `www` (port 3006) - Marketing website
  - `manage-email` (port 3007) - Email management
  - `sparrow` (port 3008) - Music marketing agency (coaching & campaign services)

- **Packages**:
  - `@barely/lib` - Core business logic, database, auth, APIs
  - `@barely/ui` - Shared React components and design system  
  - `@barely/email` - Email templates with React Email
  - `@barely/toast` - Toast notification system

- **Tooling**:
  - `@barely/eslint-config` - ESLint configurations
  - `@barely/prettier-config` - Code formatting rules
  - `@barely/tailwind-config` - Design system tokens
  - `@barely/tsconfig` - TypeScript configurations

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query
- **Backend**: tRPC, NextAuth.js, Drizzle ORM
- **Database**: Neon Postgres (with individual developer branches)
- **Analytics**: Tinybird for real-time event tracking
- **File Storage**: AWS S3 with CloudFront CDN
- **Payments**: Stripe with Connect for marketplace functionality
- **Email**: Resend for sending, React Email for templates
- **Background Jobs**: Trigger.dev
- **Real-time**: Pusher for live updates

### Development Environment
- All apps use HTTPS in development with self-signed certificates
- Individual Neon database branches per developer (`dev-{username}`)
- Complex environment setup with 40+ variables managed via Vercel integration
- QR code generation for mobile testing (`pnpm qr`)
- Node.js >= 22.14.0 required
- pnpm 10.11.1 required (exact version)

### Key Architectural Patterns

#### tRPC API Structure
- Routes organized by domain (user, workspace, fan, track, etc.)
- CRUD operations follow naming convention: `byId`, `byWorkspace`, `create`, `update`, `delete`
- Analytics events tracked via Tinybird integration
- File uploads handled through S3 presigned URLs

#### Database Schema
- Multi-tenant with workspace-based data isolation
- Fan management with segments and groups
- Link tracking with detailed analytics
- Email campaigns with automation workflows
- E-commerce with products, carts, and orders

#### Component Architecture
- Context components for data fetching and state management
- Filter components for list views with URL state persistence
- Modal components for CRUD operations
- Table components with sorting, filtering, and pagination

### File Upload System
The system uses direct S3 uploads with presigned URLs for scalability:

#### Upload Flow
1. Client requests presigned URL from tRPC endpoint (`file.presigned`)
2. File uploaded directly to S3 bucket (bypassing server)
3. Database record created with file metadata
4. CloudFront serves optimized images with on-the-fly transformations

#### Upload Types
- **Single-part uploads**: Images under 50MB using presigned POST URLs
- **Multi-part uploads**: Large files (audio/video) using chunked PUT requests
- **Bulk uploads**: Up to 50 files simultaneously in media library

#### File Organization
Files stored in S3 with pattern: `{workspaceId}/{folder}/{fileId}`
- `avatars/` - Profile pictures
- `headers/` - Header images  
- `product-images/` - Product photos
- `press-photos/` - Press kit photos
- `tracks/` - Audio files (master, instrumental, stems)
- `imports/fans/` - CSV imports

#### Database Schema
Files table tracks:
- Upload status (pending/uploading/processing/complete/failed)
- File metadata (size, dimensions, duration, blurHash)
- S3 location (bucket, key, folder)
- Relationships via join tables for many-to-many associations

#### Image Optimization
CloudFront integration with Lambda@Edge for:
- Dynamic resizing: `?width=400&height=300`
- Format conversion: `?format=webp`
- Quality adjustment: `?quality=80`
- Automatic WebP serving for supported browsers

#### Key Components
- `useUpload` hook: `packages/lib/hooks/use-upload.ts` - Main upload hook with progress tracking
- Presigned URL generation: `packages/lib/files/s3-presign.ts` - Handles single/multi-part presigning
- File tRPC routes: `packages/lib/server/routes/file/index.ts` - File management API
- Upload utilities: `packages/lib/files/client.ts` - Client-side upload logic

#### Upload Contexts
- **Workspace Settings**: Avatar and header images (single file)
- **Product Images**: Multiple sortable images with drag-and-drop
- **Track Audio**: Master, instrumental, and stem files
- **Press Kit**: Sortable press photos
- **Media Library**: Bulk uploads up to 50 files
- **CSV Imports**: Fan data imports

#### Security & Validation
- File type validation on client and server
- Configurable size limits (default ~5GB)
- Workspace file usage tracking
- Presigned URLs with expiration
- ACL control (public-read by default)
- Automatic blurhash generation for image placeholders

### Analytics Integration
Real-time analytics powered by Tinybird:
- Link click tracking with device/location data
- Email open/click tracking
- Custom event tracking for user actions
- Time-series data for reporting dashboards

### Workflow System
Automated sequences built with:
- Flow builder for visual workflow creation
- Trigger conditions (time-based, event-based)
- Actions (send email, add to segment, etc.)
- Background job processing via Trigger.dev

### Authentication System
- NextAuth.js with email magic links
- Session stored in JWT
- Workspace-based permissions
- Multi-workspace support per user

### Email System
- React Email for template creation
- Resend for transactional emails
- MDX support for dynamic content
- Domain verification for custom sending

### Background Jobs
- Trigger.dev for job processing
- Workflows defined in `packages/lib/trigger/`
- Automatic retries and error handling
- Event-driven architecture

## Development Workflow

### Adding New Features
1. Create feature branch from main
2. Add tRPC routes in `packages/lib/server/routes/`
3. Create UI components in `packages/ui/components/`
4. Implement pages in relevant app directory
5. Add analytics tracking if needed
6. Update database schema if required

### Component Development
- Follow existing patterns in `packages/ui/components/`
- Use context components for data management
- Implement proper loading and error states
- Add TypeScript interfaces for all props

### Database Changes
1. Update schema in `packages/lib/server/db/schema/`
2. Generate migration: `pnpm db:generate`
3. Apply migration: `pnpm db:push`
4. Update seed data if necessary

## Testing

Currently, there are no test suites in the project. When implementing tests:
- Use the existing test scripts in package.json
- Follow testing patterns established in similar Next.js projects

## Deployment

The platform uses Vercel for deployment with:
- Automatic deployments on push to main
- Preview deployments for pull requests
- Environment variables synced from Vercel CLI
- Database migrations run automatically via GitHub Actions

## Common Patterns

### tRPC Route Example
```typescript
export const trackRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Implementation
    }),
  
  byWorkspace: workspaceProcedure
    .input(selectTracksSchema)
    .query(async ({ input, ctx }) => {
      // Implementation with workspace context
    }),
});
```

### Component Context Pattern
```typescript
// Context for data fetching and state
const TrackContext = ({ children, workspaceId }) => {
  // tRPC queries and mutations
  return <TrackContextProvider>{children}</TrackContextProvider>
}

// Filter component for URL state
const TrackFilters = () => {
  // URL state management with next/navigation
}

// Table component for data display
const TrackTable = () => {
  // Table with sorting, filtering, pagination
}
```

## Port Management

If ports are in use, run the port management script:
```bash
node scripts/kill-ports.js
```

This will terminate processes on ports 3000-3008 and allow development servers to start properly.

## Coding Conventions (from .cursorrules)

- Use functional components with TypeScript
- Implement responsive design with a mobile-first approach
- Use descriptive variable names (e.g., `isLoading`, `hasError`)
- Structure files: exports, imports, types, components, utilities
- Use Tailwind classes for styling, avoid arbitrary values
- Handle errors gracefully with try-catch blocks
- Show loading states during async operations
- Make forms accessible with proper labels and ARIA attributes
- Use semantic HTML elements
- Implement keyboard navigation support
- Announce changes to screen readers
- Favor named exports for components
```

### Code Quality Commands

- When typechecking the monorepo, run "pnpm typecheck" from the root of the monorepo. Same for link -- "pnpm lint"
