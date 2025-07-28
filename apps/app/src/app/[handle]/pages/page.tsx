import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { landingPageSearchParamsSchema } from '@barely/validators';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllLandingPages } from '~/app/[handle]/pages/_components/all-landing-pages';
import { ArchiveOrDeleteLandingPageModal } from '~/app/[handle]/pages/_components/archive-or-delete-landing-page-modal';
import { CreateLandingPageButton } from '~/app/[handle]/pages/_components/create-landing-page-button';
import { CreateOrUpdateLandingPageModal } from '~/app/[handle]/pages/_components/create-or-update-landing-page-modal';
import { LandingPageFilters } from '~/app/[handle]/pages/_components/landing-page-filters';
import { LandingPageHotkeys } from '~/app/[handle]/pages/_components/landing-page-hotkeys';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function LandingPagesPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof landingPageSearchParamsSchema>>;
}) {
	const { handle } = await params;
	const filters = await searchParams;

	const parsedFilters = landingPageSearchParamsSchema.safeParse(filters);
	if (!parsedFilters.success) {
		redirect(`/${handle}/pages`);
	}

	prefetch(
		trpc.landingPage.byWorkspace.infiniteQueryOptions(
			{
				handle,
				...parsedFilters.data,
			},
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	);

	return (
		<HydrateClient>
			<DashContentHeader
				title='Landing Pages'
				button={<CreateLandingPageButton />}
			/>

			<LandingPageFilters />
			<Suspense fallback={<GridListSkeleton />}>
				<AllLandingPages />

				<CreateOrUpdateLandingPageModal mode='create' />
				<CreateOrUpdateLandingPageModal mode='update' />

				<ArchiveOrDeleteLandingPageModal mode='archive' />
				<ArchiveOrDeleteLandingPageModal mode='delete' />

				<LandingPageHotkeys />
			</Suspense>
		</HydrateClient>
	);
}
