'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import {
	action,
	createResourceDataHook,
	createResourceSearchParamsHook,
} from '@barely/hooks';
import { parseAsBoolean } from 'nuqs';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for fans
interface FanPageData {
	fans: AppRouterOutputs['fan']['byWorkspace']['fans'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for fans with import modal state
export const useFanSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		showImportModal: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		setShowImportModal: action((setParams, show: boolean) =>
			setParams({ showImportModal: show }),
		),
	},
});

// Create a custom data hook for fans that properly uses tRPC
export function useFan() {
	const trpc = useTRPC();
	const searchParams = useFanSearchParams();

	const baseHook = createResourceDataHook<
		AppRouterOutputs['fan']['byWorkspace']['fans'][0],
		FanPageData
	>(
		{
			resourceName: 'fans',
			getQueryOptions: (handle, filters) =>
				trpc.fan.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: FanPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.fans),
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
export const useFanContext = useFan;
