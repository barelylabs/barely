'use client';

import type { StatDateRange } from '@barely/validators';
import { useCallback } from 'react';
import { usePageStatSearchParams } from '@barely/hooks';

import { StatsHeader } from '~/app/[handle]/_components/stats-header';

export function PageStatHeader() {
	const { filters, setDateRange } = usePageStatSearchParams();

	const { dateRange } = filters;

	return <StatsHeader dateRange={dateRange} setDateRange={setDateRange} />;
}
