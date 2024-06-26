'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type {
	LandingPage,
	landingPageFilterParamsSchema,
} from '@barely/lib/server/routes/landing-page/landing-page.schema';
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
	filters,
	selectedLandingPageIds,
}: {
	children: React.ReactNode;
	initialInfiniteLandingPages: Promise<AppRouterOutputs['landingPage']['byWorkspace']>;
	filters: z.infer<typeof landingPageFilterParamsSchema>;
	selectedLandingPageIds: string[];
}) {
	const [showCreateLandingPageModal, setShowCreateLandingPageModal] = useState(false);
	const [showUpdateLandingPageModal, setShowUpdateLandingPageModal] = useState(false);
	const [showArchiveLandingPageModal, setShowArchiveLandingPageModal] = useState(false);
	const [showDeleteLandingPageModal, setShowDeleteLandingPageModal] = useState(false);

	const { handle } = useWorkspace();

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

	const gridListRef = useRef<HTMLDivElement>(null);

	const { data, setQuery, removeByKey, removeAllQueryParams } = useTypedQuery(
		landingPageSearchParamsSchema,
	);

	/* selection */
	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(selectedLandingPageIds),
	);

	const [, startSelectTransition] = useTransition();

	function setLandingPageSelection(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);

			if (selection === 'all') return;

			if (selection.size === 0) {
				return removeByKey('selectedLandingPageIds');
			}

			return setQuery(
				'selectedLandingPageIds',
				Array.from(selection).map(key => key.toString()),
			);
		});
	}

	/* filters */
	const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters);
	const [pendingFiltersTransition, startFiltersTransition] = useTransition();

	// clear all filters
	function clearAllFilters() {
		startFiltersTransition(() => {
			setOptimisticSelection(new Set());
			removeAllQueryParams();
		});
	}

	// toggle archived
	function toggleArchived() {
		startFiltersTransition(() => {
			if (data.showArchived) {
				setOptimisticFilters({ ...optimisticFilters, showArchived: false });
				removeByKey('showArchived');
				return;
			} else {
				setOptimisticFilters({ ...optimisticFilters, showArchived: true });
				setQuery('showArchived', true);
				return;
			}
		});
	}

	// search
	function setSearch(search: string) {
		startFiltersTransition(() => {
			if (search.length) {
				setOptimisticFilters({ ...optimisticFilters, search });
				setQuery('search', search);
			} else {
				setOptimisticFilters({ ...optimisticFilters, search: undefined });
				removeByKey('search');
			}
		});
	}

	const lastSelectedLandingPageId =
		optimisticSelection === 'all' ? undefined : (
			Array.from(optimisticSelection).pop()?.toString()
		);

	const lastSelectedLandingPage =
		lastSelectedLandingPageId ?
			landingPages.find(landingPage => landingPage.id === lastSelectedLandingPageId)
		:	undefined;

	const contextValue = {
		landingPages,
		landingPageSelection: optimisticSelection,
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
		filters: optimisticFilters,
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
