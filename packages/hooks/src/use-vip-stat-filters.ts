'use client';

import { useMemo } from 'react';
import { vipStatFiltersSchema } from '@barely/validators';

import { useFormatTimestamp } from './use-format-timestamp';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';
import { useWorkspace } from './use-workspace';

export function useVipStatFilters() {
	const q = useTypedOptimisticQuery(vipStatFiltersSchema);

	const { handle } = useWorkspace();

	// Ensure we have at least the dateRange default
	const filters = useMemo(() => {
		const baseFilters = { ...q.data };
		// If filters are completely empty, provide minimal defaults
		if (Object.keys(baseFilters).length === 0) {
			return { dateRange: '1w' as const, ...baseFilters };
		}
		return baseFilters;
	}, [q.data]);

	const { formatTimestamp } = useFormatTimestamp(filters.dateRange);

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
	};
}
