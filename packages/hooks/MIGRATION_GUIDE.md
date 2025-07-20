# Hook Factory Type Safety Migration Guide

This guide helps you migrate from the old hook factory pattern (with type casting) to the new type-safe pattern.

## Overview

The new pattern eliminates the need for:

- Manual type interfaces for filters and return types
- Type casting in actions
- Type assertions on hooks
- `@ts-expect-error` comments

## Before vs After

### Before (45+ lines with type casting)

```typescript
// Define custom filters interface
interface FanFilters extends BaseResourceFilters {
	showImportModal: boolean;
}

// Define the return type
interface FanSearchParamsReturn extends ResourceSearchParamsReturn<FanFilters> {
	showImportModal: boolean;
	setShowImportModal: (show: boolean) => Promise<URLSearchParams> | undefined;
}

// Create hook with type casting
export const useFanSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		showImportModal: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		setShowImportModal:
			setParams =>
			(...args: unknown[]) => {
				const [show] = args as [boolean]; // ❌ Type casting required
				return setParams({ showImportModal: show });
			},
	},
}) as () => FanSearchParamsReturn; // ❌ Type assertion required
```

### After (12 lines, fully type-safe)

```typescript
import { action } from '@barely/hooks';

// Create hook with automatic type inference
export const useFanSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		showImportModal: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		setShowImportModal: action((setParams, show: boolean) =>
			setParams({ showImportModal: show }),
		),
	},
}); // ✅ No type assertion needed!
```

## Migration Steps

### 1. Update Imports

Add the `action` helper to your imports:

```typescript
// Before
import { createResourceSearchParamsHook } from '@barely/hooks';

// After
import { action, createResourceSearchParamsHook } from '@barely/hooks';
```

### 2. Remove Manual Type Definitions

Delete these interfaces - they're no longer needed:

```typescript
// DELETE THESE:
interface YourFilters extends BaseResourceFilters {
	// custom filters
}

interface YourSearchParamsReturn extends ResourceSearchParamsReturn<YourFilters> {
	// custom actions
}
```

### 3. Update Actions to Use `action` Helper

Replace complex action creators with the `action` helper:

```typescript
// Before
additionalActions: {
  setShowModal: setParams => (...args: unknown[]) => {
    const [show] = args as [boolean];
    return setParams({ showModal: show });
  },
  setMultipleParams: setParams => (...args: unknown[]) => {
    const [name, count] = args as [string, number];
    return setParams({ name, count });
  },
}

// After
additionalActions: {
  setShowModal: action((setParams, show: boolean) =>
    setParams({ showModal: show })
  ),
  setMultipleParams: action((setParams, name: string, count: number) =>
    setParams({ name, count })
  ),
}
```

### 4. Remove Type Assertions

Remove the type assertion from the hook export:

```typescript
// Before
export const useYourSearchParams = createResourceSearchParamsHook({
	// config
}) as () => YourSearchParamsReturn;

// After
export const useYourSearchParams = createResourceSearchParamsHook({
	// config
});
```

### 5. Update Data Hooks

The data hook no longer needs `@ts-expect-error`:

```typescript
// Before
const query = useSuspenseInfiniteQuery(
	// @ts-expect-error - Query options from tRPC have complex types
	config.getQueryOptions(handle, filters),
);

// After (in use-resource-data.ts)
const query = useSuspenseInfiniteQuery(
	wrapQueryOptions(config.getQueryOptions(handle, filters)),
);
```

## Common Patterns

### Toggle Actions

```typescript
additionalActions: {
  toggleFeature: action(setParams =>
    setParams(prev => ({ showFeature: !prev.showFeature }))
  ),
}
```

### Actions with Optional Parameters

```typescript
additionalActions: {
  setFilter: action((setParams, filter: string, scope?: 'global' | 'local') =>
    setParams({ filter, scope: scope ?? 'global' })
  ),
}
```

### Actions that Return Void

```typescript
additionalActions: {
  resetAndRefresh: action((setParams, refreshData: () => void) => {
    setParams({ page: 1, search: '' });
    refreshData();
  }),
}
```

### Complex Object Parameters

```typescript
additionalActions: {
  applyFilters: action(
    (setParams, filters: { search?: string; status?: string; tags?: string[] }) =>
      setParams(filters)
  ),
}
```

## TypeScript Benefits

With the new pattern, you get:

1. **Full IntelliSense**: All custom filters and actions appear in autocomplete
2. **Type Safety**: Parameters are strongly typed with no casting
3. **Compile-Time Checks**: Errors caught during development, not runtime
4. **Less Code**: ~70% reduction in boilerplate
5. **Better Refactoring**: Rename symbols work across the codebase

## Troubleshooting

### "Type 'X' is not assignable to type 'Y'"

Make sure you're using the `action` helper for all custom actions:

```typescript
// ❌ Wrong
setShowModal: setParams => (show: boolean) => setParams({ showModal: show });

// ✅ Correct
setShowModal: action((setParams, show: boolean) => setParams({ showModal: show }));
```

### IntelliSense not showing custom properties

Ensure your parsers are properly typed:

```typescript
additionalParsers: {
  // ✅ Parser with .withDefault() returns non-nullable type
  status: parseAsStringEnum(['active', 'inactive']).withDefault('active'),

  // ⚠️ Without .withDefault(), type is nullable
  category: parseAsString,  // type is string | null
}
```

### Actions not appearing in return type

Check that actions are defined using the `action` helper:

```typescript
additionalActions: {
	// Must use action() helper
	myAction: action((setParams, arg: string) => setParams({ value: arg }));
}
```

## Advanced Usage

### Creating a Reusable Pattern

For resources with similar patterns, create a factory:

```typescript
function createPaginatedResourceHooks<TItem>(config: {
	name: string;
	defaultPageSize?: number;
}) {
	const useSearchParams = createResourceSearchParamsHook({
		additionalParsers: {
			page: parseAsInteger.withDefault(1),
			pageSize: parseAsInteger.withDefault(config.defaultPageSize ?? 20),
		},
		additionalActions: {
			nextPage: action(setParams => setParams(prev => ({ page: prev.page + 1 }))),
			prevPage: action(setParams =>
				setParams(prev => ({ page: Math.max(1, prev.page - 1) })),
			),
			setPageSize: action((setParams, size: number) =>
				setParams({ pageSize: size, page: 1 }),
			),
		},
	});

	return { useSearchParams };
}
```

## Next Steps

1. Migrate one resource at a time
2. Run TypeScript checks after each migration
3. Test that all functionality still works
4. Remove old type definitions
5. Enjoy better type safety and less code!

## Need Help?

If you encounter issues during migration:

1. Check the type test examples in `__tests__/resource-hooks.type-test.ts`
2. Refer to the migrated `fan-context.tsx` as an example
3. Open an issue with your specific use case
