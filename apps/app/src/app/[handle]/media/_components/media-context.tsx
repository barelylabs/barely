'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useFiles, useTypedOptimisticQuery } from '@barely/hooks';
import { fileSearchParamsSchema } from '@barely/validators';

import type { InfiniteItemsContext } from '~/app/[handle]/_types/all-items-context';

type MediaContext = InfiniteItemsContext<
	AppRouterOutputs['file']['byWorkspace']['files'][number],
	z.infer<typeof fileSearchParamsSchema>
>;

const MediaContext = createContext<MediaContext | undefined>(undefined);

export function MediaContextProvider({
	children,
	//   initialFiles,
	// filters,
	// selectedFileIds,
}: {
	children: React.ReactNode;
	//   initialFiles: EdgeRouterOutputs["file"]["byWorkspace"];
	// filters: z.infer<typeof fileSearchParamsSchema>;
	// selectedFileIds: z.infer<typeof fileSearchParamsSchema>['selectedFileIds'];
}) {
	const gridListRef = useRef<HTMLDivElement>(null);

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { data, setQuery, removeByKey, removeAllQueryParams, pending } =
		useTypedOptimisticQuery(fileSearchParamsSchema);

	const { selectedFileIds, ...filters } = data;

	const {
		files,
		hasMoreFiles,
		fetchMoreFiles,
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} = useFiles({ ...filters });

	// /* selection */
	// const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
	// 	new Set(selectedFileIds),
	// );
	// const [, startSelectTransition] = useTransition();

	const fileSelection: Selection =
		!selectedFileIds ? new Set()
		: selectedFileIds === 'all' ? 'all'
		: new Set(selectedFileIds);

	const setFileSelection = useCallback(
		(selection: Selection) => {
			if (selection === 'all') return;
			if (selection.size === 0) return removeByKey('selectedFileIds');
			return setQuery(
				'selectedFileIds',
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
	}, [data.showArchived, removeByKey, setQuery]);

	const setSearch = useCallback(
		(search: string) => {
			if (search.length) return setQuery('search', search);
			return removeByKey('search');
		},
		[setQuery, removeByKey],
	);

	/* last selected */
	const lastSelectedFileId =
		fileSelection === 'all' || !fileSelection.size ?
			undefined
		:	Array.from(fileSelection).pop()?.toString();

	const lastSelectedFile = files.find(f => f.id === lastSelectedFileId);

	const contextValue = {
		items: files,
		selection: fileSelection,
		lastSelectedItemId: lastSelectedFileId,
		lastSelectedItem: lastSelectedFile,
		setSelection: setFileSelection,
		gridListRef,
		focusGridList: () => {
			fetchMoreFiles().catch(e => console.error(e));
		},
		showCreateModal,
		setShowCreateModal,
		showUpdateModal,
		setShowUpdateModal,
		showArchiveModal,
		setShowArchiveModal,
		showDeleteModal,
		setShowDeleteModal,

		// showUploadMediaModal: showCreateFileModal,
		// setShowUploadMediaModal: setShowCreateFileModal,

		// filters
		filters,
		pendingFiltersTransition: pending,
		setSearch,
		toggleArchived,
		clearAllFilters,

		// infinite
		hasNextPage: hasMoreFiles,
		fetchNextPage: () => void fetchMoreFiles(),
		isFetchingNextPage,
		isFetching,
		isRefetching,
		isPending,
	} satisfies MediaContext;

	return <MediaContext.Provider value={contextValue}>{children}</MediaContext.Provider>;
}

export function useMediaContext() {
	const context = useContext(MediaContext);
	if (!context) {
		throw new Error('useFileContext must be used within a FileContextProvider');
	}
	return context;
}
