import type { FetchNextPageOptions } from '@tanstack/react-query';
import type { Selection } from 'react-aria-components';

export interface InfiniteItemsContext<T, F> {
	items: T[];
	selection: Selection;
	lastSelectedItemId?: string;
	lastSelectedItem?: T;
	setSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateModal: boolean;
	setShowCreateModal: (show: boolean) => void;
	showUpdateModal: boolean;
	setShowUpdateModal: (show: boolean) => void;
	showArchiveModal: boolean;
	setShowArchiveModal: (show: boolean) => void;
	showDeleteModal: boolean;
	setShowDeleteModal: (show: boolean) => void;
	filters: F;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
	hasNextPage?: boolean;
	fetchNextPage: (options?: FetchNextPageOptions) => void | Promise<void>;
	isFetchingNextPage: boolean;
	isFetching: boolean;
	isRefetching: boolean;
	isPending: boolean;
	groupByAlbum?: boolean;
	toggleGroupByAlbum?: () => void;
}
