import { useMemo } from 'react';

import { stdWebEventPipeQueryParamsSchema } from '../server/routes/stat/stat.schema';
import { useFormatTimestamp } from './use-format-timestamp';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';
import { useWorkspace } from './use-workspace';

export function useLinkStatFilters() {
	const q = useTypedOptimisticQuery(stdWebEventPipeQueryParamsSchema);

	const { handle } = useWorkspace();
	const { formatTimestamp } = useFormatTimestamp(q.data.dateRange);

	const { showVisits, showClicks, ...filters } = q.data;

	const badgeFilters = useMemo(() => {
		return Object.entries(filters).filter(
			([key, value]) => value !== undefined && key !== 'assetId' && key !== 'dateRange',
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
