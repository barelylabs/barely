'use client';

import type { FanGroup } from '@barely/validators';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for fan groups
interface FanGroupPageData {
	fanGroups: FanGroup[];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for fan groups
export const useFanGroupSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for fan groups that properly uses tRPC
export function useFanGroup() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<FanGroup, FanGroupPageData>(
		{
			resourceName: 'fan-groups',
			getQueryOptions: (handle, filters) =>
				trpc.fanGroup.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: FanGroupPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.fanGroups),
		},
		useFanGroupSearchParams,
	);

	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useFanGroupContext = useFanGroup;
