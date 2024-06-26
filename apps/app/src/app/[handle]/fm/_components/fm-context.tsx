'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { fmFilterParamsSchema } from '@barely/lib/server/routes/fm/fm.schema';
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
import { fmSearchParamsSchema } from '@barely/lib/server/routes/fm/fm.schema';

interface FmContext {
	fmPages: AppRouterOutputs['fm']['byWorkspace']['fmPages'];
	// infinite
	// hasMoreFmPages: boolean;
	// fetchMoreFmPages: () => void;
	// selection
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
	filters = {},
	selectedFmPageIds = [],
}: {
	children: React.ReactNode;
	initialFmPages: Promise<AppRouterOutputs['fm']['byWorkspace']>;
	filters: z.infer<typeof fmFilterParamsSchema> | undefined;
	selectedFmPageIds: string[];
}) {
	const [showCreateFmPageModal, setShowCreateFmPageModal] = useState(false);
	const [showUpdateFmPageModal, setShowUpdateFmPageModal] = useState(false);
	const [showArchiveFmPageModal, setShowArchiveFmPageModal] = useState(false);
	const [showDeleteFmPageModal, setShowDeleteFmPageModal] = useState(false);

	const { handle } = useWorkspace();

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

	const { data, setQuery, removeByKey, removeAllQueryParams } =
		useTypedQuery(fmSearchParamsSchema);

	/* selection */
	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(selectedFmPageIds),
	);

	const [, startSelectTransition] = useTransition();

	function setFmPageSelection(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);
			if (selection === 'all') {
				return;
			}
			if (selection.size === 0) {
				return removeByKey('selectedFmPageIds');
			}
			return setQuery(
				'selectedFmPageIds',
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
				setOptimisticFilters({ ...optimisticFilters });
				removeByKey('search');
			}
		});
	}

	const lastSelectedFmPageId =
		optimisticSelection === 'all' ? undefined : (
			Array.from(optimisticSelection).pop()?.toString()
		);

	const lastSelectedFmPage =
		lastSelectedFmPageId ?
			fmPages.find(fmPage => fmPage.id === lastSelectedFmPageId)
		:	undefined;

	const contextValue = {
		fmPages,
		fmPageSelection: optimisticSelection,
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
		filters: optimisticFilters,
		pendingFiltersTransition,
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
