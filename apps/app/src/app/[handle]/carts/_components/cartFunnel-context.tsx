'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { cartFunnelFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { cartFunnelSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

interface CartFunnelContext {
	cartFunnels: AppRouterOutputs['cartFunnel']['byWorkspace']['cartFunnels'];
	cartFunnelSelection: Selection;
	lastSelectedCartFunnelId: string | undefined;
	lastSelectedCartFunnel:
		| AppRouterOutputs['cartFunnel']['byWorkspace']['cartFunnels'][number]
		| undefined;
	setCartFunnelSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement | null>;
	focusGridList: () => void;
	showCreateCartFunnelModal: boolean;
	setShowCreateCartFunnelModal: (show: boolean) => void;
	showUpdateCartFunnelModal: boolean;
	setShowUpdateCartFunnelModal: (show: boolean) => void;
	showArchiveCartFunnelModal: boolean;
	setShowArchiveCartFunnelModal: (show: boolean) => void;
	showDeleteCartFunnelModal: boolean;
	setShowDeleteCartFunnelModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof cartFunnelFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;

	isPending: boolean;
	isFetching: boolean;
	isRefetching: boolean;
}

const CartFunnelContext = createContext<CartFunnelContext | undefined>(undefined);

export function CartFunnelContextProvider({ children }: { children: React.ReactNode }) {
	const trpc = useTRPC();
	const [showCreateFunnelModal, setShowCreateFunnelModal] = useState(false);
	const [showUpdateFunnelModal, setShowUpdateFunnelModal] = useState(false);
	const [showArchiveFunnelModal, setShowArchiveFunnelModal] = useState(false);
	const [showDeleteFunnelModal, setShowDeleteFunnelModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(cartFunnelSearchParamsSchema);

	const { selectedCartFunnelIds, ...filters } = data;

	const cartFunnelSelection: Selection =
		!selectedCartFunnelIds ? new Set()
		: selectedCartFunnelIds === 'all' ? 'all'
		: new Set(selectedCartFunnelIds);

	const {
		data: infiniteFunnels,
		isRefetching,
		isFetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.cartFunnel.byWorkspace.infiniteQueryOptions(
			{
				handle,
				...filters,
			},
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const cartFunnels = infiniteFunnels.pages.flatMap(page => page.cartFunnels);

	// setters
	const setCartFunnelSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedCartFunnelIds');
			return setQuery(
				'selectedCartFunnelIds',
				Array.from(selection).map(key => key.toString()),
			);
		},
		[removeByKey, setQuery],
	);

	const clearAllFilters = useCallback(() => {
		removeAllQueryParams();
	}, [removeAllQueryParams]);

	const toggleArchived = useCallback(() => {
		if (filters.showArchived) return removeByKey('showArchived');
		return setQuery('showArchived', true);
	}, [filters.showArchived, removeByKey, setQuery]);

	const setSearch = useCallback(
		(search: string) => {
			if (search.length) return setQuery('search', search);
			return removeByKey('search');
		},
		[removeByKey, setQuery],
	);

	const lastSelectedCartFunnelId =
		cartFunnelSelection === 'all' || !cartFunnelSelection.size ?
			undefined
		:	Array.from(cartFunnelSelection).pop()?.toString();

	const lastSelectedCartFunnel = cartFunnels.find(f => f.id === lastSelectedCartFunnelId);

	const gridListRef = useRef<HTMLDivElement>(null);

	const contextValue = {
		cartFunnels,
		cartFunnelSelection,
		lastSelectedCartFunnelId,
		lastSelectedCartFunnel,
		setCartFunnelSelection: setCartFunnelSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showCreateCartFunnelModal: showCreateFunnelModal,
		setShowCreateCartFunnelModal: setShowCreateFunnelModal,
		showUpdateCartFunnelModal: showUpdateFunnelModal,
		setShowUpdateCartFunnelModal: setShowUpdateFunnelModal,
		showArchiveCartFunnelModal: showArchiveFunnelModal,
		setShowArchiveCartFunnelModal: setShowArchiveFunnelModal,
		showDeleteCartFunnelModal: showDeleteFunnelModal,
		setShowDeleteCartFunnelModal: setShowDeleteFunnelModal,
		// filters
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		toggleArchived,
		clearAllFilters,
		isRefetching,
		isFetching,
		isPending,
	} satisfies CartFunnelContext;

	return (
		<CartFunnelContext.Provider value={contextValue}>
			{children}
		</CartFunnelContext.Provider>
	);
}

export function useCartFunnelContext() {
	const context = useContext(CartFunnelContext);
	if (!context) {
		throw new Error('useFunnelContext must be used within a FunnelContextProvider');
	}
	return context;
}
