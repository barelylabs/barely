import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { landingPageSearchParamsSchema } from '@barely/lib/server/routes/landing-page/landing-page.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllLandingPages } from '~/app/[handle]/pages/_components/all-landing-pages';
import { ArchiveOrDeleteLandingPageModal } from '~/app/[handle]/pages/_components/archive-or-delete-landingPage-modal';
import { CreateLandingPageButton } from '~/app/[handle]/pages/_components/create-landing-page-button';
import { CreateOrUpdateLandingPageModal } from '~/app/[handle]/pages/_components/create-or-update-landingPage-modal';
import { LandingPageContextProvider } from '~/app/[handle]/pages/_components/landing-page-context';
import { LandingPageHotkeys } from '~/app/[handle]/pages/_components/landing-page-hotkeys';

export default function LandingPagesPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof landingPageSearchParamsSchema>;
}) {
	const parsedFilters = landingPageSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		redirect(`/${params.handle}/landing-pages`);
	}

	const { selectedLandingPageIds, ...filters } = parsedFilters.data;
	const landingPages = api({ handle: params.handle }).landingPage.byWorkspace({
		handle: params.handle,
		...filters,
	});

	return (
		<LandingPageContextProvider
			initialInfiniteLandingPages={landingPages}
			filters={filters}
			selectedLandingPageIds={selectedLandingPageIds ?? []}
		>
			<DashContentHeader
				title='Landing Pages'
				settingsHref={`/${params.handle}/settings/landing-page`}
				button={<CreateLandingPageButton />}
			/>

			<AllLandingPages />

			<CreateOrUpdateLandingPageModal mode='create' />
			<CreateOrUpdateLandingPageModal mode='update' />

			<ArchiveOrDeleteLandingPageModal mode='archive' />
			<ArchiveOrDeleteLandingPageModal mode='delete' />

			<LandingPageHotkeys />
		</LandingPageContextProvider>
	);
}
