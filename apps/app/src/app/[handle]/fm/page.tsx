import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { fmSearchParamsSchema } from '@barely/validators';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllFmPages } from '~/app/[handle]/fm/_components/all-fm-pages';
import { ArchiveOrDeleteFmModal } from '~/app/[handle]/fm/_components/archive-or-delete-fm-modal';
import { CreateFmPageButton } from '~/app/[handle]/fm/_components/create-fm-page-button';
import { CreateOrUpdateFmModal } from '~/app/[handle]/fm/_components/create-or-update-fm-modal';
import { FmContextProvider } from '~/app/[handle]/fm/_components/fm-context';
import { FmFilters } from '~/app/[handle]/fm/_components/fm-filters';
import { FmHotkeys } from '~/app/[handle]/fm/_components/fm-hotkeys';
import { getSession } from '~/auth/server';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

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

	const session = await getSession();
	console.log('session in FmPagesPage => ', session);

	// Prefetch data (not async - don't await)
	prefetch(
		trpc.fm.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<FmContextProvider>
				<DashContentHeader title='FM Pages' button={<CreateFmPageButton />} />
				<FmFilters />
				<Suspense fallback={<div>Loading...</div>}>
					<AllFmPages />

					<CreateOrUpdateFmModal mode='create' />
					<CreateOrUpdateFmModal mode='update' />

					<ArchiveOrDeleteFmModal mode='archive' />
					<ArchiveOrDeleteFmModal mode='delete' />

					<FmHotkeys />
				</Suspense>
			</FmContextProvider>
		</HydrateClient>
	);
}
