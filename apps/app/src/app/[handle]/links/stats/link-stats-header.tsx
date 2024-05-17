'use client';

import type { StatDateRange } from '@barely/lib/server/routes/stat/stat.schema';
import { Suspense } from 'react';
import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
import { statDateRange } from '@barely/lib/server/routes/stat/stat.schema';
import { api } from '@barely/server/api/react';

import { ChevronRightToArrow } from '@barely/ui/elements/icon';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/elements/select';
import { Skeleton } from '@barely/ui/elements/skeleton';
import { Text } from '@barely/ui/elements/typography';

import { getShortLinkUrlFromLink } from '@barely/utils/link';

const dateRangeOptions: StatDateRange[] = ['1d', '1w', '28d'];

export function LinkStatsHeader() {
	const { filters, setFilter } = useWebEventStatFilters();

	return (
		<div className='flex flex-row items-center justify-between'>
			<Suspense fallback={<Skeleton className='h-5 w-32' />}>
				<ShortLinkLaunch />
			</Suspense>

			<Select
				defaultValue={filters.dateRange ?? '1w'}
				onValueChange={v => {
					const value = statDateRange.safeParse(v);
					if (value.success) setFilter('dateRange', value.data);
				}}
			>
				<SelectTrigger icon='calendar' className='w-[180px]'>
					<SelectValue />
				</SelectTrigger>

				<SelectContent>
					{dateRangeOptions.map(r => {
						return (
							<SelectItem value={r} key={r}>
								{r}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
}

export function ShortLinkLaunch() {
	const { filters } = useWebEventStatFilters();

	const [link] = api.link.byId.useSuspenseQuery(filters?.assetId ?? '', {});

	if (!link) return <Text variant='xl/semibold'>All Links</Text>;

	return (
		<a
			className='group flex flex-row items-center gap-1'
			href={getShortLinkUrlFromLink(link)}
			target='_blank'
			rel='noreferrer'
		>
			<Text variant='xl/semibold'>{`${link.domain}/${link.key}`}</Text>
			<ChevronRightToArrow />
		</a>
	);
}
