'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { emailTemplateFilterParamsSchema } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery, useWorkspace } from '@barely/hooks';
import { emailTemplateSearchParamsSchema } from '@barely/validators';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type EmailTemplateContext = InfiniteItemsContext<
	AppRouterOutputs['emailTemplate']['byWorkspace']['emailTemplates'][number],
	z.infer<typeof emailTemplateFilterParamsSchema>
>;

const EmailTemplateContext = createContext<EmailTemplateContext | undefined>(undefined);

export function EmailTemplateContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	useState(false);

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(emailTemplateSearchParamsSchema);

	const { selectedEmailTemplateIds, ...filters } = data;

	const emailTemplateSelection: Selection =
		!selectedEmailTemplateIds ? new Set()
		: selectedEmailTemplateIds === 'all' ? 'all'
		: new Set(selectedEmailTemplateIds);

	const {
		data: infiniteEmailTemplates,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isRefetching,
		isFetching,
		isPending,
	} = useSuspenseInfiniteQuery({
		...trpc.emailTemplate.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const emailTemplates = infiniteEmailTemplates.pages.flatMap(
		page => page.emailTemplates,
	);

	const gridListRef = useRef<HTMLDivElement | null>(null);

	const setEmailTemplateSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedEmailTemplateIds');
			return setQuery(
				'selectedEmailTemplateIds',
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

	const lastSelectedEmailTemplateId =
		emailTemplateSelection === 'all' || !emailTemplateSelection.size ?
			undefined
		:	Array.from(emailTemplateSelection).pop()?.toString();

	const lastSelectedEmailTemplate = emailTemplates.find(
		template => template.id === lastSelectedEmailTemplateId,
	);

	const contextValue = {
		items: emailTemplates,
		selection: emailTemplateSelection,
		lastSelectedItemId: lastSelectedEmailTemplateId,
		lastSelectedItem: lastSelectedEmailTemplate,
		setSelection: setEmailTemplateSelection,
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
	} satisfies EmailTemplateContext;

	return (
		<EmailTemplateContext.Provider value={contextValue}>
			{children}
		</EmailTemplateContext.Provider>
	);
}

export function useEmailTemplateContext() {
	const context = useContext(EmailTemplateContext);
	if (!context) {
		throw new Error(
			'useEmailTemplate must be used within an EmailTemplateContextProvider',
		);
	}
	return context;
}
