'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { fmFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { fmSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type FmContext = InfiniteItemsContext<
	AppRouterOutputs['fm']['byWorkspace']['fmPages'][number],
	z.infer<typeof fmFilterParamsSchema>
>;

const FmContext = createContext<FmContext | undefined>(undefined);

export function FmContextProvider({ children }: { children: React.ReactNode }) {
	const { handle } = useWorkspace();

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(fmSearchParamsSchema);

	const { selectedFmPageIds, ...filters } = data;

	const fmPageSelection = useMemo<Selection>(() => {
		if (!selectedFmPageIds) return new Set();
		if (selectedFmPageIds === 'all') return 'all';
		return new Set(selectedFmPageIds);
	}, [selectedFmPageIds]);

	const trpc = useTRPC();
	const {
		data: infiniteFmPages,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.fm.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const fmPages = infiniteFmPages.pages.flatMap(page => page.fmPages);

	const gridListRef = useRef<HTMLDivElement>(null);

	/* setters */
	const setFmPageSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedFmPageIds');
			return setQuery(
				'selectedFmPageIds',
				Array.from(selection).map(key => key.toString()),
			);
		},
		[setQuery, removeByKey],
	);

	// const addFmPageToSelection = useCallback(
	// 	(fmPageId: string) => {
	// 		if (fmPageSelection === 'all') return;
	// 		if (fmPageSelection.has(fmPageId)) return;
	// 		setFmPageSelection(new Set([...fmPageSelection, fmPageId]));
	// 	},
	// 	[fmPageSelection, setFmPageSelection],
	// );

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

	const lastSelectedFmPageId =
		fmPageSelection === 'all' || !fmPageSelection.size ?
			undefined
		:	Array.from(fmPageSelection).pop()?.toString();

	const lastSelectedFmPage = fmPages.find(fmPage => fmPage.id === lastSelectedFmPageId);

	const contextValue = {
		items: fmPages,
		selection: fmPageSelection,
		lastSelectedItemId: lastSelectedFmPageId,
		lastSelectedItem: lastSelectedFmPage,
		setSelection: setFmPageSelection,
		// addItemToSelection: addFmPageToSelection,
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
	} satisfies FmContext;

	return <FmContext.Provider value={contextValue}>{children}</FmContext.Provider>;
}

export function useFmContext() {
	const context = useContext(FmContext);
	if (!context) {
		throw new Error('useFm must be used within a FmContextProvider');
	}
	return context;
}
