'use client';

import type { StatDateRange } from '@barely/validators';
import { useCallback } from 'react';
import { useFmStatSearchParams } from '@barely/hooks';

import { StatsHeader } from '~/app/[handle]/_components/stats-header';

export function FmStatHeader() {
	const { filters, setDateRange } = useFmStatSearchParams();

	const { dateRange } = filters;

	return <StatsHeader dateRange={dateRange} setDateRange={setDateRange} />;
}
