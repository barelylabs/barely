'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { BaseResourceFilters, ResourceSearchParamsReturn } from '@barely/hooks';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for media
interface MediaPageData {
	files: AppRouterOutputs['file']['byWorkspace']['files'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Media uses the same filters as base resources (no custom filters needed)
type MediaFilters = BaseResourceFilters;

// Media doesn't need additional search params return properties
export type MediaSearchParamsReturn = ResourceSearchParamsReturn<MediaFilters>;

// Create the search params hook for media (no additional parsers/actions needed)
export const useMediaSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for media that properly uses tRPC
export function useMedia() {
	const trpc = useTRPC();
	const searchParams = useMediaSearchParams();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['file']['byWorkspace']['files'][0],
		MediaPageData
	>(
		{
			resourceName: 'media',
			getQueryOptions: (handle, filters) =>
				trpc.file.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: MediaPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.files),
		},
		() => searchParams,
	);

	const dataHookResult = baseHook();

	// Merge search params and data hook results
	return {
		...dataHookResult,
		...searchParams,
	};
}

// Export the old context hook name for backward compatibility
export const useMediaContext = useMedia;
