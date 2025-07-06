# CLAUDE.md - Coding Best Practices for @barely/app

This document outlines the coding best practices and established patterns for the barely.io dashboard application. These patterns have been identified through comprehensive analysis of the codebase and represent the most widely used and modern approaches in the app.

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Hook Factory Pattern (New Approach)](#hook-factory-pattern-new-approach)
3. [Context Provider Pattern (Legacy)](#context-provider-pattern-legacy-approach)
4. [Modal Patterns](#modal-patterns)
5. [Page Structure](#page-structure)
6. [State Management](#state-management)
7. [API Integration (tRPC)](#api-integration-trpc)
8. [TypeScript Best Practices](#typescript-best-practices)
9. [UI Component Usage](#ui-component-usage)
10. [File Naming and Organization](#file-naming-and-organization)
11. [Performance Patterns](#performance-patterns)
12. [Best Practices](#best-practices)

## Component Architecture

### Feature Structure

Each feature should follow this general directory structure, though not all components are required:

```
[feature]/
├── page.tsx                          # Main page component (async server component)
├── _components/                      # Feature-specific components
│   ├── {feature}-context.tsx         # Context provider for data and state
│   ├── all-{features}.tsx            # Grid/list display component
│   ├── create-or-update-{feature}-modal.tsx  # Create/update modal (if needed)
│   ├── archive-or-delete-{feature}-modal.tsx # Archive/delete modal (if needed)
│   ├── {feature}-filters.tsx         # Filter wrapper component
│   ├── create-{feature}-button.tsx   # Create button component
│   └── {feature}-hotkeys.tsx         # Keyboard shortcuts
└── stats/                            # Analytics (optional - only if feature has analytics)
    ├── page.tsx
    ├── {feature}-timeseries.tsx
    └── {feature}-stat-header.tsx
```

**Note**:

- Not all features require all modals (some may have additional custom modals)
- The `stats/` subdirectory is optional and only needed for features with analytics
- File names should use kebab-case (e.g., `create-feature-modal.tsx` not `CreateFeatureModal.tsx`)

### Component Guidelines

1. **Use functional components with TypeScript**
2. **Client components** must include `'use client'` directive at the top
3. **Server components** should be async and handle data fetching
4. **Separate concerns**: Data fetching in context, UI in components
5. **Use composition**: Break down complex components into smaller ones

## Hook Factory Pattern (New Approach)

### Overview

The new hook factory pattern separates URL state management from data fetching to prevent React Suspense from blocking optimistic UI updates. Each resource uses two distinct hooks:

1. **`use{Resource}SearchParams`** - Manages URL state only (filters, modals, selection)

   - No data fetching
   - Instant optimistic updates
   - Used by filter components, buttons, and hotkeys

2. **`use{Resource}`** - Handles data fetching with suspense
   - Includes all search params functionality
   - Triggers suspense boundaries
   - Used by data-consuming components

### Critical Usage Guidelines

**Filter Components**: Must use `use{Resource}SearchParams()` directly to avoid rendering delays:

```typescript
// ✅ CORRECT - Instant optimistic updates
export function CartOrderFilters() {
	const { filters, toggleFulfilled } = useCartOrderSearchParams();
	// UI updates immediately when toggled
}

// ❌ WRONG - Blocks UI updates until data loads
export function CartOrderFilters() {
	const { filters, toggleFulfilled } = useCartOrder();
	// UI blocked by suspense boundary
}
```

**Data Components**: Use the full `use{Resource}()` hook:

```typescript
export function AllCartOrders() {
	const { items, selection, setSelection } = useCartOrder();
	// Has access to both data and search params
}
```

### Component Hook Usage Guide

| Component Type        | Hook to Use                 | Reason                   |
| --------------------- | --------------------------- | ------------------------ |
| Filters               | `use{Resource}SearchParams` | Avoids suspense blocking |
| Create/Update Buttons | `use{Resource}SearchParams` | Only needs modal state   |
| Hotkeys               | `use{Resource}SearchParams` | Only needs actions       |
| Grid/List Display     | `use{Resource}`             | Needs data               |
| Modals                | Both (split usage)          | Modal state + data       |

### Implementation Example

```typescript
// cart-order-context.tsx
export const useCartOrderSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		showFulfilled: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		toggleFulfilled: setParams => () =>
			setParams(prev => ({ showFulfilled: !prev.showFulfilled })),
	},
});

export function useCartOrder() {
	const searchParams = useCartOrderSearchParams();
	const dataHook = createResourceDataHook(/* ... */);

	// Merge results for convenience
	return {
		...dataHook(),
		...searchParams,
	};
}
```

## Context Provider Pattern (Legacy Approach)

All context providers should follow this pattern with TanStack Query:

```typescript
'use client';

import type { AppRouterOutputs } from '@barely/api';
import type { Selection } from 'react-aria-components';
import { createContext, useContext, useRef, useState } from 'react';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useTypedOptimisticQuery } from '@barely/hooks/use-typed-optimistic-query';
import { useWorkspace } from '~/app/[handle]/_components/workspace-context';
import { api } from '~/trpc/react';

interface FeatureContext extends InfiniteItemsContext<
  AppRouterOutputs['feature']['byWorkspace']['items'][0],
  {
    showArchived: boolean;
    // other filter params
  }
> {}

const FeatureContext = createContext<FeatureContext | undefined>(undefined);

export function FeatureContextProvider({ children }: { children: React.ReactNode }) {
  const workspace = useWorkspace();
  const apiUtils = api.useUtils();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selection state
  const [selection, setSelection] = useState<Selection>(new Set());
  const [lastSelectedItemId, setLastSelectedItemId] = useState<string | null>(null);

  // Refs
  const gridListRef = useRef<HTMLDivElement>(null);

  // URL state management with optimistic updates
  const { data: filters, setQuery, removeByKey, pending } = useTypedOptimisticQuery(
    featureFilterParamsSchema
  );

  // Infinite query with suspense
  const query = useSuspenseInfiniteQuery({
    queryKey: ['feature.byWorkspace', workspace.handle, filters],
    queryFn: ({ pageParam }) =>
      api.feature.byWorkspace.query({
        handle: workspace.handle,
        ...filters,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });

  // Helper methods
  const focusGridList = () => {
    if (gridListRef.current) {
      gridListRef.current.focus();
    }
  };

  const clearAllFilters = () => {
    removeByKey('search');
    removeByKey('showArchived');
  };

  const value = {
    // Items
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    selection,
    lastSelectedItemId,
    lastSelectedItem: query.data?.pages
      .flatMap((page) => page.items)
      .find((item) => item.id === lastSelectedItemId),

    // Refs
    gridListRef,

    // Modal states
    showCreateModal,
    showUpdateModal,
    showArchiveModal,
    showDeleteModal,

    // Filter state
    filters,
    pendingFiltersTransition: pending,

    // Query state
    infiniteQuery: query,

    // Setters
    setSelection,
    setLastSelectedItemId,
    setShowCreateModal,
    setShowUpdateModal,
    setShowArchiveModal,
    setShowDeleteModal,
    setQuery,
    removeByKey,

    // Helper methods
    focusGridList,
    clearAllFilters,
  } satisfies FeatureContext;

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
}

export function useFeature() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within FeatureContextProvider');
  }
  return context;
}
```

## Modal Patterns

### Create/Update Modal Structure

```typescript
'use client';

import { useFeature } from './feature-context';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { SubmitButton } from '@barely/ui/elements/button';
import { Form } from '@barely/ui/forms';
import { useCreateOrUpdateForm } from '~/app/[handle]/_hooks/use-create-or-update-form';
import { api } from '~/trpc/react';

export function CreateOrUpdateFeatureModal({
  mode
}: {
  mode: 'create' | 'update'
}) {
  const apiUtils = api.useUtils();
  const {
    showCreateModal,
    showUpdateModal,
    setShowCreateModal,
    setShowUpdateModal,
    lastSelectedItem,
    focusGridList,
  } = useFeature();

  const { form, onSubmit } = useCreateOrUpdateForm({
    fields: featureFieldsSchema,
    initialData: mode === 'update' ? lastSelectedItem : undefined,
    onSubmit: async (data) => {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync(data);
      }
    },
  });

  const createMutation = api.feature.create.useMutation({
    onSuccess: async () => {
      await apiUtils.feature.invalidate();
      form.reset();
      setShowCreateModal(false);
      focusGridList();
    },
  });

  const updateMutation = api.feature.update.useMutation({
    onSuccess: async () => {
      await apiUtils.feature.invalidate();
      setShowUpdateModal(false);
      focusGridList();
    },
  });

  const isOpen = mode === 'create' ? showCreateModal : showUpdateModal;
  const setIsOpen = mode === 'create' ? setShowCreateModal : setShowUpdateModal;
  const isPending = form.formState.isSubmitting;

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalHeader>
        {mode === 'create' ? 'Create Feature' : 'Update Feature'}
      </ModalHeader>
      <Form form={form} onSubmit={onSubmit}>
        <ModalBody>
          {/* Form fields */}
        </ModalBody>
        <ModalFooter>
          <SubmitButton disabled={isPending}>
            {mode === 'create' ? 'Create' : 'Update'}
          </SubmitButton>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
```

### Archive/Delete Modal Structure

```typescript
export function ArchiveOrDeleteFeatureModal({
  mode
}: {
  mode: 'archive' | 'delete'
}) {
  const apiUtils = api.useUtils();
  const {
    selection,
    items,
    showArchiveModal,
    showDeleteModal,
    setShowArchiveModal,
    setShowDeleteModal,
    setSelection,
  } = useFeature();

  const selectedItems = items.filter((item) =>
    selection === 'all' || selection.has(item.id)
  );

  const mutation = api.feature[mode].useMutation({
    onSuccess: async () => {
      await apiUtils.feature.invalidate();
      setSelection(new Set());
      if (mode === 'archive') setShowArchiveModal(false);
      if (mode === 'delete') setShowDeleteModal(false);
    },
  });

  const handleSubmit = () => {
    const ids = selectedItems.map((item) => item.id);
    mutation.mutate({ ids });
  };

  return (
    <ConfirmModal
      open={mode === 'archive' ? showArchiveModal : showDeleteModal}
      onOpenChange={mode === 'archive' ? setShowArchiveModal : setShowDeleteModal}
      title={`${mode === 'archive' ? 'Archive' : 'Delete'} ${selectedItems.length} ${
        selectedItems.length === 1 ? 'item' : 'items'
      }?`}
      onConfirm={handleSubmit}
      loading={mutation.isPending}
    />
  );
}
```

## Page Structure

All pages should follow this pattern with server-side data prefetching:

```typescript
import { Suspense } from 'react';
import { featureFilterParamsSchema } from '@barely/validators/feature';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { FeatureContextProvider } from './_components/feature-context';
import { AllFeatures } from './_components/all-features';
import { CreateFeatureButton } from './_components/create-feature-button';
import { CreateOrUpdateFeatureModal } from './_components/create-or-update-feature-modal';
import { ArchiveOrDeleteFeatureModal } from './_components/archive-or-delete-feature-modal';
import { FeatureFilters } from './_components/feature-filters';
import { FeatureHotkeys } from './_components/feature-hotkeys';
import { api, HydrateClient } from '~/trpc/server';

export default async function FeaturesPage({
  params,
  searchParams,
}: {
  params: { handle: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const parsedFilters = featureFilterParamsSchema.safeParse(searchParams);
  const filters = parsedFilters.success ? parsedFilters.data : {};

  // Prefetch data on server
  void api.feature.byWorkspace.prefetchInfinite({
    handle: params.handle,
    ...filters,
  });

  return (
    <HydrateClient>
      <FeatureContextProvider>
        <DashContentHeader
          title="Features"
          action={<CreateFeatureButton />}
        />
        <FeatureFilters />

        <Suspense fallback={<GridListSkeleton />}>
          <AllFeatures />
        </Suspense>

        <CreateOrUpdateFeatureModal mode="create" />
        <CreateOrUpdateFeatureModal mode="update" />
        <ArchiveOrDeleteFeatureModal mode="archive" />
        <ArchiveOrDeleteFeatureModal mode="delete" />

        <FeatureHotkeys />
      </FeatureContextProvider>
    </HydrateClient>
  );
}
```

## State Management

### State Management Hierarchy

1. **URL State**: Managed via `useTypedOptimisticQuery`

   - Filters (search, showArchived, etc.)
   - Sorting parameters
   - Pagination cursors

2. **Context State**: Managed in context providers

   - Modal visibility states
   - Selection states
   - Refs to DOM elements
   - Derived data from queries

3. **Form State**: Managed via React Hook Form

   - Form field values
   - Validation states
   - Submission states

4. **Server State**: Managed via TanStack Query
   - Cached API responses
   - Mutation states
   - Loading/error states

### Best Practices

- Keep state as close to where it's used as possible
- Use URL state for filterable/shareable states
- Use context for feature-wide shared state
- Use local state for component-specific UI state

## API Integration (tRPC)

### Router Organization

Each feature should have consistent tRPC endpoints using the new pattern:

```typescript
// In packages/api/src/routes/feature.route.ts
export const featureRouter = createTRPCRouter({
	// Read operations
	byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		/* ... */
	}),

	byWorkspace: workspaceProcedure
		.input(selectFeaturesSchema)
		.query(async ({ input, ctx }) => {
			// Return paginated results with cursor
			return {
				items: features,
				nextCursor: lastId,
			};
		}),

	// Write operations
	create: workspaceProcedure
		.input(createFeatureSchema)
		.mutation(async ({ input, ctx }) => {
			/* ... */
		}),

	update: workspaceProcedure
		.input(updateFeatureSchema)
		.mutation(async ({ input, ctx }) => {
			/* ... */
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			/* ... */
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			/* ... */
		}),
});
```

### Query Invalidation

Always invalidate related queries after mutations:

```typescript
const mutation = api.feature.create.useMutation({
	onSuccess: async () => {
		// Invalidate all feature queries
		await apiUtils.feature.invalidate();

		// Or invalidate specific queries
		await apiUtils.feature.byWorkspace.invalidate({ handle: workspace.handle });
	},
});
```

## TypeScript Best Practices

### Type Imports

Always use type imports for types:

```typescript
import type { AppRouterOutputs } from '@barely/api';
import type { Selection } from 'react-aria-components';
```

### Zod Schema Inference

Use zod's type inference for form data:

```typescript
import { z } from 'zod';

const createFeatureSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
});

type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
```

### Satisfies Operator

Use `satisfies` for type-safe object literals:

```typescript
const contextValue = {
	items,
	selection,
	// ... other properties
} satisfies FeatureContext;
```

## UI Component Usage

### Component Library

Use components from `@barely/ui` consistently:

```typescript
// Forms

// Layout
import { Badge } from '@barely/ui/elements/badge';
// Elements
import { Button, SubmitButton } from '@barely/ui/elements/button';
import { GridList, GridListCard, GridListSkeleton } from '@barely/ui/elements/grid-list';
// Icons
import { Icon } from '@barely/ui/elements/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Separator } from '@barely/ui/elements/separator';
import { Form, Switch, TextArea, TextField } from '@barely/ui/forms';
```

### Grid List Pattern

Use GridList for consistent list displays:

```typescript
<GridList
  aria-label="Features"
  className="flex flex-col gap-2"
  selectionMode="multiple"
  selectionBehavior="toggle"
  items={items}
  selection={selection}
  onSelectionChange={setSelection}
  onAction={() => setShowUpdateModal(true)}
  renderEmptyState={() => (
    <NoResultsPlaceholder
      icon="feature"
      title="No features found"
      subtitle="Create your first feature"
      button={<CreateFeatureButton />}
    />
  )}
>
  {(item) => (
    <GridListCard
      id={item.id}
      key={item.id}
      textValue={item.name}
      setLastSelectedItemId={setLastSelectedItemId}
    >
      {/* Card content */}
    </GridListCard>
  )}
</GridList>
```

## File Naming and Organization

### Naming Conventions

- **File names**: Always use kebab-case for all files
  - Components: `create-feature-modal.tsx`
  - Contexts: `feature-context.tsx`
  - Hooks: `use-feature.ts`
  - Utilities: `format-date.ts`
  - Schemas: `feature-schema.ts`
- **Component exports**: Use PascalCase
  - `export function CreateFeatureModal() {}`
- **Hook exports**: Use camelCase with 'use' prefix
  - `export function useFeature() {}`
- **Type exports**: Use PascalCase
  - `export type FeatureContext = {}`
- **Schema exports**: Use camelCase
  - `export const featureSchema = z.object({})`

### Directory Structure

```
apps/app/src/
├── app/                    # Next.js app directory
│   ├── [handle]/           # Workspace routes
│   │   ├── feature/        # Feature pages
│   │   └── _components/    # Shared workspace components
│   ├── api/                # API routes
│   └── providers.tsx       # Root providers
├── hooks/                  # Shared hooks
├── components/             # Shared components
├── trpc/                   # tRPC setup
└── types/                  # Shared types
```

## Performance Patterns

### Hook Usage and Suspense

To prevent UI blocking, components must use the appropriate hook based on their needs:

- **Components outside suspense boundaries** (filters, buttons): Use `use{Resource}SearchParams()`
- **Components inside suspense boundaries** (data displays): Use `use{Resource}()`

This separation ensures that user interactions like toggling filters or opening modals happen instantly without waiting for data to load.

### Suspense Boundaries

Wrap data-fetching components in Suspense:

```typescript
<HydrateClient>
  <Suspense fallback={<GridListSkeleton />}>
    <AllFeatures />
  </Suspense>
</HydrateClient>
```

### Query Optimization

1. **Prefetch on server**: Use `prefetch` in server components
2. **Stale time**: Configure appropriate stale times
3. **Query keys**: Use consistent query key patterns
4. **Infinite queries**: Use for paginated lists

### Image Optimization

Always use Next.js Image component with proper dimensions:

```typescript
<Image
  src={item.imageUrl}
  alt={item.name}
  width={200}
  height={200}
  className="rounded-md"
  placeholder="blur"
  blurDataURL={item.blurDataUrl}
/>
```

## Additional Guidelines

### Error Handling

- Use try-catch blocks for async operations
- Show user-friendly error messages via toast notifications
- Log errors appropriately for debugging
- Handle loading and error states with Suspense boundaries

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels and descriptions
- Support keyboard navigation (Tab, Enter, Escape)
- Test with screen readers
- Follow React Aria Components patterns

### Mobile Responsiveness

- Use Tailwind's responsive utilities (sm:, md:, lg:)
- Test on various screen sizes
- Consider touch interactions for mobile
- Ensure modals and dialogs work on mobile

### Code Comments

- Avoid unnecessary comments
- Document complex business logic
- Use JSDoc for public APIs
- Keep comments up-to-date with code changes

### Performance Optimization

- Use React.memo for expensive components
- Implement proper memoization with useMemo/useCallback
- Lazy load components with dynamic imports
- Optimize images with Next.js Image component
- Use Suspense for code splitting

### State Management Best Practices

- Use Jotai atoms for global state that needs to persist
- Keep server state in TanStack Query
- Use local state for UI-only concerns
- Implement optimistic updates for better UX

### Testing

When implementing tests (currently not present):

- Write unit tests for utilities and hooks
- Write integration tests for API routes
- Write component tests for complex interactions
- Use React Testing Library for component tests
- Mock tRPC calls in tests
- Use the existing test scripts in package.json

## Migration Notes

### Recent Refactoring Changes

1. **Authentication**: Migrated from NextAuth to better-auth
2. **State Management**: Now using Jotai atoms (moved to @barely/atoms package)
3. **Package Structure**: Many utilities moved to dedicated packages
4. **React Version**: Upgraded to React 19
5. **TRPC Pattern**: New pattern with TanStack Query for better type safety
6. **Workflows → Flows**: Workflow system renamed to Flows with visual editor

### Import Path Updates

When refactoring existing code, update import paths:

- `@barely/lib/hooks/*` → `@barely/hooks/*`
- `@barely/lib/atoms/*` → `@barely/atoms/*`
- `@barely/lib/files/*` → `@barely/files/*`
- `@barely/lib/trpc-app-router` → `@barely/api`

## Conclusion

These patterns represent the established best practices in the barely.io dashboard application. When adding new features or refactoring existing code, follow these patterns to maintain consistency and code quality throughout the application. The codebase has been recently modernized with React 19, better-auth, and improved package organization for better developer experience.
