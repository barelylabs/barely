'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { emailBroadcastFilterParamsSchema } from '@barely/lib/server/routes/email-broadcast/email-broadcast-schema';
import type { FetchNextPageOptions } from '@tanstack/react-query';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { emailBroadcastSearchParamsSchema } from '@barely/lib/server/routes/email-broadcast/email-broadcast-schema';

interface EmailBroadcastsContext {
	emailBroadcasts: AppRouterOutputs['emailBroadcast']['byWorkspace']['emailBroadcasts'];
	emailBroadcastSelection: Selection;
	lastSelectedEmailBroadcastId: string | undefined;
	lastSelectedEmailBroadcast:
		| AppRouterOutputs['emailBroadcast']['byWorkspace']['emailBroadcasts'][number]
		| undefined;
	setEmailBroadcastSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateEmailBroadcastModal: boolean;
	setShowCreateEmailBroadcastModal: (show: boolean) => void;
	showUpdateEmailBroadcastModal: boolean;
	setShowUpdateEmailBroadcastModal: (show: boolean) => void;
	showDeleteEmailBroadcastModal: boolean;
	setShowDeleteEmailBroadcastModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof emailBroadcastFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	clearAllFilters: () => void;
	// infinite
	hasNextPage: boolean;
	fetchNextPage: (options?: FetchNextPageOptions) => void | Promise<void>;
	isFetchingNextPage: boolean;
}

const EmailBroadcastsContext = createContext<EmailBroadcastsContext | undefined>(
	undefined,
);

export function EmailBroadcastsContextProvider({
	children,
	initialEmailBroadcastsFirstPage,
}: {
	children: React.ReactNode;
	initialEmailBroadcastsFirstPage: Promise<
		AppRouterOutputs['emailBroadcast']['byWorkspace']
	>;
}) {
	const [showCreateEmailBroadcastModal, setShowCreateEmailBroadcastModal] =
		useState(false);
	const [showUpdateEmailBroadcastModal, setShowUpdateEmailBroadcastModal] =
		useState(false);
	const [showDeleteEmailBroadcastModal, setShowDeleteEmailBroadcastModal] =
		useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(emailBroadcastSearchParamsSchema);

	const { selectedEmailBroadcastIds, ...filters } = data;

	const emailBroadcastSelection: Selection =
		!selectedEmailBroadcastIds ? new Set()
		: selectedEmailBroadcastIds === 'all' ? 'all'
		: new Set(selectedEmailBroadcastIds);

	const initialData = use(initialEmailBroadcastsFirstPage);
	const {
		data: infiniteEmailBroadcasts,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = api.emailBroadcast.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => ({
				pages: [
					{
						emailBroadcasts: initialData.emailBroadcasts,
						nextCursor: initialData.nextCursor,
					},
				],
				pageParams: [],
			}),
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const emailBroadcasts =
		infiniteEmailBroadcasts?.pages.flatMap(page => page.emailBroadcasts) ?? [];

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
		emailBroadcastSelection === 'all' || !emailBroadcastSelection ?
			undefined
		:	Array.from(emailBroadcastSelection).pop()?.toString();

	const lastSelectedEmailBroadcast = emailBroadcasts.find(
		emailBroadcast => emailBroadcast.id === lastSelectedEmailBroadcastId,
	);

	const contextValue = {
		emailBroadcasts,
		emailBroadcastSelection,
		lastSelectedEmailBroadcastId,
		lastSelectedEmailBroadcast,
		setEmailBroadcastSelection,
		gridListRef,
		focusGridList: () => {
			gridListRef.current?.focus();
		},
		showCreateEmailBroadcastModal,
		setShowCreateEmailBroadcastModal,
		showUpdateEmailBroadcastModal,
		setShowUpdateEmailBroadcastModal,
		// showArchiveEmailBroadcastModal,
		// setShowArchiveEmailBroadcastModal,
		showDeleteEmailBroadcastModal,
		setShowDeleteEmailBroadcastModal,
		// filters
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		clearAllFilters,
		// infinite
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
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
