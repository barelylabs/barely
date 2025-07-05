'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { emailDomainFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { emailDomainSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type EmailDomainContext = InfiniteItemsContext<
	AppRouterOutputs['emailDomain']['byWorkspace']['domains'][number],
	z.infer<typeof emailDomainFilterParamsSchema>
>;

const EmailDomainContext = createContext<EmailDomainContext | undefined>(undefined);

export function EmailDomainContextProvider({ children }: { children: React.ReactNode }) {
	const { handle } = useWorkspace();

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteEmailDomainModal, setShowDeleteEmailDomainModal] = useState(false);

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(emailDomainSearchParamsSchema);

	const { selectedEmailDomainIds, ...filters } = data;

	const emailDomainSelection = useMemo<Selection>(() => {
		if (!selectedEmailDomainIds) return new Set();
		if (selectedEmailDomainIds === 'all') return 'all';
		return new Set(selectedEmailDomainIds);
	}, [selectedEmailDomainIds]);

	const trpc = useTRPC();
	const {
		data: infiniteEmailDomains,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.emailDomain.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const emailDomains = infiniteEmailDomains.pages.flatMap(page => page.domains);

	const gridListRef = useRef<HTMLDivElement>(null);

	/* setters */
	const setEmailDomainSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedEmailDomainIds');
			return setQuery(
				'selectedEmailDomainIds',
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

	const lastSelectedEmailDomainId =
		emailDomainSelection === 'all' || !emailDomainSelection.size ?
			undefined
		:	Array.from(emailDomainSelection).pop()?.toString();

	const lastSelectedEmailDomain = emailDomains.find(
		domain => domain.id === lastSelectedEmailDomainId,
	);

	const contextValue = {
		items: emailDomains,
		selection: emailDomainSelection,
		lastSelectedItemId: lastSelectedEmailDomainId,
		lastSelectedItem: lastSelectedEmailDomain,
		setSelection: setEmailDomainSelection,
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
		showDeleteModal: showDeleteEmailDomainModal,
		setShowDeleteModal: setShowDeleteEmailDomainModal,
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
