'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { fmFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { fmSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type FlowContext = InfiniteItemsContext<
	AppRouterOutputs['flow']['byWorkspace']['flows'][0],
	z.infer<typeof fmFilterParamsSchema>
>;

const FlowContext = createContext<FlowContext | undefined>(undefined);

export function FlowContextProvider({ children }: { children: React.ReactNode }) {
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(fmSearchParamsSchema);

	const { selectedFmPageIds, ...filters } = data;

	const flowSelection: Selection =
		!selectedFmPageIds ? new Set()
		: selectedFmPageIds === 'all' ? 'all'
		: new Set(selectedFmPageIds);

	const {
		data: infiniteFlows,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.flow.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const flows = infiniteFlows.pages.flatMap(page => page.flows);

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
		flowSelection === 'all' || !flowSelection.size ?
			undefined
		:	Array.from(flowSelection).pop()?.toString();

	const gridListRef = useRef<HTMLDivElement | null>(null);

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
