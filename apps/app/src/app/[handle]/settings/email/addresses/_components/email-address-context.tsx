'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { emailAddressFilterParamsSchema } from '@barely/lib/server/routes/email-address/email-address.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, use, useCallback, useContext, useRef, useState } from 'react';
import { useTypedOptimisticQuery } from '@barely/lib/hooks/use-typed-optimistic-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { emailAddressSearchParamsSchema } from '@barely/lib/server/routes/email-address/email-address.schema';

interface EmailAddressContext {
	emailAddresses: AppRouterOutputs['emailAddress']['byWorkspace']['emailAddresses'];
	emailAddressSelection: Selection;
	lastSelectedEmailAddressId: string | undefined;
	lastSelectedEmailAddress:
		| AppRouterOutputs['emailAddress']['byWorkspace']['emailAddresses'][number]
		| undefined;
	setEmailAddressSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateEmailAddressModal: boolean;
	setShowCreateEmailAddressModal: (show: boolean) => void;

	showUpdateEmailAddressModal: boolean;
	setShowUpdateEmailAddressModal: (show: boolean) => void;
	showArchiveEmailAddressModal: boolean;
	setShowArchiveEmailAddressModal: (show: boolean) => void;
	showDeleteEmailAddressModal: boolean;
	setShowDeleteEmailAddressModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof emailAddressFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
}

const EmailAddressContext = createContext<EmailAddressContext | undefined>(undefined);

export function EmailAddressContextProvider({
	children,
	initialEmailAddresses,
}: {
	children: React.ReactNode;
	initialEmailAddresses: Promise<AppRouterOutputs['emailAddress']['byWorkspace']>;
}) {
	const [showCreateEmailAddressModal, setShowCreateEmailAddressModal] = useState(false);
	const [showUpdateEmailAddressModal, setShowUpdateEmailAddressModal] = useState(false);
	const [showArchiveEmailAddressModal, setShowArchiveEmailAddressModal] = useState(false);
	const [showDeleteEmailAddressModal, setShowDeleteEmailAddressModal] = useState(false);

	const { handle } = useWorkspace();

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(emailAddressSearchParamsSchema);

	const { selectedEmailAddressIds, ...filters } = data;

	const emailAddressSelection: Selection =
		!selectedEmailAddressIds ? new Set()
		: selectedEmailAddressIds === 'all' ? 'all'
		: new Set(selectedEmailAddressIds);

	const initialData = use(initialEmailAddresses);
	const { data: infiniteEmailAddresses } = api.emailAddress.byWorkspace.useInfiniteQuery(
		{ handle, ...filters },
		{
			initialData: () => {
				return {
					pages: [
						{
							emailAddresses: initialData.emailAddresses,
							nextCursor: initialData.nextCursor,
						},
					],
					pageParams: [],
				};
			},
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const emailAddresses =
		infiniteEmailAddresses?.pages.flatMap(page => page.emailAddresses) ?? [];

	const gridListRef = useRef<HTMLDivElement>(null);

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
			if (search.length) {
				setQuery('search', search);
			} else {
				removeByKey('search');
			}
		},
		[setQuery, removeByKey],
	);

	const lastSelectedEmailAddressId =
		emailAddressSelection === 'all' || !emailAddressSelection ?
			undefined
		:	Array.from(emailAddressSelection).pop()?.toString();

	const lastSelectedEmailAddress = emailAddresses.find(
		emailAddress => emailAddress.id === lastSelectedEmailAddressId,
	);

	const contextValue = {
		emailAddresses,
		emailAddressSelection,
		lastSelectedEmailAddressId,
		lastSelectedEmailAddress,
		setEmailAddressSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showCreateEmailAddressModal,
		setShowCreateEmailAddressModal,
		showUpdateEmailAddressModal,
		setShowUpdateEmailAddressModal,
		showArchiveEmailAddressModal,
		setShowArchiveEmailAddressModal,
		showDeleteEmailAddressModal,
		setShowDeleteEmailAddressModal,
		// filters
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		toggleArchived,
		clearAllFilters,
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
