'use client';

import { api } from '@barely/server/api/react';
import { Card, CardContent, CardHeader, CardTitle } from '@barely/ui/elements/card';
import { Text } from '@barely/ui/elements/typography';
import { Icon } from '@barely/ui/elements/icon';
import { Skeleton } from '@barely/ui/elements/skeleton';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';

export function SpotifyAlbumsOverview() {
	const { handle } = useWorkspace();
	
	const { data: albums, isLoading } = api.album.byWorkspace.useQuery({
		handle,
		limit: 10,
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Albums by Spotify Popularity</CardTitle>
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

	const albumsWithSpotify = albums?.filter(a => a.spotifyId) ?? [];
	const sortedAlbums = [...albumsWithSpotify].sort((a, b) => 
		(b.spotifyPopularity ?? 0) - (a.spotifyPopularity ?? 0)
	);

	if (sortedAlbums.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Albums by Spotify Popularity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col items-center justify-center py-8 text-center'>
						<Icon.spotify className='mb-4 h-12 w-12 text-muted-foreground' />
						<Text variant='sm/normal' className='text-muted-foreground'>
							No albums with Spotify data found
						</Text>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Albums by Spotify Popularity</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{sortedAlbums.map((album, index) => (
						<div
							key={album.id}
							className='flex items-center justify-between rounded-lg border p-4'
						>
							<div className='flex items-center gap-4'>
								<div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
									<Text variant='sm/semibold'>{index + 1}</Text>
								</div>
								<div>
									<Text variant='sm/semibold'>{album.name}</Text>
									<div className='flex items-center gap-2'>
										<Text variant='sm/normal' className='text-muted-foreground'>
											Popularity: {album.spotifyPopularity ?? 0}
										</Text>
										<Text variant='sm/normal' className='text-muted-foreground'>
											• {album._count.tracks} tracks
										</Text>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}