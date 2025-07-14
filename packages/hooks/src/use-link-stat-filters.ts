'use client';

import { useMemo } from 'react';
import { linkStatFiltersSchema } from '@barely/validators';

import { useFormatTimestamp } from './use-format-timestamp';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';
import { useWorkspace } from './use-workspace';

export function useLinkStatFilters() {
	const q = useTypedOptimisticQuery(linkStatFiltersSchema);

	const { handle } = useWorkspace();
	const { formatTimestamp } = useFormatTimestamp(q.data.dateRange);

	const { showVisits, showClicks, ...filters } = q.data;

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
		uiFilters: { showVisits, showClicks },
		formatTimestamp,
		badgeFilters,
	};
}
