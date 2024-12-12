'use client';

import type { WebEventType } from '@barely/lib/server/routes/event/event.tb';
import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
import { api } from '@barely/server/api/react';

import { BarList } from '@barely/ui/charts/bar-list';
import { Card } from '@barely/ui/elements/card';
import { H } from '@barely/ui/elements/typography';

export function StatReferers({ eventType }: { eventType: WebEventType }) {
	const { filtersWithHandle } = useWebEventStatFilters();

	const { data: referers } = api.stat.topReferers.useQuery(filtersWithHandle, {
		select: data =>
			data.map(d => ({
				name: d.referer,
				value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
			})),
	});

	const referersArray = referers ?? [];

	const barList = (limit?: number) => {
		return (
			<BarList color='red' data={limit ? referersArray.slice(0, limit) : referersArray} />
		);
	};

	return (
		<Card className='h-[400px]'>
			<H size='4'>Referers</H>
			{barList(9)}
		</Card>
	);
}
