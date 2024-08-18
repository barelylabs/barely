'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { mixtapeSearchParamsSchema } from '@barely/lib/server/routes/mixtape/mixtape.schema';
import { wait } from '@barely/lib/utils/wait';

interface MixtapeContext {
	// infiniteMixtapes: AppRouterOutputs['mixtape']['byWorkspace'];
	mixtapes: AppRouterOutputs['mixtape']['byWorkspace']['mixtapes'];
	mixtapeSelection: Selection;
	lastSelectedMixtapeId: string | undefined;
	lastSelectedMixtape:
		| AppRouterOutputs['mixtape']['byWorkspace']['mixtapes'][number]
		| undefined;
	setMixtapeSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateMixtapeModal: boolean;
	setShowCreateMixtapeModal: (show: boolean) => void;
	showUpdateMixtapeModal: boolean;
	setShowUpdateMixtapeModal: (show: boolean) => void;
	showArchiveMixtapeModal: boolean;
	setShowArchiveMixtapeModal: (show: boolean) => void;
	showDeleteMixtapeModal: boolean;
	setShowDeleteMixtapeModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof mixtapeSearchParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	clearAllFilters: () => void;
	toggleArchived: () => void;
}

const MixtapeContext = createContext<MixtapeContext | undefined>(undefined);

export function MixtapeContextProvider({
	children,
	initialInfiniteMixtapes,
}: {
	children: React.ReactNode;
	initialInfiniteMixtapes: Promise<AppRouterOutputs['mixtape']['byWorkspace']>;
}) {
	const [showCreateMixtapeModal, setShowCreateMixtapeModal] = useState(false);
	const [showEditMixtapeModal, setShowEditMixtapeModal] = useState(false);
	const [showArchiveMixtapeModal, setShowArchiveMixtapeModal] = useState(false);
	const [showDeleteMixtapeModal, setShowDeleteMixtapeModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(mixtapeSearchParamsSchema);

	const { selectedMixtapeIds, ...filters } = data;

	const mixtapeSelection: Selection =
		!selectedMixtapeIds ? new Set()
		: selectedMixtapeIds === 'all' ? 'all'
		: new Set(selectedMixtapeIds);

	const initialData = use(initialInfiniteMixtapes);

	const { data: infiniteMixtapes } = api.mixtape.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [
						{
							mixtapes: initialData.mixtapes,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [],
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const mixtapes = infiniteMixtapes?.pages.flatMap(page => page.mixtapes) ?? [];

	// setters
	const setMixtapeSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedMixtapeIds');
			setQuery(
				'selectedMixtapeIds',
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
		setQuery('showArchived', true);
	}, [filters.showArchived, removeByKey, setQuery]);

	const setSearch = useCallback(
		(search: string) => {
			setQuery('search', search);
		},
		[setQuery],
	);

	const lastSelectedMixtapeId =
		mixtapeSelection === 'all' ? undefined : (
			Array.from(mixtapeSelection).pop()?.toString()
		);
	const lastSelectedMixtape = mixtapes.find(
		mixtape => mixtape.id === lastSelectedMixtapeId,
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	const contextValue = {
		// infiniteMixtapes: infiniteMixtapes ?? {
		//     pages: [],
		//     pageParams: [],
		// },
		mixtapes,
		mixtapeSelection,
		lastSelectedMixtapeId,
		lastSelectedMixtape,
		setMixtapeSelection,
		gridListRef,
		focusGridList: () => {
			wait(1)
				.then(() => gridListRef.current?.focus())
				.catch(console.error);
		}, // fixme: this is a workaround for focus not working on modal closing
		showCreateMixtapeModal,
		setShowCreateMixtapeModal,
		showUpdateMixtapeModal: showEditMixtapeModal,
		setShowUpdateMixtapeModal: setShowEditMixtapeModal,
		showArchiveMixtapeModal,
		setShowArchiveMixtapeModal,
		showDeleteMixtapeModal,
		setShowDeleteMixtapeModal,
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		clearAllFilters,
		toggleArchived,
	} satisfies MixtapeContext;

	return (
		<MixtapeContext.Provider value={contextValue}>{children}</MixtapeContext.Provider>
	);
}

export function useMixtapesContext() {
	const context = useContext(MixtapeContext);
	if (!context) {
		throw new Error('useMixtapesContext must be used within a MixtapesContext');
	}
	return context;
}
