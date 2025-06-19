# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development servers for all apps (parallel)
pnpm dev

# Build all apps
pnpm build

# Type checking across all packages
pnpm typecheck

# Linting and formatting
pnpm lint          # Check for lint errors
pnpm lint:fix      # Fix lint errors
pnpm format        # Check formatting
pnpm format:fix    # Fix formatting
```

### Database Commands
```bash
# Database schema management (runs in @barely/lib package)
pnpm db:generate   # Generate TypeScript types from schema
pnpm db:push       # Push schema changes to database
pnpm db:pull       # Pull schema from database
pnpm db:studio     # Open Drizzle Studio for database exploration
pnpm db:check      # Validate schema consistency
```

### Environment Setup
```bash
# Pull environment variables from Vercel
pnpm vercel:pull-env

# Create/reset Neon development branch
pnpm neon:create-dev-branch
pnpm neon:reset-dev-branch
```

### Testing
**Note**: No test framework is currently configured. Consider adding Vitest or Jest for testing.

## Architecture Overview

### Monorepo Structure
- **Turborepo** manages the monorepo with pnpm workspaces
- **Apps** (`/apps/*`): Next.js applications using App Router
  - `app`: Main dashboard (port 3000)
  - `cart`: E-commerce carts (port 3001)
  - `fm`: Music/creator pages (port 3002)
  - `link`: Link shortener (port 3003)
  - `press`: Press kits (port 3007)
  - `www`: Marketing site (port 3009)
- **Packages** (`/packages/*`): Shared code
  - `lib`: Core business logic, API, database schemas
  - `ui`: Shared UI components (shadcn/ui + react-aria)
  - `email`: React Email templates
  - `toast`: Toast notification system
- **External** (`/external/*`): Third-party integrations
  - `tinybird`: Analytics pipelines
  - `image-optimization`: AWS CDK image optimization

### Database Architecture
- **Drizzle ORM** with PostgreSQL (Neon)
- **Schema files**: Located in `packages/lib/server/routes/*/[entity].sql.ts`
- **Multi-tenant**: Workspace-based data isolation
- **Key entities**: Users, Workspaces, Tracks, Playlists, Campaigns, Carts, Links
- **ID generation**: CUID2 for unique identifiers

### API Layer
- **tRPC v11** for type-safe APIs
- **Router structure**: Feature-based routers in `packages/lib/server/routes/*/[entity].router.ts`
- **Procedure types**:
  - `publicProcedure`: No auth required
  - `privateProcedure`: Requires user + workspace
  - `workspaceQueryProcedure`: Workspace-scoped queries
- **OpenAPI support**: REST endpoints via trpc-openapi

### Authentication
- **NextAuth v5** with email-based authentication
- **Session duration**: 30 days
- **Multi-workspace**: Users can belong to multiple workspaces
- **Custom Neon adapter**: `packages/lib/server/auth/neon-adapter.ts`

### Key Integrations
- **Analytics**: Tinybird for event tracking
- **Payments**: Stripe (including Connect)
- **Storage**: AWS S3 for file uploads
- **Email**: Resend, Postmark, SendGrid
- **Real-time**: Pusher for WebSockets
- **Music**: Spotify API integration
- **Social**: Meta (Facebook/Instagram) APIs
- **SMS**: Twilio for messaging

### Development Patterns
- **Feature folders**: Each feature contains router, schema, SQL, and functions
- **Type safety**: Zod schemas for runtime validation
- **Server actions**: Next.js server actions alongside tRPC
- **Background jobs**: Trigger.dev for async processing
- **Environment validation**: Centralized in `packages/lib/env.ts`

### Naming Conventions
- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`)
- **Functions/variables**: camelCase (e.g., `getUserProfile`)
- **SQL tables**: PascalCase (e.g., `Users`)
- **Constants**: UPPER_CASE (e.g., `MAX_FILE_SIZE`)

### Important Notes
- Always use TypeScript strict mode - avoid `any` types
- Follow existing patterns in neighboring files
- UI components use shadcn/ui + react-aria patterns
- Database queries should use prepared statements
- Environment variables are validated at runtime
- All apps share authentication state via NextAuth