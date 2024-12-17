'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { productFilterParamsSchema } from '@barely/lib/server/routes/product/product.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { productSearchParamsSchema } from '@barely/lib/server/routes/product/product.schema';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

// export interface ProductCtx {
// 	products: AppRouterOutputs['product']['byWorkspace']['products'];
// 	productSelection: Selection;
// 	lastSelectedProductId: string | undefined;
// 	lastSelectedProduct:
// 		| AppRouterOutputs['product']['byWorkspace']['products'][number]
// 		| undefined;
// 	setProductSelection: (selection: Selection) => void;
// 	gridListRef: React.RefObject<HTMLDivElement>;
// 	focusGridList: () => void;
// 	showCreateProductModal: boolean;
// 	setShowCreateProductModal: (show: boolean) => void;
// 	showUpdateProductModal: boolean;
// 	setShowUpdateProductModal: (show: boolean) => void;
// 	showArchiveProductModal: boolean;
// 	setShowArchiveProductModal: (show: boolean) => void;
// 	showDeleteProductModal: boolean;
// 	setShowDeleteProductModal: (show: boolean) => void;
// 	// filters
// 	filters: z.infer<typeof productFilterParamsSchema>;
// 	pendingFiltersTransition: boolean;
// 	setSearch: (search: string) => void;
// 	toggleArchived: () => void;
// 	clearAllFilters: () => void;
// }
export type ProductContext = InfiniteItemsContext<
	AppRouterOutputs['product']['byWorkspace']['products'][number],
	z.infer<typeof productFilterParamsSchema>
>;

const ProductContext = createContext<ProductContext | undefined>(undefined);

export function ProductContextProvider({
	children,
	initialInfiniteProducts,
}: {
	children: React.ReactNode;
	initialInfiniteProducts: Promise<AppRouterOutputs['product']['byWorkspace']>;
}) {
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

	const initialData = use(initialInfiniteProducts);

	const {
		data: infiniteProducts,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = api.product.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [
						{
							products: initialData.products,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [], // fixme: add page params
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const products = infiniteProducts?.pages.flatMap(page => page.products) ?? [];

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
		if (filters.showArchived) return removeByKey('showArchived');

		setQuery('showArchived', true);
	}, [filters.showArchived, removeByKey, setQuery]);

	const setSearch = useCallback(
		(search: string) => {
			if (search.length) return setQuery('search', search);
			return removeByKey('search');
		},
		[removeByKey, setQuery],
	);

	const lastSelectedProductId =
		!productSelection || productSelection === 'all' ?
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
