'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { trackFilterParamsSchema } from '@barely/lib/server/routes/track/track.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { trackSearchParamsSchema } from '@barely/lib/server/routes/track/track.schema';
import { wait } from '@barely/lib/utils/wait';

interface TrackContext {
	tracks: AppRouterOutputs['track']['byWorkspace']['tracks'];
	trackSelection: Selection;
	lastSelectedTrackId: string | undefined;
	lastSelectedTrack: AppRouterOutputs['track']['byWorkspace']['tracks'][0] | undefined;
	setTrackSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	// modals
	showCreateTrackModal: boolean;
	setShowCreateTrackModal: (show: boolean) => void;
	showEditTrackModal: boolean;
	setShowEditTrackModal: (show: boolean) => void;
	showArchiveTrackModal: boolean;
	setShowArchiveTrackModal: (show: boolean) => void;
	showDeleteTrackModal: boolean;
	setShowDeleteTrackModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof trackFilterParamsSchema>;
	pendingFilters: boolean;
	setSearch: (search: string) => void;
	toggleArchived: (archived: boolean) => void;
	clearAllFilters: () => void;
}

const TrackContext = createContext<TrackContext | undefined>(undefined);

export function TrackContextProvider({
	children,
	initialInfiniteTracks,
	// filters,
}: {
	children: React.ReactNode;
	initialInfiniteTracks: Promise<AppRouterOutputs['track']['byWorkspace']>;
	// filters: z.infer<typeof trackFilterParamsSchema>;
}) {
	const [showCreateTrackModal, setShowCreateTrackModal] = useState(false);
	const [showEditTrackModal, setShowEditTrackModal] = useState(false);
	const [showArchiveTrackModal, setShowArchiveTrackModal] = useState(false);
	const [showDeleteTrackModal, setShowDeleteTrackModal] = useState(false);

	const { handle } = useWorkspace();

	const {
		data,
		setQuery,
		removeByKey,
		removeAllQueryParams,
		pending: pendingFilters,
	} = useTypedOptimisticQuery(trackSearchParamsSchema);

	const { selectedTrackIds, ...filters } = data;

	const trackSelection: Selection =
		!selectedTrackIds ? new Set()
		: selectedTrackIds === 'all' ? 'all'
		: new Set(selectedTrackIds);

	const initialData = use(initialInfiniteTracks);

	const { data: infiniteTracks } = api.track.byWorkspace.useInfiniteQuery(
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
					pageParams: [], // fixme: add page params
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

	const toggleArchived = useCallback(
		(archived: boolean) => {
			if (filters.showArchived) return removeByKey('showArchived');
			return setQuery('showArchived', archived);
		},
		[filters.showArchived, removeByKey, setQuery],
	);

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
		tracks,
		trackSelection,
		lastSelectedTrackId,
		lastSelectedTrack,
		setTrackSelection,
		gridListRef,
		focusGridList: () => {
			wait(1)
				.then(() => gridListRef.current?.focus())
				.catch(err => console.error(err));
		}, // fixme: this is a workaround for focus not working on modal closing
		showCreateTrackModal,
		setShowCreateTrackModal,
		showEditTrackModal,
		setShowEditTrackModal,
		showArchiveTrackModal,
		setShowArchiveTrackModal,
		showDeleteTrackModal,
		setShowDeleteTrackModal,
		// filters
		filters,
		pendingFilters,
		setSearch,
		toggleArchived,
		clearAllFilters,
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
