# Drag and Drop with React Query (TanStack Query)

## Problem

When implementing drag-and-drop functionality with libraries like `@dnd-kit` while using React Query as your data source, you'll encounter a frustrating visual glitch: items "jump" or "flash" to their original position before settling into their new position.

This happens because:

1. **dnd-kit** manages its own internal state during drag animations
2. **React Query** cache updates trigger re-renders that interfere with these animations
3. The component receives conflicting data from these two sources, causing a race condition

## Solution Pattern

The solution is to use **temporary local state** that takes precedence during drag operations, while still maintaining proper optimistic updates in the React Query cache.

### Key Insight

The trick is to render from `tempItems ?? queryItems` - temporary state takes precedence when it exists, otherwise fall back to React Query data.

## Reference Implementation

For a production-ready implementation of this pattern with lexorank ordering, see:
`apps/app/src/app/[handle]/bio/_components/bio-links-page.tsx` - `useDragReorderLinks` hook

This implementation demonstrates:

- Proper temporary state management
- Optimistic cache updates
- Lexorank-based ordering
- Integration with tRPC mutations
- TypeScript best practices

## Implementation

### Basic Pattern

```typescript
function MyDraggableList() {
  const { data: items } = useQuery(/* ... */);
  const [tempItems, setTempItems] = useState(null);

  const mutation = useMutation({
    mutationFn: async (updates) => {
      // API call to reorder items
    },
    onMutate: async (updates) => {
      // Still do optimistic update in React Query
      queryClient.setQueryData(['items'], /* reordered items */);
    },
    onSettled: () => {
      // Clear temp state after mutation completes
      setTempItems(null);
    }
  });

  const handleDragEnd = (event) => {
    // Calculate new order
    const reordered = /* ... */;

    // Set temp state for immediate visual feedback
    setTempItems(reordered);

    // Trigger mutation
    mutation.mutate(/* ... */);
  };

  // CRITICAL: Use temp items if they exist, otherwise use query data
  const displayItems = tempItems ?? items;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={displayItems}>
        {displayItems.map(item => (
          <SortableItem key={item.id} item={item} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### Complete Example from Production Code

See the full implementation in `apps/app/src/app/[handle]/bio/_components/bio-links-page.tsx` for a complete example that includes:

- Custom hook with temporary state management
- Integration with tRPC mutations
- Optimistic updates with proper error handling
- Lexorank-based ordering using the `between` utility
- TypeScript types for all data structures

## Why This Works

1. **During drag**: dnd-kit handles all the visual feedback
2. **On drop**:
   - Temporary state is set immediately (no delay)
   - UI renders from temp state (stable, no interference)
   - Mutation runs in background with optimistic cache update
3. **After mutation settles**:
   - Temp state clears
   - UI falls back to React Query data
   - Everything stays in sync

## Common Mistakes to Avoid

### ❌ Don't try to update React Query cache immediately on drag

```typescript
// BAD - Causes visual jumping
const handleDragEnd = event => {
	queryClient.setQueryData(['items'], reordered);
	mutation.mutate(/* ... */);
};
```

### ❌ Don't use setTimeout to delay updates

```typescript
// BAD - Hacky and unreliable
const handleDragEnd = event => {
	setTimeout(() => {
		queryClient.setQueryData(['items'], reordered);
	}, 300);
};
```

### ❌ Don't disable animations

```typescript
// BAD - Removes smooth transitions
useSortable({
	id: item.id,
	animateLayoutChanges: () => false, // Don't do this as a "fix"
});
```

## References

- Original solution by jezzzm: https://github.com/clauderic/dnd-kit/discussions/1522
- dnd-kit documentation: https://docs.dndkit.com/
- React Query documentation: https://tanstack.com/query/latest
