'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { BaseResourceFilters, ResourceSearchParamsReturn } from '@barely/hooks';
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

// Define custom filters interface
interface CartOrderFilters extends BaseResourceFilters {
	showFulfilled: boolean;
	showPreorders: boolean;
	showCanceled: boolean;
	showMarkAsFulfilledModal: boolean;
	showCancelCartOrderModal: boolean;
}

// Define the return type for cart order search params
interface CartOrderSearchParamsReturn
	extends ResourceSearchParamsReturn<CartOrderFilters> {
	toggleFulfilled: () => Promise<URLSearchParams>;
	togglePreorders: () => Promise<URLSearchParams>;
	toggleCanceled: () => Promise<URLSearchParams>;
	setShowMarkAsFulfilledModal: (show: boolean) => Promise<URLSearchParams> | undefined;
	setShowCancelCartOrderModal: (show: boolean) => Promise<URLSearchParams> | undefined;
}

// Create the search params hook for cart orders with custom filters and modal states
const _useCartOrderSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		showFulfilled: parseAsBoolean.withDefault(false),
		showPreorders: parseAsBoolean.withDefault(false),
		showCanceled: parseAsBoolean.withDefault(false),
		showMarkAsFulfilledModal: parseAsBoolean.withDefault(false),
		showCancelCartOrderModal: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		toggleFulfilled: action(setParams =>
			setParams(prev => ({ showFulfilled: !(prev.showFulfilled as boolean) })),
		),
		togglePreorders: action(setParams =>
			setParams(prev => ({ showPreorders: !(prev.showPreorders as boolean) })),
		),
		toggleCanceled: action(setParams =>
			setParams(prev => ({ showCanceled: !(prev.showCanceled as boolean) })),
		),
		setShowMarkAsFulfilledModal: action((setParams, show: boolean) =>
			setParams({ showMarkAsFulfilledModal: show }),
		),
		setShowCancelCartOrderModal: action((setParams, show: boolean) =>
			setParams({ showCancelCartOrderModal: show }),
		),
	},
});

export const useCartOrderSearchParams =
	_useCartOrderSearchParams as () => CartOrderSearchParamsReturn;

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
		() => searchParams, // Pass the instance directly
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
