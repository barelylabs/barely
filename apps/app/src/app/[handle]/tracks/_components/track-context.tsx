'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type {
	trackFilterParamsSchema,
	TrackSortBy,
} from '@barely/lib/server/routes/track/track.schema';
import type { SortOrder } from '@barely/utils/filters';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { trackSearchParamsSchema } from '@barely/lib/server/routes/track/track.schema';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

export type TrackContext = InfiniteItemsContext<
	AppRouterOutputs['track']['byWorkspace']['tracks'][number],
	z.infer<typeof trackFilterParamsSchema>
> & {
	groupByAlbum: boolean;
	toggleGroupByAlbum: () => void;
	setSortBy: (sortBy: TrackSortBy) => void;
	setSortOrder: (sortOrder: SortOrder) => void;
};

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
	const [groupByAlbum, setGroupByAlbum] = useState(false);

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

	const setSearch = useCallback(
		(search: string) => {
			if (!search) return removeByKey('search');
			return setQuery('search', search);
		},
		[removeByKey, setQuery],
	);

	const setSortBy = useCallback(
		(sortBy: TrackSortBy) => {
			if (!sortBy) return removeByKey('sortBy');
			return setQuery('sortBy', sortBy);
		},
		[removeByKey, setQuery],
	);

	const setSortOrder = useCallback(
		(sortOrder: SortOrder) => {
			if (!sortOrder) return removeByKey('sortOrder');
			return setQuery('sortOrder', sortOrder);
		},
		[removeByKey, setQuery],
	);

	const toggleArchived = useCallback(() => {
		return setQuery('showArchived', !filters.showArchived);
	}, [filters.showArchived, setQuery]);

	const toggleGroupByAlbum = useCallback(() => {
		setGroupByAlbum(prev => !prev);
	}, []);

	const gridListRef = useRef<HTMLDivElement>(null);

	const focusGridList = useCallback(() => {
		gridListRef.current?.focus();
	}, []);

	const lastSelectedItemId =
		trackSelection === 'all' ? undefined : Array.from(trackSelection).pop()?.toString();

	const lastSelectedItem =
		lastSelectedItemId ?
			tracks.find(track => track.id === lastSelectedItemId)
		:	undefined;

	return (
		<TrackContext.Provider
			value={{
				items: tracks,
				selection: trackSelection,
				lastSelectedItemId,
				lastSelectedItem,
				setSelection: setTrackSelection,
				gridListRef,
				focusGridList,
				showCreateModal,
				setShowCreateModal,
				showUpdateModal,
				setShowUpdateModal,
				showArchiveModal,
				setShowArchiveModal,
				showDeleteModal,
				setShowDeleteModal,
				filters,
				pendingFiltersTransition,
				setSearch,
				toggleArchived,
				clearAllFilters,
				hasNextPage,
				fetchNextPage: () => {
					void fetchNextPage();
				},
				isFetchingNextPage,
				isFetching,
				isRefetching,
				isPending,
				groupByAlbum,
				toggleGroupByAlbum,
				setSortBy,
				setSortOrder,
			}}
		>
			{children}
		</TrackContext.Provider>
	);
}

export function useTrackContext() {
	const context = useContext(TrackContext);
	if (!context) {
		throw new Error('useTrackContext must be used within a TrackContextProvider');
	}
	return context;
}
