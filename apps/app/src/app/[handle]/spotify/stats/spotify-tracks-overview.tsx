'use client';

import { api } from '@barely/server/api/react';
import { Card, CardContent, CardHeader, CardTitle } from '@barely/ui/elements/card';
import { Badge } from '@barely/ui/elements/badge';
import { Text } from '@barely/ui/elements/typography';
import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { Skeleton } from '@barely/ui/elements/skeleton';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';

export function SpotifyTracksOverview() {
	const router = useRouter();
	const { handle } = useWorkspace();
	
	const { data: tracks, isLoading } = api.track.byWorkspace.useQuery({
		handle,
		limit: 10,
		sortBy: 'spotifyPopularity',
		sortOrder: 'desc',
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Top Tracks by Spotify Popularity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className='h-16 w-full' />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const tracksWithSpotify = tracks?.filter(t => t.spotifyId) ?? [];

	if (tracksWithSpotify.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Top Tracks by Spotify Popularity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col items-center justify-center py-8 text-center'>
						<Icon.spotify className='mb-4 h-12 w-12 text-muted-foreground' />
						<Text variant='sm/normal' className='text-muted-foreground'>
							No tracks with Spotify data found
						</Text>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top Tracks by Spotify Popularity</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{tracksWithSpotify.map((track, index) => (
						<div
							key={track.id}
							className='flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50'
						>
							<div className='flex items-center gap-4'>
								<div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
									<Text variant='sm/semibold'>{index + 1}</Text>
								</div>
								<div>
									<Text variant='sm/semibold'>{track.name}</Text>
									<div className='flex items-center gap-2'>
										<Text variant='sm/normal' className='text-muted-foreground'>
											Popularity: {track.spotifyPopularity ?? 0}
										</Text>
										{track.spotifyLinkedTracks && track.spotifyLinkedTracks.length > 1 && (
											<Badge variant='secondary' size='sm'>
												{track.spotifyLinkedTracks.length} versions
											</Badge>
										)}
									</div>
								</div>
							</div>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => router.push(`/${handle}/tracks/${track.id}/spotify-stats`)}
							>
								View Stats
								<Icon.chevronRight className='ml-1 h-4 w-4' />
							</Button>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}