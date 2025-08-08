import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { trpcCaller } from '~/trpc/server';
import { DownloadContent } from './_components/download-content';

export default async function DownloadPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string; key: string }>;
	searchParams: Promise<{ token?: string; auto?: string }>;
}) {
	const { handle, key } = await params;
	const { token, auto } = await searchParams;

	if (!token) {
		redirect(`/${handle}/unlock/${key}?error=missing-token`);
	}

	let downloadData;
	try {
		// Use validateDownloadToken which doesn't log the download event
		downloadData = await trpcCaller.swap.validateDownloadToken({ token });
	} catch (error) {
		console.error('Failed to validate download token:', error);
		redirect(`/${handle}/unlock/${key}?error=invalid-token`);
	}

	if (!downloadData.fileUrl) {
		redirect(`/${handle}/unlock/${key}?error=download-unavailable`);
	}

	return (
		<Suspense fallback={<DownloadPageSkeleton />}>
			<DownloadContent
				handle={handle}
				swapKey={key}
				downloadData={downloadData}
				autoDownload={auto === 'true'}
			/>
		</Suspense>
	);
}

function DownloadPageSkeleton() {
	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='animate-pulse text-center'>
				<div className='mx-auto mb-8 h-80 w-80 rounded-lg bg-muted' />
				<div className='mx-auto mb-4 h-8 w-64 rounded bg-muted' />
				<div className='mx-auto h-4 w-48 rounded bg-muted' />
			</div>
		</div>
	);
}
