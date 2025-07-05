'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { emailBroadcastFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { emailBroadcastSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type EmailBroadcastsContext = InfiniteItemsContext<
	AppRouterOutputs['emailBroadcast']['byWorkspace']['emailBroadcasts'][number],
	z.infer<typeof emailBroadcastFilterParamsSchema>
>;

const EmailBroadcastsContext = createContext<EmailBroadcastsContext | undefined>(
	undefined,
);

export function EmailBroadcastsContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const trpc = useTRPC();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(emailBroadcastSearchParamsSchema);

	const { selectedEmailBroadcastIds, ...filters } = data;

	const emailBroadcastSelection: Selection =
		!selectedEmailBroadcastIds ? new Set()
		: selectedEmailBroadcastIds === 'all' ? 'all'
		: new Set(selectedEmailBroadcastIds);

	const {
		data: infiniteEmailBroadcasts,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isRefetching,
		isFetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.emailBroadcast.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const emailBroadcasts = infiniteEmailBroadcasts.pages.flatMap(
		page => page.emailBroadcasts,
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	const setEmailBroadcastSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedEmailBroadcastIds');
			return setQuery(
				'selectedEmailBroadcastIds',
				Array.from(selection).map(key => key.toString()),
			);
		},
		[setQuery, removeByKey],
	);

	const clearAllFilters = useCallback(() => {
		removeAllQueryParams();
	}, [removeAllQueryParams]);

	const setSearch = useCallback(
		(search: string) => {
			if (search.length) return setQuery('search', search);
			return removeByKey('search');
		},
		[setQuery, removeByKey],
	);

	const lastSelectedEmailBroadcastId =
		emailBroadcastSelection === 'all' || !emailBroadcastSelection.size ?
			undefined
		:	Array.from(emailBroadcastSelection).pop()?.toString();

	const lastSelectedEmailBroadcast = emailBroadcasts.find(
		emailBroadcast => emailBroadcast.id === lastSelectedEmailBroadcastId,
	);

	const contextValue = {
		items: emailBroadcasts,
		selection: emailBroadcastSelection,
		lastSelectedItemId: lastSelectedEmailBroadcastId,
		lastSelectedItem: lastSelectedEmailBroadcast,
		setSelection: setEmailBroadcastSelection,
		gridListRef,
		focusGridList: () => {
			gridListRef.current?.focus();
		},
		showCreateModal,
		setShowCreateModal,
		showUpdateModal,
		setShowUpdateModal,
		showDeleteModal,
		setShowDeleteModal,
		showArchiveModal: false,
		setShowArchiveModal: () => void {},
		toggleArchived: () => void {},
		// filters
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		clearAllFilters,
		// infinite
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} satisfies EmailBroadcastsContext;

	return (
		<EmailBroadcastsContext.Provider value={contextValue}>
			{children}
		</EmailBroadcastsContext.Provider>
	);
}

export function useEmailBroadcastsContext() {
	const context = useContext(EmailBroadcastsContext);
	if (!context) {
		throw new Error(
			'useEmailBroadcastsContext must be used within an EmailBroadcastsContextProvider',
		);
	}
	return context;
}
