'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';
import { parseAsBoolean } from 'nuqs';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for products
interface ProductPageData {
	products: AppRouterOutputs['product']['byWorkspace']['products'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for products
export const useProductSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		preorder: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		togglePreorder: setParams => () => setParams(prev => ({ preorder: !prev.preorder })),
	},
});

// Create a custom data hook for products that properly uses tRPC
export function useProduct() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['product']['byWorkspace']['products'][0],
		ProductPageData
	>(
		{
			resourceName: 'products',
			getQueryOptions: (handle, filters) =>
				trpc.product.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: ProductPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.products),
		},
		useProductSearchParams,
	);

	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useProductContext = useProduct;
