'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { cartFunnelFilterParamsSchema } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { cartFunnelSearchParamsSchema } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';

interface CartFunnelContext {
	cartFunnels: AppRouterOutputs['cartFunnel']['byWorkspace']['cartFunnels'];
	cartFunnelSelection: Selection;
	lastSelectedCartFunnelId: string | undefined;
	lastSelectedCartFunnel:
		| AppRouterOutputs['cartFunnel']['byWorkspace']['cartFunnels'][number]
		| undefined;
	setCartFunnelSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
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
}

const CartFunnelContext = createContext<CartFunnelContext | undefined>(undefined);

export function CartFunnelContextProvider({
	children,
	initialInfiniteCartFunnels,
}: {
	children: React.ReactNode;
	initialInfiniteCartFunnels: Promise<AppRouterOutputs['cartFunnel']['byWorkspace']>;
}) {
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

	const initialData = use(initialInfiniteCartFunnels);

	const { data: infiniteFunnels } = api.cartFunnel.byWorkspace.useInfiniteQuery(
		{
			handle,
			...filters,
		},
		{
			initialData: () => {
				return {
					pages: [
						{
							cartFunnels: initialData.cartFunnels,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [], // todo: add page params
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const cartFunnels = infiniteFunnels?.pages.flatMap(page => page.cartFunnels) ?? [];

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
		cartFunnelSelection === 'all' || !cartFunnelSelection ?
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
