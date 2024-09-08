'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { fmFilterParamsSchema } from '@barely/lib/server/routes/fm/fm.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { fmSearchParamsSchema } from '@barely/lib/server/routes/fm/fm.schema';

interface FmContext {
	fmPages: AppRouterOutputs['fm']['byWorkspace']['fmPages'];
	fmPageSelection: Selection;
	lastSelectedFmPageId: string | undefined;
	lastSelectedFmPage:
		| AppRouterOutputs['fm']['byWorkspace']['fmPages'][number]
		| undefined;
	setFmPageSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateFmPageModal: boolean;
	setShowCreateFmPageModal: (show: boolean) => void;
	showUpdateFmPageModal: boolean;
	setShowUpdateFmPageModal: (show: boolean) => void;
	showArchiveFmPageModal: boolean;
	setShowArchiveFmPageModal: (show: boolean) => void;
	showDeleteFmPageModal: boolean;
	setShowDeleteFmPageModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof fmFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
}

const FmContext = createContext<FmContext | undefined>(undefined);

export function FmContextProvider({
	children,
	initialFmPages,
}: {
	children: React.ReactNode;
	initialFmPages: Promise<AppRouterOutputs['fm']['byWorkspace']>;
}) {
	const [showCreateFmPageModal, setShowCreateFmPageModal] = useState(false);
	const [showUpdateFmPageModal, setShowUpdateFmPageModal] = useState(false);
	const [showArchiveFmPageModal, setShowArchiveFmPageModal] = useState(false);
	const [showDeleteFmPageModal, setShowDeleteFmPageModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(fmSearchParamsSchema);

	const { selectedFmPageIds, ...filters } = data;

	const fmPageSelection: Selection =
		!selectedFmPageIds ? new Set()
		: selectedFmPageIds === 'all' ? 'all'
		: new Set(selectedFmPageIds);

	const initialData = use(initialFmPages);
	const { data: infiniteFmPages } = api.fm.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [{ fmPages: initialData.fmPages, nextCursor: initialData.nextCursor }],
					pageParams: [], // todo - figure out how to structure this
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const fmPages = infiniteFmPages?.pages.flatMap(page => page.fmPages) ?? [];

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
		fmPageSelection === 'all' || !fmPageSelection ?
			undefined
		:	Array.from(fmPageSelection).pop()?.toString();

	const lastSelectedFmPage = fmPages.find(fmPage => fmPage.id === lastSelectedFmPageId);

	const contextValue = {
		fmPages,
		fmPageSelection,
		lastSelectedFmPageId,
		lastSelectedFmPage,
		setFmPageSelection,
		gridListRef,
		focusGridList: () => {
			gridListRef.current?.focus();
		},
		showCreateFmPageModal,
		setShowCreateFmPageModal,
		showUpdateFmPageModal,
		setShowUpdateFmPageModal,
		showArchiveFmPageModal,
		setShowArchiveFmPageModal,
		showDeleteFmPageModal,
		setShowDeleteFmPageModal,
		// filters
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		toggleArchived,
		clearAllFilters,
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
