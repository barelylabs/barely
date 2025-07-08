'use client';

import type { MusicPlayerTracklist } from '@barely/ui/music-player';
import React from 'react';
import { useHydrateAtoms } from 'jotai/utils';

import {
	currentTrackAtom,
	HeadlessMusicPlayer,
	MusicPlayerBar,
	tracklistAtom,
} from '@barely/ui/music-player';

export function MusicPlayerBottomBar({
	tracklist: tracklist,
}: {
	tracklist: MusicPlayerTracklist;
}) {
	useHydrateAtoms([
		[tracklistAtom, tracklist],
		[currentTrackAtom, tracklist[0]],
	]);

	return (
		<>
			<HeadlessMusicPlayer />
			<MusicPlayerBar />
		</>
	);
}
