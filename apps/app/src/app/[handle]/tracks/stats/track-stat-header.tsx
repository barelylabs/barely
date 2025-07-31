'use client';

import type { StatDateRange } from '@barely/validators';
import { useTrackStatSearchParams } from '@barely/hooks';
import { statDateRange } from '@barely/validators';

import { Icon } from '@barely/ui/icon';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/select';
import { Text } from '@barely/ui/typography';

const dateRangeOptions: StatDateRange[] = ['1d', '1w', '28d', '1y'];

export function TrackStatHeader() {
	const { filters, setDateRange } = useTrackStatSearchParams();

	const { dateRange } = filters;

	return (
		<div className='flex flex-row items-center gap-3'>
			{/* Date Range Selector */}
			<Select
				defaultValue={dateRange ?? '28d'}
				onValueChange={async v => {
					const value = statDateRange.safeParse(v);
					if (value.success) await setDateRange(value.data);
				}}
			>
				<SelectTrigger icon='calendar' className='w-[180px]'>
					<SelectValue />
				</SelectTrigger>

				<SelectContent>
					{dateRangeOptions.map(r => {
						const label =
							r === '1d' ? 'Last 24 hours'
							: r === '1w' ? 'Last 7 days'
							: r === '28d' ? 'Last 28 days'
							: 'Last year';

						return (
							<SelectItem value={r} key={r}>
								{label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>

			{/* Metric Indicator */}
			<div className='flex items-center gap-2 rounded-md bg-spotify/10 px-3 py-1.5'>
				<Icon.spotify className='h-4 w-4 text-spotify' />
				<Text variant='sm/medium'>Spotify Popularity</Text>
			</div>
		</div>
	);
}
