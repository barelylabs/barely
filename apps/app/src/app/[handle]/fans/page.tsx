import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { fanSearchParamsSchema } from '@barely/validators';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllFans } from '~/app/[handle]/fans/_components/all-fans';
import { ArchiveOrDeleteFanModal } from '~/app/[handle]/fans/_components/archive-or-delete-fan-modal';
import { CreateFanButton } from '~/app/[handle]/fans/_components/create-fan-button';
import { CreateOrUpdateFanModal } from '~/app/[handle]/fans/_components/create-or-update-fan-modal';
import { FanFilters } from '~/app/[handle]/fans/_components/fan-filters';
import { FanHotkeys } from '~/app/[handle]/fans/_components/fan-hotkeys';
import {
	ImportFansButton,
	ImportFansFromCsvModal,
} from '~/app/[handle]/fans/_components/import-fans-modal';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function FansPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof fanSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = fanSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${awaitedParams.handle}/fans`);
	}

	prefetch(
		trpc.fan.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader
				title='Fans'
				button={
					<div className='flex flex-row gap-2'>
						<ImportFansButton />
						<CreateFanButton />
					</div>
				}
			/>
			
			<FanFilters />
			
			<Suspense fallback={<GridListSkeleton />}>
				<AllFans />

				<CreateOrUpdateFanModal mode='create' />
				<CreateOrUpdateFanModal mode='update' />

				<ArchiveOrDeleteFanModal mode='archive' />
				<ArchiveOrDeleteFanModal mode='delete' />

				<ImportFansFromCsvModal />

				<FanHotkeys />
			</Suspense>
		</HydrateClient>
	);
}
