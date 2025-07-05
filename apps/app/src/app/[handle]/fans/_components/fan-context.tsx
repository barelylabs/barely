'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { fanFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { fanSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type FanContext = InfiniteItemsContext<
	AppRouterOutputs['fan']['byWorkspace']['fans'][number],
	z.infer<typeof fanFilterParamsSchema>
>;

const FanContext = createContext<FanContext | undefined>(undefined);

export function FanContextProvider({ children }: { children: React.ReactNode }) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(fanSearchParamsSchema);

	const { selectedFanIds, ...filters } = data;

	const fanSelection: Selection =
		!selectedFanIds ? new Set()
		: selectedFanIds === 'all' ? 'all'
		: new Set(selectedFanIds);

	const {
		data: infiniteFans,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.fan.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const fans = infiniteFans.pages.flatMap(page => page.fans);

	const gridListRef = useRef<HTMLDivElement | null>(null);

	const setFanSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedFanIds');
			return setQuery(
				'selectedFanIds',
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
			if (search.length) return setQuery('search', search);
			return removeByKey('search');
		},
		[setQuery, removeByKey],
	);

	const lastSelectedFanId =
		fanSelection === 'all' || !fanSelection.size ?
			undefined
		:	Array.from(fanSelection).pop()?.toString();

	const lastSelectedFan = fans.find(fan => fan.id === lastSelectedFanId);

	const contextValue = {
		items: fans,
		selection: fanSelection,
		lastSelectedItemId: lastSelectedFanId,
		lastSelectedItem: lastSelectedFan,
		setSelection: setFanSelection,
		gridListRef,
		focusGridList: () => {
			gridListRef.current?.focus();
		},
		showCreateModal,
		setShowCreateModal,
		showUpdateModal,
		setShowUpdateModal,
		showDeleteModal,
		setShowDeleteModal,
		showArchiveModal,
		setShowArchiveModal,
		// filters
		filters,
		pendingFiltersTransition: pending,
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
	} satisfies FanContext;

	return <FanContext.Provider value={contextValue}>{children}</FanContext.Provider>;
}

export function useFanContext() {
	const context = useContext(FanContext);
	if (!context) {
		throw new Error('useFan must be used within a FanContextProvider');
	}
	return context;
}
