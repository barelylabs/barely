# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

barely.ai is an open-source marketing stack for creators, helping indie creators build sustainable businesses through tools for links, carts, press kits, and more.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with customized shadcn/ui components
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Analytics**: Tinybird
- **API**: tRPC with typesafe routes
- **Authentication**: Better Auth
- **Background Jobs**: Trigger.dev v3
- **Monorepo**: Turborepo with pnpm workspaces
- **Testing**: Vitest with React Testing Library
- **Deployment**: Vercel

## Repository Structure

```
apps/
  app/         # Main application (app.barely.ai)
  cart/        # E-commerce cart
  fm/          # FM application
  link/        # Link shortener
  www/         # Marketing website
  press/       # Press kit
  page/        # Landing pages
  nyc/         # NYC specific app

packages/
  auth/        # Authentication with Better Auth
  db/          # Database schema and client (Drizzle)
  lib/         # Core business logic and tRPC routes
  tb/          # Tinybird analytics integration
  ui/          # Shared UI components
  email/       # Email templates (React Email)
  validators/  # Zod schemas
  utils/       # Shared utilities
  const/       # Constants and configuration
```

## Development Commands

### Setup & Installation

```bash
pnpm install                    # Install dependencies
pnpm dev:enable                 # Enable development scripts
pnpm dev:pull                   # Pull environment variables and create dev branch
```

### Development

```bash
pnpm dev                        # Start all services (app, trigger, tinybird)
pnpm dev:app                    # Start only the app
pnpm dev:trigger               # Start Trigger.dev locally
pnpm tb:dev                    # Start Tinybird development
```

### Database

```bash
pnpm db:push                    # Push schema changes to database
pnpm db:generate               # Generate migration files
pnpm db:studio                 # Open Drizzle Studio
pnpm db:pull                   # Pull schema from database
pnpm neon:create-dev-branch    # Create Neon dev branch
pnpm neon:reset-dev-branch     # Reset Neon dev branch
```

### Code Quality

```bash
pnpm lint                      # Run ESLint
pnpm lint:fix                  # Fix ESLint errors
pnpm format                    # Check Prettier formatting
pnpm format:fix               # Fix formatting
pnpm typecheck                # Run TypeScript type checking
```

### Testing

```bash
pnpm test                      # Run all tests
pnpm test:watch               # Run tests in watch mode
pnpm test:coverage            # Run tests with coverage

# Run tests for specific package
pnpm -F @barely/lib test      # Run lib package tests
pnpm -F @barely/www test      # Run www app tests
```

### Build & Deploy

```bash
pnpm build                     # Build all packages
pnpm build:preview            # Build for preview
pnpm build:production         # Build for production
pnpm deploy-trigger:staging   # Deploy Trigger.dev to staging
pnpm deploy-trigger:production # Deploy Trigger.dev to production
```

### Tinybird

```bash
pnpm tb:login                  # Login to Tinybird
pnpm tb:check                  # Check Tinybird configuration
pnpm tb:build                  # Build Tinybird project
pnpm tb:test                   # Run Tinybird tests
pnpm tb:get-local-token       # Get local Tinybird token
```

## High-Level Architecture

### Authentication Flow

- Uses Better Auth with database adapter
- Session-based authentication with secure cookies
- OAuth providers configured in `packages/auth/`
- User workspace model for multi-tenancy

### API Architecture

- tRPC for type-safe API routes in `packages/lib/src/trpc/`
- Routes organized by domain (e.g., `spotify.route.ts`, `user.route.ts`)
- Shared validation schemas in `packages/validators/`
- React Query for client-side data fetching
- Protected routes check for session and workspace

### Database Schema

- PostgreSQL with Drizzle ORM
- SQL definitions in `packages/db/src/schema/sql/`
- Schema helpers in `packages/db/src/schema/`
- Uses cuid2 for primary keys
- Soft deletes with `deletedAt` timestamps
- zod schemas for db are created in `packages/validators/`

### Analytics Pipeline

- Tinybird for real-time analytics
- Git-controlled data sources and pipes in `packages/tb/tinybird/`
- TypeScript SDK in `packages/tb/src/`
- Event ingestion through API endpoints

### Background Jobs

- Trigger.dev v3 for background processing
- Jobs defined in `packages/lib/src/trigger/`
- Includes Spotify sync, email sending, and data processing
- Development server runs alongside main app

## TypeScript Best Practices

- **NEVER use `any` or type assertions** - Always find proper type solutions
- Use strict mode TypeScript configuration
- Prefer type inference over explicit types where possible
- Use Zod (v4) for runtime validation and type generation
- All API responses must be typed

## Code Style Guidelines

- **File naming**: kebab-case (e.g., `user-profile.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`)
- **Functions**: camelCase (e.g., `getUserProfile`)
- **Constants**: UPPER_CASE (e.g., `MAX_RETRIES`)
- **Database tables**: PascalCase in schema definitions
- Use ESLint and Prettier configurations from the workspace

## Testing Guidelines

- Write tests using Vitest
- Component tests use React Testing Library with `happy-dom`
- API tests use MSW for mocking
- Test files alongside source: `__tests__/` directories
- Run type checking before committing

## Environment Variables

- Use `.env` at root for local development
- Pull from Vercel: `pnpm vercel:pull-env`
- Validate with Zod in `env.ts` files
- Never commit `.env` files

## Common Patterns

### Creating New tRPC Routes

1. Define schema in `packages/validators/src/`
2. Create route in `packages/lib/src/trpc/routes/`
3. Add to router in `packages/lib/src/trpc/trpc.ts`
4. Use in client with `trpc.routeName.procedureName.useQuery()`

### Adding Database Tables

1. Create table in `packages/db/src/sql`
2. Create corresponding schema in `packages/validators/`
3. Run `pnpm db:push` to apply changes

### Creating Background Jobs

1. Create job in `packages/lib/src/trigger/`
2. Import in `packages/lib/src/trigger/index.ts`
3. Deploy with `pnpm deploy-trigger:staging`
