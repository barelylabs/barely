'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Music, Sparkles } from 'lucide-react';

import { getAbsoluteUrl } from '@barely/auth/get-url';

import { Img } from '@barely/ui/img';

import { VipAudioPlayer } from '../../_components/vip-audio-player';
import { VipAudioPlayerMobile } from '../../_components/vip-audio-player-mobile';
import { VipPlayerProvider } from '../../_components/vip-player-provider';
import { DownloadButton } from './download-button';

interface DownloadData {
	fileUrl: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	swap: {
		id: string;
		name: string;
		description?: string | null;
		coverImage?: {
			id: string;
			s3Key: string;
			width?: number | null;
			height?: number | null;
		} | null;
		workspace?: {
			id: string;
			name: string;
			handle: string;
		} | null;
	};
}

interface DownloadContentProps {
	handle: string;
	swapKey: string;
	downloadData: DownloadData;
	autoDownload?: boolean;
}

export function DownloadContent({
	downloadData,
	autoDownload = false,
}: DownloadContentProps) {
	const [hasAutoDownloaded, setHasAutoDownloaded] = useState(false);
	const { fileUrl, fileName, fileType, fileSize, swap } = downloadData;
	const workspaceName = swap.workspace?.name ?? 'Artist';

	// Auto-download functionality
	useEffect(() => {
		if (autoDownload && !hasAutoDownloaded) {
			// Small delay for better UX
			const timer = setTimeout(() => {
				void (async () => {
					try {
						// Fetch the file as a blob to prevent redirects
						const response = await fetch(fileUrl, {
							method: 'GET',
							mode: 'cors',
						});

						if (!response.ok) {
							throw new Error(`Failed to download: ${response.statusText}`);
						}

						// Get the blob from the response
						const blob = await response.blob();

						// Create a blob URL
						const blobUrl = URL.createObjectURL(blob);

						// Create temporary anchor element with blob URL
						const link = document.createElement('a');
						link.href = blobUrl;
						link.download = fileName;
						link.style.display = 'none';

						// Add to body and click
						document.body.appendChild(link);
						link.click();

						// Clean up
						document.body.removeChild(link);

						// Clean up the blob URL after a short delay
						setTimeout(() => {
							URL.revokeObjectURL(blobUrl);
						}, 100);

						setHasAutoDownloaded(true);
					} catch (error) {
						console.error('Auto-download failed:', error);
						// Don't set hasAutoDownloaded to true so user can manually try
					}
				})();
			}, 1500);
			return () => clearTimeout(timer);
		}
	}, [autoDownload, hasAutoDownloaded, fileUrl, fileName]);

	const isAudioFile = (type: string) => {
		return type.toLowerCase().includes('audio') || type.toLowerCase() === 'audio';
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const getFormattedFileExtension = (type: string): string => {
		if (type.includes('mp3')) return 'MP3';
		if (type.includes('wav')) return 'WAV';
		if (type.includes('flac')) return 'FLAC';
		if (type.includes('aac') || type.includes('m4a')) return 'AAC/M4A';
		if (type.includes('pdf')) return 'PDF';
		if (type.includes('zip')) return 'ZIP';
		return type.split('/')[1]?.toUpperCase() ?? 'FILE';
	};

	// For non-audio files, render without the player
	if (!isAudioFile(fileType)) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-background via-accent/5 to-background'>
				<div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8'>
					{/* Success Header - Reduced size */}
					<div className='mb-6 text-center'>
						<div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-4 py-1.5 text-sm text-success backdrop-blur-sm'>
							<CheckCircle2 className='h-4 w-4' />
							<span className='font-medium'>Access Granted</span>
						</div>
						<h1 className='mb-2 flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
							<Sparkles className='h-6 w-6 animate-pulse text-[#D7AD0D]' />
							Your download is ready!
						</h1>
						<p className='text-sm text-muted-foreground'>
							Thank you for supporting {workspaceName}
						</p>
					</div>

					{/* Main Content Card */}
					<div className='overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 shadow-xl backdrop-blur-sm'>
						<div className='p-6 sm:p-8'>
							{/* Cover & Info Section */}
							<div className='mb-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start'>
								{/* Cover Image */}
								{swap.coverImage?.s3Key && (
									<div className='group relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl border-2 border-border shadow-2xl sm:h-48 sm:w-48'>
										<div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
										<Img
											s3Key={swap.coverImage.s3Key}
											alt={swap.name}
											fill
											className='object-cover transition-transform group-hover:scale-105'
											priority
										/>
									</div>
								)}

								{/* Track Info */}
								<div className='flex-1 text-center sm:text-left'>
									<h2 className='mb-2 text-2xl font-bold text-foreground'>{swap.name}</h2>
									<p className='mb-3 text-base font-medium text-muted-foreground'>
										{workspaceName}
									</p>
									{swap.description && (
										<p className='mb-4 text-sm text-muted-foreground'>
											{swap.description}
										</p>
									)}

									{/* File Info Badge */}
									<div className='inline-flex items-center gap-4 rounded-md border border-brand/40 bg-brand/20 px-5 py-2.5 text-sm font-medium'>
										<span className='text-brand'>
											{getFormattedFileExtension(fileName)}
										</span>
										<span className='text-brand/60'>•</span>
										<span className='text-brand/80'>{formatFileSize(fileSize)}</span>
									</div>
								</div>
							</div>

							{/* No audio preview for non-audio files */}

							{/* Download Section */}
							<div className='border-t border-border/50 bg-gradient-to-b from-transparent to-brand/5 pt-6'>
								<DownloadButton
									fileUrl={fileUrl}
									fileName={fileName}
									fileSize={fileSize}
								/>
							</div>
						</div>
					</div>

					{/* Future CTAs Section - Now separate cards */}
					<div className='mt-6 grid gap-4 sm:grid-cols-2'>
						{/* Newsletter Signup Placeholder */}
						<div className='group overflow-hidden rounded-xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm transition-all hover:bg-card/70'>
							<h3 className='mb-2 font-semibold text-foreground'>Stay Connected</h3>
							<p className='text-sm text-muted-foreground'>
								Get notified about new releases from {workspaceName}
							</p>
							<div className='mt-4 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground'>
								Coming Soon
							</div>
						</div>

						{/* Social Share Placeholder */}
						<div className='group overflow-hidden rounded-xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm transition-all hover:bg-card/70'>
							<h3 className='mb-2 font-semibold text-foreground'>Share the Love</h3>
							<p className='text-sm text-muted-foreground'>
								Tell your friends about this exclusive content
							</p>
							<div className='mt-4 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground'>
								Coming Soon
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className='mt-6 space-y-4 text-center text-sm text-muted-foreground'>
						<p>
							Having issues?{' '}
							<a
								href={`mailto:support@barely.vip?subject=Download%20Issue%20-%20${swap.name}`}
								className='text-brand underline-offset-4 hover:underline'
							>
								Contact Support
							</a>
						</p>
						<div className='flex items-center justify-center gap-1.5'>
							<span>Powered by</span>
							<a
								href={getAbsoluteUrl('vip')}
								target='_blank'
								rel='noopener noreferrer'
								className='font-heading font-semibold underline transition-colors hover:text-secondary'
							>
								Barely
							</a>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// For audio files, wrap everything with the player provider
	return (
		<VipPlayerProvider
			audioUrl={fileUrl}
			trackName={swap.name}
			artistName={workspaceName}
			coverImage={swap.coverImage}
			swapId={swap.id}
		>
			<div className='min-h-screen bg-gradient-to-br from-background via-accent/5 to-background'>
				<div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8'>
					{/* Success Header - Reduced size */}
					<div className='mb-6 text-center'>
						<div className='mb-3 inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-4 py-1.5 text-sm text-success backdrop-blur-sm'>
							<CheckCircle2 className='h-4 w-4' />
							<span className='font-medium'>Access Granted</span>
						</div>
						<h1 className='mb-2 flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
							<Sparkles className='h-6 w-6 animate-pulse text-[#D7AD0D]' />
							Your download is ready!
						</h1>
						<p className='text-sm text-muted-foreground'>
							Thank you for supporting {workspaceName}
						</p>
					</div>

					{/* Main Content Card */}
					<div className='overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 shadow-xl backdrop-blur-sm'>
						<div className='p-6 sm:p-8'>
							{/* Cover & Info Section */}
							<div className='mb-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start'>
								{/* Cover Image */}
								{swap.coverImage?.s3Key && (
									<div className='group relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl border-2 border-border shadow-2xl sm:h-48 sm:w-48'>
										<div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
										<Img
											s3Key={swap.coverImage.s3Key}
											alt={swap.name}
											fill
											className='object-cover transition-transform group-hover:scale-105'
											priority
										/>
									</div>
								)}

								{/* Track Info */}
								<div className='flex-1 text-center sm:text-left'>
									<h2 className='mb-2 text-2xl font-bold text-foreground'>{swap.name}</h2>
									<p className='mb-3 text-base font-medium text-muted-foreground'>
										{workspaceName}
									</p>
									{swap.description && (
										<p className='mb-4 text-sm text-muted-foreground'>
											{swap.description}
										</p>
									)}

									{/* File Info Badge */}
									<div className='inline-flex items-center gap-4 rounded-md border border-brand/40 bg-brand/20 px-5 py-2.5 text-sm font-medium'>
										<span className='text-brand'>
											{getFormattedFileExtension(fileName)}
										</span>
										<span className='text-brand/60'>•</span>
										<span className='text-brand/80'>{formatFileSize(fileSize)}</span>
									</div>
								</div>
							</div>

							{/* Audio Preview - Desktop only */}
							<div className='mb-6 hidden rounded-xl bg-muted/30 p-4 sm:block'>
								<div className='mb-3 flex items-center gap-2 text-sm font-medium text-foreground'>
									<Music className='h-4 w-4 text-brand' />
									<span>Preview while you download</span>
								</div>
								<VipAudioPlayer
									coverImage={swap.coverImage}
									trackName={swap.name}
									artistName={workspaceName}
								/>
							</div>

							{/* Download Section */}
							<div className='border-t border-border/50 bg-gradient-to-b from-transparent to-brand/5 pt-6'>
								<DownloadButton
									fileUrl={fileUrl}
									fileName={fileName}
									fileSize={fileSize}
								/>
							</div>
						</div>
					</div>

					{/* Future CTAs Section - Now separate cards */}
					<div className='mt-6 grid gap-4 sm:grid-cols-2'>
						{/* Newsletter Signup Placeholder */}
						<div className='group overflow-hidden rounded-xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm transition-all hover:bg-card/70'>
							<h3 className='mb-2 font-semibold text-foreground'>Stay Connected</h3>
							<p className='text-sm text-muted-foreground'>
								Get notified about new releases from {workspaceName}
							</p>
							<div className='mt-4 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground'>
								Coming Soon
							</div>
						</div>

						{/* Social Share Placeholder */}
						<div className='group overflow-hidden rounded-xl border border-border bg-card/50 p-6 text-center backdrop-blur-sm transition-all hover:bg-card/70'>
							<h3 className='mb-2 font-semibold text-foreground'>Share the Love</h3>
							<p className='text-sm text-muted-foreground'>
								Tell your friends about this exclusive content
							</p>
							<div className='mt-4 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground'>
								Coming Soon
							</div>
						</div>
					</div>

					{/* Footer - Add bottom padding on mobile for sticky player */}
					<div className='mt-6 space-y-4 pb-20 text-center text-sm text-muted-foreground sm:pb-0'>
						<p>
							Having issues?{' '}
							<a
								href={`mailto:support@barely.vip?subject=Download%20Issue%20-%20${swap.name}`}
								className='text-brand underline-offset-4 hover:underline'
							>
								Contact Support
							</a>
						</p>
						<div className='flex items-center justify-center gap-1.5'>
							<span>Powered by</span>
							<a
								href={getAbsoluteUrl('vip')}
								target='_blank'
								rel='noopener noreferrer'
								className='font-heading font-semibold underline transition-colors hover:text-secondary'
							>
								Barely
							</a>
						</div>
					</div>
				</div>

				{/* Mobile Audio Player - Sticky Bottom */}
				<div className='sm:hidden'>
					<VipAudioPlayerMobile
						coverImage={swap.coverImage}
						trackName={swap.name}
						artistName={workspaceName}
					/>
				</div>
			</div>
		</VipPlayerProvider>
	);
}
