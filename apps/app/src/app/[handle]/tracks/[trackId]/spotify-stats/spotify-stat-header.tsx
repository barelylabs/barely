'use client';

import { api } from '@barely/server/api/react';
import { Card, CardContent, CardHeader } from '@barely/ui/elements/card';
import { H, Text } from '@barely/ui/elements/typography';
import { Icon } from '@barely/ui/elements/icon';
import { nFormatter } from '@barely/utils/number';

interface SpotifyStatHeaderProps {
	trackId: string;
}

export function SpotifyStatHeader({ trackId }: SpotifyStatHeaderProps) {
	const { data: track } = api.track.byId.useQuery({ id: trackId });

	if (!track) return null;

	const statCards = [
		{
			label: 'Current Popularity',
			value: track.spotifyPopularity ?? 0,
			icon: Icon.spotify,
			format: (v: number) => v.toString(),
			color: 'text-spotify',
		},
		{
			label: 'Spotify IDs',
			value: track.spotifyLinkedTracks?.length ?? 0,
			icon: Icon.link,
			format: (v: number) => v.toString(),
			color: 'text-blue-600',
		},
		{
			label: 'Release Date',
			value: track.releaseDate,
			icon: Icon.calendar,
			format: (v: string | null) => {
				if (!v) return 'N/A';
				return new Date(v).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				});
			},
			color: 'text-gray-600',
		},
	];

	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
			{statCards.map((stat, index) => (
				<Card key={index}>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<Text variant='sm/medium' className='text-muted-foreground'>
							{stat.label}
						</Text>
						<stat.icon className={`h-4 w-4 ${stat.color}`} />
					</CardHeader>
					<CardContent>
						<H size='3'>{stat.format(stat.value as any)}</H>
					</CardContent>
				</Card>
			))}
		</div>
	);
}