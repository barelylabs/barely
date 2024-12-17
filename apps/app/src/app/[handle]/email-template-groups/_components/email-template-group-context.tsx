'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { emailTemplateGroupFilterParamsSchema } from '@barely/lib/server/routes/email-template-group/email-template-group.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { emailTemplateGroupSearchParamsSchema } from '@barely/lib/server/routes/email-template-group/email-template-group.schema';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type EmailTemplateGroupContext = InfiniteItemsContext<
	AppRouterOutputs['emailTemplateGroup']['byWorkspace']['emailTemplateGroups'][number],
	z.infer<typeof emailTemplateGroupFilterParamsSchema>
>;

const EmailTemplateGroupContext = createContext<EmailTemplateGroupContext | undefined>(
	undefined,
);

export function EmailTemplateGroupContextProvider({
	children,
	initialEmailTemplateGroupsFirstPage,
}: {
	children: React.ReactNode;
	initialEmailTemplateGroupsFirstPage: Promise<
		AppRouterOutputs['emailTemplateGroup']['byWorkspace']
	>;
}) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(emailTemplateGroupSearchParamsSchema);

	const { selectedEmailTemplateGroupIds, ...filters } = data;

	const emailTemplateGroupSelection: Selection =
		!selectedEmailTemplateGroupIds ? new Set()
		: selectedEmailTemplateGroupIds === 'all' ? 'all'
		: new Set(selectedEmailTemplateGroupIds);

	const initialData = use(initialEmailTemplateGroupsFirstPage);
	const {
		data: infiniteEmailTemplateGroups,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isRefetching,
		isFetching,
		isPending,
	} = api.emailTemplateGroup.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [
						{
							emailTemplateGroups: initialData.emailTemplateGroups,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [],
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const emailTemplateGroups =
		infiniteEmailTemplateGroups?.pages.flatMap(page => page.emailTemplateGroups) ?? [];

	const gridListRef = useRef<HTMLDivElement>(null);

	const setEmailTemplateGroupSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedEmailTemplateGroupIds');
			return setQuery(
				'selectedEmailTemplateGroupIds',
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

	const lastSelectedEmailTemplateGroupId =
		emailTemplateGroupSelection === 'all' || !emailTemplateGroupSelection ?
			undefined
		:	Array.from(emailTemplateGroupSelection).pop()?.toString();

	const lastSelectedEmailTemplateGroup = emailTemplateGroups.find(
		group => group.id === lastSelectedEmailTemplateGroupId,
	);

	const contextValue = {
		items: emailTemplateGroups,
		selection: emailTemplateGroupSelection,
		lastSelectedItemId: lastSelectedEmailTemplateGroupId,
		lastSelectedItem: lastSelectedEmailTemplateGroup,
		setSelection: setEmailTemplateGroupSelection,
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
		showArchiveModal,
		setShowArchiveModal,
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
		isRefetching,
		isFetching,
		isPending,
	} satisfies EmailTemplateGroupContext;

	return (
		<EmailTemplateGroupContext.Provider value={contextValue}>
			{children}
		</EmailTemplateGroupContext.Provider>
	);
}

export function useEmailTemplateGroupContext() {
	const context = useContext(EmailTemplateGroupContext);
	if (!context) {
		throw new Error(
			'useEmailTemplateGroupContext must be used within an EmailTemplateGroupContextProvider',
		);
	}
	return context;
}
