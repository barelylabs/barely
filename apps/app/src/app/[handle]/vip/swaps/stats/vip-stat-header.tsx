'use client';

import type { StatDateRange } from '@barely/validators';
import { useCallback } from 'react';
import { useVipStatFilters } from '@barely/hooks';

import { StatsHeader } from '~/app/[handle]/_components/stats-header';
import { VipSwapSelector } from '~/app/[handle]/vip/swaps/stats/vip-swap-selector';

export function VipStatHeader() {
	const { filters, setFilter } = useVipStatFilters();

	const { dateRange } = filters;

	const setDateRange = useCallback(
		(dateRange: StatDateRange) => {
			setFilter('dateRange', dateRange);
		},
		[setFilter],
	);

	return (
		<StatsHeader
			dateRange={dateRange}
			setDateRange={setDateRange}
			selector={<VipSwapSelector />}
		/>
	);
}
