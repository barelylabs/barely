'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2 } from 'lucide-react';

import { useVipRenderTRPC } from '@barely/api/public/vip-render.trpc.react';

import { Button } from '@barely/ui/button';

interface DownloadButtonProps {
	token: string;
	fileName: string;
}

export function DownloadButton({ token, fileName }: DownloadButtonProps) {
	const [isDownloading, setIsDownloading] = useState(false);
	const trpc = useVipRenderTRPC();

	// const { data, error, refetch } = trpc.getDownloadUrl.useQuery(
	// 	{ token },
	// 	{
	// 		enabled: false, // Don't fetch until button is clicked
	// 		retry: false,
	// 	},
	// );

	const { error, refetch } = useQuery({
		...trpc.swap.getDownloadUrl.queryOptions({ token }),
		enabled: false, // Don't fetch until button is clicked
	});

	const handleDownload = async () => {
		setIsDownloading(true);

		try {
			const result = await refetch();

			if (result.data?.fileUrl) {
				// Create a temporary anchor element to trigger download
				const link = document.createElement('a');
				link.href = result.data.fileUrl;
				link.download = result.data.fileName || 'download';
				link.target = '_blank';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		} catch (err) {
			console.error('Download error:', err);
		} finally {
			setIsDownloading(false);
		}
	};

	if (error) {
		return (
			<div className='rounded-lg bg-destructive/20 p-4 backdrop-blur-sm'>
				<p className='text-sm text-destructive-foreground'>
					{error.message || 'Download failed. Please try again.'}
				</p>
			</div>
		);
	}

	return (
		<Button
			onClick={handleDownload}
			disabled={isDownloading}
			size='lg'
			className='w-full'
		>
			{isDownloading ?
				<>
					<Loader2 className='mr-2 h-4 w-4 animate-spin' />
					Preparing download...
				</>
			:	<>
					<Download className='mr-2 h-4 w-4' />
					Download {fileName}
				</>
			}
		</Button>
	);
}
