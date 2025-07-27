'use client';

import { api } from '@barely/server/api/react';
import { Card, CardContent, CardHeader, CardTitle } from '@barely/ui/elements/card';
import { Badge } from '@barely/ui/elements/badge';
import { Text } from '@barely/ui/elements/typography';
import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';

interface LinkedSpotifyTracksProps {
	trackId: string;
}

export function LinkedSpotifyTracks({ trackId }: LinkedSpotifyTracksProps) {
	const { data: track } = api.track.byId.useQuery({ id: trackId });

	if (!track || !track.spotifyLinkedTracks) return null;

	const sortedLinks = [...track.spotifyLinkedTracks].sort((a, b) => {
		// Default first, then by popularity
		if (a.isDefault && !b.isDefault) return -1;
		if (!a.isDefault && b.isDefault) return 1;
		return (b.spotifyPopularity ?? 0) - (a.spotifyPopularity ?? 0);
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Linked Spotify Tracks</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{sortedLinks.map((link) => (
						<div
							key={link.spotifyLinkedTrackId}
							className='flex items-center justify-between rounded-lg border p-4'
						>
							<div className='flex items-center gap-3'>
								<Icon.spotify className='h-5 w-5 text-spotify' />
								<div>
									<div className='flex items-center gap-2'>
										<Text variant='sm/semibold' className='font-mono'>
											{link.spotifyLinkedTrackId}
										</Text>
										{link.isDefault && (
											<Badge variant='default' size='sm'>
												Default
											</Badge>
										)}
									</div>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Popularity: {link.spotifyPopularity ?? 0}
									</Text>
								</div>
							</div>
							<div className='flex items-center gap-2'>
								<Button
									variant='ghost'
									size='sm'
									asChild
								>
									<a
										href={`https://open.spotify.com/track/${link.spotifyLinkedTrackId}`}
										target='_blank'
										rel='noopener noreferrer'
									>
										<Icon.external className='h-4 w-4' />
									</a>
								</Button>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}