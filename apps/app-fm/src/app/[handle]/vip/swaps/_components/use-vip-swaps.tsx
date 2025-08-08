'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for vip pages
interface VipSwapsData {
	vipSwaps: AppRouterOutputs['vipSwap']['byWorkspace']['vipSwaps'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for vip pages
export const useVipSwapsSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for vip pages that properly uses tRPC
export function useVipSwaps() {
	const trpc = useTRPC();
	const searchParams = useVipSwapsSearchParams();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['vipSwap']['byWorkspace']['vipSwaps'][0],
		VipSwapsData
	>(
		{
			resourceName: 'vip-swaps',
			getQueryOptions: (handle, filters) =>
				trpc.vipSwap.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: VipSwapsData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.vipSwaps),
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
