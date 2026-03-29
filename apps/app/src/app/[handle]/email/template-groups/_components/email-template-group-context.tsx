'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';

import type { EmailTemplateGroupSync } from '~/collections';
import { useEmailTemplateGroupsLiveQuery } from '~/collections';

// Define the page data type for email template groups (for backward compatibility)
type EmailTemplateGroupFromApi =
	AppRouterOutputs['emailTemplateGroup']['byWorkspace']['emailTemplateGroups'][0];

// Create the search params hook for email template groups
export const useEmailTemplateGroupSearchParams = createResourceSearchParamsHook({});

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(group: EmailTemplateGroupSync): EmailTemplateGroupFromApi {
	return {
		id: group.id,
		workspaceId: group.workspaceId,
		// Group info
		name: group.name,
		description: group.description,
		// Timestamps
		createdAt: new Date(group.created_at),
		updatedAt: new Date(group.updated_at),
		deletedAt: group.deleted_at ? new Date(group.deleted_at) : null,
		archivedAt: group.archived_at ? new Date(group.archived_at) : null,
	};
}

/**
 * Main hook for Email Template Groups - uses Electric SQL live query for real-time data
 */
export function useEmailTemplateGroup() {
	const searchParams = useEmailTemplateGroupSearchParams();
	const {
		data: groups,
		isLoading,
		isEnabled,
	} = useEmailTemplateGroupsLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('email-template-groups');

	// Map and filter data
	const items = useMemo(() => {
		if (!groups) return [];

		let filtered = groups;

		// Apply search filter (by name)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(group => group.name.toLowerCase().includes(search));
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [groups, searchParams.filters.search]);

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
export const useEmailTemplateGroupContext = useEmailTemplateGroup;
