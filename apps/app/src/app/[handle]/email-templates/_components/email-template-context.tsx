'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { emailTemplateFilterParamsSchema } from '@barely/lib/server/routes/email-template/email-template.schema';
import type { FetchNextPageOptions } from '@tanstack/react-query';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { emailTemplateSearchParamsSchema } from '@barely/lib/server/routes/email-template/email-template.schema';

interface EmailTemplateContext {
	emailTemplates: AppRouterOutputs['emailTemplate']['byWorkspace']['emailTemplates'];
	emailTemplateSelection: Selection;
	lastSelectedEmailTemplateId: string | undefined;
	lastSelectedEmailTemplate:
		| AppRouterOutputs['emailTemplate']['byWorkspace']['emailTemplates'][number]
		| undefined;
	setEmailTemplateSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateEmailTemplateModal: boolean;
	setShowCreateEmailTemplateModal: (show: boolean) => void;
	showUpdateEmailTemplateModal: boolean;
	setShowUpdateEmailTemplateModal: (show: boolean) => void;
	showDeleteEmailTemplateModal: boolean;
	setShowDeleteEmailTemplateModal: (show: boolean) => void;
	showArchiveEmailTemplateModal: boolean;
	setShowArchiveEmailTemplateModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof emailTemplateFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
	// infinite
	hasNextPage: boolean;
	fetchNextPage: (options?: FetchNextPageOptions) => void | Promise<void>;
	isFetchingNextPage: boolean;
}

const EmailTemplateContext = createContext<EmailTemplateContext | undefined>(undefined);

export function EmailTemplateContextProvider({
	children,
	initialEmailTemplatesFirstPage,
}: {
	children: React.ReactNode;
	initialEmailTemplatesFirstPage: Promise<
		AppRouterOutputs['emailTemplate']['byWorkspace']
	>;
}) {
	const [showCreateEmailTemplateModal, setShowCreateEmailTemplateModal] = useState(false);
	const [showUpdateEmailTemplateModal, setShowUpdateEmailTemplateModal] = useState(false);
	const [showDeleteEmailTemplateModal, setShowDeleteEmailTemplateModal] = useState(false);
	const [showArchiveEmailTemplateModal, setShowArchiveEmailTemplateModal] =
		useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(emailTemplateSearchParamsSchema);

	const { selectedEmailTemplateIds, ...filters } = data;

	const emailTemplateSelection: Selection =
		!selectedEmailTemplateIds ? new Set()
		: selectedEmailTemplateIds === 'all' ? 'all'
		: new Set(selectedEmailTemplateIds);

	const initialData = use(initialEmailTemplatesFirstPage);
	const {
		data: infiniteEmailTemplates,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = api.emailTemplate.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [
						{
							emailTemplates: initialData.emailTemplates,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [],
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const emailTemplates =
		infiniteEmailTemplates?.pages.flatMap(page => page.emailTemplates) ?? [];

	const gridListRef = useRef<HTMLDivElement>(null);

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
		emailTemplateSelection === 'all' || !emailTemplateSelection ?
			undefined
		:	Array.from(emailTemplateSelection).pop()?.toString();

	const lastSelectedEmailTemplate = emailTemplates.find(
		template => template.id === lastSelectedEmailTemplateId,
	);

	const contextValue = {
		emailTemplates,
		emailTemplateSelection,
		lastSelectedEmailTemplateId,
		lastSelectedEmailTemplate,
		setEmailTemplateSelection,
		gridListRef,
		focusGridList: () => {
			gridListRef.current?.focus();
		},
		showCreateEmailTemplateModal,
		setShowCreateEmailTemplateModal,
		showUpdateEmailTemplateModal,
		setShowUpdateEmailTemplateModal,
		showDeleteEmailTemplateModal,
		setShowDeleteEmailTemplateModal,
		showArchiveEmailTemplateModal,
		setShowArchiveEmailTemplateModal,
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
