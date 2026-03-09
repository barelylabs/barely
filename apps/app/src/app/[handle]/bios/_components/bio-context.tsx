'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';

import type { BioSync } from '~/collections';
import { useBiosLiveQuery } from '~/collections';

// Define the page data type for bio pages (for backward compatibility)
type BioPageFromApi = AppRouterOutputs['bio']['byWorkspace']['bios'][0];

// Create the search params hook for bio pages
export const useBiosSearchParams = createResourceSearchParamsHook();

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(bio: BioSync): BioPageFromApi {
	return {
		id: bio.id,
		workspaceId: bio.workspaceId,
		handle: bio.handle,
		key: bio.key,
		// Bio-specific settings
		imgShape: bio.imgShape,
		socialDisplay: bio.socialDisplay,
		showLocation: bio.showLocation,
		showHeader: bio.showHeader,
		headerStyle: bio.headerStyle,
		showShareButton: bio.showShareButton,
		showSubscribeButton: bio.showSubscribeButton,
		barelyBranding: bio.barelyBranding,
		// Email capture
		emailCaptureEnabled: bio.emailCaptureEnabled,
		emailCaptureIncentiveText: bio.emailCaptureIncentiveText,
		// Layout
		hasTwoPanel: bio.hasTwoPanel,
		// SEO
		title: bio.title,
		description: bio.description,
		noindex: bio.noindex,
		// Map timestamps from string to Date
		createdAt: new Date(bio.created_at),
		updatedAt: new Date(bio.updated_at),
		deletedAt: bio.deleted_at ? new Date(bio.deleted_at) : null,
		archivedAt: bio.archived_at ? new Date(bio.archived_at) : null,
	} as BioPageFromApi;
}

/**
 * Main hook for Bio pages - uses Electric SQL live query for real-time data
 */
export function useBios() {
	const searchParams = useBiosSearchParams();
	const {
		data: bios,
		isLoading,
		isEnabled,
	} = useBiosLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('bio-pages');

	// Map and filter data
	const items = useMemo(() => {
		if (!bios) return [];

		let filtered = bios;

		// Apply search filter
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(
				bio =>
					bio.key.toLowerCase().includes(search) ||
					bio.title?.toLowerCase().includes(search),
			);
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [bios, searchParams.filters.search]);

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
export const useBiosContext = useBios;
