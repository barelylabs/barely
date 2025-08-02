'use client';

import type { StatDateRange } from '@barely/validators';
import { useCallback } from 'react';
import { useLinkStatSearchParams } from '@barely/hooks';

import { StatsHeader } from '~/app/[handle]/_components/stats-header';

export function LinkStatHeader() {
	const { filters, setDateRange } = useLinkStatSearchParams();

	const { dateRange } = filters;

	return <StatsHeader dateRange={dateRange} setDateRange={setDateRange} />;
}
