'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for links
interface LinkPageData {
	links: AppRouterOutputs['link']['byWorkspace']['links'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for links
export const useLinkSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for links that properly uses tRPC
export function useLink() {
	const trpc = useTRPC();
	const searchParams = useLinkSearchParams();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['link']['byWorkspace']['links'][0],
		LinkPageData
	>(
		{
			resourceName: 'links',
			getQueryOptions: (handle, filters) =>
				trpc.link.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: LinkPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.links),
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
export const useLinkContext = useLink;
