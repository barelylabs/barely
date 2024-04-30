'use client';

import { stdWebEventPipeQueryParamsSchema } from '@barely/lib/server/routes/stat/stat.schema';

import { useTypedQuery } from '@barely/hooks/use-typed-query';

export function useWebEventStatFilters() {
	const q = useTypedQuery(stdWebEventPipeQueryParamsSchema);
	return {
		filters: q.data,
		getSetFilterPath: q.getSetQueryPath,
		setFilter: q.setQuery,
		getRemoveByKeyPath: q.getRemoveByKeyPath,
		removeFilter: q.removeByKey,
		removeAllFilters: q.removeAllQueryParams,
	};
}
