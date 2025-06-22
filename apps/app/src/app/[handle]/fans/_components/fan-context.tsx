'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { fanFilterParamsSchema } from '@barely/lib/server/routes/fan/fan.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { fanSearchParamsSchema } from '@barely/lib/server/routes/fan/fan.schema';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type FanContext = InfiniteItemsContext<
	AppRouterOutputs['fan']['byWorkspace']['fans'][number],
	z.infer<typeof fanFilterParamsSchema>
>;

const FanContext = createContext<FanContext | undefined>(undefined);

export function FanContextProvider({
	children,
	initialFansFirstPage,
}: {
	children: React.ReactNode;
	initialFansFirstPage: Promise<AppRouterOutputs['fan']['byWorkspace']>;
}) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(fanSearchParamsSchema);

	const { selectedFanIds, ...filters } = data;

	const fanSelection: Selection =
		!selectedFanIds ? new Set()
		: selectedFanIds === 'all' ? 'all'
		: new Set(selectedFanIds);

	const initialData = use(initialFansFirstPage);
	const {
		data: infiniteFans,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = api.fan.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [{ fans: initialData.fans, nextCursor: initialData.nextCursor }],
					pageParams: [],
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const fans = infiniteFans?.pages.flatMap(page => page.fans) ?? [];

	const gridListRef = useRef<HTMLDivElement>(null);

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
		fanSelection === 'all' || !fanSelection ?
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
