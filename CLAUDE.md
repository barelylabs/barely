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

### ABSOLUTELY FORBIDDEN - NO EXCEPTIONS

- **NEVER use `any`** - Find the proper type or fix the underlying issue
- **NEVER use type assertions (`as`)** - Fix the actual type mismatch
- **NEVER use type casting (`as unknown as`)** - This is even worse than `as`
- **NEVER use non-null assertions (`!`)** - Handle null/undefined properly
- **NO TYPE SHORTCUTS** - If types don't match, FIX THE ROOT CAUSE

### Required Practices

- Use strict mode TypeScript configuration
- Prefer type inference over explicit types where possible
- Use Zod (v4) for runtime validation and type generation
- All API responses must be typed
- Handle all possible null/undefined cases explicitly

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

### Form Handling Best Practices

**ALWAYS use our established form patterns when creating forms:**

1. **Use `useZodForm` hook** from `@barely/hooks` for form state management
2. **Use form components** from `@barely/ui/forms/` instead of raw UI elements
3. **Define Zod schemas** for all form validation
4. **Use the Form wrapper** component for proper form context

#### Correct Form Pattern Example:

```typescript
'use client';

import { useZodForm } from '@barely/hooks';
import { z } from 'zod/v4';

import { CheckboxField } from '@barely/ui/forms/checkbox-field';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';

// Define schema with Zod
const myFormSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  consent: z.boolean().refine(val => val === true, 'Consent required'),
});

type MyFormData = z.infer<typeof myFormSchema>;

export function MyForm({ onSubmit }: { onSubmit: (data: MyFormData) => void }) {
  const form = useZodForm({
    schema: myFormSchema,
    defaultValues: {
      email: '',
      name: '',
      consent: false,
    },
  });

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField
        control={form.control}
        name="name"
        label="Name"
        placeholder="Enter your name"
      />

      <TextField
        control={form.control}
        name="email"
        type="email"
        placeholder="Enter your email"
        startIcon="email"
      />

      <CheckboxField
        control={form.control}
        name="consent"
        label="I agree to terms"
      />

      <SubmitButton loading={isLoading}>
        Submit
      </SubmitButton>
    </Form>
  );
}
```

#### Key Points:

- **NEVER** use raw `Input`, `Checkbox`, or `Button` components in forms
- **ALWAYS** use `TextField`, `CheckboxField`, `SubmitButton` etc. from `@barely/ui/forms/`
- **ALWAYS** pass `control={form.control}` to form field components
- **ALWAYS** wrap form content in `<Form>` component
- **NEVER** manage form state with `useState` - use `useZodForm` instead
- **ALWAYS** define validation with Zod schemas
- Import Zod as `z` from `zod/v4` (not zod/lib/v4)
- For email validation, use `z.email()` - NOTE: `z.string().email()` is deprecated in Zod v4 in favor of the simpler `z.email()` syntax

### Form vs Instantaneous Update Patterns

**CRITICAL**: Not all user inputs require forms. Understand the distinction:

#### When to Use Form Patterns (with useZodForm + Form component):
- Creating new entities (e.g., Add Link, Create Block, New Product)
- Multiple fields that must be validated together before saving
- User explicitly submits via a "Save" or "Submit" button
- Complex validation rules that depend on multiple fields
- Any use of `<form>` element (lowercase) - replace with `<Form>` component

#### When to Use Instantaneous Updates (direct mutations):
- Inline editing of single fields (contentEditable style)
- Toggle switches for boolean states
- Dropdown/select changes for enum values
- Drag-and-drop reordering
- Each field change can be saved independently
- Changes save automatically without explicit submission

#### Implementation Examples:

**✅ CORRECT - Instantaneous inline edit with onBlur:**
```typescript
// Single field that saves on blur
<Input
  value={localTitle}
  onChange={e => setLocalTitle(e.target.value)}  // Local state only
  onBlur={() => {
    if (localTitle !== original) {
      updateMutation.mutate({ id, title: localTitle });
    }
  }}
  variant='contentEditable'
/>
```

**✅ CORRECT - Toggle with immediate save:**
```typescript
<Switch
  checked={item.enabled}
  onCheckedChange={checked => 
    updateMutation.mutate({ id: item.id, enabled: checked })
  }
/>
```

**❌ WRONG - Using <form> for multi-field entity creation:**
```typescript
// DO NOT DO THIS
<form onSubmit={handleSubmit}>
  <Input value={title} onChange={e => setTitle(e.target.value)} />
  <Input value={url} onChange={e => setUrl(e.target.value)} />
  <Button type='submit'>Add</Button>
</form>
```

**✅ CORRECT - Using Form pattern for entity creation:**
```typescript
const form = useZodForm({
  schema: createLinkSchema,
  defaultValues: { title: '', url: '' }
});

return (
  <Form form={form} onSubmit={data => createMutation.mutate(data)}>
    <TextField control={form.control} name="title" />
    <TextField control={form.control} name="url" type="url" />
    <SubmitButton>Add Link</SubmitButton>
  </Form>
);
```

### Creating New tRPC Routes

1. Define schema in `packages/validators/src/`
2. Create route in `packages/lib/src/trpc/routes/`
3. Add to router in `packages/lib/src/trpc/trpc.ts`
4. Use in client with React Query:

   ```typescript
   import { useMutation, useQuery } from '@tanstack/react-query';

   // For queries
   const { data } = useQuery({
   	...trpc.routeName.procedureName.queryOptions({ input }),
   });

   // For mutations
   const { mutate } = useMutation(
   	trpc.routeName.procedureName.mutationOptions({
   		onSuccess: () => {
   			// do something
   		},
   		onError: error => {
   			// do something
   		},
   	}),
   );
   ```

### Adding Database Tables

1. Create table in `packages/db/src/sql`
2. Create corresponding schema in `packages/validators/`
3. Run `pnpm db:push` to apply changes

### Creating Background Jobs

1. Create job in `packages/lib/src/trigger/`
2. Import in `packages/lib/src/trigger/index.ts`
3. Deploy with `pnpm deploy-trigger:staging`

## Creating New Public-Facing Apps with tRPC

### Lessons Learned from VIP App Implementation

When creating a new public-facing app (like `apps/vip`, `apps/fm`, `apps/page`), there are specific patterns and gotchas to avoid:

#### 1. tRPC Router Structure

Public-facing apps need **separate routers** from admin routes:

- **Admin routes**: Located in `packages/lib/src/trpc/routes/` (e.g., `vip.route.ts`) - for workspace management
- **Public routes**: Located in `packages/api/src/public/` (e.g., `vip-render.route.ts`, `vip-render.router.ts`) - for public endpoints

#### 2. Required Files for tRPC Setup

Each public-facing app needs these files in specific order:

**Step 1: Create the public router files**

- `packages/api/src/public/[app-name]-render.route.ts` - Contains the actual tRPC procedures
- `packages/api/src/public/[app-name]-render.router.ts` - Exports the router type and creates router
- `packages/api/src/public/[app-name]-render.trpc.react.ts` - Creates tRPC context hooks using `createTRPCContext`

**Step 2: Create the app-specific API route**

- `apps/[app-name]/src/app/api/trpc/[routerName]/route.ts` - Next.js API route handler

**Step 3: Set up client-side tRPC**

- `apps/[app-name]/src/trpc/query-client.tsx` - QueryClient configuration (copy from existing apps)
- `apps/[app-name]/src/trpc/react.tsx` - TRPCReactProvider setup
- `apps/[app-name]/src/trpc/server.tsx` - Server-side tRPC client

#### 3. Critical Dependencies in package.json

Public apps need these specific dependencies (check `apps/app/package.json` for versions):

```json
{
	"@tanstack/react-query": "catalog:",
	"@tanstack/react-query-devtools": "^5.80.10",
	"@trpc/client": "catalog:",
	"@trpc/server": "catalog:",
	"superjson": "^2.2.1",
	"lucide-react": "^0.348.0"
}
```

**CRITICAL**: Do NOT add `@trpc/react-query` to package.json - it's not in the catalog and will cause installation failures.

#### 4. Component Usage Pattern

In React components, use this pattern:

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';

import { useVipRenderTRPC } from '@barely/api/public/vip-render.trpc.react';

function MyComponent() {
	const trpc = useVipRenderTRPC();

	// For queries
	const { data } = useQuery({
		...trpc.procedureName.queryOptions({ input }),
		enabled: !!someCondition,
	});

	// For mutations
	const { mutate } = useMutation(
		trpc.procedureName.mutationOptions({
			onSuccess: data => {
				/* handle success */
			},
			onError: error => {
				/* handle error */
			},
		}),
	);
}
```

#### 5. Configuration Updates Required

When adding a new app, update these files:

- `packages/const/src/app.constants.ts` - Add app name to APPS array
- `packages/auth/src/get-url.ts` - Add URL handling for new app
- `packages/auth/env.ts` - Add environment variables for base URL and dev port
- `packages/utils/src/id.ts` - Add ID prefixes if creating new entities
- `scripts/dev-qr-codes.sh` - Add QR code generation for new app
- `packages/db/src/client.ts` - Import and include new SQL files if adding database tables

#### 6. Database Integration

If creating new database tables:

- Create SQL file in `packages/db/src/sql/[table-name].sql.ts`
- Export type definitions: `export type TableName = typeof TableNames.$inferSelect;`
- Import in `packages/db/src/client.ts` and add to dbSchema
- Create Zod schemas in `packages/validators/src/schemas/`
- Export from `packages/validators/src/schemas/index.ts`

#### 7. Common TypeScript Issues

- **Control flow narrowing**: Use `TRPCError` instead of `raise()` for better type narrowing
- **UI imports**: Use `@barely/ui/button` not `@barely/ui/elements/button`
- **Visitor context**: Check property names - use `ctx.visitor?.ip` not `ctx.visitor?.ipAddress`
- **User agent**: Visitor userAgent might be object or string: `typeof ctx.visitor?.userAgent === 'string' ? ctx.visitor.userAgent : ctx.visitor?.userAgent?.ua ?? null`

#### 8. Port Management

Each app needs a unique port:

- app: 3000, cart: 3001, fm: 3002, link: 3003, page: 3004, press: 3005, www: 3006, nyc: 3010, vip: 3009
- Update `scripts/dev-qr-codes.sh` with correct port mappings

#### 9. Essential Checklist for New Public Apps

- [ ] Create public router files in correct order
- [ ] Add all required dependencies to package.json
- [ ] Set up API route handler
- [ ] Configure client-side tRPC with proper provider
- [ ] Update configuration files (constants, auth, utils)
- [ ] Add database integration if needed
- [ ] Update development scripts
- [ ] Test end-to-end functionality before adding complexity

This checklist should prevent the common issues encountered during VIP app setup and significantly speed up future app creation.
