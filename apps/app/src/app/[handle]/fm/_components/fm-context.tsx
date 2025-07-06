'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for fm pages
interface FmPageData {
	fmPages: AppRouterOutputs['fm']['byWorkspace']['fmPages'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for fm pages
export const useFmSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for fm pages that properly uses tRPC
export function useFm() {
	const trpc = useTRPC();
	const searchParams = useFmSearchParams();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['fm']['byWorkspace']['fmPages'][0],
		FmPageData
	>(
		{
			resourceName: 'fm-pages',
			getQueryOptions: (handle, filters) =>
				trpc.fm.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: FmPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.fmPages),
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
export const useFmContext = useFm;