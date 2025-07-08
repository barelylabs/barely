'use client';

import type { StatDateRange } from '@barely/validators';
import { useCallback } from 'react';
import { usePageStatFilters } from '@barely/hooks';

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
