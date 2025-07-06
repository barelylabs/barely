import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { mixtapeFilterParamsSchema } from '@barely/validators';

import { HydrateClient, prefetch, trpc } from '~/trpc/server';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllMixtapes } from '~/app/[handle]/mixtapes/_components/all-mixtapes';
import { ArchiveOrDeleteMixtapeModal } from '~/app/[handle]/mixtapes/_components/archive-or-delete-mixtape-modal';
import { CreateMixtapeButton } from '~/app/[handle]/mixtapes/_components/create-mixtape-button';
import { CreateOrUpdateMixtapeModal } from '~/app/[handle]/mixtapes/_components/create-or-update-mixtape-modal';
import { MixtapeHotkeys } from '~/app/[handle]/mixtapes/_components/mixtape-hotkeys';

export default async function MixtapesPage({
	searchParams,
	params,
}: {
	searchParams: Promise<z.infer<typeof mixtapeFilterParamsSchema>>;
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;
	const filters = await searchParams;

	const parsedFilters = mixtapeFilterParamsSchema.safeParse(filters);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${handle}/mixtapes`);
	}

	// Prefetch data (not async - don't await)
	prefetch(
		trpc.mixtape.byWorkspace.infiniteQueryOptions({
			handle,
			...parsedFilters.data,
		})
	);

	return (
		<HydrateClient>
			<Suspense fallback={<div>Loading...</div>}>
				<DashContentHeader title='Mixtapes' button={<CreateMixtapeButton />} />
				<AllMixtapes />

				<CreateOrUpdateMixtapeModal mode='create' />
				<CreateOrUpdateMixtapeModal mode='update' />

				<ArchiveOrDeleteMixtapeModal mode='archive' />
				<ArchiveOrDeleteMixtapeModal mode='delete' />

				<MixtapeHotkeys />
			</Suspense>
		</HydrateClient>
	);
}
