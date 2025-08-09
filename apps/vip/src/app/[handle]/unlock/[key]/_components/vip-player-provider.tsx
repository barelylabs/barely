'use client';

import type { MusicPlayerTracklist } from '@barely/ui/music-player';
import type { ReactNode } from 'react';

import { HeadlessMusicPlayer, useHydrateMusicPlayer } from '@barely/ui/music-player';

interface VipPlayerProviderProps {
	children: ReactNode;
	audioUrl: string;
	trackName: string;
	artistName: string;
	coverImage?: {
		s3Key: string;
		blurDataUrl: string | null;
	} | null;
	swapId: string;
}

export function VipPlayerProvider({
	children,
	audioUrl,
	trackName,
	artistName,
	coverImage,
	swapId,
}: VipPlayerProviderProps) {
	// Convert VIP data to MusicPlayerTrack format
	const tracklist: MusicPlayerTracklist = [
		{
			id: swapId,
			name: trackName,
			workspace: {
				name: artistName,
			},
			audioFiles: [{ src: audioUrl }],
			artwork:
				coverImage ?
					{ s3Key: coverImage.s3Key, blurDataUrl: coverImage.blurDataUrl }
				:	undefined,
		},
	];

	// Initialize the music player atoms with our single track
	useHydrateMusicPlayer(tracklist, tracklist[0]);

	return (
		<>
			<HeadlessMusicPlayer />
			{children}
		</>
	);
}
