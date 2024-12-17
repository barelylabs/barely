'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { mixtapeSearchParamsSchema } from '@barely/lib/server/routes/mixtape/mixtape.schema';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type MixtapeContext = InfiniteItemsContext<
	AppRouterOutputs['mixtape']['byWorkspace']['mixtapes'][number],
	z.infer<typeof mixtapeSearchParamsSchema>
>;

const MixtapeContext = createContext<MixtapeContext | undefined>(undefined);

export function MixtapeContextProvider({
	children,
	initialInfiniteMixtapes,
}: {
	children: React.ReactNode;
	initialInfiniteMixtapes: Promise<AppRouterOutputs['mixtape']['byWorkspace']>;
}) {
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

	const initialData = use(initialInfiniteMixtapes);

	const {
		data: infiniteMixtapes,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = api.mixtape.byWorkspace.useInfiniteQuery(
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
