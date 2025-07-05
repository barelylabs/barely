'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { cartOrderFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { cartOrderSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type CartOrderContext = InfiniteItemsContext<
	AppRouterOutputs['cartOrder']['byWorkspace']['cartOrders'][0],
	z.infer<typeof cartOrderFilterParamsSchema>
> & {
	showMarkAsFulfilledModal: boolean;
	setShowMarkAsFulfilledModal: (show: boolean) => void;
	showCancelCartOrderModal: boolean;
	setShowCancelCartOrderModal: (show: boolean) => void;
	toggleFulfilled: () => void;
	togglePreorders: () => void;
	toggleCanceled: () => void;
};

const CartOrderContext = createContext<CartOrderContext | undefined>(undefined);

export function CartOrderContextProvider({ children }: { children: React.ReactNode }) {
	const [showMarkAsFulfilledModal, setShowMarkAsFulfilledModal] = useState(false);
	const [showCancelCartOrderModal, setShowCancelCartOrderModal] = useState(false);

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(cartOrderSearchParamsSchema);

	const { selectedOrderCartIds, ...filters } = data;

	const cartOrderSelection: Selection =
		!selectedOrderCartIds ? new Set()
		: selectedOrderCartIds === 'all' ? 'all'
		: new Set(selectedOrderCartIds);

	const {
		data: infiniteCartOrders,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.cartOrder.byWorkspace.infiniteQueryOptions(
			{
				handle,
				...filters,
			},
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const cartOrders = infiniteCartOrders.pages.flatMap(page => page.cartOrders);

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
		if (data.showArchived) {
			removeByKey('showArchived');
		} else {
			return setQuery('showArchived', true);
		}
	}, [data.showArchived, removeByKey, setQuery]);

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

	const toggleCanceled = useCallback(() => {
		if (filters.showCanceled) {
			removeByKey('showCanceled');
		} else {
			return setQuery('showCanceled', true);
		}
	}, [filters.showCanceled, removeByKey, setQuery]);

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
		cartOrderSelection === 'all' || !cartOrderSelection.size ?
			undefined
		:	Array.from(cartOrderSelection).pop()?.toString();

	const lastSelectedCartOrder = cartOrders.find(
		order => order.id === lastSelectedCartOrderId,
	);

	const contextValue = {
		items: cartOrders,
		selection: cartOrderSelection,
		lastSelectedItemId: lastSelectedCartOrderId,
		lastSelectedItem: lastSelectedCartOrder,
		setSelection: setCartOrderSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		// modals
		showCreateModal: false,
		setShowCreateModal: () => void {},
		showUpdateModal: false,
		setShowUpdateModal: () => void {},
		showDeleteModal: false,
		setShowDeleteModal: () => void {},
		showArchiveModal: false,
		setShowArchiveModal: () => void {},
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
		toggleCanceled,
		clearAllFilters,
		// infinite
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
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
