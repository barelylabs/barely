'use client';

import type { StatDateRange } from '@barely/lib/server/routes/stat/stat.schema';
import { useCallback } from 'react';
import { useCartStatFilters } from '@barely/lib/hooks/use-cart-stat-filters';

import { StatsHeader } from '~/app/[handle]/_components/stats-header';

export function CartStatHeader() {
	const { filters, setFilter } = useCartStatFilters();

	const { dateRange } = filters;

	const setDateRange = useCallback(
		(dateRange: StatDateRange) => {
			setFilter('dateRange', dateRange);
		},
		[setFilter],
	);

	return <StatsHeader dateRange={dateRange} setDateRange={setDateRange} />;
}
