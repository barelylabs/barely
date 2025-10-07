'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import {
	action,
	createResourceDataHook,
	createResourceSearchParamsHook,
} from '@barely/hooks';
import { parseAsBoolean } from 'nuqs';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for cart orders
interface CartOrderPageData {
	cartOrders: AppRouterOutputs['cartOrder']['byWorkspace']['cartOrders'];
	nextCursor?: { orderId: number; checkoutConvertedAt: Date } | null;
}

// Create the search params hook for cart orders with custom filters and modal states
export const useCartOrderSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		showFulfilled: parseAsBoolean.withDefault(false),
		showPreorders: parseAsBoolean.withDefault(false),
		showCanceled: parseAsBoolean.withDefault(false),
		showMarkAsFulfilledModal: parseAsBoolean.withDefault(false),
		showCancelCartOrderModal: parseAsBoolean.withDefault(false),
		showShipOrderModal: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		toggleFulfilled: action(setParams =>
			setParams(prev => ({ showFulfilled: !prev.showFulfilled })),
		),
		togglePreorders: action(setParams =>
			setParams(prev => ({ showPreorders: !prev.showPreorders })),
		),
		toggleCanceled: action(setParams =>
			setParams(prev => ({ showCanceled: !prev.showCanceled })),
		),
		setShowMarkAsFulfilledModal: action((setParams, show: boolean) =>
			setParams({ showMarkAsFulfilledModal: show }),
		),
		setShowCancelCartOrderModal: action((setParams, show: boolean) =>
			setParams({ showCancelCartOrderModal: show }),
		),
		setShowShipOrderModal: action((setParams, show: boolean) =>
			setParams({ showShipOrderModal: show }),
		),
	},
});

// Create a custom data hook for cart orders that properly uses tRPC
export function useCartOrder() {
	const trpc = useTRPC();
	const searchParams = useCartOrderSearchParams();

	const baseHook = createResourceDataHook<
		AppRouterOutputs['cartOrder']['byWorkspace']['cartOrders'][0],
		CartOrderPageData
	>(
		{
			resourceName: 'cart-orders',
			getQueryOptions: (handle, filters) =>
				trpc.cartOrder.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: CartOrderPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.cartOrders),
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
export const useCartOrderContext = useCartOrder;
