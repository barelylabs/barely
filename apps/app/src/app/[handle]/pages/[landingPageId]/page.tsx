import { api } from '@barely/lib/server/api/server';

import { UpdateLandingPageForm } from '~/app/[handle]/pages/[landingPageId]/_components/update-landing-page-form';

export default function LandingPagePage({
	params,
}: {
	params: { handle: string; landingPageId: string };
}) {
	const { handle, landingPageId } = params;

	const initialLandingPage = api({ handle }).landingPage.byId({ handle, landingPageId });

	return <UpdateLandingPageForm initialLandingPage={initialLandingPage} />;
}
