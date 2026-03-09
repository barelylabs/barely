'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useEffect, useMemo, useRef } from 'react';
import {
	createResourceSearchParamsHook,
	useFocusGridList,
	useWorkspace,
} from '@barely/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import type { FmPageWithCoverArt } from '~/collections';
import { useFmPagesLiveQuery } from '~/collections';

// Define the page data type for fm pages (for backward compatibility)
type FmPageFromApi = AppRouterOutputs['fm']['byWorkspace']['fmPages'][0];

// Create the search params hook for fm pages
export const useFmSearchParams = createResourceSearchParamsHook();

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(fmPage: FmPageWithCoverArt): FmPageFromApi {
	return {
		id: fmPage.id,
		workspaceId: fmPage.workspaceId,
		handle: fmPage.handle,
		key: fmPage.key,
		title: fmPage.title,
		sourceUrl: fmPage.sourceUrl,
		genre: fmPage.genre,
		scheme: fmPage.scheme,
		showSocial: fmPage.showSocial,
		remarketing: fmPage.remarketing,
		archived: fmPage.archived,
		coverArtId: fmPage.coverArtId,
		// Map timestamps from string to Date
		createdAt: new Date(fmPage.created_at),
		updatedAt: new Date(fmPage.updated_at),
		deletedAt: fmPage.deleted_at ? new Date(fmPage.deleted_at) : null,
		archivedAt: fmPage.archived_at ? new Date(fmPage.archived_at) : null,
		// Stats
		views: fmPage.views ?? 0,
		clicks: fmPage.clicks ?? 0,
		amazonMusicClicks: fmPage.amazonMusicClicks ?? 0,
		appleMusicClicks: fmPage.appleMusicClicks ?? 0,
		deezerClicks: fmPage.deezerClicks ?? 0,
		itunesClicks: fmPage.itunesClicks ?? 0,
		spotifyClicks: fmPage.spotifyClicks ?? 0,
		tidalClicks: fmPage.tidalClicks ?? 0,
		tiktokClicks: fmPage.tiktokClicks ?? 0,
		youtubeClicks: fmPage.youtubeClicks ?? 0,
		youtubeMusicClicks: fmPage.youtubeMusicClicks ?? 0,
		// Map cover art - critical for images to display
		coverArt:
			fmPage.coverArt ?
				{
					id: fmPage.coverArt.id,
					workspaceId: fmPage.coverArt.workspaceId,
					type: fmPage.coverArt.type as 'image',
					s3Key: fmPage.coverArt.key, // Map 'key' to 's3Key' for S3 image loader
					src: fmPage.coverArt.src,
					width: fmPage.coverArt.width,
					height: fmPage.coverArt.height,
					blurDataURL: fmPage.coverArt.blurDataUrl, // UI uses blurDataURL
					blurDataUrl: fmPage.coverArt.blurDataUrl, // Some components use blurDataUrl
					createdAt: new Date(fmPage.coverArt.created_at),
					deletedAt:
						fmPage.coverArt.deleted_at ? new Date(fmPage.coverArt.deleted_at) : null,
				}
			:	null,
	} as FmPageFromApi;
}

/**
 * Main hook for FM pages - uses Electric SQL live query for real-time data
 */
export function useFm() {
	const searchParams = useFmSearchParams();
	const {
		data: fmPages,
		isLoading,
		isEnabled,
	} = useFmPagesLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('fm-pages');

	// Map and filter data
	const items = useMemo(() => {
		if (!fmPages) return [];

		let filtered = fmPages;

		// Apply search filter
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(
				page =>
					page.title.toLowerCase().includes(search) ||
					page.handle.toLowerCase().includes(search),
			);
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [fmPages, searchParams.filters.search]);

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

	// Prefetch full FM page with links when selection changes
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();

	useEffect(() => {
		if (!lastSelectedItemId) return;
		void queryClient.prefetchQuery(
			trpc.fm.byId.queryOptions({ handle, id: lastSelectedItemId }),
		);
	}, [lastSelectedItemId, queryClient, trpc.fm.byId, handle]);

	// Get full FM page from React Query cache (includes links)
	const { data: selectedFmPageFull, isLoading: isLoadingFullFmPage } = useQuery({
		...trpc.fm.byId.queryOptions({ handle, id: lastSelectedItemId ?? '' }),
		enabled: !!lastSelectedItemId,
		staleTime: 30_000, // 30 seconds
	});

	return {
		// Data
		items,
		// Selection
		lastSelectedItemId,
		lastSelectedItem,
		selectedFmPageFull, // Full record with links (prefetched via tRPC)
		isLoadingFullFmPage, // Loading state for links spinner
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
export const useFmContext = useFm;
