'use client';

import { useState } from 'react';
import { Pause, Play, X } from 'lucide-react';

import { Button } from '@barely/ui/button';
import { Img } from '@barely/ui/img';
import { useMusicPlayer } from '@barely/ui/music-player';

interface VipAudioPlayerMobileProps {
	coverImage?: {
		s3Key: string;
		blurDataUrl: string | null;
	} | null;
	trackName: string;
	artistName?: string;
}

export function VipAudioPlayerMobile({
	coverImage,
	trackName,
	artistName,
}: VipAudioPlayerMobileProps) {
	const { playing, togglePlay, progress, duration, handleSeekChange, handleSeekCommit } =
		useMusicPlayer();
	const [isExpanded, setIsExpanded] = useState(false);

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
		<>
			{/* Fixed Bottom Player Bar */}
			<div className='fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg'>
				{/* Progress Bar at the very top */}
				<div className='absolute left-0 right-0 top-0 h-0.5 bg-muted'>
					<div
						className='h-full bg-brand transition-all duration-150'
						style={{ width: `${progressPercent}%` }}
					/>
				</div>

				{/* Mini Player Content */}
				<div className='flex h-16 items-center px-3'>
					{/* Album Art & Track Info */}
					<div
						className='flex flex-1 items-center gap-3 overflow-hidden'
						onClick={() => setIsExpanded(true)}
					>
						{coverImage?.s3Key && (
							<div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded shadow-sm'>
								<Img
									s3Key={coverImage.s3Key}
									alt={trackName}
									blurDataURL={coverImage.blurDataUrl ?? undefined}
									fill
									className='object-cover'
								/>
							</div>
						)}
						<div className='min-w-0 flex-1'>
							<p className='truncate text-sm font-medium text-foreground'>{trackName}</p>
							{artistName && (
								<p className='truncate text-xs text-muted-foreground'>{artistName}</p>
							)}
						</div>
					</div>

					{/* Play/Pause Button */}
					<Button
						onClick={togglePlay}
						size='sm'
						look='ghost'
						className='h-10 w-10 flex-shrink-0'
					>
						{playing ?
							<Pause className='h-5 w-5' />
						:	<Play className='ml-0.5 h-5 w-5' />}
					</Button>
				</div>
			</div>

			{/* Expanded Player (Modal) */}
			{isExpanded && (
				<div
					className='fixed inset-0 z-[60] flex flex-col bg-background'
					onClick={() => setIsExpanded(false)}
				>
					{/* Header */}
					<div className='flex items-center justify-between p-4'>
						<Button onClick={() => setIsExpanded(false)} size='sm' look='ghost'>
							<X className='h-5 w-5' />
						</Button>
						<p className='text-sm font-medium'>Now Playing</p>
						<div className='w-10' /> {/* Spacer for centering */}
					</div>

					{/* Cover Art */}
					<div
						className='flex flex-1 items-center justify-center px-8'
						onClick={e => e.stopPropagation()}
					>
						<div className='w-full max-w-sm'>
							{coverImage?.s3Key && (
								<div className='relative aspect-square w-full overflow-hidden rounded-lg shadow-2xl'>
									<Img
										s3Key={coverImage.s3Key}
										alt={trackName}
										fill
										className='object-cover'
									/>
								</div>
							)}

							{/* Track Info */}
							<div className='mt-8 text-center'>
								<h2 className='text-xl font-bold text-foreground'>{trackName}</h2>
								{artistName && (
									<p className='mt-1 text-base text-muted-foreground'>{artistName}</p>
								)}
							</div>

							{/* Progress Bar */}
							<div className='mt-8'>
								<div className='relative'>
									<input
										type='range'
										min='0'
										max={duration ?? 0}
										value={progress.playedSeconds}
										onChange={handleSeek}
										onMouseUp={handleSeekMouseUp}
										onTouchEnd={handleSeekMouseUp}
										className='h-1 w-full cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand'
									/>
								</div>
								<div className='mt-2 flex justify-between text-xs text-muted-foreground'>
									<span>{formatTime(progress.playedSeconds)}</span>
									<span>{formatTime(duration ?? 0)}</span>
								</div>
							</div>

							{/* Play Controls */}
							<div className='mt-8 flex items-center justify-center'>
								<Button
									onClick={togglePlay}
									size='lg'
									className='h-16 w-16 rounded-full bg-brand text-white hover:bg-brand/90'
								>
									{playing ?
										<Pause className='h-7 w-7' />
									:	<Play className='ml-1 h-7 w-7' />}
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
