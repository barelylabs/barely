'use client';

import { api } from '@barely/server/api/react';

import { BarList } from '@barely/ui/charts/bar-list';
import { Card } from '@barely/ui/elements/card';
import { H } from '@barely/ui/elements/typography';

export function LinkReferers() {
	const [referers] = api.stat.topReferers.useSuspenseQuery(
		{},
		{
			select: data =>
				data.map(d => ({
					name: d.referer,
					value: d.sessions,
				})),
		},
	);

	const barList = (limit?: number) => {
		return <BarList color='red' data={limit ? referers.slice(0, limit) : referers} />;
	};

	return (
		<Card className='h-[400px]'>
			<H size='4'>Referers</H>
			{barList(9)}
		</Card>
	);
}
