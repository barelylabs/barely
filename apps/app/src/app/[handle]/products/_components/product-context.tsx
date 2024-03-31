'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { productFilterParamsSchema } from '@barely/lib/server/routes/product/product.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import {
	createContext,
	use,
	useContext,
	useOptimistic,
	useRef,
	useState,
	useTransition,
} from 'react';
import { useTypedQuery } from '@barely/lib/hooks/use-typed-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { productSearchParamsSchema } from '@barely/lib/server/routes/product/product.schema';

export interface ProductCtx {
	products: AppRouterOutputs['product']['byWorkspace']['products'];
	productSelection: Selection;
	lastSelectedProductId: string | undefined;
	lastSelectedProduct:
		| AppRouterOutputs['product']['byWorkspace']['products'][0]
		| undefined;
	setProductSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateProductModal: boolean;
	setShowCreateProductModal: (show: boolean) => void;
	showUpdateProductModal: boolean;
	setShowUpdateProductModal: (show: boolean) => void;
	showArchiveProductModal: boolean;
	setShowArchiveProductModal: (show: boolean) => void;
	showDeleteProductModal: boolean;
	setShowDeleteProductModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof productFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
}

const ProductContext = createContext<ProductCtx | undefined>(undefined);

export function ProductContextProvider({
	children,
	initialProducts,
	filters,
	selectedProductIds,
}: {
	children: React.ReactNode;
	initialProducts: Promise<AppRouterOutputs['product']['byWorkspace']>;
	filters: z.infer<typeof productFilterParamsSchema>;
	selectedProductIds: string[];
}) {
	const [showCreateProductModal, setShowCreateProductModal] = useState(false);
	const [showUpdateProductModal, setShowUpdateProductModal] = useState(false);
	const [showArchiveProductModal, setShowArchiveProductModal] = useState(false);
	const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);

	const { handle } = useWorkspace();
	const { data: products } = api.product.byWorkspace.useQuery(
		{ handle, ...filters },
		{
			initialData: use(initialProducts),
		},
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	const { data, setQuery, removeByKey, removeAllQueryParams } = useTypedQuery(
		productSearchParamsSchema,
	);

	/* selection */
	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(selectedProductIds),
	);
	const [, startSelectTransition] = useTransition();

	function setProductSelection(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);

			if (selection === 'all') return;

			if (selection.size === 0) {
				return removeByKey('selectedProductIds');
			}

			return setQuery(
				'selectedProductIds',
				Array.from(selection).map(key => key.toString()),
			);
		});
	}

	/* filters */
	const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters);
	const [pendingFiltersTransition, startFiltersTransition] = useTransition();

	// clear all filters
	function clearAllFilters() {
		startFiltersTransition(() => {
			setOptimisticSelection(new Set());
			removeAllQueryParams();
		});
	}

	// toggle archived
	function toggleArchived() {
		startFiltersTransition(() => {
			if (data.showArchived) {
				setOptimisticFilters({ ...optimisticFilters, showArchived: false });
				removeByKey('showArchived');
				return;
			} else {
				setOptimisticFilters({ ...optimisticFilters, showArchived: true });
				setQuery('showArchived', true);
				return;
			}
		});
	}
	// search
	function setSearch(search: string) {
		startFiltersTransition(() => {
			if (search.length) {
				setOptimisticFilters({ ...optimisticFilters, search });
				setQuery('search', search);
			} else {
				setOptimisticFilters({ ...optimisticFilters, search: '' });
				removeByKey('search');
			}
		});
	}

	const lastSelectedProductId =
		optimisticSelection === 'all'
			? undefined
			: Array.from(optimisticSelection).pop()?.toString();

	const lastSelectedProduct = products.products.find(p => p.id === lastSelectedProductId);

	const contextValue = {
		products: products.products,
		productSelection: optimisticSelection,
		lastSelectedProductId,
		lastSelectedProduct,
		setProductSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showCreateProductModal,
		setShowCreateProductModal,
		showUpdateProductModal,
		setShowUpdateProductModal,
		showArchiveProductModal,
		setShowArchiveProductModal,
		showDeleteProductModal,
		setShowDeleteProductModal,
		// filters
		filters: optimisticFilters,
		pendingFiltersTransition,
		setSearch,
		toggleArchived,
		clearAllFilters,
	} satisfies ProductCtx;

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
