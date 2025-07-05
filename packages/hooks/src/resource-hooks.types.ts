import type { InfiniteData } from '@tanstack/react-query';
import type { Selection } from 'react-aria-components';

// Base filter types that all resources share
export interface BaseResourceFilters {
	search: string;
	showArchived: boolean;
	showDeleted: boolean;
}

// Modal state that all resources share
export interface ResourceModalState {
	showCreateModal: boolean;
	setShowCreateModal: (show: boolean) => Promise<URLSearchParams> | undefined;
	showUpdateModal: boolean;
	setShowUpdateModal: (show: boolean) => Promise<URLSearchParams> | undefined;
	showArchiveModal: boolean;
	setShowArchiveModal: (show: boolean) => Promise<URLSearchParams> | undefined;
	showDeleteModal: boolean;
	setShowDeleteModal: (show: boolean) => Promise<URLSearchParams> | undefined;
}

// Return type for search params hooks
export interface ResourceSearchParamsReturn<TFilters extends BaseResourceFilters>
	extends ResourceModalState {
	filters: TFilters;
	selectedIds: string[] | 'all' | null;
	selection: Selection;
	setSelection: (selection: Selection) => Promise<URLSearchParams> | undefined;
	clearAllFilters: () => Promise<URLSearchParams>;
	setSearch: (search: string) => Promise<URLSearchParams>;
	toggleArchived: () => Promise<URLSearchParams>;
	toggleDeleted: () => Promise<URLSearchParams>;
}

// Type for setParams function from nuqs
type SetParamsFunction = (
	values: Partial<Record<string, unknown>> | ((old: Record<string, unknown>) => Partial<Record<string, unknown>>)
) => Promise<URLSearchParams>;

// Configuration for creating a search params hook
export interface ResourceSearchParamsConfig<_TFilters extends BaseResourceFilters = BaseResourceFilters> {
	// Additional nuqs parsers for resource-specific filters
	// Using the actual nuqs parser types
	additionalParsers?: Record<string, unknown>;
	// Additional actions for resource-specific filters
	// Each action is a function that receives setParams and returns the actual action function
	additionalActions?: Record<string, (setParams: SetParamsFunction) => (...args: unknown[]) => Promise<URLSearchParams> | undefined>;
}

// Return type for data hooks
export interface ResourceDataReturn<TItem extends { id: string }, TFilters> {
	items: TItem[];
	selection: Selection;
	lastSelectedItemId: string | undefined;
	lastSelectedItem: TItem | undefined;
	filters: TFilters;
	setSelection: (selection: Selection) => Promise<URLSearchParams> | undefined;
	hasNextPage: boolean;
	fetchNextPage: () => void;
	isFetchingNextPage: boolean;
	isFetching: boolean;
	isRefetching: boolean;
	isPending: boolean;
}

// Configuration for creating a data hook
export interface ResourceDataConfig<TItem extends { id: string }, TPageData> {
	// Name of the resource (used for data attributes, etc.)
	resourceName: string;
	// Function to get query options for the resource
	// Returns the actual query options from tRPC or other sources
	getQueryOptions: (handle: string, filters: Record<string, unknown>) => unknown;
	// Function to extract items from paginated data
	getItemsFromPages: (pages: TPageData[]) => TItem[];
}

// Utility type for extracting page data from infinite query result
export type ExtractPageData<T> = T extends InfiniteData<infer P> ? P : never;
