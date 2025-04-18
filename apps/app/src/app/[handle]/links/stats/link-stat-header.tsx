'use client';

import type { StatDateRange } from '@barely/lib/server/routes/stat/stat.schema';
import { useCallback } from 'react';
import { useLinkStatFilters } from '@barely/lib/hooks/use-link-stat-filters';

import { StatsHeader } from '~/app/[handle]/_components/stats-header';

export function LinkStatHeader() {
	const { filters, setFilter } = useLinkStatFilters();

	const { dateRange } = filters;

	const setDateRange = useCallback(
		(dateRange: StatDateRange) => {
			setFilter('dateRange', dateRange);
		},
		[setFilter],
	);

	return <StatsHeader dateRange={dateRange} setDateRange={setDateRange} />;
}
