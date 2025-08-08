import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { HydrateClient, prefetch, trpc, trpcCaller } from '~/trpc/server';
import { VipDownloadContent } from './_components/vip-download-content';
import { VipDownloadSkeleton } from './_components/vip-download-skeleton';
import { VipLogVisit } from './_components/vip-log-visit';

export default async function VipDownloadPage({
	params,
}: {
	params: Promise<{ handle: string; key: string }>;
}) {
	const { handle, key } = await params;

	// Fetch the swap data server-side to get the ID
	const swap = await trpcCaller.swap.byHandleAndKey({ handle, key });

	if (!swap) {
		notFound();
	}

	// Prefetch for client-side hydration
	prefetch(trpc.swap.byHandleAndKey.queryOptions({ handle, key }));

	return (
		<HydrateClient>
			<VipLogVisit vipSwapId={swap.id} />
			<div className='flex min-h-screen flex-col bg-background'>
				<main className='flex-1'>
					<div className='mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
						<Suspense fallback={<VipDownloadSkeleton />}>
							<VipDownloadContent handle={handle} swapKey={key} />
						</Suspense>

						{/* Powered by Barely */}
						<div className='mt-16'>
							<p className='text-center text-xs text-muted-foreground'>
								Powered by{' '}
								<a
									href='https://barely.io'
									target='_blank'
									rel='noopener noreferrer'
									className='transition-colors hover:text-foreground'
								>
									Barely
								</a>{' '}
								© 2025
							</p>
						</div>
					</div>
				</main>
			</div>
		</HydrateClient>
	);
}
