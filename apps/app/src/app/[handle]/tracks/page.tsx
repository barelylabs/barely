import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { trackFilterParamsSchema } from '@barely/validators';

import { HydrateClient, prefetch, trpc } from '~/trpc/server';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllTracks } from '~/app/[handle]/tracks/_components/all-tracks';
import { ArchiveOrDeleteTrackModal } from '~/app/[handle]/tracks/_components/archive-or-delete-track-modal';
import { CreateOrUpdateTrackModal } from '~/app/[handle]/tracks/_components/create-or-update-track-modal';
import { CreateTrackButton } from '~/app/[handle]/tracks/_components/create-track-button';
import { TrackFilters } from '~/app/[handle]/tracks/_components/track-filters';
import { TrackHotkeys } from '~/app/[handle]/tracks/_components/track-hotkeys';

export default async function TracksPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof trackFilterParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = trackFilterParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		redirect(`/${awaitedParams.handle}/tracks`);
	}

	// Prefetch data (not async - don't await)
	prefetch(
		trpc.track.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		})
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Tracks' button={<CreateTrackButton />} />

			<TrackFilters />
			<Suspense fallback={<div>Loading...</div>}>
				<AllTracks />

				<CreateOrUpdateTrackModal mode='create' />
				<CreateOrUpdateTrackModal mode='update' />
				<ArchiveOrDeleteTrackModal mode='archive' />
				<ArchiveOrDeleteTrackModal mode='delete' />

				<TrackHotkeys />
			</Suspense>
		</HydrateClient>
	);
}
