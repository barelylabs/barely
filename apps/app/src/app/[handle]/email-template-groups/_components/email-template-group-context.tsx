'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { emailTemplateGroupFilterParamsSchema } from '@barely/lib/server/routes/email-template-group/email-template-group.schema';
import type { FetchNextPageOptions } from '@tanstack/react-query';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { emailTemplateGroupSearchParamsSchema } from '@barely/lib/server/routes/email-template-group/email-template-group.schema';

interface EmailTemplateGroupContext {
	emailTemplateGroups: AppRouterOutputs['emailTemplateGroup']['byWorkspace']['emailTemplateGroups'];
	emailTemplateGroupSelection: Selection;
	lastSelectedEmailTemplateGroupId: string | undefined;
	lastSelectedEmailTemplateGroup:
		| AppRouterOutputs['emailTemplateGroup']['byWorkspace']['emailTemplateGroups'][number]
		| undefined;
	// lastSelectedEmailTemplateGroupEmailTemplates:
	// 	| AppRouterOutputs['emailTemplate']['byEmailTemplateGroup']['emailTemplates']
	// 	| undefined;
	setEmailTemplateGroupSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateEmailTemplateGroupModal: boolean;
	setShowCreateEmailTemplateGroupModal: (show: boolean) => void;
	showUpdateEmailTemplateGroupModal: boolean;
	setShowUpdateEmailTemplateGroupModal: (show: boolean) => void;
	showDeleteEmailTemplateGroupModal: boolean;
	setShowDeleteEmailTemplateGroupModal: (show: boolean) => void;
	showArchiveEmailTemplateGroupModal: boolean;
	setShowArchiveEmailTemplateGroupModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof emailTemplateGroupFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
	// infinite
	hasNextPage: boolean;
	fetchNextPage: (options?: FetchNextPageOptions) => void | Promise<void>;
	isFetchingNextPage: boolean;
}

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
	const [showCreateEmailTemplateGroupModal, setShowCreateEmailTemplateGroupModal] =
		useState(false);
	const [showUpdateEmailTemplateGroupModal, setShowUpdateEmailTemplateGroupModal] =
		useState(false);
	const [showDeleteEmailTemplateGroupModal, setShowDeleteEmailTemplateGroupModal] =
		useState(false);
	const [showArchiveEmailTemplateGroupModal, setShowArchiveEmailTemplateGroupModal] =
		useState(false);

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

	// const { data: lastSelectedEmailTemplateGroupEmailTemplates } =
	// 	api.emailTemplate.byEmailTemplateGroup.useQuery(
	// 		{
	// 			handle,
	// 			emailTemplateGroupId: lastSelectedEmailTemplateGroupId ?? '',
	// 		},
	// 		{
	// 			enabled: !!lastSelectedEmailTemplateGroupId,
	// 			select: data => data.emailTemplates,
	// 		},
	// 	);

	const contextValue = {
		emailTemplateGroups,
		emailTemplateGroupSelection,
		lastSelectedEmailTemplateGroupId,
		lastSelectedEmailTemplateGroup,
		// lastSelectedEmailTemplateGroupEmailTemplates,
		setEmailTemplateGroupSelection,
		gridListRef,
		focusGridList: () => {
			gridListRef.current?.focus();
		},
		showCreateEmailTemplateGroupModal,
		setShowCreateEmailTemplateGroupModal,
		showUpdateEmailTemplateGroupModal,
		setShowUpdateEmailTemplateGroupModal,
		showDeleteEmailTemplateGroupModal,
		setShowDeleteEmailTemplateGroupModal,
		showArchiveEmailTemplateGroupModal,
		setShowArchiveEmailTemplateGroupModal,
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
