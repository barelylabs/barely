import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { fmSearchParamsSchema } from '@barely/lib/server/routes/fm/fm.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { ALlFmPages } from '~/app/[handle]/fm/_components/all-fm-pages';
import { ArchiveOrDeleteFmModal } from '~/app/[handle]/fm/_components/archive-or-delete-fm-modal';
import { CreateFmPageButton } from '~/app/[handle]/fm/_components/create-fm-page-button';
import { CreateOrUpdateFmModal } from '~/app/[handle]/fm/_components/create-or-update-fm-modal';
import { FmContextProvider } from '~/app/[handle]/fm/_components/fm-context';
import { FmHotkeys } from '~/app/[handle]/fm/_components/fm-hotkeys';

export default function FmPagesPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof fmSearchParamsSchema>;
}) {
	const parsedFilters = fmSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${params.handle}/fm`);
	}

	const { selectedFmPageIds, ...filters } = parsedFilters.data;

	const fmPages = api({ handle: params.handle }).fm.byWorkspace({
		handle: params.handle,
		...filters,
	});

	return (
		<FmContextProvider
			initialFmPages={fmPages}
			filters={filters}
			selectedFmPageIds={selectedFmPageIds ?? []}
		>
			<DashContentHeader title='FM Pages' button={<CreateFmPageButton />} />
			<ALlFmPages />

			<CreateOrUpdateFmModal mode='create' />
			<CreateOrUpdateFmModal mode='update' />

			<ArchiveOrDeleteFmModal mode='archive' />
			<ArchiveOrDeleteFmModal mode='delete' />

			<FmHotkeys />
		</FmContextProvider>
	);
}
