'use client';

import { useCallback, useMemo } from 'react';
import { trackStatFiltersSchema } from '@barely/validators';

import { useFormatTimestamp } from './use-format-timestamp';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';
import { useWorkspace } from './use-workspace';

export function useTrackStatFilters() {
	const q = useTypedOptimisticQuery(trackStatFiltersSchema);

	const { handle } = useWorkspace();
	const { formatTimestamp } = useFormatTimestamp(q.data.dateRange);

	const { showPopularity, ...filters } = q.data;

	const toggleShowPopularity = useCallback(() => {
		if (showPopularity) return q.setQuery('showPopularity', false);
		return q.setQuery('showPopularity', true);
	}, [showPopularity, q]);

	const badgeFilters = useMemo(() => {
		return Object.entries(filters).filter(
			([key]) => key !== 'trackId' && key !== 'dateRange',
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
			showPopularity,
		},

		toggleShowPopularity,
	};
}
