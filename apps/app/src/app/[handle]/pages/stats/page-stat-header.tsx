'use client';

import type { StatDateRange } from '@barely/lib/server/routes/stat/stat.schema';
import { useCallback } from 'react';
import { usePageStatFilters } from '@barely/lib/hooks/use-page-stat-filters';

import { StatsHeader } from '~/app/[handle]/_components/stats-header';

export function PageStatHeader() {
	const { filters, setFilter } = usePageStatFilters();

	const { dateRange } = filters;

	const setDateRange = useCallback(
		(dateRange: StatDateRange) => {
			setFilter('dateRange', dateRange);
		},
		[setFilter],
	);

	return <StatsHeader dateRange={dateRange} setDateRange={setDateRange} />;
}
