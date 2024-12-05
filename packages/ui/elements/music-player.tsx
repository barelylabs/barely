'use client';

import type { PublicTrackWith_Artist_Files } from '@barely/lib/server/routes/track/track.schema';
import { useCallback } from 'react';
import { atomWithToggle } from '@barely/lib/atoms/atom-with-toggle';
import { cn } from '@barely/lib/utils/cn';
import { tFormatter } from '@barely/lib/utils/time';
import { atom, useAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import ReactPlayer from 'react-player/lazy';

import type { ButtonProps } from './button';
import { Button } from './button';
import { Img } from './img';
import { Slider } from './slider';
import { videoPlayerGlobalCurrentAtom } from './video-player';

export type MusicPlayerTrack = Pick<
	PublicTrackWith_Artist_Files,
	'id' | 'name' | 'workspace' | 'audioFiles' | 'artwork'
>;
export type MusicPlayerTracklist = MusicPlayerTrack[];

interface Progress {
	played: number;
	playedSeconds: number;
	loaded: number;
	loadedSeconds: number;
}

const playerAtom = atom<ReactPlayer | null>(null);
export const playingMusicAtom = atomWithToggle(false);
const seekingMusicAtom = atomWithToggle(false);
const progressMusicAtom = atom<Progress>({
	played: 0,
	playedSeconds: 0,
	loaded: 0,
	loadedSeconds: 0,
});
const durationMusicAtom = atom<number | undefined>(undefined);

export const tracklistAtom = atom<MusicPlayerTracklist>([]);
export const currentTrackAtom = atom<MusicPlayerTrack | undefined>(undefined);

export function useMusicPlayer() {
	const [player, setPlayer] = useAtom(playerAtom);
	const [playing, togglePlaying] = useAtom(playingMusicAtom);
	const [seeking, setSeeking] = useAtom(seekingMusicAtom);
	const [duration, setDuration] = useAtom(durationMusicAtom);
	const [progress, setProgress] = useAtom(progressMusicAtom);
	const [tracklist, setTracklist] = useAtom(tracklistAtom);
	const [currentTrack, setCurrentTrack] = useAtom(currentTrackAtom);

	// video
	const [, setVideoGlobalCurrent] = useAtom(videoPlayerGlobalCurrentAtom);

	const ref = useCallback(
		(playerInstance: ReactPlayer | null) => {
			// console.log('player instance updated:', playerInstance);
			setPlayer(playerInstance);
		},
		[setPlayer],
	);

	const seekTo = useCallback(
		(playedSeconds: number) => {
			if (player) {
				player.seekTo(playedSeconds);
			}
		},
		[player],
	);

	const togglePlay = useAtomCallback(
		useCallback(
			get => {
				const currentTrack = get(currentTrackAtom);
				const tracklist = get(tracklistAtom) ?? [];

				if (!currentTrack) {
					console.log('no current track');
					setVideoGlobalCurrent(false);
					setCurrentTrack(tracklist[0]);
					setProgress({
						played: 0,
						playedSeconds: 0,
						loaded: 0,
						loadedSeconds: 0,
					});
				}

				return togglePlaying();
			},
			[togglePlaying, setCurrentTrack, setProgress, setVideoGlobalCurrent],
		),
	);

	const pauseMusic = useCallback(() => togglePlaying(false), [togglePlaying]);

	const goToPrevious = useAtomCallback(
		useCallback(
			get => {
				const tracklist = get(tracklistAtom);
				const progress = get(progressMusicAtom);
				const currentTrack = get(currentTrackAtom);
				const currentIndex = tracklist.findIndex(track => track.id === currentTrack?.id);
				const previousTrack = tracklist[currentIndex - 1];
				if (
					(progress.playedSeconds > 1 && progress.playedSeconds < 5) ||
					!previousTrack
				) {
					return seekTo(0);
				}

				setCurrentTrack(previousTrack);
				setProgress({
					played: 0,
					playedSeconds: 0,
					loaded: 0,
					loadedSeconds: 0,
				});
			},
			[seekTo, setCurrentTrack, setProgress],
		),
	);

	const skipToNext = useAtomCallback(
		useCallback(
			get => {
				const tracklist = get(tracklistAtom);
				const currentTrack = get(currentTrackAtom);
				const currentIndex = tracklist.findIndex(track => track.id === currentTrack?.id);
				const nextTrack = tracklist[currentIndex + 1];
				if (nextTrack) {
					setCurrentTrack(nextTrack);
					setProgress({
						played: 0,
						playedSeconds: 0,
						loaded: 0,
						loadedSeconds: 0,
					});
				}
			},
			[setCurrentTrack, setProgress],
		),
	);

	const handlePlay = useCallback(() => {
		setVideoGlobalCurrent(false);
		togglePlaying(true);
	}, [togglePlaying, setVideoGlobalCurrent]);
	const handlePause = useCallback(() => {
		togglePlaying(false);
	}, [togglePlaying]);
	const handleDuration = useCallback(
		(duration: number) => setDuration(duration),
		[setDuration],
	);

	const handleProgress = useCallback(
		(progress: Progress) => {
			if (!seeking) {
				setProgress(progress);
			}
		},
		[seeking, setProgress],
	);

	const handleSeekChange = useAtomCallback(
		useCallback(
			get => {
				const duration = get(durationMusicAtom);
				const progress = get(progressMusicAtom);
				return (value: number) => {
					setSeeking(true);
					setProgress({
						...progress,
						played: value / (duration ?? 60),
						playedSeconds: value,
					});
				};
			},
			[setSeeking, setProgress],
		),
	);
	const handleSeekCommit = () => {
		seekTo(progress.playedSeconds);
		setSeeking(false);
	};

	return {
		ref,
		player,
		currentTrack,
		tracklist,
		setPlaylist: setTracklist,
		playing,

		seeking,
		setSeeking,
		duration,
		setDuration,
		progress,
		setProgress,
		// functions
		togglePlay,
		seekTo,
		skipToNext,
		goToPrevious,
		pauseMusic,
		// handle
		handlePlay,
		handlePause,
		handleDuration,
		handleProgress,
		handleSeekChange,
		handleSeekCommit,
	};
}

export function HeadlessMusicPlayer() {
	const {
		ref,
		currentTrack,
		playing,
		handlePlay,
		handlePause,
		handleDuration,
		handleProgress,
	} = useMusicPlayer();

	return (
		<div className='hidden'>
			<ReactPlayer
				ref={ref}
				url={currentTrack?.audioFiles[0]?.src}
				playing={playing}
				onPlay={handlePlay}
				onPause={handlePause}
				onDuration={handleDuration}
				onProgress={handleProgress}
				progressInterval={10}
			/>
		</div>
	);
}

export function MusicPlayerBar() {
	const { currentTrack, tracklist } = useMusicPlayer();

	const currentOrFirstTrack = currentTrack ?? tracklist[0];

	// const artworkUrl = currentOrFirstTrack?.artwork?.src;
	const artworkKey = currentOrFirstTrack?.artwork?.s3Key;

	return (
		<>
			<div className='fixed bottom-0 h-[72px] w-full'>
				<div className='mx-auto h-full w-full max-w-5xl flex-row items-center justify-center sm:px-4 lg:px-6'>
					<div className='grid h-full w-full grid-cols-[3fr_1fr] gap-4 sm:grid-cols-[minmax(200px,_1fr)_minmax(300px,_2fr)_minmax(0px,_1fr)]'>
						{/* Album Art */}
						<div className='flex h-full flex-row gap-3 px-4 py-4 sm:px-0'>
							{currentOrFirstTrack && (
								<>
									<Img
										s3Key={artworkKey ?? ''}
										alt={currentOrFirstTrack.name}
										className='h-11 w-11 rounded-xs'
										width={44}
										height={44}
									/>
									{/* <picture>
										<img
											alt={currentOrFirstTrack.name}
											src={artworkUrl ?? ''}
											className='h-11  w-11 rounded-xs'
										/>
									</picture> */}
									<div className='flex flex-col items-start justify-center gap-[2px]'>
										<p className='text-xs md:text-sm'>{currentOrFirstTrack.name}</p>
										<p className='text-2xs font-light md:text-xs'>
											{currentOrFirstTrack.workspace.name}
										</p>
									</div>
								</>
							)}
						</div>
						{/* Music Player */}
						<div className='hidden max-w-full flex-grow flex-col items-center justify-center gap-1 sm:flex '>
							<div className='flex w-full flex-row items-center justify-center gap-3'>
								<MusicPreviousButton />
								<MusicPlayButton />
								<MusicNextButton />
							</div>
							<MusicSeek />
						</div>

						<div className='flex flex-row items-center justify-end p-4 sm:hidden'>
							<MusicPlayButton />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export function MusicSeek() {
	const { duration, progress, handleSeekChange, handleSeekCommit } = useMusicPlayer();

	return (
		<div className='flex w-full max-w-[400px] flex-row items-center justify-center gap-2'>
			<p className='w-[40px] text-right text-[11px]'>
				{tFormatter(progress.playedSeconds)}
			</p>
			<Slider
				value={[progress.playedSeconds]}
				max={duration}
				onValueChange={v => handleSeekChange()(v)}
				onValueCommit={handleSeekCommit}
				className='w-full'
				trackClassName='h-1'
				hideThumb
			/>
			<p className='w-[40px] text-right text-[11px]'>{tFormatter(duration)}</p>
		</div>
	);
}

export function MusicPlayButton({ size = 'sm' }: { size?: ButtonProps['size'] }) {
	const { playing, togglePlay } = useMusicPlayer();

	return (
		<Button
			variant='icon'
			size={size}
			pill
			startIcon={playing ? 'pause' : 'play'}
			iconClassName={cn('fill-current', !playing && 'ml-[2px]')}
			onClick={() => togglePlay()}
		/>
	);
}

export function MusicPreviousButton() {
	const { goToPrevious } = useMusicPlayer();
	return (
		<Button
			variant='icon'
			size='sm'
			look='link'
			pill
			iconClassName='text-white fill-current'
			startIcon='skipBackward'
			onClick={() => goToPrevious()}
		/>
	);
}

export function MusicNextButton() {
	const { skipToNext } = useMusicPlayer();
	return (
		<Button
			variant='icon'
			look='link'
			size='sm'
			pill
			iconClassName='text-white fill-current'
			startIcon='skipForward'
			onClick={() => skipToNext()}
		/>
	);
}
