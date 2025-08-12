'use client';

import { useCallback, useMemo } from 'react';
import { bioStatFiltersSchema } from '@barely/validators';

import { useFormatTimestamp } from './use-format-timestamp';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';
import { useWorkspace } from './use-workspace';

export function useBioStatFilters() {
	const q = useTypedOptimisticQuery(bioStatFiltersSchema);

	const { handle } = useWorkspace();
	const { formatTimestamp } = useFormatTimestamp(q.data.dateRange);

	const { showViews, showClicks, showEmailCaptures, ...filters } = q.data;

	const toggleShowViews = useCallback(() => {
		if (showViews) return q.setQuery('showViews', false);
		return q.setQuery('showViews', true);
	}, [showViews, q]);

	const toggleShowClicks = useCallback(() => {
		if (showClicks) return q.setQuery('showClicks', false);
		return q.setQuery('showClicks', true);
	}, [showClicks, q]);

	const toggleShowEmailCaptures = useCallback(() => {
		if (showEmailCaptures) return q.setQuery('showEmailCaptures', false);
		return q.setQuery('showEmailCaptures', true);
	}, [showEmailCaptures, q]);

	const badgeFilters = useMemo(() => {
		return Object.entries(filters).filter(
			([key]) => key !== 'assetId' && key !== 'dateRange',
		) as [keyof typeof filters, string][];
	}, [filters]);

	return {
		filters,
		filtersWithHandle: { handle, ...filters },
		getSetFilterPath: q.getSetQueryPath,
		setFilter: q.setQuery,
		removeFilter: q.removeByKey,
		removeAllFilters: q.removeAllQueryParams,
		formatTimestamp,
		badgeFilters,

		uiFilters: {
			showViews,
			showClicks,
			showEmailCaptures,
		},

		toggleShowViews,
		toggleShowClicks,
		toggleShowEmailCaptures,
	};
}
