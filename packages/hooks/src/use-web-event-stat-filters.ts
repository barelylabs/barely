'use client';

import { useCallback, useMemo } from 'react';
import { useTypedOptimisticQuery } from '@barely/hooks';
import { stdWebEventPipeQueryParamsSchema } from '@barely/tb/schema';
import { getDateFromIsoString } from '@barely/utils';
import { queryBooleanSchema } from '@barely/validators/helpers';

import { useWorkspace } from './use-workspace';

export function useWebEventStatFilters() {
	const q = useTypedOptimisticQuery(
		stdWebEventPipeQueryParamsSchema.extend({
			showVisits: queryBooleanSchema.optional(),
			showClicks: queryBooleanSchema.optional(),
		}),
	);

	const { handle } = useWorkspace();

	const formatTimestamp = useCallback(
		(d: string) => {
			// console.log('d => ', d);
			const date = getDateFromIsoString(d);

			switch (q.data.dateRange) {
				case '1d':
					return new Date(date).toLocaleDateString('en-us', {
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
					});
				default: {
					const formatted = new Date(date).toLocaleDateString('en-us', {
						month: 'short',
						day: 'numeric',
					});
					return formatted;
				}
			}
		},

		[q.data.dateRange],
	);

	const badgeFilters = useMemo(() => {
		return Object.entries(q.data).filter(
			([key]) => key !== 'assetId' && key !== 'dateRange',
		) as [keyof typeof q.data, string][];
	}, [q.data]);

	const { showVisits, showClicks } = q.data;
	const toggleShowVisits = useCallback(() => {
		if (showVisits) return q.removeByKey('showVisits');
		return q.setQuery('showVisits', true);
	}, [showVisits, q]);

	const toggleShowClicks = useCallback(() => {
		if (showClicks) return q.removeByKey('showClicks');
		return q.setQuery('showClicks', true);
	}, [showClicks, q]);

	return {
		filters: { ...q.data },
		filtersWithHandle: { handle, ...q.data },
		getSetFilterPath: q.getSetQueryPath,
		setFilter: q.setQuery,
		removeFilter: q.removeByKey,
		removeAllFilters: q.removeAllQueryParams,
		formatTimestamp,
		badgeFilters,
		toggleShowVisits,
		toggleShowClicks,
	};
}
