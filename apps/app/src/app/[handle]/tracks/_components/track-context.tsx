'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { trackFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { trackSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

export type TrackContext = InfiniteItemsContext<
	AppRouterOutputs['track']['byWorkspace']['tracks'][number],
	z.infer<typeof trackFilterParamsSchema>
>;

const TrackContext = createContext<TrackContext | undefined>(undefined);

export function TrackContextProvider({ children }: { children: React.ReactNode }) {
	const trpc = useTRPC();
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

	const {
		data: infiniteTracks,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.track.byWorkspace.infiniteQueryOptions(
			{
				handle,
				...filters,
			},
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const tracks = infiniteTracks.pages.flatMap(page => page.tracks);

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
		trackSelection === 'all' || !trackSelection.size ?
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
