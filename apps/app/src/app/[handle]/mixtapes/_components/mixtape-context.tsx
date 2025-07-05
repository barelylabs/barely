'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { mixtapeSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type MixtapeContext = InfiniteItemsContext<
	AppRouterOutputs['mixtape']['byWorkspace']['mixtapes'][number],
	z.infer<typeof mixtapeSearchParamsSchema>
>;

const MixtapeContext = createContext<MixtapeContext | undefined>(undefined);

export function MixtapeContextProvider({ children }: { children: React.ReactNode }) {
	const trpc = useTRPC();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(mixtapeSearchParamsSchema);

	const { selectedMixtapeIds, ...filters } = data;

	const mixtapeSelection: Selection =
		!selectedMixtapeIds ? new Set()
		: selectedMixtapeIds === 'all' ? 'all'
		: new Set(selectedMixtapeIds);

	const {
		data: infiniteMixtapes,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.mixtape.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const mixtapes = infiniteMixtapes.pages.flatMap(page => page.mixtapes);

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
		if (data.showArchived) return removeByKey('showArchived');
		setQuery('showArchived', true);
	}, [data.showArchived, removeByKey, setQuery]);

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

	const gridListRef = useRef<HTMLDivElement | null>(null);

	const contextValue = {
		items: mixtapes,
		selection: mixtapeSelection,
		lastSelectedItemId: lastSelectedMixtapeId,
		lastSelectedItem: lastSelectedMixtape,
		setSelection: setMixtapeSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showCreateModal,
		setShowCreateModal,
		showUpdateModal: showEditModal,
		setShowUpdateModal: setShowEditModal,
		showArchiveModal,
		setShowArchiveModal,
		showDeleteModal,
		setShowDeleteModal,
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		clearAllFilters,
		toggleArchived,
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
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
