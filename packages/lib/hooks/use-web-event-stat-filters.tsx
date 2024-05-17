import { useCallback, useMemo } from 'react';

import { stdWebEventPipeQueryParamsSchema } from '../server/routes/stat/stat.schema';
import { useTypedQuery } from './use-typed-query';

export function useWebEventStatFilters() {
	const q = useTypedQuery(stdWebEventPipeQueryParamsSchema);

	const formatTimestamp = useCallback(
		(d: Date) => {
			switch (q.data.dateRange) {
				// case '1h':
				// 	return new Date(d).toLocaleDateString('en-us', {
				// 		hour: 'numeric',
				// 		minute: 'numeric',
				// 	});
				case '1d':
					return new Date(d).toLocaleDateString('en-us', {
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
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
		filters: q.data,
		getSetFilterPath: q.getSetQueryPath,
		setFilter: q.setQuery,
		getRemoveByKeyPath: q.getRemoveByKeyPath,
		removeFilter: q.removeByKey,
		removeAllFilters: q.removeAllQueryParams,
		formatTimestamp,
		badgeFilters,
	};
}
