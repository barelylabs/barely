import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { fmSearchParamsSchema } from '@barely/lib/server/routes/fm/fm.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllFmPages } from '~/app/[handle]/fm/_components/all-fm-pages';
import { ArchiveOrDeleteFmModal } from '~/app/[handle]/fm/_components/archive-or-delete-fm-modal';
import { CreateFmPageButton } from '~/app/[handle]/fm/_components/create-fm-page-button';
import { CreateOrUpdateFmModal } from '~/app/[handle]/fm/_components/create-or-update-fm-modal';
import { FmContextProvider } from '~/app/[handle]/fm/_components/fm-context';
import { FmFilters } from '~/app/[handle]/fm/_components/fm-filters';
import { FmHotkeys } from '~/app/[handle]/fm/_components/fm-hotkeys';

export default async function FmPagesPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof fmSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = fmSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${awaitedParams.handle}/fm`);
	}

	const fmPages = api({ handle: awaitedParams.handle }).fm.byWorkspace({
		handle: awaitedParams.handle,
		...parsedFilters.data,
	});

	return (
		<FmContextProvider initialFmPages={fmPages}>
			<DashContentHeader title='FM Pages' button={<CreateFmPageButton />} />
			<FmFilters />
			<AllFmPages />

			<CreateOrUpdateFmModal mode='create' />
			<CreateOrUpdateFmModal mode='update' />

			<ArchiveOrDeleteFmModal mode='archive' />
			<ArchiveOrDeleteFmModal mode='delete' />

			<FmHotkeys />
		</FmContextProvider>
	);
}
