'use client';

import type { FanGroup } from '@barely/validators';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';

import type { FanGroupSync } from '~/collections';
import { useFanGroupsLiveQuery } from '~/collections';

// Create the search params hook for fan groups
export const useFanGroupSearchParams = createResourceSearchParamsHook();

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(fanGroup: FanGroupSync): FanGroup {
	return {
		id: fanGroup.id,
		workspaceId: fanGroup.workspaceId,
		name: fanGroup.name,
		description: fanGroup.description,
		// Timestamps (convert from Electric string format to Date)
		createdAt: new Date(fanGroup.created_at),
		updatedAt: new Date(fanGroup.updated_at),
		deletedAt: fanGroup.deleted_at ? new Date(fanGroup.deleted_at) : null,
		archivedAt: fanGroup.archived_at ? new Date(fanGroup.archived_at) : null,
	};
}

/**
 * Main hook for Fan Groups - uses Electric SQL live query for real-time data
 */
export function useFanGroup() {
	const searchParams = useFanGroupSearchParams();
	const {
		data: fanGroups,
		isLoading,
		isEnabled,
	} = useFanGroupsLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('fan-groups');

	// Map and filter data
	const items = useMemo(() => {
		if (!fanGroups) return [];

		let filtered = fanGroups;

		// Apply search filter (by name)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(fanGroup =>
				fanGroup.name.toLowerCase().includes(search),
			);
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [fanGroups, searchParams.filters.search]);

	// Compute last selected item
	const selectedIds = searchParams.selectedIds;
	const lastSelectedItemId = useMemo(() => {
		if (selectedIds === 'all') return items[0]?.id;
		if (Array.isArray(selectedIds) && selectedIds.length > 0) {
			return selectedIds[selectedIds.length - 1];
		}
		return undefined;
	}, [selectedIds, items]);

	const lastSelectedItem = useMemo(() => {
		if (!lastSelectedItemId) return undefined;
		return items.find(item => item.id === lastSelectedItemId);
	}, [lastSelectedItemId, items]);

	return {
		// Data
		items,
		// Selection
		lastSelectedItemId,
		lastSelectedItem,
		// Loading states
		isFetching: isLoading,
		isFetchingNextPage: false,
		isRefetching: false,
		isPending: !isEnabled,
		hasNextPage: false, // Electric syncs all data, no pagination
		// Fetch functions (no-ops for Electric)
		fetchNextPage: () => Promise.resolve(),
		refetch: () => Promise.resolve(),
		// Grid list
		gridListRef,
		focusGridList,
		// Search params
		...searchParams,
	};
}

// Export the old context hook name for backward compatibility
export const useFanGroupContext = useFanGroup;
