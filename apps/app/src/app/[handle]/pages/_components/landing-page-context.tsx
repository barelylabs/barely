'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type {
	LandingPage,
	landingPageFilterParamsSchema,
} from '@barely/lib/server/routes/landing-page/landing-page.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { landingPageSearchParamsSchema } from '@barely/lib/server/routes/landing-page/landing-page.schema';

interface LandingPageContext {
	landingPages: AppRouterOutputs['landingPage']['byWorkspace']['landingPages'];
	landingPageSelection: Selection;
	lastSelectedLandingPageId: string | undefined;
	lastSelectedLandingPage: LandingPage | undefined;
	setLandingPageSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateLandingPageModal: boolean;
	setShowCreateLandingPageModal: (show: boolean) => void;
	showUpdateLandingPageModal: boolean;
	setShowUpdateLandingPageModal: (show: boolean) => void;
	showArchiveLandingPageModal: boolean;
	setShowArchiveLandingPageModal: (show: boolean) => void;
	showDeleteLandingPageModal: boolean;
	setShowDeleteLandingPageModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof landingPageFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
}

const LandingPageContext = createContext<LandingPageContext | undefined>(undefined);

export function LandingPageContextProvider({
	children,
	initialInfiniteLandingPages,
}: {
	children: React.ReactNode;
	initialInfiniteLandingPages: Promise<AppRouterOutputs['landingPage']['byWorkspace']>;
}) {
	const [showCreateLandingPageModal, setShowCreateLandingPageModal] = useState(false);
	const [showUpdateLandingPageModal, setShowUpdateLandingPageModal] = useState(false);
	const [showArchiveLandingPageModal, setShowArchiveLandingPageModal] = useState(false);
	const [showDeleteLandingPageModal, setShowDeleteLandingPageModal] = useState(false);

	const { handle } = useWorkspace();

	const {
		data,
		setQuery,
		removeByKey,
		removeAllQueryParams,
		pending: pendingFiltersTransition,
	} = useTypedOptimisticQuery(landingPageSearchParamsSchema);

	const { selectedLandingPageIds, ...filters } = data;

	const landingPageSelection: Selection =
		!selectedLandingPageIds ? new Set()
		: selectedLandingPageIds === 'all' ? 'all'
		: new Set(selectedLandingPageIds);

	const initialData = use(initialInfiniteLandingPages);

	const { data: infiniteLandingPages } = api.landingPage.byWorkspace.useInfiniteQuery(
		{
			handle,
			...filters,
		},
		{
			staleTime: Infinity,
			initialData: () => {
				return {
					pages: [
						{
							landingPages: initialData.landingPages,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [], //todo - figure out how to structure this
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const landingPages =
		infiniteLandingPages?.pages.flatMap(page => page.landingPages) ?? [];

	// setters
	const setLandingPageSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedLandingPageIds');
			return setQuery(
				'selectedLandingPageIds',
				Array.from(selection).map(key => key.toString()),
			);
		},
		[setQuery, removeByKey],
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

	const lastSelectedLandingPageId =
		landingPageSelection === 'all' || !landingPageSelection ?
			undefined
		:	Array.from(landingPageSelection).pop()?.toString();
	const lastSelectedLandingPage = landingPages.find(
		landingPage => landingPage.id === lastSelectedLandingPageId,
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	const contextValue = {
		landingPages,
		landingPageSelection,
		lastSelectedLandingPageId,
		lastSelectedLandingPage,
		setLandingPageSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showCreateLandingPageModal,
		setShowCreateLandingPageModal,
		showUpdateLandingPageModal,
		setShowUpdateLandingPageModal,
		showArchiveLandingPageModal,
		setShowArchiveLandingPageModal,
		showDeleteLandingPageModal,
		setShowDeleteLandingPageModal,
		// filters
		filters,
		pendingFiltersTransition,
		setSearch,
		toggleArchived,
		clearAllFilters,
	} satisfies LandingPageContext;

	return (
		<LandingPageContext.Provider value={contextValue}>
			{children}
		</LandingPageContext.Provider>
	);
}

export function useLandingPageContext() {
	const context = useContext(LandingPageContext);
	if (!context)
		throw new Error(
			'useLandingPageContext must be used within a LandingPageContextProvider',
		);
	return context;
}
