'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { trackFilterParamsSchema } from '@barely/lib/server/routes/track/track.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { trackSearchParamsSchema } from '@barely/lib/server/routes/track/track.schema';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

export type TrackContext = InfiniteItemsContext<
	AppRouterOutputs['track']['byWorkspace']['tracks'][number],
	z.infer<typeof trackFilterParamsSchema>
>;

const TrackContext = createContext<TrackContext | undefined>(undefined);

export function TrackContextProvider({
	children,
	initialInfiniteTracks,
}: {
	children: React.ReactNode;
	initialInfiniteTracks: Promise<AppRouterOutputs['track']['byWorkspace']>;
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
	} = useTypedOptimisticQuery(trackSearchParamsSchema);

	const { selectedTrackIds, ...filters } = data;

	const trackSelection: Selection =
		!selectedTrackIds ? new Set()
		: selectedTrackIds === 'all' ? 'all'
		: new Set(selectedTrackIds);

	const initialData = use(initialInfiniteTracks);

	const {
		data: infiniteTracks,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = api.track.byWorkspace.useInfiniteQuery(
		{
			handle,
			...filters,
		},
		{
			initialData: () => {
				return {
					pages: [
						{
							tracks: initialData.tracks,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [],
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const tracks = infiniteTracks?.pages.flatMap(page => page.tracks) ?? [];

	const setTrackSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedTrackIds');
			return setQuery(
				'selectedTrackIds',
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
		return setQuery('showArchived', true);
	}, [filters.showArchived, removeByKey, setQuery]);

	const setSearch = useCallback(
		(search: string) => {
			if (search.length) return setQuery('search', search);
			return removeByKey('search');
		},
		[removeByKey, setQuery],
	);

	const lastSelectedTrackId =
		!trackSelection || trackSelection === 'all' ?
			undefined
		:	Array.from(trackSelection).pop()?.toString();

	const lastSelectedTrack = tracks.find(track => track.id === lastSelectedTrackId);

	const gridListRef = useRef<HTMLDivElement>(null);

	const contextValue = {
		items: tracks,
		selection: trackSelection,
		lastSelectedItemId: lastSelectedTrackId,
		lastSelectedItem: lastSelectedTrack,
		setSelection: setTrackSelection,
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
	} satisfies TrackContext;

	return <TrackContext.Provider value={contextValue}>{children}</TrackContext.Provider>;
}

export function useTrackContext() {
	const context = useContext(TrackContext);
	if (!context) {
		throw new Error('useTrackContext must be used within a TrackContextProvider');
	}
	return context;
}
