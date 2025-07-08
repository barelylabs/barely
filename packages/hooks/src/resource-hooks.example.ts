/**
 * Example: Using the resource hook factories for different resources
 *
 * This file demonstrates how to use the generic hook factories to create
 * hooks for different resources in your application.
 */

import type { Track } from '@barely/validators';
import { parseAsBoolean, parseAsString } from 'nuqs';

import { useTRPC } from '@barely/api/app/trpc.react';

import { createResourceDataHook, createResourceSearchParamsHook } from './index';

// Example 1: Simple resource (same as landing pages)
export const useLandingPageSearchParams = createResourceSearchParamsHook();

// Example 2: Resource with additional filters (tracks)
export const useTrackSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		genre: parseAsString.withDefault(''),
		released: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		setGenre: setParams =>
			((...args: unknown[]) => {
				const [genre] = args as [string];
				return setParams({ genre });
			}) as (...args: unknown[]) => Promise<URLSearchParams> | undefined,
		toggleReleased: setParams =>
			(() =>
				setParams((p: Record<string, unknown>) => ({
					released: !(p.released as boolean),
				}))) as (...args: unknown[]) => Promise<URLSearchParams> | undefined,
	},
});

// Example 3: Creating the data hook for tracks
// Define the page data type for tracks
interface TrackPageData {
	tracks: Track[];
	nextCursor?: { id: string; createdAt: Date } | null;
}

export function useTrack() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<Track, TrackPageData>(
		{
			resourceName: 'tracks',
			getQueryOptions: (handle, filters) =>
				trpc.track.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: TrackPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.tracks),
		},
		useTrackSearchParams,
	);

	return baseHook();
}

// Example 4: Usage in a component
/*
function TracksPage() {
	const { 
		filters, 
		showCreateModal, 
		setShowCreateModal,
		toggleArchived,
		setGenre,
		toggleReleased 
	} = useTrackSearchParams();
	
	const { 
		items, 
		selection, 
		hasNextPage, 
		fetchNextPage 
	} = useTrack();

	// Focus function for when modals close
	const focusGridList = useFocusGridList('tracks');

	return (
		<>
			<GridList 
				data-grid-list="tracks"
				items={items}
				selection={selection}
			/>
			<Modal 
				open={showCreateModal} 
				onOpenChange={setShowCreateModal}
				onClose={focusGridList}
			/>
		</>
	);
}

// Benefits of URL-based modal state:
// 1. Shareable links: /tracks?showCreateModal=true
// 2. Browser history: Back button closes modals naturally
// 3. Deep linking: Link directly to create form
// 4. No useState needed: Simpler state management
// 5. Consistent with other filters: All UI state in URL

// Example URLs:
// /tracks?showCreateModal=true - Opens create modal
// /tracks?showUpdateModal=true&selectedIds=["123"] - Opens update modal for track 123
// /tracks?search=rock&genre=indie&showArchived=true - Filtered view
*/

// Example 5: Resource with complex filters
export const useCampaignSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		stage: parseAsString.withDefault('all'),
		type: parseAsString.withDefault('all'),
		startDate: parseAsString,
		endDate: parseAsString,
	},
	additionalActions: {
		setStage: setParams =>
			((...args: unknown[]) => {
				const [stage] = args as [string];
				return setParams({ stage });
			}) as (...args: unknown[]) => Promise<URLSearchParams> | undefined,
		setType: setParams =>
			((...args: unknown[]) => {
				const [type] = args as [string];
				return setParams({ type });
			}) as (...args: unknown[]) => Promise<URLSearchParams> | undefined,
		setDateRange: setParams =>
			((...args: unknown[]) => {
				const [start, end] = args as [string, string];
				return setParams({ startDate: start, endDate: end });
			}) as (...args: unknown[]) => Promise<URLSearchParams> | undefined,
	},
});
