'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for mixtapes
interface MixtapePageData {
	mixtapes: AppRouterOutputs['mixtape']['byWorkspace']['mixtapes'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for mixtapes
export const useMixtapeSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for mixtapes that properly uses tRPC
export function useMixtape() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<AppRouterOutputs['mixtape']['byWorkspace']['mixtapes'][0], MixtapePageData>(
		{
			resourceName: 'mixtapes',
			getQueryOptions: (handle, filters) =>
				trpc.mixtape.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: MixtapePageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.mixtapes),
		},
		useMixtapeSearchParams,
	);
	
	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useMixtapeContext = useMixtape;