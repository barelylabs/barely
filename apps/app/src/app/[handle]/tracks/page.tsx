import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { trackFilterParamsSchema } from '@barely/lib/server/routes/track/track.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllTracks } from '~/app/[handle]/tracks/_components/all-tracks';
import { ArchiveOrDeleteTrackModal } from '~/app/[handle]/tracks/_components/archive-or-delete-track-modal';
import { CreateOrUpdateTrackModal } from '~/app/[handle]/tracks/_components/create-or-update-track-modal';
import { CreateTrackButton } from '~/app/[handle]/tracks/_components/create-track-button';
import { TrackContextProvider } from '~/app/[handle]/tracks/_components/track-context';
import { TrackHotkeys } from '~/app/[handle]/tracks/_components/track-hotkeys';

export default function TracksPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof trackFilterParamsSchema>;
}) {
	const parsedFilters = trackFilterParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		redirect(`/${params.handle}/tracks`);
	}

	const initialInfiniteTracks = api({ handle: params.handle }).track.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<TrackContextProvider initialInfiniteTracks={initialInfiniteTracks}>
			<DashContentHeader title='Tracks' button={<CreateTrackButton />} />
			<AllTracks />

			<CreateOrUpdateTrackModal mode='create' />
			<CreateOrUpdateTrackModal mode='update' />
			<ArchiveOrDeleteTrackModal mode='archive' />
			<ArchiveOrDeleteTrackModal mode='delete' />

			<TrackHotkeys />
		</TrackContextProvider>
	);
}
