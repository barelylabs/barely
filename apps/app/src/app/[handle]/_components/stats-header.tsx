'use client';

import type { StatDateRange } from '@barely/lib/server/routes/stat/stat.schema';
import { Suspense } from 'react';
import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { statDateRange } from '@barely/lib/server/routes/stat/stat.schema';
import { api } from '@barely/server/api/react';

import { ChevronRightToArrow, Icon } from '@barely/ui/elements/icon';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/elements/select';
import { Skeleton } from '@barely/ui/elements/skeleton';
import { Text } from '@barely/ui/elements/typography';

import { getFmPageUrlFromFmPage } from '@barely/utils/fm';
import { getShortLinkUrlFromLink } from '@barely/utils/link';

const dateRangeOptions: StatDateRange[] = ['1d', '1w', '28d'];

export function StatsHeader({
	dateRange,
	setDateRange,
}: {
	dateRange?: StatDateRange;
	setDateRange: (dateRange: StatDateRange) => void;
}) {
	return (
		<div className='flex flex-row items-center justify-between'>
			<Suspense fallback={<Skeleton className='h-5 w-32' />}>
				<AssetLinkLaunch />
			</Suspense>

			<Select
				defaultValue={dateRange ?? '1w'}
				onValueChange={v => {
					const value = statDateRange.safeParse(v);
					if (value.success) setDateRange(value.data);
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

function AssetLinkLaunch() {
	const { filters } = useWebEventStatFilters();

	const { handle } = useWorkspace();

	const [asset] = api.stat.assetById.useSuspenseQuery({
		handle: handle,
		assetId: filters.assetId,
	});

	if (!asset) return <Text variant='xl/semibold'>All</Text>;

	if (asset.type === 'fm') {
		return (
			<a
				className='group flex flex-row items-center gap-2'
				href={getFmPageUrlFromFmPage(asset.fmPage)}
				target='_blank'
				rel='noreferrer'
			>
				<Icon.fm size='18' />
				<Text variant='xl/semibold'>{asset.fmPage.title}</Text>
				<ChevronRightToArrow />
			</a>
		);
	}

	if (asset.type === 'link') {
		return (
			<a
				className='group flex flex-row items-center gap-1'
				href={getShortLinkUrlFromLink(asset.link)}
				target='_blank'
				rel='noreferrer'
			>
				<Text variant='xl/semibold'>{`${asset.link.domain}/${asset.link.key}`}</Text>
				<ChevronRightToArrow />
			</a>
		);
	}
}
