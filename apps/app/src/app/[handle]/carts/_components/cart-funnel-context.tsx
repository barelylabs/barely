'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type {
	CartFunnel,
	cartFunnelFilterParamsSchema,
} from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';
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
import { cartFunnelSearchParamsSchema } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';

interface CartFunnelContext {
	cartFunnels: AppRouterOutputs['cartFunnel']['byWorkspace']['funnels'];
	cartFunnelSelection: Selection;
	lastSelectedCartFunnelId: string | undefined;
	lastSelectedCartFunnel: CartFunnel | undefined;
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
	initialFunnels,
	filters,
	selectedFunnelIds,
}: {
	children: React.ReactNode;
	initialFunnels: Promise<AppRouterOutputs['cartFunnel']['byWorkspace']>;
	filters: z.infer<typeof cartFunnelFilterParamsSchema>;
	selectedFunnelIds: string[];
}) {
	const [showCreateFunnelModal, setShowCreateFunnelModal] = useState(false);
	const [showUpdateFunnelModal, setShowUpdateFunnelModal] = useState(false);
	const [showArchiveFunnelModal, setShowArchiveFunnelModal] = useState(false);
	const [showDeleteFunnelModal, setShowDeleteFunnelModal] = useState(false);

	const { handle } = useWorkspace();
	const { data: infiniteFunnels } = api.cartFunnel.byWorkspace.useQuery(
		{
			handle,
			...filters,
		},
		{
			initialData: use(initialFunnels),
		},
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	const { data, setQuery, removeByKey, removeAllQueryParams } = useTypedQuery(
		cartFunnelSearchParamsSchema,
	);

	/* selection */
	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(selectedFunnelIds),
	);
	const [, startSelectTransition] = useTransition();

	function setFunnelSelection(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);

			if (selection === 'all') return;

			if (selection.size === 0) {
				return removeByKey('selectedFunnelIds');
			}

			return setQuery(
				'selectedFunnelIds',
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

	const lastSelectedFunnelId =
		optimisticSelection === 'all'
			? undefined
			: Array.from(optimisticSelection).pop()?.toString();

	const lastSelectedFunnel = infiniteFunnels.funnels.find(
		f => f.id === lastSelectedFunnelId,
	);

	const contextValue = {
		cartFunnels: infiniteFunnels.funnels,
		cartFunnelSelection: optimisticSelection,
		lastSelectedCartFunnelId: lastSelectedFunnelId,
		lastSelectedCartFunnel: lastSelectedFunnel,
		setCartFunnelSelection: setFunnelSelection,
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
		filters: optimisticFilters,
		pendingFiltersTransition,
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
