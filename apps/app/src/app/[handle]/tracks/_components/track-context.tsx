'use client';

import type { EdgeRouterOutputs } from '@barely/lib/server/api/router.edge';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import {
	createContext,
	use,
	useContext,
	useOptimistic,
	useRef,
	useState,
	useTransition,
} from 'react';
import { useTypedQuery } from '@barely/lib/hooks/use-typed-query';
import { api } from '@barely/lib/server/api/react';
import { trackFilterParamsSchema } from '@barely/lib/server/track.schema';
import { wait } from '@barely/lib/utils/wait';

interface TrackContext {
	tracks: EdgeRouterOutputs['track']['byWorkspace'];
	trackSelection: Selection;
	lastSelectedTrackId: string | undefined;
	lastSelectedTrack: EdgeRouterOutputs['track']['byWorkspace'][0] | undefined;
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
}

const TrackContext = createContext<TrackContext | undefined>(undefined);

export function TrackContextProvider({
	children,
	initialTracks,
	filters,
}: {
	children: React.ReactNode;
	initialTracks: Promise<EdgeRouterOutputs['track']['byWorkspace']>;
	filters: z.infer<typeof trackFilterParamsSchema>;
}) {
	const [showCreateTrackModal, setShowCreateTrackModal] = useState(false);
	const [showEditTrackModal, setShowEditTrackModal] = useState(false);
	const [showArchiveTrackModal, setShowArchiveTrackModal] = useState(false);
	const [showDeleteTrackModal, setShowDeleteTrackModal] = useState(false);

	// const { selectedTrackIds, ...restFilters } = filters;

	const { data: tracks } = api.track.byWorkspace.useQuery(filters, {
		initialData: use(initialTracks),
	});

	const gridListRef = useRef<HTMLDivElement>(null);

	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(filters.selectedTrackIds),
	);

	const { setQuery, removeByKey } = useTypedQuery(trackFilterParamsSchema);
	const [, startSelectTransition] = useTransition();

	function setSelectedKeys(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);
			if (selection === 'all') {
				return;
			}
			if (selection.size === 0) {
				removeByKey('selectedTrackIds');
			} else {
				setQuery(
					'selectedTrackIds',
					Array.from(selection).map(key => key.toString()),
				);
			}
		});
	}

	const lastSelectedTrackId =
		optimisticSelection === 'all'
			? undefined
			: Array.from(optimisticSelection)[0]?.toString();
	const lastSelectedTrack = lastSelectedTrackId
		? tracks.find(track => track.id === lastSelectedTrackId)
		: undefined;

	const contextValue = {
		tracks,
		trackSelection: optimisticSelection,
		lastSelectedTrackId,
		lastSelectedTrack,
		setTrackSelection: setSelectedKeys,
		gridListRef,
		// focusGridList: () => {
		//   gridListRef.current?.focus();
		// },
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
