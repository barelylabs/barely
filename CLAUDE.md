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
pnpm dev -F @barely/app

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

- **Packages** (14 shared packages):

  - `@barely/api` - TRPC API routes and handlers
  - `@barely/atoms` - Jotai atoms for state management
  - `@barely/auth` - Authentication using better-auth
  - `@barely/const` - Shared constants
  - `@barely/db` - Database schema and client (Drizzle ORM)
  - `@barely/email` - Email templates with React Email
  - `@barely/files` - S3 file upload utilities
  - `@barely/hooks` - Shared React hooks
  - `@barely/lib` - Core business logic and utilities
  - `@barely/tb` - Tinybird analytics integration
  - `@barely/toast` - Toast notification system
  - `@barely/ui` - Component library and design system
  - `@barely/utils` - Utility functions
  - `@barely/validators` - Zod schemas and validators

- **Tooling** (in `tooling/` directory):
  - `@barely/eslint-config` - ESLint configurations
  - `@barely/prettier-config` - Code formatting rules
  - `@barely/tailwind-config` - Design system tokens
  - `@barely/typescript-config` - TypeScript configurations
  - `@barely/github` - GitHub Actions workflows

### Tech Stack

- **Frontend**: Next.js (latest), React 19, TypeScript, Tailwind CSS, TanStack Query
- **Backend**: tRPC v11, better-auth, Drizzle ORM
- **Database**: Neon Postgres (with individual developer branches)
- **State Management**: Jotai atoms for global state
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

- `useUpload` hook: `apps/app/src/_hooks/use-upload.ts` - Main upload hook with progress tracking
- Presigned URL generation: `packages/files/src/s3-presign.ts` - Handles single/multi-part presigning
- File tRPC routes: `packages/api/src/routes/file.route.ts` - File management API
- Upload utilities: `packages/files/src/client.ts` - Client-side upload logic

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

### Flow System (formerly Workflows)

Automated sequences built with:

- Flow builder for visual workflow creation using React Flow
- Trigger conditions (time-based, event-based)
- Actions (send email, add to segment, etc.)
- Background job processing via Trigger.dev
- Node-based visual editor with drag-and-drop

### Authentication System

- better-auth for authentication (replaced NextAuth)
- Email magic links and OAuth providers
- Session management with secure cookies
- Workspace-based permissions
- Multi-workspace support per user

### Email System

- React Email for template creation
- Resend for transactional emails
- MDX support for dynamic content
- Domain verification for custom sending

### Background Jobs

- Trigger.dev for job processing
- Jobs defined with type-safe schemas
- Automatic retries and error handling
- Event-driven architecture
- Integration with email campaigns and automation flows

## Development Workflow

### Adding New Features

1. Create feature branch from main
2. Add tRPC routes in `packages/api/src/routes/`
3. Create UI components in `packages/ui/src/components/`
4. Implement pages in relevant app directory
5. Add analytics tracking via Tinybird if needed
6. Update database schema in `packages/db/src/schema/`
7. Create validators in `packages/validators/src/`

### Adding New tRPC Subrouters

When creating a new subrouter handler in `packages/api/src/app/sub/`, you **must** also create the corresponding API route in the main app:

1. Create handler in `packages/api/src/app/sub/{feature}.handler.ts`
2. Create corresponding route in `apps/app/src/app/api/trpc/{feature}/[trpc]/route.ts`:

```typescript
import { OPTIONS } from '@barely/utils';
import { featureHandler } from '@barely/api/app/sub/feature.handler';

export { OPTIONS, featureHandler as GET, featureHandler as POST };
```

**Note**: The route folder name should use camelCase (e.g., `emailBroadcast` not `email-broadcast`)

### Component Development

- Follow existing patterns in `packages/ui/src/components/`
- Use context components for data management
- Implement proper loading and error states with Suspense
- Add TypeScript interfaces for all props
- Use Jotai atoms for shared state when needed

### Database Changes

1. Update schema in `packages/db/src/schema/`
2. Generate migration: `pnpm db:generate`
3. Apply migration: `pnpm db:push`
4. Update seed data if necessary
5. Ensure type safety with generated types

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
	byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
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
// Context for data fetching and state with TanStack Query
const TrackContext = ({ children, workspaceId }) => {
  // Using useSuspenseInfiniteQuery for data fetching
  const query = useSuspenseInfiniteQuery({
    queryKey: api.track.byWorkspace.queryKey({ handle }),
    queryFn: api.track.byWorkspace.queryFn({ handle }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return <TrackContextProvider value={...}>{children}</TrackContextProvider>
}

// Filter component for URL state
const TrackFilters = () => {
  // URL state management with useTypedOptimisticQuery hook
}

// Grid/Table component for data display
const AllTracks = () => {
  // Using GridList from @barely/ui with infinite scroll
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

- When typechecking the monorepo, run "pnpm typecheck" from the root of the monorepo. Same for linting -> "pnpm lint"

```

## TypeScript Best Practices

- **Type Safety Principle**:
  - NEVER cast something to `any` or `unknown` if you're running into type errors. That is the kind of decision that only a human engineer can make, and only if we've exhausted all other proper methods for resolving a type issue.

```

## Best Practices

- **File Management**:
  - Whenever moving files, always use git mv so the git history is retained

- **Sed Usage**:
  - When using `sed -i` on macOS, always pass an empty string as the extension parameter to prevent creating backup files. Use `sed -i '' -e …` to avoid generating unwanted backup files with a "-E" extension.
```

### File Management Best Practices

- Whenever moving files or folders, use git mv whenever possible to maintain git history. If the file isn't git tracked (you get an error from git mv), then you just copy manually.

```

- If you create script files for your tasks (e.g. creating a 'fix-imports.sh' file), make sure to clean it up once you're done using it.

## Recent Migration (December 2024)

The codebase underwent a major refactor with the following changes:

### Package Reorganization
- Moved from monolithic `@barely/lib` to dedicated packages:
  - `@barely/api` - All tRPC routes and API logic
  - `@barely/auth` - Authentication with better-auth (replaced NextAuth)
  - `@barely/db` - Database schema and Drizzle ORM
  - `@barely/atoms` - Jotai atoms for state management
  - `@barely/hooks` - Shared React hooks
  - `@barely/files` - S3 file upload utilities
  - `@barely/validators` - Zod schemas and validation
  - `@barely/tb` - Tinybird analytics
  - `@barely/const` - Shared constants
  - `@barely/utils` - Utility functions

### Technology Updates
- **React 19**: Upgraded from React 18 to React 19
- **Next.js**: Updated to latest version with App Router
- **Authentication**: Migrated from NextAuth.js to better-auth
- **State Management**: Using Jotai for atoms-based state
- **tRPC v11**: Updated with new TanStack Query integration pattern
- **TypeScript**: Stricter type checking, resolved all type errors

### API Pattern Changes
- New tRPC pattern with TanStack Query for better type safety
- Infinite queries now use `useSuspenseInfiniteQuery`
- All routes moved to `packages/api/src/routes/*.route.ts`
- Consistent pagination with cursor-based navigation

### Removed Features
- Workflows system (replaced by Flows with visual editor)
- Legacy middleware implementations
- TYPE_ERRORS_CHECKLIST.md (all type errors resolved)

### Import Path Updates
When working with the codebase, use these import paths:
- `import { api } from '~/trpc/react'` - For client-side tRPC
- `import { api } from '~/trpc/server'` - For server-side tRPC
- `import type { AppRouterOutputs } from '@barely/api'` - For types
- `import { useUser } from '@barely/hooks/use-user'` - For hooks
- `import { Button } from '@barely/ui/elements/button'` - For UI components
```
