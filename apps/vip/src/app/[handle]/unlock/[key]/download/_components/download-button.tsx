'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@barely/utils';
import { AlertCircle, Check, Download, Loader2 } from 'lucide-react';

import { Button } from '@barely/ui/button';

interface DownloadButtonProps {
	fileUrl: string;
	fileName: string;
	fileSize?: number;
	className?: string;
}

export function DownloadButton({
	fileUrl,
	fileName,
	fileSize,
	className,
}: DownloadButtonProps) {
	const [downloadState, setDownloadState] = useState<
		'idle' | 'downloading' | 'completed' | 'error'
	>('idle');

	const searchParams = useSearchParams();
	const token = searchParams.get('token');

	const handleDownload = async () => {
		// Set downloading state
		setDownloadState('downloading');

		try {
			// First, log the download event (this will check limits and track analytics)
			if (token) {
				// Call the API to log the download
				// This is a fire-and-forget call - we don't wait for it
				// The session context will be available from cookies
				fetch(
					`/api/trpc/vipRender/swap.getDownloadUrl?input=${encodeURIComponent(JSON.stringify({ token }))}`,
				).catch(err => {
					console.error('Failed to log download:', err);
				});
			}

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

			// Show completed state
			setDownloadState('completed');
			// Reset after showing completed - increased to 5 seconds for better visibility
			setTimeout(() => {
				setDownloadState('idle');
			}, 5000);
		} catch (error) {
			console.error('Download failed:', error);
			setDownloadState('error');
			// Reset after showing error - also increased to 5 seconds
			setTimeout(() => {
				setDownloadState('idle');
			}, 5000);
		}
	};

	const formatFileSize = (bytes?: number): string => {
		if (!bytes || bytes === 0) return '';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<div className='text-center'>
			<Button
				onClick={handleDownload}
				disabled={downloadState === 'downloading'}
				size='lg'
				className={cn(
					'group h-16 min-w-[280px] px-10 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl',
					downloadState === 'idle' && 'bg-brand hover:bg-brand/90',
					downloadState === 'completed' &&
						'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600',
					downloadState === 'error' &&
						'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600',
					className,
				)}
			>
				{downloadState === 'idle' && (
					<>
						<Download className='mr-3 h-5 w-5 transition-transform group-hover:translate-y-0.5' />
						Download {fileName}
					</>
				)}
				{downloadState === 'downloading' && (
					<>
						<Loader2 className='mr-3 h-5 w-5 animate-spin' />
						Preparing Download...
					</>
				)}
				{downloadState === 'completed' && (
					<>
						<Check className='mr-3 h-5 w-5' />
						Download Started!
					</>
				)}
				{downloadState === 'error' && (
					<>
						<AlertCircle className='mr-3 h-5 w-5' />
						Download Failed - Try Again
					</>
				)}
			</Button>

			{fileSize && downloadState === 'idle' && (
				<p className='mt-4 text-sm font-medium text-muted-foreground'>
					File size: {formatFileSize(fileSize)}
				</p>
			)}

			{downloadState === 'completed' && (
				<div className='animate-fade-in mt-4'>
					<p className='text-sm font-medium text-green-600'>✓ Download Started</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						Check your downloads folder for {fileName}
					</p>
				</div>
			)}

			{downloadState === 'error' && (
				<div className='animate-fade-in mt-4'>
					<p className='text-sm font-medium text-red-600'>✗ Download Failed</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						Please try again or contact support if the issue persists
					</p>
				</div>
			)}

			{/* Additional download options placeholder */}
			<div className='mt-10 rounded-lg bg-muted/20 p-4 text-sm text-muted-foreground'>
				<p className='mb-1 font-medium'>Need a different format or quality?</p>
				<p className='text-xs'>More download options coming soon</p>
			</div>
		</div>
	);
}
