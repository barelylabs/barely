import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { linkSearchParamsSchema } from '@barely/server/routes/link/link.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllLinks } from '~/app/[handle]/links/_components/all-links';
import { ArchiveOrDeleteLinkModal } from '~/app/[handle]/links/_components/archive-or-delete-link-modal';
import { CreateLinkButton } from '~/app/[handle]/links/_components/create-link-button';
import { CreateOrUpdateLinkModal } from '~/app/[handle]/links/_components/create-or-update-link-modal';
import { LinkContextProvider } from '~/app/[handle]/links/_components/link-context';
import { LinkFilters } from '~/app/[handle]/links/_components/link-filters';
import { LinkHotkeys } from '~/app/[handle]/links/_components/link-hotkeys';
import { UpgradeModal } from '~/app/[handle]/settings/billing/upgrade-modal';

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

	// const { selectedLinkIds, ...filters } = parsedFilters.data;
	const links = api({ handle: awaitedParams.handle }).link.byWorkspace({
		handle: awaitedParams.handle,
		...parsedFilters.data,
	});

	return (
		<LinkContextProvider initialInfiniteLinks={links}>
			<DashContentHeader title='Links' button={<CreateLinkButton />} />

			<div className='flex w-full flex-col gap-4'>
				<LinkFilters />
				<AllLinks />
			</div>
			{/* <div className='grid grid-cols-1 gap-5 md:grid-cols-[auto,1fr]'>
			</div> */}

			<CreateOrUpdateLinkModal mode='create' />
			<CreateOrUpdateLinkModal mode='update' />

			<ArchiveOrDeleteLinkModal mode='archive' />
			<ArchiveOrDeleteLinkModal mode='delete' />

			<LinkHotkeys />
			<UpgradeModal checkoutCancelPath='links' checkoutSuccessPath='links' />
		</LinkContextProvider>
	);
}
