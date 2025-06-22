'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { fmFilterParamsSchema } from '@barely/lib/server/routes/fm/fm.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { fmSearchParamsSchema } from '@barely/lib/server/routes/fm/fm.schema';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type FlowContext = InfiniteItemsContext<
	AppRouterOutputs['flow']['byWorkspace']['flows'][0],
	z.infer<typeof fmFilterParamsSchema>
>;

const FlowContext = createContext<FlowContext | undefined>(undefined);

export function FlowContextProvider({
	children,
	initialFlows,
}: {
	children: React.ReactNode;
	initialFlows: Promise<AppRouterOutputs['flow']['byWorkspace']>;
}) {
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(fmSearchParamsSchema);

	const { selectedFmPageIds, ...filters } = data;

	const flowSelection: Selection =
		!selectedFmPageIds ? new Set()
		: selectedFmPageIds === 'all' ? 'all'
		: new Set(selectedFmPageIds);

	const initialData = use(initialFlows);
	const {
		data: infiniteFlows,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = api.flow.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [{ flows: initialData.flows, nextCursor: initialData.nextCursor }],
					pageParams: [], // todo - figure out how to structure this
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const flows = infiniteFlows?.pages.flatMap(page => page.flows) ?? [];

	// const gridListRef = useRef<HTMLDivElement>(null);

	const setFlowSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedFmPageIds');

			return setQuery(
				'selectedFmPageIds',
				Array.from(selection).map(key => key.toString()),
			);
		},
		[removeByKey, setQuery],
	);

	const clearAllFilters = useCallback(() => {
		removeAllQueryParams();
	}, [removeAllQueryParams]);

	const toggleArchived = useCallback(() => {
		if (filters.showArchived) removeByKey('showArchived');
		return setQuery('showArchived', true);
	}, [filters.showArchived, removeByKey, setQuery]);

	const setSearch = useCallback(
		(search: string) => {
			if (search.length) return setQuery('search', search);

			return removeByKey('search');
		},
		[removeByKey, setQuery],
	);

	const lastSelectedFlowId =
		flowSelection === 'all' || !flowSelection ?
			undefined
		:	Array.from(flowSelection).pop()?.toString();

	const gridListRef = useRef<HTMLDivElement>(null);

	const contextValue = {
		items: flows,
		selection: flowSelection,
		lastSelectedItemId: lastSelectedFlowId,
		lastSelectedItem: flows.find(flow => flow.id === lastSelectedFlowId),
		setSelection: setFlowSelection,
		showCreateModal: false,
		setShowCreateModal: () => void {},
		showUpdateModal: false,
		setShowUpdateModal: () => void {},
		showArchiveModal,
		setShowArchiveModal,
		showDeleteModal,
		setShowDeleteModal,
		// infinite
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
		// filters
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		toggleArchived,
		clearAllFilters,
		gridListRef,
		focusGridList: () => {
			gridListRef.current?.focus();
		},
	} satisfies FlowContext;

	return <FlowContext.Provider value={contextValue}>{children}</FlowContext.Provider>;
}

export function useFlowContext() {
	const context = useContext(FlowContext);

	if (!context) {
		throw new Error('useFlowContext must be used within a FlowContextProvider');
	}

	return context;
}
