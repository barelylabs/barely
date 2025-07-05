'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { productFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { productSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

export type ProductContext = InfiniteItemsContext<
	AppRouterOutputs['product']['byWorkspace']['products'][number],
	z.infer<typeof productFilterParamsSchema>
>;

const ProductContext = createContext<ProductContext | undefined>(undefined);

export function ProductContextProvider({ children }: { children: React.ReactNode }) {
	const trpc = useTRPC();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { handle } = useWorkspace();

	const {
		data,
		setQuery,
		removeByKey,
		removeAllQueryParams,
		pending: pendingFiltersTransition,
	} = useTypedOptimisticQuery(productSearchParamsSchema);

	const { selectedProductIds, ...filters } = data;

	const productSelection: Selection =
		!selectedProductIds ? new Set()
		: selectedProductIds === 'all' ? 'all'
		: new Set(selectedProductIds);

	const {
		data: infiniteProducts,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.product.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const products = infiniteProducts.pages.flatMap(page => page.products);

	const setProductSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedProductIds');
			return setQuery(
				'selectedProductIds',
				Array.from(selection).map(key => key.toString()),
			);
		},
		[removeByKey, setQuery],
	);

	const clearAllFilters = useCallback(() => {
		removeAllQueryParams();
	}, [removeAllQueryParams]);

	const toggleArchived = useCallback(() => {
		if (data.showArchived) return removeByKey('showArchived');

		setQuery('showArchived', true);
	}, [data.showArchived, removeByKey, setQuery]);

	const setSearch = useCallback(
		(search: string) => {
			if (search.length) return setQuery('search', search);
			return removeByKey('search');
		},
		[removeByKey, setQuery],
	);

	const lastSelectedProductId =
		productSelection === 'all' || !productSelection.size ?
			undefined
		:	Array.from(productSelection).pop()?.toString();

	const lastSelectedProduct = products.find(p => p.id === lastSelectedProductId);

	const gridListRef = useRef<HTMLDivElement>(null);

	const contextValue = {
		items: products,
		selection: productSelection,
		lastSelectedItemId: lastSelectedProductId,
		lastSelectedItem: lastSelectedProduct,
		setSelection: setProductSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showCreateModal,
		setShowCreateModal,
		showUpdateModal,
		setShowUpdateModal,
		showArchiveModal,
		setShowArchiveModal,
		showDeleteModal,
		setShowDeleteModal,
		// filters
		filters,
		pendingFiltersTransition,
		setSearch,
		toggleArchived,
		clearAllFilters,
		// infinite
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} satisfies ProductContext;

	return (
		<ProductContext.Provider value={contextValue}>{children}</ProductContext.Provider>
	);
}

export function useProductContext() {
	const context = useContext(ProductContext);
	if (!context) {
		throw new Error('useProductContext must be used within a ProductContextProvider');
	}
	return context;
}
