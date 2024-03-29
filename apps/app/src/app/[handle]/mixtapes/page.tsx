import type { z } from 'zod';
import { api } from '@barely/lib/server/api/server.edge';
import { mixtapeFilterParamsSchema } from '@barely/lib/server/mixtape.schema';

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
	console.log('params', params);
	console.log('searchParams', searchParams);

	const mixtapes = api({ handle: params.handle }).mixtape.byWorkspace({
		handle: params.handle,
	});

	const parsedFilters = mixtapeFilterParamsSchema.safeParse(searchParams);
	const filters = parsedFilters.success ? parsedFilters.data : undefined;

	return (
		<MixtapeContextProvider initialMixtapes={mixtapes} filters={filters}>
			<DashContentHeader title='Mixtapes' button={<CreateMixtapeButton />} />
			<AllMixtapes />

			<CreateOrUpdateMixtapeModal mode='create' />
			<CreateOrUpdateMixtapeModal mode='edit' />

			<ArchiveOrDeleteMixtapeModal mode='archive' />
			<ArchiveOrDeleteMixtapeModal mode='delete' />

			<MixtapeHotkeys />
		</MixtapeContextProvider>
	);
}
