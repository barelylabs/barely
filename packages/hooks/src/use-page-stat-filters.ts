'use client';

import { useCallback, useMemo } from 'react';
import { stdWebEventPipeQueryParamsSchema } from '@barely/tb/schema';
import { pageFiltersSchema } from '@barely/validators/helpers';

import { useFormatTimestamp } from './use-format-timestamp';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';
import { useWorkspace } from './use-workspace';

export function usePageStatFilters() {
	const q = useTypedOptimisticQuery(
		stdWebEventPipeQueryParamsSchema.merge(pageFiltersSchema),
	);

	const { handle } = useWorkspace();
	const { formatTimestamp } = useFormatTimestamp(q.data.dateRange);

	const {
		showVisits,
		showClicks,
		showEmailAdds,
		showShippingInfoAdds,
		showPaymentInfoAdds,
		showMainWithoutBumpPurchases,
		showMainWithBumpPurchases,
		showUpsellPurchases,
		showUpsellDeclines,
		showPurchases,
		showGrossSales,
		showProductSales,
		showNetSales,
		...filters
	} = q.data;

	const toggleShowVisits = useCallback(() => {
		if (showVisits) return q.setQuery('showVisits', false);
		return q.setQuery('showVisits', true);
	}, [showVisits, q]);

	const toggleShowClicks = useCallback(() => {
		if (showClicks) return q.setQuery('showClicks', false);
		return q.setQuery('showClicks', true);
	}, [showClicks, q]);

	const toggleShowEmailAdds = useCallback(() => {
		if (showEmailAdds) return q.removeByKey('showEmailAdds');
		return q.setQuery('showEmailAdds', true);
	}, [showEmailAdds, q]);

	const toggleShowShippingInfoAdds = useCallback(() => {
		if (showShippingInfoAdds) return q.removeByKey('showShippingInfoAdds');
		return q.setQuery('showShippingInfoAdds', true);
	}, [showShippingInfoAdds, q]);

	const toggleShowPaymentInfoAdds = useCallback(() => {
		if (showPaymentInfoAdds) return q.removeByKey('showPaymentInfoAdds');
		return q.setQuery('showPaymentInfoAdds', true);
	}, [showPaymentInfoAdds, q]);

	const toggleShowMainWithoutBumpPurchases = useCallback(() => {
		if (showMainWithoutBumpPurchases)
			return q.removeByKey('showMainWithoutBumpPurchases');
		return q.setQuery('showMainWithoutBumpPurchases', true);
	}, [showMainWithoutBumpPurchases, q]);

	const toggleShowMainWithBumpPurchases = useCallback(() => {
		if (showMainWithBumpPurchases) return q.removeByKey('showMainWithBumpPurchases');
		return q.setQuery('showMainWithBumpPurchases', true);
	}, [showMainWithBumpPurchases, q]);

	const toggleShowUpsellPurchases = useCallback(() => {
		if (showUpsellPurchases) return q.removeByKey('showUpsellPurchases');
		return q.setQuery('showUpsellPurchases', true);
	}, [showUpsellPurchases, q]);

	const toggleShowUpsellDeclines = useCallback(() => {
		if (showUpsellDeclines) return q.removeByKey('showUpsellDeclines');
		return q.setQuery('showUpsellDeclines', true);
	}, [showUpsellDeclines, q]);

	const toggleShowPurchases = useCallback(() => {
		if (showPurchases) return q.removeByKey('showPurchases');
		return q.setQuery('showPurchases', true);
	}, [showPurchases, q]);

	const toggleShowGrossSales = useCallback(() => {
		if (showGrossSales) return q.removeByKey('showGrossSales');
		return q.setQuery('showGrossSales', true);
	}, [showGrossSales, q]);

	const toggleShowProductSales = useCallback(() => {
		if (showProductSales) return q.removeByKey('showProductSales');
		return q.setQuery('showProductSales', true);
	}, [showProductSales, q]);

	const toggleShowNetSales = useCallback(() => {
		if (showNetSales) return q.removeByKey('showNetSales');
		return q.setQuery('showNetSales', true);
	}, [showNetSales, q]);

	const badgeFilters = useMemo(() => {
		return Object.entries(filters).filter(
			([key]) => key !== 'assetId' && key !== 'dateRange',
		) as [keyof typeof filters, string][];
	}, [filters]);

	return {
		filters: q.data,
		filtersWithHandle: { handle, ...q.data },
		getSetFilterPath: q.getSetQueryPath,
		setFilter: q.setQuery,
		removeFilter: q.removeByKey,
		removeAllFilters: q.removeAllQueryParams,
		formatTimestamp,
		badgeFilters,

		uiFilters: {
			showVisits,
			showClicks,
			showEmailAdds,
			showShippingInfoAdds,
			showPaymentInfoAdds,
			showMainWithoutBumpPurchases,
			showMainWithBumpPurchases,
			showUpsellPurchases,
			showUpsellDeclines,
			showPurchases,
			showGrossSales,
			showProductSales,
			showNetSales,
		},
		toggleShowVisits,
		toggleShowClicks,
		toggleShowEmailAdds,
		toggleShowShippingInfoAdds,
		toggleShowPaymentInfoAdds,
		toggleShowMainWithoutBumpPurchases,
		toggleShowMainWithBumpPurchases,
		toggleShowUpsellPurchases,
		toggleShowUpsellDeclines,
		toggleShowPurchases,
		toggleShowGrossSales,
		toggleShowProductSales,
		toggleShowNetSales,
	};
}
