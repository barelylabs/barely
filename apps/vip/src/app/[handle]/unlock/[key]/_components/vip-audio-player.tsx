'use client';

import { Pause, Play } from 'lucide-react';

import { Button } from '@barely/ui/button';
import { Img } from '@barely/ui/img';
import { useMusicPlayer } from '@barely/ui/music-player';

interface VipAudioPlayerProps {
	coverImage?: {
		s3Key: string;
		blurDataUrl: string | null;
	} | null;
	trackName: string;
	artistName?: string;
	pulse?: boolean;
}

export function VipAudioPlayer({
	coverImage,
	trackName,
	artistName,
	pulse = false,
}: VipAudioPlayerProps) {
	const { playing, togglePlay, progress, duration, handleSeekChange, handleSeekCommit } =
		useMusicPlayer();

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const time = parseFloat(e.target.value);
		handleSeekChange()(time);
	};

	const handleSeekMouseUp = () => {
		handleSeekCommit();
	};

	const formatTime = (time: number) => {
		if (isNaN(time)) return '0:00';
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	const progressPercent =
		duration && duration > 0 ? (progress.playedSeconds / duration) * 100 : 0;

	return (
		<div
			className={`w-full rounded-lg bg-accent/20 p-6 backdrop-blur-sm ${pulse ? 'vip-pulse-glow' : ''}`}
		>
			<div className='flex items-center space-x-4'>
				{/* Album Art */}
				{coverImage?.s3Key && (
					<div className='relative h-16 w-16 overflow-hidden rounded-lg shadow-md'>
						<Img
							s3Key={coverImage.s3Key}
							blurDataURL={coverImage.blurDataUrl ?? undefined}
							alt={trackName}
							fill
							className='object-cover'
						/>
					</div>
				)}

				{/* Player Controls */}
				<div className='flex-1'>
					<div className='mb-3 flex items-center justify-between'>
						<div>
							<p className='text-left text-sm font-medium text-foreground'>{trackName}</p>
							{artistName && (
								<p className='text-left text-xs text-muted-foreground'>{artistName}</p>
							)}
						</div>
						<Button
							onClick={togglePlay}
							size='sm'
							variant='icon'
							className='h-10 w-10 flex-shrink-0 bg-brand text-white hover:bg-brand/90'
						>
							{playing ?
								<Pause className='h-5 w-5' />
							:	<Play className='ml-0.5 h-5 w-5' />}
						</Button>
					</div>

					{/* Progress Bar */}
					<div className='relative'>
						<div className='flex items-center space-x-2 text-xs text-muted-foreground'>
							<span>{formatTime(progress.playedSeconds)}</span>
							<div className='relative flex-1'>
								<div className='h-1 overflow-hidden rounded-full bg-brand/20'>
									<div
										className='h-full bg-brand transition-all duration-150'
										style={{ width: `${progressPercent}%` }}
									/>
								</div>
								<input
									type='range'
									min='0'
									max={duration ?? 0}
									value={progress.playedSeconds}
									onChange={handleSeek}
									onMouseUp={handleSeekMouseUp}
									onTouchEnd={handleSeekMouseUp}
									className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
								/>
							</div>
							<span>{formatTime(duration ?? 0)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
