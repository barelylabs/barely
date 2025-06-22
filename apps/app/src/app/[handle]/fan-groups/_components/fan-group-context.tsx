'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { fanGroupFilterParamsSchema } from '@barely/lib/server/routes/fan-group/fan-group.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { fanGroupSearchParamsSchema } from '@barely/lib/server/routes/fan-group/fan-group.schema';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

// interface FanGroupContext {
// 	fanGroups: AppRouterOutputs['fanGroup']['byWorkspace']['fanGroups'];
// 	fanGroupSelection: Selection;
// 	lastSelectedFanGroupId: string | undefined;
// 	lastSelectedFanGroup:
// 		| AppRouterOutputs['fanGroup']['byWorkspace']['fanGroups'][number]
// 		| undefined;
// 	setFanGroupSelection: (selection: Selection) => void;
// 	gridListRef: React.RefObject<HTMLDivElement>;
// 	focusGridList: () => void;
// 	showCreateFanGroupModal: boolean;
// 	setShowCreateFanGroupModal: (show: boolean) => void;
// 	showUpdateFanGroupModal: boolean;
// 	setShowUpdateFanGroupModal: (show: boolean) => void;
// 	showArchiveFanGroupModal: boolean;
// 	setShowArchiveFanGroupModal: (show: boolean) => void;
// 	showDeleteFanGroupModal: boolean;
// 	setShowDeleteFanGroupModal: (show: boolean) => void;
// 	// filters
// 	filters: z.infer<typeof fanGroupFilterParamsSchema>;
// 	pendingFiltersTransition: boolean;
// 	setSearch: (search: string) => void;
// 	toggleArchived: () => void;
// 	clearAllFilters: () => void;
// }

type FanGroupContext = InfiniteItemsContext<
	AppRouterOutputs['fanGroup']['byWorkspace']['fanGroups'][number],
	z.infer<typeof fanGroupFilterParamsSchema>
>;

const FanGroupContext = createContext<FanGroupContext | undefined>(undefined);

export function FanGroupContextProvider({
	children,
	initialFanGroups,
}: {
	children: React.ReactNode;
	initialFanGroups: Promise<AppRouterOutputs['fanGroup']['byWorkspace']>;
}) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(fanGroupSearchParamsSchema);

	const { selectedFanGroupIds, ...filters } = data;

	const fanGroupSelection: Selection =
		!selectedFanGroupIds ? new Set()
		: selectedFanGroupIds === 'all' ? 'all'
		: new Set(selectedFanGroupIds);

	const initialData = use(initialFanGroups);

	const {
		data: infiniteFanGroups,
		hasNextPage,
		fetchNextPage,
		isPending,
		isFetching,
		isRefetching,
	} = api.fanGroup.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [
						{ fanGroups: initialData.fanGroups, nextCursor: initialData.nextCursor },
					],
					pageParams: [], // todo - figure out how to structure this
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const fanGroups = infiniteFanGroups?.pages.flatMap(page => page.fanGroups) ?? [];

	const gridListRef = useRef<HTMLDivElement>(null);

	/* setters */
	const setFanGroupSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedFanGroupIds');
			return setQuery(
				'selectedFanGroupIds',
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
			setQuery('search', search);
		},
		[setQuery],
	);

	const lastSelectedFanGroupId =
		fanGroupSelection === 'all' || !fanGroupSelection ?
			undefined
		:	Array.from(fanGroupSelection).pop()?.toString();

	const lastSelectedFanGroup = fanGroups.find(
		fanGroup => fanGroup.id === lastSelectedFanGroupId,
	);

	const contextValue = {
		items: fanGroups,
		selection: fanGroupSelection,
		lastSelectedItemId: lastSelectedFanGroupId,
		lastSelectedItem: lastSelectedFanGroup,
		setSelection: setFanGroupSelection,
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
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage: isFetching,
		isRefetching,
		isPending,
		isFetching,
	} satisfies FanGroupContext;

	return (
		<FanGroupContext.Provider value={contextValue}>{children}</FanGroupContext.Provider>
	);
}

export function useFanGroupContext() {
	const context = useContext(FanGroupContext);
	if (!context) {
		throw new Error('useFanGroupContext must be used within a FanGroupContextProvider');
	}
	return context;
}
