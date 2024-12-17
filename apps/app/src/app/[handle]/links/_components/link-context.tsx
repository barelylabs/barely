'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { linkFilterParamsSchema } from '@barely/lib/server/routes/link/link.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import {
	createContext,
	use,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { linkSearchParamsSchema } from '@barely/lib/server/routes/link/link.schema';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

// interface LinkContext {
// 	links: AppRouterOutputs['link']['byWorkspace']['links'];
// 	linkSelection: Selection;
// 	lastSelectedLinkId: string | undefined;
// 	lastSelectedLink: AppRouterOutputs['link']['byWorkspace']['links'][number] | undefined;
// 	setLinkSelection: (selection: Selection) => void;
// 	gridListRef: React.RefObject<HTMLDivElement>;
// 	focusGridList: () => void;
// 	showCreateLinkModal: boolean;
// 	setShowCreateLinkModal: (show: boolean) => void;
// 	showUpdateLinkModal: boolean;
// 	setShowUpdateLinkModal: (show: boolean) => void;
// 	showArchiveLinkModal: boolean;
// 	setShowArchiveLinkModal: (show: boolean) => void;
// 	showDeleteLinkModal: boolean;
// 	setShowDeleteLinkModal: (show: boolean) => void;
// 	// filters
// 	filters: z.infer<typeof linkFilterParamsSchema>;
// 	pendingFiltersTransition: boolean;
// 	setSearch: (search: string) => void;
// 	toggleArchived: () => void;
// 	clearAllFilters: () => void;
// }

type LinkContext = InfiniteItemsContext<
	AppRouterOutputs['link']['byWorkspace']['links'][0],
	z.infer<typeof linkFilterParamsSchema>
>;

const LinkContext = createContext<LinkContext | undefined>(undefined);

export function LinkContextProvider({
	children,
	initialInfiniteLinks,
}: {
	children: React.ReactNode;
	initialInfiniteLinks: Promise<AppRouterOutputs['link']['byWorkspace']>;
}) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(linkSearchParamsSchema);

	const { selectedLinkIds, ...filters } = data;

	const linkSelection: Selection =
		!selectedLinkIds ? new Set()
		: selectedLinkIds === 'all' ? 'all'
		: new Set(selectedLinkIds);

	const initialData = use(initialInfiniteLinks);

	const {
		data: infiniteLinks,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = api.link.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [
						{
							links: initialData.links,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [], // todo: fix this
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const links = useMemo(() => {
		return infiniteLinks?.pages.flatMap(page => page.links) ?? [];
	}, [infiniteLinks]);

	const setLinkSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedLinkIds');
			return setQuery(
				'selectedLinkIds',
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
		return setQuery('showArchived', true);
	}, [data.showArchived, removeByKey, setQuery]);

	const setSearch = useCallback(
		(search: string) => {
			if (search.length) return setQuery('search', search);
			return removeByKey('search');
		},
		[setQuery, removeByKey],
	);

	const lastSelectedLinkId =
		linkSelection === 'all' || !linkSelection ?
			undefined
		:	Array.from(linkSelection).pop()?.toString();

	const lastSelectedLink = links.find(l => l.id === lastSelectedLinkId);

	const gridListRef = useRef<HTMLDivElement>(null);

	const contextValue = {
		items: links,
		selection: linkSelection,
		lastSelectedItemId: lastSelectedLinkId,
		lastSelectedItem: lastSelectedLink,
		setSelection: setLinkSelection,
		// grid list
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		// modal
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
	} satisfies LinkContext;

	return <LinkContext.Provider value={contextValue}>{children}</LinkContext.Provider>;
}
export function useLinkContext() {
	const context = useContext(LinkContext);
	if (!context) {
		throw new Error('useLinkContext must be used within a LinkContextProvider');
	}
	return context;
}
