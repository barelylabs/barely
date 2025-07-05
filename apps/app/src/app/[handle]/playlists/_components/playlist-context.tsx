'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { playlistFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { playlistSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type PlaylistContext = InfiniteItemsContext<
	AppRouterOutputs['playlist']['byWorkspace']['playlists'][number],
	z.infer<typeof playlistFilterParamsSchema>
>;

const PlaylistContext = createContext<PlaylistContext | undefined>(undefined);

export function PlaylistContextProvider({ children }: { children: React.ReactNode }) {
	const { handle } = useWorkspace();

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(playlistSearchParamsSchema);

	const { selectedPlaylistIds, ...filters } = data;

	const playlistSelection = useMemo<Selection>(() => {
		if (!selectedPlaylistIds) return new Set();
		if (selectedPlaylistIds === 'all') return 'all';
		return new Set(selectedPlaylistIds);
	}, [selectedPlaylistIds]);

	const trpc = useTRPC();
	const {
		data: infinitePlaylists,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.playlist.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const playlists = infinitePlaylists.pages.flatMap(page => page.playlists);

	const gridListRef = useRef<HTMLDivElement>(null);

	/* setters */
	const setPlaylistSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedPlaylistIds');
			return setQuery(
				'selectedPlaylistIds',
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

	const lastSelectedPlaylistId =
		playlistSelection === 'all' || !playlistSelection.size ?
			undefined
		:	Array.from(playlistSelection).pop()?.toString();

	const lastSelectedPlaylist = playlists.find(
		playlist => playlist.id === lastSelectedPlaylistId,
	);

	const contextValue = {
		items: playlists,
		selection: playlistSelection,
		lastSelectedItemId: lastSelectedPlaylistId,
		lastSelectedItem: lastSelectedPlaylist,
		setSelection: setPlaylistSelection,
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
		// infinite
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} satisfies PlaylistContext;

	return (
		<PlaylistContext.Provider value={contextValue}>{children}</PlaylistContext.Provider>
	);
}

export function usePlaylistContext() {
	const context = useContext(PlaylistContext);
	if (!context) {
		throw new Error('usePlaylist must be used within PlaylistContextProvider');
	}
	return context;
}
