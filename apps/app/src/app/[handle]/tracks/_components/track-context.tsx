'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { BaseResourceFilters } from '@barely/hooks';
import {
	action,
	createResourceDataHook,
	createResourceSearchParamsHook,
} from '@barely/hooks';
import { parseAsArrayOf, parseAsBoolean, parseAsString } from 'nuqs';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for tracks
interface TrackPageData {
	tracks: AppRouterOutputs['track']['byWorkspace']['tracks'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Define custom filters interface
interface TrackFilters extends BaseResourceFilters {
	genres: string[];
	released?: boolean;
}

// Create the search params hook for tracks with custom filters
export const useTrackSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		genres: parseAsArrayOf(parseAsString).withDefault([]),
		released: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		setGenres: action((setParams, genres: string[]) => setParams({ genres })),
		toggleReleased: action(setParams =>
			setParams(prev => ({
				released:
					(prev.released as boolean | undefined) === undefined ?
						true
					:	!(prev.released as boolean),
			})),
		),
	},
});

// export const useTrackSearchParams =
// 	_useTrackSearchParams as () => TrackSearchParamsReturn;

// Create a custom data hook for tracks that properly uses tRPC
export function useTrack() {
	const trpc = useTRPC();
	const searchParams = useTrackSearchParams();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['track']['byWorkspace']['tracks'][0],
		TrackPageData,
		TrackFilters
	>(
		{
			resourceName: 'tracks',
			getQueryOptions: (handle, filters) =>
				trpc.track.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: TrackPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.tracks),
		},
		() => searchParams, // Pass the instance directly
	);

	const dataHookResult = baseHook();

	// Merge search params and data hook results
	return {
		...dataHookResult,
		...searchParams,
	};
}

// Export the old context hook name for backward compatibility
export const useTrackContext = useTrack;
