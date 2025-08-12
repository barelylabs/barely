import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { linkSearchParamsSchema } from '@barely/validators';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllLinks } from '~/app/[handle]/links/_components/all-links';
import { ArchiveOrDeleteLinkModal } from '~/app/[handle]/links/_components/archive-or-delete-link-modal';
import { CreateLinkButton } from '~/app/[handle]/links/_components/create-link-button';
import { CreateOrUpdateLinkModal } from '~/app/[handle]/links/_components/create-or-update-link-modal';
import { LinkFilters } from '~/app/[handle]/links/_components/link-filters';
import { LinkHotkeys } from '~/app/[handle]/links/_components/link-hotkeys';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function LinksPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof linkSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = linkSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		redirect(`/${awaitedParams.handle}/links`);
	}

	// Prefetch data (not async - don't await)
	prefetch(
		trpc.link.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	prefetch(trpc.webDomain.byWorkspace.queryOptions({ handle: awaitedParams.handle }));

	return (
		<HydrateClient>
			<DashContentHeader title='Links' button={<CreateLinkButton />} />
			<DashContent>
				<LinkFilters />
				<Suspense fallback={<GridListSkeleton />}>
					<AllLinks />
				</Suspense>

				<CreateOrUpdateLinkModal mode='create' />
				<CreateOrUpdateLinkModal mode='update' />

				<ArchiveOrDeleteLinkModal mode='archive' />
				<ArchiveOrDeleteLinkModal mode='delete' />

				<LinkHotkeys />
			</DashContent>
		</HydrateClient>
	);
}
