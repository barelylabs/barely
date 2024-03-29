'use client';

import type { EdgeRouterOutputs } from '@barely/lib/server/api/router.edge';
import type { Link, linkFilterParamsSchema } from '@barely/lib/server/link.schema';
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
import { linkSearchParamsSchema } from '@barely/lib/server/link.schema';
import { wait } from '@barely/lib/utils/wait';

interface LinkContext {
	links: EdgeRouterOutputs['link']['byWorkspace'];
	linkSelection: Selection;
	lastSelectedLinkId: string | undefined;
	lastSelectedLink: Link | undefined;
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
	initialLinks,
	filters,
	selectedLinkIds,
}: {
	children: React.ReactNode;
	initialLinks: Promise<EdgeRouterOutputs['link']['byWorkspace']>;
	filters: z.infer<typeof linkFilterParamsSchema>;
	selectedLinkIds:
		| z.infer<typeof linkSearchParamsSchema.shape.selectedLinkIds>
		| undefined;
}) {
	const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
	const [showUpdateLinkModal, setShowUpdateLinkModal] = useState(false);
	const [showArchiveLinkModal, setShowArchiveLinkModal] = useState(false);
	const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);

	const { handle } = useWorkspace();

	const { data: links } = api.link.byWorkspace.useQuery(
		{ handle, filters },
		{
			initialData: use(initialLinks),
		},
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	const { data, setQuery, removeByKey, removeAllQueryParams } =
		useTypedQuery(linkSearchParamsSchema);

	/* selection */
	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(selectedLinkIds),
	);
	const [, startSelectTransition] = useTransition();

	function setLinkSelection(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);
			if (selection === 'all') return;

			if (selection.size === 0) {
				return removeByKey('selectedLinkIds');
			}
			return setQuery(
				'selectedLinkIds',
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
			console.log('should be done pending');
		});
	}

	const lastSelectedLinkId =
		optimisticSelection === 'all'
			? undefined
			: Array.from(optimisticSelection).pop()?.toString();

	const lastSelectedLink = links.find(l => l.id === lastSelectedLinkId);

	const contextValue = {
		links,
		linkSelection: optimisticSelection,
		setLinkSelection,
		// current selection
		lastSelectedLinkId,
		lastSelectedLink,
		// grid list
		gridListRef,
		focusGridList: () => {
			wait(1)
				.then(() => {
					gridListRef.current?.focus();
				})
				.catch(e => {
					console.error(e);
				});
		}, // fixme: this is a workaround for focus not working on modal closing
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
		filters: optimisticFilters,
		pendingFiltersTransition,
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
