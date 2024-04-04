'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { FileRecord } from '@barely/lib/server/routes/file/file.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
import {
	createContext,
	useContext,
	useOptimistic,
	useRef,
	useState,
	useTransition,
} from 'react';
import { useFiles } from '@barely/lib/hooks/use-files';
import { useTypedQuery } from '@barely/lib/hooks/use-typed-query';
import { fileSearchParamsSchema } from '@barely/lib/server/routes/file/file.schema';
import { wait } from '@barely/lib/utils/wait';

interface MediaContext {
	files: AppRouterOutputs['file']['byWorkspace']['files'];
	// infinite
	hasMoreFiles: boolean;
	fetchMoreFiles: () => void;
	// selection
	fileSelection: Selection;
	lastSelectedFileId: string | undefined;
	lastSelectedFile: FileRecord | undefined;
	setFileSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showUploadMediaModal: boolean;
	setShowUploadMediaModal: (show: boolean) => void;
	showUpdateFileModal: boolean;
	setShowUpdateFileModal: (show: boolean) => void;
	showArchiveFileModal: boolean;
	setShowArchiveFileModal: (show: boolean) => void;
	showDeleteFileModal: boolean;
	setShowDeleteFileModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof fileSearchParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
}

const MediaContext = createContext<MediaContext | undefined>(undefined);

export function MediaContextProvider({
	children,
	//   initialFiles,
	filters,
	selectedFileIds,
}: {
	children: React.ReactNode;
	//   initialFiles: EdgeRouterOutputs["file"]["byWorkspace"];
	filters: z.infer<typeof fileSearchParamsSchema>;
	selectedFileIds: z.infer<typeof fileSearchParamsSchema>['selectedFileIds'];
}) {
	const gridListRef = useRef<HTMLDivElement>(null);

	const [showCreateFileModal, setShowCreateFileModal] = useState(false);
	const [showUpdateFileModal, setShowUpdateFileModal] = useState(false);
	const [showArchiveFileModal, setShowArchiveFileModal] = useState(false);
	const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);

	const { files, hasMoreFiles, fetchMoreFiles } = useFiles({ ...filters });

	const { data, setQuery, removeByKey, removeAllQueryParams } =
		useTypedQuery(fileSearchParamsSchema);

	/* selection */
	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(selectedFileIds),
	);
	const [, startSelectTransition] = useTransition();

	function setFileSelection(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);
			if (selection === 'all') return;

			if (selection.size === 0) {
				return removeByKey('selectedFileIds');
			}

			return setQuery(
				'selectedFileIds',
				Array.from(selection).map(key => key.toString()),
			);
		});
	}

	/* filters */
	const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters);
	const [pendingFiltersTransition, startFiltersTransition] = useTransition();
	// clear all filters
	function clearAllFilters() {
		startFiltersTransition(() => {
			setOptimisticSelection(new Set());
			removeAllQueryParams();
		});
	}
	// toggle archived
	function toggleArchived() {
		startFiltersTransition(() => {
			if (data.showArchived) {
				setOptimisticFilters({ ...optimisticFilters, showArchived: false });
				removeByKey('showArchived');
				return;
			} else {
				setOptimisticFilters({ ...optimisticFilters, showArchived: true });
				setQuery('showArchived', true);
				return;
			}
		});
	}
	// search
	function setSearch(search: string) {
		startFiltersTransition(() => {
			if (search.length) {
				setOptimisticFilters({ ...optimisticFilters, search });
				setQuery('search', search);
			} else {
				setOptimisticFilters({ ...optimisticFilters });
				removeByKey('search');
			}
		});
	}

	/* last selected */
	const lastSelectedFileId =
		optimisticSelection === 'all'
			? undefined
			: Array.from(optimisticSelection).pop()?.toString();

	const lastSelectedFile = files.find(f => f.id === lastSelectedFileId);

	const contextValue = {
		files,
		fileSelection: optimisticSelection,
		hasMoreFiles,
		fetchMoreFiles: () => {
			fetchMoreFiles().catch(e => console.error(e));
		},
		lastSelectedFileId,
		lastSelectedFile,
		setFileSelection,
		gridListRef,
		focusGridList: () => {
			wait(1)
				.then(() => {
					gridListRef.current?.focus();
				})
				.catch(e => {
					console.error(e);
				});
		}, // fixme: this is a workaround for focus not working on modal closing,
		showUploadMediaModal: showCreateFileModal,
		setShowUploadMediaModal: setShowCreateFileModal,
		showUpdateFileModal,
		setShowUpdateFileModal,
		showArchiveFileModal,
		setShowArchiveFileModal,
		showDeleteFileModal,
		setShowDeleteFileModal,
		// filters
		filters: optimisticFilters,
		pendingFiltersTransition,
		setSearch,
		toggleArchived,
		clearAllFilters,
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
