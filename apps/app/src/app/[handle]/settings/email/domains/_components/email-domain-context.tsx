'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { emailDomainFilterParamsSchema } from '@barely/lib/server/routes/email-domain/email-domain.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
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
import { emailDomainSearchParamsSchema } from '@barely/lib/server/routes/email-domain/email-domain.schema';

interface EmailDomainContext {
	emailDomains: AppRouterOutputs['emailDomain']['byWorkspace']['domains'];
	emailDomainSelection: Selection;
	lastSelectedEmailDomainId: string | undefined;
	lastSelectedEmailDomain:
		| AppRouterOutputs['emailDomain']['byWorkspace']['domains'][number]
		| undefined;
	setEmailDomainSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateEmailDomainModal: boolean;
	setShowCreateEmailDomainModal: (show: boolean) => void;
	showUpdateEmailDomainModal: boolean;
	setShowUpdateEmailDomainModal: (show: boolean) => void;
	showDeleteEmailDomainModal: boolean;
	setShowDeleteEmailDomainModal: (show: boolean) => void;

	// filters
	filters: z.infer<typeof emailDomainFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
}

const EmailDomainContext = createContext<EmailDomainContext | undefined>(undefined);

export function EmailDomainContextProvider({
	children,
	initialEmailDomains,
	filters = {},
	selectedEmailDomainIds = [],
}: {
	children: React.ReactNode;
	initialEmailDomains: Promise<AppRouterOutputs['emailDomain']['byWorkspace']>;
	filters?: z.infer<typeof emailDomainFilterParamsSchema>;
	selectedEmailDomainIds: string[];
}) {
	const [showCreateEmailDomainModal, setShowCreateEmailDomainModal] = useState(false);
	const [showUpdateEmailDomainModal, setShowUpdateEmailDomainModal] = useState(false);
	const [showDeleteEmailDomainModal, setShowDeleteEmailDomainModal] = useState(false);

	const { handle } = useWorkspace();

	const initialData = use(initialEmailDomains);

	const { data: infiniteEmailDomains } = api.emailDomain.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [
						{
							domains: initialData.domains,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [], // todo: figure out how to structure this
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const domains = infiniteEmailDomains?.pages.flatMap(page => page.domains) ?? [];

	const gridListRef = useRef<HTMLDivElement>(null);

	const { data, setQuery, removeByKey, removeAllQueryParams } = useTypedQuery(
		emailDomainSearchParamsSchema,
	);

	/* selection */
	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(selectedEmailDomainIds),
	);

	const [, startSelectTransition] = useTransition();

	function setEmailDomainSelection(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);
			if (selection === 'all') {
				return;
			}
			if (selection.size === 0) {
				return removeByKey('selectedEmailDomainIds');
			}
			return setQuery(
				'selectedEmailDomainIds',
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
			return removeAllQueryParams();
		});
	}

	// toggle archived
	function toggleArchived() {
		startFiltersTransition(() => {
			if (data.showArchived) {
				setOptimisticFilters({ ...optimisticFilters, showArchived: false });
				return removeByKey('showArchived');
			}
			setOptimisticFilters({ ...optimisticFilters, showArchived: true });
			return setQuery('showArchived', true);
		});
	}

	// search
	function setSearch(search: string) {
		startFiltersTransition(() => {
			if (search.length) {
				setOptimisticFilters({ ...optimisticFilters, search });
				return setQuery('search', search);
			}
			setOptimisticFilters({ ...optimisticFilters });
			return removeByKey('search');
		});
	}

	const lastSelectedEmailDomainId =
		optimisticSelection === 'all' ? undefined : (
			Array.from(optimisticSelection).pop()?.toString()
		);

	const lastSelectedEmailDomain =
		lastSelectedEmailDomainId ?
			domains.find(domain => domain.id === lastSelectedEmailDomainId)
		:	undefined;

	const contextValue = {
		emailDomains: domains,
		emailDomainSelection: optimisticSelection,
		lastSelectedEmailDomainId,
		lastSelectedEmailDomain,
		setEmailDomainSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showCreateEmailDomainModal,
		setShowCreateEmailDomainModal,
		showUpdateEmailDomainModal,
		setShowUpdateEmailDomainModal,
		showDeleteEmailDomainModal,
		setShowDeleteEmailDomainModal,
		// filters
		filters: optimisticFilters,
		pendingFiltersTransition,
		setSearch,
		toggleArchived,
		clearAllFilters,
	} satisfies EmailDomainContext;

	return (
		<EmailDomainContext.Provider value={contextValue}>
			{children}
		</EmailDomainContext.Provider>
	);
}

export function useEmailDomainContext() {
	const context = useContext(EmailDomainContext);
	if (!context) {
		throw new Error(
			'useEmailDomainContext must be used within a EmailDomainContextProvider',
		);
	}
	return context;
}
