'use client';

// import type { EdgeRouterOutputs } from '@barely/lib/server/api/router.edge';
import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type {
	CartFunnel,
	cartFunnelFilterParamsSchema,
} from '@barely/lib/server/cart-funnel.schema';
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
import { cartFunnelSearchParamsSchema } from '@barely/lib/server/cart-funnel.schema';

interface CartFunnelContext {
	funnels: AppRouterOutputs['cartFunnel']['byWorkspace']['funnels'];
	funnelSelection: Selection;
	lastSelectedFunnelId: string | undefined;
	lastSelectedFunnel: CartFunnel | undefined;
	setFunnelSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateFunnelModal: boolean;
	setShowCreateFunnelModal: (show: boolean) => void;
	showUpdateFunnelModal: boolean;
	setShowUpdateFunnelModal: (show: boolean) => void;
	showArchiveFunnelModal: boolean;
	setShowArchiveFunnelModal: (show: boolean) => void;
	showDeleteFunnelModal: boolean;
	setShowDeleteFunnelModal: (show: boolean) => void;
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
		funnels: infiniteFunnels.funnels,
		funnelSelection: optimisticSelection,
		lastSelectedFunnelId,
		lastSelectedFunnel,
		setFunnelSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showCreateFunnelModal,
		setShowCreateFunnelModal,
		showUpdateFunnelModal,
		setShowUpdateFunnelModal,
		showArchiveFunnelModal,
		setShowArchiveFunnelModal,
		showDeleteFunnelModal,
		setShowDeleteFunnelModal,
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
