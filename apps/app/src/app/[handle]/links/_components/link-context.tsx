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

interface LinkContext {
	links: AppRouterOutputs['link']['byWorkspace']['links'];
	linkSelection: Selection;
	lastSelectedLinkId: string | undefined;
	lastSelectedLink: AppRouterOutputs['link']['byWorkspace']['links'][number] | undefined;
	setLinkSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateLinkModal: boolean;
	setShowCreateLinkModal: (show: boolean) => void;
	showUpdateLinkModal: boolean;
	setShowUpdateLinkModal: (show: boolean) => void;
	showArchiveLinkModal: boolean;
	setShowArchiveLinkModal: (show: boolean) => void;
	showDeleteLinkModal: boolean;
	setShowDeleteLinkModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof linkFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
}

const LinkContext = createContext<LinkContext | undefined>(undefined);

export function LinkContextProvider({
	children,
	initialInfiniteLinks,
}: {
	children: React.ReactNode;
	initialInfiniteLinks: Promise<AppRouterOutputs['link']['byWorkspace']>;
}) {
	const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
	const [showUpdateLinkModal, setShowUpdateLinkModal] = useState(false);
	const [showArchiveLinkModal, setShowArchiveLinkModal] = useState(false);
	const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(linkSearchParamsSchema);

	const { selectedLinkIds, ...filters } = data;

	const linkSelection: Selection =
		!selectedLinkIds ? new Set()
		: selectedLinkIds === 'all' ? 'all'
		: new Set(selectedLinkIds);

	const initialData = use(initialInfiniteLinks);

	const { data: infiniteLinks } = api.link.byWorkspace.useInfiniteQuery(
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
		links,
		linkSelection,
		setLinkSelection,
		// current selection
		lastSelectedLinkId,
		lastSelectedLink,
		// grid list
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		// focusGridList: () => {
		// 	wait(1)
		// 		.then(() => {
		// 			gridListRef.current?.focus();
		// 		})
		// 		.catch(e => {
		// 			console.error(e);
		// 		});
		// }, // fixme: this is a workaround for focus not working on modal closing
		// modal
		showCreateLinkModal,
		setShowCreateLinkModal,
		showUpdateLinkModal,
		setShowUpdateLinkModal,
		showArchiveLinkModal,
		setShowArchiveLinkModal,
		showDeleteLinkModal,
		setShowDeleteLinkModal,
		// filters
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		toggleArchived,
		clearAllFilters,
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
