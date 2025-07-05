'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { emailAddressFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { emailAddressSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type EmailAddressContext = InfiniteItemsContext<
	AppRouterOutputs['emailAddress']['byWorkspace']['emailAddresses'][number],
	z.infer<typeof emailAddressFilterParamsSchema>
>;

const EmailAddressContext = createContext<EmailAddressContext | undefined>(undefined);

export function EmailAddressContextProvider({ children }: { children: React.ReactNode }) {
	const { handle } = useWorkspace();

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(emailAddressSearchParamsSchema);

	const { selectedEmailAddressIds, ...filters } = data;

	const emailAddressSelection = useMemo<Selection>(() => {
		if (!selectedEmailAddressIds) return new Set();
		if (selectedEmailAddressIds === 'all') return 'all';
		return new Set(selectedEmailAddressIds);
	}, [selectedEmailAddressIds]);

	const trpc = useTRPC();
	const {
		data: infiniteEmailAddresses,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.emailAddress.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const emailAddresses = infiniteEmailAddresses.pages.flatMap(
		page => page.emailAddresses,
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	/* setters */
	const setEmailAddressSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedEmailAddressIds');
			return setQuery(
				'selectedEmailAddressIds',
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

	const lastSelectedEmailAddressId =
		emailAddressSelection === 'all' || !emailAddressSelection.size ?
			undefined
		:	Array.from(emailAddressSelection).pop()?.toString();

	const lastSelectedEmailAddress = emailAddresses.find(
		emailAddress => emailAddress.id === lastSelectedEmailAddressId,
	);

	const contextValue = {
		items: emailAddresses,
		selection: emailAddressSelection,
		lastSelectedItemId: lastSelectedEmailAddressId,
		lastSelectedItem: lastSelectedEmailAddress,
		setSelection: setEmailAddressSelection,
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
		// infinite
		hasNextPage,
		fetchNextPage: () => void fetchNextPage(),
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} satisfies EmailAddressContext;

	return (
		<EmailAddressContext.Provider value={contextValue}>
			{children}
		</EmailAddressContext.Provider>
	);
}

export function useEmailAddressContext() {
	const context = useContext(EmailAddressContext);
	if (!context) {
		throw new Error(
			'useEmailAddressContext must be used within a EmailAddressContextProvider',
		);
	}
	return context;
}
