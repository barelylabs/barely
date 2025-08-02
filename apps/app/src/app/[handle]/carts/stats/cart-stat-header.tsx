'use client';

import type { StatDateRange } from '@barely/validators';
import { useCallback } from 'react';
import { useCartStatSearchParams } from '@barely/hooks';

import { StatsHeader } from '~/app/[handle]/_components/stats-header';

export function CartStatHeader() {
	const { filters, setDateRange } = useCartStatSearchParams();

	const { dateRange } = filters;

	return <StatsHeader dateRange={dateRange} setDateRange={setDateRange} />;
}
