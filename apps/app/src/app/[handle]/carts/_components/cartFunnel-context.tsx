'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for cart funnels
interface CartFunnelPageData {
	cartFunnels: AppRouterOutputs['cartFunnel']['byWorkspace']['cartFunnels'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for cart funnels
export const useCartFunnelSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for cart funnels that properly uses tRPC
export function useCartFunnel() {
	const trpc = useTRPC();
	const searchParams = useCartFunnelSearchParams();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['cartFunnel']['byWorkspace']['cartFunnels'][0],
		CartFunnelPageData
	>(
		{
			resourceName: 'cart-funnels',
			getQueryOptions: (handle, filters) =>
				trpc.cartFunnel.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: CartFunnelPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.cartFunnels),
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
export const useCartFunnelContext = useCartFunnel;