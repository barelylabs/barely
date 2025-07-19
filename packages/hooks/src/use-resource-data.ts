'use client';

import type { InfiniteData } from '@tanstack/react-query';
import { useRef } from 'react';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import type {
	BaseResourceFilters,
	ResourceDataConfig,
	ResourceDataReturn,
	ResourceSearchParamsReturn,
} from './resource-hooks.types';
import { useWorkspace } from './use-workspace';

/**
 * Factory function to create a resource-specific data fetching hook
 * that uses search params and fetches data with infinite queries
 */
export function createResourceDataHook<
	TItem extends { id: string },
	TPageData,
	TFilters extends BaseResourceFilters = BaseResourceFilters,
>(
	config: ResourceDataConfig<TItem, TPageData>,
	useSearchParams: () => ResourceSearchParamsReturn<TFilters>,
) {
	return function useResourceData(): ResourceDataReturn<TItem, TFilters> {
		const { handle } = useWorkspace();
		const { selection, setSelection, filters } = useSearchParams();

		// Filter out modal states and setter functions before passing to query
		// Modal states (showCreateModal, showMarkAsFulfilledModal, etc.) should not be sent to the API
		const queryFilters = Object.entries(filters as Record<string, unknown>).reduce(
			(acc, [key, value]) => {
				// Exclude any params that match modal state pattern or setter functions
				if (!/^show.*Modal$/.test(key) && typeof value !== 'function') {
					acc[key] = value;
				}
				return acc;
			},
			{} as Record<string, unknown>,
		);

		// Fetch data with infinite query
		const {
			data,
			hasNextPage,
			fetchNextPage,
			isFetchingNextPage,
			isFetching,
			isRefetching,
			isPending,
		} = useSuspenseInfiniteQuery<
			TPageData,
			Error,
			InfiniteData<TPageData>,
			unknown[],
			unknown
		>(
			// @ts-expect-error - Query options from tRPC have complex types that are hard to match exactly
			config.getQueryOptions(handle, queryFilters),
		);

		// Extract items from paginated data - data.pages is now properly typed as TPageData[]
		const items = config.getItemsFromPages(data.pages);

		// Get last selected item
		const lastSelectedItemId =
			selection === 'all' || !selection.size ?
				undefined
			:	Array.from(selection).pop()?.toString();
		const lastSelectedItem = items.find(item => item.id === lastSelectedItemId);

		// UI refs
		const gridListRef = useRef<HTMLDivElement>(null);
		const focusGridList = () => gridListRef.current?.focus();

		return {
			items,
			selection,
			lastSelectedItemId,
			lastSelectedItem,
			filters,
			setSelection,
			hasNextPage,
			fetchNextPage: () => void fetchNextPage(),
			isFetchingNextPage,
			isFetching,
			isRefetching,
			isPending,
			// UI refs
			gridListRef,
			focusGridList,
		};
	};
}
