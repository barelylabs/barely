'use client';

import type { ReactPlayerProps } from 'react-player';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { atomWithToggle } from '@barely/atoms';
import { useAtom } from 'jotai';
import ReactPlayer from 'react-player';

import type { CarouselApi } from './carousel';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPreviousNext,
} from './carousel';
import { playingMusicAtom } from './music-player';

export const videoPlayerGlobalCurrentAtom = atomWithToggle(false);

export function VideoPlayer({
	current = true,
	...props
}: ReactPlayerProps & {
	current?: boolean;
}) {
	const [, setPlayingMusic] = useAtom(playingMusicAtom);
	const [playing, setPlaying] = useState(false);
	const [globalCurrent, setGlobalCurrent] = useAtom(videoPlayerGlobalCurrentAtom);

	const handlePlay = useCallback(() => {
		setPlayingMusic(false);
		setPlaying(true);
		setGlobalCurrent(true);
	}, [setPlaying, setPlayingMusic, setGlobalCurrent]);

	const handlePause = useCallback(() => {
		setPlaying(false);
	}, [setPlaying]);

	const handlePlayPause = useCallback(
		() =>
			setPlaying(playing => {
				if (!playing) setPlayingMusic(false);
				return !playing;
			}),
		[setPlaying, setPlayingMusic],
	);

	const [progress, setProgress] = useState<{
		played: number;
		playedSeconds: number;
	}>({ played: 0, playedSeconds: 0 });

	const handleProgress = useCallback(
		(progress: {
			played: number;
			playedSeconds: number;
			loaded: number;
			loadedSeconds: number;
		}) => {
			setProgress(progress);
		},
		[setProgress],
	);

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') handlePlayPause();
		},
		[handlePlayPause],
	);

	const isCurrent = useMemo(() => current && globalCurrent, [current, globalCurrent]);

	useEffect(() => {
		if (!isCurrent) setPlaying(false);
	}, [isCurrent, props.url]);

	return (
		<div
			className='relative aspect-video'
			tabIndex={0}
			onKeyDown={handleKeyPress}
			role='button'
		>
			<ReactPlayer
				url={props.url}
				height='100%'
				width='100%'
				{...props}
				playing={playing}
				onPlay={handlePlay}
				onPause={handlePause}
				onProgress={handleProgress}
				progressInterval={10}
				onEnded={handlePlayPause}
			/>
			{/* {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          {progress.played === 0 ? (
            <Play className="h-12 w-12 text-white" />
          ) : progress.played === 1 ? (
            <RotateCcw className="h-12 w-12 text-white" />
          ) : (
            <Pause className="h-12 w-12 text-white" />
          )}
        </div>
      )} */}
			<div
				className='absolute bottom-0 left-0 right-0 h-1 bg-primary'
				style={{
					width: `${progress.played * 100}%`,
					transition: 'width 0.05s ease',
				}}
			/>
		</div>
	);
}

export function VideoCarousel({
	videos,
	playerProps,
}: {
	videos: { url: string }[];
	playerProps?: ReactPlayerProps;
}) {
	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (!carouselApi) return;

		setCurrent(carouselApi.selectedScrollSnap());

		carouselApi.on('select', () => setCurrent(carouselApi.selectedScrollSnap()));
	}, [carouselApi]);

	return (
		<Carousel setApi={setCarouselApi}>
			<CarouselContent>
				{videos.map((video, i) => (
					<CarouselItem key={i}>
						<VideoPlayer url={video.url} current={current === i} {...playerProps} />
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPreviousNext />
		</Carousel>
	);
}
