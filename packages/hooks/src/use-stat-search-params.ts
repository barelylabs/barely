'use client';

import type { StatDateRange } from '@barely/validators';
import type { Selection } from 'react-aria-components';
import { useCallback } from 'react';
import { querySelectionSchema } from '@barely/validators/helpers';
import {
	parseAsBoolean,
	parseAsJson,
	parseAsString,
	parseAsStringEnum,
	useQueryStates,
} from 'nuqs';

import type {
	ActionBuilder,
	InferActions,
	InferParsers,
	ParserConfig,
} from './resource-hooks.types';
import { action } from './resource-hooks.types';

// Base stat filters that all stat pages share
export interface BaseStatFilters {
	selectedIds: string[] | 'all' | null;
	dateRange?: StatDateRange;
	start?: string;
	end?: string;
}

// Return type for stat search params hooks
export interface StatSearchParamsReturn<TFilters extends BaseStatFilters> {
	filters: TFilters;
	selectedIds: string[] | 'all' | null;
	selection: Selection;
	setSelection: (selection: Selection) => Promise<URLSearchParams> | undefined;
	addToSelection: (id: string) => Promise<URLSearchParams> | undefined;
	removeFromSelection: (id: string) => Promise<URLSearchParams> | undefined;
	clearSelection: () => Promise<URLSearchParams>;
	setDateRange: (dateRange: StatDateRange) => Promise<URLSearchParams>;
	setCustomDateRange: (start: string, end: string) => Promise<URLSearchParams>;
	clearDateRange: () => Promise<URLSearchParams>;
}

// Configuration for creating a stat search params hook
export interface StatSearchParamsConfig<
	TParsers extends ParserConfig = Record<string, never>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TActions extends Record<string, ActionBuilder<any, any>> = Record<string, never>,
> {
	// Additional nuqs parsers for stat-specific filters (like metric toggles)
	additionalParsers?: TParsers;
	// Additional actions for stat-specific operations
	additionalActions?: TActions;
}

/**
 * Factory function to create a stat-specific search params hook
 * that manages state via URL parameters (via nuqs)
 */
export function createStatSearchParamsHook<
	TParsers extends ParserConfig = Record<string, never>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TActions extends Record<string, ActionBuilder<any, any>> = Record<string, never>,
>(config?: StatSearchParamsConfig<TParsers, TActions>) {
	type Filters = BaseStatFilters & InferParsers<TParsers>;
	type Actions = InferActions<TActions>;

	return function useStatSearchParams(): StatSearchParamsReturn<Filters> & Actions {
		// URL state management with nuqs
		const [params, setParams] = useQueryStates({
			selectedIds: parseAsJson(v => querySelectionSchema.optional().parse(v)),
			dateRange: parseAsStringEnum<StatDateRange>(['1d', '1w', '28d', '1y']).withDefault(
				'28d',
			),
			start: parseAsString,
			end: parseAsString,
			...config?.additionalParsers,
		});

		const { selectedIds, ...filters } = params;

		// Convert selectedIds to Selection type for React Aria compatibility
		const selection: Selection =
			!params.selectedIds ? new Set()
			: params.selectedIds === 'all' ? 'all'
			: new Set(params.selectedIds);

		// Selection setter that syncs with URL
		const setSelection = useCallback(
			(selection: Selection) => {
				if (selection === 'all') return;
				if (selection.size === 0) return setParams({ selectedIds: null });
				return setParams({
					selectedIds: Array.from(selection).map(key => key.toString()),
				});
			},
			[setParams],
		);

		// Add a single ID to the current selection
		const addToSelection = useCallback(
			(id: string) => {
				if (params.selectedIds === 'all') return;
				const currentIds = params.selectedIds ?? [];
				if (currentIds.includes(id)) return;
				return setParams({
					selectedIds: [...currentIds, id],
				});
			},
			[params.selectedIds, setParams],
		);

		// Remove a single ID from the current selection
		const removeFromSelection = useCallback(
			(id: string) => {
				if (params.selectedIds === 'all' || !params.selectedIds) return;
				const newIds = params.selectedIds.filter(selectedId => selectedId !== id);
				return setParams({
					selectedIds: newIds.length > 0 ? newIds : null,
				});
			},
			[params.selectedIds, setParams],
		);

		// Clear all selections
		const clearSelection = useCallback(() => {
			return setParams({ selectedIds: null });
		}, [setParams]);

		// Date range setters
		const setDateRange = useCallback(
			(dateRange: StatDateRange) => {
				// Clear custom dates when setting preset range
				return setParams({ dateRange, start: null, end: null });
			},
			[setParams],
		);

		const setCustomDateRange = useCallback(
			(start: string, end: string) => {
				// Clear preset range when setting custom dates
				return setParams({ dateRange: null, start, end });
			},
			[setParams],
		);

		const clearDateRange = useCallback(() => {
			return setParams({ dateRange: null, start: null, end: null });
		}, [setParams]);

		// Process additional actions if provided
		const additionalActions =
			config?.additionalActions ?
				Object.entries(config.additionalActions).reduce<Record<string, unknown>>(
					(acc, [key, actionBuilder]) => {
						acc[key] = actionBuilder.build(setParams);
						return acc;
					},
					{},
				)
			:	{};

		const result = {
			// State
			filters: filters as Filters,
			selectedIds: selectedIds ?? null,
			selection,

			// Actions
			setSelection,
			addToSelection,
			removeFromSelection,
			clearSelection,
			setDateRange,
			setCustomDateRange,
			clearDateRange,

			// Additional actions from config
			...additionalActions,
		};

		return result as StatSearchParamsReturn<Filters> & Actions;
	};
}

/**
 * Hook for track stats search params
 */
export const useTrackStatSearchParams = createStatSearchParamsHook({
	additionalParsers: {
		showPopularity: parseAsBoolean.withDefault(true),
	},
	additionalActions: {
		toggleShowPopularity: action(setParams =>
			setParams(prev => ({ showPopularity: !prev.showPopularity })),
		),
	},
});

/**
 * Hook for FM stats search params
 */
export const useFmStatSearchParams = createStatSearchParamsHook({
	additionalParsers: {
		showVisits: parseAsBoolean.withDefault(true),
		showClicks: parseAsBoolean.withDefault(true),
		showSpotify: parseAsBoolean.withDefault(false),
		showAppleMusic: parseAsBoolean.withDefault(false),
		showYoutube: parseAsBoolean.withDefault(false),
		showAmazonMusic: parseAsBoolean.withDefault(false),
		showYoutubeMusic: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		toggleShowVisits: action(setParams =>
			setParams(prev => ({ showVisits: !prev.showVisits })),
		),
		toggleShowClicks: action(setParams =>
			setParams(prev => ({ showClicks: !prev.showClicks })),
		),
		toggleShowSpotify: action(setParams =>
			setParams(prev => ({ showSpotify: !prev.showSpotify })),
		),
		toggleShowAppleMusic: action(setParams =>
			setParams(prev => ({ showAppleMusic: !prev.showAppleMusic })),
		),
		toggleShowYoutube: action(setParams =>
			setParams(prev => ({ showYoutube: !prev.showYoutube })),
		),
		toggleShowAmazonMusic: action(setParams =>
			setParams(prev => ({ showAmazonMusic: !prev.showAmazonMusic })),
		),
		toggleShowYoutubeMusic: action(setParams =>
			setParams(prev => ({ showYoutubeMusic: !prev.showYoutubeMusic })),
		),
	},
});

/**
 * Hook for Link stats search params
 */
export const useLinkStatSearchParams = createStatSearchParamsHook({
	additionalParsers: {
		showVisits: parseAsBoolean.withDefault(true),
		showClicks: parseAsBoolean.withDefault(true),
	},
	additionalActions: {
		toggleShowVisits: action(setParams =>
			setParams(prev => ({ showVisits: !prev.showVisits })),
		),
		toggleShowClicks: action(setParams =>
			setParams(prev => ({ showClicks: !prev.showClicks })),
		),
	},
});

/**
 * Hook for Page stats search params
 */
export const usePageStatSearchParams = createStatSearchParamsHook({
	additionalParsers: {
		showVisits: parseAsBoolean.withDefault(true),
		showClicks: parseAsBoolean.withDefault(true),
		showEmailAdds: parseAsBoolean.withDefault(false),
		showShippingInfoAdds: parseAsBoolean.withDefault(false),
		showPaymentInfoAdds: parseAsBoolean.withDefault(false),
		showMainWithoutBumpPurchases: parseAsBoolean.withDefault(false),
		showMainWithBumpPurchases: parseAsBoolean.withDefault(false),
		showUpsellPurchases: parseAsBoolean.withDefault(false),
		showUpsellDeclines: parseAsBoolean.withDefault(false),
		showPurchases: parseAsBoolean.withDefault(false),
		showGrossSales: parseAsBoolean.withDefault(false),
		showProductSales: parseAsBoolean.withDefault(false),
		showNetSales: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		toggleShowVisits: action(setParams =>
			setParams(prev => ({ showVisits: !prev.showVisits })),
		),
		toggleShowClicks: action(setParams =>
			setParams(prev => ({ showClicks: !prev.showClicks })),
		),
		toggleShowEmailAdds: action(setParams =>
			setParams(prev => ({ showEmailAdds: !prev.showEmailAdds })),
		),
		toggleShowShippingInfoAdds: action(setParams =>
			setParams(prev => ({ showShippingInfoAdds: !prev.showShippingInfoAdds })),
		),
		toggleShowPaymentInfoAdds: action(setParams =>
			setParams(prev => ({ showPaymentInfoAdds: !prev.showPaymentInfoAdds })),
		),
		toggleShowMainWithoutBumpPurchases: action(setParams =>
			setParams(prev => ({
				showMainWithoutBumpPurchases: !prev.showMainWithoutBumpPurchases,
			})),
		),
		toggleShowMainWithBumpPurchases: action(setParams =>
			setParams(prev => ({ showMainWithBumpPurchases: !prev.showMainWithBumpPurchases })),
		),
		toggleShowUpsellPurchases: action(setParams =>
			setParams(prev => ({ showUpsellPurchases: !prev.showUpsellPurchases })),
		),
		toggleShowUpsellDeclines: action(setParams =>
			setParams(prev => ({ showUpsellDeclines: !prev.showUpsellDeclines })),
		),
		toggleShowPurchases: action(setParams =>
			setParams(prev => ({ showPurchases: !prev.showPurchases })),
		),
		toggleShowGrossSales: action(setParams =>
			setParams(prev => ({ showGrossSales: !prev.showGrossSales })),
		),
		toggleShowProductSales: action(setParams =>
			setParams(prev => ({ showProductSales: !prev.showProductSales })),
		),
		toggleShowNetSales: action(setParams =>
			setParams(prev => ({ showNetSales: !prev.showNetSales })),
		),
	},
});

/**
 * Hook for Cart stats search params
 */
export const useCartStatSearchParams = createStatSearchParamsHook({
	additionalParsers: {
		showVisits: parseAsBoolean.withDefault(true),
		showClicks: parseAsBoolean.withDefault(true),
		showEmailAdds: parseAsBoolean.withDefault(true),
		showShippingInfoAdds: parseAsBoolean.withDefault(true),
		showPaymentInfoAdds: parseAsBoolean.withDefault(true),
		showMainWithoutBumpPurchases: parseAsBoolean.withDefault(true),
		showMainWithBumpPurchases: parseAsBoolean.withDefault(true),
		showUpsellPurchases: parseAsBoolean.withDefault(false),
		showUpsellDeclines: parseAsBoolean.withDefault(false),
		showPurchases: parseAsBoolean.withDefault(false),
		showGrossSales: parseAsBoolean.withDefault(false),
		showProductSales: parseAsBoolean.withDefault(false),
		showNetSales: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		toggleShowVisits: action(setParams =>
			setParams(prev => ({ showVisits: !prev.showVisits })),
		),
		toggleShowClicks: action(setParams =>
			setParams(prev => ({ showClicks: !prev.showClicks })),
		),
		toggleShowEmailAdds: action(setParams =>
			setParams(prev => ({ showEmailAdds: !prev.showEmailAdds })),
		),
		toggleShowShippingInfoAdds: action(setParams =>
			setParams(prev => ({ showShippingInfoAdds: !prev.showShippingInfoAdds })),
		),
		toggleShowPaymentInfoAdds: action(setParams =>
			setParams(prev => ({ showPaymentInfoAdds: !prev.showPaymentInfoAdds })),
		),
		toggleShowMainWithoutBumpPurchases: action(setParams =>
			setParams(prev => ({
				showMainWithoutBumpPurchases: !prev.showMainWithoutBumpPurchases,
			})),
		),
		toggleShowMainWithBumpPurchases: action(setParams =>
			setParams(prev => ({ showMainWithBumpPurchases: !prev.showMainWithBumpPurchases })),
		),
		toggleShowUpsellPurchases: action(setParams =>
			setParams(prev => ({ showUpsellPurchases: !prev.showUpsellPurchases })),
		),
		toggleShowUpsellDeclines: action(setParams =>
			setParams(prev => ({ showUpsellDeclines: !prev.showUpsellDeclines })),
		),
		toggleShowPurchases: action(setParams =>
			setParams(prev => ({ showPurchases: !prev.showPurchases })),
		),
		toggleShowGrossSales: action(setParams =>
			setParams(prev => ({ showGrossSales: !prev.showGrossSales })),
		),
		toggleShowProductSales: action(setParams =>
			setParams(prev => ({ showProductSales: !prev.showProductSales })),
		),
		toggleShowNetSales: action(setParams =>
			setParams(prev => ({ showNetSales: !prev.showNetSales })),
		),
	},
});
