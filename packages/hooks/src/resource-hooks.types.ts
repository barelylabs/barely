import type { InfiniteData } from '@tanstack/react-query';
import type { Parser, ParserBuilder } from 'nuqs';
import type { Selection } from 'react-aria-components';

// Type utilities for parser inference
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ParserConfig = Record<string, Parser<any> | ParserBuilder<any>>;

// Extract the parsed type from a parser
export type InferParserType<T> =
	T extends Parser<infer V> ? V
	: T extends ParserBuilder<infer V> ? V
	: never;

// Extract all parsed types from a parser config
export type InferParsers<T extends ParserConfig> = {
	[K in keyof T]: InferParserType<T[K]>;
};

// Type for setParams function from nuqs
export type SetParamsFunction = (
	values:
		| Partial<Record<string, unknown>>
		| ((old: Record<string, unknown>) => Partial<Record<string, unknown>>),
) => Promise<URLSearchParams>;

// Action builder for type-safe action creation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ActionBuilder<TArgs extends any[], TReturn> {
	constructor(
		private handler: (setParams: SetParamsFunction, ...args: TArgs) => TReturn,
	) {}

	build(setParams: SetParamsFunction): (...args: TArgs) => TReturn {
		return (...args) => this.handler(setParams, ...args);
	}
}

// Helper function to create action builders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function action<TArgs extends any[], TReturn>(
	handler: (setParams: SetParamsFunction, ...args: TArgs) => TReturn,
): ActionBuilder<TArgs, TReturn> {
	return new ActionBuilder(handler);
}

// Extract action types from action builders
export type InferActions<T> =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends Record<string, ActionBuilder<any, any>> ?
		{
			[K in keyof T]: T[K] extends ActionBuilder<infer TArgs, infer TReturn> ?
				(...args: TArgs) => TReturn
			:	never;
		}
	:	Record<string, never>;

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

// Configuration for creating a search params hook
export interface ResourceSearchParamsConfig<
	TParsers extends ParserConfig = Record<string, never>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TActions extends Record<string, ActionBuilder<any, any>> = Record<string, never>,
> {
	// Additional nuqs parsers for resource-specific filters
	additionalParsers?: TParsers;
	// Additional actions for resource-specific filters using ActionBuilder
	additionalActions?: TActions;
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
	// UI refs
	gridListRef: React.RefObject<HTMLDivElement | null>;
	focusGridList: () => void;
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

// Helper to ensure query options type compatibility
// This is now just a passthrough since tRPC already returns compatible types
export function wrapQueryOptions<T>(options: T): T {
	return options;
}
