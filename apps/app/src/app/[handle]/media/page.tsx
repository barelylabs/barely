import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { fileSearchParamsSchema } from '@barely/validators';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllMedia } from '~/app/[handle]/media/_components/all-media';
import { UploadMediaButton } from '~/app/[handle]/media/_components/upload-media-button';
import { UploadMediaModal } from '~/app/[handle]/media/_components/upload-media-modal';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function MediaLibraryPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof fileSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;

	const parsedFilters = fileSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log('failed to parse filters', parsedFilters.error);
		redirect(`/${awaitedParams.handle}/files`);
	}

	prefetch(
		trpc.file.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Media Library' button={<UploadMediaButton />} />
			<DashContent>
				<Suspense fallback={<GridListSkeleton />}>
					<AllMedia />
					<UploadMediaModal />
				</Suspense>
			</DashContent>
		</HydrateClient>
	);
}
