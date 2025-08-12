import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { PoweredByBarelyFooter } from '~/components/powered-by-barely-footer';

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
	const swap = await trpcCaller.swap.byHandleAndKey({ handle, key }).catch(() => {
		return notFound();
	});

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

						<PoweredByBarelyFooter />
					</div>
				</main>
			</div>
		</HydrateClient>
	);
}
