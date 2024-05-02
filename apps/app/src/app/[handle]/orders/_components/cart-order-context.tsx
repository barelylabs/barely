'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { cartOrderFilterParamsSchema } from '@barely/lib/server/routes/cart-order/cart-order.schema';
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
	// filters
	filters: z.infer<typeof cartOrderFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
}

const CartOrderContext = createContext<CartOrderContext | undefined>(undefined);

export function CartOrderContextProvider({
	children,
	initialOrders,
	filters,
	selectedOrderCartIds,
}: {
	children: React.ReactNode;
	initialOrders: Promise<AppRouterOutputs['cartOrder']['byWorkspace']>;
	filters: z.infer<typeof cartOrderFilterParamsSchema>;
	selectedOrderCartIds: string[];
}) {
	const [showMarkAsFulfilledModal, setShowMarkAsFulfilledModal] = useState(false);

	const { handle } = useWorkspace();

	const { data: infiniteCartOrders } = api.cartOrder.byWorkspace.useQuery(
		{
			handle,
			...filters,
		},
		{
			initialData: use(initialOrders),
		},
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	const { data, setQuery, removeByKey, removeAllQueryParams } = useTypedQuery(
		cartOrderSearchParamsSchema,
	);

	/* selection */
	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(selectedOrderCartIds),
	);

	const [, startSelectTransition] = useTransition();

	function setCartOrderSelection(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);

			if (selection === 'all') return;

			if (selection.size === 0) {
				return removeByKey('selectedOrderCartIds');
			}

			return setQuery(
				'selectedOrderCartIds',
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
				return setQuery('showArchived', true);
			}
		});
	}

	// search
	function setSearch(search: string) {
		if (search.length) {
			setOptimisticFilters({ ...optimisticFilters, search });
			return setQuery('search', search);
		} else {
			setOptimisticFilters({ ...optimisticFilters, search: '' });
			removeByKey('search');
		}
	}

	const lastSelectedCartOrderId =
		optimisticSelection === 'all' ? undefined : (
			Array.from(optimisticSelection).pop()?.toString()
		);

	const lastSelectedCartOrder = infiniteCartOrders.cartOrders.find(
		order => order.id === lastSelectedCartOrderId,
	);

	const contextValue = {
		cartOrders: infiniteCartOrders.cartOrders,
		cartOrderSelection: optimisticSelection,
		lastSelectedCartOrderId,
		lastSelectedCartOrder,
		setCartOrderSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showMarkAsFulfilledModal,
		setShowMarkAsFulfilledModal,
		filters: optimisticFilters,
		pendingFiltersTransition,
		setSearch,
		toggleArchived,
		clearAllFilters,
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
