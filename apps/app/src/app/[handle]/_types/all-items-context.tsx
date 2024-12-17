'use client';

import type { FetchNextPageOptions } from '@tanstack/react-query';
import type { Selection } from 'react-aria-components';

export interface InfiniteItemsContext<T, P> {
	items: T[];
	selection: Selection;
	lastSelectedItemId: string | undefined;
	lastSelectedItem: T | undefined;
	setSelection: (selection: Selection) => void;

	// ui
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;

	// modals
	showCreateModal: boolean;
	setShowCreateModal: (show: boolean) => void;
	showUpdateModal: boolean;
	setShowUpdateModal: (show: boolean) => void;
	showDeleteModal: boolean;
	setShowDeleteModal: (show: boolean) => void;
	showArchiveModal: boolean;
	setShowArchiveModal: (show: boolean) => void;

	// common filters
	filters: P;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;

	// query
	hasNextPage: boolean;
	fetchNextPage: (options?: FetchNextPageOptions) => void | Promise<void>;
	isFetchingNextPage: boolean;
	isRefetching: boolean;
	isFetching: boolean;
	isPending: boolean;
}

// export function useInfiniteItems<I, P>({
// 	children,
//     initialFirstPage,
//     filterParamsSchema
// }: {
// 	children: React.ReactNode;
//     initialFirstPage: Promise<I>;
//     filterParamsSchema: z.ZodType<P>;
// }) {

//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [showUpdateModal, setShowUpdateModal] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [showArchiveModal, setShowArchiveModal] = useState(false);

//     const {handle} = useWorkspace();

//     const {data, setQuery, removeByKey, removeAllQueryParams, pending} = useTypedOptimisticQuery(filterParamsSchema);

//     const {selectedItemIds, ...filters} = data;

//     const selection: Selection = !selectedItemIds ? new Set() : selectedItemIds === 'all' ? 'all' : new Set(selectedItemIds);

//     const initialData = use(initialFirstPage);

//     const {
//         data: infiniteItems,
//         hasNextPage,
//         fetchNextPage,
//         isFetchingNextPage,
//         isRefetching,
//         isFetching,
//         isPending
//     } = api.emailTemplate.byWorkspace.useInfiniteQuery(
//         {handle, ...filters},
//         {
//             initialPageParam: initialData
//         }
//     )

// 	return {children};
// }
