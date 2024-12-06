import { useCallback, useMemo } from 'react';

import { stdWebEventPipeQueryParamsSchema } from '../server/routes/stat/stat.schema';
// import { useTypedQuery } from './use-typed-query';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';
import { useWorkspace } from './use-workspace';

export function useWebEventStatFilters() {
	const q = useTypedOptimisticQuery(stdWebEventPipeQueryParamsSchema);

	const { handle } = useWorkspace();

	const formatTimestamp = useCallback(
		(d: Date) => {
			switch (q.data.dateRange) {
				case '1d':
					return new Date(d).toLocaleDateString('en-us', {
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						timeZone: 'America/New_York',
					});
				default:
					return new Date(d).toLocaleDateString('en-us', {
						month: 'short',
						day: 'numeric',
					});
			}
		},

		[q.data.dateRange],
	);

	const badgeFilters = useMemo(() => {
		return Object.entries(q.data).filter(
			([key, value]) => value !== undefined && key !== 'assetId' && key !== 'dateRange',
		) as [keyof typeof q.data, string][];
	}, [q.data]);

	return {
		filters: { ...q.data },
		filtersWithHandle: { handle, ...q.data },
		getSetFilterPath: q.getSetQueryPath,
		setFilter: q.setQuery,
		removeFilter: q.removeByKey,
		removeAllFilters: q.removeAllQueryParams,
		formatTimestamp,
		badgeFilters,
	};
}
