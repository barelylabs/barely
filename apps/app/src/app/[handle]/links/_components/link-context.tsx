'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';

import type { LinkSync } from '~/collections';
import { useLinksLiveQuery } from '~/collections';

// Define the page data type for links (for backward compatibility)
type LinkFromApi = AppRouterOutputs['link']['byWorkspace']['links'][0];

// Create the search params hook for links
export const useLinkSearchParams = createResourceSearchParamsHook();

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(link: LinkSync): LinkFromApi {
	return {
		id: link.id,
		workspaceId: link.workspaceId,
		handle: link.handle,
		// Link structure (map column names to code names)
		app: link.appId,
		appRoute: link.appRoute,
		domain: link.domain,
		key: link.slug, // DB column is 'slug', code uses 'key'
		// Destination
		url: link.url,
		appleScheme: link.appleScheme,
		androidScheme: link.androidScheme,
		externalAppLinkUrl: link.externalAppLinkUrl,
		// Custom meta tags
		customMetaTags: link.customMetaTags ?? false,
		title: link.title,
		description: link.description,
		image: link.image,
		favicon: link.favicon,
		// QR code
		qrLight: link.qrLight,
		qrDark: link.qrDark,
		qrText: link.qrText,
		qrLogo: link.qrLogo,
		// Settings
		remarketing: link.remarketing,
		transparent: link.transparent,
		// Internal
		comments: link.comments,
		showSocialForTeam: link.showSocialForTeam ?? false,
		// Archive/delete
		archived: link.archived ?? false,
		// Stats
		clicks: link.clicks ?? 0,
		publicStats: link.publicStats ?? false,
		// Relations
		userId: link.userId,
		appLinkId: link.appLinkId,
		bioId: link.bioId,
		socialForTeamId: link.socialForTeamId,
		// Map timestamps from string to Date
		createdAt: new Date(link.created_at),
		updatedAt: new Date(link.updated_at),
		deletedAt: link.deleted_at ? new Date(link.deleted_at) : null,
		archivedAt: link.archived_at ? new Date(link.archived_at) : null,
	} as LinkFromApi;
}

/**
 * Main hook for Links - uses Electric SQL live query for real-time data
 */
export function useLink() {
	const searchParams = useLinkSearchParams();
	const {
		data: links,
		isLoading,
		isEnabled,
	} = useLinksLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('links');

	// Map and filter data
	const items = useMemo(() => {
		if (!links) return [];

		let filtered = links;

		// Apply search filter
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(
				link =>
					link.slug.toLowerCase().includes(search) ||
					link.url.toLowerCase().includes(search) ||
					link.title?.toLowerCase().includes(search),
			);
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [links, searchParams.filters.search]);

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
export const useLinkContext = useLink;
