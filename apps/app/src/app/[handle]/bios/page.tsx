import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { selectBiosFiltersSchema } from '@barely/validators';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllBios } from '~/app/[handle]/bios/_components/all-bios';
import { ArchiveOrDeleteBioModal } from '~/app/[handle]/bios/_components/archive-or-delete-bio-modal';
import { BioFilters } from '~/app/[handle]/bios/_components/bio-filters';
import { CreateBioButton } from '~/app/[handle]/bios/_components/create-bio-button';
import { CreateBioModal } from '~/app/[handle]/bios/_components/create-bio-modal';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function BioPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof selectBiosFiltersSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = selectBiosFiltersSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${awaitedParams.handle}/bios`);
	}

	// Prefetch data (not async - don't await)
	prefetch(
		trpc.bio.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Bio Pages' button={<CreateBioButton />} />
			<DashContent>
				<BioFilters />
				<Suspense fallback={<GridListSkeleton />}>
					<AllBios />
				</Suspense>
			</DashContent>

			{/* Modals */}
			<CreateBioModal />
			<ArchiveOrDeleteBioModal mode='archive' />
			<ArchiveOrDeleteBioModal mode='delete' />
		</HydrateClient>
	);
}
