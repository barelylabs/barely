'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { fanGroupFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { fanGroupSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type FanGroupContext = InfiniteItemsContext<
	AppRouterOutputs['fanGroup']['byWorkspace']['fanGroups'][number],
	z.infer<typeof fanGroupFilterParamsSchema>
>;

const FanGroupContext = createContext<FanGroupContext | undefined>(undefined);

export function FanGroupContextProvider({ children }: { children: React.ReactNode }) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(fanGroupSearchParamsSchema);

	const { selectedFanGroupIds, ...filters } = data;

	const fanGroupSelection: Selection =
		!selectedFanGroupIds ? new Set()
		: selectedFanGroupIds === 'all' ? 'all'
		: new Set(selectedFanGroupIds);

	const {
		data: infiniteFanGroups,
		hasNextPage,
		fetchNextPage,
		isPending,
		isFetching,
		isRefetching,
	} = useSuspenseInfiniteQuery({
		...trpc.fanGroup.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const fanGroups = infiniteFanGroups.pages.flatMap(page => page.fanGroups);

	const gridListRef = useRef<HTMLDivElement | null>(null);

	/* setters */
	const setFanGroupSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedFanGroupIds');
			return setQuery(
				'selectedFanGroupIds',
				Array.from(selection).map(key => key.toString()),
			);
		},
		[setQuery, removeByKey],
	);

	const clearAllFilters = useCallback(() => {
		removeAllQueryParams();
	}, [removeAllQueryParams]);

	const toggleArchived = useCallback(() => {
		if (data.showArchived) return removeByKey('showArchived');
		return setQuery('showArchived', true);
	}, [data.showArchived, setQuery, removeByKey]);

	const setSearch = useCallback(
		(search: string) => {
			setQuery('search', search);
		},
		[setQuery],
	);

	const lastSelectedFanGroupId =
		fanGroupSelection === 'all' || !fanGroupSelection.size ?
			undefined
		:	Array.from(fanGroupSelection).pop()?.toString();

	const lastSelectedFanGroup = fanGroups.find(
		fanGroup => fanGroup.id === lastSelectedFanGroupId,
	);

	const contextValue = {
		items: fanGroups,
		selection: fanGroupSelection,
		lastSelectedItemId: lastSelectedFanGroupId,
		lastSelectedItem: lastSelectedFanGroup,
		setSelection: setFanGroupSelection,
		gridListRef,
		focusGridList: () => {
			gridListRef.current?.focus();
		},
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
		pendingFiltersTransition: pending,
		setSearch,
		toggleArchived,
		clearAllFilters,
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage: isFetching,
		isRefetching,
		isPending,
		isFetching,
	} satisfies FanGroupContext;

	return (
		<FanGroupContext.Provider value={contextValue}>{children}</FanGroupContext.Provider>
	);
}

export function useFanGroupContext() {
	const context = useContext(FanGroupContext);
	if (!context) {
		throw new Error('useFanGroupContext must be used within a FanGroupContextProvider');
	}
	return context;
}
