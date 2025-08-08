'use client';

import { useTrackStatSearchParams } from '@barely/hooks';

import { StatsHeader } from '~/app/[handle]/_components/stats-header';
import { TrackSelector } from '~/app/[handle]/tracks/stats/track-selector';

export function TrackStatHeader() {
	const { filters, setDateRange } = useTrackStatSearchParams();

	const { dateRange } = filters;

	return (
		<div className='flex flex-row items-center gap-3'>
			<StatsHeader
				dateRange={dateRange}
				setDateRange={setDateRange}
				showAssetLink={true}
				selector={<TrackSelector />}
			/>
		</div>
	);
}
