'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { cartOrderFilterParamsSchema } from '@barely/lib/server/routes/cart-order/cart-order.schema';
import type {
	FetchNextPageOptions,
	// 	InfiniteData,
	// 	InfiniteQueryObserverResult,
	// 	UseInfiniteQueryResult,
} from '@tanstack/react-query';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { cartOrderSearchParamsSchema } from '@barely/lib/server/routes/cart-order/cart-order.schema';

interface CartOrderContext {
	cartOrders: AppRouterOutputs['cartOrder']['byWorkspace']['cartOrders'];
	cartOrderSelection: Selection;
	lastSelectedCartOrderId: string | undefined;
	lastSelectedCartOrder:
		| AppRouterOutputs['cartOrder']['byWorkspace']['cartOrders'][0]
		| undefined;
	setCartOrderSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showMarkAsFulfilledModal: boolean;
	setShowMarkAsFulfilledModal: (show: boolean) => void;
	showCancelCartOrderModal: boolean;
	setShowCancelCartOrderModal: (show: boolean) => void;
	//infinite
	hasNextPage: boolean;
	fetchNextPage: (options?: FetchNextPageOptions) => void | Promise<void>;
	isFetchingNextPage: boolean;
	// filters
	filters: z.infer<typeof cartOrderFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	toggleFulfilled: () => void;
	clearAllFilters: () => void;
	togglePreorders: () => void;
}

const CartOrderContext = createContext<CartOrderContext | undefined>(undefined);

export function CartOrderContextProvider({
	children,
	initialInfiniteOrders,
}: {
	children: React.ReactNode;
	initialInfiniteOrders: Promise<AppRouterOutputs['cartOrder']['byWorkspace']>;
}) {
	const [showMarkAsFulfilledModal, setShowMarkAsFulfilledModal] = useState(false);
	const [showCancelCartOrderModal, setShowCancelCartOrderModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(cartOrderSearchParamsSchema);

	const { selectedOrderCartIds, ...filters } = data;

	const cartOrderSelection: Selection =
		!selectedOrderCartIds ? new Set()
		: selectedOrderCartIds === 'all' ? 'all'
		: new Set(selectedOrderCartIds);

	const initialData = use(initialInfiniteOrders);

	const {
		data: infiniteCartOrders,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = api.cartOrder.byWorkspace.useInfiniteQuery(
		{
			handle,
			...filters,
		},
		{
			initialData: () => {
				return {
					pages: [
						{ cartOrders: initialData.cartOrders, nextCursor: initialData.nextCursor },
					],
					pageParams: [], // todo - figure out how to structure this
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const cartOrders = infiniteCartOrders?.pages.flatMap(page => page.cartOrders) ?? [];

	const gridListRef = useRef<HTMLDivElement>(null);

	const setCartOrderSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedOrderCartIds');

			return setQuery(
				'selectedOrderCartIds',
				Array.from(selection).map(key => key.toString()),
			);
		},
		[removeByKey, setQuery],
	);

	const clearAllFilters = useCallback(() => {
		removeAllQueryParams();
	}, [removeAllQueryParams]);

	const toggleArchived = useCallback(() => {
		if (filters.showArchived) {
			removeByKey('showArchived');
		} else {
			return setQuery('showArchived', true);
		}
	}, [filters.showArchived, removeByKey, setQuery]);

	const toggleFulfilled = useCallback(() => {
		if (filters.showFulfilled) {
			removeByKey('showFulfilled');
		} else {
			return setQuery('showFulfilled', true);
		}
	}, [filters.showFulfilled, removeByKey, setQuery]);

	const togglePreorders = useCallback(() => {
		if (filters.showPreorders) {
			removeByKey('showPreorders');
		} else {
			return setQuery('showPreorders', true);
		}
	}, [filters.showPreorders, removeByKey, setQuery]);

	const setSearch = useCallback(
		(search: string) => {
			if (search.length) {
				return setQuery('search', search);
			} else {
				return removeByKey('search');
			}
		},
		[removeByKey, setQuery],
	);

	const lastSelectedCartOrderId =
		cartOrderSelection === 'all' || !cartOrderSelection ?
			undefined
		:	Array.from(cartOrderSelection).pop()?.toString();

	const lastSelectedCartOrder = cartOrders.find(
		order => order.id === lastSelectedCartOrderId,
	);

	const contextValue = {
		cartOrders,
		cartOrderSelection,
		lastSelectedCartOrderId,
		lastSelectedCartOrder,
		setCartOrderSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		// modals
		showMarkAsFulfilledModal,
		setShowMarkAsFulfilledModal,
		showCancelCartOrderModal,
		setShowCancelCartOrderModal,
		// filters
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		toggleArchived,
		toggleFulfilled,
		togglePreorders,
		clearAllFilters,
		// infinite
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
	} satisfies CartOrderContext;

	return (
		<CartOrderContext.Provider value={contextValue}>{children}</CartOrderContext.Provider>
	);
}

export function useCartOrderContext() {
	const context = useContext(CartOrderContext);

	if (!context) {
		throw new Error('useCartOrder must be used within a CartOrderContextProvider');
	}

	return context;
}
