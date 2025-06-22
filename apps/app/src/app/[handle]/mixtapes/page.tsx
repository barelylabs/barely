import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { mixtapeFilterParamsSchema } from '@barely/lib/server/routes/mixtape/mixtape.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllMixtapes } from '~/app/[handle]/mixtapes/_components/all-mixtapes';
import { ArchiveOrDeleteMixtapeModal } from '~/app/[handle]/mixtapes/_components/archive-or-delete-mixtape-modal';
import { CreateMixtapeButton } from '~/app/[handle]/mixtapes/_components/create-mixtape-button';
import { CreateOrUpdateMixtapeModal } from '~/app/[handle]/mixtapes/_components/create-or-update-mixtape-modal';
import { MixtapeContextProvider } from '~/app/[handle]/mixtapes/_components/mixtape-context';
import { MixtapeHotkeys } from '~/app/[handle]/mixtapes/_components/mixtape-hotkeys';

export default function MixtapesPage({
	searchParams,
	params,
}: {
	searchParams: z.infer<typeof mixtapeFilterParamsSchema>;
	params: { handle: string };
}) {
	const parsedFilters = mixtapeFilterParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) redirect(`/${params.handle}/mixtapes`);

	const initialInfiniteMixtapes = api({ handle: params.handle }).mixtape.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<MixtapeContextProvider initialInfiniteMixtapes={initialInfiniteMixtapes}>
			<DashContentHeader title='Mixtapes' button={<CreateMixtapeButton />} />
			<AllMixtapes />

			<CreateOrUpdateMixtapeModal mode='create' />
			<CreateOrUpdateMixtapeModal mode='update' />

			<ArchiveOrDeleteMixtapeModal mode='archive' />
			<ArchiveOrDeleteMixtapeModal mode='delete' />

			<MixtapeHotkeys />
		</MixtapeContextProvider>
	);
}
